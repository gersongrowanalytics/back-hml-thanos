const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterPrecios = async (req, res, data, dates_row) => {

    const {
        req_delete_data
    } = req.body

    try{

        if(req_delete_data == 'true'){

            for await (const dat of dates_row ){
    
                await prisma.master_precios.deleteMany({
                    where: {
                        date: {
                            startsWith: dat
                        }
                    }
                })
            }
        }

        await prisma.master_precios.createMany({
            data
        })

        res.status(200)
        res.json({
            message     : 'La data de Maestro precios fue cargada con éxito',
            response    : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de leer el archivo',
            devmsg  : error
        })
    }
}

module.exports = controller