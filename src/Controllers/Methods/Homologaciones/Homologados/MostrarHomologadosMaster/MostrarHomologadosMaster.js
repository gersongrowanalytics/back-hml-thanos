const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ObtenerInfoInventarioController = require('../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/InfoInventarios/InfoInventarios')

controller.MetObtenerHomologadosMaster = async ( req, res ) => {

    const {
        req_pk_venta_so
    } = req.body

    try{
        const mpso = await prisma.master_productos_so.findMany({
            where : {
                pk_venta_so : req_pk_venta_so
            },
            select : {
                id                      : true,
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
                s_mtd                   : true,
                unidad_minima           : true,
                cod_unidad_medida_hml   : true,
                unidad_medida_hml       : true,
                coeficiente             : true,
                unidad_minima_unitaria  : true,
                bonificado              : true,
                master_productos: {
                    select: {
                        id: true,
                        cod_producto: true,
                        nomb_producto : true,
                        paquetexbulto: true,
                    }
                },
            },
            orderBy: {
                pk_extractor_venta_so: 'desc'
            },
        })

        let exist_inv = false
        for await (const mps of mpso ){
            let inv = await ObtenerInfoInventarioController.MetInfoInventariosProductosNoHomologados(mps.pk_extractor_venta_so, true)
            // if(inv?.length > 0){
            if(inv){
                exist_inv = true
                mps['inventario'] = {}
            }else{
                mps['inventario'] = {}
            }
        }

        // if(!exist_inv && mpso.length > 0){

        //     const invo = await ObtenerInfoInventarioController.MetInfoInventariosProductosNoHomologados(req_pk_venta_so, false)

        //     if(invo){
        //         mpso.push({
        //             proid: null,
        //             id: null,
        //             m_dt_id: mpso[0]['m_dt_id'],
        //             pk_venta_so: mpso[0]['pk_venta_so'],
        //             pk_extractor_venta_so: mpso[0]['pk_venta_so'].toString() + invo.cod_unidad_medida.toString() + invo.unidad_medida.toString(),
        //             codigo_distribuidor: mpso[0]['codigo_distribuidor'],
        //             codigo_producto: mpso[0]['codigo_producto'],
        //             cod_unidad_medida : invo.cod_unidad_medida,
        //             unidad_medida : invo.unidad_medida,
        //             descripcion_producto : mpso[0]['descripcion_producto'],
        //             precio_unitario : 0,
        //             ruc : 0,
        //             desde : "2023-05-15 00:00:00",
        //             hasta : "2023-05-17 00:00:00",
        //             s_ytd : 0,
        //             s_mtd : 0,
        //             unidad_minima: 0,
        //             cod_unidad_medida_hml: 0,
        //             unidad_medida_hml: 0,
        //             coeficiente: 0,
        //             unidad_minima_unitaria: 0,
        //             bonificado: 0,
        //             inventario : invo
        //         })
        //     }

        // }

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