controller = {}
const { PrismaClient, sql } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerInfoSO = async ( req, res ) => {

    const {
        req_anio,
        req_mes,
        req_dia,
        req_pk_extractor_ventas_so
    } = req.body

    try {

        let consulta = {}

        if(req_pk_extractor_ventas_so){
            consulta = { ...consulta, pk_extractor_venta_so: {equals: req_pk_extractor_ventas_so } }
        }
    
        if(req_anio){
            consulta = { ...consulta, anio: {equals: req_anio } }
        }
    
        if(req_mes){
            consulta = { ...consulta, mes: {equals: req_mes } }
        }
        
        if(req_dia){
            consulta = { ...consulta, dia: {equals: req_dia } }
        }
    
        const resultado = await prisma.ventas_so.aggregate({
            _avg :{
                precio_unitario : true
            },
            _max: {
                precio_unitario: true,
              },
            _min: {
                precio_unitario: true,
            },
            where : consulta
        });

        res.status(200)
            .json({
                response : true,
                message : "Información de SellOut obtenida con éxito",
                data : {
                    maximo      : resultado._max.precio_unitario,
                    minimo      : resultado._min.precio_unitario,
                    promedio    : resultado._avg.precio_unitario,
                }
            })

    } catch (error) {
        res.status(500)
        .json({
            devmsg      : error,
            respuesta   : false,
            message     : "Ha ocurrido un error al obtener la información de Sell Out",
        })
    }
}

module.exports = controller