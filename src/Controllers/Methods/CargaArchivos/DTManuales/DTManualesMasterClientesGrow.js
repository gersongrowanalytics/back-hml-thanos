const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetDTManualesMasterClientesGrow = async (dts, mcl_grow_local, mcl_nogrow_local) => {
    
    try{
        
        let id_mcl_grow = null
        const exist_dts     = mcl_grow_local.findIndex(dt => dt.dts == dts)
        const no_exist_dts  = mcl_nogrow_local.findIndex(dt => dt == dts)

        if(exist_dts == -1 && no_exist_dts == -1){
            const mcl_grow = await prisma.masterclientes_grow.findFirst({
                where : {
                    codigo_destinatario : dts
                },
                select : {
                    id : true
                }
            })
            
            if(mcl_grow){
                mcl_grow_local.push({dts: dts, id : mcl_grow.id})
                id_mcl_grow = mcl_grow.id
            }else{
                mcl_nogrow_local.push(dts)
            }
        }else{
            if(exist_dts != -1){
                let find_dts = mcl_grow_local.find((mcl) => mcl.dts == dts)
                id_mcl_grow = find_dts.id
            }
        }

        return id_mcl_grow

    }catch(err){
        console.log(err)
        return err
    }
}

module.exports = controller