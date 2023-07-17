const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetShowAudits = async (req, res) => {
    const{
    } = req.body

    try{
        const get_audits = await prisma.audauditorias.findMany({
            select:{
                audruta: true,
                audaccion: true,
                audlog: true,
                auddescripcion: true,
                audjsonentrada: true,
                audjsonsalida: true,
                created_at: true,
                usuusuarios: {
                    select: {
                        usuid: true,
                        usuusuario: true,
                        perpersonas: {
                            select: {
                                pernombrecompleto: true,
                            },
                        },
                        tputiposusuarios: {
                            select: {
                                tpunombre: true,
                            },
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        await prisma.$disconnect()
        res.status(200).json({
            respuesta: true,
            message: "Se cargaron las auditorias correctamente.",
            data: get_audits
        })
    }catch(error){
        res.status(500).json({
            respuesta: false,
            message: "Lo sentimos, hubo un error al momento de cargar las auditorias."
        })
    }
}

module.exports = controller 