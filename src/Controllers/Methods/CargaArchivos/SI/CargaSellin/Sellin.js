const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const crypto = require('crypto')
const SendMail = require('../../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../../S3/UploadFileExcelS3')
require('dotenv').config()
const path = require('path');


controller.MetSellin = async (req, res, data, delete_data, error, message_errors) => {

    const {
        req_action_file,
        req_type_file
    } = req.body

    const {
        usutoken
    } = req.headers

    try{

        const baseUrl = req.protocol + '://' + req.get('host');
        let messages_delete_data_acc

        if(!error){
            const usu = await prisma.usuusuarios.findFirst({
                where : {
                    usutoken : usutoken
                },
                select : {
                    usuid       : true,
                    perid       : true,
                    usuusuario  : true
                }
            })

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
                            espbasedato : 'Sellin Thanos (Mes actual)'
                        }
                    ]
                }
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

                const espu = await prisma.espestadospendientes.update({
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

                    const areu = await prisma.areareasestados.update({
                        where : {
                            areid : aree.areid
                        },
                        data : {
                            areporcentaje : are_percentage
                        }
                    })
                }

                await prisma.sellin.createMany({
                    data
                })
            }

            const { messages_delete_data } = controller.SellinOverWrittern(delete_data)
            messages_delete_data_acc = messages_delete_data

            if(req_action_file.delete_data){
                for await (const dat of delete_data ){
        
                    await prisma.sellin.deleteMany({
                        where: {
                            fecha: {
                                startsWith: dat
                            },
                        }
                    })
                }
            }

            await prisma.sellin.createMany({
                data
            })
        }

        const usun = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : req.headers.usutoken
            },
            select: {
                usuid: true,
                usuusuario: true
            }
        })

        let path_file
        
        const name_file = req.files.carga_sellin.name.substring(0, req.files.carga_sellin.name.lastIndexOf("."));
        const ext_file = req.files.carga_sellin.name.substring(req.files.carga_sellin.name.lastIndexOf(".") + 1);

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
        const token_excel = crypto.randomBytes(30).toString('hex')
        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usun.usuid,
                carnombre   : req.files.carga_sellin.name,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token='+token_excel,
                carexito    : carexito_bd,
                carnotificaciones : carnotificaciones_bd
            }
        })

        const success_mail_html = path.resolve(__dirname, '../../../Mails/CorreoInformarCargaArchivo.html');
        // const success_mail_html = "src/Controllers/Methods/Mails/CorreoInformarCargaArchivo.html"
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = process.env.TO_MAIL
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.carga_sellin.name, 
            tipo: "Archivo Sell In", 
            usuario: usun.usuusuario,
            url_archivo: car.cartoken,
            error_val   : error,
            error_message_mail: message_errors
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        if(!error){
            return res.status(200).json({
                message : 'Los datos de Sell In fueron cargados correctamente',
                messages_delete_data_acc,
                respuesta : true
            })
        }else{
            return true
        }

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar el Sellin',
            devmsg  : error,
            respuesta : false
        })
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