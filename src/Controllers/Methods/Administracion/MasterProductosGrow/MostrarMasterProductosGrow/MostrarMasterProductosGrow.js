const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarMasterProductosGrowController = async ( req, res ) => {

    try{

        let date_updated

        const espo = await prisma.espestadospendientes.findFirst({
            where : {
                espbasedato : 'Master Productos'
            },
            select : {
                created_at : true,
                updated_at : true,
                espfechactualizacion : true
            },
            orderBy : {
                fecid : 'desc'
            }
        })
        
        const mpg = await prisma.master_productos_grow.findMany({})

        date_updated = { espfechaactualizacion : espo.updated_at == null ? null : espo.updated_at }

        res.status(200).json({
            response    : true,
            message     : 'Lista de productos obtenida con éxito',
            data        : mpg,
            date_updated
        })


    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la maestra de productos'
        })
    }

}

module.exports = controller