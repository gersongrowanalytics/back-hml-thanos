const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetInfoMasterPrecios = async (req, res) => {

    const {
        req_cod_material,
        req_clients_zona,
        req_anio,
        req_mes,
        req_dia,
        req_type_day,
        req_type_month,
        req_type_year
    } = req.body
    
    try {

        let data_price = ['data_price_one','data_price_two']
        let data_final = []

        let where_master_price = {}
        if(req_type_year){
            if(req_anio.length > 0){
                where_master_price = { anio: { in: req_anio} } 
            }
        }

        if(req_type_month){
            const month_data = req_mes.map(m => m.month + 1)
            const year_data = req_mes.map(m => m.year)
            where_master_price = { anio: { in: year_data }, mes: { in: month_data } } 
        }

        if(req_type_day){
            const day_data = req_dia.map(m => parseInt(m.days))
            const month_data = req_dia.map(m => m.month + 1)
            const year_data = req_dia.map(m => m.year)
            where_master_price = { anio: { in: year_data }, mes: { in: month_data } } 
        }

        if(req_clients_zona == "LIMA"){
            where_master_price = { ...where_master_price, gba: "LIMA" }
        }else if(req_clients_zona == "PROVINCIA"){
            where_master_price = { ...where_master_price, gba: "PROV" }
        }

        const get_master_price = await prisma.master_precios.findMany({
            select: {
                id: true,
                precio: true,
            },
            where: { 
                codigo: req_cod_material,
                ...where_master_price,
            },
        })

        let contador = 0
        let master_price = 0
        const master_price_array = get_master_price.map(price => parseFloat(price.precio))

        get_master_price.map(m_pri => {
            master_price = master_price + parseFloat(m_pri.precio)
            contador = contador + 1
        })

        const max_price = Math.max(...master_price_array)
        const min_price = Math.min(...master_price_array)
        const promedio_price = master_price / contador

        data_price.map((pr) => {
            data_final.push({
                nombre      : pr,
                promedio    : promedio_price ? promedio_price : 0,
                maximo      : max_price ? max_price : 0,
                minimo      : min_price ? min_price : 0,
            })
        })

        await prisma.$disconnect()

        res.status(200)
            .json({
                response : true,
                message : "Información de la maestra de precios obtenida con éxito",
                data_final
            })

    } catch (error) {
        console.log(error)
        await prisma.$disconnect()
        res.status(500)
        .json({
            devmsg      : error,
            respuesta   : false,
            message     : "Ha ocurrido un error al obtener la información de la maestra de precios",
        })
    }
    
}

module.exports = controller