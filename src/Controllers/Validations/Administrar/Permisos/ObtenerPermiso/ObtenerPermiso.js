const controller = {}
const ObtenerPermisoController = require('../../../../Methods/Administrar/Permisos/ObtenerPermiso/ObtenerPermiso')

controller.ValObtenerPermiso = async ( req, res ) => {

    try{
    
        ObtenerPermisoController.MetObtenerPermiso(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener el permiso'
        })
    }
}

module.exports = controller