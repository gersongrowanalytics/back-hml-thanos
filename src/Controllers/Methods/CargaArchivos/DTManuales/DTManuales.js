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

    const {
        usutoken
    } = req.headers

    try{

        const espn = []

        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : req.headers.usutoken
            },
            select: {
                usuid: true,
                usuusuario: true,
                perid : true
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

        const are = await prisma.areareasestados.findFirst({
            where : {
                fecid       : fecid,
                arenombre   : 'Ventas'
            }
        })

        const data_espn = data.filter(dat => dat.m_cl_grow != null)
        
        for await (const esp of data_espn){


            const espo = await prisma.espestadospendientes.findFirst({
                where : {
                    fecid       : fecid,
                    m_cl_grow   : esp.m_cl_grow
                }
            })

            if(espo){
                await prisma.espestadospendientes.update({
                    where : {
                        espid : espo.espid
                    },
                    data : {
                        espfechactualizacion    : new Date(),
                        perid                   : usu.perid
                    }
                })
            }else{
                if(espn.findIndex(es => es.m_cl_grow == esp.m_cl_grow) == -1){
                    espn.push({
                        fecid               : fec.fecid,
                        perid               : null,
                        tprid               : 1,
                        espdts              : true,
                        areid               : are.areid,
                        m_cl_grow           : esp.m_cl_grow,
                        espfechaprogramado  : new Date(),
                        espchacargareal     : null,
                        espfechactualizacion: null,
                        espbasedato         : 'DTS (Sell Out)',
                        espresponsable      : 'Usu Dev',
                        espdiaretraso       : '0',
                        esporden            : false,
                    })
                }
            }
        }

        await prisma.espestadospendientes.createMany({
            data : espn
        })

        const espe = await prisma.espestadospendientes.findFirst({
            where : {
                AND : [
                    {
                        fecid : fecid
                    },
                    {
                        espbasedato : 'Archivo plano SO (plantilla)'
                    }
                ]
            }
        })
        
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
        const to_mail_data = "Gerson.Vilca@grow-analytics.com.pe"
        const subject_mail_success = "Carga de Archivo"
        
        const data_mail = {
            archivo: req.files.carga_manual.name, 
            tipo: "Archivo Plano So", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken
        }
        
        if(espe){
            if(usu.perid == 10){
                
            }else{
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
                            espdts      : false,
                            espfechactualizacion : null
                        }
                    })
        
                    if(espcount.length == 0){
                        are_percentage = '100'
                    }else{
                        are_percentage = (100-(espcount.length*50)).toString()
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
            }
        }
        
        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        
        return res.status(200).json({
            message : 'Las ventas manuales fueron cargadas correctamente',
            messages_delete_data,
            respuesta : true,
            espn
        })

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