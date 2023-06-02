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

controller.MetMasterClientes = async (req, res) => {

    const file = req.files.maestra_cliente;

    const {
        req_delete_data
    } = req.body

    const {
        usutoken
    } = req.headers

    if (!file) {
        res.status(500)
        return res.json({
            message : 'No se ha subido ningún archivo',
            respuesta : false
        })
    }

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
        
        let add_clients = true
        let messages_error_cod_client = false
        let messages_error_nomb_client = false
        let messages_error = []

        const data = rows.map((row, pos) => {

            let properties = Object.keys(rows[0])

            if(!row[properties[0]]){
                add_clients = false
                if(!messages_error_cod_client){
                    messages_error_cod_client = true
                    messages_error.push("Lo sentimos, algunos códigos se encuentran vacios")
                }
            }

            if(!row[properties[4]]){
                add_clients = false
                if(!messages_error_nomb_client){
                    messages_error_nomb_client = true
                    messages_error.push("Lo sentimos, algunos nombres de productos se encuentran vacios")
                }
            }

            return {
                
                codigo_dt           : row[properties[0]] ?  row[properties[0]].toString() : '',
                region              : row[properties[1]] ? row[properties[1]].toString() : '',
                supervisor          : row[properties[2]] ? row[properties[2]].toString() : '',
                localidad           : row[properties[3]] ? row[properties[3]].toString() : '',
                nomb_dt             : row[properties[4]] ? row[properties[4]].toString() : '',
                check_venta         : row[properties[5]] ? row[properties[5]].toString() : '',
                nomb_cliente        : row[properties[6]] ? row[properties[6]].toString() : '',
                latitud             : row[properties[7]] ? row[properties[7]].toString() : '',
                longitud            : row[properties[8]] ? row[properties[8]].toString() : '',
                oficina_two         : row[properties[9]] ? row[properties[9]].toString() : '',
                subcanal            : row[properties[10]] ? row[properties[10]].toString() : '',
                sap_solicitante     : row[properties[11]] ? row[properties[11]].toString() : '',
                sap_destinatario    : row[properties[12]] ? row[properties[12]].toString() : '',
                diferencial         : row[properties[13]] ? row[properties[13]].toString() : '',
                canal_atencion      : row[properties[14]] ? row[properties[14]].toString() : '',
                cod_solicitante     : row[properties[15]] ? row[properties[15]].toString() : '',
                cod_destinatario    : row[properties[16]] ? row[properties[16]].toString() : '',
                canal_trade         : row[properties[17]] ? row[properties[17]].toString() == 'NULL'? '' : row[properties[17]].toString() : '',
            }
        });

        if(!add_clients){
            res.status(500)
            return res.json({
                message : 'Lo sentimos se encontraron algunas observaciones',
                messages_error : messages_error,
                respuesta : false
            })
        }

        if(req_delete_data == 'true'){
            console.log('elimina clientees')
            await prisma.master_distribuidoras.deleteMany({})
        }

        await prisma.master_distribuidoras.createMany({
            data
        });

        const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()

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
            }
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
            url_archivo: car.cartoken
        }

        // await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        return res.status(200).json({
            message : 'La maestra de Clientes fue cargada correctamente',
            respuesta : true
        })

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