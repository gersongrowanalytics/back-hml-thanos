const controller = {}
const CrearAmbienteStatusController = require('../../../Methods/Status/CrearAmbienteStatus/CrearAmbienteStatus')

controller.ValCrearAmbienteStatus = async ( req, res ) => {

    try{

        CrearAmbienteStatusController.MetCrearAmbienteStatus( req, res )

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al crear el ambiente para status' 
        })
    }

}

module.exports = controller