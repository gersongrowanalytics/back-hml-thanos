const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment')

controller.MetActualizarHomologacion = async ( req, res ) => {

    const {
        req_datos_homologados,
        req_select_product_so,
        req_rango_fecha
    } = req.body

    try{

        for await (const dhm of req_datos_homologados ){
            let data_mpso = { proid : dhm.req_id_producto_homologado, unidad_minima: dhm.req_unidad_minima_homologado }
            if(dhm.req_combo){
                data_mpso = { ...data_mpso, 
                                combo                   : dhm.req_combo, 
                                cod_unidad_medida_hml   : dhm.req_cod_unidad_medida_homologado,
                                unidad_medida_hml       : dhm.req_unidad_medida_homologado,
                                coeficiente             : dhm.req_coeficiente,
                                unidad_minima_unitaria  : dhm.req_unidad_minima_unitario,
                                bonificado              : dhm.req_bonificado,
                                desde                   : moment(req_rango_fecha.desde).format('YYYY-MM-DD').toString(),
                                hasta                   : moment(req_rango_fecha.hasta).format('YYYY-MM-DD').toString(),
                            }
            }
            if(dhm.req_id){
                await prisma.master_productos_so.update({
                    where : {
                        id : dhm.req_id
                    },
                    data : data_mpso
                })
            }else{
                if(dhm.req_combo){
                    await prisma.master_productos_so.create({
                        data : {
                            proid : dhm.req_id_producto_homologado,
                            m_dt_id : req_select_product_so.m_dt_id,
                            pk_venta_so : req_select_product_so.pk_venta_so,
                            pk_extractor_venta_so : req_select_product_so.pk_extractor_venta_so,
                            codigo_distribuidor : req_select_product_so.codigo_distribuidor,
                            codigo_producto : req_select_product_so.codigo_producto,
                            cod_unidad_medida : req_select_product_so.cod_unidad_medida,
                            unidad_medida : req_select_product_so.unidad_medida,
                            descripcion_producto : req_select_product_so.descripcion_producto,
                            precio_unitario : 0, // EVALUAR
                            ruc : req_select_product_so.ruc,
                            desde : moment(req_rango_fecha.desde).format('YYYY-MM-DD').toString(),
                            hasta : moment(req_rango_fecha.hasta).format('YYYY-MM-DD').toString(),
                            s_ytd : "0",
                            s_mtd : "0",
                            unidad_minima : dhm.req_unidad_minima_homologado,
                            combo : dhm.req_combo,
                            cod_unidad_medida_hml   : dhm.req_cod_unidad_medida_homologado,
                            unidad_medida_hml       : dhm.req_unidad_medida_homologado,
                            coeficiente             : dhm.req_coeficiente,
                            unidad_minima_unitaria  : dhm.req_unidad_minima_unitario,
                            bonificado              : dhm.req_bonificado
                        }
                    })
                }else{
                    await prisma.master_productos_so.create({
                        data : {
                            proid : dhm.req_id_producto_homologado,
                            m_dt_id : req_select_product_so.m_dt_id,
                            pk_venta_so : req_select_product_so.pk_venta_so,
                            pk_extractor_venta_so : req_select_product_so.pk_extractor_venta_so,
                            codigo_distribuidor : req_select_product_so.codigo_distribuidor,
                            codigo_producto : req_select_product_so.codigo_producto,
                            cod_unidad_medida : req_select_product_so.cod_unidad_medida,
                            unidad_medida : req_select_product_so.unidad_medida,
                            descripcion_producto : req_select_product_so.descripcion_producto,
                            precio_unitario : 0, // EVALUAR
                            ruc : req_select_product_so.ruc,
                            desde : moment(req_rango_fecha.desde).format('YYYY-MM-DD').toString(),
                            hasta : moment(req_rango_fecha.hasta).format('YYYY-MM-DD').toString(),
                            s_ytd : "0",
                            s_mtd : "0",
                            unidad_minima : dhm.req_unidad_minima_homologado,
                            combo : dhm.req_combo
                        }
                    })
                }
            }
        }

        res.status(200).json({
            message     : 'Producto homologado con éxito',
            response    : true,
        })    

    }catch(err){
        console.log(err)
        res.status(500).json({
            message     : 'Ha ocurrido un error al actualizar la homologación',
            response    : false,
            devmsg      : err
        })    
    }

}

module.exports = controller