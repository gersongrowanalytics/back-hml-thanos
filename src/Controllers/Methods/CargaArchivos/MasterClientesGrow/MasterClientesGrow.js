const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterClientesGrow = async ( req, res, data ) => {

    try{

        await prisma.masterclientes_grow.createMany({
            data
        })

        res.status(200).json({
            response    : true,
            message     : 'Se cargó master clientes grow correctamente'
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master clientes grow'
        })
    }
}

module.exports = controller