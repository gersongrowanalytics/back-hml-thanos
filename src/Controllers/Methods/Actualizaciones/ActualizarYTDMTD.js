const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetActualizarYTDMTD = async ( req, res, ex_data ) => {

    try{
        
        let arr_pk_extractor_so = []
        let arr_duplicados_pk_extractor_so = []

        const ventas_so = await prisma.ventas_so.findMany({
            distinct: ['pro_so_id'],
            where:{
                created_at: {
                    gte: new Date('2023-08-09T00:00:00')
                }
            }
        })


        for await(const vso of ventas_so){

            const total_v = await prisma.ventas_so.aggregate({
                _sum: {
                    precio_total_sin_igv : true
                },
                where: {
                    pro_so_id : vso.pro_so_id
                },
            });

            console.log("-------------------------");
            console.log(vso.pro_so_id);
            console.log(total_v._sum.precio_total_sin_igv);
            console.log("-------------------------");
            
            const totalytdmtd = total_v?._sum?.precio_total_sin_igv

            await prisma.master_productos_so.update({
                where : {
                    id : vso.pro_so_id,
                },
                data: {
                    s_mtd : totalytdmtd ? parseFloat(totalytdmtd) : 0,
                    s_ytd : totalytdmtd ? parseFloat(totalytdmtd) : 0
                }
            })

            pk_extr = arr_pk_extractor_so.find(pk_extractor => pk_extractor == vso.pro_so_id)
            if(!pk_extr){
                arr_pk_extractor_so.push(vso.pro_so_id)
            }else{
                arr_duplicados_pk_extractor_so.push(vso.pro_so_id)
            }

        }

        return res.status(200).json({
            response    : true,
            message     : 'Se cargó master productos grow correctamente',
            "arr_pk_extractor_so" : arr_pk_extractor_so,
            "arr_duplicados_pk_extractor_so" : arr_duplicados_pk_extractor_so
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master productos grow'
        })
    }
}

module.exports = controller