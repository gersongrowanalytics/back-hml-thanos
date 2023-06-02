const controller = {}
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const SendMail = require('../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../S3/UploadFileExcelS3')

controller.MetMasterPrecios = async (req, res, data, dates_row) => {

    const {
        req_delete_data
    } = req.body

    try{

        if(req_delete_data == 'true'){

            for await (const dat of dates_row ){
    
                await prisma.master_precios.deleteMany({
                    where: {
                        date: {
                            startsWith: dat
                        }
                    }
                })
            }
        }

        await prisma.master_precios.createMany({
            data
        })

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
        const nombre_archivo = 'MasterPrecios-'+cadenaAleatorio
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/masterprecios/'+nombre_archivo+'.xlsx'
        const archivoExcel = req.files.master_precios.data
        const excelSize = req.files.master_precios.size

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
            archivo: req.files.master_precios.name, 
            tipo: "Archivo Master de Precios", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        res.status(200)
        res.json({
            message     : 'La data de maestra precios fue cargada con éxito',
            response    : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de leer el archivo',
            devmsg  : error
        })
    }
}

module.exports = controller