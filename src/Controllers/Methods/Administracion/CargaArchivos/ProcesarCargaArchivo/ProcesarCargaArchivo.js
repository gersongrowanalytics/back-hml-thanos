const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetProcesarCargaArchivo = async (req, res) => {

    const {
        req_carid
    } = req.body;

    try{

        await prisma.carcargasarchivos.update({
            where : {
                carid : req_carid
            },
            data : {
                carfechaprocesado : new Date()
            }
        })

        res.status(200).json({
            message: 'Archivo procesado correctamente',
            response: true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de procesar el archivo',
            devmsg  : error
        })
    }    
}

module.exports = controller