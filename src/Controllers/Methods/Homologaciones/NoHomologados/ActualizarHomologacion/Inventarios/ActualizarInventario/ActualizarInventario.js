const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



controller.MetActualizarInventario = async ( req, res ) => {

    try{

        let exists_mpso     = []
        let not_exists_mpso = []
        let crear_mpso      = false
        let list_mpso       = []

        const invo  = await prisma.inventarios.findMany({
            where : {
                pro_so_id : null
            },
            select : {
                id : true,
                pk_extractor_venta_so   : true,
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
            },
        })

        if(invo.length > 0){

            for await (const inv of invo ){

                let exist_pk_venta_so = not_exists_mpso.findIndex(pk => pk == inv.pk_extractor_venta_so)
    
                if(exist_pk_venta_so == -1){
                    let mps = exists_mpso.find(mp => mp.pk_extractor_venta_so == inv.pk_extractor_venta_so)
                    if(mps){
                        await prisma.inventarios.update({
                            where : {
                                id : inv.id
                            },
                            data : {
                                pro_so_id : mps.id_mpso
                            }
                        })
                    }else{
                        const mpsoo = await prisma.master_productos_so.findFirst({
                            where : {
                                pk_extractor_venta_so : inv.pk_extractor_venta_so
                            },
                            select : {
                                pk_extractor_venta_so : true,
                                id : true
                            }
                        })
        
                        if(mpsoo){
                            exists_mpso.push({pk_extractor_venta_so :mpsoo.pk_extractor_venta_so, id_mpso : mpsoo.id})
                            await prisma.inventarios.update({
                                where : {
                                    id : inv.id
                                },
                                data : {
                                    pro_so_id : mpsoo.id
                                }
                            })
                        }else{
                            not_exists_mpso.push(inv.pk_extractor_venta_so)
                            crear_mpso = true
                            list_mpso.push({
                                proid                   : null,
                                m_dt_id                 : inv.m_dt_id,
                                pk_venta_so             : inv.pk_venta_so,
                                pk_extractor_venta_so   : inv.pk_extractor_venta_so,
                                codigo_distribuidor     : inv.codigo_distribuidor,
                                codigo_producto         : inv.codigo_producto,
                                cod_unidad_medida       : inv.cod_unidad_medida,
                                unidad_medida           : inv.unidad_medida,
                                descripcion_producto    : inv.descripcion_producto,
                                precio_unitario         : inv.precio_unitario,
                                ruc                     : inv.ruc,
                                desde                   : null,
                                hasta                   : null,
                                s_ytd                   : null,
                                s_mtd                   : null,
                                unidad_minima           : null,
                                combo                   : false,
                                cod_unidad_medida_hml   : null,
                                unidad_medida_hml       : null,
                                coeficiente             : null,
                                unidad_minima_unitaria  : null,
                                bonificado              : false
                            })
                        }
                    }
                }
    
            }            
            if(crear_mpso){
                await prisma.master_productos_so.createMany({
                    data : list_mpso
                })
            }
        }

        res.status(200).json({
            response    : true,
            messagge    : 'Inventarios actualizado',
        })


    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : true,
            messagge    : 'Ha ocurrido un error al actualizar el inventario',
            msgdev      : err
        })
    }
}

module.exports = controller