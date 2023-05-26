const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetInfoInventarios = async ( req, res ) => {

    const {
        req_pk_extractor_venta_so,
        req_anio,
        req_mes,
        req_dia,
        req_type_day,
        req_type_month,
        req_type_year
    } = req.body

    try{

        let consulta = { pk_extractor_venta_so : req_pk_extractor_venta_so }
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

        data_filtro = await prisma.inventarios.aggregate({
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

        const invo = await prisma.inventarios.findFirst({
            where : {
                pk_extractor_venta_so : req_pk_extractor_venta_so
            },
            select : {
                cod_unidad_medida   : true,
                unidad_medida       : true
            }
        })
        res.status(200)
            .json({
                response : true,
                message : "Información de inventarios obtenida con éxito",
                data : {
                    maximo              : data_filtro._max.precio_unitario,
                    minimo              : data_filtro._min.precio_unitario,
                    promedio            : data_filtro._avg.precio_unitario,
                    cod_unidad_medida   : invo.cod_unidad_medida,
                    unidad_medida       : invo.unidad_medida
                },
            })


    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener la información de inventarios',
            msgdev      : err
        })
    }
}

controller.MetInfoInventariosProductosNoHomologados = async ( pk_query, pk_extractor) => {

    try{

        let consulta = {}
        if(pk_extractor){
            consulta = {...consulta, pk_extractor_venta_so : pk_query}
        }else{
            consulta = {...consulta, pk_venta_so : pk_query}
        }

        const inv = await prisma.inventarios.aggregate({
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

        const invo = await prisma.inventarios.findFirst({
            where : consulta,
            select : {
                cod_unidad_medida   : true,
                unidad_medida       : true
            }
        })
        let data
        if(invo && inv){
            data = {
                maximo              : inv._max.precio_unitario,
                minimo              : inv._min.precio_unitario,
                promedio            : inv._avg.precio_unitario,
                cod_unidad_medida   : invo.cod_unidad_medida,
                unidad_medida       : invo.unidad_medida
            }
        }

        return inv && invo ? data : false 

    }catch(err){
        console.log(err)
    }
}

module.exports = controller