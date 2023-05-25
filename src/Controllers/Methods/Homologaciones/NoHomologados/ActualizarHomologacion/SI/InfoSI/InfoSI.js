const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetObtenerInfoSI = async (req, res) => {
    const {
        req_pk_cod_pro,
        req_anio,
        req_mes,
        req_dia,
        req_type_day,
        req_type_month,
        req_type_year
    } = req.body

    try {

        let consulta = { proid : req_pk_cod_pro }
        let data_filtro = []

        if(req_anio && req_type_year){

            let consulta_year = []
            req_anio.forEach( year => {
                consulta_year.push({ AND : [ { anio : year } ] })
            });
            consulta = {...consulta, OR : consulta_year}

        }else  if(req_mes && req_type_month){

            let consulta_month = []
            req_mes.forEach( mes => {
                consulta_month.push({ AND : [ { anio : mes.year }, { mes : mes.month } ] })
            });

            consulta = {...consulta, OR : consulta_month}
        }else if(req_dia && req_type_day){

            let consulta_days = []
            req_dia.forEach( days => {
                consulta_days.push({ AND : [ { anio : days.year }, { mes : days.month }, { dia :  days.day}] })
            });
            consulta = {...consulta, OR : consulta_days}
        }


        data_filtro = await prisma.sellin.aggregate({
            _avg :{
                precio : true
            },
            _max: {
                precio: true,
              },
            _min: {
                precio: true,
            },
            where : consulta
        })

        res.status(200)
            .json({
                response : true,
                message : "Información de Sell In obtenida con éxito",
                data : {
                    maximo      : data_filtro._max.precio,
                    minimo      : data_filtro._min.precio,
                    promedio    : data_filtro._avg.precio,
                },
            })

    } catch (error) {
        console.log(error)
        res.status(500)
        .json({
            devmsg      : error,
            respuesta   : false,
            message     : "Ha ocurrido un error al obtener la información de Sell In",
        })
    }
}


module.exports = controller