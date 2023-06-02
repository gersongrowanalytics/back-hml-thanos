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

controller.MetDTManuales = async (req, res, data, delete_data) => {

    const {
        req_delete_data
    } = req.body

    try{

        const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)

        if(req_delete_data == 'true'){
            for await (const dat of delete_data ){
    
                await prisma.ventas_so.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat.cod_dt
                    }
                })
            }
        }

        await prisma.ventas_so.createMany({
            data
        })

        // const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        // const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()

        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : req.headers.usutoken
            },
            select: {
                usuid: true,
                usuusuario: true
            }
        })

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

        const success_mail_html = "src/Controllers/Methods/Mails/CorreoInformarCargaArchivo.html"
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = "Frank.Martinez@grow-analytics.com.pe"
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.carga_manual.name, 
            tipo: "Archivo Plano So", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
        
        return res.status(200).json({
            message : 'Las ventas manuales fueron cargadas correctamente',
            messages_delete_data,
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar las dt manuales',
            devmsg  : error
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

module.exports = controller