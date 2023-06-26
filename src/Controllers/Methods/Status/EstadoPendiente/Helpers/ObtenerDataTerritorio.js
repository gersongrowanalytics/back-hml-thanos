controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerDataTerritorio = async () => {
    let data_final_productos_so = []
    try{
        const get_master_producto_so = await prisma.master_productos_so.findMany({
            select: {
                id: true,
                homologado: true,
                s_mtd: true,
                m_cl_grow: true,
            },
            where: {
                homologado: false,
                m_cl_grow: {
                    not: null,
                }
            }
        })
        const idsm_cl_grow = get_master_producto_so.map(d => d.m_cl_grow)
        const filtrar_idsm_cl_grow = [...new Set(idsm_cl_grow)]

        const get_master_clientes_grow = await prisma.masterclientes_grow.findMany({
            where: {
                id: {
                    in: filtrar_idsm_cl_grow
                }
            },
            select: {
                id: true,
                territorio: true,
            },
        })

        let filter_master_clientes_grow = []
        get_master_clientes_grow.map(gmcg => {
            const find_mcg = filter_master_clientes_grow.find(fmcg => fmcg.territorio == gmcg.territorio)
            if(!find_mcg){
                filter_master_clientes_grow.push(gmcg)
            }
        })

        data_final_productos_so = filter_master_clientes_grow.map((fmcg, index) => {
            let totalNoHml = 0
            let totalmtd = 0
            get_master_clientes_grow.map(gmcg => {
                if(fmcg.territorio == gmcg.territorio){
                    let subtotalNoHml = 0
                    let subtotalmtd = 0
                    get_master_producto_so.map(gmp => {
                        if(gmp.m_cl_grow == gmcg.id){
                            subtotalNoHml = subtotalNoHml + 1
                            subtotalmtd = subtotalmtd + parseFloat(gmp.s_mtd)
                        }
                    })
                    totalNoHml = totalNoHml + subtotalNoHml
                    totalmtd = totalmtd + subtotalmtd
                }
            })
            totalmtd = parseFloat((totalmtd).toFixed(2))
            return {
                ...fmcg,
                key: index + 1,
                nohml: Intl.NumberFormat('en-IN').format(totalNoHml),
                mtd: Intl.NumberFormat('en-IN', {minimumFractionDigits: 2}).format(totalmtd),
            }
        })

        data_final_productos_so.sort((data, data_clone) => {
            const territorio = data.territorio.toLowerCase()
            const territorioClone = data_clone.territorio.toLowerCase()
            if(territorio < territorioClone){
                return -1;
            }
            if(territorio > territorioClone){
                return 1;
            }
            return 0
        })

        return data_final_productos_so

    }catch(error){
        console.log("MetObtenerDataTerritorio: ", error);
        return data_final_productos_so
    }
}

module.exports = controller