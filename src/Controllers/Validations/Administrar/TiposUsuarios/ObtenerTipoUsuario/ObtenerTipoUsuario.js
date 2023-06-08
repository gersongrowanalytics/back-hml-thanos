const controller = {}
const ObtenerTipoUsuarioController = require('../../../../Methods/Administrar/TiposUsuarios/ObtenerTipoUsuario/ObtenerTipoUsuario')

controller.ValObtenerTipousuario = async ( req, res ) => {

    try{

        ObtenerTipoUsuarioController.MetObtenerTipousuario(req, res)
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los tipos de usuarios'
        })
    }
}

module.exports = controller