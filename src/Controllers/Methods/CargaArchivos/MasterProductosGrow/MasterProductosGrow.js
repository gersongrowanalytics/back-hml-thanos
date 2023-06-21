const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterProductosGrow = async ( req, res, ex_data ) => {

    try{

        let codigos_actualizados = []
        let nuevos_codigos = []

        for await(const data of ex_data ){
            const m_pro_grow = await prisma.master_productos_grow.findFirst({
                where : {
                    codigo_material : data.codigo_material
                },
                select : {
                    id : true
                }
            })

            if(m_pro_grow){

                await prisma.master_productos_grow.update({
                    where: {
                        id : m_pro_grow.id
                    },
                    data
                })

                codigos_actualizados.push({
                    "codigo_material" : data.codigo_material,
                    "material_softys" : data.material_softys
                })

            }else{
                await prisma.master_productos_grow.create({
                    data
                })

                nuevos_codigos.push({
                    "codigo_material" : data.codigo_material,
                    "material_softys" : data.material_softys
                })
            }
        }

        return res.status(200).json({
            response    : true,
            message     : 'Se cargó master productos grow correctamente',
            nuevos_cod  : nuevos_codigos,
            codigo_act  : codigos_actualizados
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master productos grow'
        })
    }
}

module.exports = controller