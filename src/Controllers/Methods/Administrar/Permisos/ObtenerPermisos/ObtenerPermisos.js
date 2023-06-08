const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerPermisos = async ( req, res ) => {

    try{

        const pems = await prisma.pempermisos.findMany({
            select : {
                pemid       : true,
                tpeid       : true,
                pemnombre   : true,
                pemslug     : true,
                pemruta     : true,
                tpetipospermisos : {
                    select : {
                        tpenombre : true
                    }
                }
            }
        })

        const tpes = await prisma.tpetipospermisos.findMany({
            select : {
                tpeid       : true,
                tpenombre   : true
            }
        })

        res.status(200).json({
            response    : true,
            message     : 'Permisos obtenidos con éxito',
            data        : {pems, tpes},
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener los permisos'
        })
    }
}

module.exports = controller