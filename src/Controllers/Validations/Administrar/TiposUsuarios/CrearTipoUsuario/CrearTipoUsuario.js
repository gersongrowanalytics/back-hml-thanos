const controller = {}
const CrearTipoUsuarioController = require('../../../../Methods/Administrar/TiposUsuarios/CrearTipoUsuario/CrearTipoUsuario')

controller.ValCrearTipoUsuario = async ( req, res ) => {

    try{

        CrearTipoUsuarioController.MetCrearTipoUsuario(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al crear al tipo de usuario'
        })
    }
}

module.exports = controller