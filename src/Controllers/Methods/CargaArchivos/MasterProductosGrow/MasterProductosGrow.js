const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterProductosGrow = async ( req, res, data ) => {

    try{

        await prisma.master_productos_grow.createMany({
            data
        })

        res.status(200).json({
            response    : true,
            message     : 'Se cargó master productos grow correctamente'
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master productos grow'
        })
    }
}

module.exports = controller