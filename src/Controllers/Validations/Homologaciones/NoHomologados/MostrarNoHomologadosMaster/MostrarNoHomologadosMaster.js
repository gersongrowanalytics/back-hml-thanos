const controller = {}

const MostrarNoHomologadosMasterController = require('../../../../Methods/Homologaciones/NoHomologados/MostrarNoHomologadosMaster/MostrarNoHomologadosMaster')

controller.ValMostrarNoHomologadosMaster = async ( req, res ) => {
    try{

        MostrarNoHomologadosMasterController.MetObtenerNoHomologadosMaster(req, res)

    }catch(err){
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la data de no homologado', 
            msgdv       : err
        })
    }
}

module.exports = controller