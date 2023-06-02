const controller = {}
const DowloadGenerateUrlController = require('../../../../Controllers/Methods/CargaArchivos/Helpers/DowloadGenerateUrl')

controller.ValDowloadGenerateUrl = async (req, res) => {

    const {  } = req.body;

    try{

        DowloadGenerateUrlController.MetDownloadGenerateUrl(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
    
}

module.exports = controller