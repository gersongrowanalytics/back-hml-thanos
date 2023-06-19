const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCreateAudits = async (req, res) => {

    const { usutoken } = req.header

    const {
        re_tpaid,
        re_audip,
        re_audjsonentrada,
        re_audjsonsalida,
        re_auddescripcion,
        re_audaccion,
        re_audruta,
        re_audlog,
        re_audpk,
    } = req.body

    try{
        const idUser = await prisma.usuusuarios.findFirst({
            where: {
                usutoken: usutoken
            },
            select: {
                usuid: true,
            }
        })

        await prisma.audauditorias.create({
            data: {
                tpaid: re_tpaid,
                usuid: idUser ? idUser.usuid : null,
                audip: re_audip,
                audjsonentrada: JSON.stringify(re_audjsonentrada),
                audjsonsalida: JSON.stringify(re_audjsonsalida),
                auddescripcion: re_auddescripcion,
                audaccion: re_audaccion,
                audruta: re_audruta,
                audlog: re_audlog,
                audpk: re_audpk,
            }
        })

        await prisma.$disconnect()
        res.status(200)
        res.json({
            message : 'La auditoria fue creada exitosamente.',
            respuesta : true
        })
    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de crear una auditoria',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller