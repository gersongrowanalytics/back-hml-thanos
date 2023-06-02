const controller = {}
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const SendMail = require('../../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileExcel = require('../../../S3/UploadFileExcelS3')

controller.MetSellin = async (req, res, data, delete_data) => {

    const {
        req_delete_data
    } = req.body

    try{

        const { messages_delete_data } = controller.SellinOverWrittern(delete_data)

        if(req_delete_data == 'true'){
            for await (const dat of delete_data ){
    
                await prisma.sellin.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat
                        },
                    }
                })
            }
        }

        await prisma.sellin.createMany({
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
        const nombre_archivo = 'SellIn-'+cadenaAleatorio
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/sellin/'+nombre_archivo+'.xlsx'
        const archivoExcel = req.files.carga_sellin.data
        const excelSize = req.files.carga_sellin.size

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
            archivo: req.files.carga_sellin.name, 
            tipo: "Archivo Sell In", 
            usuario: usu.usuusuario,
            url_archivo: car.cartoken
        }

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        res.status(200).json({
            message : 'Los datos de inventarios fueron cargados correctamente',
            messages_delete_data,
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar el inventario',
            devmsg  : error
        })
    }
}


controller.SellinOverWrittern = (messages_dts) => {
    
    const messages_delete_date = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_date.findIndex( date => date == msg)

        if(index_msg_dts == -1){
            messages_delete_date.push(msg)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes fechas",
            "data"      : messages_delete_date
        }
    ]

    return { messages_delete_data }

}

module.exports = controller