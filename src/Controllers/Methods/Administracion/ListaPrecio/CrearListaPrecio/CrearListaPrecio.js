const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCrearListaPrecio = async (req, res, data, dates_row) => {

    const {
        req_action_file
    } = req.body

    let message     = 'Registros creados exitosamente'
    let status      = 200
    let respuesta   = true

    try{

        const action_file = JSON.parse(req_action_file)

        if(action_file.delete_data){
            for await (const dat of dates_row ){
                await prisma.lista_precio.deleteMany({
                    where : {
                        fecha_inicio: {
                            startsWith: dat
                        },
                    }
                })
            }
        }

        const list_price = await prisma.lista_precio.createMany({
            data
        })

        if(!list_price){
            message     = 'Ha ocurrido un error al crear el registro'
            status      = 500
            respuesta   = false
        }

        res.status(status)
        res.json({
            message,
            respuesta,
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de crear el registro',
            respuesta: false
        })
    }
}


module.exports = controller