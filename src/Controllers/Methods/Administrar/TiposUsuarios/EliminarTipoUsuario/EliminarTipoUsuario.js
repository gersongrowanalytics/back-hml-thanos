const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEliminarTipoUsuario = async ( req, res ) => {

    const {
        req_tpuid
    } = req.body
    

    try{

        let status = 200
        let message = 'El tipo de usuario fue eliminado con éxito'
        let response = true

        const tpuu = await prisma.usuusuarios.findFirst({
            where : {
                tpuid : req_tpuid
            }
        })

        if(tpuu){
            status = 500
            message = 'No se puede eliminar al tipo de usuario, existen usuarios de este tipo'
            response = false
        }else{

            await prisma.tuptiposusuariospermisos.deleteMany({
                where : {
                    tpuid : req_tpuid
                }
            })

            await prisma.tputiposusuarios.delete({
                where : {
                    tpuid : req_tpuid
                }
            })
        }

        res.status(status).json({
            response,
            message
        })

    }catch(err){    
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al eliminar al tipo de usuario'
        })
    }
}

module.exports = controller