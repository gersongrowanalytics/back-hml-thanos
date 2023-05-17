const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetAsignarDTVentasSO = async () => {

    const distinct_ventas_so = await prisma.ventas_so.findMany({
        where: {
            m_dt_id: null
        },
        select: {
            id : true,
            codigo_distribuidor : true
        },
        distinct: ['codigo_distribuidor']
    })

    for await (const venta_so of distinct_ventas_so){

        const dt_unique = await prisma.master_distribuidoras.findFirst({
            where: {
                codigo_dt : venta_so.codigo_distribuidor
            }
        })

        if(dt_unique){
            await prisma.ventas_so.updateMany({
                where: {
                    codigo_distribuidor : venta_so.codigo_distribuidor
                },
                data: {
                    m_dt_id : dt_unique.id
                }
            })
        }else{

        }
    }

    return true

}

module.exports = controller