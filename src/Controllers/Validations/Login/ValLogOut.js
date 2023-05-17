const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const LoginLogOut = require('../../Methods/Login/LogOut')

controller.ValLogOut = async (req, res) => {
    const { usutoken } = req.headers;
    try{
        const user = await prisma.usuusuarios.findFirst({
            where: { usutoken: usutoken },
            select: { usuid: true }
        })

        if(user){
            LoginLogOut.MetLogOut(user, res)
        }else{
            res.json({
                respuesta: false,
                message: 'Usuario no encontrado'
            })
        }
    }catch(error){
        console.log(error)
        res.send(500)
        res.json(error)
    }
}


module.exports = controller