const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEditarTipoUsuario = async ( req, res ) => {

    const {
        req_tpu
    } = req.body

    try{

        let status = 200
        let message = 'El tipo de usuario fue editado con éxito'
        let response = true

        const tpue = await prisma.tputiposusuarios.findFirst({
            where : {
                tpunombre : req_tpu.tpunombre,
                tpuid   :{
                    not : req_tpu.tpuid
                }
            }
        })


        if(tpue){
            status = 500
            message = 'Ya existe un tipo de usuario con ese nombre'
            response = false
        }else{

            await prisma.tputiposusuarios.update({
                where : {
                    tpuid : req_tpu.tpuid
                },
                data : {
                    tpuprivilegio   : req_tpu.tpuprivilegio,
                    estid           : req_tpu.estid
                }
            })
    
            await prisma.tuptiposusuariospermisos.deleteMany({
                where : {
                    tpuid : req_tpu.tpuid
                }
            })
    
            const data = []
            req_tpu.permisos.forEach(tpe => {
                tpe.permisos.forEach(pem => {
                    if(pem.tiene_permiso){
                        data.push({tpuid : req_tpu.tpuid, pemid : pem.pemid})
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
            message     : 'Ha ocurrido un error al editar al tipo de usuario'
        })
    }
}

module.exports = controller