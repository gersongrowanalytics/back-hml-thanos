const controller = {}
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetMostrarEstadoPendiente = async ( req, res ) => {

    let {
        date_initial,
        date_final
    } = req.body

    try{

        let date_one    = ""
        let date_two    = ""
        let data        = []
        let esps_dts    = []

        if(date_final){
            date_final = moment(date_final).format("YYYY-MM");
        }else{
            date_final = null
        }

        const tprs  = await prisma.tprtipospromociones.findMany({})

        let index = 0

        for await (const tpr of tprs ){
            console.log('------------TPDR--' + tpr.tprid)

            const ares = await prisma.espestadospendientes.findMany({
                include : {
                    areareasestados : {
                        include : {
                            tprtipospromociones : true
                        }
                    },
                    fecfechas : true
                    
                },
            })

            // if(index == 0){
            //     console.log(ares)
            //     console.log(ares.tprtipospromociones)
            // }
            // if(ares.areareasestados.tprtipospromociones){
            //     if(ares.areareasestados.tprtipospromociones.tprid == tpr.tprid){
            //         data.push(ares)
            //     }
            // }
            let data_pre = ares.filter(dat => dat.areareasestados.tprtipospromociones.tprid == tpr.tprid)
            data.push(data_pre)

            console.log('------------------------------------------')



            if(ares.length > 0){
                let aresn = [ [], [], [], [], [] ]

                let date_actual = moment().format('YYYY-MM-DD');
                date_one        = moment(date_actual)    

                let index_ares = 0
                for await (const tpr of ares ){
                    
                    const esps = await prisma.espestadospendientes.findMany({

                    })
                }
            }

            index = index + 1
        }

        res.status(200).json({
            response    : true,
            messagge    : 'Se obtuvo el estado pendiente de status con éxito',
            data        : data
        })

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