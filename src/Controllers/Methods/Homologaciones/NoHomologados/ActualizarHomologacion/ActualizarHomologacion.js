const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetActualizarHomologacion = async ( req, res ) => {

    const {
        req_datos_homologados
    } = req.body

    try{

        for await (const dhm of req_datos_homologados ){
            let data_mpso = { proid : dhm.req_id_producto_homologado, unidad_minima: dhm.req_unidad_minima_homologado }
            if(dhm.req_combo){
                data_mpso = { ...data_mpso, 
                                combo                   : dhm.req_combo, 
                                cod_unidad_medida       : dhm.req_cod_unidad_medida_homologado,
                                unidad_medida_hml       : dhm.req_unidad_medida_homologado,
                                coeficiente             : dhm.req_coeficiente,
                                unidad_minima_unitaria  : dhm.req_unidad_minima_unitario,
                                bonificado              : dhm.req_bonificado
                            }
            }
            const idmpso = parseInt(dhm.req_id)
            const mpse = await prisma.master_productos_so.update({
                where : {
                    id : idmpso
                },
                data : data_mpso
            })
        }

        res.status(200).json({
            message     : 'Producto homologado con éxito',
            response    : true,
        })    

    }catch(err){
        console.log(err)
        res.status(500).json({
            message     : 'Ha ocurrido un error al actualizar la homologación',
            response    : false,
            devmsg      : err
        })    
    }

}

module.exports = controller