const { S3Client } = require('@aws-sdk/client-s3')
const configCredentials = require('./config')

const client = new S3Client({
    region : configCredentials.AWS_DEFAULT_REGION,
    credentials : {
        accessKeyId: configCredentials.AWS_ACCESS_KEY_ID,
        secretAccessKey: configCredentials.AWS_SECRET_ACCESS_KEY
    }
})

module.exports = client