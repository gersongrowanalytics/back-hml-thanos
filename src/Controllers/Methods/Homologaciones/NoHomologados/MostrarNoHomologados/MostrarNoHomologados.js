const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarNoHomologados = async (req, res) => {

    let page = req.query.page

    const {
        req_cliente_hml,
        req_territorio,
        req_cod_producto,
        req_des_producto,
        req_desde,
        req_ytd,
        req_mtd,
        req_total,
        req_column,
        req_orden
    } = req.body;

    let total = []
    let productosSinProid

    try{

        let query_order = {}

        if(req_orden == null){
            query_order = {...query_order, updated_at: 'desc'}
        }
        else if(req_column == 'cliente_hml' || req_column == 'territorio'){
            query_order = {...query_order, masterclientes_grow : { [req_column] : req_orden } }
        }else{

            if(req_column == 's_ytd' || req_column == 's_mtd'){
                if(req_column == 's_ytd'){
                    query_order = {...query_order, s_ytd_value : req_orden }
                }else{
                    query_order = {...query_order, s_mtd_value : req_orden }
                }
            }else{
                query_order = {...query_order, [req_column] : req_orden }
            }
        }

        if(req_total){

            total = await prisma.master_productos_so.findMany({
                where : {
                    homologado : false,
                    masterclientes_grow : {
                        cliente_hml : {
                            contains : req_cliente_hml
                        },
                        territorio : {
                            contains : req_territorio
                        }
                    },
                    codigo_producto : {
                        contains : req_cod_producto
                    },
                    descripcion_producto : {
                        contains : req_des_producto
                    },
                    s_ytd : {
                        startsWith : req_ytd
                    },
                    s_mtd : {
                        startsWith : req_mtd
                    },
                },
                distinct : ['pk_venta_so']
            })

            if((total.length)/10 < page){
                page = Math.ceil((total.length)/10)
            }
            if(total.length == 0){
                page = 1
            }
        }
        
        productosSinProid = await prisma.master_productos_so.findMany({
            select: {
                master_distribuidoras: {
                    select: {
                        nomb_dt     : true,
                        region      : true,
                        codigo_dt   : true
                    }
                },
                masterclientes_grow : {
                    select : {
                        cliente_hml         : true,
                        territorio          : true, // En el front se muestra región, validar con Jazmin
                        codigo_destinatario : true,
                        sucursal_hml        : true
                    }
                },
                id                      : true,
                m_dt_id                 : true,
                codigo_distribuidor     : true,
                codigo_producto         : true,
                descripcion_producto    : true,
                desde                   : true,
                hasta                   : true,
                s_ytd                   : true,
                s_mtd                   : true,
                pk_venta_so             : true,
                pk_extractor_venta_so   : true,
                cod_unidad_medida       : true,
                unidad_medida           : true,
                ruc                     : true,
                posible_combo : true,
            },
            where : {
                homologado : false,
                masterclientes_grow : {
                    cliente_hml : {
                        contains : req_cliente_hml
                    },
                    territorio : {
                        contains : req_territorio
                    }
                },
                codigo_producto : {
                    contains : req_cod_producto
                },
                descripcion_producto : {
                    contains : req_des_producto
                },
                desde : {
                    contains : req_desde
                },
                s_ytd : {
                    startsWith : req_ytd
                },
                s_mtd : {
                    startsWith : req_mtd
                },
            },
            orderBy : query_order,
            distinct : ['pk_venta_so'],
            take : 10,
            skip : (page - 1) * 10
        })

        productosSinProid.map((pro, index) => productosSinProid[index]['key']  = index)

        productosSinProid.map((produt, pos) => {
            productosSinProid[pos]['s_mtd'] = parseFloat(produt.s_mtd)
            productosSinProid[pos]['s_ytd'] = parseFloat(produt.s_ytd)
            productosSinProid[pos]['cliente_hml'] = produt.masterclientes_grow.cliente_hml
            productosSinProid[pos]['territorio'] = produt.masterclientes_grow.territorio
        })
        
    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }finally{
        await prisma.$disconnect()
        res.status(200)
        return res.json({
            message     : 'Productos no homologados obtenidos correctamente',
            data        : productosSinProid,
            total_data  : total.length,
            respuesta   : true
        })
    }
}


module.exports = controller