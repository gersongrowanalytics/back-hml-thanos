const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto')
const XLSX = require('xlsx')
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')
const RemoveFileS3 = require('../../S3/RemoveFileS3')
const SendMail = require('../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')
const moment = require('moment');
require('dotenv').config()

controller.MetMasterClientes = async ( req, res, data, error, message_errors) => {

    const {
        req_action_file
    } = req.body

    const {
        usutoken
    } = req.headers


    try{

        const action_file = JSON.parse(req_action_file)

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
                            espbasedato : 'Master Clientes'
                        }
                    ]
                }
            })

            if(action_file.delete_data){
                await prisma.master_distribuidoras.deleteMany({})
            }

            await prisma.master_distribuidoras.createMany({
                data
            });

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
        
                const ARRAY_S3 = [
                    "hmlthanos/pe/tradicional/archivosgenerados/maestraclientes/", 
                    "hmlthanos/pe/tradicional/archivosgenerados/maaestraproductos/", 
                    "hmlthanos/pe/tradicional/archivosgenerados/homologaciones/"
                ]
                // const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
                // const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()
        
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

        const cadenaAleatorio = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const nombre_archivo = 'MasterClientes-'+cadenaAleatorio
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/masterclientes/'+nombre_archivo+'.xlsx'
        const archivoExcel = req.files.maestra_cliente.data
        const excelSize = req.files.maestra_cliente.size

        await UploadFileExcel.UploadFileExcelS3(ubicacion_s3, archivoExcel, excelSize)
        const token_excel = crypto.randomBytes(30).toString('hex')
        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usun.usuid,
                carnombre   : nombre_archivo,
                cararchivo  : ubicacion_s3,
                cartoken    : token_excel,
            }
        })

        const success_mail_html = "src/Controllers/Methods/Mails/CorreoInformarCargaArchivo.html"
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = process.env.TO_MAIL
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.maestra_cliente.name, 
            tipo: "Archivo Master de Clientes", 
            usuario: usun.usuusuario,
            url_archivo: car.cartoken,
            error_val: error,
            error_message_mail: message_errors
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        if(!error){
            return res.status(200).json({
                message : 'La maestra de Clientes fue cargada correctamente',
                respuesta : true
            })
        }else{
            return true
        }

    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar los datos del excel',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller