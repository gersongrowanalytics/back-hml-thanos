const controller = {}
ObtenerInfoMasterPreciosController = require('../../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/MasterPrecios/InfoMasterPrecios')

controller.ValObtenerInfoMasterPrecios = async (req, res) => {

    try{

        ObtenerInfoMasterPreciosController.MetInfoMasterPrecios(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al obtener la información de la maestra de precios',
        })
    }   
}


module.exports = controller