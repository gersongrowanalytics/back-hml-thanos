const controller = {}
const ObtenerPaquetexBultoProductoController = require('../../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/PaquetexBultoProducto/PaquetexBultoProducto')

controller.ValObtenerPaquetexBultoProduto = async ( req, res ) => {
    try{

        ObtenerPaquetexBultoProductoController.MetObtenerPaquetexBultoProducto(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la información del producto',
            msgdev      : err
        })
    }
}

module.exports = controller