const controller = {}
const ProcesarCargaArchivoController = require('../../../../Methods/Administracion/CargaArchivos/ProcesarCargaArchivo/ProcesarCargaArchivo')

controller.ValProcesarCargaArchivo = async (req, res) => {

    try{

        ProcesarCargaArchivoController.MetProcesarCargaArchivo(req, res)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message     : 'Lo sentimos hubo un error al momento de procesar la carga de archivos',
            devmsg      : error,
            response    : false
        })
    }    
}


module.exports = controller