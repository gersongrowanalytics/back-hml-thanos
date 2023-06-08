const controller = {}
const ObtenerPermisosController = require('../../../../Methods/Administrar/Permisos/ObtenerPermisos/ObtenerPermisos')

controller.ValObtenerPermisos = async ( req, res ) => {

    try{

        ObtenerPermisosController.MetObtenerPermisos(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener los permisos'
        })
    }
}

module.exports = controller