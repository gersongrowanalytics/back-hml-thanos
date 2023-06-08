const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerTipousuario = async ( req, res ) => {

    const {
        req_tpuid
    } = req.body

    try{

        const tpu = await prisma.tputiposusuarios.findFirst({
            where : {
                tpuid : req_tpuid
            }
        })

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

        const tpupem = await prisma.tuptiposusuariospermisos.findMany({
            where : {
                tpuid : req_tpuid
            },
            select : {
                pemid : true
            }
        })

        tpes.forEach(tpe => {
            tpe.permisos.forEach(pem => {
                let index_pem = tpupem.findIndex((tpup) => tpup.pemid == pem.pemid)
                if(index_pem != -1){
                    pem['tiene_permiso'] = true
                }else{
                    pem['tiene_permiso'] = false
                }
            })

            if(tpe.permisos.filter(tp => tp.tiene_permiso).length > 0){
                tpe['todos_permisos'] = true
            }
        })

        tpu['permisos'] = tpes

        res.status(200).json({
            response    : true,
            message     : 'Se ha obtenido el perfil con éxito',
            data        : tpu
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