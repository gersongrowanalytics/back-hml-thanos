const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment');

controller.MetMostrarHomologados = async (req, res) => {

    let page = req.query.page;
    let req_total = req.query.total;

    const {
        req_region,
        req_cod_prod_not,
        req_pro_not_hml,
        req_cod_pro_hml,
        req_prod_hml,
        req_desde,
        req_column,
        req_orden,
        req_filtro_input,
        req_cliente_hml,
        req_updated_at,
        req_zona
    } = req.body

    let productos_hml
    let total = []

    try{

        let update_filter_less
        let update_filter_more
        let query_order = {}

        if(req_updated_at == ''){
            update_filter_more = moment('1999-01-01').format('YYYY-MM-DD')
            update_filter_less = moment().format('YYYY-MM-DD')
        }else{
            update_filter_more = moment(req_updated_at).format('YYYY-MM-DD')
            update_filter_less = moment(req_updated_at).format('YYYY-MM-DD')
        }


        const desde_modificado      = req_desde.split("/").reverse().join('-')

        if(req_orden){
            if(req_column == 'territorio' || req_column == 'codigo_destinatario' || req_column == 'cliente_hml' || req_column == 'zona'){

                query_order = {...query_order, masterclientes_grow : { [req_column] : req_orden}}

            }else if(req_column == 'descripcion_producto' || req_column == 'desde' || req_column == 'updated_at'){

                query_order = {...query_order, [req_column] : req_orden}

            }else if(req_column == 'codigo_material' || req_column == 'material_softys'){

                query_order = {...query_order, master_productos_grow : { [req_column] : req_orden}}
            }
        }else{
            query_order = {...query_order, updated_at: 'desc'}
        }

        if(req_total == 'true' || req_filtro_input == true){
            total = await prisma.master_productos_so.findMany({
                where: {
                    m_pro_grow : {
                        // not: null
                        not: 268
                    },
                    homologado : true,
                    masterclientes_grow : {
                        territorio : {
                            contains : req_region,
                        },
                        codigo_destinatario : {
                            contains : req_cod_prod_not,
                        },
                        cliente_hml : {
                            contains : req_cliente_hml
                        },
                        zona : {
                            contains : req_zona
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
                        contains : desde_modificado
                    },
                    updated_at : {
                        lte :  new Date(update_filter_less+'T23:59:59Z'),
                        gte :  new Date(update_filter_more+'T00:00:00Z'),
                    }
                },
                distinct : ['pk_venta_so_hml'],
            })
        }

        if(req_filtro_input){
            if((total.length)/15 < page){
                page = Math.ceil((total.length)/15)
            }
            if(total.length == 0){
                page = 1
            }
        }

        productos_hml = await prisma.master_productos_so.findMany({
            where: {
                m_pro_grow : {
                    not: null
                },
                homologado : true,
                masterclientes_grow : {
                    territorio : {
                        contains : req_region,
                    },
                    codigo_destinatario : {
                        contains : req_cod_prod_not,
                    },
                    cliente_hml : {
                        contains : req_cliente_hml
                    },
                    zona : {
                        contains : req_zona
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
                    contains : desde_modificado
                },
                updated_at : {
                    lte :  new Date(update_filter_less+'T23:59:59Z'),
                    gte :  new Date(update_filter_more+'T00:00:00Z'),
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
                        territorio : true,
                        codigo_destinatario : true,
                        sucursal_hml : true,
                        destinatario : true,
                        zona        : true
                    }
                },
                master_productos_grow: {
                    select: {
                        codigo_material : true,
                        material_softys : true
                    }
                },
                id                      : true,
                codigo_producto         : true,
                descripcion_producto    : true,
                desde                   : true,
                hasta                   : true,
                combo                   : true,
                pk_venta_so             : true,
                pk_venta_so_hml         : true,
                unidad_medida           : true,
                updated_at              : true,
            },
            orderBy: query_order,
            distinct : ['pk_venta_so_hml'],
            take: 15,
            skip: (page - 1) * 15
        })

        productos_hml.forEach((pro, index) => {
            productos_hml[index]['key'] = index
        });

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de mostrar los productos homologados',
            devmsg  : error,
            respuesta : false
        })
    }finally{

        await prisma.$disconnect()
        res.status(200)
        res.json({
            message : 'Productos homologados obtenidos correctamente',
            data    : productos_hml,
            respuesta : true,
            total : total.length
        })
    }
}

module.exports = controller