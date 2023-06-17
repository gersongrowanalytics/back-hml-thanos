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

    try{


        let total = []

        let query_order = {}

        if(req_orden == null){
            query_order = {...query_order, updated_at: 'desc'}
        }
        else if(req_column == 'cliente_hml' || req_column == 'territorio'){
            query_order = {...query_order, masterclientes_grow : { [req_column] : req_orden } }
        }else{
            query_order = {...query_order, [req_column] : req_orden }
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
                    OR : [
                        {
                            s_ytd : {
                                contains : req_ytd
                            },
                        },
                        {
                            s_ytd : null
                        }
                    ],
                    OR : [
                        {
                            s_mtd : {
                                contains : req_mtd
                            },
                        },
                        {
                            s_mtd : null
                        }
                    ]
                },
                orderBy : {
                    updated_at: 'desc'
                },
                distinct : ['pk_venta_so']
            })
        }

        if(Math.ceil(total.length/10) < page){
            page = total.length/10
        }

        const productosSinProid = await prisma.master_productos_so.findMany({
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
                ruc                     : true
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
                OR : [
                    {
                        s_ytd : {
                            contains : req_ytd
                        },
                        
                    },
                    {
                        s_ytd : null
                       
                    }
                ],
                OR : [
                    {
                        s_mtd : {
                            contains : req_mtd
                        }
                    },
                    {
                        s_mtd : null
                    }                    
                ]
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
        })
        
        res.status(200)
        return res.json({
            message     : 'Productos no homologados obtenidos correctamente',
            data        : productosSinProid,
            total_data  : total.length,
            respuesta   : true
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