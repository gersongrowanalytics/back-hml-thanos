const { DeleteObjectsCommand, ListObjectsCommand } = require("@aws-sdk/client-s3")
const client = require("../../../../s3")
const configCredentials = require('../../../../config')

const controller = {}

controller.RemoveFileS3 = async (req, res=null) => {
    
    const {
        re_ubicacion_s3
    } = req.body

    let status = 200
    let mensaje = ""
    try {
        const params = {
            Bucket: configCredentials.AWS_BUCKET,
            Prefix: re_ubicacion_s3,
        };
    
        const data = await client.send(new ListObjectsCommand(params));

        if(data.Contents){
            const objetos = data.Contents.map((objeto) => ({
                Key: objeto.Key,
            }));
        
            if (objetos.length > 0) {
                const deleteParams = {
                    Bucket: configCredentials.AWS_BUCKET,
                    Delete: {
                        Objects: objetos,
                    },
                };
            
                await client.send(new DeleteObjectsCommand(deleteParams));
            }
            mensaje = "Archivos eliminados exitosamente"
        }else{
            mensaje = "No hay archivos en la carpeta"
        }

        console.log(mensaje);
    
    } catch (error) {
        console.log(error)
        mensaje = "Error al eliminar archivos de S3"
        status = 500
    }

    if(res){
        res.status(status)
        res.json({
            status,
            mensaje
        })
    }else{
        return true
    }
}

module.exports = controller