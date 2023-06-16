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
        req_cod_producto_hml
    } = req.body;

    let message = 'El producto ha sido actualizado correctamente'
    let respuesta = true
    let devmsg = ''
    let jsonentrada = {
        producto_so_id,
        producto_hml_id,
    }
    let jsonsalida

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
                    s_mtd : producto_so.s_mtd,
                    m_cl_grow : producto_so.m_cl_grow,
                    pk_venta_so_hml: producto_so.pk_venta_so + req_cod_producto_hml,
                    pk_venta_so : producto_so.pk_venta_so 
                }
            })

            jsonsalida = { message, respuesta }
            await RegisterAudits.MetRegisterAudits(1, usutoken, 'ip', jsonentrada, jsonsalida, message, 'Actualizar HOMOLOGADOS', '/approvals/upload-approved', null, null)
        }else{
            message = 'Lo sentimos no se encontro el producto seleccionado, recomendamos actualizar la pagina'
            respuesta = false
            jsonsalida = { message, respuesta }
            await RegisterAudits.MetRegisterAudits(1, usutoken, 'ip', jsonentrada, jsonsalida, message, 'Actualizar HOMOLOGADOS', '/approvals/upload-approved', message, null)

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
        await RegisterAudits.MetRegisterAudits(1, usutoken, 'ip', jsonentrada, jsonsalida, message, 'Actualizar HOMOLOGADOS', '/approvals/upload-approved', JSON.stringify(error), null)

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