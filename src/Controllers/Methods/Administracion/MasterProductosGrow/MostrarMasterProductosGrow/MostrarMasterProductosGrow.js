const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarMasterProductosGrowController = async ( req, res ) => {

    try{

        const mpg = await prisma.master_productos_grow.findMany({})

        res.status(200).json({
            response    : true,
            message     : 'Lista de productos obtenida con éxito',
            data        : mpg
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