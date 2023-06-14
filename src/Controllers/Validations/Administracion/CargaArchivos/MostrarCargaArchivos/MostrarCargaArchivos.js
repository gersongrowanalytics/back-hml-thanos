const controller = {}
const MostrarCargaArchivosController = require('../../../../Methods/Administracion/CargaArchivos/MostrarCargaArchivos/MostrarCargaArchivos')

controller.ValMostrarCargaArchivos = async (req, res) => {

    const {  } = req.body;

    try{

        MostrarCargaArchivosController.MetMostrarCargaArchivos(req, res)

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