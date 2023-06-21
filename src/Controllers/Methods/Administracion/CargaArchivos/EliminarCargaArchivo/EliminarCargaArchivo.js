const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEliminarCargaArchivo = async (req, res) => {

    const {
        req_carid
    } = req.body;

    try{
        
        await prisma.carcargasarchivos.delete({
            where : {
                carid : req_carid
            }
        })


    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message     : 'Lo sentimos hubo un error al momento de eliminar el registro de carga de archivo',
            devmsg      : error,
            response    : false
        })
    }finally{
        await prisma.$disconnect();
        res.status(200)
        res.json({
            message     : 'Se ha eliminado el archivo correctamente',
            response    : true
        })
    }    
}


module.exports = controller