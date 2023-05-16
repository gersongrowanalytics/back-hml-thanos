const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const controller = {}

controller.MetEditarHomologados = async (req, res) => {

    const { 
        producto_so_id,
        producto_hml_id
    } = req.body;

    try{

        await prisma.master_productos_so.update({
            where: {
                id : producto_so_id
            },

            data: {
                proid : producto_hml_id
            }
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de editar homologados',
            devmsg  : error,
            respuesta : false
        })
    } finally {
        await prisma.$disconnect()
        res.status(200)
        res.json({
            message : 'El producto ha sido actualizado correctamente',
            respuesta : true
        })
    }
}


module.exports = controller