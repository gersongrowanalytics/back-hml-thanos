const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterClientesGrow = async ( req, res, data ) => {
    
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

        const espo = await prisma.espestadospendientes.findFirst({
            where : {
                espbasedato : 'Master Clientes'
            },
            select : {
                espid : true
            },
            orderBy : {
                fecid : 'desc'
            }
        })

        const espu = await prisma.espestadospendientes.update({
            where : {
                espid : espo.espid
            },
            data : {
                espfechactualizacion : new Date(),
                updated_at : new Date()
            }
        })

        res.status(200).json({
            response    : true,
            message     : 'Se cargó master clientes grow correctamente',
            created     : create_rows,
            updated     : m_cli_grow_updated
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master clientes grow'
        })
    }
}

module.exports = controller