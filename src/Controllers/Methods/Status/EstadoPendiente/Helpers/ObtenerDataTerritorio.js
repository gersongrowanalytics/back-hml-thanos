controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerDataTerritorio = async () => {
    let data_final_productos_so = []
    try{
        const get_master_producto_so = await prisma.master_productos_so.findMany({
            select: {
                id: true,
                homologado: true,
                s_ytd: true,
                m_cl_grow: true,
                masterclientes_grow : {
                    select : {
                        zona : true,
                        territorio : true
                    }
                }
            },
            where: {
                homologado: false,
                m_cl_grow: {
                    not: null,
                }
            },
            distinct: ['pk_venta_so']
        })


        const ejemlo = await MetMostrarNoHomologados(
            {
                body: {
                    req_cliente_hml: "",
                    req_cod_producto: "",
                    req_column: "s_ytd",
                    req_conexion: "",
                    req_des_producto: "",
                    req_desde: "",
                    req_mtd: "",
                    req_orden: "desc",
                    req_territorio: "",
                    req_total: true,
                    req_ytd: "",
                    req_zona: ""
                }
            }
        );

        // console.log(ejemlo);
        
        const get_master_producto_so_v2 = ejemlo.data




        const idsm_cl_grow = get_master_producto_so.map(d => d.m_cl_grow)
        const filtrar_idsm_cl_grow = [...new Set(idsm_cl_grow)]

        const get_master_clientes_grow = await prisma.masterclientes_grow.findMany({
            where: {
                id: {
                    in: filtrar_idsm_cl_grow
                }
            },
            select: {
                id: true,
                zona: true,
                territorio: true,
            },
        })

        let filter_master_clientes_grow = []
        get_master_clientes_grow.map(gmcg => {
            const find_mcg = filter_master_clientes_grow.find(fmcg => fmcg.territorio == gmcg.territorio)
            if(!find_mcg){
                filter_master_clientes_grow.push(gmcg)
            }
        })

        console.log(get_master_producto_so);
        console.log(filter_master_clientes_grow);
        // console.log(get_master_clientes_grow);

        data_final_productos_so = filter_master_clientes_grow.map((fmcg) => {
            let totalNoHml = 0
            let totalytd = 0

            let subtotalNoHml = 0
            let subtotalytd = 0

            get_master_producto_so_v2.map((gmps) => {
                if(gmps.masterclientes_grow.zona == fmcg.zona && gmps.masterclientes_grow.territorio == fmcg.territorio ){
                    // subtotalNoHml = subtotalNoHml + 1
                    subtotalytd = subtotalytd + parseFloat(gmps.s_ytd)
                    
                    // totalNoHml = subtotalNoHml
                    totalytd = subtotalytd
                }
            })

            get_master_producto_so.map((gmps) => {
                if(gmps.masterclientes_grow.zona == fmcg.zona && gmps.masterclientes_grow.territorio == fmcg.territorio ){
                    subtotalNoHml = subtotalNoHml + 1
                    // subtotalytd = subtotalytd + parseFloat(gmps.s_ytd)
                    
                    totalNoHml = subtotalNoHml
                    // totalytd = subtotalytd
                }
            })

            // get_master_clientes_grow.map(gmcg => {
            //     if(fmcg.territorio == gmcg.territorio){
            //         let subtotalNoHml = 0
            //         let subtotalytd = 0
            //         get_master_producto_so.map(gmp => {
            //             if(gmp.m_cl_grow == gmcg.id){
            //                 subtotalNoHml = subtotalNoHml + 1
            //                 subtotalytd = subtotalytd + parseFloat(gmp.s_ytd)
            //             }
            //         })
            //         totalNoHml = totalNoHml + subtotalNoHml
            //         totalytd = totalytd + subtotalytd
            //     }
            // })
            totalytd = parseFloat((totalytd).toFixed(2))
            return {
                ...fmcg,
                nohml: Intl.NumberFormat('en-IN').format(totalNoHml),
                ytd: Intl.NumberFormat('en-US', {style: 'decimal', useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(totalytd),
            }
        })

        console.log("-----------------------------------------------------------");
        console.log(data_final_productos_so);

        // data_final_productos_so.sort((data, data_clone) => {
        //     const territorio = data.territorio.toLowerCase()
        //     const territorioClone = data_clone.territorio.toLowerCase()
        //     if(territorio < territorioClone){
        //         return -1;
        //     }
        //     if(territorio > territorioClone){
        //         return 1;
        //     }
        //     return 0
        // })

        data_final_productos_so.sort((data, data_clone) => {
            const valueA = Number(data.ytd.replace(/,/g, ''))
            const valueB = Number(data_clone.ytd.replace(/,/g, ''))

            return valueB - valueA
        })

        data_final_productos_so.map((dfps, index) => {
            data_final_productos_so[index]["key"] = index + 1
        })

        return data_final_productos_so

    }catch(error){
        console.log("MetObtenerDataTerritorio: ", error);
        return data_final_productos_so
    }
}



// FUNCION

const MetMostrarNoHomologados = async (req, res) => {

    let page = 1

    const {
        req_cliente_hml,
        req_territorio,
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

    try{
        
        let query_words_exc = ''
        const words_exc = [
            "PAÑAL", "BB", "NOBLE", "BABYSEC", "CELESTE", "NARANJA", "LADYSOFT",  "NAVIDAD", "MUNDIAL", "LOONEY", "DISEÑO", "CUMPLE",
            "TORTA", "LINEAS", "CIRCULOS", "HALLOWEEN", "FIESTAS", "PATRIAS", "VERANO", "PRACTICA", "LDSFT", "LADY-SOFT", "LADISOFT",
            "ULTRASEC", "HIPOAL", "DOVE", "REXONA", "PALOS", "DOBBY", "COTIDIAN", "NOVA", "HIGIENOL", "NOBL", "TOUCH", "SOFTMAX", "ALOE",
            "BB/SEC", "BABY", "HUM", "PREMIUM", "NATURAL SOFT", "LADY", "NOCTURN", "ULTRAFRESH", "HUMEDA", "MENTHOL"
        ]
        // const words_exc = []
        
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
        }else{
            query_order_sql = `ORDER BY master_productos_so.${req_column} ${req_orden.toUpperCase()}`
        }

        if(req_total){


            // console.log("QUERY:");
            // console.log(`SELECT DISTINCT(pk_venta_so), master_productos_so.id FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.homologado = 0 AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%' ${query_words_exc};`);

            const query_total = await prisma.$queryRawUnsafe(`SELECT DISTINCT(pk_venta_so), master_productos_so.id FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.conexion LIKE '%${req_conexion}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.homologado = 0 AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%' ${query_words_exc};`)

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
        

        productosSinProid = await prisma.$queryRawUnsafe(`SELECT DISTINCT(pk_venta_so), master_productos_so.id, master_productos_so.m_dt_id, master_productos_so.codigo_distribuidor, master_productos_so.codigo_producto, master_productos_so.descripcion_producto, master_productos_so.desde, master_productos_so.hasta, master_productos_so.s_ytd, master_productos_so.s_mtd, master_productos_so.pk_venta_so, master_productos_so.pk_extractor_venta_so, master_productos_so.unidad_medida, master_productos_so.cod_unidad_medida, master_productos_so.ruc, master_productos_so.posible_combo, master_distribuidoras.nomb_dt, master_distribuidoras.region,master_distribuidoras.codigo_dt,masterclientes_grow.id as idClients, masterclientes_grow.cliente_hml, masterclientes_grow.zona, masterclientes_grow.conexion, masterclientes_grow.territorio, masterclientes_grow.codigo_destinatario, masterclientes_grow.sucursal_hml FROM master_productos_so LEFT JOIN master_distribuidoras ON master_distribuidoras.id = master_productos_so.m_dt_id LEFT JOIN masterclientes_grow ON masterclientes_grow.id = master_productos_so.m_cl_grow WHERE master_productos_so.homologado = 0 AND masterclientes_grow.cliente_hml LIKE '%${req_cliente_hml}%' AND masterclientes_grow.zona LIKE '%${req_zona}%' AND masterclientes_grow.conexion LIKE '%${req_conexion}%' AND masterclientes_grow.territorio LIKE '%${req_territorio}%' AND master_productos_so.codigo_producto LIKE '%${req_cod_producto}%' AND master_productos_so.descripcion_producto LIKE '%${req_des_producto}%' AND master_productos_so.desde LIKE '%${req_desde}%' AND master_productos_so.s_ytd LIKE '${req_ytd}%' AND master_productos_so.s_mtd LIKE '${req_mtd}%' ${query_words_exc} ${query_order_sql} LIMIT 20 OFFSET ${page_query};`)

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
        for await(const quer of data_query){

            // const total_v = await prisma.$queryRawUnsafe(`SELECT sum(vo.precio_total_sin_igv) as suma_total FROM ventas_so as vo JOIN master_productos_so as mps ON mps.id = vo.pro_so_id WHERE vo.pk_venta_so = '${quer.pk_venta_so}' AND mps.homologado = ${false} AND vo.fecha LIKE ${formattedDate}` )
            const total_v = await prisma.$queryRawUnsafe(`SELECT sum(vs.precio_total_sin_igv) as suma_total FROM ventas_so as vs JOIN master_productos_so as mps ON mps.pk_extractor_venta_so = vs.pk_extractor_venta_so WHERE mps.homologado = ${false} AND mps.pk_venta_so = "${quer.pk_venta_so}" AND vs.fecha LIKE "${year}-%"` )


            data_query[contador]['s_mtd'] = total_v[0]['suma_total'];
            data_query[contador]['s_ytd'] = total_v[0]['suma_total'];
            // console.log(data_query[contador]['s_mtd']);
            // console.log(data_query[contador]['s_ytd']);
            // console.log(total_v);
            // console.log("------------");
            contador++;
        }

    }catch(error){
        console.log(error)
        return {
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        }
    }finally{
        await prisma.$disconnect()
        return {
            message     : 'Productos no homologados obtenidos correctamente',
            data        : data_query,
            total_data  : total_query_sql.length,
            respuesta   : true,
            filter_connection : connection_types
        }
    }
}

module.exports = controller