const controller = {}
const EditarUsuarioController = require('../../../../Methods/Administrar/Usuarios/EditarUsuario/EditarUsuario')

controller.ValEditarUsuario = async ( req, res ) => {

    try{

        EditarUsuarioController.MetEditarUsuario(req, res)
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al editar al usuario'
        })
    }
}

module.exports = controller