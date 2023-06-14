const controller = {}
const EmailPendingStatusController = require('../../../Methods/Status/EstadoPendiente/EmailPendingStatus')

controller.ValEmailPedingStatus = async ( req, res ) => {

    try{

        EmailPendingStatusController.MetEmailPendingStatus( req, res )

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