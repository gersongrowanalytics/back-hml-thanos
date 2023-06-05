const controller = {}
const { PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const configCredentials = require('../../../../../config')
const client = require('../../../../../s3.js')
const SendMail = require('../../Reprocesos/SendMail')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const StatusArchivoPlano = require('../../Status/EstadoPendiente/ActualizarStatusArchivoPlano')
const StatusMasterClientes = require('../../Status/EstadoPendiente/ActualizarStatusMasterClientes')
const StatusMasterProductos = require('../../Status/EstadoPendiente/ActualizarStatusMasterProductos')
const StatusMasterPrecios = require('../../Status/EstadoPendiente/ActualizarStatusMasterPrecios')
const StatusSellinThanos = require('../../Status/EstadoPendiente/ActualizarStatusSellinThanos')

controller.MetCargaArchivoS3 = async ( req, res ) => {

    const {
        usutoken
    } = req.headers

    const {
        req_type_file
    } = req.body

    try{

        const baseUrl = req.protocol + '://' + req.get('host');
        
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

        // const success_mail_html = "src/Controllers/Methods/Mails/CargaArchivoS3.html"
        const success_mail_html = "/var/www/softys/hml_thanos/back/src/Controllers/Methods/Mails/CargaArchivoS3.html"
        const from_mail_data = process.env.USER_MAIL
        // const to_mail_data = "jose.cruz@grow-analytics.com.pe"
        const to_mail_data = "gerson.vilca@grow-analytics.com.pe"
        const subject_mail_success = "Carga de Archivo Thanos"
        const token_excel = crypto.randomBytes(30).toString('hex')

        const uploadParams = {
            Bucket : configCredentials.AWS_BUCKET,
            Key: filePath,
            Body: req.files.file_s3.data,
            ContentLength: fileSize,
        }
    
        const comand = new PutObjectCommand(uploadParams)
        await client.send(comand)

        const car = await prisma.carcargasarchivos.create({
            data: {
                usuid       : usu.usuid,
                carnombre   : req_type_file.replace(' ', '') + token_name,
                cararchivo  : filePath,
                cartoken    : token_excel,
            }
        })

        const data_mail = {
            archivo     : req.files.file_s3.name, 
            usuario     : usu.usuusuario,
            tipo        : req_type_file,
            url_archivo : car.cartoken,
            url_host    : baseUrl
        }

        await controller.ActualizarStatus(usutoken, req_type_file)

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

controller.ActualizarStatus = async ( usutoken, req_type_file ) => {

    switch (req_type_file) {
        case 'Archivo Plano SO':
            await StatusArchivoPlano.MetActualizarStatusArchivoPlano(usutoken)
            break;
        case 'Master de Clientes':
            await StatusMasterClientes.MetActualizarStatusMasterClientes(usutoken)
            break;
        case 'Master de Precios':
            await StatusMasterPrecios.MetActualizarStatusMasterPrecios(usutoken)
            break;
        case 'Master de Producto':
            await StatusMasterProductos.MetActualizarStatusMasterProductos(usutoken)
            break;
        case 'Sell In Thanos':
            await StatusSellinThanos.MetActualizarStatusSellinThanos(usutoken)
            break;
        default:
            console.log('No se encontró algun tipo de archivo');
    }
}

module.exports = controller