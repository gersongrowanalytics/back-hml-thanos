const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetShowDate = async (req, res) => {
    const{
    } = req.body

    try{
        const get_date = await prisma.fecfechas.findMany()

        await prisma.$disconnect()
        res.status(200).json({
            respuesta: true,
            message: "Se obtuvieron correctamente todas las fechas.",
            data: get_date
        })
    }catch(error){
        res.status(500).json({
            respuesta: false,
            message: "Lo sentimos, hubo un error al momento de cargar las fechas."
        })
    }
}

module.exports = controller 