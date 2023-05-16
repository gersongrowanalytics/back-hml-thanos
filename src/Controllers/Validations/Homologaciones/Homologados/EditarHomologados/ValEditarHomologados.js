const controller = {}
const EditarHomologadosController = require('../../../../Methods/Homologaciones/Homologados/EditarHomologados/EditarHomologados')

controller.ValEditarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        EditarHomologadosController.MetEditarHomologados(req, res)

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