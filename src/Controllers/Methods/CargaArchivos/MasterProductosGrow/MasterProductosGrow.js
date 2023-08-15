const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto')
const ActualizarStatusMasterProductsController = require('../../Status/EstadoPendiente/ActualizarStatusMasterProductos')

controller.MetMasterProductosGrow = async ( req, res, ex_data ) => {

    const {
        usutoken
    } = req.headers

    const {
        req_plataforma,
        req_usucorreo
    } = req.body

    try{

        let usu

        if(usutoken){
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usutoken : usutoken
                }
            })
        }else{
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usucorreo : req_usucorreo
                }
            })
            if(!usu){

                let per = await prisma.perpersonas.findFirst({
                    where : {
                        pernombre : 'Usuario'
                    }
                })

                usu = await prisma.usuusuarios.create({
                    data : {
                        tpuid                   : 1,
                        perid                   : per.perid,
                        usuusuario              : 'usuario@gmail.com',
                        usucorreo               : 'usuario@gmail.com',
                        estid                   : 1,
                        usutoken                : crypto.randomBytes(30).toString('hex'),
                        usupaistodos            : false,
                        usupermisosespeciales   : false,
                        usucerrosesion          : false,
                        usucierreautomatico     : false
                    }
                })
            }
        }
        let codigos_actualizados = []
        let nuevos_codigos = []

        if(usu.usuid == 1){
            controller.MetInserMasterProductsGrow(ex_data)
        }

        if(req_plataforma != "Subsidios"){
            req.body.req_usucorreo = usu.usucorreo
            req.body.req_plataforma = null   
        }
        await ActualizarStatusMasterProductsController.MetActualizarStatusMasterProductos(usutoken, null, usu.perid, req.files.maestra_producto, req) 

        return res.status(200).json({
            response    : true,
            message     : 'Se cargó master productos grow correctamente',
            nuevos_cod  : nuevos_codigos,
            codigo_act  : codigos_actualizados
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master productos grow'
        })
        
        return false
    }
}

controller.MetInserMasterProductsGrow = async ( ex_data ) => {

    try{

        let codigos_actualizados = []
        let nuevos_codigos = []
        for await(const data of ex_data ){
            const m_pro_grow = await prisma.master_productos_grow.findFirst({
                where : {
                    codigo_material : data.codigo_material
                },
                select : {
                    id : true
                }
            })
    
            if(m_pro_grow){
    
                await prisma.master_productos_grow.update({
                    where: {
                        id : m_pro_grow.id
                    },
                    data
                })
    
                codigos_actualizados.push({
                    "codigo_material" : data.codigo_material,
                    "material_softys" : data.material_softys
                })
    
            }else{
                await prisma.master_productos_grow.create({
                    data
                })
    
                nuevos_codigos.push({
                    "codigo_material" : data.codigo_material,
                    "material_softys" : data.material_softys
                })
            }
        }
        return true
    }catch(err){
        console.log(err)
        return false
    }
}

module.exports = controller