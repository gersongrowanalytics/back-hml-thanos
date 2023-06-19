const controller = {}
const CreateAuditsController = require('../../../Methods/Audits/CreateAudits/CreateAudits')

controller.ValCreateAudits = async ( req, res ) => {

    try{

        CreateAuditsController.MetCreateAudits(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar el archivo'
        })
    }
}

module.exports = controller