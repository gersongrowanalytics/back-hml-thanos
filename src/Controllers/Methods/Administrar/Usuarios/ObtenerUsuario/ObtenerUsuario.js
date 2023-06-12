const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')

controller.MetObtenerUsuario = async ( req, res ) => {

    const {
        req_usuid
    } = req.body
        
    try{

        const usue = await prisma.usuusuarios.findFirst({
            where : {
                usuid : req_usuid
            },
            select : {
                usuid : true,
                tpuid : true,
                perid : true,
                estid : true,
                usuusuario : true,
                usucorreo : true,
                perpersonas : {
                    select : {
                        pernombre : true,
                        perapellidopaterno : true,
                        perapellidomaterno : true
                    }
                }
            }
        })

        const tpus = await prisma.tputiposusuarios.findMany({
            select : {
                tpuid       : true,
                tpunombre   : true, 
            }
        })

        tpus.forEach((tpu, index_tpu) => {
            tpus[index_tpu]['tpu_selected'] = false
            tpus[index_tpu]['value'] = tpu.tpunombre
            if(tpu.tpuid == usue.tpuid){
                tpus[index_tpu]['tpu_selected'] = true
            }
        })

        usue['tpus'] = tpus

        res.status(200).json({
            response    : true,
            data        : usue,
            message     : 'Usuario obtenido con éxito'
        })

    }catch(err){
        console.log(err)
        res.status(200).json({
            response    : true,
            message     : 'Ha ocurrido un error al obtener al usuario'
        })
    }
}

module.exports = controller