const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetEditarProducto = async (req, res) => {

    const {
        req_id_prod,
        req_cod_producto,
        req_nomb_producto,
        req_division,
        req_sector,
        req_categoria,
        req_subcategoria,
        req_segmento,
        req_presentacion,
        req_peso,
        req_paquetexbulto,
        req_unidadxpqte,
        req_metroxund,
        req_ean13,
        req_ean14,
        req_minund,
        req_estado,
        req_marco
    } = req.body;

    try{

        const product = await prisma.master_productos.findUnique({
            where: { id: parseInt(req_id_prod) }
        })
    
        if (!product) {
            return res.status(404).json({ mensaje: 'Lo sentimos el producto no se ha encontrada', respuesta: false, submessage : 'Recomendamos actualizar la tabla', })
        }

        await prisma.master_productos.update({
            where: { id: parseInt(req_id_prod) },
            data: {
                cod_producto  : req_cod_producto,
                nomb_producto : req_nomb_producto,
                division      : req_division,
                sector        : req_sector,
                categoria     : req_categoria,
                subcategoria  : req_subcategoria,
                segmento      : req_segmento,
                presentacion  : req_presentacion,
                peso          : req_peso,
                paquetexbulto : req_paquetexbulto,
                unidadxpqte   : req_unidadxpqte,
                metroxund     : req_metroxund,
                ean13         : req_ean13,
                ean14         : req_ean14,
                minund        : req_minund,
                estado        : req_estado,
                marco         : req_marco
            },
        });
        

    } catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de editar el producto',
            devmsg  : error
        })
    } finally {
        await prisma.$disconnect();
        res.json({
            message : 'El producto ha sido editada correctamente',
            respuesta : true
        })
    }
}


module.exports = controller