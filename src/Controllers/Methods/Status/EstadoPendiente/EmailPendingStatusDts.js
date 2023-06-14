const controller = {}
const SendMail = require('../../Reprocesos/SendMail')
const path = require('path')
const MostrarEstadoPendiente = require('./MostrarEstadoPendiente')

controller.MetEmailPendingStatusDts = async ( req, res ) => {

    try{
        
        const { espsDistribuidoras, response, messagge } = await MostrarEstadoPendiente.MetMostrarEstadoPendiente(req)

        if(response){
            const from_mail_data = process.env.USER_MAIL
            const to_mail_data = process.env.TO_MAIL

            const fechaActual = new Date()
            const diaActual = fechaActual.getDate().toString().padStart(2, '0')
            const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
            const anioActual = fechaActual.getFullYear().toString()
            const fechaFormateada = diaActual + mesActual + anioActual

            const success_mail_html_dts = path.resolve(__dirname, '../../Mails/CorreoDts.html')
            const subject_mail_success_dts = "Status DTS"
            await espsDistribuidoras.map((dts, index) => espsDistribuidoras[index]['indice'] = index + 1)
            const data_mail_dts = {
                data: espsDistribuidoras,
                fechaActual: fechaFormateada
            }

            await SendMail.MetSendMail(success_mail_html_dts, from_mail_data, to_mail_data, subject_mail_success_dts, data_mail_dts)

            res.status(200).json({
                response    : response,
                messagge    : 'Se envió el estatus al correo correctamente',
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