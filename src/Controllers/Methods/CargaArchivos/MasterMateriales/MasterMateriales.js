const controller = {}
require('dotenv').config()
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

controller.MetMasterMateriales = async (req, res) => {

    const file = req.files.maestra_producto

    const {
        req_delete_data
    } = req.body
    
    const workbook  = XLSX.read(file.data)

    if(!workbook.Sheets['Hoja1']){
        res.status(500)
        res.json({
            message : 'Lo sentimos no se encontro la hoja con nombre Hoja1'
        })
        return false
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})

    try{

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
            res.json({
                message : 'Lo sentimos se encontraron algunas observaciones',
                messages_error : messages_error
            })
            return false
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
        const to_mail_data = "Frank.Martinez@grow-analytics.com.pe"
        const subject_mail_success = "Carga de Archivo"

        const data_mail = {
            archivo: req.files.maestra_producto.name, 
            tipo: "Archivo Master de Productos", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
        
        return res.status(200).json({
            message : 'La maestra de Materiales fue cargada correctamente',
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de cargar los datos',
            devmsg  : error
        })
        return false
    }
}


module.exports = controller