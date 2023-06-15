const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetObtenerTiposusuarios = async ( req, res ) => {

    try{

        const tpus = await prisma.tputiposusuarios.findMany({})

        tpus.forEach((tpu, index_tpu) => {
            tpus[index_tpu]['value'] = tpu.tpunombre
            tpus[index_tpu]['index'] = index_tpu + 1
        });

        res.status(200).json({
            response    : true,
            message     : 'Tipos de usuarios obtenidos con éxito',
            data        : tpus,
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los tipos de usuarios'
        })
    }
}

module.exports = controller