const controller = {}
const DescargarMasterDistribuidorasController = require('../../../Methods/DescargarData/DescargarMasterDistribuidoras/DescargarMasterDistribuidoras')

controller.ValDescargarMasterDistribuidoras = async (req, res) => {
    const {  } = req.body;
    try{

        DescargarMasterDistribuidorasController.MetDescargarMasterDistribuidoras(req, res)

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