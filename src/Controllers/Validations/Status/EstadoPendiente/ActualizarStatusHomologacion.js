const controller = {}
const ActualizarStatusHomologacionController = require('../../../Methods/Status/EstadoPendiente/ActualizarStatusHomologacion')

controller.ValActualizarStatusHomologacion = async ( req, res ) => {


    try{

        ActualizarStatusHomologacionController.MetActualizarStatusHomologacion(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            messagge : 'Ha ocurrido un error al actualizar el status',
            response : false
        })
    }
}

module.exports = controller