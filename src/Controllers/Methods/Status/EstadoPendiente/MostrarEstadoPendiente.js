const controller = {}
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarEstadoPendiente = async ( req, res ) => {

    let {
        date_initial,
        date_final
    } = req.body

    try{

        let date_one    = ""
        let date_two    = ""
        let data        = []
        let esps_dts    = []
        let query_eps   = {}

        if(date_final != null){
            date_final = moment(date_final).format("YYYY-MM");
        }else{
            date_final = null
        }

        const tprs  = await prisma.tprtipospromociones.findMany({})

        let index_tpr = 0

        if(date_final == null){
            query_eps = {...query_eps, espid : 0}
        }else{
            query_eps = {...query_eps, fecfecha: date_final+'-01'}
        }

        for await (const tpr of tprs ){

            let ares = await prisma.espestadospendientes.findMany({
                select : {
                    areareasestados : {
                        select : {
                            areid               : true,
                            areicono            : true,
                            arenombre           : true,
                            areporcentaje       : true,
                            tprtipospromociones : true
                        },
                    },
                    fecfechas : true,
                    
                },
                // where : query_eps,
                distinct: ['areid'],
            })

            ares = ares.filter(are => are.areareasestados.tprtipospromociones.tprid == tpr.tprid)

            if(ares.length > 0){

                let aresn = [ [], [], [], [], [] ]

                let index_ares = 0

                for await (const are of ares ){
                    
                    const esps = await prisma.espestadospendientes.findMany({
                        where : {
                            areid : are.areareasestados.areid
                        },
                        select : {
                            perpersonas : {
                                select : {
                                    pernombrecompleto   : true,
                                    pernombre           : true,
                                    perapellidopaterno  : true,
                                    perapellidomaterno  : true,
                                }
                            },
                            espid               : true,
                            espfechaprogramado  : true,
                            espchacargareal     : true,
                            espfechactualizacion: true,
                            espbasedato         : true,
                            espresponsable      : true,
                            espdiaretraso       : true,
                        }
                    })

                    esps.forEach((esp, index_esp)=> {

                        let day_late = esp.espdiaretraso

                        if(esp.espfechactualizacion == null){

                            date_two    = moment(esp.espfechaprogramado)
                            date_one    = moment()
                            
                            if(date_one > date_two){
                                let diff_days_date_one_two = date_one.diff(date_two, 'days')
                                
                                if( diff_days_date_one_two > 0){
                                    day_late = diff_days_date_one_two
                                }else{
                                    day_late = '0'
                                }
                            }else{
                                day_late = '0'
                            }
                        }

                        esps[index_esp]['espdiaretraso'] = day_late
                    })

                    ares[index_ares]['esps'] = esps

                    if(are.areareasestados.arenombre == 'SAC Sell Out Detalle'){
                        aresn[3]    = ares[index_ares]
                    }else if(are.areareasestados.arenombre == 'SAC Sell Out'){
                        aresn[2]    = ares[index_ares]
                    }else if(are.areareasestados.arenombre == 'SAC Sell In'){
                        aresn[1]    = ares[index_ares]
                    }else if(are.areareasestados.arenombre == 'Revenue'){
                        aresn[0]    = ares[index_ares]
                    }else if(are.areareasestados.arenombre == 'SAC ADM'){
                        aresn[4]    = ares[index_ares]
                    }else{
                        aresn[5]    = ares[index_ares]
                    }

                    index_ares = index_ares + 1

                }

                tprs[index_tpr]['ares'] = aresn

                if(index_tpr == 0){
                    tprs[index_tpr]['seleccionado'] = true
                }

                esps_dts = await prisma.espestadospendientes.findMany({
                    select : {
                        perpersonas : true,
                        areareasestados : {
                            select : {
                                tprtipospromociones : true,
                                arenombre : true
                            }
                        },
                        espdiaretraso : true,
                        espfechactualizacion : true,
                        espfechaprogramado : true,
                        fecfechas : true,
                        cliclientes : {
                            select : {
                                zonzonas : true
                            }
                        }
                    },
                })

                esps_dts = esps_dts.filter(esp => 
                                            esp.areareasestados.tprtipospromociones.tprid == tpr.tprid 
                                            && esp.areareasestados.arenombre == 'SAC Sell Out Detalle' 
                                            && esp.fecfechas.fecfecha == date_final+'-01'
                                        )

                esps_dts.forEach( (esp_dts, index_esp_dts) => {
                    
                    let day_late = esp_dts.espdiaretraso

                    if(esp_dts.espfechactualizacion == null){

                        date_one    = moment()
                        date_two    = moment(esp_dts.espfechaprogramado)

                        if(date_one == date_two){
                            day_late = '0'
                        }else{
                            if(date_one > date_two){
                                let diff_days_date_one_two = date_one.diff(date_two, 'days')
                                
                                if( diff_days_date_one_two > 0){
                                    day_late = diff_days_date_one_two
                                }else{
                                    day_late = '0'
                                }
                            }else{
                                day_late = '0'
                            }
                        }
                    }

                    esps_dts[index_esp_dts]['espdiaretraso'] = day_late
                });

            }

            index_tpr = index_tpr + 1
        }

        data = tprs

        res.status(200).json({
            response    : true,
            messagge    : 'Se obtuvo el estado pendiente de status con éxito',
            date1       : date_one, 
            date2       : date_two,
            datos       : data,
            espsDistribuidoras : esps_dts
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            messagge    : 'Ha ocurrido un error al obtener el estado pendiente de status',
            msgdev      : err
        })
    }
}

module.exports = controller