const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerTipousuarioNuevo = async ( req, res ) => {

    try{

        const tpes = await prisma.tpetipospermisos.findMany({})

        for await (const tpe of tpes ){
            const tpepems = await prisma.pempermisos.findMany({
                where : {
                    tpeid : tpe.tpeid
                }
            })
            tpe['permisos'] = tpepems
            tpe['todos_permisos'] = false
        }

        tpes.forEach(tpe => {
            tpe.permisos.forEach(pem => {
                pem['tiene_permiso'] = false
            })
        })

        const data = {}
        data['permisos']        = tpes
        data['tpunombre']       = ''
        data['tpuprivilegio']   = ''
        data['estid']           = 1

        res.status(200).json({
            response    : true,
            message     : 'Se ha obtenido el perfil con éxito',
            data        : data
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los tipos de usuarios'
        })
    }
}

module.exports = controller