controller = {}
const { PrismaClient, sql } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerInfoSO = async ( req, res ) => {

    const {
        req_pk_extractor_ventas_so,
        req_anio,
        req_mes,
        req_dia,
        req_type_day,
        req_type_month,
        req_type_year
    } = req.body

    try {

        let consulta = {}
        let data_filtro = []

        if(req_anio && req_type_year){

            let consulta_year = []
            req_anio.forEach( year => {
                consulta_year.push({ AND : [ { anio : year }, { pk_extractor_venta_so : req_pk_extractor_ventas_so} ] })
            });

            consulta = {...consulta, OR : consulta_year}
        }else  if(req_mes && req_type_month){

            let consulta_month = []
            req_mes.forEach( mes => {
                consulta_month.push({ AND : [ { anio : mes.year }, { mes : mes.month }, { pk_extractor_venta_so : req_pk_extractor_ventas_so} ] })
            });

            consulta = {...consulta, OR : consulta_month}
        }else if(req_dia && req_type_day){

            let consulta_days = []
            req_dia.forEach( days => {
                consulta_days.push({ AND : [ { anio : days.year }, { mes : days.month }, { dia :  days.day}, { pk_extractor_venta_so : req_pk_extractor_ventas_so} ] })
            });
            consulta = {...consulta, OR : consulta_days}
        }

        console.log(consulta)

        data_filtro = await prisma.ventas_so.aggregate({
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
        })

        res.status(200)
            .json({
                response : true,
                message : "Información de Sell Out obtenida con éxito",
                data : {
                    maximo      : data_filtro._max.precio_unitario,
                    minimo      : data_filtro._min.precio_unitario,
                    promedio    : data_filtro._avg.precio_unitario,
                },
            })

    } catch (error) {
        console.log(error)
        res.status(500)
        .json({
            devmsg      : error,
            respuesta   : false,
            message     : "Ha ocurrido un error al obtener la información de Sell Out",
        })
    }
}

module.exports = controller