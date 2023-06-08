const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEliminarPermiso = async ( req, res ) => {
    
    const {
        req_pemid
    } = req.body

    try{

        let response    = true
        let message     = 'Permiso eliminado con éxito'
        let status      = 200
        
        const peme = await prisma.tuptiposusuariospermisos.findFirst({
            where : {
                pemid : req_pemid
            }
        })

        if(peme){
            response    = false
            message     = 'No se puede eliminar el permiso, pertenece a algún tipo de usuario'
            status      = 500
        }else{
            await prisma.pempermisos.delete({
                where : {
                    pemid : req_pemid
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
            message     : 'Ha ocurrido un error al eliminar el permiso'
        })
    }
}

module.exports = controller