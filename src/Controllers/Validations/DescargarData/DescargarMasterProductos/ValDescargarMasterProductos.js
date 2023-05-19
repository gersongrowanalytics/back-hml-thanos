const controller = {}
const DescargarMasterProductosController = require('../../../Methods/DescargarData/DescargarMasterProductos/DescargarMasterProductos')

controller.ValDescargarMasterProductos = async (req, res) => {
    const {  } = req.body;
    try{

        DescargarMasterProductosController.MetDescargarMasterProductos(req, res)

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