const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


controller.MetActualizarSacAreasEstados = async (areid, count_no_hml) => {

    await prisma.areareasestados.update({
        where :{
            areid : areid
        },
        data : {
            areporcentaje : count_no_hml == 0 ? '100' : '0',
        }
    })

}
controller.MetActualizarSacEstadoPendiente = async (espeid, count_no_hml, last_prod_hml, day_late) => {

    if(last_prod_hml.usuusuarios){

        const usuHML = await prisma.usuusuarios.findFirst({
            where : {
                perid : last_prod_hml.usuusuarios?.perpersonas.perid
            },
            select : {
                usucorreo : true
            }
        })

        if(usuHML.usucorreo.toUpperCase().includes("GROW") == false && (usuHML.usucorreo.toUpperCase().includes("ADMINISTRADOR")) == false){
            await prisma.espestadospendientes.update({
                where :{
                    espid : espeid
                },
                data : {
                    perid                   : last_prod_hml ? last_prod_hml.usuusuarios?.perpersonas.perid : null,
                    espfechactualizacion    : last_prod_hml ? new Date(last_prod_hml.updated_at) : null,
                    espdiaretraso : count_no_hml == 0 ? '0' : day_late
                }
            })
        }
    }
}

module.exports = controller