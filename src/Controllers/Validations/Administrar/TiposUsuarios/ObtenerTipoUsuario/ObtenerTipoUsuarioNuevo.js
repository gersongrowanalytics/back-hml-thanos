const controller = {}
const ObtenerTipoUsuarioNuevoController = require('../../../../Methods/Administrar/TiposUsuarios/ObtenerTipoUsuario/ObtenerTipoUsuarioNuevo')

controller.ValObtenerTipousuarioNuevo = async ( req, res ) => {

    try{

        ObtenerTipoUsuarioNuevoController.MetObtenerTipousuarioNuevo(req, res)
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los tipos de usuarios'
        })
    }
}

module.exports = controller