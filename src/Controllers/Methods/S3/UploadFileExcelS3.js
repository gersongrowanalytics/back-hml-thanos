controller = {}
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const configCredentials = require('../../../../config')
const client = require('../../../../s3')

controller.UploadFileExcelS3 = async (filePath, file, lengthSize) => {
    try {
        const uploadParams = {
            Bucket : configCredentials.AWS_BUCKET,
            Key: filePath,
            Body: file,
            ContentLength: lengthSize,
            ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    
        const comand = new PutObjectCommand(uploadParams)
        await client.send(comand)
    } catch (error) {
        console.error("errors3: ", error);
    }
}

module.exports = controller