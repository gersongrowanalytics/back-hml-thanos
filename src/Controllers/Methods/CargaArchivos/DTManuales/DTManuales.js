const controller = {}
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const SendMail = require('../../Reprocesos/SendMail')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const path = require('path')
const DTActualizarEstadoSelloutController = require('../DTManuales/DTActualizarEstadoSellOut')
const RegisterAudits = require('../../Audits/CreateAudits/RegisterAudits')
const ActualizarStatusBaseDatos = require('../../Status/EstadoPendiente/ActualizarStatusBaseDatos')

controller.MetDTManuales = async (req, res, data, delete_data, error, message_errors) => {

    const {
        req_action_file,
        req_type_file,
        req_date_updated
    } = req.body

    const {
        usutoken
    } = req.headers

    const usu = await prisma.usuusuarios.findFirst({
        where: {
            usutoken : usutoken
        },
        select: {
            usuid       : true,
            usuusuario  : true,
            perid       : true,
            usucorreo   : true,
            tpuid       : true
        }
    })

    req.body.req_date           = req_date_updated
    req.body.req_espbasedato    = 'Archivo Plano SO'
    req.body.req_usucorreo      = usu.usucorreo
    req.body.req_controller     = true

    let message = 'Las ventas manuales fueron cargadas correctamente'
    let respuesta = true
    let devmsg = []
    let jsonentrada = {
        req_action_file,
        req_type_file
    }
    let jsonsalida
    let audpk = []

    try{

        //Almacena en status
        console.log("En tarjeta DT MANUALES")
        console.log("Status ")

        let error_actualizar_esp        = false

        let messages_delete_data_acc    = []
        const baseUrl = req.protocol + '://' + req.get('host');

        if(!error){
            
            const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)

            messages_delete_data_acc = messages_delete_data
            if(usu.tpuid != 1){
                console.log("Actualiza estado sellout")
                error_actualizar_esp  = await DTActualizarEstadoSelloutController.ActualizarEstadoSellOut(req, res, data, audpk, devmsg)
            }
        }
        
        const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)

        let ubicacion_s3 = ""

        if(process.env.ENTORNO == 'PREPRODUCTIVO'){
            ubicacion_s3 = 'hmlthanos/pe/prueba/tradicional/archivosgenerados/planoso/'+ token_name + '-' + req.files.carga_manual.name

        }else{
            ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/planoso/'+ token_name + '-' + req.files.carga_manual.name
        }

        const archivoExcel = req.files.carga_manual.data
        const excelSize = req.files.carga_manual.size
        
        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)

        let carexito_bd = true
        let carnotificaciones_bd = 'Las ventas manuales fueron cargadas correctamente'

        if(error){
            carexito_bd = false
            carnotificaciones_bd = await controller.FormatMessageError(message_errors)
        }else{
            const codigos_dt_fechas = Object.values(
                data.reduce((grupos, dato) => {
                    const { codigo_distribuidor, fecha } = dato;
                    grupos[codigo_distribuidor] = grupos[codigo_distribuidor] || {
                        codigo_distribuidor,
                        fechas: [],
                        fechas_query: [],
                    };
                    if (!grupos[codigo_distribuidor].fechas.includes(fecha)) {
                        grupos[codigo_distribuidor].fechas.push(fecha);
                        grupos[codigo_distribuidor].fechas_query.push({
                            "fecha" : fecha
                        });
                    }
                    return grupos;
                }, {})
            )

            for await(const cod_fecha of codigos_dt_fechas){
                
                await prisma.pvs_pe_ventas_so.deleteMany({
                    where : {
                        codigo_distribuidor : cod_fecha.codigo_distribuidor,
                        OR : cod_fecha.fechas_query
                    }
                })
            }
            await prisma.pvs_pe_ventas_so.createMany({
                data
            })
        }

        const token_excel = crypto.randomBytes(30).toString('hex')
        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                carnombre   : req.files.carga_manual.name,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token=' + token_excel,
                carexito    : carexito_bd,
                carconexion : "",
                carnotificaciones : carnotificaciones_bd
            }
        })

        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoInformarCargaArchivo.html');
        const from_mail_data = process.env.USER_MAIL
        const to_mail_cc_data = ""

        let to_mail_data = [
            'Jazmin.Laguna@grow-analytics.com.pe',
            "Jose.Cruz@grow-analytics.com.pe",
            "Frank.Martinez@grow-analytics.com.pe",
        ]

        if(usu.usuid == 1){
            to_mail_data = [
                "Jose.Cruz@grow-analytics.com.pe",
                "Frank.Martinez@grow-analytics.com.pe",
            ]
        }

        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.carga_manual.name, 
            tipo: "Archivo Plano So", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken,
            error_val: error,
            error_message_mail: message_errors
        }
        
        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail, to_mail_cc_data)

        if(!error){

            let status      = 200

            jsonsalida = { message, messages_delete_data_acc, respuesta }
            let log = null
            if(devmsg.length > 1){
                log = JSON.stringify(devmsg)
            }
            await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'DT MANUALES', 'CREAR', '/carga-archivos/dt-manuales', log, audpk)

            //Actualizar status si es diferente de usuid = 1
            if(usu.tpuid != 1){
                console.log("Actualiza status, no es tpuid 1")
                await ActualizarStatusBaseDatos.MetActualizarStatusBaseDatos(req, res)
            }

            return res.status(status).json({
                message,
                messages_delete_data_acc,
                respuesta,
            })

        }else{
            return true
        }

    }catch(error){
        console.log(error);
        devmsg.push("MetDTManuales-"+error.toString())
        jsonsalida = { message, respuesta, devmsg }
        await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'DT MANUALES', 'CREAR', '/carga-archivos/dt-manuales', JSON.stringify(devmsg), null)

        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar las dt manuales',
            devmsg  : error,
            respuesta : false
        })
    }
}

controller.DistribuitorOverWrittern = (messages_dts) => {
    
    const messages_delete_dts = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_dts.findIndex( mgdd => mgdd.dts == msg.cod_dt)

        if(index_msg_dts == -1){
            messages_delete_dts.push({
                "dts"   : msg.cod_dt,
                "dates" : [msg.fecha]
            })
        }else{
            messages_delete_dts[index_msg_dts]['dates'].push(msg.fecha)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes distribuidoras",
            "data"      : messages_delete_dts
        }
    ]

    return { messages_delete_data }
}

controller.DTActualizarVentasSO = async (action_delete, delete_data, data, audpk=[], devmsg=[]) => {

    try{
        if(action_delete){
            for await (const dat of delete_data ){
    
                let dat_cod = dat.cod_dt.toString()
        
                const find_ventas_so = await prisma.ventas_so.findFirst({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat_cod
                    }
                })

                if(find_ventas_so){
                    audpk.push("ventas_so-delete-"+find_ventas_so.id)

                    // await prisma.ventas_so.deleteMany({
                    //     where: {
                    //         fecha: {
                    //             startsWith: dat.fecha
                    //         },
                    //         codigo_distribuidor: dat_cod
                    //     }
                    // })
                }
            }
        }

        for await (const dt of data){
            const create_ventas_so = await prisma.ventas_so.create({
                data : {
                    ...dt
                }
            })
            audpk.push("ventas_so-delete-"+create_ventas_so.id)
        }
        
        return false

    }catch(err){
        devmsg.push("DTActualizarVentasSO-"+err.toString())
        console.log(err)
        return true
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