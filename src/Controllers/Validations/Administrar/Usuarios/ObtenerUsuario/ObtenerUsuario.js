const controller = {}
const ObtenerUsuarioController = require('../../../../Methods/Administrar/Usuarios/ObtenerUsuario/ObtenerUsuario')

controller.ValObtenerUsuario = async (req, res ) => {

    try{

        ObtenerUsuarioController.MetObtenerUsuario(req, res)

    }catch(err){
        console.log(err)
        res.status(200).json({
            response    : true,
            message     : 'Ha ocurrido un error al obtener al usuario' 
        })
    }
}

module.exports = controller