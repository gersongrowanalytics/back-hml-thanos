const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarUniqueNoHomologados = async (req, res) => {
    const { req_id } = req.body

    try{
        const productosSinProid = await prisma.master_productos_so.findMany({
            select: {
                master_distribuidoras: {
                    select: {
                        nomb_dt: true,
                        region : true,
                        codigo_dt : true
                    }
                },
                masterclientes_grow: {
                    select: {
                        id: true,
                        zona: true,
                        territorio: true,
                        cliente_hml: true,
                        codigo_destinatario: true,
                        sucursal_hml: true,
                    }
                },
                id : true,
                m_dt_id : true,
                codigo_distribuidor : true,
                codigo_producto: true,
                descripcion_producto : true,
                desde : true,
                hasta : true,
                s_ytd : true,
                s_mtd : true,
                pk_venta_so: true,
                pk_extractor_venta_so: true,
                pk_venta_so_hml: true,
                cod_unidad_medida : true,
                unidad_medida : true,
                unidad_minima : true,
                ruc : true
            },
            where: {
                id : req_id
            },
        })

        await prisma.$disconnect()
        res.status(200).json({
            message : 'Productos no homologados obtenidos correctamente',
            data    : productosSinProid,
            respuesta : true
        })
    }catch(error){
        console.log(error)
        await prisma.$disconnect()
        res.status(500).json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
}


module.exports = controller