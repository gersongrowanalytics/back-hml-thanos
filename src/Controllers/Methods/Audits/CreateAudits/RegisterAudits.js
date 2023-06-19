const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const controller = {}

controller.MetRegisterAudits = async (re_tipo, re_token, re_audip, re_jsonentrada, re_jsonsalida, re_message, re_accion, re_ruta, re_log, re_pk) => {
    try {
        const idUser = await prisma.usuusuarios.findFirst({
            where: {
                usutoken: re_token
            },
            select: {
                usuid: true,
            }
        })

        await prisma.audauditorias.create({
            data: {
                tpaid: re_tipo,
                usuid: idUser ? idUser.usuid : null,
                audip: re_audip,
                audjsonentrada: JSON.stringify(re_jsonentrada),
                audjsonsalida: JSON.stringify(re_jsonsalida),
                auddescripcion: re_message,
                audaccion: re_accion,
                audruta: re_ruta,
                audlog: re_log,
                audpk: re_pk ? JSON.stringify(re_pk) : re_pk,
            }
        })

        return true
    }catch(error){
        console.log(error);
        return true
    }
}

module.exports = controller