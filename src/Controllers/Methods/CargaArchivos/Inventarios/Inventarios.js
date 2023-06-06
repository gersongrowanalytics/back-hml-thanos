const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetInventarios = async (req, res, data, delete_data) => {

    const {
        req_action_file
    } = req.body

    try{

        const action_file = JSON.parse(req_action_file)
        const { messages_delete_data } = controller.InventoriesOverWrittern(delete_data)

        if(action_file.delete_data){
            for await (const dat of delete_data ){
    
                await prisma.inventarios.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat.cod_dt
                    }
                })
            }
        }

        await prisma.inventarios.createMany({
            data
        })

        return res.status(200).json({
            message : 'Los datos de inventarios fueron cargados correctamente',
            messages_delete_data,
            respuesta    : true
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar el inventario',
            devmsg  : error,
            respuesta    : false
        })
    }
}


controller.InventoriesOverWrittern = (messages_dts) => {
    
    const messages_delete_dts = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_dts.findIndex( mgdd => mgdd.dts == msg.cod_dt)

        if(index_msg_dts == -1){
            messages_delete_dts.push({
                "dts"   : msg.cod_dt,
                "dates" : [msg.fecha]
            })
        }else{
            messages_delete_dts[index_msg_dts]['dates'].push(msg.fecha)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes distribuidoras",
            "data"      : messages_delete_dts
        }
    ]

    return { messages_delete_data }

}

module.exports = controller