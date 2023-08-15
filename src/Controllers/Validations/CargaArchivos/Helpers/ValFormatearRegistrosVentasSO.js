const controller = {}
const FormatearRegistrosVentasSOController = require('../../../../Controllers/Methods/CargaArchivos/Helpers/FormatearRegistrosVentasSO')

controller.ValFormatearRegistrosVentasSO = async (req, res) => {

    const {  } = req.body;

    try{

        FormatearRegistrosVentasSOController.MetFormatearRegistrosVentasSO(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de formatear los registros',
            devmsg  : error
        })
    }
    
}

module.exports = controller