const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetInfoMasterPrecios = async (req, res) => {

    const {
        req_cod_material,
        req_anio,
        req_mes,
        req_dia,
        req_type_day,
        req_type_month,
        req_type_year
    } = req.body
    
    try {

        let consulta    = {}
        let data_filtro = []
        let data_final  = []
        let name_chg = ['ex_changue_one','ex_changue_two','ex_changue_three','ex_changue_four','ex_changue_five']

        if(req_anio && req_type_year){

            let consulta_year = []
            if(req_anio.length > 0){
                req_anio.forEach( year => {
                    consulta_year.push({ AND : [ { anio : year }, { cod_material : req_cod_material} ] })
                });
            }else{
                consulta_year.push({ AND : [ { cod_material : req_cod_material} ] })
            }
            consulta = {...consulta, OR : consulta_year}
        }

        if(req_mes && req_type_month){

            let consulta_month = []
            if(req_mes.length > 0){
                req_mes.forEach( mes => {
                    consulta_month.push({ AND : [ { anio : mes.year }, { mes : mes.month +1 }, { cod_material : req_cod_material} ] })
                });
            }else{
                consulta_month.push({ AND : [ { cod_material : req_cod_material} ] })
            }

            consulta = {...consulta, OR : consulta_month}
        }

        if(req_dia && req_type_day){

            let consulta_days = []
            if(req_dia.length > 0){
                req_dia.forEach( days => {
                    consulta_days.push({ AND : [ { anio : days.year }, { mes : days.month }, { dia :  days.day}, { cod_material : req_cod_material} ] })
                });
            }else{
                consulta_days.push({ AND : [ { cod_material : req_cod_material} ] })
            }
            consulta = {...consulta, OR : consulta_days}
        }

        data_filtro = await prisma.master_precios.aggregate({
            _avg :{
                ex_changue_one      : true,
                ex_changue_two      : true,
                ex_changue_three    : true,
                ex_changue_four     : true,
                ex_changue_five     : true,
            },
            _max: {
                ex_changue_one      : true,
                ex_changue_two      : true,
                ex_changue_three    : true,
                ex_changue_four     : true,
                ex_changue_five     : true,
              },
            _min: {
                ex_changue_one      : true,
                ex_changue_two      : true,
                ex_changue_three    : true,
                ex_changue_four     : true,
                ex_changue_five     : true,
            },
            where : consulta
        })

        name_chg.forEach( chg => {
            data_final.push({
                nombre      : chg,
                promedio    : data_filtro['_avg'][chg],
                maximo      : data_filtro['_max'][chg],
                minimo      : data_filtro['_min'][chg],
            })
        })

        res.status(200)
            .json({
                response : true,
                message : "Información de la maestra de precios obtenida con éxito",
                data_final
            })

    } catch (error) {
        console.log(error)
        res.status(500)
        .json({
            devmsg      : error,
            respuesta   : false,
            message     : "Ha ocurrido un error al obtener la información de la maestra de precios",
        })
    }
    
}

module.exports = controller