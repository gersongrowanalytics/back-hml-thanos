const controller = {}
const MostrarProductosController = require('../../../../Methods/Homologaciones/Helpers/MostrarProductos/MostrarProductos')

controller.ValMostrarProductos = async (req, res) => {

    const {  } = req.body;

    try{

        MostrarProductosController.MetMostrarProductos(req, res)

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