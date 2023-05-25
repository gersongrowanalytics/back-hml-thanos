const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerPaquetexBultoProducto = async ( req, res ) => {

    const {
        req_proid
    } = req.body

    try{

        const pbpo = await prisma.master_productos.findFirst({
            where : {
                id : req_proid
            },
            select : {
                paquetexbulto : true
            }
        })


        res.status(200).json({
            response    : true,
            message     : 'Información del producto obtenida con éxito',
            data        : pbpo
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la información del producto',
            msgdev      : err
        })
    }
} 

module.exports = controller