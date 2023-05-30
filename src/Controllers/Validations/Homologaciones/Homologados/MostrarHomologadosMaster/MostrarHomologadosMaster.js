const controller = {}

const MostrarHomologadosMasterController = require('../../../../Methods/Homologaciones/Homologados/MostrarHomologadosMaster/MostrarHomologadosMaster')

controller.ValMostrarHomologadosMaster = async ( req, res ) => {
    try{
        MostrarHomologadosMasterController.MetObtenerHomologadosMaster(req, res)
    }catch(err){
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la data de no homologado', 
            msgdv       : err
        })
    }
}

module.exports = controller