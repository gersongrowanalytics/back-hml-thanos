const controller = {}
const ShowDateController = require('../../../Methods/Date/ShowDate/ShowDate')

controller.ValShowDate = async ( req, res ) => {

    try{

        ShowDateController.MetShowDate(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar las auditorias'
        })
    }
}

module.exports = controller