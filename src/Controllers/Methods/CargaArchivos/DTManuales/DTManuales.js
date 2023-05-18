const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const ObtenerProductosSO = require('../Helpers/ObtenerProductosSO')
const AsignarDTVentasSO = require('../Helpers/AsignarDTVentasSO')

controller.MetDTManuales = async (req, res) => {

    const file          = req.files.carga_manual
    
    if (!file) {
        res.status(500)
        return res.json({
            message : 'No se ha subido ningún archivo'
        })
    }

    const workbook = XLSX.read(file.data)
    if(!workbook.Sheets['data']){
        res.status(500)
        return res.json({
            message : 'Lo sentimos no se encontro la hoja con nombre data'
        })
    }

    const rows        = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval:""})
    const format_date = "DD/MM/YYYY";

    try{
        
        const cod_products  = []
        const data          = [];

        let num_fila = 0
        let properties = Object.keys(rows[0])

        const { validFile, message_logs } = controller.ValidateCellsRequired(rows, properties)


        // ******************
        // VARIABLES DE VALIDACIONES
        // ******************

        let add_dt_manuales = true
        let messages_error_cod_dt = false
        let messages_error_fecha = false
        let messages_error_cod_cliente = false
        let messages_error_cod_vendedor = false
        let messages_error_cod_producto = false
        let messages_error_desc_producto = false
        let messages_error_cantidad = false
        let messages_error_und_medida = false
        let messages_error_precio_unitario = false
        let messages_error_precio_total = false

        let messages_error_rucs = false
        let messages_error_dnis = false
        let messages_error_cantidad_number = false
        let messages_error_precio_unitario_number = false
        let messages_error_precio_total_number = false

        let messages_error = []

        // ******************
        // DATA PARA BORRAR
        // ******************

        let borrar_data = []

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

                if(!row[properties[0]]){
                    add_dt_manuales = false
                    if(!messages_error_cod_dt){
                        messages_error_cod_dt = true
                        messages_error.push("Lo sentimos, algunos códigos de distribuidor se encuentran vacios")
                    }
                }else{

                    const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[1]]);

                    const fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
                    const fecha_capturada = fechaJavaScript.y.toString()+"-"+fecha_mes.toString()

                    let existe_cod = false
                    borrar_data.map((dat) => {
                        if(dat.cod_dt == row[properties[0]] && dat.fecha == fecha_capturada ){
                            existe_cod = true
                        }
                    })

                    if(existe_cod == false){
                        borrar_data.push({
                            cod_dt : row[properties[0]],
                            fecha : fecha_capturada
                        })
                    }
                }

                let fecha_capturada
                if(!row[properties[1]]){
                    add_dt_manuales = false
                    if(!messages_error_fecha){
                        messages_error_fecha = true
                        messages_error.push("Lo sentimos, algunas fechas se encuentran vacios")
                    }
                }else{
                    const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[1]]);

                    const fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
                    fecha_capturada = fechaJavaScript.y.toString()+"-"+fecha_mes.toString()

                    let existe_fec = false
                    borrar_data.map((dat) => {
                        if(dat.cod_dt == row[properties[0]] && dat.fecha == fecha_capturada){
                            existe_fec = true
                        }
                    })

                    if(existe_fec == false){
                        borrar_data.push({
                            cod_dt : row[properties[0]],
                            fecha : fecha_capturada
                        })
                    }
                }

                if(!row[properties[3]]){
                    add_dt_manuales = false
                    if(!messages_error_cod_cliente){
                        messages_error_cod_cliente = true
                        messages_error.push("Lo sentimos, algunos códigos de cliente se encuentran vacios")
                    }
                }

                if(!row[properties[7]]){
                    add_dt_manuales = false
                    if(!messages_error_cod_vendedor){
                        messages_error_cod_vendedor = true
                        messages_error.push("Lo sentimos, algunos códigos de vendedor se encuentran vacios")
                    }
                }

                if(!row[properties[10]]){
                    add_dt_manuales = false
                    if(!messages_error_cod_producto){
                        messages_error_cod_producto = true
                        messages_error.push("Lo sentimos, algunos códigos de producto se encuentran vacios")
                    }
                }

                if(!row[properties[11]]){
                    add_dt_manuales = false
                    if(!messages_error_desc_producto){
                        messages_error_desc_producto = true
                        messages_error.push("Lo sentimos, algunas descripciones de producto se encuentran vacios")
                    }
                }

                if(!row[properties[12]]){
                    add_dt_manuales = false
                    if(!messages_error_cantidad){
                        messages_error_cantidad = true
                        messages_error.push("Lo sentimos, algunas cantidades se encuentran vacios")
                    }
                }

                if(!row[properties[13]]){
                    add_dt_manuales = false
                    if(!messages_error_und_medida){
                        messages_error_und_medida = true
                        messages_error.push("Lo sentimos, algunas und de medida se encuentran vacios")
                    }
                }
                
                // if(!row[properties[14]]){
                //     add_dt_manuales = false
                //     if(!messages_error_precio_unitario){
                //         messages_error_precio_unitario = true
                //         messages_error.push("Lo sentimos, algunos precios unitario se encuentran vacios")
                //     }
                // }

                // if(!row[properties[15]]){
                //     add_dt_manuales = false
                //     if(!messages_error_precio_total){
                //         messages_error_precio_total = true
                //         messages_error.push("Lo sentimos, algunos precios totales se encuentran vacios")
                //     }
                // }

                // VALIDACIONES DE COLUMNAS

                if(row[properties[4]]){
                    if(row[properties[4]].toString().length != 11){
                        add_dt_manuales = false
                        if(!messages_error_rucs){
                            messages_error_rucs = true
                            messages_error.push("Lo sentimos, algunos de los ruc no cumplen con los requisitos de 11 digitos: ")
                        }
                    }
                }
                
                if(row[properties[8]]){
                    if(row[properties[8]].toString().length != 8){
                        add_dt_manuales = false
                        if(!messages_error_dnis){
                            messages_error_dnis = true
                            messages_error.push("Lo sentimos, algunos de los dni no cumplen con los requisitos de 8 digitos")
                        }
                    }
                }

                if(row[properties[12]]){

                    const row_cantidad = row[properties[12]]

                    if( typeof row_cantidad !== 'number' ){
                        add_dt_manuales = false
                        if(!messages_error_cantidad_number){
                            messages_error_cantidad_number = true
                            messages_error.push("Lo sentimos, algunas cantidades no son numericas")
                        }
                    }
                }

                if(row[properties[14]]){

                    const row_precio_unitario = row[properties[14]]

                    if( typeof row_precio_unitario !== 'number' ){
                        add_dt_manuales = false
                        if(!messages_error_precio_unitario_number){
                            messages_error_precio_unitario_number = true
                            messages_error.push("Lo sentimos, algunos precios unitarios no son numericos")
                        }
                    }
                }

                if(row[properties[15]]){

                    const row_precio_total = row[properties[15]]

                    if( typeof row_precio_total !== 'number' ){
                        add_dt_manuales = false
                        if(!messages_error_precio_total_number){
                            messages_error_precio_total_number = true
                            messages_error.push("Lo sentimos, algunos precios totales no son numericos")
                        }
                    }
                }

                const pk_venta_so = row[properties[0]].toString() + row[properties[10]].toString()

                data.push({
                    pro_so_id                       : null,
                    m_dt_id                         : null,
                    pk_venta_so                     : pk_venta_so,
                    codigo_distribuidor             : row[properties[0]] ?  row[properties[0]].toString() : '',
                    fecha                           : fecha_capturada ?  fecha_capturada.toString() : '',
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

            if(!add_dt_manuales){
                res.status(500)
                return res.json({
                    message : 'Lo sentimos se encontraron algunas observaciones',
                    messages_error : messages_error
                })
            }            
            
            for await (const dat of borrar_data ){

                await prisma.ventas_so.deleteMany({
                    where: {
                        fecha: {
                            startsWith: dat.fecha
                        },
                        codigo_distribuidor: dat.cod_dt
                    }
                })
            }

            await prisma.ventas_so.createMany({
                data
            })

            // console.log(borrar_data);
            // console.log(borrar_fechas);

            const rpta_asignar_dt_ventas_so = await AsignarDTVentasSO.MetAsignarDTVentasSO()
            const rpta_obtener_products_so = await ObtenerProductosSO.MetObtenerProductosSO()

            
        }else{
            message_logs.forEach((message) => {
                // console.log(message)
            })
        }
        
        return res.status(200).json({
            message : 'Las ventas manuales fueron cargadas correctamente',
        })

    }catch(error){
        console.log(error);
        res.status(500)
        return res.json({
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