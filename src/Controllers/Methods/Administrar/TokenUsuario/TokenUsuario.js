const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const Usuusuarios = require('../../../../../sequelize/models')
const RegisterAudits = require('../../Audits/CreateAudits/RegisterAudits')

controller.MetTokenUsuario = async (req, res) => {

    const { 
        req_token
    } = req.body

    const {
        middle_usuario
    } = req.headers

    let message = 'El token funciona correctamente'
    let usu
    let respuesta = true
    let devmsg = ''
    let jsonsalida
    let jsonentrada = {
        req_token
    }

    try{

        usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : req_token
            },
            select : {
                usutoken : true,
                perpersonas : true,
                tputiposusuarios : {
                    select : {
                        tpuprivilegio : true,
                        tuptiposusuariospermisos : {
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



        // if(req_token == '54Fm8K5SsBuT998CuwJL2jt1E1RZ7amztrPicb'){
        //     usu = await prisma.usuusuarios.findFirst({
        //         where : {
        //             tpuid : 1
        //         },
        //         select : {
        //             usutoken : true,
        //             perpersonas : true,
        //             tputiposusuarios : {
        //                 select : {
        //                     tpuprivilegio : true
        //                 }
        //             },
        //         }
        //     })
        // }else if(req_token == 'wJL2jt1E1RZ7amztrPicbAMiwDFq'){
        //     usu = await prisma.usuusuarios.findFirst({
        //         where : {
        //             tpuid : 2
        //         },
        //         select : {
        //             usutoken : true,
        //             perpersonas : true,
        //             tputiposusuarios : {
        //                 select : {
        //                     tpuprivilegio : true,
        //                     tuptiposusuariospermisos : {
        //                         select : {
        //                             pempermisos : {
        //                                 select : {
        //                                     pemnombre : true,
        //                                     pemslug  : true,
        //                                     pemruta : true,
        //                                     tpeid : true
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     })
        // }else{
        //     usu = await prisma.usuusuarios.findFirst({
        //         where : {
        //             tpuid : 3
        //         },
        //         select : {
        //             usutoken : true,
        //             perpersonas : true,
        //             tputiposusuarios : {
        //                 select : {
        //                     tpuprivilegio : true,
        //                     tuptiposusuariospermisos : {
        //                         select : {
        //                             pempermisos : {
        //                                 select : {
        //                                     pemnombre : true,
        //                                     pemslug  : true,
        //                                     pemruta : true,
        //                                     tpeid : true
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     })
        // }


    }catch(error){
        message = 'Lo sentimos hubo un error al momento de identificar al usuario'
        devmsg  = error
        respuesta = false
        res.status(500)
        res.json({
            message,
            devmsg,
        })
    }finally{

        if(usu){
            console.log('registra')
            jsonsalida = { message : message, respuesta : respuesta, auth_token : usu.usutoken, user : usu }
            await RegisterAudits.MetRegisterAudits(2, usu.usutoken, null, jsonentrada, jsonsalida, 'LOGIN', 'REGISTRAR', '/status/'+req_token, null, null)
            res.status(200)
            res.json({
                message : message,
                respuesta : true,
                auth_token: usu.usutoken,
                user : usu
            })
        }else{
            res.status(500)
            res.json({
                message : 'El usuario no existe',
                respuesta : false
            })
        }
    }
}

module.exports = controller