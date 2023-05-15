const controller = {}
const CrearProductoController = require('../../../../Methods/Administracion/Productos/CrearProducto/CrearProducto')

controller.ValCrearProducto = async (req, res) => {

    const {  } = req.body;

    try{

        CrearProductoController.MetCrearProducto(req, res)

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