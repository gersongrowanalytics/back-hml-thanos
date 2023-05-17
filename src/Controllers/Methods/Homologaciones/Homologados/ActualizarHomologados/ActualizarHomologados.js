const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const controller = {}

controller.MetActualizarHomologados = async (req, res) => {

    const { 
        producto_so_id,
        producto_hml_id,
        req_desde
    } = req.body;

    try{

        const producto_so = await prisma.master_productos_so.findUnique({
            where: {
                id : producto_so_id
            }
        })

        if(producto_so){
            await prisma.master_productos_so.create({
                data: {
                    proid : producto_hml_id,
                    m_dt_id : producto_so.m_dt_id,
                    codigo_distribuidor  : producto_so.codigo_distribuidor,
                    codigo_producto      : producto_so.codigo_producto,
                    descripcion_producto : producto_so.descripcion_producto,
                    precio_unitario      : producto_so.precio_unitario,
                    ruc   : producto_so.ruc,
                    desde : req_desde,
                    // hasta : producto_so.hasta,
                    s_ytd : producto_so.s_ytd,
                    s_mtd : producto_so.s_mtd
                }
            })
        }else{
            res.status(500)
            res.json({
                message : 'Lo sentimos no se encontro el producto seleccionado, recomendamos actualizar la pagina',
                respuesta : false
            })    
        }

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de actualizar homologados',
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