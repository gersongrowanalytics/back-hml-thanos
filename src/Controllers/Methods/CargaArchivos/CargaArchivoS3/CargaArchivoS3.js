const controller = {}
const { PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const configCredentials = require('../../../../../config')
const client = require('../../../../../s3.js')
const SendMail = require('../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCargaArchivoS3 = async ( req, res ) => {

    const {
        usutoken
    } = req.headers

    const {
        req_type_file
    } = req.body

    try{

        // const input = {
        //     Bucket: configCredentials.AWS_BUCKET,
        //     Prefix: "hmlthanos/prueba/cargas3",
        // };
        // const command = new ListObjectsV2Command(input);
        // const response = await client.send(command);
        // console.log(response)

        const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const filePath = 'hmlthanos/prueba/cargas3/'+ token_name + req.files.file_s3.name 
        const fileSize = req.files.file_s3.size

        const usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : usutoken
            },
            select : {
                usuusuario : true
            }
        })

        const success_mail_html = "src/Controllers/Methods/Mails/CargaArchivoS3.html"
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = "gerson.vilca@grow-analytics.com.pe"
        const subject_mail_success = "Carga de Archivo Thanos"

        const data_mail = {
            archivo : req.files.file_s3.name, 
            usuario : usu.usuusuario,
            tipo    : req_type_file
        }
        
        const uploadParams = {
            Bucket : configCredentials.AWS_BUCKET,
            Key: filePath,
            Body: req.files.file_s3.data,
            ContentLength: fileSize,
        }
    
        const comand = new PutObjectCommand(uploadParams)
        await client.send(comand)
        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        res.status(200).json({
            response    : true,
            message     : 'Archivo cargado exitosamente'
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar el archivo'
        })
    }
}

module.exports = controller