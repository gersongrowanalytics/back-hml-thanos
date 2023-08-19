const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const crypto = require('crypto')
const SendMail = require('../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')
require('dotenv').config()
const path = require('path');


controller.MetMasterPrecios = async (req, res, data, dates_row, error, message_errors, error_log, sheet_not_found) => {

    const {
        req_action_file,
        req_type_file,
        req_date_updated,
    } = req.body

    const {
        usutoken
    } = req.headers

    let usu
    let carcargas
    let token_excel = "No se guardo el excel"

    try{
        
        const baseUrl = req.protocol + '://' + req.get('host')

        usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : usutoken
            },
            select : {
                usuid       : true,
                perid       : true,
                usuusuario  : true
            }
        })

        if(!error){

            const fec = await prisma.fecfechas.findFirst({
                where : {
                    fecmesabierto : true,
                },
                select : {
                    fecid : true
                }
            })

            const fecid = fec.fecid
            
            const espe = await prisma.espestadospendientes.findFirst({
                where : {
                    AND : [
                        {
                            fecid : fecid
                        },
                        {
                            espbasedato : 'Master de Precios'
                        }
                    ]
                }
            })

            const [date_year, date_month] = req_date_updated.split('-')

            await prisma.master_precios.deleteMany({
                where: {
                    fecha: {
                        contains: `%${date_month}-${date_year}`
                    }
                }
            })

            await prisma.master_precios.createMany({
                data
            })

            if(espe){
                let date_one = moment()
                let date_two = moment(espe.espfechaprogramado)

                let esp_day_late
                if(date_one > date_two){

                    let diff_days_date_one_two = date_one.diff(date_two, 'days')

                    if( diff_days_date_one_two > 0){
                        esp_day_late = diff_days_date_one_two.toString()
                    }else{
                        esp_day_late = '0'
                    }
                }else{
                    esp_day_late = '0'
                }

                await prisma.espestadospendientes.update({
                    where : {
                        espid : espe.espid
                    },
                    data : {
                        perid                   : usu.perid,
                        espfechactualizacion    : new Date().toISOString(),
                        espdiaretraso           : esp_day_late
                    }
                })

                const aree = await prisma.areareasestados.findFirst({
                    where : {
                        areid : espe.areid
                    }
                })

                if(aree){
                    let are_percentage
                    const espcount = await prisma.espestadospendientes.findMany({
                        where : {
                            fecid       : fecid,
                            areid       : espe.areid,
                            espfechactualizacion : null
                        }
                    })

                    if(espcount.length == 0){
                        are_percentage = '100'
                    }else{
                        are_percentage = (100-(espcount.length*25)).toString()
                    }

                    await prisma.areareasestados.update({
                        where : {
                            areid : aree.areid
                        },
                        data : {
                            areporcentaje : are_percentage
                        }
                    })
                }
            }
        }

        let path_file
        
        const name_file = req.files.master_precios.name.substring(0, req.files.master_precios.name.lastIndexOf("."));
        const ext_file = req.files.master_precios.name.substring(req.files.master_precios.name.lastIndexOf(".") + 1);

        if(process.env.ENTORNO == 'PREPRODUCTIVO'){
            path_file = 'hmlthanos/prueba/pe/tradicional/carga_archivos/'+req_type_file+'/'
        }else{
            path_file = 'hmlthanos/pe/tradicional/archivosgenerados/masterprecios/'
        }

        const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const ubicacion_s3 = path_file + name_file + '-' + token_name + '.' + ext_file
        const archivoExcel = req.files.master_precios.data
        const excelSize = req.files.master_precios.size

        let carexito_bd = true
        let carnotificaciones_bd = 'La data de Maestro precios fue cargada con éxito'

        if(error){
            carexito_bd = false
            carnotificaciones_bd = await controller.FormatMessageError(message_errors)
        }

        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)
        token_excel = crypto.randomBytes(30).toString('hex')
        carcargas = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                carnombre   : req.files.master_precios.name,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token='+token_excel,
                carexito    : carexito_bd,
                carnotificaciones : carnotificaciones_bd
            }
        })

        if(!carcargas){
            error_log.push("Método Maestro precios: No se guardo el registro en carcargasarchivos")
        }
    }catch(error){
        console.log(error)
        error_log.push("Método Maestro precios: "+err.toString())
    }finally{
        if(token_excel == "No se guardo el excel"){
            error_log.push("Método Maestro precios: No se guardo el excel")
            token_excel = ""
        }

        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoInformarCargaArchivo.html')
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = process.env.TO_MAIL
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.master_precios.name, 
            tipo: "Archivo Master de Precios", 
            usuario: usu.usuusuario,
            url_archivo: carcargas ? carcargas.cartoken : token_excel,
            error_val: error,
            error_message_mail: message_errors,
            error_log: error_log,
            sheet_not_found: sheet_not_found,
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        if(!error){
            res.status(200)
            return res.json({
                mensaje     : 'La data de Maestro precios fue cargada con éxito',
                respuesta   : true,
                data
            })
        }else{
            return true
        }
    }
}

controller.FormatMessageError = async ( messages ) => {

    let message_notifications = []

    if(JSON.stringify(messages).length > 1000){

        messages.forEach((msg, index_msg) => {

            if(JSON.stringify(message_notifications).length < 1000){

                if(JSON.stringify(msg).length < 1000){
                    message_notifications.push(msg)
                }else{
                    msg.notificaciones.forEach((not, index_not) => {
                        let row_slice = not['rows'].slice(1, 20)
                        messages[index_msg]['notificaciones'][index_not]['rows'] = row_slice
                    })
                    message_notifications.push(msg)
                }
            }
        })
    }else{
        message_notifications = messages        
    }

    return JSON.stringify(message_notifications)
}

module.exports = controller