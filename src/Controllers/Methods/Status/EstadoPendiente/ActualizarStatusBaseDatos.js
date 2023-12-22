const controller = {}
const StatusArchivoPlano = require('../EstadoPendiente/ActualizarStatusArchivoPlano')
const StatusMasterClientes = require('../EstadoPendiente/ActualizarStatusMasterClientes')
const StatusMasterPrecios = require('../EstadoPendiente/ActualizarStatusMasterPrecios')
const StatusMasterProductos = require('../EstadoPendiente/ActualizarStatusMasterProductos')
const StatusSellinThanos = require('../EstadoPendiente/ActualizarStatusSellinThanos')
const ActualizarStatusHomologacion = require('../EstadoPendiente/ActualizarStatusHomologacion')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

controller.MetActualizarStatusBaseDatos = async ( req, res ) => {

    const {
        req_date,
        req_usucorreo,
        req_espbasedato,
        req_controller
    } = req.body

    try{

        const file_update = req.files.req_file_upload
        let perid
        let response_status = false
        let fecid
        let msg_dev = ''

        const date = moment(req_date)
        const fec = await prisma.fecfechas.findFirst({
            select: {
                fecid: true,
            },
            where : {
                fecanionumero   : date.year(),
                fecmesnumero    : date.month() + 1
            }
        })

        if(fec){

            fecid = fec.fecid

            const usu = await prisma.usuusuarios.findFirst({
                where : {
                    usucorreo : req_usucorreo,
                },
                select : {
                    usuid : true,
                    perpersonas : true
                }
            })
    
            if(!usu){
                const per = await prisma.perpersonas.findFirst({
                    where : {
                        pernombre : 'Usuario',
                        perapellidomaterno : 'Usuario'
                    }
                })
                if(!per){
                    const per = await prisma.perpersonas.create({
                        data : {
                            pertipodocumento : 'DNI',
                            pernumerodocumentoidentidad : '000000',
                            pernombrecompleto : 'Usuario',
                            pernombre : 'Usuario',
                            perapellidomaterno : 'Usuario',
                            perapellidopaterno : 'Usuario'
                        }
                    })
                    perid = per.perid
                }else{
                    perid = per.perid
                }
            }else{
                perid = usu.perpersonas.perid
            }

            switch (req_espbasedato) {
                case 'Archivo Plano SO':
                    response_status =  await StatusArchivoPlano.MetActualizarStatusArchivoPlano(null, fecid, perid)
                    break;
                case 'Master de Clientes':
                    response_status =  await StatusMasterClientes.MetActualizarStatusMasterClientes(null, fecid, perid, file_update, req)
                    break;
                case 'Master de Precios':
                    response_status =  await StatusMasterPrecios.MetActualizarStatusMasterPrecios(null, fecid, perid)
                    break;
                case 'Master de Producto':
                    response_status =  await StatusMasterProductos.MetActualizarStatusMasterProductos(null, fecid, perid, file_update, req)
                    break;
                case 'Sell In Thanos':
                    response_status =  await StatusSellinThanos.MetActualizarStatusSellinThanos(null, fecid, perid, file_update, req)
                    break;
                case 'Homologaciones':
                    response_status =  await ActualizarStatusHomologacion.MetActualizarStatusHomologacion(req, res, fecid, perid)
                    break;
                default:
                    response_status = false
                    msg_dev = 'No existe el tipo de base de datos'
            }

        }else{
            msg_dev = 'No existe un histórico para la fecha seleccionada'
        }

        if(response_status){
            if(req_controller){
                return true
            }else{
                res.status(200).json({
                    response    : true,
                    message     : 'Status actualizado con éxito',
                })
            }
        }else{
            if(req_controller){
                return false
            }else{
                res.status(500).json({
                    response    : false,
                    message     : 'Ha ocurrido un error al actualizar el status',
                    msg_dev
                })
            }
        }

    }catch(err){
        console.log(err)
        if(req_controller){
            return false
        }else{
            return res.status(500).json({
                response    : false,
                message     : 'Ha ocurrido un error al actualizar el status',
                msg_dev     : err
            })
        }
    }
}

module.exports = controller