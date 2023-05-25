const controller = {}

const InfoInventariosController = require('../../../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/InfoInventarios/InfoInventarios')

controller.ValInfoInventarios = async ( req, res ) => {

    try{

        InfoInventariosController.MetInfoInventarios(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la información de inventarios',
            msgdev      : err
        })
    }
}

module.exports = controller