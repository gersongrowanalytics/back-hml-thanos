const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMostrarUsuarios = async ( req, res ) => {

    try{

        const usu = await prisma.usuusuarios.findMany({
            select : {
                usuusuario  : true,
                usuid       : true,
                usucorreo   : true,
                estid       : true,
                tputiposusuarios : {
                    select : {
                        tpunombre : true
                    }
                },
                perpersonas : {
                    select : {
                        pernombrecompleto : true
                    }
                }
            }
        })

        usu.forEach((us, index_usu) => {
            usu[index_usu]['index'] = index_usu + 1
        });

        res.status(200).json({
            response    : true,
            message     : 'Usuarios obtenidos con éxito',
            data        : usu
        })
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los usuarios'
        })
    }
}

module.exports = controller