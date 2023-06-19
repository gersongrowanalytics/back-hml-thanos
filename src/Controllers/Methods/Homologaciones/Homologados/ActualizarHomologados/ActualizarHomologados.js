const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const controller = {}
const RegisterAudits = require('../../../Audits/CreateAudits/RegisterAudits')

controller.MetActualizarHomologados = async (req, res) => {

    const { usutoken } = req.header

    const { 
        producto_so_id,
        producto_hml_id,
        req_desde,
        req_cod_producto_hml,
        producto_uni_medida
    } = req.body;

    let message = 'El producto ha sido actualizado correctamente'
    let respuesta = true
    let devmsg = ''
    let jsonentrada = {
        producto_so_id,
        producto_hml_id,
    }
    let jsonsalida
    let audpk = null

    try{

        let cod_unidad_medida   = producto_uni_medida
        let unidad_medida       = producto_uni_medida

        if(producto_uni_medida.length > 3){
            cod_unidad_medida   = producto_uni_medida.substring(0,3)
            unidad_medida       = producto_uni_medida
        }

        const producto_so = await prisma.master_productos_so.findUnique({
            where: {
                id : producto_so_id
            }
        })

        if(producto_so){
            const create_producto_so = await prisma.master_productos_so.create({
                data: {
                    m_pro_grow              : producto_hml_id,
                    m_dt_id                 : producto_so.m_dt_id,
                    codigo_distribuidor     : producto_so.codigo_distribuidor,
                    codigo_producto         : producto_so.codigo_producto,
                    descripcion_producto    : producto_so.descripcion_producto,
                    precio_unitario         : producto_so.precio_unitario,
                    ruc                     : producto_so.ruc,
                    desde                   : req_desde,
                    // hasta : producto_so.hasta,
                    s_ytd                   : producto_so.s_ytd,
                    s_mtd                   : producto_so.s_mtd,
                    m_cl_grow               : producto_so.m_cl_grow,
                    pk_venta_so_hml         : producto_so.pk_venta_so + req_cod_producto_hml,
                    pk_venta_so             : producto_so.pk_venta_so,
                    cod_unidad_medida       : cod_unidad_medida,
                    unidad_medida           : unidad_medida,
                    homologado              : true
                }
            })

            audpk = ["master_productos_so-"+create_producto_so.id]

            jsonsalida = { message, respuesta }
            await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'HOMOLOGADOS', 'ACTUALIZAR', '/approvals/upload-approved', null, audpk)
        }else{
            message = 'Lo sentimos no se encontro el producto seleccionado, recomendamos actualizar la pagina'
            respuesta = false
            jsonsalida = { message, respuesta }
            await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'HOMOLOGADOS', 'ACTUALIZAR', '/approvals/upload-approved', message, audpk)

            res.status(500)
            res.json({
                message,
                respuesta
            })    
        }

    }catch(error){
        message = 'Lo sentimos hubo un error al momento de actualizar homologados'
        devmsg = error
        respuesta = false
        jsonsalida = { message, devmsg, respuesta }
        await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'HOMOLOGADOS', 'ACTUALIZAR', '/approvals/upload-approved', JSON.stringify(error.toString()), audpk)

        console.log(error)
        res.status(500)
        res.json({
            message,
            devmsg,
            respuesta
        })
    } finally {
        await prisma.$disconnect()
        res.status(200)
        res.json({
            message,
            respuesta
        })
    }
}


module.exports = controller