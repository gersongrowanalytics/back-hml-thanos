const controller = {}
const EliminarPermisoController = require('../../../../Methods/Administrar/Permisos/EliminarPermiso/EliminarPermiso')

controller.ValEliminarPermiso = async ( req, res ) => {

    try{

        EliminarPermisoController.MetEliminarPermiso(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al eliminar el permiso'
        })
    }

}

module.exports = controller