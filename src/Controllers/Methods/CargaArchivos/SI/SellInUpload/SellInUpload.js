const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment')
const crypto = require('crypto')
const SendMail = require('../../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../../S3/UploadFileExcelS3')
require('dotenv').config()
const path = require('path')

controller.MetSellInUpload = async (req, res, data, delete_data, error, message_errors, error_log) => {

    const {
        req_action_file,
        req_type_file,
        req_plataforma,
        req_usucorreo
    } = req.body

    const {
        usutoken
    } = req.headers

    let usu
    let carcargas
    let messages_delete_data_acc
    let token_excel = "No se guardo el excel"

    try{
        if(req_plataforma == 'Subsidios'){
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usucorreo : req_usucorreo
                }
            })

            if(!usu){

                let per = await prisma.perpersonas.findFirst({
                    where : {
                        pernombre : 'Usuario'
                    }
                })

                usu = await prisma.usuusuarios.create({
                    data : {
                        tpuid                   : 1,
                        perid                   : per.perid,
                        usuusuario              : 'usuario@gmail.com',
                        usucorreo               : 'usuario@gmail.com',
                        estid                   : 1,
                        usutoken                : crypto.randomBytes(30).toString('hex'),
                        usupaistodos            : false,
                        usupermisosespeciales   : false,
                        usucerrosesion          : false,
                        usucierreautomatico     : false
                    }
                })
            }

        }else{
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
        }

        let action_file
        if(req_action_file){
            action_file = JSON.parse(req_action_file)
        }

        const baseUrl = req.protocol + '://' + req.get('host');

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
                    fecid : fecid,
                    espbasedato : 'Sell In Thanos (Mes actual)'
                }
            })

            if(espe && usu.usuid != 1){
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

            const { messages_delete_data } = controller.SellinOverWrittern(delete_data)
            messages_delete_data_acc = messages_delete_data

            if(usu.usuid == 1){
                for await (const dat of delete_data){
                    await prisma.sellin.deleteMany({
                        where: {
                            anio: parseInt(dat.anio),
                            mes: parseInt(dat.mes),
                        }
                    })
                }
    
                await prisma.sellin.createMany({
                    data
                })

            }

        }

        let path_file
        
        const name_file = req.files.carga_sellin.name.substring(0, req.files.carga_sellin.name.lastIndexOf("."))
        const ext_file = req.files.carga_sellin.name.substring(req.files.carga_sellin.name.lastIndexOf(".") + 1)

        if(process.env.ENTORNO == 'PREPRODUCTIVO'){
            path_file = 'hmlthanos/prueba/pe/tradicional/carga_archivos/'+req_type_file+'/'
        }else{
            path_file = 'hmlthanos/pe/tradicional/archivosgenerados/sellin/'
        }

        const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const ubicacion_s3 = path_file + name_file + '-' + token_name + '.' + ext_file
        const archivoExcel = req.files.carga_sellin.data
        const excelSize = req.files.carga_sellin.size

        let carexito_bd = true
        let carnotificaciones_bd = 'Los datos de Sell In fueron cargados correctamente'

        if(error){
            carexito_bd = false
            carnotificaciones_bd = await controller.FormatMessageError(message_errors)
        }

        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)
        token_excel = crypto.randomBytes(30).toString('hex')
        carcargas = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                carnombre   : req.files.carga_sellin.name,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token='+token_excel,
                carexito    : carexito_bd,
                carnotificaciones : carnotificaciones_bd,
                carplataforma : req_plataforma ? req_plataforma : null
            }
        })
    }catch(err){
        console.log(err)
        error_log.push("Método Sell In: "+err.toString())
    }finally{
        if(token_excel == "No se guardo el excel"){
            error_log.push("Método Sell In: No se guardo el excel")
            token_excel = ""
        }

        const success_mail_html = path.resolve(__dirname, '../../../Mails/CorreoInformarCargaArchivo.html')
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = process.env.TO_MAIL
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.carga_sellin.name,
            tipo: "Archivo Sell In",
            usuario: usu.usuusuario,
            url_archivo: carcargas ? carcargas.cartoken : token_excel,
            error_val   : error,
            error_message_mail: message_errors,
            error_log: error_log,
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
        await prisma.$disconnect()

        if(!error){
            return res.status(200).json({
                message : 'Los datos de Sell In fueron cargados correctamente',
                messages_delete_data_acc,
                respuesta : true,
            })
        }else{
            return true
        }
    }
}

controller.SellinOverWrittern = (messages_dts) => {
    
    const messages_delete_date = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_date.findIndex( date => date == msg)

        if(index_msg_dts == -1){
            messages_delete_date.push(msg)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes fechas",
            "data"      : messages_delete_date
        }
    ]

    return { messages_delete_data }
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