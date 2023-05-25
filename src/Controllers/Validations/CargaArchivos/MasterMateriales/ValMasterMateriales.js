const controller = {}
const MasterDTController = require('../../../Methods/CargaArchivos/MasterMateriales/MasterMateriales')

controller.ValMasterMateriales = async (req, res) => {

    const {  } = req.body;

    
    try{

        MasterDTController.MetMasterMateriales(req, res)

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