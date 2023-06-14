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
const path = require('path');

controller.MetDTManuales = async (req, res, data, delete_data, error, message_errors) => {

    const {
        req_action_file,
        req_type_file
    } = req.body

    const {
        usutoken
    } = req.headers

    try{

        const baseUrl = req.protocol + '://' + req.get('host');

        const action_file = JSON.parse(req_action_file)

        const espn = []

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

        let messages_delete_data_acc

        if(!error){
            // const fec = await prisma.fecfechas.findFirst({
            //     where : {
            //         fecmesabierto : true,
            //     },
            //     select : {
            //         fecid : true
            //     }
            // })
            
            // const fecid = fec.fecid

            // const are = await prisma.areareasestados.findFirst({
            //     where : {
            //         fecid       : fecid,
            //         arenombre   : 'Ventas'
            //     }
            // })

            // const data_espn = data.filter(dat => dat.m_cl_grow != null)
            
            // for await (const esp of data_espn){

            //     const espo = await prisma.espestadospendientes.findFirst({
            //         where : {
            //             fecid       : fecid,
            //             m_cl_grow   : esp.m_cl_grow
            //         }
            //     })

            //     if(espo){
            //         await prisma.espestadospendientes.update({
            //             where : {
            //                 espid : espo.espid
            //             },
            //             data : {
            //                 espfechactualizacion    : new Date(),
            //                 perid                   : usu.perid
            //             }
            //         })
            //     }else{
            //         if(espn.findIndex(es => es.m_cl_grow == esp.m_cl_grow) == -1){
            //             espn.push({
            //                 fecid               : fec.fecid,
            //                 perid               : usu.perid,
            //                 tprid               : 1,
            //                 espdts              : true,
            //                 areid               : are.areid,
            //                 m_cl_grow           : esp.m_cl_grow,
            //                 espfechaprogramado  : new Date(),
            //                 espchacargareal     : null,
            //                 espfechactualizacion: null,
            //                 espbasedato         : 'DTS (Sell Out)',
            //                 espresponsable      : 'Ventas',
            //                 espdiaretraso       : '0',
            //                 esporden            : false,
            //             })
            //         }
            //     }
            // }

            // await prisma.espestadospendientes.createMany({
            //     data : espn
            // })

            // const espe = await prisma.espestadospendientes.findFirst({
            //     where : {
            //         AND : [
            //             {
            //                 fecid : fecid
            //             },
            //             {
            //                 espbasedato : 'Archivo plano SO (plantilla)'
            //             }
            //         ]
            //     }
            // })
            
            // const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)

            // messages_delete_data_acc = messages_delete_data

            // if(action_file.delete_data){
            //     for await (const dat of delete_data ){

            //         let dat_cod = dat.cod_dt.toString()
            
            //         await prisma.ventas_so.deleteMany({
            //             where: {
            //                 fecha: {
            //                     startsWith: dat.fecha
            //                 },
            //                 codigo_distribuidor: dat_cod
            //             }
            //         })
            //     }
            // }
            
            // await prisma.ventas_so.createMany({
            //     data
            // })

            // if(espe){

            //     let date_one = moment()
            //     let date_two = moment(espe.espfechaprogramado)
        
            //     let esp_day_late
            //     if(date_one > date_two){
        
            //         let diff_days_date_one_two = date_one.diff(date_two, 'days')
        
            //         if( diff_days_date_one_two > 0){
            //             esp_day_late = diff_days_date_one_two.toString()
            //         }else{
            //             esp_day_late = '0'
            //         }
            //     }else{
            //         esp_day_late = '0'
            //     }
        
            //     const espu = await prisma.espestadospendientes.update({
            //         where : {
            //             espid : espe.espid
            //         },
            //         data : {
            //             perid                   : usu.perid,
            //             espfechactualizacion    : new Date().toISOString(),
            //             espdiaretraso           : esp_day_late
            //         }
            //     })
        
            //     const aree = await prisma.areareasestados.findFirst({
            //         where : {
            //             areid : espe.areid
            //         }
            //     })
        
            //     if(aree){
            //         let are_percentage
            //         const espcount = await prisma.espestadospendientes.findMany({
            //             where : {
            //                 fecid       : fecid,
            //                 areid       : espe.areid,
            //                 espdts      : false,
            //                 espfechactualizacion : null
            //             }
            //         })
        
            //         if(espcount.length == 0){
            //             are_percentage = '100'
            //         }else{
            //             are_percentage = (100-(espcount.length*50)).toString()
            //         }
                    
            //         const areu = await prisma.areareasestados.update({
            //             where : {
            //                 areid : aree.areid
            //             },
            //             data : {
            //                 areporcentaje : are_percentage
            //             }
            //         })
            //     }
            // }
        }   

        // const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        // const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()
        
        const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/planoso/'+ token_name + '-' + req.files.carga_manual.name

        const archivoExcel = req.files.carga_manual.data
        const excelSize = req.files.carga_manual.size
        
        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)
        
        const token_excel = crypto.randomBytes(30).toString('hex')
        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                // carnombre   : nombre_archivo+'.xlsx',
                carnombre   : token_name + '-' + req.files.carga_manual.name,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token=' + token_excel,
                carexito    : error ? false : true,
                carnotificaciones : error ? JSON.stringify(message_errors) : 'Las ventas manuales fueron cargadas correctamente'
            }
        })

        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoInformarCargaArchivo.html');
        const from_mail_data = process.env.USER_MAIL
        // const to_mail_data = process.env.TO_MAIL

        let to_mail_data = ["gerson.vilca@grow-analytics.com.pe", 'Jazmin.Laguna@grow-analytics.com.pe']
        if(usu.usuid == 1){
            to_mail_data = ["gerson.vilca@grow-analytics.com.pe"]
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
        
        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        if(!error){
            return res.status(200).json({
                message : 'Las ventas manuales fueron cargadas correctamente',
                messages_delete_data_acc,
                respuesta : true,
                espn
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

module.exports = controller