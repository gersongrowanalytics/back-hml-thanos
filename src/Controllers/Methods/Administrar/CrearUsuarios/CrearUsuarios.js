const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')

controller.MetCrearUsuarios = async (req, res) => {

    const { 
        per_nombre,
        per_apellido_paterno,
        per_apellido_materno,
        tpu_id,
        est_id,
        usu_usuario,
        usu_correo,
        usu_contrasenia
    } = req.body

    let message = 'El usuario ha sido creado correctamente'
    let alert = false

    try{
        const nombre_completo = per_nombre + " " + per_apellido_paterno + " " + per_apellido_materno
        let per = await prisma.perpersonas.findFirst({
            where : {
                pernombrecompleto : nombre_completo,
            },
            select : {
                perid : true
            }
        })
        if(!per){
            per = await prisma.perpersonas.create({
                data: {
                    pertipodocumento: null,
                    pernumerodocumentoidentidad: null,
                    pernombrecompleto: nombre_completo,
                    pernombre: per_nombre,
                    perapellidopaterno: per_apellido_paterno,
                    perapellidomaterno: per_apellido_materno,
                }
            })
        }

        const token_user = crypto.randomBytes(30).toString('hex')

        let usu = await prisma.usuusuarios.findFirst({
            where : {
                usucorreo : usu_correo,
            },
            select : {
                usuid : true
            }
        })

        if(!usu){
            await prisma.usuusuarios.create({
                data: {
                    tpuid: tpu_id,
                    perid: per.perid,
                    estid: est_id,
                    usuusuario: usu_usuario,
                    usucorreo: usu_correo,
                    usucontrasena: bcryptjs.hashSync(usu_contrasenia, 8),
                    usutoken: token_user
                }
            })
        }else{
            message = 'El usuario ya ha sido creado anteriormente.'
            alert   = true
        }
        
    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
            devmsg  : error
        })
    }finally{
        await prisma.$disconnect()
        res.status(200)
        res.json({
            message : message,
            respuesta : true,
            alert
        })
    }
}

module.exports = controller