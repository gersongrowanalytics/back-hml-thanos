const controller = {}
const RegistrarHomologacionController = require('../RegistrarHomologacion/RegistrarHomologacion')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

controller.MetHomologadoAutomatico = async ( req, res ) => {
    
    let {
        data
    } = req.body

    try{

        if(!data){
            data = await prisma.master_productos_so.findMany({
                where : {
                    homologado : true
                }
            })
        }

        const condicion_seleccionar = [ 'babysec', 'ladysoft', 'navidad', 'mundial', 'looney', 'diseño', 'cumple', 'torta', 'lineas', 'circulos', 'halloween', 'fiestas', 'patrias','verano','practica','ldsft','lady soft', 'ultrasec', 'hipoal', 'dove', 'rexona', 'palos', 'dobby','cotidian','ladisoft' ]

        let productos_so_ids = []
        data.map(dat => {
            condicion_seleccionar.map( sel => {
                if(dat.descripcion_producto.toLowerCase().includes(sel.toLowerCase())){
                    productos_so_ids.push(dat.id)
                    console.log(dat.id)
                }
            })
        })

        req.body.producto_so_id         = 0
        req.body.producto_hml_id        = 1
        req.body.req_envio_otros        = true
        req.body.productos_so_ids       = productos_so_ids
        req.body.producto_uni_medida    = null

        await RegistrarHomologacionController.MetRegistrarHomologacion(req, res)

        return true

    }catch(err){
        console.log(err)
        return false
    }
}

module.exports = controller