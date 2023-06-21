const controller = {}
const DescargarInventariosController = require('../../../Methods/DescargarData/DescargarInventarios/DescargarInventarios')

controller.ValDescargarInventarios = async (req, res) => {

    const {  } = req.body;

    try{

        DescargarInventariosController.MetDescargarInventarios(req, res);

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de descargar los inventarios',
            devmsg  : error
        })
    }
}

module.exports = controller