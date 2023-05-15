const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de mostrar los productos homologados',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller