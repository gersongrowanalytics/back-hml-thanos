const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarCargaArchivos = async (req, res) => {

    const {  } = req.body;

    try{

        const cars = await prisma.carcargasarchivos.findMany({
            select : {
                carnombre           : true,
                cartoken            : true,
                cartipo             : true,
                cararchivo          : true,
                carurl              : true,
                carnotificaciones   : true,
                carplataforma       : true,
                carexito            : true,
                usuusuarios : {
                    select : {
                        usuusuario : true
                    }
                },
                created_at: true
            },
            orderBy: {
                created_at : 'desc'
            }
        })

        res.status(200).json({
            message: 'Lista de carga de archivos obtenida correctamente',
            data : cars,
            response: true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de obtener la carga de archivos',
            devmsg  : error
        })
    }    
}


module.exports = controller