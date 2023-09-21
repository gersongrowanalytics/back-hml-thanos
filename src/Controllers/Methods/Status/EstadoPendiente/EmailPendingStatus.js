const controller = {}
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const SendMail = require('../../Reprocesos/SendMail')
const MostrarEstadoPendiente = require('./MostrarEstadoPendiente')
const ObtenerDataTerritorio = require('./Helpers/ObtenerDataTerritorio')

controller.MetEmailPendingStatus = async ( req, res ) => {

    try{

        const fec = await prisma.fecfechas.findFirst({
            where : {
                fecmesabierto: true,
            },
            select: {
                fecfecha: true,
                fecanionumero: true,
                fecmesnumero: true,
            }
        })

        const mes = fec.fecmesnumero < 10 ? "0"+fec.fecmesnumero : fec.fecmesnumero
        let fechaSend = fec.fecanionumero+"-"+mes

        const reqbody = {
            body: {
                date_final: fechaSend
            }
        }
        
        const { datos, espsDistribuidoras, response, messagge } = await MostrarEstadoPendiente.MetMostrarEstadoPendiente(reqbody)

        if(response){
            const fechaActual = new Date()
            const diaActual = fechaActual.getDate().toString().padStart(2, '0')
            const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
            const anioActual = fechaActual.getFullYear().toString()
            const fechaFormateada = diaActual +'.'+ mesActual
            const nombresMeses = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ]
            const mesTexto = fechaActual.getMonth() > 0 ? fechaActual.getMonth() - 1 : 11

            const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoStatus.html')
            // const from_mail_data = process.env.USER_MAIL
            const from_mail_data = "Grow TeamSupport:"
            // const to_mail_data = process.env.TO_MAIL
            // const to_mail_data = ["frank.martinez@grow-analytics.com.pe"]
            // const to_mail_data = ["Gerson.Vilca@grow-analytics.com.pe"]
            // const to_mail_data = ["Gerson.Vilca@grow-analytics.com.pe", "frank.martinez@grow-analytics.com.pe"]
            const to_mail_data = [
                // "gporras@softys.com", "jabarcan@softys.com", "cpachecot@softys.com", "maria.yauri@softys.com",
                // "supdistribuidorlima@softys.com", "supventasprov@softys.com", "dmorales@softys.com", "rsalinas@softys.com",
                "gerson.vilca@tecsup.edu.pe"
                // "maria.yauri@softys.com",
                // "lsecca@softys.com",
                // "rsalinas@softys.com",
                // "dmorales@softys.com",
                // "fvillamonte@softys.com",
                // "gporras@softys.com",
                // "jabarcan@softys.com",
                // "cpachecot@softys.com",
                // "aquiroz@softys.com",
                // "bshiomura@softys.com",
                // "brodriguezs@softys.com",
                // "cesar.sanchez.a@softys.com",
                // "ccaceresm@softys.com",
                // "esotomayor@softys.com",
                // "ihurtado@softys.com",
                // "isantacruz@softys.com",
                // "lvigil@softys.com",
                // "maria.guevara@softys.com",
                // "ogarcia@softys.com",
                // "vromeroe@softys.com",

            ]
            
            // const to_mail_data = ["Gerson.Vilca@grow-analytics.com.pe", "jazmin.laguna@grow-analytics.com.pe", "jabarcan@softys.com"]
            // const to_mail_cc_data = [""]
            const to_mail_cc_data = [
                // "miguel.caballero@grow-analytics.com.pe", "jazmin.laguna@grow-analytics.com.pe", 
                "Gerson.Vilca@grow-analytics.com.pe", 
                // "frank.martinez@grow-analytics.com.pe", "Jose.Cruz@grow-analytics.com.pe"
            ]
            const subject_mail_success = `Distribuidores. Status ${nombresMeses[mesTexto]} ${anioActual} (Procesos de Data Sell Out)`
            // const subject_mail_success = `Distribuidores: Status ${nombresMeses[mesTexto]} 2023`
            // const subject_mail_success = `Distribuidores Thanos: Status-Cierre Agosto 2023`
            const sextoDiaHabil = await controller.MetFindDayBusiness()
            const filterEspsDistribuidoras = espsDistribuidoras.filter(esp => {
                if(esp.espfechactualizacion == null){
                    return {...esp}
                }else{
                    if(esp.espfechactualizacion >= sextoDiaHabil){
                        return {...esp}
                    }else{
                        return false
                    }
                }
            })
            await filterEspsDistribuidoras.map((dts, index) => filterEspsDistribuidoras[index]['indice'] = index + 1)

            const DTfilterEspsDistribuidoras = espsDistribuidoras.filter(esp => esp.espfechactualizacion !== null)

            const data_productos_so = await ObtenerDataTerritorio.MetObtenerDataTerritorio()

            const data_mail = {
                data: datos,
                dataExcludeDt: datos.filter(a => a.arenombre != 'DT'),
                dtsCantidad: DTfilterEspsDistribuidoras.length,
                datadts: filterEspsDistribuidoras,
                datapso: data_productos_so,
                fechaActual: fechaFormateada
            }

            await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail, to_mail_cc_data)
            res.status(200).json({
                response    : true,
                messagge    : 'Se envió el estatus al correo correctamente',
            })
        }else{
            res.status(500).json({
                response    : response,
                messagge    : messagge,
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            messagge    : 'Ha ocurrido un error al obtener el estado pendiente de status',
            msgdev      : err
        })
    }
}

controller.MetFindDayBusiness = async () => {
    const fechaActual = new Date()
    const mesActual = fechaActual.getMonth()
    const anioActual = fechaActual.getFullYear()
    const ultimoDiaDelMes = new Date(anioActual, mesActual + 1, 0)
    const cantidadDias = ultimoDiaDelMes.getDate()

    let diaActual = 1
    let diaHabil = 0
    let sextoDiaHabil = null

    for(let index = 1; index <= cantidadDias; index++){
        const fechaActualizada = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), diaActual)

        if(fechaActualizada.getDay() !== 0 && fechaActualizada.getDay() !== 6){
            diaHabil++
            if(diaHabil === 6){
                fechaActualizada.setUTCHours(0, 0, 0, 0)
                sextoDiaHabil = fechaActualizada
            }
        }

        diaActual++
    }

    return sextoDiaHabil
}

module.exports = controller