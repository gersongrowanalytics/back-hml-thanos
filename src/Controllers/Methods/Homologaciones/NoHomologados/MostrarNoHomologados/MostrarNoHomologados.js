const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarNoHomologados = async (req, res) => {

    let page = req.query.page

    const {
        req_cliente_hml,
        req_territorio,
        req_cod_producto,
        req_des_producto,
        req_desde,
        req_ytd,
        req_mtd,
        req_total,
        req_column,
        req_orden,
        req_zona
    } = req.body;

    let total = []
    let productosSinProid
    let data_query
    let total_query_sql = []

    try{

        let query_order_sql = ''

        if(req_orden == null){
            query_order_sql = 'ORDER BY master_productos_so.updated_at DESC' 
        }else if(req_column == 'cliente_hml' || req_column == 'territorio' || req_column == 'zona'){
            query_order_sql = `ORDER BY masterclientes_grow.${req_column} ${req_orden.toUpperCase()}`
        }else{
            query_order_sql = `ORDER BY master_productos_so.${req_column} ${req_orden.toUpperCase()}`
        }

        if(req_total){

            const query_total = await prisma.$queryRawUnsafe(`SELECT DISTINCT(pk_venta_so), master_productos_so.id FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.homologado = 0 AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%';`)

            total_query_sql = query_total.map(({id}) => ({
                id : parseInt(id),
            }));

            if((total_query_sql.length)/10 < page){
                page = Math.ceil((total_query_sql.length)/10)
            }
            if(total_query_sql.length == 0){
                page = 1
            }
        }

        const page_query = (page-1)*10

        productosSinProid = await prisma.$queryRawUnsafe(`SELECT DISTINCT(pk_venta_so), master_productos_so.id, master_productos_so.m_dt_id, master_productos_so.codigo_distribuidor, master_productos_so.codigo_producto, master_productos_so.descripcion_producto, master_productos_so.desde, master_productos_so.hasta, master_productos_so.s_ytd, master_productos_so.s_mtd, master_productos_so.pk_venta_so, master_productos_so.pk_extractor_venta_so, master_productos_so.unidad_medida, master_productos_so.cod_unidad_medida, master_productos_so.ruc, master_productos_so.posible_combo, master_distribuidoras.nomb_dt, master_distribuidoras.region,master_distribuidoras.codigo_dt, masterclientes_grow.cliente_hml, masterclientes_grow.zona, masterclientes_grow.territorio, masterclientes_grow.codigo_destinatario, masterclientes_grow.sucursal_hml FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE master_productos_so.homologado = 0 AND masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%' ${query_order_sql} LIMIT 10 OFFSET ${page_query};`)

        data_query = productosSinProid.map(({ id, pk_venta_so, m_dt_id, codigo_distribuidor, codigo_producto, descripcion_producto, desde, hasta, s_ytd, s_mtd, pk_extractor_venta_so, unidad_medida, cod_unidad_medida, ruc, posible_combo, nomb_dt, region, codigo_dt, cliente_hml, zona, territorio, codigo_destinatario, sucursal_hml }, index) => ({
            key : index,
            id : parseInt(id),
            pk_venta_so,
            m_dt_id,
            codigo_distribuidor, 
            codigo_producto, 
            descripcion_producto, 
            desde, 
            hasta, 
            s_ytd, 
            s_mtd, 
            pk_extractor_venta_so, 
            unidad_medida, 
            cod_unidad_medida, 
            ruc, 
            posible_combo,
            cliente_hml,
            territorio,
            master_distribuidoras : {
                nomb_dt,
                region,
                codigo_dt
            },
            masterclientes_grow : {
                cliente_hml, 
                territorio, 
                codigo_destinatario, 
                sucursal_hml,
                zona
            },
        }));

    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }finally{
        await prisma.$disconnect()
        res.status(200)
        return res.json({
            message     : 'Productos no homologados obtenidos correctamente',
            data        : data_query,
            total_data  : total_query_sql.length,
            respuesta   : true
        })
    }
}


module.exports = controller