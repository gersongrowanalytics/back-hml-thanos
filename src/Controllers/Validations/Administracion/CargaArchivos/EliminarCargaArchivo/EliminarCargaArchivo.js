const controller = {}
const EliminarCargaArchivosController = require('../../../../Methods/Administracion/CargaArchivos/EliminarCargaArchivo/EliminarCargaArchivo')

controller.ValEliminarCargaArchivo = async (req, res) => {

    const {  } = req.body;

    try{

        EliminarCargaArchivosController.MetEliminarCargaArchivo(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message     : 'Lo sentimos hubo un error al momento de obtener la carga de archivos',
            devmsg      : error,
            response    : false
        })
    }    
}


module.exports = controller