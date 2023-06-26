const controller = {}
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const bcryptjs = require('bcryptjs')
const GenerateCadenaAleatorio = require('../../Reprocesos/Helpers/GenerateCadenaAleatorio')
const UploadFileS3 = require('../../S3/UploadFileS3')

controller.MetActualizarStatusMasterClientes = async (usutoken, date, perid, file_update = null, req) => {
    
    try{

        const {
            req_plataforma,
            req_usucorreo
        } = req.body

        let perid_usu
        let fecid

        const baseUrl = req.protocol + '://' + req.get('host')

        if(!date){
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

            perid_usu = usu.perid
    
            const fec = await prisma.fecfechas.findFirst({
                where : {
                    fecmesabierto : true,
                },
                select : {
                    fecid : true
                }
            })
            
            fecid = fec.fecid
        }else{
            perid_usu = perid
            fecid = date
        }
        
        const espe = await prisma.espestadospendientes.findFirst({
            where : {
                AND : [
                    {
                        fecid : fecid
                    },
                    {
                        espbasedato : 'Master Clientes'
                    }
                ]
            }
        })

        if(espe){
            
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
                    perid                   : perid_usu,
                    espfechactualizacion    : new Date().toISOString(),
                    espdiaretraso           : esp_day_late,
                    updated_at              : new Date()
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

        if(file_update){

            let path_file
            const token_excel = crypto.randomBytes(30).toString('hex')
            const name_file = file_update.name.substring(0, file_update.name.lastIndexOf("."));
            const ext_file = file_update.name.substring(file_update.name.lastIndexOf(".") + 1);
            const archivoExcel = file_update.data

            const token_name = await GenerateCadenaAleatorio.MetGenerateCadenaAleatorio(10)

            if(process.env.ENTORNO == 'PREPRODUCTIVO'){
                path_file = 'hmlthanos/prueba/pe/tradicional/carga_archivos/Master de Clientes/'
            }else{
                path_file = 'hmlthanos/pe/tradicional/archivosgenerados/masterclientes/'
            }
            const ubicacion_s3 = path_file + name_file + '-' + token_name + '.' + ext_file

            await UploadFileS3.UploadFileS3(archivoExcel, ubicacion_s3)
    
            let usu = await prisma.usuusuarios.findFirst({
                where : {
                    usucorreo : req_usucorreo
                }
            })

            if(!usu){
                usu = await prisma.usuusuarios.findFirst({
                    where : {
                        usucorreo : 'usuario@gmail.com'
                    }
                })

                if(!usu){

                    let per = await prisma.perpersonas.findFirst({
                        where : {
                            pernombre : 'Usuario'
                        }
                    })

                    usu = await prisma.usuusuarios.create({
                        data : {
                            tpuid                   : 1,
                            perid                   : per.perid,
                            usuusuario              : 'usuario@gmail.com',
                            usucorreo               : 'usuario@gmail.com',
                            estid                   : 1,
                            usutoken                : crypto.randomBytes(30).toString('hex'),
                            usupaistodos            : false,
                            usupermisosespeciales   : false,
                            usucerrosesion          : false,
                            usucierreautomatico     : false
                        }
                    })
                }
            }

            const carn = await prisma.carcargasarchivos.create({
                data: {
                    usuid               : usu.usuid,
                    carnombre           : file_update.name,
                    cararchivo          : ubicacion_s3,
                    cartoken            : token_excel,
                    cartipo             : 'Master de Clientes',
                    carurl              : baseUrl + '/carga-archivos/generar-descarga?token='+token_excel,
                    carexito            : true,
                    carnotificaciones   : 'El archivo de Master de Clientes fue cargado exitosamente',
                    carplataforma       : req_plataforma ? req_plataforma : null
                }
            })
        }

        return true
    }catch(err){
        console.log(err)
        return false
    }
}

module.exports = controller