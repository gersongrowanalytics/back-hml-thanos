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
            select: {
                fecid: true,
            },
            where : {
                fecanionumero   : date.year(),
                fecmesnumero    : date.month() + 1
            }
        })

        const fecid = fec.fecid

        const are = await prisma.areareasestados.findFirst({
            select: {
                areid: true,
            },
            where : {
                fecid       : fecid,
                arenombre   : 'Ventas'
            }
        })

        const espa = await prisma.espestadospendientes.findFirst({
            where : {
                fecid       : fecid,
                espbasedato : 'Archivo plano SO (plantilla)'                
            }
        })

        let data_espn = []
        data.filter(dat => dat.m_cl_grow != null).map(dat => {
            const find_data = data_espn.find(d_espn => d_espn.m_cl_grow === dat.m_cl_grow)
            if(!find_data){
                data_espn.push({
                    m_cl_grow: dat.m_cl_grow
                })
            }
        })

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
                        espfechaprogramado  : espa.espfechaprogramado,
                        espchacargareal     : null,
                        espfechactualizacion: new Date(),
                        espbasedato         : 'DTS (Sell Out)',
                        espresponsable      : 'Ventas',
                        espdiaretraso       : '0',
                        esporden            : false,
                    })
                }
            }
        }

        await prisma.espestadospendientes.createMany({
            data: espn,
        })

        espn.map(esp => {
            audpk.push("espestadospendientes-create-"+esp.espbasedato)
        })

        devmsg.push({
            response: true,
            message: "Se actualizó correctamente los DTS (Sell Out)",
        })
        return false

    }catch(err){
        console.log(err)
        devmsg.push({
            response: false,
            message: "Error al actualizar los DTS (Sell Out): "+err.toString(),
        })
        return true
    }
}

module.exports = controller