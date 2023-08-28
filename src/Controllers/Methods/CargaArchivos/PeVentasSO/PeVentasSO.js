const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCargarPeVentasSO = async (req, res, data, delete_data, error, message_errors) => {

    
    let devmsg = [];
    let message = "";

    try{

        const codigos_dt_fechas = Object.values(
            data.reduce((grupos, dato) => {
                const { codigo_distribuidor, fecha } = dato;
                grupos[codigo_distribuidor] = grupos[codigo_distribuidor] || {
                    codigo_distribuidor,
                    fechas: [],
                    fechas_query: [],
                };
                if (!grupos[codigo_distribuidor].fechas.includes(fecha)) {
                    grupos[codigo_distribuidor].fechas.push(fecha);
                    grupos[codigo_distribuidor].fechas_query.push({
                        "fecha" : fecha
                    });
                }
                return grupos;
            }, {})
        );
        
        // **************
        // codigos_dt_fechas => [ {codigo_distribuidor:"123", fechas: ["YYYY-MM", "YYYY-MM"], fechas_query : [{fecha: "YYYY-MM"},{fecha: "YYYY-MM"}] } ]
        // *************

        for await(const cod_fecha of codigos_dt_fechas){

            await prisma.pvs_pe_ventas_so.deleteMany({
                where : {
                    codigo_distribuidor : cod_fecha.codigo_distribuidor,
                    OR : cod_fecha.fechas_query
                }
            })
        }

        // Agregar data
        await prisma.pvs_pe_ventas_so.createMany({
            data
        })

        return res.status(200).json({
            "message" : "Todo bien",
        });


    }catch(error){
        console.log(error);
        devmsg.push("MetCargarPeVentasSO-"+error.toString())
        // jsonsalida = { message, respuesta, devmsg }
        // await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'PE CARGAR VENTAS SO', 'CREAR', '/carga-archivos/pe-ventas-so', JSON.stringify(devmsg), null)

        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar las ventas so',
            devmsg  : error,
            respuesta : false
        })
    }finally {
        await prisma.$disconnect();
    }

}

module.exports = controller