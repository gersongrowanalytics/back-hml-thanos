const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetActualizarYTDMTD = async ( req, res, ex_data ) => {

    const mpss = await prisma.master_productos_so.findMany({
        where: {
            homologado : false
        }
    })


    // OBTENER EL MES Y AÑO ACTUAL

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth()).padStart(2, '0');
    const formattedDate = `${year}-${month}`;
    let contador = 0;

    for await(const quer of mpss){
        const total_v = await prisma.$queryRawUnsafe(`SELECT sum(vs.precio_total_sin_igv) as suma_total FROM ventas_so as vs JOIN master_productos_so as mps ON mps.pk_extractor_venta_so = vs.pk_extractor_venta_so WHERE mps.homologado = ${false} AND mps.pk_venta_so = "${quer.pk_venta_so}" AND vs.fecha LIKE "${year}-%"` )

        await prisma.master_productos_so.update({
            where: {
                id : quer.id
            },
            data: {
                s_mtd : total_v[0]['suma_total'],
                s_ytd : total_v[0]['suma_total'] 
            }
        })

        contador++;
    }

    return res.status(200).json({
        response    : true,
        message     : 'Se actualizo correctamente los montos s_mtd y s_ytd',
        data : mpss
    })

}

controller.MetActualizarYTDMTDBK = async ( req, res, ex_data ) => {

    try{
        
        let arr_pk_extractor_so = []
        let arr_duplicados_pk_extractor_so = []

        const ventas_so = await prisma.ventas_so.findMany({
            distinct: ['pk_venta_so'],
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
                    pk_venta_so : vso.pk_venta_so
                },
            });

            console.log("-------------------------");
            console.log(vso.pk_venta_so);
            console.log(total_v._sum.precio_total_sin_igv);
            console.log("-------------------------");
            
            const totalytdmtd = total_v?._sum?.precio_total_sin_igv

            await prisma.master_productos_so.updateMany({
                where : {
                    pk_venta_so : vso.pk_venta_so
                },
                data: {
                    s_mtd : totalytdmtd ? parseFloat(totalytdmtd) : 0,
                    s_ytd : totalytdmtd ? parseFloat(totalytdmtd) : 0
                }
            })

            pk_extr = arr_pk_extractor_so.find(pk_extractor => pk_extractor == vso.pk_venta_so)
            if(!pk_extr){
                arr_pk_extractor_so.push(vso.pk_venta_so)
            }else{
                arr_duplicados_pk_extractor_so.push(vso.pk_venta_so)
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

controller.MetActualizarMClientes = async ( req, res ) => {

    let data = []

    try{
        data = await prisma.master_productos_so.findMany({
            select: {
                id: true,
                codigo_producto: true,
                codigo_distribuidor: true,
                codigo_destinatario: true,
                m_cl_grow: true,
            },
            where: {
                codigo_distribuidor: null,
            },
            include: {
                masterclientes_grow: {
                    select: {
                        id: true,
                        m_cl_grow: true,
                    },
                },
            },
        });

    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de actualizar los registros',
            devmsg  : error
        })
    }finally{

        await prisma.$disconnect();
        res.status(200)
        return res.json({
            message     : 'Se han actualizado correctamente',
            response    : true,
            data : data
        })
    }
  
    

}

module.exports = controller