const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEditarDistribuidora = async (req, res) => {

    const { 
        req_id_dt,
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
        req_canal_trade
    } = req.body;

    try{

        const distributor = await prisma.master_distribuidoras.findUnique({
            where: { id: parseInt(req_id_dt) }
        })
    
        if (!distributor) {
            return res.status(404).json({ mensaje: 'Lo sentimos la distribuidora no se ha encontrada', respuesta: false, submessage : 'Recomendamos actualizar la tabla', })
        }

        await prisma.master_distribuidoras.update({
            where: { id: parseInt(req_id_dt) },
            data: {
                codigo_dt        : req_codigo_dt,
                region           : req_region,
                supervisor       : req_supervisor,
                localidad        : req_localidad,
                nomb_dt          : req_nomb_dt,
                check_venta      : req_check_venta,
                nomb_cliente     : req_nomb_cliente,
                latitud          : req_latitud,
                longitud         : req_longitud,
                oficina_two      : req_oficina_two,
                subcanal         : req_subcanal,
                sap_solicitante  : req_sap_solicitante,
                sap_destinatario : req_sap_destinatario,
                diferencial      : req_diferencial,
                canal_atencion   : req_canal_atencion,
                cod_solicitante  : req_cod_solicitante,
                cod_destinatario : req_cod_destinatario,
                canal_trade      : req_canal_trade
            }
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de editar la distribuidora',
            devmsg  : error,
            respuesta : false
        })
    } finally {
        await prisma.$disconnect();
        res.json({
            message : 'La distribuidora ha sido editada correctamente',
            respuesta : true
        })
    }
}


module.exports = controller