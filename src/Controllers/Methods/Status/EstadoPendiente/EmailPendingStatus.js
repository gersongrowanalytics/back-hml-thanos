const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const SendMail = require('../../Reprocesos/SendMail')
const path = require('path')
const MostrarEstadoPendiente = require('./MostrarEstadoPendiente')

controller.MetEmailPendingStatus = async ( req, res ) => {

    try{
        
        const { datos, espsDistribuidoras, response, messagge } = await MostrarEstadoPendiente.MetMostrarEstadoPendiente(req)

        if(response){
            const fechaActual = new Date()
            const diaActual = fechaActual.getDate().toString().padStart(2, '0')
            const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
            const anioActual = fechaActual.getFullYear().toString()
            const fechaFormateada = diaActual + mesActual + anioActual
            const nombresMeses = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ]
            const mesTexto = fechaActual.getMonth() > 0 ? fechaActual.getMonth() - 1 : 11

            const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoStatus.html')
            const from_mail_data = process.env.USER_MAIL
            const to_mail_data = process.env.TO_MAIL
            const subject_mail_success = `Distribuidores: Status ${nombresMeses[mesTexto]} 2023`
            // await espsDistribuidoras.map((dts, index) => espsDistribuidoras[index]['indice'] = index + 1)
            const filterEspsDistribuidoras = espsDistribuidoras.filter(esp => esp.espfechactualizacion == null)
            await filterEspsDistribuidoras.map((dts, index) => filterEspsDistribuidoras[index]['indice'] = index + 1)

            const get_master_producto_so = await prisma.master_productos_so.findMany({
                select: {
                    id: true,
                    homologado: true,
                    s_mtd: true,
                    m_cl_grow: true,
                },
                where: {
                    homologado: false,
                    m_cl_grow: {
                        not: null,
                    }
                }
            })
            const idsm_cl_grow = get_master_producto_so.map(d => d.m_cl_grow)
    
            const get_master_clientes_grow = await prisma.masterclientes_grow.findMany({
                where: {
                    id: {
                        in: idsm_cl_grow
                    }
                },
                select: {
                    id: true,
                    territorio: true,
                },
            })
    
            const data_final_productos_so = get_master_clientes_grow.map(gmcg => {
                let totalNoHml = 0
                let totalmtd = 0
                get_master_producto_so.map(gmp => {
                    if(gmp.m_cl_grow == gmcg.id){
                        totalNoHml = totalNoHml + 1
                        totalmtd = totalmtd + parseFloat(gmp.s_mtd)
                    }
                })
                return {
                    ...gmcg,
                    nohml: totalNoHml,
                    mtd: totalmtd.toFixed(2),
                }
            })

            const data_mail = {
                data: datos,
                dataExcludeDt: datos.filter(a => a.arenombre != 'DT'),
                dtsCantidad: espsDistribuidoras.length,
                datadts: filterEspsDistribuidoras,
                datapso: data_final_productos_so,
                fechaActual: fechaFormateada
            }
                        
            await SendMail.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)
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

module.exports = controller