const controller = {}
const HomologadoAutomaticoController = require('../../../../Methods/Homologaciones/NoHomologados/HomologadoAutomatico/HomologadoAutomatico')

controller.ValHomologadoAutomaticoController = async ( req, res ) => {

    try{

        await HomologadoAutomaticoController.MetHomologadoAutomatico(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : "Ha ocurrido un error al homologar los productos"
        })
    }
}

module.exports = controller