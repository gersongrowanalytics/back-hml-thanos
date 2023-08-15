const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

controller.MetFormatearRegistrosVentasSO = async (req, res) => {

    try{

        const ventasSO = await prisma.ventas_so.findMany({
            select: {
                id                      : true,
                descripcion_producto    : true,
            }
        })

        ventasSO.map((vnt, index) => {
            ventasSO[index]['descripcion_producto'] = vnt.descripcion_producto.replace(/\r\n+/g, ' ') 
        })

        for await (const venta of ventasSO){
            const updateVentaSO = await prisma.ventas_so.update({
                where : {
                    id : venta.id
                },
                data : {
                    descripcion_producto : venta.descripcion_producto
                }
            })
        }

        res.status(200)
        res.json({
            message     : "Los registos se han formateado con éxito",
            response    : true
        })

    }catch(err){
        console.log(err)
        res.status(500)
        res.json({
            message     : "Ha ocurrido un error al formatear los registros",
            response    : false
        })
    }
}

module.exports = controller