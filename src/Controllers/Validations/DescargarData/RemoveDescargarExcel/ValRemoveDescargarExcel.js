const controller = {}
const RemoveDescargarExcelController = require('../../../Methods/DescargarData/RemoveDescargarExcel/RemoveDescargarExcel')

controller.ValRemoveDescargarExcel = async (req, res) => {
    const {  } = req.body;
    try{

        RemoveDescargarExcelController.MetRemoveDescargarExcel(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al de elminiar el archivo',
            devmsg  : error
        })
    }
}

module.exports = controller