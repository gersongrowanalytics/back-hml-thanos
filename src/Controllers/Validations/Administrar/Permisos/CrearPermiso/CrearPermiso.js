const controller = {}
const CrearPermisoController = require('../../../../Methods/Administrar/Permisos/CrearPermiso/CrearPermiso')

controller.ValCrearPermiso = async ( req, res ) => {

    try{

        CrearPermisoController.MetCrearPermiso(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al crear el permiso'
        })
    }
}

module.exports = controller