
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

async function permissionMiddleware (req, res, next) {
    // Lógica del middleware
    if (req.headers.usutoken) {
        
        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : req.headers.usutoken
            }
        });

        if(!usu){
            res.status(401)
            res.json({message : 'Lo sentimos tu sessión ha expirado.', response : false})
        }else{
            req.headers.middle_usuario = usu

            const tup = await prisma.tuptiposusuariospermisos.findFirst({
                where: {
                    tpuid : usu.tpuid,
                    pempermisos: {
                        pemruta : req.originalUrl
                    }
                }
            })
            if(!tup){
                res.status(401)
                res.json({message : 'Lo sentimos no tienes acceso a esta vista.', response : false})
            }else{
                return next();
            }
        }

    } else {
        res.status(401)
        res.json({message : 'Lo sentimos tu sessión ha expirado.'})
    }
}
  
module.exports = permissionMiddleware;  