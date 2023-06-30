const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarCargaArchivos = async (req, res) => {

    const {  } = req.body;

    try{

        const cars = await prisma.carcargasarchivos.findMany({
            select : {
                carid               : true,
                carnombre           : true,
                cartoken            : true,
                cartipo             : true,
                cararchivo          : true,
                carurl              : true,
                carnotificaciones   : true,
                carplataforma       : true,
                carfechaprocesado   : true,
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

        cars.forEach((car, index_car) => {
            cars[index_car]['index'] = index_car + 1
            cars[index_car]['usuusuario'] = car?.usuusuarios?.usuusuario
            if(car.cartipo == null){
                cars[index_car]['cartipo'] = ''
            }
            cars[index_car]['carestadoprocesado'] = car?.carfechaprocesado ? 'Procesado' : 'No procesado'
            cars[index_car]['cartipo'] = car?.cartipo == '' ? 'No asignado' : cars[index_car]['cartipo']
        });

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