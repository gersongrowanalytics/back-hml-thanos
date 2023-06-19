const controller = {}
const ShowAuditsController = require('../../../Methods/Audits/ShowAudits/ShowAudits')

controller.ValShowAudits = async ( req, res ) => {

    try{

        ShowAuditsController.MetShowAudits(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar las auditorias'
        })
    }
}

module.exports = controller