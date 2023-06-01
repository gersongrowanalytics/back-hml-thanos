const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
moment.locale('es');

controller.MetCrearAmbienteStatus = async ( req, res ) => {

    const {
        req_fecfecha,
        req_sithanos,
        req_masterproductos,
        req_masterclientes,
        req_masterprecios,
        req_socuota,
        req_archivoplano,
        req_sachml,
    } = req.body


    const dias = ['Domingo','Lunes', 'Martes','Miercoles','Jueves','Viernes']

    const mesnombre = moment( new Date(req_fecfecha)).format('MMMM')
    const fecmesabreviacion = mesnombre.substring(0,3).toUpperCase()
    const fecdianumero      = new Date(req_fecfecha).getDate()
    const fecmesnumero      = new Date(req_fecfecha).getMonth() + 1
    const fecanionumero     = new Date(req_fecfecha).getFullYear()
    const fecdiatexto       = dias[new Date(req_fecfecha).getDay()]
    const fecmestexto       = mesnombre.charAt(0).toUpperCase() + mesnombre.slice(1)
    const fecfecha          = new Date(req_fecfecha)

    try{

        const fecfechaexists = await prisma.fecfechas.findFirst({
            where : {
                fecmesnumero    : fecmesnumero,
                fecanionumero   : fecanionumero
            }
        })

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

            const espexis = await prisma.espestadospendientes.findFirst({
                where : {
                    fecid : fecfechaexists.fecid
                }
            })

            if(!espexis){
                await controller.CreateDataAreEsp(fecfechaexists, req_sithanos,req_masterproductos, req_masterclientes, req_masterprecios, req_socuota, req_archivoplano, req_sachml )
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

            await controller.CreateDataAreEsp(fecn, req_sithanos,req_masterproductos, req_masterclientes, req_masterprecios, req_socuota, req_archivoplano, req_sachml )
        }

        res.status(200).json({
            response    : true,
            message     : 'Se ha creado el ambiente para status exitosamente'
        })
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al crear el ambiente para status'
        })
    }
}

controller.CreateDataAreEsp = async ( fecn, req_sithanos,req_masterproductos, req_masterclientes, req_masterprecios, req_socuota, req_archivoplano, req_sachml ) => {
    //Revenue
    const are_revenue = await prisma.areareasestados.create({
        data : {
            fecid           : fecn.fecid,
            tprid           : 1,
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
            tprid           : 1,
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
            tprid           : 1,
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
            tprid           : 1,
            areicono        : '/Sistema/Modulos/Home/areas/iconoSac.png',
            arenombre       : 'DT',
            areporcentaje   : '0',
        }
    })
    const are_dt_id = are_dt.areid

    //REVENUE
    console.log(fecn.fecid)
    const esprevsi = await prisma.espestadospendientes.create({
        data : {
            tprid                   : 1,
            perid                   : null,
            fecid                   : fecn.fecid,
            areid                   : are_revenue_id,
            espfechaprogramado      : new Date(req_sithanos),
            espchacargareal         : null,
            espfechactualizacion    : null,
            espbasedato             : 'Sellin Thanos (Mes actual)',
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
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
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
            tprid                   : 1
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
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
            tprid                   : 1
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
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
            tprid                   : 1
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
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
            tprid                   : 1
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
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
            tprid                   : 1
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
            espresponsable          : 'Usu Dev',
            espdiaretraso           : '0',
            esporden                : false,
            cliid                   : null,
            tprid                   : 1
        }
    })
}

module.exports = controller