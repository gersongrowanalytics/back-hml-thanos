const controller = {}
const MostrarMasterProductosGrowController = require('../../../../Methods/Administracion/MasterProductosGrow/MostrarMasterProductosGrow/MostrarMasterProductosGrow')

controller.ValMostrarMasterProductosGrow = async ( req, res ) => {
    try{

        MostrarMasterProductosGrowController.MetMostrarMasterProductosGrowController(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la maestra de productos'
        })
    }
}

module.exports = controller