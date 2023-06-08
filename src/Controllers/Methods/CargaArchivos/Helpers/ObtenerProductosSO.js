const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetObtenerProductosSO = async () => {

    try{
        const formattedDate = new Date().toISOString().slice(0, 10);

        const distinct_ventas_so = await prisma.ventas_so.findMany({
            where: {
                pro_so_id: null
            },
            select: {
                pk_extractor_venta_so: true,
                pk_venta_so: true,
                m_cl_grow : true,
                m_dt_id : true,
                codigo_distribuidor : true,
                codigo_producto : true,
                descripcion_producto : true,
                precio_unitario : true,
                ruc : true,
                cod_unidad_medida : true,
                unidad_medida : true
            },
            distinct: ['pk_extractor_venta_so']
        });

        let new_data_master_productos_so = []

        distinct_ventas_so.map((venta_so) => {
            new_data_master_productos_so.push({
                m_dt_id : venta_so.m_dt_id,
                m_cl_grow : venta_so.m_cl_grow,
                pk_extractor_venta_so : venta_so.pk_extractor_venta_so,
                pk_venta_so : venta_so.pk_venta_so,
                pk_venta_so_hml : venta_so.pk_venta_so,
                codigo_distribuidor : venta_so.codigo_distribuidor,
                codigo_producto : venta_so.codigo_producto,
                descripcion_producto : venta_so.descripcion_producto,
                precio_unitario : venta_so.precio_unitario,
                ruc : venta_so.ruc,
                desde : formattedDate,
                hasta : formattedDate,
                s_ytd : "0",
                s_mtd : "0",
                cod_unidad_medida : venta_so.cod_unidad_medida,
                unidad_medida : venta_so.unidad_medida
            })
        })
        
        await prisma.master_productos_so.deleteMany({})
        await prisma.master_productos_so.createMany({
            data: new_data_master_productos_so
        })


        for await (const venta_so of distinct_ventas_so){

            const product_so_unique = await prisma.master_productos_so.findFirst({
                where: {
                    // m_dt_id : venta_so.m_dt_id,
                    m_cl_grow : venta_so.m_cl_grow,
                    codigo_distribuidor : venta_so.codigo_distribuidor,
                    codigo_producto : venta_so.codigo_producto,
                }
            })
    
            if(product_so_unique){
                await prisma.ventas_so.updateMany({
                    where: {
                        pk_venta_so : venta_so.pk_venta_so
                    },
                    data: {
                        pro_so_id : product_so_unique.id
                    }
                })
            }else{
    
            }
        }

        return {
            message : 'Productos SO asignados correctamente',
            respuesta  : true
        }

    } catch(error) {
        console.log(error)
        return {
            message : 'Lo sentimos hubo un error al momento de obtener los productos SO',
            devmsg  : error,
            respuesta  : false
        }
    }

}

module.exports = controller