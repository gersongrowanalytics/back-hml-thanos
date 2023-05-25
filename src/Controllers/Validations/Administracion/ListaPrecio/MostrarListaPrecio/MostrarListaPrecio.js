const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const MostarListaPrecioController = require('../../../../Methods/Administracion/ListaPrecio/MostrarListaPrecio/MostrarListaPrecio')

controller.ValMostrarListaPrecio = async (req, res) => {

    const {  } = req.body;

    try{

        MostarListaPrecioController.MetMostrarListaPrecio(req, res)

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