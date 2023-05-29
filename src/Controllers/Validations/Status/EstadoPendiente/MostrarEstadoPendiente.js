const controller = {}
const MostrarEstadoPendienteController = require('../../../Methods/Status/EstadoPendiente/MostrarEstadoPendiente')

controller.ValMostrarEstadoPendiente = async ( req, res ) => {

    try{

        MostrarEstadoPendienteController.MetMostrarEstadoPendiente( req, res )

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