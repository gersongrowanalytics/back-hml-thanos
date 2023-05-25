const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ObtenerInfoInventarioController = require('../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/InfoInventarios/InfoInventarios')

controller.MetObtenerNoHomologadosMaster = async ( req, res ) => {

    const {
        req_pk_venta_so
    } = req.body

    try{
        const mpso = await prisma.master_productos_so.findMany({
            where : {
                pk_venta_so : req_pk_venta_so
            },
            select : {
                proid                   : true,
                m_dt_id                 : true,
                pk_venta_so             : true,
                pk_extractor_venta_so   : true,
                codigo_distribuidor     : true,
                codigo_producto         : true,
                cod_unidad_medida       : true,
                unidad_medida           : true,
                descripcion_producto    : true,
                precio_unitario         : true,
                ruc                     : true,
                desde                   : true,
                hasta                   : true,
                s_ytd                   : true,
                s_mtd                   : true
            }
        })

        console.log(mpso.length)

        let exist_inv = false
        for await (const mps of mpso ){
            let inv = await ObtenerInfoInventarioController.MetInfoInventariosProductosNoHomologados(mps.pk_extractor_venta_so, true)
            if(inv?.length > 0){
                exist_inv = true
                mps['inventario'] = inv
            }else{
                mps['inventario'] = {}
            }
        }

        if(!exist_inv && mpso.length > 0){

            const invo = await ObtenerInfoInventarioController.MetInfoInventariosProductosNoHomologados(req_pk_venta_so, false)

            mpso.push({
                proid: null,
                m_dt_id: mpso[0]['m_dt_id'],
                pk_venta_so: mpso[0]['pk_venta_so'],
                pk_extractor_venta_so: mpso[0]['pk_venta_so'].toString() + mpso[0]['cod_unidad_medida'].toString() + mpso[0]['unidad_medida'],
                codigo_distribuidor: mpso[0]['codigo_distribuidor'],
                codigo_producto: mpso[0]['codigo_producto'],
                cod_unidad_medida : invo.cod_unidad_medida,
                unidad_medida : invo.unidad_medida,
                descripcion_producto : mpso[0]['descripcion_producto'],
                precio_unitario : 0,
                ruc : 0,
                desde : "2023-05-15 00:00:00",
                hasta : "2023-05-17 00:00:00",
                s_ytd : 0,
                s_mtd : 0,
                inventario : invo
            })
        }

        res.status(200).json({
            response    : true,
            message     : 'Información de producto no homologado obtenida con éxito',
            data        : mpso
        })

    }catch(err){
        console.log(err)
        res.status(200).json({
            msgdev      : err,
            response    : false,
            message     : 'Ha ocurrido un error al obtener la data del producto no homologado'
        })
    }
}

module.exports = controller