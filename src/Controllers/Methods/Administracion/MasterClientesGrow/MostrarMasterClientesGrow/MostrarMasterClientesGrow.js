const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarMasterClientesGrow = async ( req, res ) => {

    try{

        const mcg   = await prisma.masterclientes_grow.findMany({})

        res.status(200).json({
            response    : true,
            message     : 'Se obtuvo la maestra de clientes con éxito',
            data        : mcg
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la maestra de clientes'
        })
    }
}

module.exports = controller
