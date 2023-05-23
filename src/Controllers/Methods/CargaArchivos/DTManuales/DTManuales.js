const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')

controller.MetDTManuales = async (req, res, data, delete_data) => {

    const {
        req_delete_data
    } = req.body

    try{

        const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)

        if(req_delete_data == 'true'){
            for await (const dat of delete_data ){
    
                await prisma.ventas_so.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat.cod_dt
                    }
                })
            }
        }

        await prisma.ventas_so.createMany({
            data
        })

        const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()
        
        return res.status(200).json({
            message : 'Las ventas manuales fueron cargadas correctamente',
            messages_delete_data
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar las dt manuales',
            devmsg  : error
        })
    }
}

controller.DistribuitorOverWrittern = (messages_dts) => {
    
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