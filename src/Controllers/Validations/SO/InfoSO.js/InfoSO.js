const controller = {}
const ObtenerInfoSOController = require('../../../Methods/SO/InfoSO/InfoSO')

controller.ValObtenerInfoSO = async (req, res) => {

    try{

        ObtenerInfoSOController.MetObtenerInfoSO(req,res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al obtener la información de SO',
        })
    }   
}


module.exports = controller