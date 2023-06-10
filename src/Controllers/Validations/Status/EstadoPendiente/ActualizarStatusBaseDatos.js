const controller = {}
const ActualizarStatusBaseDatosController = require('../../../Methods/Status/EstadoPendiente/ActualizarStatusBaseDatos')

controller.ValActualizarStatusBaseDatos = async ( req, res ) => {

    try{

        ActualizarStatusBaseDatosController.MetActualizarStatusBaseDatos( req, res )

    }catch(err){
        console.log(err)
        res.status(200).json({
            response    : false,
            message     : 'Ha ocurrido un error al actualizar el status'
        })
    }
}

module.exports = controller