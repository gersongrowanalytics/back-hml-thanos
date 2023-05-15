const controller = {}
const RegistrarHomologacionController = require('../../../../Methods/Homologaciones/NoHomologados/RegistrarHomologacion/RegistrarHomologacion')

controller.ValRegistrarHomologacion = async (req, res) => {

    const {  } = req.body;

    try{

        RegistrarHomologacionController.MetRegistrarHomologacion(req, res)

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