const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx')

controller.MetListadoHomologaciones = async (req, res, data) => {

    try{

        res.status(200).json({
            respuesta   : false,
            message     : 'Se ha cargado la data correctamente',
            data
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de guardar los registros',
            devmsg  : error
        })
    }
}

module.exports = controller