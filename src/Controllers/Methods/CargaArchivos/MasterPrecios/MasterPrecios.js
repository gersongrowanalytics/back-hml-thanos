const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

controller.MetMasterPrecios = async (req, res, data, dates_row) => {

    const {
        req_delete_data
    } = req.body

    const {
        usutoken
    } = req.headers

    try{

        const usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : usutoken
            },
            select : {
                usuid       : true,
                perid       : true,
                usuusuario  : true
            }
        })

        const fec = await prisma.fecfechas.findFirst({
            where : {
                fecmesabierto : true,
            },
            select : {
                fecid : true
            }
        })

        const fecid = fec.fecid

        const espe = await prisma.espestadospendientes.findFirst({
            where : {
                AND : [
                    {
                        fecid : fecid
                    },
                    {
                        espbasedato : 'Master de Precios'
                    }
                ]
            }
        })

        if(req_delete_data == 'true'){

            for await (const dat of dates_row ){
    
                await prisma.master_precios.deleteMany({
                    where: {
                        date: {
                            startsWith: dat
                        }
                    }
                })
            }
        }

        await prisma.master_precios.createMany({
            data
        })

        if(usu.usuid != 1){
            
            if(espe){
                if(usu.perid == 1 || usu.perid == 3 || usu.perid == 7 || usu.perid == 10){
                    
                }else{
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
                                espfechactualizacion : null
                            }
                        })

                        if(espcount.length == 0){
                            are_percentage = '100'
                        }else{
                            are_percentage = (100-(espcount.length*25)).toString()
                        }

                        const areu = await prisma.areareasestados.update({
                            where : {
                                areid : aree.areid
                            },
                            data : {
                                areporcentaje : are_percentage
                            }
                        })
                    }
                }
            }
        }

        res.status(200)
        res.json({
            message     : 'La data de Maestro precios fue cargada con éxito',
            response    : true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de leer el archivo',
            devmsg  : error
        })
    }
}

module.exports = controller