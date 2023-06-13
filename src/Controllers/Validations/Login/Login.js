const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const LoginController = require('../../Methods/Login/MetLogin')

controller.ValLogin = async (req, res) => {

    const { req_usucorreo, req_paiid, req_usucontrasenia} = req.body;


    if(req_usucorreo && req_paiid && req_usucontrasenia){

        try{
                    
            const user = await prisma.usuusuarios.findFirst({
                where: {
                    usucorreo : req_usucorreo
                },
                include : {
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
            });

            if(!user){
                console.log('user no existe')
                res.status(500)
                res.json({
                    respuesta: false,
                    message: 'Usuario no encontrado'
                })
                return 
            }
            
            // ************************************************************
            // VALIDACION PARA VER SI TIENE ACCESO AL PAIS
            // ************************************************************

            // const user_country = await prisma.paupaisesusuarios.findFirst({
            //     where: {
            //         usuid : user.usuid,
            //         paiid : req_paiid
            //     }
            // });

            // if(!user_country){
            //     res.json({
            //         respuesta: false,
            //         message: 'No tiene acceso al país'})
            //     res.status(500).end()
            // }else{
                // LoginController.MetLogin(user, req_usucontrasenia, res)
            // }
            LoginController.MetLogin(user, req_usucontrasenia, res)

        }catch(error){
            console.log(error)
            res.json(error)
            // res.json(e)
        }
    }else{

        res.status(400)
        res.json({message : 'Campos incompletos'})
    }
}


module.exports = controller