const controller = {}
const ObtenerInfoSIController = require('../../../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/SI/InfoSI/InfoSI')

controller.ValObtenerInfoSI = async (req, res) => {

    try{

        ObtenerInfoSIController.MetObtenerInfoSI(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al obtener la información de SI',
        })
    }   
}


module.exports = controller