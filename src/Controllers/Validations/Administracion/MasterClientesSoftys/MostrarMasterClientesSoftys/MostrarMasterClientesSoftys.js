const controller = {}
const MostrarMaestraClientesSoftysController = require('../../../../Methods/Administracion/MasterClientesSoftys/MostrarMasterClientesSoftys/MostrarMasterClientesSoftys')

controller.ValMostrarMasterClientesSoftys = async ( req, res ) => {
    
    try{

        MostrarMaestraClientesSoftysController.MetMostrarMasterClientesSoftys(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la maestra de clientes'
        })
    }
}

module.exports = controller