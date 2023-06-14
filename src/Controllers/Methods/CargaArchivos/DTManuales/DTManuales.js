const controller = {}
require('dotenv').config()
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const moment = require('moment')
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')
const RemoveFileS3 = require('../../S3/RemoveFileS3')
const SendMail = require('../../Reprocesos/SendMail')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const path = require('path')
const DTActualizarEstadoSelloutController = require('./DTActualizarEstadoSellOut')

controller.MetDTManuales = async (req, res, data, delete_data, error, message_errors) => {

    const {
        req_action_file
    } = req.body

    const {
        usutoken
    } = req.headers

    try{

        const action_file = JSON.parse(req_action_file)
        let messages_delete_data_acc
        let error_actualizar_esp    = false
        let error_actualizar_so     = false

        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : usutoken
            },
            select: {
                usuid: true,
                usuusuario: true,
                perid : true
            }
        })

        if(!error){

            const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)
            messages_delete_data_acc = messages_delete_data

            error_actualizar_esp  = await DTActualizarEstadoSelloutController.ActualizarEstadoSellOut(req, res)
            error_actualizar_so   =  await controller.DTActualizarVentasSO(action_file)
        }

        // const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        // const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()
        
        const cadenaAleatorio = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const nombre_archivo = 'PlanoSo-'+cadenaAleatorio
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/planoso/'+nombre_archivo+'.xlsx'
        const archivoExcel = req.files.carga_manual.data
        const excelSize = req.files.carga_manual.size
        
        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)
        
        const token_excel = crypto.randomBytes(30).toString('hex')
        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                carnombre   : nombre_archivo,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
            }
        })

        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoInformarCargaArchivo.html');
        const from_mail_data = process.env.USER_MAIL
        // const to_mail_data = process.env.TO_MAIL
        const to_mail_data = "gerson.vilca@grow-analytics.com.pe"
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.carga_manual.name, 
            tipo: "Archivo Plano So", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken,
            error_val: error,
            error_message_mail: message_errors
        }
        
        // await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        if(!error){

            // if(error_actualizar_esp ||)
            return res.status(200).json({
                message : 'Las ventas manuales fueron cargadas correctamente',
                messages_delete_data_acc,
                respuesta : true,
            })
        }else{
            return true
        }

    }catch(error){
        console.log(error);
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

controller.DTActualizarVentasSO = async (delete_data) => {

    try{
        if(delete_data){
            for await (const dat of delete_data ){
    
                let dat_cod = dat.cod_dt.toString()
        
                await prisma.ventas_so.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat_cod
                    }
                })
            }
        }
        
        await prisma.ventas_so.createMany({
            data
        })

        return true

    }catch(err){
        console.log(err)
        return false
    }
}

module.exports = controller