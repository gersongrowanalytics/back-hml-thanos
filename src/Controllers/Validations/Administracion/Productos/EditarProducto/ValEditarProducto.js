const controller = {}
const EditarProductoController = require('../../../../Methods/Administracion/Productos/EditarProducto/EditarProducto')

controller.ValEditarProducto = async (req, res) => {

    const {  } = req.body;

    try{

        EditarProductoController.MetEditarProducto(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }

}


module.exports = controller