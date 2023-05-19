const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarProductos = async (req, res) => {

    const {  } = req.body;

    try{

        const products = await prisma.master_productos.findMany({
            orderBy: {
                created_at: 'desc'
            }
        })

        res.json({
            message: 'Lista de productos obtenidos correctamente',
            data : products,
            respuesta: true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error,
            respuesta: false
        })
    }
}


module.exports = controller