const controller = {}
const EliminarTipoUsuarioController = require('../../../../Methods/Administrar/TiposUsuarios/EliminarTipoUsuario/EliminarTipoUsuario')

controller.ValEliminarTipoUsuario = async ( req, res ) => {
    try{

        EliminarTipoUsuarioController.MetEliminarTipoUsuario(req, res)
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al eliminar al tipo de usuario'
        })
    }
}

module.exports = controller