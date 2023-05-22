
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const configCredentials = require('../../../../config')
const client = require('../../../../s3')

controller = {}

controller.GetFileS3 = async ( file ) => {
    const command = new GetObjectCommand({
        Bucket  : configCredentials.AWS_BUCKET,
        Key     : file
    })

    let data =  []
    let error = false
    let info_error = false
    try{
        data =  await client.send(command)
    }catch(e){
        console.log(e);
        error = true
        info_error = e
    }

    return {
        error,
        data,
        info_error
    }
}

module.exports = controller