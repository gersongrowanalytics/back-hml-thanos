const controller = {}
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const moment = require('moment')
const SendMail = require('../../Reprocesos/SendMail')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const path = require('path')
const DTActualizarEstadoSelloutController = require('../DTManuales/DTActualizarEstadoSellOut')
const RegisterAudits = require('../../Audits/CreateAudits/RegisterAudits')
const StatusArchivoPlano = require('../../Status/EstadoPendiente/ActualizarStatusArchivoPlano')

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
    let messages_delete_data_acc    = []
    let car
    let error_mets = false

    try{

        const baseUrl = req.protocol + '://' + req.get('host')
        
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
        }

        const token_excel = crypto.randomBytes(30).toString('hex')
        car = await prisma.carcargasarchivos.create({
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

        if(!error){
            
            const res_pvs = await controller.AddRegisterPvs(data, devmsg)
            if(!res_pvs) error_mets = true
            const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)

            messages_delete_data_acc = messages_delete_data
            if(usu.tpuid != 1){
                const res_dts = await DTActualizarEstadoSelloutController.ActualizarEstadoSellOut(req, res, data, audpk, devmsg)
                if(res_dts) error_mets = true

                const date = moment(req_date_updated)
                const fec = await prisma.fecfechas.findFirst({
                    select: {
                        fecid: true,
                    },
                    where : {
                        fecanionumero   : date.year(),
                        fecmesnumero    : date.month() + 1
                    }
                })

                const res_status = await StatusArchivoPlano.MetActualizarStatusArchivoPlano(null, fec.fecid, usu.perid, devmsg)
                if(!res_status) error_mets = true

                jsonsalida = { message, messages_delete_data_acc, respuesta }
            }
        }
    }catch(error){
        console.log("MetDTManuales", error)
        devmsg.push({
            response: false,
            message: `Hubo un error en en la api MetDTManuales: ${err.toString()}`,
        })
        error_mets = true
        jsonsalida = { message, respuesta, devmsg }
    }finally{
        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoInformarCargaArchivo.html')
        const from_mail_data = process.env.USER_MAIL
        const to_mail_cc_data = []

        let to_mail_data = [
            "Frank.Martinez@grow-analytics.com.pe",
            "Jose.Cruz@grow-analytics.com.pe",
            "Jazmin.Laguna@grow-analytics.com.pe",
        ]

        const subject_mail_success = "Carga de Archivo"

        let data_mail = {
            archivo: req.files.carga_manual.name, 
            tipo: "Archivo Plano So", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken,
            error_val: error,
            error_message_mail: message_errors,
            error_log: [],
            devmsg: [],
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail, to_mail_cc_data)

        if(error_mets){
            to_mail_data = [
                "Frank.Martinez@grow-analytics.com.pe",
                "Jose.Cruz@grow-analytics.com.pe",
                "Jazmin.Laguna@grow-analytics.com.pe",
            ]
            data_mail = {
                ...data_mail,
                devmsg: devmsg,
            }

            await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail, to_mail_cc_data)
        }
        
        if(!error){
            await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'DT MANUALES', 'CREAR', '/carga-archivos/dt-manuales', JSON.stringify(devmsg), audpk)
            await prisma.$disconnect()

            return res.status(200).json({
                message,
                messages_delete_data_acc,
                respuesta,
                devmsg,
            })
        }else{
            return true
        }
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

controller.AddRegisterPvs = async (data, devmsg) => {
    try{
        const codigos_dt_fechas = Object.values(
            data.reduce((grupos, dato) => {
                const { codigo_distribuidor, fecha } = dato
                grupos[codigo_distribuidor] = grupos[codigo_distribuidor] || {
                    codigo_distribuidor,
                    fechas: [],
                    fechas_query: [],
                }
                if (!grupos[codigo_distribuidor].fechas.includes(fecha)) {
                    grupos[codigo_distribuidor].fechas.push(fecha);
                    grupos[codigo_distribuidor].fechas_query.push({
                        "fecha" : fecha
                    });
                }
                return grupos
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

        devmsg.push({
            response: true,
            message: "Se actualizó correctamente el Archivo Plano SO",
        })
        return true
    }catch(error){
        console.log("AddRegisterPvs", error)
        devmsg.push({
            response: false,
            message: "Error al actualizar los datos Archivo Plano So: "+error.toString(),
        })
        return false
    }
}

module.exports = controller