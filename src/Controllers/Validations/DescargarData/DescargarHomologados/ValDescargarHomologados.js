const controller = {}
const DescargarHomologadosController = require('../../../Methods/DescargarData/DescargarHomologados/DescargarHomologados')

controller.ValDescargarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        DescargarHomologadosController.MetDescargarHomologados(req, res);

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de descargar los homologados',
            devmsg  : error
        })
    }



    
}


module.exports = controller