const controller = {}
const DescargarMasterProductosGrowController = require('../../../Methods/DescargarData/DescargarMasterProductosGrow/DescargarMasterProductosGrow')

controller.ValDescargarMasterProductosGrow = async (req, res) => {
    const {  } = req.body;
    try{

        DescargarMasterProductosGrowController.MetDescargarMasterProductosGrow(req, res)

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