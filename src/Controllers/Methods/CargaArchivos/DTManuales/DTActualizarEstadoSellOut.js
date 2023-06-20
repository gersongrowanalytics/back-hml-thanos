const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment')

controller.ActualizarEstadoSellOut = async ( req, res, data, audpk=[], devmsg=[] ) => {

    const {
        usutoken
    } = req.headers

    try{

        const usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : usutoken
            },
            select: {
                usuid: true,
                usuusuario: true,
                perid : true
            }
        })

        const espn = []

        const fec = await prisma.fecfechas.findFirst({
            where : {
                fecmesabierto : true,
            },
            select : {
                fecid : true
            }
        })

        const fecid = fec.fecid

        const are = await prisma.areareasestados.findFirst({
            where : {
                fecid       : fecid,
                arenombre   : 'Ventas'
            }
        })

        const data_espn = data.filter(dat => dat.m_cl_grow != null)
            
        for await (const esp of data_espn){

            const espo = await prisma.espestadospendientes.findFirst({
                where : {
                    fecid       : fecid,
                    m_cl_grow   : esp.m_cl_grow
                }
            })

            if(espo){
                const updated_esp = await prisma.espestadospendientes.update({
                    where : {
                        espid : espo.espid
                    },
                    data : {
                        espfechactualizacion    : new Date(),
                        perid                   : usu.perid
                    }
                })
                audpk.push("espestadospendientes-update-"+updated_esp.espid)
            }else{
                if(espn.findIndex(es => es.m_cl_grow == esp.m_cl_grow) == -1){
                    espn.push({
                        fecid               : fec.fecid,
                        perid               : usu.perid,
                        tprid               : 1,
                        espdts              : true,
                        areid               : are.areid,
                        m_cl_grow           : esp.m_cl_grow,
                        espfechaprogramado  : new Date(),
                        espchacargareal     : null,
                        espfechactualizacion: null,
                        espbasedato         : 'DTS (Sell Out)',
                        espresponsable      : 'Ventas',
                        espdiaretraso       : '0',
                        esporden            : false,
                    })
                }
            }
        }

        for await (const esp of espn){
            const create_esp = await prisma.espestadospendientes.create({
                data : {
                    ...esp
                }
            })
            audpk.push("espestadospendientes-create-"+create_esp.espid)
        }

        const espe = await prisma.espestadospendientes.findFirst({
            where : {
                AND : [
                    {
                        fecid : fecid
                    },
                    {
                        espbasedato : 'Archivo plano SO (plantilla)'
                    }
                ]
            }
        })

        if(espe){

            let date_one = moment()
            let date_two = moment(espe.espfechaprogramado)
    
            let esp_day_late
            if(date_one > date_two){
    
                let diff_days_date_one_two = date_one.diff(date_two, 'days')
    
                if( diff_days_date_one_two > 0){
                    esp_day_late = diff_days_date_one_two.toString()
                }else{
                    esp_day_late = '0'
                }
            }else{
                esp_day_late = '0'
            }
    
            const espu = await prisma.espestadospendientes.update({
                where : {
                    espid : espe.espid
                },
                data : {
                    perid                   : usu.perid,
                    espfechactualizacion    : new Date().toISOString(),
                    espdiaretraso           : esp_day_late
                }
            })
            audpk.push("espestadospendientes-update"+espu.espid)
    
            const aree = await prisma.areareasestados.findFirst({
                where : {
                    areid : espe.areid
                }
            })
    
            if(aree){
                let are_percentage
                const espcount = await prisma.espestadospendientes.findMany({
                    where : {
                        fecid       : fecid,
                        areid       : espe.areid,
                        espdts      : false,
                        espfechactualizacion : null
                    }
                })
    
                if(espcount.length == 0){
                    are_percentage = '100'
                }else{
                    are_percentage = (100-(espcount.length*50)).toString()
                }
                
                const areu = await prisma.areareasestados.update({
                    where : {
                        areid : aree.areid
                    },
                    data : {
                        areporcentaje : are_percentage
                    }
                })
                audpk.push("areareasestados-update"+areu.areid)
            }
        }

        console.log('Actualizar estado sell out')

        return false

    }catch(err){
        console.log(err)
        devmsg.push("ActualizarEstadoSellOut-"+err.toString())
        return true
    }
}

module.exports = controller