const controller = {}
const MostrarNoHomologadosController = require('../../../../Methods/Homologaciones/NoHomologados/MostrarNoHomologados/MostrarNoHomologados')

controller.ValMostrarNoHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        MostrarNoHomologadosController.MetMostrarNoHomologados(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de mostrar los productos no homologados',
            devmsg  : error
        })
    }



    
}


module.exports = controller