const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

controller.MetSellin = async (req, res, data, delete_data) => {

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
                        espbasedato : 'Sellin Thanos (Mes actual)'
                    }
                ]
            }
        })

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

        const { messages_delete_data } = controller.SellinOverWrittern(delete_data)

        if(req_delete_data == 'true'){
            for await (const dat of delete_data ){
    
                await prisma.sellin.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat
                        },
                    }
                })
            }
        }

        await prisma.sellin.createMany({
            data
        })

        res.status(200).json({
            message : 'Los datos de Sell In fueron cargados correctamente',
            messages_delete_data,
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar el Sellin',
            devmsg  : error
        })
    }
}


controller.SellinOverWrittern = (messages_dts) => {
    
    const messages_delete_date = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_date.findIndex( date => date == msg)

        if(index_msg_dts == -1){
            messages_delete_date.push(msg)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes fechas",
            "data"      : messages_delete_date
        }
    ]

    return { messages_delete_data }

}

module.exports = controller