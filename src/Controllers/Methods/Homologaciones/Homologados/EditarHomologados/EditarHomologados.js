const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const RegisterAudits = require('../../../Audits/CreateAudits/RegisterAudits')

controller.MetEditarHomologados = async (req, res) => {

    const { usutoken } = req.headers

    const { 
        producto_so_id,
        producto_hml_id
    } = req.body

    let message = 'El producto ha sido actualizado correctamente'
    let devmsg = ''
    let respuesta = true
    let jsonentrada = {
        producto_so_id,
        producto_hml_id,
    }
    let jsonsalida

    try{

        await prisma.master_productos_so.update({
            where: {
                id : producto_so_id
            },
            data: {
                proid : producto_hml_id
            }
        })

        audpk = ["master_productos_so-"+producto_so_id]
        jsonsalida = { message, respuesta }
        await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'HOMOLOGADOS', 'EDITAR', '/approvals/upload-approved', null, audpk)

    }catch(error){
        message = 'Lo sentimos hubo un error al momento de editar homologados'
        respuesta = false
        devmsg = error
        jsonsalida = { message, devmsg, respuesta }
        await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'HOMOLOGADOS', 'EDITAR', '/approvals/edit-approved', JSON.stringify(error.toString()), audpk)

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