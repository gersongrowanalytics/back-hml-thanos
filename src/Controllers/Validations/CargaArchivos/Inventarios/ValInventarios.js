const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx')
const InventariosController = require('../../../Methods/CargaArchivos/Inventarios/Inventarios')

controller.ValIntenvarios = async (req, res) => {

    const file          = req.files.carga_inventarios

    try{

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }

        const { messages_error, add_inventories, borrar_data, data } = await controller.ValCellsFile(workbook)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg));

        if(!add_inventories){
            res.status(500)
            return res.json({
                response        : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error,
                messages_error  : messages

            })
        }

        InventariosController.MetInventarios(req, res, data, borrar_data)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de leer el archivo',
            devmsg  : error
        })
    }
}

controller.ValExistsData = async (file) => {

    let exists_data   = true
    let message       = ''
    let status        = 200

    if (!file) {
        exists_data = false
        message     = 'No se ha subido ningún archivo'
        status      = 500
    }

    const workbook = XLSX.read(file.data)
    if(!workbook.Sheets['data']){
        exists_data = false
        message     = 'Lo sentimos no se encontró la hoja con nombre "data"'
        status      = 500
    }

    return { exists_data, message, status, workbook: workbook ? workbook : null }
}

controller.ValCellsFile = async (workbook) => {

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval:""})
    let properties  = Object.keys(rows[0])

    const cod_dts = await prisma.master_distribuidoras.findMany({
        select : {
            codigo_dt : true
        }
    })

    let add_inventories = true
    let messages_error  = []
    let borrar_data     = []
    const data          = []
    const verify_cells  = [ 10, 11, 13 ]

    const columns_name = [
        { value   : 0, name    : 'CodigoDistribuidor' },
        { value   : 1, name    : 'Fecha' },
        { value   : 2, name    : 'NroFactura' },
        { value   : 3, name    : 'CodigoCliente' },
        { value   : 4, name    : 'RUC' },
        { value   : 5, name    : 'RazonSocial' },
        { value   : 6, name    : 'Mercado/Categoria/Tipo' },
        { value   : 7, name    : 'CodigoVendedorDistribuidor' },
        { value   : 8, name    : 'DNIVendedorDistribuidor' },
        { value   : 9, name    : 'NombreVendedorDistribuidor' },
        { value   : 10, name    : 'CodigoProducto' },
        { value   : 11, name    : 'DescripcionProducto' },
        { value   : 12, name    : 'Cantidad' },
        { value   : 13, name    : 'UnidadDeMedida' },
        { value   : 14, name    : 'PrecioUnitario' },
        { value   : 15, name    : 'PrecioTotalSinIGV' },
    ]

    let num_row = 1
    for await (const row of rows){

        let fecha_capturada
        let fecha_dia
        let fecha_mes
        let fecha_anio

        if(!row[properties[0]]){
            add_inventories = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[0]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[0]['name'], num_row, 'empty')
        }else{
            

            if(cod_dts.findIndex(dts => dts.codigo_dt == row[properties[0]]) == -1){
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[0]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[0]['name'], num_row, 'distributor not found', row[properties[0]])
            }else{


                if(typeof(row[properties[1]]) == 'string'){
                    const fechaJavaScript = row[properties[1]].split('-')
                    fecha_mes     = fechaJavaScript[1]
                    fecha_anio    = fechaJavaScript[0]
                }else{
                    const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[1]]);
                    fecha_anio = fechaJavaScript.y.toString()
                    fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();

                }
                const fecha_capturada = fecha_anio+"-"+fecha_mes
    
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
        }
        if(!row[properties[1]]){
            add_inventories = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[1]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[1]['name'], num_row, 'empty')
        }else{

            if(typeof(row[properties[1]]) == 'string'){
                const fechaJavaScript = row[properties[1]].split('-')
                fecha_dia     = fechaJavaScript[2]
                fecha_mes     = fechaJavaScript[1]
                fecha_anio    = fechaJavaScript[0]

            }else{
                const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[1]]);
                fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
                fecha_anio = fechaJavaScript.y.toString()
                fecha_dia = fechaJavaScript.d.toString()
            }
            fecha_capturada = fecha_anio + "-" + fecha_mes.toString()
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
        
        verify_cells.forEach(function(cell){
            if(!row[properties[cell]]){
                add_inventories = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[cell]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[cell]['name'], num_row, 'empty')
            }
        })

        if(row[properties[14]] === ''){
            add_inventories = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[14]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[14]['name'], num_row, 'empty')
        }else{

            const row_precio_unitario = row[properties[12]]

            if( typeof row_precio_unitario !== 'number' ){
                add_inventories = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[14]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[14]['name'], num_row, 'not number')
            }
        }


        if(row[properties[12]] === ''){
            add_inventories = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[12]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[12]['name'], num_row, 'empty')
        }else{

            const row_cantidad = row[properties[12]]

            if( typeof row_cantidad !== 'number' ){
                add_inventories = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[12]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[12]['name'], num_row, 'not number')
            }
        }

        if(row[properties[15]] === ''){
            add_inventories = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[15]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[15]['name'], num_row, 'empty')
        }else{

            const row_precio_total = row[properties[15]]

            if( typeof row_precio_total !== 'number' ){
                add_inventories = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[15]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[15]['name'], num_row, 'not number')
            }else{
                const row_cantidad = row[properties[12]]
                const row_precio = row[properties[14]]
                const precioTotal = Number(row_cantidad) * Number(row_precio)
                const dif_totales = precioTotal - row_precio_total
                if(dif_totales >= 1 || dif_totales <= -1){
                    add_inventories = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[15]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[15]['name'], num_row, 'inconsistent data')
                }
            }
        }

        let cod_unidad_medida   = row[properties[13]].toString().substring(0,3)
        let unidad_medida       = row[properties[13]].toString()
        let precio_unitario     = row[properties[15]]/row[properties[12]]

        const pk_venta_so           = row[properties[0]].toString() + row[properties[10]].toString().trim()
        const pk_extractor_venta_so = row[properties[0]].toString() + row[properties[10]].toString().trim() + cod_unidad_medida + unidad_medida


        data.push({
            pro_so_id                       : null,
            m_dt_id                         : null,
            pk_venta_so                     : pk_venta_so,
            pk_extractor_venta_so           : pk_extractor_venta_so,
            codigo_distribuidor             : row[properties[0]]    ?  row[properties[0]].toString() : '',
            fecha                           : fecha_capturada       ?  fecha_capturada.toString() : '',
            codigo_producto                 : row[properties[10]]   ? row[properties[10]].toString().trim() : '',
            descripcion_producto            : row[properties[11]]   ? row[properties[11]].toString() : '',
            cantidad                        : row[properties[12]]   ? row[properties[12]].toString() : '',
            cod_unidad_medida               : cod_unidad_medida,
            unidad_medida                   : unidad_medida,
            precio_unitario                 : Number.isNaN(precio_unitario) ? 0 : precio_unitario,
            precio_total_sin_igv            : row[properties[15]] === 0 ? '0' : row[properties[15]].toString(),
            dia                             : parseInt(fecha_dia),
            mes                             : parseInt(fecha_mes),
            anio                            : parseInt(fecha_anio),
        })

        num_row = num_row + 1
    }

    return { messages_error, add_inventories, borrar_data, data }
}


controller.ValAddMessageLog = (rows_error, messages_error, name_column, num_row, type, name_dts = null) => {

    let msg_log = ''

    switch (type) {
        case 'empty':
            msg_log = `Lo sentimos, algunos códigos de ${name_column} se encuentran vacios, recordar que este campo es obligatorio`
            break;
        case 'not number':
            msg_log = `Lo sentimos, algunos de los ${name_column} no son númericos`
            break;
        case 'format invalid':
            msg_log = `Lo sentimos, algunos de los ${name_column} no tienen el formato válido`
            break;
        case 'inconsistent data':
            msg_log = `Lo sentimos, algunos precios totales no cuadran con las cantidades y precios unitarios`
            break;
        case 'distributor not found':
            msg_log = `El código ${name_dts} no se encuentra en la maestra distribuidoras`
            break;
        default:
            msg_log = `Lo sentimos, el tipo de dato para ${name_column} es inválido`
    }

    if(rows_error == -1){
        messages_error.push({
            "columna"           : name_column,
            "notificaciones"    : [
                {
                    "msg"   : msg_log,
                    "rows" : [num_row+1],
                    "type" : type
                }
            ]
        })
    }else{
        let index_type_error
        if(type != 'distributor not found'){
            index_type_error = messages_error[rows_error]['notificaciones'].findIndex(typ => typ.type == type)   
        }else{
            index_type_error = messages_error[rows_error]['notificaciones'].findIndex( not => not.msg == msg_log)
        }

        if(index_type_error == -1){
            messages_error[rows_error]['notificaciones'].push({
                "msg"   : msg_log,
                "rows" : [num_row+1],
                "type" : type
            })
        }else{
            messages_error[rows_error]['notificaciones'][index_type_error]['rows'].push(num_row+1)
        }  
        
    }
}

module.exports = controller
