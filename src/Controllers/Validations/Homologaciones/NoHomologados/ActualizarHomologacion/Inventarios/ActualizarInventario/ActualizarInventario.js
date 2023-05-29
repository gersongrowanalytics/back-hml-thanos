const controller = {}
const ActualizarInventarioController = require('../../../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/ActualizarInventario/ActualizarInventario')

controller.ValActualizarInventario = async ( req, res ) => {

    try{
        
        ActualizarInventarioController.MetActualizarInventario( req, res )

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : true,
            messagge    : 'Ha ocurrido un error al actualizar el inventario',
            msgdev      : err
        })
    }

}

module.exports = controller