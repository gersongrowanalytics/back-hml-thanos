const controller = {}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')

controller.MetLogOut = async (user, res) => {
    let response = true
    let message = "El usuario hizo logout"

    const token = crypto.randomBytes(30).toString('hex')
    
    try {
        // await prisma.usuusuarios.update({
        //     where: { usuid: user.usuid },
        //     data: { usutoken: token },
        // })

        

    } catch (error) {
        response = false
        message  = "Lo sentimos el usuario no pudo deslogearse"
        console.error(error)
        return res.status(500)
    } finally {
        await prisma.$disconnect()
        res.status(200)
        return res.json({
            response,
            message
        }).end()
    }
}

module.exports = controller