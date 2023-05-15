const controller = {}
const EditarDistribuidoraController = require('../../../../Methods/Administracion/Distribuidoras/EditarDistribuidora/EditarDistribuidora')

controller.ValEditarDistribuidora = async (req, res) => {

    const {  } = req.body;

    try{

        EditarDistribuidoraController.MetEditarDistribuidora(req, res)

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