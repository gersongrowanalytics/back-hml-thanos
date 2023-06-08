const controller = {}
const ObtenerTiposUsuariosController = require('../../../../Methods/Administrar/TiposUsuarios/ObtenerTiposUsuarios/ObtenerTiposUsuarios')

controller.ValObtenerTiposusuarios = async ( req, res ) => {

    try{

        ObtenerTiposUsuariosController.MetObtenerTiposusuarios(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los tipos de usuarios'
        })
    }
}

module.exports = controller