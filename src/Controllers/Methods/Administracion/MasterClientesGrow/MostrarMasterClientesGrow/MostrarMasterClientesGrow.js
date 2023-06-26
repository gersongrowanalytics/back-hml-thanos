const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarMasterClientesGrow = async ( req, res ) => {

    try{

        const date_updated = await prisma.espestadospendientes.findFirst({
            where : {
                espbasedato : 'Master Clientes'
            },
            select : {
                espfechactualizacion : true
            },
            orderBy : {
                fecid : 'desc'
            }
        })

        const mcg   = await prisma.masterclientes_grow.findMany({})

        res.status(200).json({
            response    : true,
            message     : 'Se obtuvo la maestra de clientes con éxito',
            data        : mcg,
            date_updated
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
