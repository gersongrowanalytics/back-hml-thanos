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
            // const to_mail_data = process.env.TO_MAIL
            const to_mail_data = ["gerson.vilca@grow-analytics.com.pe", "Jazmin.Laguna@grow-analytics.com.pe", "miguel.caballero@grow-analytics.com.pe"]
            const subject_mail_success = `Distribuidores: Status ${nombresMeses[mesTexto]} 2023`
            // await espsDistribuidoras.map((dts, index) => espsDistribuidoras[index]['indice'] = index + 1)
            const filterEspsDistribuidoras = espsDistribuidoras.filter(esp => esp.espfechactualizacion == null)
            await filterEspsDistribuidoras.map((dts, index) => filterEspsDistribuidoras[index]['indice'] = index + 1)

            const data_productos_so = await ObtenerDataTerritorio.MetObtenerDataTerritorio()

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