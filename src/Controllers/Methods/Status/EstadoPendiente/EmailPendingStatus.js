const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const SendMail = require('../../Reprocesos/SendMail')
const path = require('path')
const MostrarEstadoPendiente = require('./MostrarEstadoPendiente')
const ObtenerDataTerritorio = require('./Helpers/ObtenerDataTerritorio')

controller.MetEmailPendingStatus = async ( req, res ) => {

    try{
        
        const { datos, espsDistribuidoras, response, messagge } = await MostrarEstadoPendiente.MetMostrarEstadoPendiente(req)

        if(response){
            const fechaActual = new Date()
            const diaActual = fechaActual.getDate().toString().padStart(2, '0')
            const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
            const anioActual = fechaActual.getFullYear().toString()
            const fechaFormateada = diaActual +'.'+ mesActual +'.'+ anioActual
            const nombresMeses = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ]
            const mesTexto = fechaActual.getMonth() > 0 ? fechaActual.getMonth() - 1 : 11

            const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoStatus.html')
            const from_mail_data = process.env.USER_MAIL
            const to_mail_data = process.env.TO_MAIL
            const subject_mail_success = `Distribuidores: Status ${nombresMeses[mesTexto]} 2023`
            // await espsDistribuidoras.map((dts, index) => espsDistribuidoras[index]['indice'] = index + 1)
            const filterEspsDistribuidoras = espsDistribuidoras.filter(esp => esp.espfechactualizacion == null)
            await filterEspsDistribuidoras.map((dts, index) => filterEspsDistribuidoras[index]['indice'] = index + 1)

            const data_productos_so = await ObtenerDataTerritorio.MetObtenerDataTerritorio()

            // const data_productos_so = [
            //     {
            //         "id": 1,
            //         "territorio":  "SUR 1",
            //         "nohml": "7,682",
            //         "mtd": 384.87,
            //     },
            //     {
            //         "id": 2,
            //         "territorio": "LIMA 4",
            //         "nohml": "970",
            //         "mtd": 0.00,
            //     },
            //     {
            //         "id": 3,
            //         "territorio": "NORTE 1",
            //         "nohml": "905",
            //         "mtd": 70.91,
            //     },
            //     {
            //         "id": 4,
            //         "territorio": "TRADICIONAL 2",
            //         "nohml": "2,946",
            //         "mtd": 0.00,
            //     },
            //     {
            //         "id": 5,
            //         "territorio": "TRADICIONAL 1",
            //         "nohml": "3,074",
            //         "mtd": 0.00,
            //     }
            // ]

            const data_mail = {
                data: datos,
                dataExcludeDt: datos.filter(a => a.arenombre != 'DT'),
                dtsCantidad: espsDistribuidoras.length,
                datadts: filterEspsDistribuidoras,
                datapso: data_productos_so,
                fechaActual: fechaFormateada
            }
                        
            await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
            res.status(200).json({
                response    : true,
                messagge    : 'Se envió el estatus al correo correctamente'
            })
        }else{
            res.status(500).json({
                response    : response,
                messagge    : messagge,
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            messagge    : 'Ha ocurrido un error al obtener el estado pendiente de status',
            msgdev      : err
        })
    }
}

module.exports = controller