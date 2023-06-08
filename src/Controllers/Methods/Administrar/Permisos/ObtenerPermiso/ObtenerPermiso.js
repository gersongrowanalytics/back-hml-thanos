const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerPermiso = async ( req, res ) => {

    const {
        req_pemid
    } = req.body

    try{

        const pem = await prisma.pempermisos.findFirst({
            where : {
                pemid : req_pemid
            }
        })

        res.status(200).json({
            response    : true,
            message     : 'Permiso obtenido con éxito',
            data        : pem
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener el permiso'
        })
    }
}

module.exports = controller