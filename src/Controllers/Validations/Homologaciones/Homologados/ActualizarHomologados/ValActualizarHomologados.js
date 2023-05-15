const controller = {}
const ActualizarHomologadosController = require('../../../../Methods/Homologaciones/Homologados/ActualizarHomologados/ActualizarHomologados')

controller.ValActualizarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        ActualizarHomologadosController.MetActualizarHomologados(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
            devmsg  : error
        })
    }



    
}


module.exports = controller