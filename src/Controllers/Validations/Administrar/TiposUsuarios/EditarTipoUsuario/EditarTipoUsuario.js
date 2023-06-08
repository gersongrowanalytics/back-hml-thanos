const controller = {}
const EditarTipoUsuarioController = require('../../../../Methods/Administrar/TiposUsuarios/EditarTipoUsuario/EditarTipoUsuario')

controller.ValEditarTipoUsuario = async ( req, res ) => {

    try{

        EditarTipoUsuarioController.MetEditarTipoUsuario(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al editar al tipo de usuario'
        })
    }
}

module.exports = controller