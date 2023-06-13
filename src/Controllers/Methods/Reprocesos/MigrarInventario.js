controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const AthenaQuery = require('./Helpers/AthenaQuery')

controller.MetMigrarInventario = async (req, res) => {
    const {
        dateRange
    } = req.body

    try{
        const separateDate = dateRange.split("/")
        const joinDate = separateDate[1]+""+separateDate[0]

        const query = `SELECT c_date, year, month, day, cod_ship_to, cod_almacen_dist, almacen_dist, cod_material_dist, material_dist, cod_tipo_inventario_dist, tipo_inventario_dist FROM "traditional_warehouse_supplier_inventories" WHERE c_date LIKE '${joinDate}%'`
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
                await prisma.inventarios.create({
                    data: {
                        m_cl_grow: idMaster.id,
                        c_date: data.c_date,
                        anio: parseInt(data.year),
                        mes: parseInt(data.month),
                        dia: parseInt(data.day),
                        codigo_distribuidor: data.cod_ship_to,
                        fecha: fechaSave,
                        codigo_producto: data.cod_material_dist,
                        descripcion_producto: data.material_dist,
                        cod_unidad_medida: data.cod_tipo_inventario_dist,
                        unidad_medida: data.tipo_inventario_dist,
                        precio_unitario: 0,
                        cod_almacen_dist: data.cod_almacen_dist,
                        almacen_dist: data.almacen_dist,
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

                await prisma.inventarios.create({
                    data: {
                        m_cl_grow: masterCreateId.id,
                        c_date: data.c_date,
                        anio: parseInt(data.year),
                        mes: parseInt(data.month),
                        dia: parseInt(data.day),
                        codigo_distribuidor: data.cod_ship_to,
                        fecha: fechaSave,
                        codigo_producto: data.cod_material_dist,
                        descripcion_producto: data.material_dist,
                        cod_unidad_medida: data.cod_tipo_inventario_dist,
                        unidad_medida: data.tipo_inventario_dist,
                        precio_unitario: 0,
                        cod_almacen_dist: data.cod_almacen_dist,
                        almacen_dist: data.almacen_dist,
                        extractor: true,
                    }
                })
            }
        }

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