const controller = {}

const ActualizarHomologacionController = require('../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/ActualizarHomologacion')

controller.ValActualizarHomologacion = async ( req, res ) => {

    try{
        
        ActualizarHomologacionController.MetActualizarHomologacion( req, res )

    }catch(err){
        res.status(500).json({
            message     : 'Ha ocurrido un error al actualizar la homologación',
            response    : false,
            devmsg      : err
        })    
    }
}

module.exports = controller