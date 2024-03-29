const controller = {}

const bcryptjs = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const prisma = new PrismaClient()

controller.MetLogin = async (user, req_usucontrasenia, res) => {

    const checkPassword = bcryptjs.compareSync(req_usucontrasenia, user.usucontrasena)

    if(checkPassword){

        const token = crypto.randomBytes(30).toString('hex')

        await prisma.usuusuarios.update({
            where: {
                usuid: user.usuid,
            },
            data: {
                usutoken: token,
            },
        })

        let datanombre = user.perpersonas.pernombre
        let nombreCompleto = datanombre.indexOf(" ") != -1 ? datanombre.substring(0, datanombre.indexOf(" ")) + ' ' + user.perpersonas.perapellidopaterno : datanombre + ' ' + user.perpersonas.perapellidopaterno
        user['perpersonas']['pernombreapellido'] = nombreCompleto
        user['token_val'] = false

        res.json({
            respuesta:true,
            message: 'Usuario logeado con éxito',
            auth_token: token,
            user : user
        })
        res.status(200).end()
    }else{
        res.status(500)
        res.json({
            respuesta: false,
            message:'Las credenciales son incorrectas'
        }).end()
    }
}

module.exports = controller