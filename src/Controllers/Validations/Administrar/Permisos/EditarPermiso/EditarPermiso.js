const controller = {}
const EditarPermisoController = require('../../../../Methods/Administrar/Permisos/EditarPermiso/EditarPermiso')

controller.ValEditarPermiso = async ( req, res ) => {

    try{

        EditarPermisoController.MetEditarPermiso(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al editar el permiso'
        })
    }

}

module.exports = controller