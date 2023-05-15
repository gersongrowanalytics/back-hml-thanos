const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetCrearDistribuidora = async (req, res) => {

    const {
        req_codigo_dt,
        req_region,
        req_supervisor,
        req_localidad,
        req_nomb_dt,
        req_check_venta,
        req_nomb_cliente,
        req_latitud,
        req_longitud,
        req_oficina_two,
        req_subcanal,
        req_sap_solicitante,
        req_sap_destinatario,
        req_diferencial,
        req_canal_atencion,
        req_cod_solicitante,
        req_cod_destinatario,
        req_canal_trade,
    } = req.body;

    let new_distributor

    try{

        new_distributor = await prisma.master_distribuidoras.create({
            data: {
                codigo_dt           : req_codigo_dt,
                region              : req_region,
                supervisor          : req_supervisor,
                localidad           : req_localidad,
                nomb_dt             : req_nomb_dt,
                check_venta         : req_check_venta,
                nomb_cliente        : req_nomb_cliente,
                latitud             : req_latitud,
                longitud            : req_longitud,
                oficina_two         : req_oficina_two,
                subcanal            : req_subcanal,
                sap_solicitante     : req_sap_solicitante,
                sap_destinatario    : req_sap_destinatario,
                diferencial         : req_diferencial,
                canal_atencion      : req_canal_atencion,
                cod_solicitante     : req_cod_solicitante,
                cod_destinatario    : req_cod_destinatario,
                canal_trade         : req_canal_trade
            },
        });


    } catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de crear el distributor',
            devmsg  : error,
            respuesta : false
        })
    } finally {
        await prisma.$disconnect();
        res.json({
            message : 'La distribuidora ha sido creada correctamente',
            respuesta : true,
            data : new_distributor
        })
    }
}


module.exports = controller