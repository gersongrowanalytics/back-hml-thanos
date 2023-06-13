
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
// const Usuusuarios = require('../../sequelize/models')

async function authMiddleware (req, res, next) {
    // Lógica del middleware

    const usuPrisma = await prisma.usuusuarios.findFirst({
        where : {
            usutoken : req.headers.usutoken
        },
        include : {
            perpersonas : true,
            tputiposusuarios : {
                select : {
                    tpuprivilegio : true,
                    tuptiposusuariospermisos: {
                        select : {
                            pempermisos : {
                                select : {
                                    pemnombre : true,
                                    pemslug  : true,
                                    pemruta : true,
                                    tpeid : true
                                }
                            }
                        }
                    }
                }
            }
        }
    })



    let usu = usuPrisma
    // if(req.headers.token == "true"){
    //     const usu_token = req.body.req_token
    //                 ?   req.body.req_token
    //                 :   req.headers.usutoken
    //     const usuSequelize = await Usuusuarios.findOne({
    //         where : {
    //             usutoken: usu_token
    //         }
    //     })
    //     usu = usuSequelize
    // }else{
    //     const usuPrisma = await prisma.usuusuarios.findFirst({
    //         where: {
    //             usutoken : req.headers.usutoken
    //         },
    //         include : {
    //             perpersonas : true
    //         }
    //     })
    //     usu = usuPrisma
    // }
    
    if(!usu){
        res.status(401)
        res.json({message : 'Lo sentimos tu sessión ha expirado.', response : false})
    }else{
        // if(req.headers.token == "false"){
        //     let datanombre = usu.perpersonas.pernombre
        //     let nombreCompleto = datanombre.indexOf(" ") != -1 ? datanombre.substring(0, datanombre.indexOf(" ")) + ' ' + usu.perpersonas.perapellidopaterno : datanombre + ' ' + usu.perpersonas.perapellidopaterno
        //     usu['perpersonas']['pernombreapellido'] = nombreCompleto
        // }

        // usu = {...usu, token_val: req.headers.token == "true" ? true : false}

        req.headers.middle_usuario = usu
        return next()
    }
}
  
module.exports = authMiddleware;  