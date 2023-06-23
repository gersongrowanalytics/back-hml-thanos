const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const RegisterAudits = require('../../../Audits/CreateAudits/RegisterAudits')

controller.MetEliminarCargaArchivo = async (req, res) => {

    const { usutoken } = req.header

    const {
        req_carid
    } = req.body;

    let message   = 'Se ha eliminado el archivo correctamente'
    let response  = true
    let devmsg    = ''
    let audpk     = []
    let jsonsalida
    let jsonentrada = {
        req_carid
    }

    try{
        
        await prisma.carcargasarchivos.delete({
            where : {
                carid : req_carid
            }
        })

        audpk.push('carcargasarchivos-'+req_carid)
        jsonsalida = { message, response }

        await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'CARGA ARCHIVOS', 'ELIMINAR', '/admin/carga-archivos', null, audpk)

    }catch(error){
        console.log(error)
        message     = 'Lo sentimos hubo un error al momento de eliminar el registro de carga de archivo'
        devmsg      = error   
        response    = false
        jsonsalida  = { message, devmsg, response }

        await RegisterAudits.MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'CARGA ARCHIVOS', 'ELIMINAR', '/admin/carga-archivos',  JSON.stringify(devmsg.toString()), null)

        res.status(500)
        res.json({
            message     : 'Lo sentimos hubo un error al momento de eliminar el registro de carga de archivo',
            devmsg      : error,
            response    : false
        })
    }finally{

        await prisma.$disconnect();
        res.status(200)
        res.json({
            message     : 'Se ha eliminado el archivo correctamente',
            response    : true
        })
    }    
}


module.exports = controller