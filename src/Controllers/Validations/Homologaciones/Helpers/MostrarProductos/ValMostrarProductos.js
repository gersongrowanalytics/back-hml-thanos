const controller = {}
const MostrarProductosController        = require('../../../../Methods/Homologaciones/Helpers/MostrarProductos/MostrarProductos')
const MostrarProductosGrowController    = require('../../../../Methods/Homologaciones/Helpers/MostrarProductosGrow/MostrarProductosGrow')

controller.ValMostrarProductos = async (req, res) => {

    const {  
        req_mp_grow
    } = req.body;

    try{

        if(req_mp_grow){
            MostrarProductosGrowController.MetMostrarProductosGrow(req, res)
        }else{
            MostrarProductosController.MetMostrarProductos(req, res)
        }

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
    
}

module.exports = controller