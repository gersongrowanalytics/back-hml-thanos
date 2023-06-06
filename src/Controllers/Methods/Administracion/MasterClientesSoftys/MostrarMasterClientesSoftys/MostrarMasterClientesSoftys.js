const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarMasterClientesSoftys = async ( req, res ) => {
    try{
        
        const data = await prisma.master_clientes_softys.findMany({})

        res.status(200).json({
            response    : true,
            data,
            message     : 'Se obtuvo la maestra de clientes con éxito'
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