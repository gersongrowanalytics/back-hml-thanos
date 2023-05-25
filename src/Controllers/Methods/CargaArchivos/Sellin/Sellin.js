const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetSellin = async (req, res, data, delete_data) => {

    const {
        req_delete_data
    } = req.body

    try{

        const { messages_delete_data } = controller.SellinOverWrittern(delete_data)

        if(req_delete_data == 'true'){
            for await (const dat of delete_data ){
    
                await prisma.sellin.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                    }
                })
            }
        }

        await prisma.sellin.createMany({
            data
        })

        res.status(200).json({
            message : 'Los datos de inventarios fueron cargados correctamente',
            messages_delete_data,
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar el inventario',
            devmsg  : error
        })
    }
}


controller.SellinOverWrittern = (messages_dts) => {
    
    const messages_delete_date = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_date.findIndex( date => date == msg.fecha)

        if(index_msg_dts == -1){
            messages_delete_date.push(msg.fecha)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes fechas",
            "data"      : messages_delete_date
        }
    ]

    return { messages_delete_data }

}

module.exports = controller