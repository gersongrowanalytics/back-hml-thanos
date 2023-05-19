const controller = {}
const DescargarMasterProductosSoController = require('../../../Methods/DescargarData/DescargarMasterProductosSo/DescargarMasterProductosSo')

controller.ValDescargarMasterProductosSo = async (req, res) => {
    const {  } = req.body;
    try{

        DescargarMasterProductosSoController.MetDescargarMasterProductosSo(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de descargar',
            devmsg  : error
        })
    }
}

module.exports = controller