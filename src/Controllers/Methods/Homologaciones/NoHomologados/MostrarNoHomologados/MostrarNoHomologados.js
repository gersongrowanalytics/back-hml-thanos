const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarNoHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        const productosSinProid = await prisma.master_productos_so.findMany({
            where: {
                proid: null
            }
        })
        
        res.status(200)
        res.json({
            message : 'Productos no homologados obtenidos correctamente',
            data    : productosSinProid,
            respuesta : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
}


module.exports = controller