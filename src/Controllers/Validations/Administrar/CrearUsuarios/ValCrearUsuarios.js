const controller = {}
const CrearUsuarios = require('../../../Methods/Administrar/CrearUsuarios/CrearUsuarios')

controller.ValCrearUsuarios = async (req, res) => {

    const {  } = req.body;

    try{
        CrearUsuarios.MetCrearUsuarios(req, res)
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