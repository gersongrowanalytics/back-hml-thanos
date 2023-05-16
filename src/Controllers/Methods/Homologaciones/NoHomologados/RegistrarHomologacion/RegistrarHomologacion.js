const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const controller = {}

controller.MetRegistrarHomologacion = async (req, res) => {

    const { 
        producto_so_id,
        producto_hml_id,
        req_envio_otros,
        productos_so_ids
    } = req.body;

    try{


        if(req_envio_otros == true){

            await productos_so_ids.map(async (so_id) => {
                await prisma.master_productos_so.update({
                    where: {
                        id : so_id
                    },
        
                    data: {
                        proid : producto_hml_id
                    }
                })    
            })

        }else{
            await prisma.master_productos_so.update({
                where: {
                    id : producto_so_id
                },
    
                data: {
                    proid : producto_hml_id
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