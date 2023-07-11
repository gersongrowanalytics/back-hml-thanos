const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment')

controller.ActualizarEstadoSellOut = async ( req, res, data, audpk=[], devmsg=[] ) => {

    const {
        usutoken,
    } = req.headers

    const {
        req_date
    } = req.body

    try{
        
        const date = moment(req_date)
        const espn = []

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

        const fec = await prisma.fecfechas.findFirst({
            where : {
                fecanionumero   : date.year(),
                fecmesnumero    : date.month() + 1
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

        return false

    }catch(err){
        console.log(err)
        devmsg.push("ActualizarEstadoSellOut-"+err.toString())
        return true
    }
}

module.exports = controller