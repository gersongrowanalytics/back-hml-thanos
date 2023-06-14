const controller = {}
const moment = require('moment')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const SendMail = require('../../Reprocesos/SendMail')
const path = require('path')
const MostrarEstadoPendiente = require('./MostrarEstadoPendiente')

controller.MetEmailPendingStatus = async ( req, res ) => {

    try{
        
        const { datos, espsDistribuidoras, response, messagge } = await MostrarEstadoPendiente.MetMostrarEstadoPendiente(req)

        if(response){
            const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoStatus.html')
            const from_mail_data = process.env.USER_MAIL
            const to_mail_data = process.env.TO_MAIL
            const subject_mail_success = "Status"

            const fechaActual = new Date()
            const diaActual = fechaActual.getDate().toString().padStart(2, '0')
            const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
            const anioActual = fechaActual.getFullYear().toString()
            const fechaFormateada = diaActual + mesActual + anioActual
            const data_mail = {
                data: datos,
                dataExcludeDt: datos.filter(a => a.arenombre != 'DT'),
                dtsCantidad: espsDistribuidoras.length,
                fechaActual: fechaFormateada
            }
            
            await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
            res.status(200).json({
                response    : true,
                messagge    : 'Se envió el estatus dts al correo correctamente',
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