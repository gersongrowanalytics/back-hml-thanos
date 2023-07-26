controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
// const AthenaQuery = require('../Helpers/AthenaQuery')

controller.MetMigrarInventario = async (req, res) => {
    // const {
    //     dateRange // formato mm/yyyy
    // } = req.body

    // try{
    //     const separateDate = dateRange.split("/")
    //     const joinDate = separateDate[1]+""+separateDate[0]

    //     const query = `SELECT c_date, year, month, day, cod_ship_to, cod_almacen_dist, almacen_dist, cod_material_dist, material_dist, cod_tipo_inventario_dist, tipo_inventario_dist, c_cod_material, c_material FROM "traditional_warehouse_supplier_inventories" WHERE c_date LIKE '${joinDate}%'`
    //     const { respuesta, data, message } = await AthenaQuery.MetAthenaQuery(query)

    //     if(respuesta){
    //         let obs_inv = []
    //         await prisma.inventarios.deleteMany({
    //             where: {
    //                 c_date: {
    //                     contains: joinDate,
    //                 },
    //                 extractor: true
    //             }
    //         })

    //         const ids = data.map(d => d.cod_ship_to)
    //         const filtrarIds = [...new Set(ids)]

    //         const idMaster = await prisma.masterclientes_grow.findMany({
    //             where: {
    //                 codigo_destinatario: {
    //                     in: filtrarIds
    //                 }
    //             },
    //             select: {
    //                 id: true,
    //                 codigo_destinatario: true,
    //             }
    //         })

    //         for await(const dt of data){
    //             const fechaSave = dt.year+"-"+dt.month
    //             const findMaster = idMaster.find(id => id.codigo_destinatario == dt.cod_ship_to)
    //             if(findMaster){
    //                 await prisma.inventarios.create({
    //                     data: {
    //                         m_cl_grow: findMaster.id,
    //                         c_date: dt.c_date,
    //                         anio: parseInt(dt.year),
    //                         mes: parseInt(dt.month),
    //                         dia: parseInt(dt.day),
    //                         codigo_distribuidor: dt.cod_ship_to,
    //                         fecha: fechaSave,
    //                         codigo_producto: dt.cod_material_dist,
    //                         descripcion_producto: dt.material_dist,
    //                         cod_unidad_medida: dt.cod_tipo_inventario_dist,
    //                         unidad_medida: dt.tipo_inventario_dist,
    //                         precio_unitario: 0,
    //                         cod_almacen_dist: dt.cod_almacen_dist,
    //                         almacen_dist: dt.almacen_dist,
    //                         extractor: true,
    //                     }
    //                 })
    //             }else{
    //                 const findObs = obs_inv.find(obs => obs.cod_ship_to == dt.cod_ship_to)
    //                 if(!findObs){
    //                     obs_inv.push(dt)
    //                 }
    //             }
    //         }

    //         res.status(200).json({
    //             respuesta: true,
    //             message: message,
    //             data: data,
    //             observations: obs_inv,
    //         })
    //     }else{
    //         res.status(500).json({
    //             respuesta: false,
    //             message: message,
    //             data: ''
    //         })
    //     }
    // }catch(error){
    //     console.log(error);
    //     res.status(500).json({
    //         respuesta: false,
    //         message: error,
    //         data: ''
    //     })
    // }
}

module.exports = controller