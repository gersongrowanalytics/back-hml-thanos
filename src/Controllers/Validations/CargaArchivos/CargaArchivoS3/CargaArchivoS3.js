const controller = {}
const CargaArchivoS3Controller = require('../../../Methods/CargaArchivos/CargaArchivoS3/CargaArchivoS3')

controller.ValCargaArchivoS3 = async ( req, res ) => {

    try{

        CargaArchivoS3Controller.MetCargaArchivoS3(req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar el archivo'
        })
    }
}

module.exports = controller