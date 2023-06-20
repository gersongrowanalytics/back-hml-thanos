const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
        req_destinatario,
        req_updated_at
    } = req.body

    try{

        let query_order = {}
        let total = []
        const desde_modificado      = req_desde.split("/").reverse().join('-')

        if(req_orden){
            if(req_column == 'territorio' || req_column == 'codigo_destinatario' || req_column == 'destinatario'){

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
                        destinatario : {
                            contains : req_destinatario
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
                    // updated_at : {
                    //     lte :  req_updated_at != '' ? new Date(updated_at_modificado_final_add_day) : new Date(),
                    //     gte :  req_updated_at != '' ? updated_at_modificado_final : new Date('1999-01-01'),
                    // }
                },
                distinct : ['pk_venta_so_hml'],
            })
        }

        if(req_filtro_input){
            if((total.length)/10 < page){
                page = Math.ceil((total.length)/10)
            }
            if(total.length == 0){
                page = 1
            }
        }


        const productos_hml = await prisma.master_productos_so.findMany({
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
                    destinatario : {
                        contains : req_destinatario
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
                // updated_at : {
                //     lte :  req_updated_at != ''  ? new Date(updated_at_modificado_final_add_day) : new Date(),
                //     gte :  req_updated_at != ''  ? updated_at_modificado_final : new Date('1999-01-01'),
                // }
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
                        destinatario : true
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
            take: 10,
            skip: (page - 1) * 10
        })

        productos_hml.forEach((pro, index) => {
            productos_hml[index]['key'] = index
        });

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