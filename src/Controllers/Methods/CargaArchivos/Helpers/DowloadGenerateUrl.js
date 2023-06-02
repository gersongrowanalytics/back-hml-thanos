const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDownloadGenerateUrl = async (req, res) => {
    const {
        token
    } = req.query

    try{

        const car = await prisma.carcargasarchivos.findFirst({
            where: {
                cartoken : token
            },
            select: {
                carid: true,
                carnombre: true,
                cararchivo: true,
            }
        })
        const url = await GenerateUrl.GenerateUrlS3(car.cararchivo)

        res.redirect(url)
    }catch(error){
        // console.log(error);
        // res.status(500)
        // res.json({
        //     message : 'Error al descargar el excel.',
        //     devmsg  : error
        // })
    }
}

module.exports = controller