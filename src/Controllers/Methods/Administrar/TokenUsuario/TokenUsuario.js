const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const Usuusuarios = require('../../../../../sequelize/models')

controller.MetTokenUsuario = async (req, res) => {

    const { 
        req_token
    } = req.body

    const {
        middle_usuario
    } = req.headers

    let message = 'El token funciona correctamente'
    let usu
    try{

        if(req_token == '54Fm8K5SsBuT998CuwJL2jt1E1RZ7amztrPicb'){
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    tpuid : 1
                },
                select : {
                    usutoken : true,
                    perpersonas : true,
                    tputiposusuarios : {
                        select : {
                            tpuprivilegio : true
                        }
                    },
                }
            })
        }else if(req_token == 'wJL2jt1E1RZ7amztrPicbAMiwDFq'){
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    tpuid : 2
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
        }else{
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    tpuid : 3
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
        }

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
            devmsg  : error
        })
    }finally{
        res.status(200)
        res.json({
            message : message,
            respuesta : true,
            auth_token: usu.usutoken,
            user : usu
        })
    }
}

module.exports = controller