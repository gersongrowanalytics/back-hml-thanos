const controller = {}
const MostrarDistribuidorasController = require('../../../../Methods/Administracion/Distribuidoras/MostrarDistribuidoras/MostrarDistribuidoras')

controller.ValMostrarDistribuidoras = async (req, res) => {

    const {  } = req.body;

    try{

        MostrarDistribuidorasController.MetMostrarDistribuidoras(req, res)

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