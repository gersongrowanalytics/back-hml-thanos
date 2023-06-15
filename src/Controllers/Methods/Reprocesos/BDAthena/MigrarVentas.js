controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const AthenaQuery = require('../Helpers/AthenaQuery')

controller.MetMigrarVentas = async (req, res) => {
    const {
        dateRange
    } = req.body

    try{
        const formattedDate = new Date().toISOString().slice(0, 10)
        const separateDate = dateRange.split("/")
        const joinDate = separateDate[1]+""+separateDate[0]

        const query = `SELECT c_date, year, month, day, cod_ship_to, cod_cliente_so, cliente_so, cod_material_dist, material_dist, c_cod_material, c_material FROM "traditional_warehouse_supplier_sales" WHERE c_date LIKE '${joinDate}%' LIMIT 10`
        const { respuesta, data, message } = await AthenaQuery.MetAthenaQuery(query)

        if(respuesta){
            let obs_ven = []
            let data_master_productos_so = []
            await prisma.ventas_so.deleteMany({
                where: {
                    c_date: {
                        contains: joinDate,
                    },
                    extractor: true
                }
            })

            const idsClientes = data.map(d => d.cod_ship_to)
            const filtrarIdsClientes = [...new Set(idsClientes)]

            const idClientes = await prisma.masterclientes_grow.findMany({
                where: {
                    codigo_destinatario: {
                        in: filtrarIdsClientes
                    }
                },
                select: {
                    id: true,
                    codigo_destinatario: true,
                }
            })

            // const idsProductos = data.map(d => d.c_cod_material)
            // const filtrarIdsProductos = [...new Set(idsProductos)]

            // const idProductos = await prisma.master_productos_grow.findMany({
            //     where: {
            //         codigo_material: {
            //             in: filtrarIdsProductos
            //         }
            //     },
            //     select: {
            //         id: true,
            //         codigo_material: true,
            //     }
            // })

            for await(const dt of data){
                const fechaSave = dt.year+"-"+dt.month
                const findClientes = idClientes.find(id => id.codigo_destinatario == dt.cod_ship_to)

                if(findClientes){
                    await prisma.ventas_so.create({
                        data: {
                            m_cl_grow: findClientes.id,
                            c_date: dt.c_date,
                            anio: parseInt(dt.year),
                            mes: parseInt(dt.month),
                            dia: parseInt(dt.day),
                            codigo_distribuidor: dt.cod_ship_to,
                            fecha: fechaSave,
                            codigo_cliente: dt.cod_cliente_so,
                            cliente_so: dt.cliente_so,
                            codigo_producto: dt.cod_material_dist,
                            descripcion_producto: dt.material_dist,
                            precio_unitario: 0,
                            extractor: true,
                        }
                    })
                    // const findProductos = idProductos.find(id => id.codigo_material == dt.c_cod_material)
                    // data_master_productos_so.push({
                    //     m_cl_grow: findClientes.id,
                    //     m_pro_grow: findProductos ? findProductos.id : null,
                    //     codigo_distribuidor: dt.cod_ship_to,
                    //     codigo_producto: dt.cod_material_dist,
                    //     descripcion_producto: dt.material_dist,
                    //     precio_unitario: 0,
                    //     desde : formattedDate,
                    //     hasta : formattedDate,
                    //     s_ytd : "0",
                    //     s_mtd : "0",
                    // })
                }else{
                    const findObs = obs_ven.find(obs => obs.cod_ship_to == dt.cod_ship_to)
                    if(!findObs){
                        obs_ven.push(dt)
                    }
                }
            }
            
            // const getVentasSo = await prisma.ventas_so.findMany({
            //     where: {
            //         pro_so_id: null
            //     },
            //     select: {
            //         m_cl_grow: true,
            //         codigo_distribuidor: true,
            //         codigo_producto: true,
            //         descripcion_producto: true,
            //         precio_unitario: true,
            //     },
            // })

            // let data_master_productos_so = []

            // getVentasSo.map(ven => {
            //     data_master_productos_so.push({
            //         m_cl_grow: ven.m_cl_grow,
            //         m_pro_grow: null,
            //         codigo_distribuidor: ven.codigo_distribuidor,
            //         codigo_producto: ven.codigo_producto,
            //         descripcion_producto: ven.descripcion_producto,
            //         precio_unitario: ven.precio_unitario,
            //         desde : formattedDate,
            //         hasta : formattedDate,
            //         s_ytd : "0",
            //         s_mtd : "0",
            //     })
            // })

            // await prisma.master_productos_so.createMany({
            //     data: data_master_productos_so
            // })

            res.status(200).json({
                respuesta: true,
                message: message,
                data: data,
                observations: obs_ven,
            })
        }else{
            res.status(500).json({
                respuesta: false,
                message: message,
                data: ''
            })
        }
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