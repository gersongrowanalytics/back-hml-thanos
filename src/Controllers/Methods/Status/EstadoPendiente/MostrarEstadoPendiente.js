const controller = {}
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarEstadoPendiente = async ( req, res ) => {

    let {
        date_final
    } = req.body

    try{

        let date_one    = ""
        let date_two    = ""
        let query_eps   = {}
        let ares        = []
        let arr_dts     = []

        if(date_final != null){
            date_final = moment(date_final).format("YYYY-MM");
        }else{
            date_final = null
        }
        date_final = moment(date_final).format("YYYY-MM");

        query_eps = {...query_eps, fecfecha: { lte : date_final+'-01'}}

        const fec = await prisma.fecfechas.findFirst({
            where : {
                fecfecha : new Date(`${date_final}-01`)
            }
        })

        if(fec){

            ares = await prisma.areareasestados.findMany({
                where : {
                    fecid : fec.fecid
                },
                distinct : ['areid']
            })


            let index_are = 0
            for await (const are of ares){

                const esps = await prisma.espestadospendientes.findMany({
                    where : {
                        areid : are.areid
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
                        fecid                   : true,
                        espid                   : true,
                        espfechaprogramado      : true,
                        espchacargareal         : true,
                        espfechactualizacion    : true,
                        espbasedato             : true,
                        espresponsable          : true,
                        esporden                : true,
                        espdiaretraso           : true,
                        espdts                  : true,
                        masterclientes_grow : {
                            select : {
                                zona        : true,
                                territorio  : true,
                                cliente_hml : true,
                                sucursal_hml: true,
                                conexion    : true
                            }
                        },
                    },
                })

                ares[index_are]['esps'] = esps
                index_are = index_are + 1
            }

            ares.forEach((are, index_are) => {
                let arr_no_dts  = []
                are.esps.forEach((esp, index_esp) => {
                    
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
                    
                    ares[index_are]['esps'][index_esp]['espdiaretraso'] = day_late
                    
                    if(are.arenombre == 'Ventas' && esp.espdts == false){
                        arr_no_dts.push(esp)
                    }else if(are.arenombre == 'Ventas' && esp.espdts == true){
                        arr_dts.push(esp)
                    }
                })
                if(are.arenombre == 'Ventas'){
                    ares[index_are]['esps'] = arr_no_dts


                    ares[index_are]['esps'] = ares[index_are]['esps'].sort(function (a, b){
                        return a.espbasedato < b.espbasedato ? 1 : -1
                    })
                }
            });

            arr_dts.forEach((ndts, index_ndts) => {
                arr_dts[index_ndts]['key'] = index_ndts + 1
            });


        }

        res.status(200).json({
            response    : true,
            messagge    : 'Se obtuvo el estado pendiente de status con éxito',
            espsDistribuidoras : arr_dts,
            datos: ares,

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