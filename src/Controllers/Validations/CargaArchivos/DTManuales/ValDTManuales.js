const controller = {}
const DTManualesController = require('../../../Methods/CargaArchivos/DTManuales/DTManuales')

controller.ValDTManuales = async (req, res) => {

    const {  } = req.body;

    try{

        DTManualesController.MetDTManuales(req, res)

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