const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarNoHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        const productosSinProid = await prisma.master_productos_so.findMany({
            select: {
                master_distribuidoras: {
                    select: {
                        nomb_dt: true,
                        region : true,
                        codigo_dt : true
                    }
                },
                masterclientes_grow : {
                    select : {
                        cliente_hml: true,
                        territorio : true, // En el front se muestra región, validar con Jazmin
                        codigo_destinatario : true,
                        sucursal_hml : true
                    }
                },
                id : true,
                m_dt_id : true,
                codigo_distribuidor : true,
                codigo_producto: true,
                descripcion_producto : true,
                desde : true,
                hasta : true,
                s_ytd : true,
                s_mtd : true,
                pk_venta_so: true,
                pk_extractor_venta_so: true,
                cod_unidad_medida : true,
                unidad_medida : true,
                ruc : true
            },
            where: {
                m_pro_grow : null
            },
            orderBy: {
                updated_at: 'desc'
            },
            distinct : ['pk_venta_so']
        })

        productosSinProid.map((pro, index) => productosSinProid[index]['key']  = index)

        productosSinProid.map((produt, pos) => {
            productosSinProid[pos]['s_mtd'] = parseFloat(produt.s_mtd)
            productosSinProid[pos]['s_ytd'] = parseFloat(produt.s_ytd)
            productosSinProid[pos]['cliente_hml'] = produt.masterclientes_grow.cliente_hml
            productosSinProid[pos]['territorio'] = produt.masterclientes_grow.territorio
        })
        
        res.status(200)
        return res.json({
            message : 'Productos no homologados obtenidos correctamente',
            data    : productosSinProid,
            respuesta : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
}


module.exports = controller