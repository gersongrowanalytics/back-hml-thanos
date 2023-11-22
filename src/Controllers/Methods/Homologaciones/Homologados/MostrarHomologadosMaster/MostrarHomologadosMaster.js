const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ObtenerInfoInventarioController = require('../../../../Methods/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/InfoInventarios/InfoInventarios')

controller.MetObtenerHomologadosMaster = async ( req, res ) => {

    const {
        req_pk_venta_so,
        req_pk_venta_so_hml,
        req_select_product
    } = req.body

    try{
        const mpso = await prisma.master_productos_so.findMany({
            where : {
                pk_venta_so_hml : req_select_product.pk_venta_so_hml
                // pk_venta_so : req_pk_venta_so
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
                master_productos_grow : {
                    select : {
                        id : true,
                        paquetes_bulto  : true,
                        codigo_material : true,
                        material_softys : true
                    }
                },
                masterclientes_grow : {
                    select : {
                        id: true,
                        cliente_hml: true,
                        territorio : true, // En el front se muestra región, validar con Jazmin
                        codigo_destinatario : true,
                        sucursal_hml : true
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
                mps['inventario'] = inv
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

        const get_data_hml = [
            {
                "cod_unidad_medida_hml": "UND",
                "unidad_medida_hml": "UNIDAD",
            },
            {
                "cod_unidad_medida_hml": "CJ",
                "unidad_medida_hml":  "CAJAS",
            },
            {
                "cod_unidad_medida_hml": "BUL",
                "unidad_medida_hml": "BULTOS",
            },
            {
                "cod_unidad_medida_hml": "OTROS",
                "unidad_medida_hml": "OTROS",
            }
        ]

        get_data_hml.map((m, index) => get_data_hml[index]['key'] = index)

        res.status(200).json({
            response    : true,
            message     : 'Información de producto no homologado obtenida con éxito',
            data        : mpso,
            data_hml    : get_data_hml,
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