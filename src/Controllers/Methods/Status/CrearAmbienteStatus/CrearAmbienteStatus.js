const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
moment.locale('es');
const SendMailController = require('../../Reprocesos/SendMail')
const path = require('path');

controller.MetCrearAmbienteStatus = async ( req, res ) => {

    const {
        req_sithanos,
        req_masterproductos,
        req_masterclientes,
        req_masterprecios,
        req_socuota,
        req_archivoplano,
        req_sachml,
        req_mclientesg,
        req_mproductosg,
        req_fecfecha,
    } = req.body

    let response    = true
    let message     = "Se ha creado el ambiente para status exitosamente"
    let statusCode  = 200
    let msgdev      = []
    
    try{

        const formatoFechaRegex = /^\d{4}\/\d{2}\/\d{2}$/;
        
        let fechaValida = true
        let fechasInvalidas = []
        let arrayFechas = [
            {
                "nombre" : "req_sithanos",
                "fecha" : req_sithanos,
            },
            {
                "nombre" : "req_masterproductos",
                "fecha" : req_masterproductos,
            },
            {
                "nombre" : "req_masterclientes",
                "fecha" : req_masterclientes,
            },
            {
                "nombre" : "req_masterprecios",
                "fecha" : req_masterprecios,
            },
            {
                "nombre" : "req_socuota",
                "fecha" : req_socuota,
            },
            {
                "nombre" : "req_archivoplano",
                "fecha" : req_archivoplano,
            },
            {
                "nombre" : "req_sachml",
                "fecha" : req_sachml,
            },
            {
                "nombre" : "req_fecfecha",
                "fecha" : req_fecfecha,
            },
        ]

        arrayFechas.map((fec) => {
            if(!formatoFechaRegex.test(fec.fecha)){
                fechaValida = false
                fechasInvalidas.push(fec.nombre)
            }
        })

        if(fechaValida){

            const dias = [ 'Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado' ]
            const mesnombre = moment( new Date(req_fecfecha)).format('MMMM')
            const fecmesabreviacion = mesnombre.substring(0,3).toUpperCase()
            const fecdianumero      = new Date(req_fecfecha).getDate()
            const fecmesnumero      = new Date(req_fecfecha).getMonth() + 1
            const fecanionumero     = new Date(req_fecfecha).getFullYear()
            const fecdiatexto       = dias[new Date(req_fecfecha).getDay()]
            const fecmestexto       = mesnombre.charAt(0).toUpperCase() + mesnombre.slice(1)
            const fecfecha          = new Date(req_fecfecha)
    
            let responseEsp = true
            //Verifica si existe fecha
            const fecfechaexists = await prisma.fecfechas.findFirst({
                where : {
                    fecmesnumero    : fecmesnumero,
                    fecanionumero   : fecanionumero
                }
            })
    
            //Si fecha existe actualiza el mes abierto por la que se envia
            if(fecfechaexists){
                await prisma.fecfechas.updateMany({
                    data : {
                        fecmesabierto : false
                    },
                    where : {
                        NOT : {
                            fecmesnumero : fecmesnumero,
                            fecanionumero : fecanionumero
                        }
                    }
                })
    
                await prisma.fecfechas.update({
                    data : {
                        fecmesabierto : true
                    },
                    where : {
                        fecid : fecfechaexists.fecid
                    }
                })
    
                const areExist = await prisma.areareasestados.findFirst({
                    where : {
                        fecid : fecfechaexists.fecid
                    }
                })
    
                if(!areExist){
                    responseEsp = await controller.CreateDataAreEsp(
                        fecfechaexists, 
                        req_sithanos,
                        req_masterproductos, 
                        req_masterclientes, 
                        req_masterprecios, 
                        req_socuota, 
                        req_archivoplano, 
                        req_sachml
                    )
                }else{
                    message = "Ya existe el entorno creado para el presente mes"
                }
            }else{
                await prisma.fecfechas.updateMany({
                    data : {
                        fecmesabierto : false
                    }
                })
                
                const fecn = await prisma.fecfechas.create({
                    data : {
                        fecfecha            : fecfecha,
                        fecmesabreviacion   : fecmesabreviacion,
                        fecdianumero        : fecdianumero,
                        fecanionumero       : fecanionumero,
                        fecaniotexto        : fecanionumero.toString(),
                        fecdiatexto         : fecdiatexto,
                        fecmesnumero        : fecmesnumero,
                        fecmestexto         : fecmestexto,
                        fecmesabierto       : true
                    }
                })
    
                responseEsp = await controller.CreateDataAreEsp(
                    fecn, 
                    req_sithanos,
                    req_masterproductos, 
                    req_masterclientes, 
                    req_masterprecios, 
                    req_socuota, 
                    req_archivoplano, 
                    req_sachml, 
                )
            }
    
            if(!responseEsp){
                statusCode  = 500
                response    = false,
                message     = 'Ha ocurrido un error al generar los estados pendientes'
            }
        }else{
            statusCode  = 500
            response    = false
            message     = 'Ha ocurrido un error al generar los estados pendientes. El formato de las fecha debe ser "YYYY/MM/DD"'
            msgdev      = fechasInvalidas
        }
    }catch(err){
        console.log(err)
        statusCode  = 500
        response    = false,
        message     = 'Ha ocurrido un error en el servidor al crear el ambiente para status'
    }finally{
        
        const success_mail_html = path.resolve(__dirname, '../../Mails/CorreoCreacionEntorno.html');
        const from_mail_data = process.env.USER_MAIL
        const to_mail_data = process.env.TO_MAIL
        const subject_mail_success = response ? "Creación de entorno Status" : "Error al crear entorno de status"
        const data_mail = {
            message,
            msgdev,
            fecha : req_fecfecha,
            response,
            error : response ? false : true
        }
        
        await SendMailController.MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail)

        res.status(statusCode).json({
            response,
            message,
            msgdev
        })
    }
}

controller.ResetAreEsp = async ( fecid ) => {

    await prisma.espestadospendientes.deleteMany({
        where : {
            fecid : fecid.fecid
        }
    })

    await prisma.areareasestados.deleteMany({
        where : {
            fecid : fecid.fecid
        }
    })
}

controller.CreateDataAreEsp = async ( fecn, req_sithanos, req_masterproductos, req_masterclientes, req_masterprecios, req_socuota, req_archivoplano, req_sachml ) => {

    let tprId

    try{

        const idStatus = await prisma.tprtipospromociones.findFirst({
            where : {
                tprnombre : "Status"
            },
            select : {
                tprid : true
            }
        })

        if(idStatus){
            tprId = idStatus.tprid
        }else{
            const createStatus = await prisma.tprtipospromociones.create({
                data : {
                    tprnombre : "Status"
                }
            })

            tprId = createStatus.tprid
        }

        //Revenue
        const are_revenue = await prisma.areareasestados.create({
            data : {
                fecid           : fecn.fecid,
                tprid           : tprId,
                areicono        : '/Sistema/Modulos/Home/areas/iconoRevenue.png',
                arenombre       : 'Revenue',
                areporcentaje   : '0',
            }
        })

        const are_revenue_id = are_revenue.areid

        //Ventas
        const are_ventas = await prisma.areareasestados.create({
            data : {
                fecid           : fecn.fecid,
                tprid           : tprId,
                areicono        : '/Sistema/Modulos/Home/areas/iconoSac.png',
                arenombre       : 'Ventas',
                areporcentaje   : '0',

            }
        })
        const are_ventas_id = are_ventas.areid

        //Sac
        const are_sac = await prisma.areareasestados.create({
            data : {
                fecid           : fecn.fecid,
                tprid           : tprId,
                areicono        : '/Sistema/Modulos/Home/areas/iconoSac.png',
                arenombre       : 'SAC',
                areporcentaje   : '0',
            }
        })
        const are_sac_id = are_sac.areid

        //DT
        const are_dt = await prisma.areareasestados.create({
            data : {
                fecid           : fecn.fecid,
                tprid           : tprId,
                areicono        : '/Sistema/Modulos/Home/areas/iconoSac.png',
                arenombre       : 'DT',
                areporcentaje   : '0',
            }
        })
        const are_dt_id = are_dt.areid


        //REVENUE
        const esprevsi = await prisma.espestadospendientes.create({
            data : {
                tprid                   : tprId,
                perid                   : null,
                fecid                   : fecn.fecid,
                areid                   : are_revenue_id,
                espfechaprogramado      : new Date(req_sithanos),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Sell In Thanos (Mes Actual)',
                espresponsable          : 'Arturo Levano',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
            }
        })

        const esprevmpro = await prisma.espestadospendientes.create({
            data : {
                fecid                   : fecn.fecid,
                perid                   : null,
                areid                   : are_revenue_id,
                espfechaprogramado      : new Date(req_masterproductos),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Master Productos',
                espresponsable          : 'Arturo Levano',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
                tprid                   : tprId
            }
        })
        const esprevmcli = await prisma.espestadospendientes.create({
            data : {
                fecid                   : fecn.fecid,
                perid                   : null,
                areid                   : are_revenue_id,
                espfechaprogramado      : new Date(req_masterclientes),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Master Clientes',
                espresponsable          : 'Arturo Levano',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
                tprid                   : tprId
            }
        })

        const esprevmpre = await prisma.espestadospendientes.create({
            data : {
                fecid                   : fecn.fecid,
                perid                   : null,
                areid                   : are_revenue_id,
                espfechaprogramado      : new Date(req_masterprecios),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Master de Precios',
                espresponsable          : 'Arturo Levano',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
                tprid                   : tprId
            }
        })

        //VENTAS
        const espvenso = await prisma.espestadospendientes.create({
            data : {
                fecid                   : fecn.fecid,
                perid                   : null,
                areid                   : are_ventas_id,
                espfechaprogramado      : new Date(req_socuota),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Sell Out (Cuota)',
                espresponsable          : 'Ventas',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
                tprid                   : tprId
            }
        })

        const espvenapl = await prisma.espestadospendientes.create({
            data : {
                fecid                   : fecn.fecid,
                perid                   : null,
                areid                   : are_ventas_id,
                espfechaprogramado      : new Date(req_archivoplano),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Archivo plano SO (plantilla)',
                espresponsable          : 'Ventas',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
                tprid                   : tprId
            }
        })

        //SAC
        const espsachml = await prisma.espestadospendientes.create({
            data : {
                fecid                   : fecn.fecid,
                perid                   : null,
                areid                   : are_sac_id,
                espfechaprogramado      : new Date(req_sachml),
                espchacargareal         : null,
                espfechactualizacion    : null,
                espbasedato             : 'Homologaciones',
                espresponsable          : 'SAC',
                espdiaretraso           : '0',
                esporden                : false,
                m_cl_grow               : null,
                tprid                   : tprId
            }
        })

        return true
    }catch(err){
        console.log("Ha ocurrido un error a crear los registros de estados pendientes");
        return false
    }
}

module.exports = controller