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
const StatusCuotaSellOut = require('../../Status/EstadoPendiente/ActualizarStatusCuotaSellOut')
const path = require('path');

controller.MetCargaArchivoS3 = async ( req, res ) => {

    const {
        usutoken
    } = req.headers

    const {
        req_type_file,
        req_action_file,
        req_usucorreo
    } = req.body

    try{

        let usu
        if(usutoken){
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usutoken : usutoken
                },
                select : {
                    usuusuario : true,
                    usuid : true
                }
            })
        }else{
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usucorreo : req_usucorreo
                }
            })

            if(!usu){

                let per = await prisma.perpersonas.findFirst({
                    where : {
                        pernombre : 'Usuario'
                    }
                })

                usu = await prisma.usuusuarios.create({
                    data : {
                        tpuid                   : 1,
                        perid                   : per.perid,
                        usuusuario              : 'usuario@gmail.com',
                        usucorreo               : 'usuario@gmail.com',
                        estid                   : 1,
                        usutoken                : crypto.randomBytes(30).toString('hex'),
                        usupaistodos            : false,
                        usupermisosespeciales   : false,
                        usucerrosesion          : false,
                        usucierreautomatico     : false
                    }
                })
            }
        }

        const baseUrl = req.protocol + '://' + req.get('host');
        let path_file
        
        const name_file = req.files.file_s3.name.substring(0, req.files.file_s3.name.lastIndexOf("."));
        const ext_file = req.files.file_s3.name.substring(req.files.file_s3.name.lastIndexOf(".") + 1);


        if(process.env.ENTORNO == 'PREPRODUCTIVO'){
            path_file = 'hmlthanos/prueba/pe/tradicional/carga_archivos/'
        }else{
            path_file = 'hmlthanos/pe/tradicional/carga_archivos/'
        }

        
        const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)
        const filePath = path_file + req_type_file +'/' + name_file + '-' + token_name + '.' + ext_file
        const fileSize = req.files.file_s3.size

        // const success_mail_html = "src/Controllers/Methods/Mails/CargaArchivoS3.html"
        // const success_mail_html = "/var/www/softys/hml_thanos/back/src/Controllers/Methods/Mails/CargaArchivoS3.html"
        const success_mail_html = path.resolve(__dirname, '../../Mails/CargaArchivoS3.html');
        const from_mail_data = process.env.USER_MAIL
        // const to_mail_data = "jose.cruz.growanalytics@gmail.com"
        const to_mail_data = [
            "Jose.Cruz@grow-analytics.com.pe",
            "Frank.Martinez@grow-analytics.com.pe",
            "gerson.vilca@grow-analytics.com.pe"
        ]
        
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
                carnombre   : req.files.file_s3.name,
                cararchivo  : filePath,
                cartoken    : token_excel,
                cartipo     : req_type_file,
                carurl      : baseUrl + '/carga-archivos/generar-descarga?token='+token_excel,
                carexito    : true,
                carnotificaciones : 'El archivo de ' + req_type_file + ' fue cargado exitosamente'
            }
        })

        const data_mail = {
            archivo     : req.files.file_s3.name, 
            usuario     : usu.usuusuario,
            tipo        : req_type_file,
            url_archivo : car.cartoken,
            url_host    : baseUrl
        }

        await controller.ActualizarStatus(usutoken, req_type_file, req)

        await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        res.status(200).json({
            response    : true,
            message     : 'Archivo cargado exitosamente'
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Lo sentimos ha ocurrido un error al cargar el archivo'
        })
    }
}

controller.ActualizarStatus = async ( usutoken, req_type_file, req) => {

    let date    = null
    let perid   = null

    switch (req_type_file) {
        case 'Archivo Plano SO':
            await StatusArchivoPlano.MetActualizarStatusArchivoPlano(usutoken, date, perid, null, req)
            break;
        case 'Master de Clientes':
            await StatusMasterClientes.MetActualizarStatusMasterClientes(usutoken, date, perid, null, req)
            break;
        case 'Master de Precios':
            await StatusMasterPrecios.MetActualizarStatusMasterPrecios(usutoken, date, perid, null, req)
            break;
        case 'Master de Producto':
            await StatusMasterProductos.MetActualizarStatusMasterProductos(usutoken, date, perid, null, req)
            break;
        case 'Sell In Thanos':
            await StatusSellinThanos.MetActualizarStatusSellinThanos(usutoken, date, perid, null, req)
            break;
        case 'Sell Out':
            await StatusCuotaSellOut.MetActualizarStatusCuotaSellOut(usutoken, date, perid, null, req)
            break;
        default:
            console.log('No se encontró algun tipo de archivo');
    }
}

module.exports = controller