const controller = {}
const MostrarHomologadosController = require('../../../../Methods/Homologaciones/Homologados/MostrarHomologados/MostrarHomologados')

controller.ValMostrarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        MostrarHomologadosController.MetMostrarHomologados(req, res)

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