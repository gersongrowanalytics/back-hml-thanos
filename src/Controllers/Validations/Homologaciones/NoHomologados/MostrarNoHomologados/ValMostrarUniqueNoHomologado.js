const controller = {}
const MostrarUniqueNoHomologadoController = require('../../../../Methods/Homologaciones/NoHomologados/MostrarNoHomologados/MostrarUniqueNoHomologado')

controller.ValMostrarUniqueNoHomologado = async (req, res) => {

    const {  } = req.body;

    try{
        MostrarUniqueNoHomologadoController.MetMostrarUniqueNoHomologados(req, res)
    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de mostrar el producto no homologado',
            devmsg  : error
        })
    }
}


module.exports = controller