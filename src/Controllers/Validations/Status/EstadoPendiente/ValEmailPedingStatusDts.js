const controller = {}
const EmailPendingStatusDtsController = require('../../../Methods/Status/EstadoPendiente/EmailPendingStatusDts')

controller.ValEmailPedingStatusDts = async ( req, res ) => {

    try{

        EmailPendingStatusDtsController.MetEmailPendingStatusDts( req, res )

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