const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEditarPermiso = async ( req, res ) => {

    const {
        req_pemid,
        req_pemnombre,
        req_tpeid,
        req_pemslug,
        req_pemruta,
        req_pemespecial
    } = req.body

    try{

        let status      = 200
        let response    = true
        let message     = 'Permiso editado con éxito'

        const peme = await prisma.pempermisos.findFirst({
            where : {
                pemnombre   : req_pemnombre,
                tpeid       : req_tpeid,
                pemid   :{
                    not : req_pemid
                }
            }
        })

        if(peme){
            status      = 500
            response    = false
            message     = 'El permiso ya se encuentra registrado'
        }else{
            await prisma.pempermisos.update({
                where : {
                    pemid : req_pemid
                },
                data : {
                    pemnombre   : req_pemnombre,
                    pemslug     : req_pemslug,
                    pemruta     : req_pemruta,
                    pemespecial : req_pemespecial,
                    tpeid       : req_tpeid
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
            message     : 'Ha ocurrido un error al editar el permiso'
        })
    }

}

module.exports = controller