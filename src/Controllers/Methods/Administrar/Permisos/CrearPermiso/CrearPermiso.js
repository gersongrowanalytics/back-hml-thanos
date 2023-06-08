const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCrearPermiso = async ( req, res ) => {

    const {
        req_tpeid,
        req_pemnombre,
        req_pemslug,
        req_pemruta,
        req_pemespecial
    } = req.body

    try{

        let status      = 200
        let message     = 'Permiso creado con éxito'
        let response    = true

        const peme = await prisma.pempermisos.findFirst({
            where : {
                pemnombre   : req_pemnombre,
                tpeid       : req_tpeid
            }
        })

        if(peme){
            status      = 500
            message     = 'El permiso ya se encuentra registrado'
            response    = false
        }else{
            const pemn = await prisma.pempermisos.create({
                data : {
                    tpeid       : req_tpeid,
                    pemnombre   : req_pemnombre,
                    pemslug     : req_pemslug,
                    pemruta     : req_pemruta,
                    pemespecial : req_pemespecial
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
            message     : 'Ha ocurrido un error al crear el permiso'
        })
    }

}

module.exports = controller