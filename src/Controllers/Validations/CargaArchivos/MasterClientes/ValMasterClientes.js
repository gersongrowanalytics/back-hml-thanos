const controller = {}
const MasterClientesController = require('../../../Methods/CargaArchivos/MasterClientes/MasterClientes')

controller.ValMasterClientes = async (req, res) => {

    const {  } = req.body;

    try{

        MasterClientesController.MetMasterClientes(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
            devmsg  : error
        })
    }



    
}


module.exports = controller