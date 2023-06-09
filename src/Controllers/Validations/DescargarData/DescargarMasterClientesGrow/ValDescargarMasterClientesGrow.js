const controller = {}
const DescargarMasterClientesGrowController = require('../../../Methods/DescargarData/DescargarMasterClientesGrow/DescargarMasterClientesGrow')

controller.ValDescargarMasterClientesGrow = async (req, res) => {
    const {  } = req.body;
    try{

        DescargarMasterClientesGrowController.MetDescargarMasterClientesGrow(req, res)

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