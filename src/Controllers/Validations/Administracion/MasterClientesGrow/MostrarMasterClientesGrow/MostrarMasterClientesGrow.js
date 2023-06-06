const controller = {}
const MostrarMasterClientesGrowController = require('../../../../Methods/Administracion/MasterClientesGrow/MostrarMasterClientesGrow/MostrarMasterClientesGrow')

controller.ValMostrarMasterClientesGrow = async ( req, res ) => {
    try{

        MostrarMasterClientesGrowController.MetMostrarMasterClientesGrow(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la maestra de productos'
        })
    }
}
module.exports = controller