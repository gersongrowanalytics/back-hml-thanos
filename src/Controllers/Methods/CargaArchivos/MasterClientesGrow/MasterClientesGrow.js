const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto')
const ActualizarStatusMasterClientesController = require('../../Status/EstadoPendiente/ActualizarStatusMasterClientes')

controller.MetMasterClientesGrow = async ( req, res, data ) => {

    const {
        usutoken
    } = req.headers

    const {
        req_plataforma,
        req_usucorreo
    } = req.body
    
    try{

        let usu

        if(usutoken){
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usutoken : usutoken
                }
            })
        }else{
            usu = await prisma.usuusuarios.findFirst({
                where : {
                    usucorreo : req_usucorreo
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

        if(usu.usuid == 1){
            await controller.MetInsertMasterClientesGrow(data)
        }

        if(req_plataforma != "Subsidios"){
            req.body.req_usucorreo = usu.usucorreo
            req.body.req_plataforma = null
        }
        await ActualizarStatusMasterClientesController.MetActualizarStatusMasterClientes(usutoken, null, usu.perid, req.files.maestra_cliente, req)

        res.status(200).json({
            respuesta    : true,
            message     : 'Se cargó master clientes grow correctamente',
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            respuesta    : false,
            message     : 'Ha ocurrido un error al cargar master clientes grow'
        })

    }
}

controller.MetInsertMasterClientesGrow = async (data) => {

    try{

        const mcgs = await prisma.masterclientes_grow.findMany({
            select : {
                id                  : true,
                codigo_destinatario : true,
                destinatario        : true
            }
        })

        const create_rows   = []
        const update_rows   = []

        const m_cli_grow_updated = []
        const m_cli_grow_created = []

        data.forEach(cli => {

            const exist_cli_grow = create_rows.findIndex(cre => cre.codigo_destinatario == cli.codigo_destinatario)
            if(exist_cli_grow == -1){
                cli_grow = mcgs.find((mcg => mcg.codigo_destinatario == cli.codigo_destinatario))
                if(!cli_grow){
                    create_rows.push(cli)
                    m_cli_grow_created.push({codigo_destinatario : cli.codigo_destinatario, destinatario : cli.destinatario})
                }else{
                    update_rows.push({id  : cli_grow.id, data : cli})
                    m_cli_grow_updated.push({codigo_destinatario : cli_grow.codigo_destinatario, destinatario : cli_grow.destinatario})
                }
            }
        });

        await prisma.masterclientes_grow.createMany({
            data : create_rows
        })

        if(update_rows.length > 0){
            for await(const upd of update_rows ){
                await prisma.masterclientes_grow.update({
                    where : {
                        id : upd.id
                    },
                    data : upd.data
                })
            }
        }

        return true

    }catch(err){
        console.log(err)
        return false
    }
}

module.exports = controller