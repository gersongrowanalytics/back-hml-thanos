const controller = {}
const DescargarNoHomologadosController = require('../../../Methods/DescargarData/DescargarNoHomologados/DescargarNoHomologados')

controller.ValDescargarNoHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        DescargarNoHomologadosController.MetDescargarNoHomologados(req, res);

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de descargar los no homologados',
            devmsg  : error
        })
    }
}


module.exports = controller