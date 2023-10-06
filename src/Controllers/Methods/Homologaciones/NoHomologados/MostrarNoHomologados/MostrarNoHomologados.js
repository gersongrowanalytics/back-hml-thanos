const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarNoHomologados = async (req, res) => {

    let page = req.query.page

    const {
        req_cliente_hml,
        req_territorio,
        req_filtro_responsable,
        req_cod_producto,
        req_des_producto,
        req_conexion,
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
    let connection_types
    let filterResponsable = false

    try{
        
        const wordsIC = ['BNF','BONIF','BONI','FDH - 001', 'COMBO', 'T.GRAT', 'T.GRATUITA', 'PROMO', '**']
        let query_words_exc = ''
        let queryFilterResponse = ''

        let queryIC = ""
        let querySAC = ""

        wordsIC.map(( ic, index) => {
            queryIC     = queryIC + `master_productos_so.descripcion_producto LIKE '%${ic}%' ${index == wordsIC.length -1 ? '': 'OR '}`
            querySAC    = querySAC + `master_productos_so.descripcion_producto NOT LIKE '%${ic}%' ${index == wordsIC.length -1 ? '': 'AND '}`
        })

        if("SAC".includes(req_filtro_responsable.toUpperCase()) && "IC".includes(req_filtro_responsable.toUpperCase())){
            queryFilterResponse = ''
        }else if("IC".includes(req_filtro_responsable.toUpperCase()) && req_filtro_responsable.length > 0){
            filterResponsable = true
            queryFilterResponse = queryIC
        }else if("SAC".includes(req_filtro_responsable.toUpperCase()) && req_filtro_responsable.length > 0){
            filterResponsable = true
            queryFilterResponse = querySAC
        }else{
            filterResponsable = true
            queryFilterResponse = queryFilterResponse + `master_productos_so.descripcion_producto = ""`
        }
        
        const words_exc = ['noble','babysec', 'celeste', 'naranja', 'ladysoft', 'navidad', 'looney','diseño','cumple','torta','lineas','circulos','halloween','fiestas', 'patrias','verano','practica','ldsft','lady-soft','ladisoft','ultrasec','hipoal','dove','rexona','palos','dobby','cotidian', 'nova', 'higienol', 'nobl', 'touch', 'softmax', 'aloe', 'bb/sec', 'baby', 'hum', 'premium', 'natural soft', 'lady', 'nocturn', 'ultrafresh', 'humeda', 'menthol','ideal', 'suave', 'laminado', 'suav', 'megarrollo', 'flor', 'duo' ]

        connection_types = await prisma.masterclientes_grow.findMany({
            select : {
                conexion : true
            },
            distinct : ['conexion']
        })

        words_exc.forEach((wex,index) => {
            query_words_exc = query_words_exc + ` AND descripcion_producto NOT LIKE '%${wex}%'`
        });

        let query_order_sql = ''

        if(req_orden == null){
            query_order_sql = 'ORDER BY master_productos_so.updated_at DESC' 
        }else if(req_column == 'cliente_hml' || req_column == 'territorio' || req_column == 'zona' || req_column == 'conexion'){
            query_order_sql = `ORDER BY masterclientes_grow.${req_column} ${req_orden.toUpperCase()}`
        }else if(req_column == 'index'){
            query_order_sql = `ORDER BY master_productos_so.updated_at ${req_orden.toUpperCase()}`
        }else if (req_column == "responsable"){
            if(req_orden == "asc"){
                query_order_sql = `ORDER BY CASE WHEN (${queryIC}) THEN 1 WHEN (${querySAC}) THEN 2 ELSE 3 END`
            }else if(req_orden == "desc"){
                query_order_sql = `ORDER BY CASE WHEN (${querySAC}) THEN 1 WHEN (${queryIC}) THEN 2 ELSE 3 END`
                
            }
        }else{
            query_order_sql = `ORDER BY master_productos_so.${req_column} ${req_orden.toUpperCase()}`
        }

        if(req_total){
            const query_total = await prisma.$queryRawUnsafe(`SELECT DISTINCT(pk_venta_so), MIN(master_productos_so.id) as id FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.conexion LIKE '%${req_conexion}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.homologado = 0 AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%' ${query_words_exc} ${filterResponsable ? "AND ("+ queryFilterResponse + ")":""} GROUP BY master_productos_so.pk_venta_so;`)

            total_query_sql = query_total.map(({id}) => ({
                id : parseInt(id),
            }));

            if((total_query_sql.length)/20 < page){
                page = Math.ceil((total_query_sql.length)/20)
            }
            if(total_query_sql.length == 0){
                page = 1
            }
        }

        const page_query = (page-1)*20
        
        productosSinProid = await prisma.$queryRawUnsafe(`SELECT DISTINCT(pk_venta_so), MIN(master_productos_so.id) as id, master_productos_so.m_dt_id, master_productos_so.codigo_distribuidor, master_productos_so.codigo_producto, master_productos_so.descripcion_producto, MIN(master_productos_so.desde) as desde, MIN(master_productos_so.hasta) as hasta, master_productos_so.s_ytd, master_productos_so.s_mtd, master_productos_so.pk_venta_so, master_productos_so.ruc, master_productos_so.posible_combo, master_distribuidoras.nomb_dt, master_distribuidoras.region,master_distribuidoras.codigo_dt,masterclientes_grow.id as idClients, masterclientes_grow.cliente_hml, masterclientes_grow.zona, masterclientes_grow.conexion, masterclientes_grow.territorio, masterclientes_grow.codigo_destinatario, masterclientes_grow.sucursal_hml FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE master_productos_so.homologado = 0 AND masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.conexion LIKE '%${req_conexion}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%' ${query_words_exc} ${filterResponsable ? "AND ("+ queryFilterResponse+")" :""} GROUP BY master_productos_so.pk_venta_so, master_productos_so.m_dt_id, master_productos_so.codigo_distribuidor, master_productos_so.codigo_producto, master_productos_so.descripcion_producto, master_productos_so.s_ytd, master_productos_so.s_mtd, master_productos_so.ruc, master_productos_so.posible_combo, master_distribuidoras.nomb_dt, master_distribuidoras.region, master_distribuidoras.codigo_dt, masterclientes_grow.id, masterclientes_grow.cliente_hml, masterclientes_grow.zona, masterclientes_grow.conexion, masterclientes_grow.territorio, masterclientes_grow.codigo_destinatario, masterclientes_grow.sucursal_hml ${query_order_sql} LIMIT 20 OFFSET ${page_query};`)

        data_query = productosSinProid.map(({ id, pk_venta_so, m_dt_id, codigo_distribuidor, codigo_producto, descripcion_producto, desde, hasta, s_ytd, s_mtd, pk_extractor_venta_so, unidad_medida, cod_unidad_medida, ruc, posible_combo, nomb_dt, region, codigo_dt, idClients, cliente_hml, zona, conexion, territorio, codigo_destinatario, sucursal_hml }, index) => {

            let index_row
            if(req_column == 'index' && req_orden == 'desc'){
                if(productosSinProid.length < 20){
                    index_row =  productosSinProid.length - index 
                }else{
                    index_row = total_query_sql.length - ( (20 * (page ) ) - ( productosSinProid.length - index ) )
                }
            }else{
                index_row = (index+1) + ((page-1) * 20)
            }
            
            return (
                {   
                    index : index_row,
                    key : parseInt(id),
                    id : parseInt(id),
                    pk_venta_so,
                    m_dt_id,
                    codigo_distribuidor, 
                    codigo_producto,
                    descripcion_producto, 
                    desde, 
                    hasta, 
                    s_ytd : parseFloat(s_ytd).toFixed(2), 
                    s_mtd : parseFloat(s_mtd).toFixed(2), 
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
                        id: parseInt(idClients),
                        cliente_hml, 
                        territorio, 
                        codigo_destinatario, 
                        sucursal_hml,
                        zona,
                        conexion
                    },
                }
            )
        });

        // OBTENER EL MES Y AÑO ACTUAL

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth()).padStart(2, '0');
        const formattedDate = `${year}-${month}`;
        let contador = 0;

        const containsIC = (arr, palabra) => arr.some(str => palabra.toUpperCase().includes(str.toUpperCase()))

        for await(const quer of data_query){

            // const total_v = await prisma.$queryRawUnsafe(`SELECT sum(vo.precio_total_sin_igv) as suma_total FROM ventas_so as vo JOIN master_productos_so as mps ON mps.id = vo.pro_so_id WHERE vo.pk_venta_so = '${quer.pk_venta_so}' AND mps.homologado = ${false} AND vo.fecha LIKE ${formattedDate}` )
            const total_v = await prisma.$queryRawUnsafe(`SELECT sum(vs.precio_total_sin_igv) as suma_total FROM ventas_so as vs JOIN master_productos_so as mps ON mps.pk_extractor_venta_so = vs.pk_extractor_venta_so WHERE mps.homologado = ${false} AND mps.pk_venta_so = "${quer.pk_venta_so}" AND vs.fecha LIKE "${year}-%"` )

            if(containsIC(wordsIC, quer.descripcion_producto)){
                data_query[contador]['responsable'] = "IC"
            }else{
                data_query[contador]['responsable'] = "SAC"
            }
            data_query[contador]['s_mtd'] = total_v[0]['suma_total'];
            data_query[contador]['s_ytd'] = total_v[0]['suma_total'];
            contador++;
        }

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
            respuesta   : true,
            filter_connection : connection_types
        })
    }
}


module.exports = controller