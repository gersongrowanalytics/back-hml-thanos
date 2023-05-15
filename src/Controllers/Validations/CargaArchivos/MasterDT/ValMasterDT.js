const controller = {}
const MasterDTController = require('../../../Methods/CargaArchivos/MasterDT/MasterDT')

controller.ValMasterDT = async (req, res) => {

    const {  } = req.body;

    try{

        MasterDTController.MetMasterDT(req, res)

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