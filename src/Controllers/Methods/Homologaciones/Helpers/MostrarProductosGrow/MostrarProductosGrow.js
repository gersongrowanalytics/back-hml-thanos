const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarProductosGrow = async (req, res) => {

    try{

        const mpgs = await prisma.master_productos_grow.findMany({
            select: {
                id              : true,
                codigo_material : true,
                material_softys : true
            }
        })

        const data = mpgs.map(mpg => ({
            id: mpg.id,
            cod_producto: mpg.codigo_material, 
            nomb_producto: mpg.material_softys
        }));

        res.json({
            message: 'Lista de productos obtenidos correctamente',
            data : data,
            respuesta: true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message     : 'Lo sentimos hubo un error al momento de consultas los productos',
            devmsg      : error,
            respuesta   : false
        })
    }
}


module.exports = controller