const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const controller = {}

controller.MetRegistrarHomologacion = async (req, res) => {

    const { usu_token } = req.header

    const { 
        producto_so_id,
        producto_hml_id,
        req_envio_otros,
        productos_so_ids,
        producto_uni_medida
    } = req.body;



    try{

        const usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : usu_token
            },
            select : {
                perpersonas : {
                    select : {
                        perid : true
                    }
                }
            }
        })

        let cod_unidad_medida   = producto_uni_medida
        let unidad_medida       = producto_uni_medida

        if(producto_uni_medida){
            if(producto_uni_medida.length > 3){
                cod_unidad_medida   = producto_uni_medida.substring(0,3)
                unidad_medida       = producto_uni_medida
            }
        }

        if(req_envio_otros == true){

            for await (let so_id of productos_so_ids){
                await prisma.master_productos_so.update({
                    where: {
                        id : so_id
                    },
        
                    data: {
                        // proid : producto_hml_id
                        m_pro_grow : 268,
                        homologado : true,
                        perid : usu.perpersonas.perid
                    }
                })
            }

        }else{
            await prisma.master_productos_so.update({
                where: {
                    id : producto_so_id
                },
    
                data: {
                    // proid               : producto_hml_id,
                    m_pro_grow          : 268,
                    cod_unidad_medida   : cod_unidad_medida,
                    unidad_medida       : unidad_medida,
                    homologado          : true,
                    perid : usu.perpersonas.perid
                }
            })
        }

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error,
            respuesta : false
        })
    } finally {
        await prisma.$disconnect()
        res.status(200)
        res.json({
            message : 'El producto ha sido homologado correctamente',
            respuesta : true
        })
    }
}


module.exports = controller