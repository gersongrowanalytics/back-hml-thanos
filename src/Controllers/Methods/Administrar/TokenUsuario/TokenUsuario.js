const controller = {}
const Usuusuarios = require('../../../../../sequelize/models')

controller.MetTokenUsuario = async (req, res) => {

    const { 
        req_token
    } = req.body

    const {
        middle_usuario
    } = req.headers

    let message = 'El token funciona correctamente'

    try{
    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
            devmsg  : error
        })
    }finally{
        res.status(200)
        res.json({
            message : message,
            respuesta : true,
            auth_token: middle_usuario.usutoken,
            user : middle_usuario
        })
    }
}

module.exports = controller