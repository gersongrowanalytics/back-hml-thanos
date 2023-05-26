const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarNoHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        let data = []

        const invo = await prisma.inventarios.findMany({
            where: {
                pro_so_id: null
            },select : {
                master_distribuidoras: {
                    select: {
                        nomb_dt: true,
                        region : true,
                        codigo_dt : true
                    }
                },
                dia : true,
                mes : true,
                anio : true,
                m_dt_id : true,
                pk_venta_so : true,
                pk_extractor_venta_so : true,
                codigo_distribuidor : true,
                fecha : true,
                codigo_producto : true,
                descripcion_producto : true,
                cod_unidad_medida : true,
                unidad_medida : true,
                precio_unitario  : true,
                precio_total_sin_igv : true
            }
        })

        invo.map((inv, index) => invo[index]['inventario'] = true)

        const productosSinProid = await prisma.master_productos_so.findMany({
            select: {
                master_distribuidoras: {
                    select: {
                        nomb_dt: true,
                        region : true,
                        codigo_dt : true
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
                cod_unidad_medida : true,
                unidad_medida : true,
                ruc : true
            },
            where: {
                proid : null
            },
            orderBy: {
                updated_at: 'desc'
            },
            distinct : ['pk_venta_so']
        })

        productosSinProid.map((pro, index) => productosSinProid[index]['inventario']  = false)
        
        data = productosSinProid.concat(invo)
        
        data.map((dat, index) => data[index]['key']  = index)
        
        res.status(200)
        res.json({
            message : 'Productos no homologados obtenidos correctamente',
            data    : data,
            respuesta : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
}


module.exports = controller