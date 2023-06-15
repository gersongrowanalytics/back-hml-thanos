const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarHomologados = async (req, res) => {

    const page = req.query.page;
    const req_total = req.query.total;

    const {
        req_region,
        req_cod_prod_not,
        req_pro_not_hml,
        req_cod_pro_hml,
        req_prod_hml,
        req_desde,
        req_column,
        req_orden
    } = req.body

    try{

        let query_order = {}

        if(req_orden){
            if(req_column == 'territorio' || req_column == 'codigo_destinatario'){

                query_order = {...query_order, masterclientes_grow : { [req_column] : req_orden}}

            }else if(req_column == 'descripcion_producto' || req_column == 'desde'){

                query_order = {...query_order, [req_column] : req_orden}

            }else if(req_column == 'codigo_material' || req_column == 'material_softys'){

                query_order = {...query_order, master_productos_grow : { [req_column] : req_orden}}
            }
        }else{
            query_order = {...query_order, updated_at: 'desc'}
        }

        const productos_hml = await prisma.master_productos_so.findMany({
            where: {
                m_pro_grow : {
                    not: null
                },
                masterclientes_grow : {
                    territorio : {
                        contains : req_region,
                    },
                    codigo_destinatario : {
                        contains : req_cod_prod_not,
                    }
                },
                descripcion_producto : {
                    contains : req_pro_not_hml
                },
                master_productos_grow : {
                    codigo_material : {
                        contains : req_cod_pro_hml
                    },
                    material_softys : {
                        contains : req_prod_hml
                    }
                },
                desde : {
                    contains : req_desde
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
                masterclientes_grow : {
                    select : {
                        cliente_hml: true,
                        territorio : true, // En el front se muestra región, validar con Jazmin
                        codigo_destinatario : true,
                        sucursal_hml : true
                    }
                },
                // master_productos: {
                //     select: {
                //         cod_producto : true,
                //         nomb_producto : true
                //     }
                // },
                master_productos_grow: {
                    select: {
                        codigo_material : true,
                        material_softys : true
                    }
                },
                id : true,
                codigo_producto : true,
                descripcion_producto : true,
                desde : true,
                hasta : true,
                combo: true,
                pk_venta_so: true,
                pk_venta_so_hml : true
            },
            orderBy: query_order,
            distinct : ['pk_venta_so_hml'],
            take: 10,
            skip: (page - 1) * 10
        })

        let total = []
        if(req_total == 'true'){
            total = await prisma.master_productos_so.findMany({
                where: {
                    m_pro_grow : {
                        not: null
                    },
                    masterclientes_grow : {
                        territorio : {
                            contains : req_region,
                        },
                        codigo_destinatario : {
                            contains : req_cod_prod_not,
                        }
                    },
                    descripcion_producto : {
                        contains : req_pro_not_hml
                    },
                    master_productos_grow : {
                        codigo_material : {
                            contains : req_cod_pro_hml
                        },
                        material_softys : {
                            contains : req_prod_hml
                        }
                    },
                    desde : {
                        contains : req_desde
                    }
                },
                distinct : ['pk_venta_so_hml'],
            })
        }
        productos_hml.map((pro, index) => {
            productos_hml[index]['key'] = index
        })
        
        res.status(200)
        res.json({
            message : 'Productos homologados obtenidos correctamente',
            data    : productos_hml,
            respuesta : true,
            total : total.length
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