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
                s_ytd: true,
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
                zona: true,
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

        data_final_productos_so = filter_master_clientes_grow.map((fmcg) => {
            let totalNoHml = 0
            let totalytd = 0
            get_master_clientes_grow.map(gmcg => {
                if(fmcg.territorio == gmcg.territorio){
                    let subtotalNoHml = 0
                    let subtotalytd = 0
                    get_master_producto_so.map(gmp => {
                        if(gmp.m_cl_grow == gmcg.id){
                            subtotalNoHml = subtotalNoHml + 1
                            subtotalytd = subtotalytd + parseFloat(gmp.s_ytd)
                        }
                    })
                    totalNoHml = totalNoHml + subtotalNoHml
                    totalytd = totalytd + subtotalytd
                }
            })
            totalytd = parseFloat((totalytd).toFixed(2))
            return {
                ...fmcg,
                nohml: Intl.NumberFormat('en-IN').format(totalNoHml),
                ytd: Intl.NumberFormat('en-US', {style: 'decimal', useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(totalytd),
            }
        })

        // data_final_productos_so.sort((data, data_clone) => {
        //     const territorio = data.territorio.toLowerCase()
        //     const territorioClone = data_clone.territorio.toLowerCase()
        //     if(territorio < territorioClone){
        //         return -1;
        //     }
        //     if(territorio > territorioClone){
        //         return 1;
        //     }
        //     return 0
        // })

        data_final_productos_so.sort((data, data_clone) => {
            const valueA = Number(data.ytd.replace(/,/g, ''))
            const valueB = Number(data_clone.ytd.replace(/,/g, ''))

            return valueB - valueA
        })

        data_final_productos_so.map((dfps, index) => {
            data_final_productos_so[index]["key"] = index + 1
        })

        return data_final_productos_so

    }catch(error){
        console.log("MetObtenerDataTerritorio: ", error);
        return data_final_productos_so
    }
}

module.exports = controller