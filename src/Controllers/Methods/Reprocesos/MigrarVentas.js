controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const AthenaQuery = require('./Helpers/AthenaQuery')

controller.MetMigrarVentas = async (req, res) => {
    const {
        dateRange
    } = req.body

    try{
        const formattedDate = new Date().toISOString().slice(0, 10)
        const separateDate = dateRange.split("/")
        const joinDate = separateDate[1]+""+separateDate[0]

        const query = `SELECT c_date, year, month, day, cod_ship_to, cod_cliente_so, cliente_so, cod_material_dist, material_dist FROM "traditional_warehouse_supplier_sales" WHERE c_date LIKE '${joinDate}%'`
        const queryAthena = await AthenaQuery.MetAthenaQuery(query)

        for await(const data of queryAthena.data){
            const fechaSave = data.year+"-"+data.month
            const idMaster = await prisma.masterclientes_grow.findFirst({
                where: {
                    codigo_destinatario: data.cod_ship_to
                },
                select: {
                    id: true
                }
            })

            if(idMaster){
                await prisma.ventas_so.create({
                    data: {
                        m_cl_grow: idMaster.id,
                        c_date: data.c_date,
                        anio: parseInt(data.year),
                        mes: parseInt(data.month),
                        dia: parseInt(data.day),
                        codigo_distribuidor: data.cod_ship_to,
                        fecha: fechaSave,
                        codigo_cliente: data.cod_cliente_so,
                        cliente_so: data.cliente_so,
                        codigo_producto: data.cod_material_dist,
                        descripcion_producto: data.material_dist,
                        precio_unitario: 0,
                        extractor: true,
                    }
                })
            }else{
                const masterCreateId = await prisma.masterclientes_grow.create({
                    data: {
                        codigo_destinatario: data.cod_ship_to
                    },
                    select: {
                        id: true
                    }
                })

                await prisma.ventas_so.create({
                    data: {
                        m_cl_grow: masterCreateId.id,
                        c_date: data.c_date,
                        anio: parseInt(data.year),
                        mes: parseInt(data.month),
                        dia: parseInt(data.day),
                        codigo_distribuidor: data.cod_ship_to,
                        fecha: fechaSave,
                        codigo_cliente: data.cod_cliente_so,
                        cliente_so: data.cliente_so,
                        codigo_producto: data.cod_material_dist,
                        descripcion_producto: data.material_dist,
                        precio_unitario: 0,
                        extractor: true,
                    }
                })
            }
        }
        
        const getVentasSo = await prisma.ventas_so.findMany({
            where: {
                pro_so_id: null
            },
            select: {
                m_cl_grow: true,
                codigo_distribuidor: true,
                codigo_producto: true,
                descripcion_producto: true,
                precio_unitario: true,
            },
        })

        let data_master_productos_so = []

        getVentasSo.map(ven => {
            data_master_productos_so.push({
                m_cl_grow: ven.m_cl_grow,
                codigo_distribuidor: ven.codigo_distribuidor,
                codigo_producto: ven.codigo_producto,
                descripcion_producto: ven.descripcion_producto,
                precio_unitario: ven.precio_unitario,
                desde : formattedDate,
                hasta : formattedDate,
                s_ytd : "0",
                s_mtd : "0",
            })
        })

        await prisma.master_productos_so.createMany({
            data: data_master_productos_so
        })

        if(queryAthena.respuesta){
            res.status(200).json({
                respuesta: true,
                message: queryAthena.message,
                data: queryAthena.data
            })
        }else{
            res.status(500).json({
                respuesta: false,
                message: queryAthena.message,
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