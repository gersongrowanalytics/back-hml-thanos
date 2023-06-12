const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetEditarUsuario = async ( req, res ) => {

    const {
        req_usuid,
        req_usucorreo,
        req_usuusuario,
        req_perid,
        req_pernombre,
        req_perapellidomaterno,
        req_perapellidopaterno,
        req_tpuid,
        req_estid,
        req_contrasenia
    } = req.body

    try{

        let usue = {
            estid : req_estid,
            tpuid : req_tpuid,
            usuusuario : req_usuusuario,
            usucorreo : req_usucorreo,
        }

        if(req_contrasenia?.length > 0){
            usue = {...usue, usucontrasenia : bcryptjs.hashSync(req_contrasenia, 8)}
        }

        await prisma.usuusuarios.update({
            where : {
                usuid : req_usuid
            },
            data : usue
        })

        let pere = {
            pernombre : req_pernombre,
            perapellidopaterno : req_perapellidopaterno,
        }

        if(req_perapellidomaterno.length > 0){
            pere = {...pere, perapellidomaterno : req_perapellidomaterno}
        }

        await prisma.perpersonas.update({
            where : {
                perid : req_perid
            },
            data : pere
        })
        
        res.status(200).json({
            response : true,
            message : 'Usuario editado con éxito'
        })
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al editar al usuario'
        })
    }
}

module.exports = controller