const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEliminarUsuario = async ( req, res ) => {

    const {
        req_usuid
    } = req.body

    try{

        await prisma.usuusuarios.delete({
            where : {
                usuid : req_usuid
            }
        })

        res.status(200).json({
            response    : true,
            message     : 'Usuario eliminado con éxito'
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al eliminar al usuario'
        })
    }
}

module.exports = controller