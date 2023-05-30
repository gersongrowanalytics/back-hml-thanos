const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        const productos_hml = await prisma.master_productos_so.findMany({
            where: {
                proid : {
                    not: null
                }
            },
            select: {
                master_distribuidoras: {
                    select: {
                        codigo_dt: true,
                        nomb_dt: true,
                        region : true
                    }
                },
                master_productos: {
                    select: {
                        cod_producto : true,
                        nomb_producto : true
                    }
                },
                id : true,
                codigo_producto : true,
                descripcion_producto : true,
                desde : true,
                hasta : true,
                combo: true,
                pk_venta_so: true
            },
            orderBy: {
                updated_at: 'desc'
            },
            distinct : ['pk_venta_so']
        })

        productos_hml.map((pro, index) => productos_hml[index]['key'] = index)
        
        res.status(200)
        res.json({
            message : 'Productos homologados obtenidos correctamente',
            data    : productos_hml,
            respuesta : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de mostrar los productos homologados',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller