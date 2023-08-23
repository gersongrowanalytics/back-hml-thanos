const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetObtenerInfoSI = async (req, res) => {
    const {
        req_pk_cod_pro,
        req_pk_cod_dist,
        req_anio,
        req_mes,
        req_dia,
        req_type_day,
        req_type_month,
        req_type_year,
    } = req.body

    try {

        let data_sellin = await prisma.sellin.findMany({
            select: {
                ubnetofac: true,
                msvalnetfa_pen: true,
            },
            where: {
                cod_material: req_pk_cod_pro,
                cod_destinatario: req_pk_cod_dist,
                cargo: {
                    contains: `%Si tiene%`
                },
                fecha: {
                    contains: `%${req_mes}.${req_anio}`
                },
            }
        })

        if(data_sellin.length == 0){
            const data_sellin_date = await prisma.sellin.findFirst({
                select: {
                    mes: true,
                    anio: true,
                },
                where: {
                    cod_material: req_pk_cod_pro,
                    cod_destinatario: req_pk_cod_dist,
                    cargo: {
                        contains: `%Si tiene%`
                    },
                },
                orderBy: [
                    { anio: 'desc' },
                    { mes: 'desc' }
                ]
            })

            if(data_sellin_date){
                data_sellin = await prisma.sellin.findMany({
                    select: {
                        ubnetofac: true,
                        msvalnetfa_pen: true,
                    },
                    where: {
                        cod_material: req_pk_cod_pro,
                        cod_destinatario: req_pk_cod_dist,
                        cargo: {
                            contains: `%Si tiene%`
                        },
                        fecha: {
                            contains: `%${data_sellin_date.mes}.${data_sellin_date.anio}`
                        },
                    }
                })
            }
        }

        let ubnetofac_total = 0
        let msvalnetfa_pen_total = 0
        data_sellin.map(sell => {
            ubnetofac_total = parseFloat(sell.ubnetofac) + ubnetofac_total
            msvalnetfa_pen_total = parseFloat(sell.msvalnetfa_pen) + msvalnetfa_pen_total
        })

        const total_promedio_msvalnetfa = msvalnetfa_pen_total / ubnetofac_total
        
        const msvalnetfa_pen_group = data_sellin.map(sell => parseFloat(sell.msvalnetfa_pen))
        const max_msvalnetfa = Math.max(...msvalnetfa_pen_group)
        const min_msvalnetfa = Math.min(...msvalnetfa_pen_group)
        
        const ubnetofac_group = data_sellin.map(sell => parseFloat(sell.ubnetofac))
        const max_ubnetofac = Math.max(...ubnetofac_group)
        const min_ubnetofac = Math.min(...ubnetofac_group)

        const total_max_msvalnetfa = parseFloat(max_msvalnetfa) / parseFloat(max_ubnetofac)
        const total_min_msvalnetfa = parseFloat(min_msvalnetfa) / parseFloat(min_ubnetofac)
        
        res.status(200)
            .json({
                response : true,
                message : "Información de Sell In obtenida con éxito",
                data : {
                    maximo      : total_max_msvalnetfa ? total_max_msvalnetfa : 0,
                    minimo      : total_min_msvalnetfa ? total_min_msvalnetfa : 0,
                    promedio    : total_promedio_msvalnetfa ? total_promedio_msvalnetfa : 0,
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