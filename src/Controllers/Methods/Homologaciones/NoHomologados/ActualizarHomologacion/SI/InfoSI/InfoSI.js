const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

        let where_date = {}
        let without_date = false

        if(req_type_year && req_anio.length > 0){
            const year_selected = req_anio.map(year => parseInt(year)) 
            where_date = {
                anio: {
                    in: year_selected,
                }
            }
        }else if(req_type_month && req_mes.length > 0){
            const mes_selected = req_mes.map(m => parseInt(m.month) + 1)
            where_date = {
                mes: {
                    in: mes_selected,
                },
            }

            const year_accumulated = req_mes.map(m => m.year)
            if(year_accumulated.length > 0){
                where_date = { ...where_date, anio: parseInt(year_accumulated[0]) }
            }
        }else if(req_type_day && req_dia.length > 0){
            const day_selected = req_dia.map(m => parseInt(m.days))
            where_date = {
                dia: {
                    in: day_selected,
                },
            }

            const month_accumulated = req_mes.map(m => parseInt(m.month) + 1)
            if(month_accumulated.length > 0){
                where_date = { ...where_date, mes: parseInt(month_accumulated[0]) }
            }

            const year_accumulated = req_mes.map(m => m.year)
            if(year_accumulated.length > 0){
                where_date = { ...where_date, anio: parseInt(year_accumulated[0]) }
            }
        }else{
            const date_now = new Date()
            const month_now = date_now.getMonth() + 1
            const year_now = date_now.getFullYear()
            without_date = true

            where_date = { 
                fecha: {
                    contains: `%${month_now}.${year_now}`
                }
            }
        }

        let data_sellin = await prisma.sellin.findMany({
            select: {
                ubnetofac: true,
                msvalnetfa_pen: true,
            },
            where: {
                cod_material: req_pk_cod_pro.toString(),
                cod_destinatario: req_pk_cod_dist,
                cargo: {
                    contains: `%Si tiene%`
                },
                ...where_date,
            }
        })

        if(data_sellin.length == 0 && without_date){
            const data_sellin_date = await prisma.sellin.findFirst({
                select: {
                    mes: true,
                    anio: true,
                },
                where: {
                    cod_material: req_pk_cod_pro.toString(),
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

        await prisma.$disconnect()
        
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
        await prisma.$disconnect()
        res.status(500)
        .json({
            devmsg      : error,
            respuesta   : false,
            message     : "Ha ocurrido un error al obtener la información de Sell In",
        })
    }
}


module.exports = controller