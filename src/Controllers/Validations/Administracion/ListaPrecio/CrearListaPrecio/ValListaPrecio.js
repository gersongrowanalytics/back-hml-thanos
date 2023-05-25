const controller = {}
const XLSX = require('xlsx')
const CrearListaPrecio = require('../../../../Methods/Administracion/ListaPrecio/CrearListaPrecio/CrearListaPrecio')

controller.ValCrearListaPrecio = async (req, res) => {

    const file = req.files.lista_precio

    try{

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }
        
        const { messages_error, add_list_price, data, dates_row } = await controller.ValCellsFile(workbook)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg))

        if(!add_list_price){
            res.status(500)
            return res.json({
                response        : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error,
                messages_error  : messages

            })
        }

        CrearListaPrecio.MetCrearListaPrecio(req, res, data, dates_row)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
    
}

controller.ValCellsFile = async (workbook) => {

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval:""})
    let properties  = Object.keys(rows[0])

    let add_list_price = true
    let messages_error  = []
    const data          = []
    const dates_row     = []
    const verify_cells  = [0, 1, 2, 4]

    const columns_name = [
        { value   : 0, name    : 'Zona' },
        { value   : 1, name    : 'Territorio' },
        { value   : 2, name    : 'CodigoProducto' },
        { value   : 3, name    : 'Descripcion' },
        { value   : 4, name    : 'ValorVenta' },
        { value   : 5, name    : 'FechaInicio' },
        { value   : 6, name    : 'FechaFin' },
        { value   : 7, name    : 'Estado' }
    ]

    let num_row = 1

    for await (const row of rows){

        verify_cells.forEach(function(cell){
            if(!row[properties[cell]]){
                add_list_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[cell]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[cell]['name'], num_row, 'empty')
            }
        })

        if(typeof row[properties[4]] != 'number'){
            add_list_price = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'not number')
        }
        let fecha_inicio = ''
        if(typeof row[properties[5]]){

            const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[5]]);
            const fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
            const fecha_dia = fechaJavaScript.d <= 9 ?"0"+fechaJavaScript.d.toString() :fechaJavaScript.d.toString();
            const fecha_capturada = fechaJavaScript.y.toString()+"-"+fecha_mes.toString()
            fecha_inicio = fechaJavaScript.y.toString()+"-"+fecha_mes.toString()+"-"+fecha_dia.toString()
            const exist_date = dates_row.findIndex( dat => dat == fecha_capturada)

            if(exist_date == -1){
                dates_row.push(fecha_capturada)
            }
        }
        let fecha_fin = ''
        if(typeof row[properties[6]]){

            const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[6]]);
            const fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
            const fecha_dia = fechaJavaScript.d <= 9 ?"0"+fechaJavaScript.d.toString() :fechaJavaScript.d.toString();
            fecha_fin = fechaJavaScript.y.toString()+"-"+fecha_mes.toString()+"-"+fecha_dia.toString()
        }

        data.push({
            zona                    : row[properties[0]] ?  row[properties[0]].toString() : '',
            territorio              : row[properties[1]] ?  row[properties[1]].toString() : '',
            proid                   : row[properties[2]] ?  parseInt(row[properties[2]])  : '',
            descripcion             : row[properties[3]] ?  row[properties[3]].toString() : '',
            valor_venta             : row[properties[4]] ?  row[properties[4]].toString() : '',
            fecha_inicio            : row[properties[5]] ?  fecha_inicio : '',
            fecha_fin               : row[properties[6]] ?  fecha_fin : '',
            estado                  : row[properties[7]] ?  row[properties[7]].toString() : '',
        })

        num_row = num_row + 1
    }

    return { messages_error, add_list_price, data, dates_row }
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