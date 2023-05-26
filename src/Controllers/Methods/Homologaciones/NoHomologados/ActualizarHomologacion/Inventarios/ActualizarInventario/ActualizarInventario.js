const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



controller.MetActualizarInventario = async ( req, res ) => {

    try{

        let exists_mpso     = []
        let not_exists_mpso = []  

        const invo  = await prisma.inventarios.findMany({
            where : {
                pro_so_id : null
            },
            select : {
                id : true,
                pk_extractor_venta_so : true
            },
        })

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
                    }
                }

            }

        }

        res.status(200).json({
            response    : true,
            messagge    : 'Inventarios actualizado',
            exists_mpso,
            not_exists_mpso  
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