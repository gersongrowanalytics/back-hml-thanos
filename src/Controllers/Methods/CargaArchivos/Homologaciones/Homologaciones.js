const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx')

// ***********************************
// CARGAR LA DATA DE HOMOLOGACIONES
// ***********************************

controller.MetHomologaciones = async (req, res, ex_data) => {

    try{

        let data = []

        let arr_cli_grow = []
        let arr_pro_grow = []
        let arr_pro_hml = []


        let cli_grow = {}
        let pro_grow = {}

        let obs_cli_grow = []
        let obs_pro_grow = []
        let obs_pro_hml = []

        for await(const dat of ex_data){
            
            dat.cod_grow = dat.cod_grow.toString()
            dat.cod_producto_maestro = dat.cod_producto_maestro.toString()


            // ************************************************************************************
            // VALIDAR SI EXISTE EL CODIGO DE CLIENTE GROW
            // ************************************************************************************
            cli_grow = arr_cli_grow.find(cli_grow => cli_grow.codigo_destinatario == dat.cod_grow)

            if(!cli_grow){
                cli_grow = await prisma.masterclientes_grow.findFirst({
                    where : {
                        codigo_destinatario : dat.cod_grow
                    }
                })

                if(!cli_grow){
                    
                    if(!obs_cli_grow.find(ob_cli_grow => ob_cli_grow == dat.cod_grow)){
                        obs_cli_grow.push(dat.cod_grow)
                    }
                    
                }else{
                    arr_cli_grow.push(cli_grow)
                }
            }

            // ************************************************************************************
            // --- FIN DE VALIDAR SI EXISTE EL CODIGO DE CLIENTE GROW ---
            // ************************************************************************************

            // ************************************************************************************
            // VALIDAR SI EXISTE EL CODIGO DE PRODUCTO GROW
            // ************************************************************************************
            pro_grow = arr_pro_grow.find(pro_grow => pro_grow.codigo_material == dat.cod_producto_maestro)

            if(!pro_grow){
                pro_grow = await prisma.master_productos_grow.findFirst({
                    where: {
                        codigo_material : dat.cod_producto_maestro
                    }
                })

                if(!pro_grow){

                    if(!obs_pro_grow.find(ob_pro_grow => ob_pro_grow == dat.cod_producto_maestro)){
                        obs_pro_grow.push(dat.cod_producto_maestro)
                    }

                }else{
                    arr_pro_grow.push(pro_grow)
                }
            }

            // ************************************************************************************
            // --- FIN DE VALIDAR SI EXISTE EL CODIGO DE PRODUCTO GROW ---
            // ************************************************************************************



            if(cli_grow && pro_grow){

                const n_pk_venta_so = dat.cod_distribuidor + dat.cod_producto_distribuidor
                const n_pk_extractor_venta_so = n_pk_venta_so + "NA" + "NA"
                const n_pk_venta_so_hml = n_pk_venta_so + pro_grow.codigo_material

                
                if(!arr_pro_hml.find(pro_hml => pro_hml == n_pk_venta_so_hml)){
                    arr_pro_hml.push(n_pk_venta_so_hml)


                    data.push({
                        m_pro_grow : pro_grow.id,
                        m_cl_grow : cli_grow.id,
                        codigo_producto : dat.cod_producto_distribuidor,
                        descripcion_producto : dat.nom_producto_distribuidor,
                        desde: dat.fecha_inicial,
                        pk_venta_so : n_pk_venta_so,
                        pk_extractor_venta_so : n_pk_extractor_venta_so,
                        pk_venta_so_hml : n_pk_venta_so_hml
                    })

                    // await prisma.master_productos_so.createMany({
                    //     data: {
                    //         m_pro_grow : pro_grow.id,
                    //         m_cl_grow : cli_grow.id,
                    //         codigo_producto : dat.cod_producto_distribuidor,
                    //         descripcion_producto : dat.nom_producto_distribuidor,
                    //         desde: dat.fecha_inicial,
                    //         pk_venta_so : n_pk_venta_so,
                    //         pk_extractor_venta_so : n_pk_extractor_venta_so,
                    //         pk_venta_so_hml : n_pk_venta_so_hml
                    //     }
                    // })
                }else{
                    obs_pro_hml.push(n_pk_venta_so_hml)
                }

            }

        }

        await prisma.master_productos_so.createMany({
            data
        })

        return res.status(200).json({
            "respuesta"   : true,
            "message"     : 'Se ha cargado la data correctamente',
            "obs_cli_grow" : obs_cli_grow,
            "obs_pro_grow" : obs_pro_grow,
            "obs_pro_hml" : obs_pro_hml,
            // "arr_cli_grow" : arr_cli_grow,
            // ex_data
        })

    }catch(error){
        console.log(error)
        res.status(500)
        return res.json({
            message : 'Lo sentimos hubo un error al momento de guardar los registros',
            devmsg  : error
        })
    }
}

module.exports = controller