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

controller.MetMasterMateriales = async (req, res) => {

    const file = req.files.maestra_producto

    const {
        req_delete_data
    } = req.body

    const {
        usutoken
    } = req.headers
    
    const workbook  = XLSX.read(file.data)

    if(!workbook.Sheets['Hoja1']){
        res.status(500)
        return res.json({
            message : 'Lo sentimos no se encontro la hoja con nombre Hoja1',
            respuesta : false
        })
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})

    try{

        // const usu = await prisma.usuusuarios.findFirst({
        //     where : {
        //         usutoken : usutoken
        //     },
        //     select : {
        //         usuid       : true,
        //         perid       : true,
        //         usuusuario  : true
        //     }
        // })

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

        let add_products = true
        let messages_error_cod_producto = false
        let messages_error_nomb_producto = false
        let messages_error = []

        const data = rows.map((row, pos) => {

            let properties = Object.keys(rows[0])

            if(!row[properties[0]]){
                add_products = false
                if(!messages_error_cod_producto){
                    messages_error_cod_producto = true
                    messages_error.push("Lo sentimos, algunos códigos se encuentran vacios")
                }
            }

            if(!row[properties[1]]){
                add_products = false
                if(!messages_error_nomb_producto){
                    messages_error_nomb_producto = true
                    messages_error.push("Lo sentimos, algunos nombres de productos se encuentran vacios")
                }
            }

            return {
                
                cod_producto    : row[properties[0]] ?  row[properties[0]].toString() : '',
                nomb_producto   : row[properties[1]] ?  row[properties[1]].toString() : '',
                division        : row[properties[2]] ?  row[properties[2]].toString() : '',
                sector          : row[properties[3]] ?  row[properties[3]].toString() : '',
                categoria       : row[properties[4]] ?  row[properties[4]].toString() : '',
                subcategoria    : row[properties[5]] ?  row[properties[5]].toString() : '',
                segmento        : row[properties[6]] ?  row[properties[6]].toString() : '',
                presentacion    : row[properties[7]] ?  row[properties[7]].toString() : '',
                peso            : row[properties[8]] ?  row[properties[8]].toString() : '',
                paquetexbulto   : row[properties[9]] ?  row[properties[9]].toString() : '',
                unidadxpqte     : row[properties[10]] ? row[properties[10]].toString() : '',
                metroxund       : row[properties[11]] ? row[properties[11]].toString() : '',
                ean13           : row[properties[12]] ? row[properties[12]].toString() : '',
                ean14           : row[properties[13]] ? row[properties[13]].toString() : '',
                minund          : row[properties[14]] ? row[properties[14]].toString() : '',
                estado          : row[properties[15]] ? row[properties[15]].toString() : '',
                marco           : row[properties[16]] ? row[properties[16]].toString() : '',
            }
        });

        if(!add_products){
            res.status(500)
            return res.json({
                message : 'Lo sentimos se encontraron algunas observaciones',
                messages_error : messages_error,
                respuesta : false
            })
        }

        if(req_delete_data == 'true'){
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
        });

        const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()

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
            archivo: req.files.maestra_producto.name, 
            tipo: "Archivo Master de Productos", 
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
        }
        // await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
        
        return res.status(200).json({
            message : 'La maestra de Producto fue cargada correctamente',
            respuesta : true
        })

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