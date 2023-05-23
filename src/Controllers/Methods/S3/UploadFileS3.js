controller = {}
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const configCredentials = require('../../../../config')
const client = require('../../../../s3')

controller.UploadFileS3 = async ( file, filePath) => {
    try {
        const uploadParams = {
            Bucket : configCredentials.AWS_BUCKET,
            Key: filePath,
            Body: file
        }
    
        const comand = new PutObjectCommand(uploadParams)
        await client.send(comand)
    } catch (error) {
        console.error("errors3: ", error);
    }
}

module.exports = controller