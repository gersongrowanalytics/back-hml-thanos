const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')

controller.MetDTManuales = async (req, res) => {

    const file          = req.files.carga_manual
    
    const workbook      = XLSX.read(file.data)
    const rows          = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval:""})
    const format_date   = "DD/MM/YYYY";

    try{
        
        const cod_products  = []
        const data          = [];

        let num_fila = 0
        let properties = Object.keys(rows[0])

        const { validFile, message_logs } = controller.ValidateCellsRequired(rows, properties)

        if(validFile){

            for await (const row of rows){

                // num_fila = num_fila + 1

                // let cod_prod_xlsx =  row[properties[10]] ? row[properties[10]].toString().trim() : null
                // let pro_so_id_excel = null
                // if(cod_prod_xlsx){

                //     let cod_prod_find = cod_products.find(pro => pro.cod_prod == cod_prod_xlsx)

                //     if(cod_prod_find){
                //         pro_so_id_excel = cod_prod_find.proid
                //     }else{
                //         let cod_prod = await prisma.master_productos_so.findMany({
                //             where : {
                //                 codigo_producto : cod_prod_xlsx
                //             },
                //             select : {
                //                 id      : true,
                //                 proid   : true,
                //                 desde   : true
                //             },
                //         })

                //         let row_data = await controller.GetLastDate(cod_prod)

                //         pro_so_id_excel = cod_prod ? row_data.proid : null

                //         cod_products.push(row_data)
                //     }
                // }

                const pk_venta_so = row[properties[0]].toString() + row[properties[10]].toString()

                data.push({
                    pro_so_id                       : null,
                    m_dt_id                         : null,
                    pk_venta_so                     : pk_venta_so,
                    codigo_distribuidor             : row[properties[0]] ?  row[properties[0]].toString() : '',
                    fecha                           : row[properties[1]] ?  row[properties[1]].toString() : '',
                    nro_factura                     : row[properties[2]] ?  row[properties[2]].toString() : '',
                    codigo_cliente                  : row[properties[3]] ?  row[properties[3]].toString() : '',
                    ruc                             : row[properties[4]] ?  row[properties[4]].toString() : '',
                    razon_social                    : row[properties[5]] ?  row[properties[5]].toString() : '',
                    mercado_categoria_tipo          : row[properties[6]] ?  row[properties[6]].toString() : '',
                    codigo_vendedor_distribuidor    : row[properties[7]] ?  row[properties[7]].toString() : '',
                    dni_vendedor_distribuidor       : row[properties[8]] ?  row[properties[8]].toString() : '',
                    nombre_vendedor_distribuidor    : row[properties[9]] ? row[properties[9]].toString() : '',
                    codigo_producto                 : row[properties[10]] ? row[properties[10]].toString() : '',
                    descripcion_producto            : row[properties[11]] ? row[properties[11]].toString() : '',
                    cantidad                        : row[properties[12]] ? row[properties[12]].toString() : '',
                    unidad_medida                   : row[properties[13]] ? row[properties[13]].toString() : '',
                    precio_unitario                 : row[properties[14]] === 0 ? '0' : row[properties[14]].toString(),
                    precio_total_sin_igv            : row[properties[15]] === 0 ? '0' : row[properties[15]].toString()
                })
            }

            await prisma.ventas_so.deleteMany({})
            await prisma.ventas_so.createMany({
                data
            })

            const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
            const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()

            console.log("rpta_obtener_products_so");
            console.log(rpta_obtener_products_so);
        }else{
            message_logs.forEach((message) => {
                // console.log(message)
            })
        }
        
        res.status(200).json({
            message : 'Datos cargas exitosamente',
        })

    }catch(error){
        console.log("error catch:")
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de cargar las dt manuales',
            devmsg  : error
        })
    }
}

controller.ValidateCellsRequired = (rows, properties) => {

    let columns_required = [0, 1, 3, 7, 10, 11, 12, 13, 14, 15]
    let message_logs = []
    rows.forEach((row, index_row) => {

        columns_required.forEach((col) => {
            if(col == 15 || col == 14 || col == 12){
                if(row[properties[col]] === ''){
                    message_logs.push(`El campo ${properties[col]} tiene un valor no valido en la fila ${index_row+2} => ${row[properties[col]]}`)
                }    
            }else{
                if(row[properties[col]] == ''){
                    message_logs.push(`El campo ${properties[col]} tiene un valor no valido en la fila ${index_row+2} => ${row[properties[col]]}`)
                }    
            }
        })
    });

    return {
        validFile       : message_logs.length > 0 ? false : true,
        message_logs    : message_logs 
    }
}

controller.GetLastDate = async ( data ) => {
    
    if(data){

        // let date

        data.forEach(element => {
            // if(moment(dateString, format))
        });
    
        return {
            cod_prod    : cod_prod_xlsx,
            proid       : pro_so_id_excel
        }
    }else{
        return {
            cod_prod    : null,
            proid       : null
        }
    }
}

module.exports = controller