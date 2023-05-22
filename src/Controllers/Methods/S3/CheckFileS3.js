controller = {}
const { HeadObjectCommand } = require('@aws-sdk/client-s3')
const configCredentials = require('../../../../config')
const client = require('../../../../s3')

controller.CheckFileS3 = async (filePath) => {
    const params = {
        Bucket: configCredentials.AWS_BUCKET,
        Key: filePath,
    }

    let respuesta = true
    try {
        const comand = new HeadObjectCommand(params)
        await client.send(comand)
        console.log(comand);
    } catch (error) {
        console.log("No existe el archivo")
        respuesta = false
    }

    return respuesta
}

module.exports = controller