const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCrearTipoUsuario = async ( req, res ) => {

    const {
        req_tpu
    } = req.body

    try{

        let status = 200
        let message = 'El tipo de usuario fue creado con éxito'
        let response = true

        const tpue = await prisma.tputiposusuarios.findFirst({
            where : {
                tpunombre : req_tpu.tpunombre
            }
        })

        if(tpue){
            status = 500
            message = 'El tipo de usuario ya existe'
            response = false
        }else{
            const tpun = await prisma.tputiposusuarios.create({
                data : {
                    tpunombre : req_tpu.tpunombre,
                    tpuprivilegio: req_tpu.tpuprivilegio,
                    estid : req_tpu.estid,
                    tpuid_padre : null
                }
            })
    
            const data = []
            req_tpu.permisos.forEach(tpe => {
                tpe.permisos.forEach(pem => {
                    if(pem.tiene_permiso){
                        data.push({tpuid : tpun.tpuid, pemid : pem.pemid})
                    }
                })
            });
    
            await prisma.tuptiposusuariospermisos.createMany({
                data
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
            message     : 'Ha ocurrido un error al crear al tipo de usuario'
        })
    }
}

module.exports = controller