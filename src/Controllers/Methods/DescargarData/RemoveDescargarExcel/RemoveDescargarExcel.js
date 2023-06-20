const controller = {}
const RemoveFileS3 = require('../../S3/RemoveFileS3')

controller.MetRemoveDescargarExcel = async (req, res) => {

    const { 
        re_url
    } = req.body

    try{
        const url = {
            "products-so": "hmlthanos/pe/tradicional/archivosgenerados/ventas/",
            "products-approveds": "hmlthanos/pe/tradicional/archivosgenerados/homologaciones/",
            "master-clients": "hmlthanos/pe/tradicional/archivosgenerados/masterclientesgrow/",
            "master-prducts": "hmlthanos/pe/tradicional/archivosgenerados/masterproductosgrow/"
        }

        let reqUbi = {
            body: {
                re_ubicacion_s3: url[re_url]
            }
        }

        await RemoveFileS3.RemoveFileS3(reqUbi)

        res.status(200).json({
            message : 'Se elimino correctamente el archivo.',
            respuesta : true,
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message : 'Lo sentimos hubo un error al momento de elminar el archivo',
            devmsg  : error,
            respuesta : false
        })
    }
}

module.exports = controller