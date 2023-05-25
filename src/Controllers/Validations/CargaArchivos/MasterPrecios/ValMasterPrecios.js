const controller = {}
const XLSX = require('xlsx')
const MasterPreciosController = require('../../../Methods/CargaArchivos/MasterPrecios/MasterPrecios')

controller.ValMasterPrecios = async (req, res) => {

    const file = req.files.master_precios

    try{

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }
        
        const { messages_error, add_master_price, data, dates_row } = await controller.ValCellsFile(workbook)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg))

        if(!add_master_price){
            res.status(500)
            return res.json({
                response        : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error,
                messages_error  : messages

            })
        }

        MasterPreciosController.MetMasterPrecios(req, res, data, dates_row)

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de leer el archivo',
            devmsg  : error
        })
    }
}

controller.ValCellsFile = async (workbook) => {

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'], {defval:""})
    let properties  = Object.keys(rows[0])

    let add_master_price = true
    let messages_error  = []
    const data          = []
    const dates_row     = []
    const verify_cells  = [0, 1, 2, 3]

    const columns_name = [
        { value   : 0, name    : 'DATE' },
        { value   : 1, name    : 'CG2' },
        { value   : 2, name    : 'COD_MATERIAL' },
        { value   : 3, name    : 'EXCHANGE_VALUE_1' },
        { value   : 4, name    : 'EXCHANGE_VALUE_2' },
        { value   : 5, name    : 'EXCHANGE_VALUE_3' },
        { value   : 6, name    : 'EXCHANGE_VALUE_4' },
        { value   : 7, name    : 'EXCHANGE_VALUE_5' }
    ]

    let num_row = 1

    for await (const row of rows){

        verify_cells.forEach(function(cell){
            if(!row[properties[cell]]){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[cell]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[cell]['name'], num_row, 'empty')
            }
        })

        if(row[properties[3]]){

            if(typeof row[properties[3]] != 'number'){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[3]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[3]['name'], num_row, 'not number')
            }
        }

        if(row[properties[4]]){

            if(typeof row[properties[4]] != 'number'){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'not number')
            }
        }

        if(row[properties[5]]){

            if(typeof row[properties[4]] != 'number'){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[5]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[5]['name'], num_row, 'not number')
            }
        }
        if(row[properties[6]]){

            if(typeof row[properties[4]] != 'number'){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[6]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[6]['name'], num_row, 'not number')
            }
        }

        if(row[properties[7]]){

            if(typeof row[properties[7]] != 'number'){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[7]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[7]['name'], num_row, 'not number')
            }
        }

        let fecha = ''
        if(row[properties[0]]){

            console.log(typeof(row[properties[0]]))

            console.log(row[properties[0]])
            const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[0]] + 1);
            const fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
            const fecha_dia = fechaJavaScript.d <= 9 ?"0"+fechaJavaScript.d.toString() :fechaJavaScript.d.toString();

            const fecha_capturada = fechaJavaScript.y.toString()+"-"+fecha_mes.toString()
            const exist_date = dates_row.findIndex( dat => dat == fecha_capturada)
            fecha = fecha_capturada + "-" + fecha_dia
            
            if(exist_date == -1){
                dates_row.push(fecha_capturada)
            }
        }

        data.push({
            date                        : row[properties[0]] ?  fecha : '',
            cg_two                      : row[properties[1]] ?  row[properties[1]].toString() : '',
            cod_material                : row[properties[2]] ?  row[properties[2]].toString()  : '',
            ex_changue_one              : row[properties[3]] ?  row[properties[3]] : null,
            ex_changue_two              : row[properties[4]] ?  row[properties[4]] : null,
            ex_changue_three            : row[properties[5]] ?  row[properties[5]] : null,
            ex_changue_four             : row[properties[6]] ?  row[properties[6]] : null,
            ex_changue_five             : row[properties[7]] ?  row[properties[7]] : null,
        })

        num_row = num_row + 1
    }

    return { messages_error, add_master_price, data, dates_row }
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

    const workbook = XLSX.read(file.data, { dateNF:"dd/mm/yyyy"})
    if(!workbook.Sheets['Sheet1']){
        exists_data = false
        message     = 'Lo sentimos no se encontró alguna hoja'
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