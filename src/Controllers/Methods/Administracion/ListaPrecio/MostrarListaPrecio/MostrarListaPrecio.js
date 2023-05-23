const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarListaPrecio = async (req, res, data, dates_row) => {
    
    const {  } = req.body;

    try{

        const list_price = await prisma.lista_precio.findMany({
            orderBy: {
                created_at: 'desc'
            }
        })

        res.json({
            message: 'Lista de precios obtenidos correctamente',
            data : list_price,
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