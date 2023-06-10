const controller = {}
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


controller.MetActualizarStatusHomologacion = async ( req, res, date, perid ) => {

    const {
        req_espid
    } = req.body

    const {
        usu_token
    } = req.headers

    try{

        let day_late
        let perid_usu
        let espo
        if(!date){
            const usu = await prisma.usuusuarios.findFirst({
                where : {
                    usutoken : usu_token
                },
                select : {
                    perpersonas: {
                        select : {
                            perid : true
                        }
                    }
                }
            })    
            perid_usu = usu.perpersonas.perid

            espo = await prisma.espestadospendientes.findFirst({
                where : {
                    espid : req_espid
                }
            })
        }else{
            perid_usu = perid
            espo = await prisma.espestadospendientes.findFirst({
                where : {
                    espbasedato : 'Homologaciones',
                    fecid : date
                }
            })
        }

        const areo = await prisma.areareasestados.findFirst({
            where : {
                areid : espo.areid,
            }
        })

        date_two    = moment(espo.espfechaprogramado)
        date_one    = moment()
        
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

        await prisma.espestadospendientes.update({
            where : {
                espid : espo.espid
            },
            data : {
                espfechactualizacion    : new Date(),
                espdiaretraso           : day_late,
                perid                   : perid_usu
            }
        })

        await prisma.areareasestados.update({
            where : {
                areid : areo.areid
            },
            data : {
                areporcentaje : '100'
            }
        })

        if(!date){
            res.status(200).json({
                message : 'Status actualizado con éxito',
                response : true
            })
        }else{
            return true
        }

    }catch(err){
        console.log(err)
        if(!date){
            res.status(500).json({
                message : 'Ha ocurrido un error al actualizar el status',
                response : false
            })    
        }else{
            return false
        }
    }
}

module.exports = controller