const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto')
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')
const RemoveFileS3 = require('../../S3/RemoveFileS3')
const SendMail = require('../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')
const moment = require('moment');
const { log } = require('handlebars');
require('dotenv').config()
const path = require('path');


controller.MetMasterMateriales = async (req, res, data, error, message_errors) => {

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
        
        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : req.headers.usutoken
            },
            select: {
                usuid: true,
                usuusuario: true,
                perid: true
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
                            espbasedato : 'Master Productos'
                        }
                    ]
                }
            })
    
            if(action_file.delete_data){
                // await prisma.master_productos.deleteMany({})
            }
    
            // await prisma.master_productos.create({
            //     data : {
            //         id : 1,
            //         cod_producto : "OTROS",
            //         nomb_producto : "OTROS"
            //     }
            // });
    
            await prisma.master_productos.createMany({
                data
            })
    
            const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
            const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()
    
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
                        are_percentage = (100 - (espcount.length*25)).toString()
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
    
            // const ARRAY_S3 = [
            //     "hmlthanos/pe/tradicional/archivosgenerados/maestraclientes/", 
            //     "hmlthanos/pe/tradicional/archivosgenerados/maaestraproductos/", 
            //     "hmlthanos/pe/tradicional/archivosgenerados/homologaciones/"
            // ]
    
            // for await (s3 of ARRAY_S3) {
            //     let reqUbi = {
            //         body: {
            //             re_ubicacion_s3: s3
            //         }
            //     }
            //     await RemoveFileS3.RemoveFileS3(reqUbi)
            // }
        }

        const cadenaAleatorio = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const nombre_archivo = 'MasterProductos-'+cadenaAleatorio
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/masterproductos/'+nombre_archivo+'.xlsx'
        const archivoExcel = req.files.maestra_producto.data
        const excelSize = req.files.maestra_producto.size

        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)
        const token_excel = crypto.randomBytes(30).toString('hex')
        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                carnombre   : nombre_archivo+'.xlsx',
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token='+token_excel,
                carexito    : error ? false : true,
                carnotificaciones : error ? JSON.stringify(message_errors) : 'La maestra de Producto fue cargada correctamente'
            }
        })

        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoInformarCargaArchivo.html');
        // const success_mail_html = "src/Controllers/Methods/Mails/CorreoInformarCargaArchivo.html"
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = process.env.TO_MAIL
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.maestra_producto.name, 
            tipo: "Archivo Master de Productos", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken,
            error_val: error,
            error_message_mail: message_errors
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
        
        if(!error){
            return res.status(200).json({
                message : 'La maestra de Producto fue cargada correctamente',
                respuesta : true
            })
        }else{
            return true
        }

    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar los datos',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller