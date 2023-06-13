const controller = {}
const EliminarUsuarioController = require('../../../../Methods/Administrar/Usuarios/EliminarUsuario/EliminarUsuario')

controller.ValEliminarUsuario = async ( req, res ) => {

    try{

        EliminarUsuarioController.MetEliminarUsuario(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al eliminar al usuario'
        })
    }
}

module.exports = controller