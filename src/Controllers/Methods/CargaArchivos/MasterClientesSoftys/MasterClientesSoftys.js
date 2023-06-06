const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterClientesSoftys = async ( req, res, data ) => {
    try{

        await prisma.master_clientes_softys.createMany({
            data
        })

        res.status(200).json({
            response    : true,
            message     : 'Se ha cargado la maestra de clientes con éxito'
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar la maestra de clientes softys'
        })
    }
}

module.exports = controller