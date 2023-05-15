const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarDistribuidoras = async (req, res) => {

    const {  } = req.body;

    try{

        const distributors = prisma.master_distribuidoras.findMany({
            orderBy: {
                created_at: 'desc'
            }
        })

        res.json({
            message: 'Lista de distribuidoras obtenidos correctamente',
            data : distributors,
            respuesta: true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de obtener las distribuidoras',
            devmsg  : error,
            respuesta: false
        })
    }
}


module.exports = controller