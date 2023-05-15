const controller = {}
const CrearDistribuidoraController = require('../../../../Methods/Administracion/Distribuidoras/CrearDistribuidora/CrearDistribuidora')

controller.ValCrearDistribuidora = async (req, res) => {

    const {  } = req.body;

    try{

        CrearDistribuidoraController.MetCrearDistribuidora(req, res)

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