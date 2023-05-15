
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

async function authMiddleware (req, res, next) {
    // Lógica del middleware
    if (req.headers.usutoken) {
        
        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : req.headers.usutoken
            },
            include : {
                perpersonas : true
            }
        });

        let datanombre = usu.perpersonas.pernombre
        let nombreCompleto = datanombre.indexOf(" ") != -1 ? datanombre.substring(0, datanombre.indexOf(" ")) + ' ' + usu.perpersonas.perapellidopaterno : datanombre + ' ' + usu.perpersonas.perapellidopaterno
        usu['perpersonas']['pernombreapellido'] = nombreCompleto

        if(!usu){
            res.status(401)
            res.json({message : 'Lo sentimos tu sessión ha expirado.', response : false})
        }else{
            req.headers.middle_usuario = usu
            return next();
        }

    } else {
        res.status(401)
        res.json({message : 'Lo sentimos tu sessión ha expirado.', response : false})
    }
}
  
module.exports = authMiddleware;  