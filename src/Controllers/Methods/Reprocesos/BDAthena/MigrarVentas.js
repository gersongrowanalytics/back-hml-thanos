controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
// const AthenaQuery = require('../Helpers/AthenaQuery')

controller.MetMigrarVentas = async (req, res) => {
    const {
        dateRange
    } = req.body

    try{
        // const formattedDate = new Date().toISOString().slice(0, 10)
        // const separateDate = dateRange.split("/")
        // const joinDate = separateDate[1]+""+separateDate[0]

        // const query = `SELECT c_date, year, month, day, cod_ship_to, cod_cliente_so, cliente_so, cod_material_dist, material_dist, c_cod_material, c_material, factor_um, cod_tipo_vta_dist, tipo_vta_dist FROM "traditional_warehouse_supplier_sales" WHERE c_date LIKE '${joinDate}%' LIMIT 10`
        // const { respuesta, data, message } = await AthenaQuery.MetAthenaQuery(query)

        // if(respuesta){
        //     let obs_ven = []
        //     let obs_ven_m_pro_grow = []
        //     let data_master_productos_so = []
        //     let data_ventas_so = []
            
        //     await prisma.ventas_so.deleteMany({
        //         where: {
        //             c_date: {
        //                 contains: joinDate,
        //             },
        //             extractor: true
        //         }
        //     })

        //     const idsClientes = data.map(d => d.cod_ship_to)
        //     const filtrarIdsClientes = [...new Set(idsClientes)]

        //     const idClientes = await prisma.masterclientes_grow.findMany({
        //         where: {
        //             codigo_destinatario: {
        //                 in: filtrarIdsClientes
        //             }
        //         },
        //         select: {
        //             id: true,
        //             codigo_destinatario: true,
        //         }
        //     })
            
        //     for await(const dt of data){
        //         const fechaSave = dt.year+"-"+dt.month
        //         const findClientes = idClientes.find(id => id.codigo_destinatario == dt.cod_ship_to)

        //         if(findClientes){
        //             const pk_venta_so           = dt.cod_ship_to + dt.cod_material_dist
        //             const pk_extractor_venta_so = dt.cod_ship_to + dt.cod_material_dist + dt.factor_um + dt.factor_um
        //             const pk_venta_so_hml = pk_venta_so + dt.cod_tipo_vta_dist + dt.tipo_vta_dist

        //             data_ventas_so.push({
        //                 m_cl_grow: findClientes.id,
        //                 pk_venta_so: pk_venta_so,
        //                 pk_extractor_venta_so: pk_extractor_venta_so,
        //                 c_date: dt.c_date,
        //                 anio: parseInt(dt.year),
        //                 mes: parseInt(dt.month),
        //                 dia: parseInt(dt.day),
        //                 codigo_distribuidor: dt.cod_ship_to,
        //                 fecha: fechaSave,
        //                 codigo_cliente: dt.cod_cliente_so,
        //                 cliente_so: dt.cliente_so,
        //                 codigo_producto: dt.cod_material_dist,
        //                 descripcion_producto: dt.material_dist,
        //                 precio_unitario: 0,
        //                 extractor: true,
        //             })
        //             data_master_productos_so.push({
        //                 m_cl_grow: findClientes.id,
        //                 pk_venta_so: pk_venta_so,
        //                 pk_extractor_venta_so: pk_extractor_venta_so,
        //                 m_pro_grow: dt.c_cod_material, // envio parametros para validacion no es el parametro que se guarda en la bd
        //                 pk_venta_so_hml: pk_venta_so_hml,
        //                 codigo_distribuidor: dt.cod_ship_to,
        //                 codigo_producto: dt.cod_material_dist,
        //                 descripcion_producto: dt.material_dist,
        //                 precio_unitario: 0,
        //                 desde : formattedDate,
        //                 hasta : formattedDate,
        //                 s_ytd : "0",
        //                 s_ytd_value : 0,
        //                 s_mtd : "0",
        //                 s_mtd_value : 0,
        //             })
        //         }else{
        //             const findObs = obs_ven.find(obs => obs.cod_ship_to == dt.cod_ship_to)
        //             if(!findObs){
        //                 obs_ven.push(dt)
        //             }
        //         }
        //     }

        //     const idMpso = data_master_productos_so.map(mpso => mpso.m_pro_grow)
        //     const filterIdMpso = [...new Set(idMpso)]

        //     const idProductos = await prisma.master_productos_grow.findMany({
        //         where: {
        //             codigo_material: {
        //                 in: filterIdMpso
        //             }
        //         },
        //         select: {
        //             id: true,
        //             codigo_material: true,
        //         }
        //     })

        //     const filter_data_master_productos_so = data_master_productos_so.filter((obj, index, self) => {
        //         return index == self.findIndex((o) => o.pk_venta_so_hml === obj.pk_venta_so_hml)
        //     })

        //     const data_master_productos_so_end = filter_data_master_productos_so.map(mps => {
        //         const findMpg = idProductos.find(ip => ip.codigo_material == mps.m_pro_grow)
        //         if(!findMpg){
        //             obs_ven_m_pro_grow.push({
        //                 ...mps, m_pro_grow: null
        //             })
        //         }
        //         // aqui se cambia el valor de m_pro_grow por el valor que si se guardara en la bd
        //         return {
        //             ...mps, m_pro_grow: findMpg ? findMpg.id : null
        //         }
        //     })

        //     let idMasterProductosSo = []
        //     for await(const mps of data_master_productos_so_end){
        //         const dataReturn = await prisma.master_productos_so.create({
        //             data: {
        //                 ...mps
        //             },
        //         })
        //         idMasterProductosSo.push(dataReturn)
        //     }

        //     const data_ventas_so_end = data_ventas_so.map(dvs => {
        //         const findIdMps = idMasterProductosSo.find(idmps => idmps.pk_extractor_venta_so == dvs.pk_extractor_venta_so)
        //         return {
        //             ...dvs, pro_so_id: findIdMps.id
        //         }
        //     })

        //     await prisma.ventas_so.createMany({
        //         data: data_ventas_so_end,
        //     })

        //     res.status(200).json({
        //         respuesta: true,
        //         message: message,
        //         data: data,
        //         observations: obs_ven,
        //         observationsProd: obs_ven_m_pro_grow
        //     })
        // }else{
        //     res.status(500).json({
        //         respuesta: false,
        //         message: message,
        //         data: ''
        //     })
        // }
    }catch(error){
        console.log(error);
        res.status(500).json({
            respuesta: false,
            message: error,
            data: ''
        })
    }
}

module.exports = controller