const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')
const RemoveFileS3 = require('../../S3/RemoveFileS3')

controller.MetDTManuales = async (req, res, data, delete_data) => {

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
                        espbasedato : 'Archivo plano SO (plantilla)'
                    }
                ]
            }
        })

        const { messages_delete_data } = controller.DistribuitorOverWrittern(delete_data)

        if(req_delete_data == 'true'){
            for await (const dat of delete_data ){
    
                await prisma.ventas_so.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat.cod_dt
                    }
                })
            }
        }

        await prisma.ventas_so.createMany({
            data
        })

        const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
        const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()

        const ARRAY_S3 = [
            "hmlthanos/pe/tradicional/archivosgenerados/maestraclientes/", 
            "hmlthanos/pe/tradicional/archivosgenerados/maaestraproductos/", 
            "hmlthanos/pe/tradicional/archivosgenerados/homologaciones/"
        ]

        for await (s3 of ARRAY_S3) {
            let reqUbi = {
                body: {
                    re_ubicacion_s3: s3
                }
            }
            await RemoveFileS3.RemoveFileS3(reqUbi)
        }

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
                    }
                }
            }
        }
        
        return res.status(200).json({
            message : 'Las ventas manuales fueron cargadas correctamente',
            messages_delete_data,
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de cargar las dt manuales',
            devmsg  : error
        })
    }
}

controller.DistribuitorOverWrittern = (messages_dts) => {
    
    const messages_delete_dts = []

    messages_dts.forEach( msg => {
        let index_msg_dts = messages_delete_dts.findIndex( mgdd => mgdd.dts == msg.cod_dt)

        if(index_msg_dts == -1){
            messages_delete_dts.push({
                "dts"   : msg.cod_dt,
                "dates" : [msg.fecha]
            })
        }else{
            messages_delete_dts[index_msg_dts]['dates'].push(msg.fecha)
        }
    });

    const messages_delete_data = [
        {
            "message"   : "Se está sobreescribiendo la información de las siguientes distribuidoras",
            "data"      : messages_delete_dts
        }
    ]

    return { messages_delete_data }

}

module.exports = controller