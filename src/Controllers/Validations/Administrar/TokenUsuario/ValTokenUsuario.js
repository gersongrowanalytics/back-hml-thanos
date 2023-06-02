const controller = {}
const TokenUsuarioController = require('../../../Methods/Administrar/TokenUsuario/TokenUsuario')

controller.ValTokenUsuario = async (req, res) => {

    const {  } = req.body;

    try{
        await TokenUsuarioController.MetTokenUsuario(req, res)
    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
            devmsg  : error
        })
    }
}

module.exports = controller