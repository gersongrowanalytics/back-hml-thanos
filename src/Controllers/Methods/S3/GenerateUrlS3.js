
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const configCredentials = require('../../../../config')
const client = require('../../../../s3')

controller = {}

controller.GenerateUrlS3 = async ( ubicacion_s3 ) => {
    const command = new GetObjectCommand({
        Bucket  : configCredentials.AWS_BUCKET,
        Key     : ubicacion_s3
    })

    let url
    try{
        url = await getSignedUrl(client, command, { expiresIn: 3600 })
    }catch(e){
        console.log(e)
    }

    return url
}

module.exports = controller