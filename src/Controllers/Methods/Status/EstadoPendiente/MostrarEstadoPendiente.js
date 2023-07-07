const controller = {}
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ActualizarSacStatusController = require('./ActualizarSacStatus')

controller.MetMostrarEstadoPendiente = async ( req, res=null ) => {

    let {
        date_final
    } = req.body

    try{

        let date_one    = ""
        let date_two    = ""
        let query_eps   = {}
        let ares        = []
        let arr_dts     = []
        let data_dts    = []
        let areid_sac
        let day_late_sac

        const prod_no_hml_count = await prisma.master_productos_so.count({
            where : {
                homologado : false
            }
        })
        
        const last_prod_hml = await prisma.master_productos_so.findFirst({
            where : {
                homologado : true
            },
            select : {
                // perpersonas : true,
                updated_at  : true,
                id          : true,
                usuusuarios : {
                    select : {
                        perpersonas : true
                    }
                }
            },
            orderBy : {
                updated_at : 'desc'
            }
        })

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

            if(ares.length > 0){

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
                                    conexion    : true,
                                    id          : true,
                                    codigo_destinatario : true
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
                        let month_late = false
    
                        if(esp.espfechactualizacion == null){
    
                            date_two    = moment(esp.espfechaprogramado)
                            date_one    = moment()
                            
                            if(date_one > date_two){
                                let diff_days_date_one_two = date_one.diff(date_two, 'days')
                                if( diff_days_date_one_two > 0){
                                    day_late = (diff_days_date_one_two).toString()
                                }else{
                                    day_late = '0'
                                }
                            }else{
                                day_late = '0'
                            }
                        }else{
                            date_two    = moment(esp.espfechaprogramado)
                            date_one    = moment(esp.espfechactualizacion)

                            let month_deadline  = date_two.month()
                            let month_updated   = date_one.month()

                            if(month_updated > month_deadline){
                                month_late = true
                            }
    
                            if(date_one > date_two){
                                let diff_days_date_one_two = date_one.diff(date_two, 'days')
                                
                                if( diff_days_date_one_two > 0){
                                    day_late = diff_days_date_one_two.toString()
                                }else{
                                    day_late = '0'
                                }
                            }else{
                                day_late = '0'
                            }
                        }
                        
                        ares[index_are]['esps'][index_esp]['espdiaretraso'] = day_late
                        ares[index_are]['esps'][index_esp]['espmesretraso'] = month_late
                        
                        if(are.arenombre == 'Ventas' && esp.espdts == false){
                            arr_no_dts.push(esp)
                        }else if(are.arenombre == 'Ventas' && esp.espdts == true){
                            arr_dts.push(esp)
                        }
    
                        if(are.arenombre == 'SAC'){
                            day_late_sac = day_late
                        }
                    })
    
                    if(are.arenombre == 'Ventas'){
                        ares[index_are]['esps'] = arr_no_dts
                        ares[index_are]['esps'] = ares[index_are]['esps'].sort(function (a, b){
                            return a.espbasedato > b.espbasedato ? 1 : -1
                        })
                    }
    
                    if(are.arenombre == 'SAC'){
                        are.areporcentaje                   = prod_no_hml_count == 0 ? '100' : '0'
                        are.esps[0]['perpersonas']          = last_prod_hml?.usuusuarios ? last_prod_hml.usuusuarios.perpersonas : null
                        are.esps[0]['espfechactualizacion'] = last_prod_hml?.updated_at
                        are.esps[0]['espdiaretraso']        = prod_no_hml_count == 0 ? '0' : day_late_sac
                        areid_sac = are.areid
                    }
                })

                await ActualizarSacStatusController.MetActualizarSacAreasEstados(areid_sac, prod_no_hml_count)                                
    
                const espe = await prisma.espestadospendientes.findFirst({
                    where : {
                        fecid : fec.fecid,
                        areid : areid_sac,
                    }
                })
                                
                if(last_prod_hml){
                    await ActualizarSacStatusController.MetActualizarSacEstadoPendiente(espe.espid, prod_no_hml_count, last_prod_hml, day_late_sac)                    
                }
                
                arr_dts.forEach((ndts, index_ndts) => {
                    arr_dts[index_ndts]['key'] = index_ndts + 1
                    arr_dts[index_ndts]['zona'] = ndts.masterclientes_grow ? ndts.masterclientes_grow.zona : null
                    arr_dts[index_ndts]['territorio'] = ndts.masterclientes_grow ? ndts.masterclientes_grow.territorio : null
                    arr_dts[index_ndts]['cliente_hml'] = ndts.masterclientes_grow ? ndts.masterclientes_grow.cliente_hml : null
                    arr_dts[index_ndts]['sucursal_hml'] = ndts.masterclientes_grow ? ndts.masterclientes_grow.sucursal_hml : null
                    arr_dts[index_ndts]['conexion'] = ndts.masterclientes_grow ? ndts.masterclientes_grow.conexion: null
                    arr_dts[index_ndts]['pernombrecompleto'] = ndts.perpersonas ? ndts.perpersonas.pernombrecompleto : null
                    arr_dts[index_ndts]['index_mcl_grow'] = ndts.masterclientes_grow ? ndts.masterclientes_grow.id : null
                })

                arr_dts.sort((a, b) => {
                    const fecha_a = new Date(a.espfechactualizacion)
                    const fecha_b = new Date(b.espfechactualizacion)
                    return fecha_b - fecha_a
                });
            }
        }

        const mc_grow = []
    
        const mcl_grow = await prisma.masterclientes_grow.findMany({
            where : {
                conexion    : 'MANUAL',
                estado      : 'ACTIVO'
            },
            distinct : ['codigo_destinatario']
        })
        
        let date_deadline = new Date()
        const date_lost_day = date_deadline.setDate(date_deadline.getDate() - 1)
        let espdiasretrasomcl = moment().diff(moment(date_lost_day), 'days')

        mcl_grow.forEach(element => {

            let existe_cliente = arr_dts.findIndex(arr => arr.masterclientes_grow.codigo_destinatario == element.codigo_destinatario)

            if(existe_cliente == -1){
                mc_grow.push({
                    espfechactualizacion: null,
                    espfechaprogramado : date_lost_day,
                    masterclientes_grow : element,
                    zona : element.zona,
                    territorio :  element.territorio,
                    cliente_hml : element.cliente_hml,
                    sucursal_hml : element.sucursal_hml,
                    conexion : element.conexion,
                    pernombrecompleto : '',
                    espresponsable : 'SAC',
                    espdiaretraso : espdiasretrasomcl.toString()
                })
            }
        })

        data_dts = arr_dts.concat(mc_grow)

        data_dts.sort((a, b) => {
            if(a.espfechactualizacion === null && b.espfechactualizacion === null) {
                return 0;
            }else if(a.espfechactualizacion === null) {
                return -1;
            }else if(b.espfechactualizacion === null) {
                return 1;
            } else {
                return 0;
            }
        });

        if(res){
            res.status(200).json({
                response    : true,
                messagge    : 'Se obtuvo el estado pendiente de status con éxito',
                espsDistribuidoras : data_dts,
                datos: ares,
            })
        }else{
            return {
                response    : true,
                messagge    : 'Se obtuvo el estado pendiente de status con éxito',
                espsDistribuidoras : data_dts,
                datos: ares,
            }
        }

    }catch(err){
        console.log(err)
        if(res){
            res.status(500).json({
                response    : false,
                messagge    : 'Ha ocurrido un error al obtener el estado pendiente de status',
                msgdev      : err
            })
        }else{
            return {
                response    : false,
                messagge    : 'Ha ocurrido un error al obtener el estado pendiente de status',
                espsDistribuidoras : '',
                datos: '',
            }
        }
    }
}

module.exports = controller