const controller = {}
const XLSX = require('xlsx')
const MasterPreciosController = require('../../../Methods/CargaArchivos/MasterPrecios/MasterPrecios')

controller.ValMasterPreciosXlsx = async (req, res) => {

    const {
        req_date_updated,
    } = req.body

    const file = req.files.master_precios
    let error_api = false
    let sheet_not_found = []
    let error_log = []
    let messages = []
    let messages_error_value = []
    let borrar_data_value = []
    let data_value = []

    try{

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file, sheet_not_found)

        if(exists_data){
            const data_sheet_1 = await controller.ValCellsFile(workbook, 'PLISTA B2B', req_date_updated)

            const data_sheet_2 = await controller.ValCellsFile(workbook, 'PLISTA Tradicional', req_date_updated)

            const messages_error = data_sheet_1.messages_error.concat(data_sheet_2.messages_error)
            const dates_row = data_sheet_1.dates_row.concat(data_sheet_2.dates_row)
            const data = data_sheet_1.data.concat(data_sheet_2.data)

            messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg))

            messages_error_value = messages_error
            borrar_data_value = dates_row
            data_value = data

            if(!data_sheet_1.add_master_price || !data_sheet_2.add_master_price){
                error_api = true
            }

        }else{
            error_api = true
        }

    }catch(error){
        console.log(error)
        if(error){
            error_api = true
            error_log.push("Validacion Master Precios: "+error.toString())
        } 
    }finally{
        if(error_api){
            await MasterPreciosController.MetMasterPrecios(req, res, null, null, true, messages_error_value, error_log, sheet_not_found)

            res.status(500)
            return res.json({
                respuesta        : false,
                mensaje         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error_value,
                messages_error  : messages,
                sheet_not_found : sheet_not_found,
            })
        }else{
            MasterPreciosController.MetMasterPrecios(req, res, data_value, borrar_data_value, false, null, error_log, sheet_not_found)
        }
    }
}

controller.ValCellsFile = async (workbook, workbook_title, req_date_updated) => {

    let range_excel
    let columns_name
    let num_row = 0

    if(workbook_title == 'PLISTA B2B'){
        range_excel = 9

        columns_name = [
            { value   : 0, name    : 'Categoria' },
            { value   : 1, name    : 'Segmento' },
            { value   : 2, name    : 'Codigo' },
            { value   : 3, name    : 'Material' },
            { value   : 4, name    : 'PAQ X BULTO' },
            { value   : 5, name    : '020 DIST. LIMA' },
            { value   : 6, name    : '022 DIST.  PROV.' },
        ]

        num_row = 10
    }else{
        range_excel = 15

        columns_name = [
            { value   : 0, name    : 'CATEGORIA' },
            { value   : 1, name    : 'SEGMENTO' },
            { value   : 2, name    : 'CODIGO' },
            { value   : 3, name    : 'MATERIAL' },
            { value   : 4, name    : 'PAQ X BULTO' },
            { value   : 5, name    : '012CLIENTES TRADICIONAL - Mixtos' },
        ]

        num_row = 16
    }

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets[workbook_title], {defval:"", range: range_excel})
    let properties  = Object.keys(rows[0])

    let add_master_price = true
    let messages_error  = []
    const data          = []
    const dates_row     = []

    const [date_year, date_month] = req_date_updated.split('-')

    for await (const row of rows){

        let type_gba = []

        if(!row[properties[2]]){
            add_master_price = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[2]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[2]['name'], num_row, 'empty', null, workbook_title)
        }

        if(workbook_title == 'PLISTA B2B'){
            if(!row[properties[5]]){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[5]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[5]['name'], num_row, 'empty', null, workbook_title)
            }else{
                if(isNaN(row[properties[5]])){
                    add_master_price = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[5]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[5]['name'], num_row, 'not number', null, workbook_title)
                }else{
                    type_gba.push({gba: "LIMA", precio: row[properties[5]]})
                }
            }
    
            if(!row[properties[6]]){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[6]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[6]['name'], num_row, 'empty', null, workbook_title)
            }else{
                if(isNaN(row[properties[6]])){
                    add_master_price = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[6]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[6]['name'], num_row, 'not number', null, workbook_title)
                }else{
                    type_gba.push({gba: "PROVINCIA", precio: row[properties[6]]})
                }
            }
        }else{
            if(!row[properties[5]]){
                add_master_price = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[5]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[5]['name'], num_row, 'empty', null, workbook_title)
            }else{
                if(isNaN(row[properties[5]])){
                    add_master_price = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[5]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[5]['name'], num_row, 'not number', null, workbook_title)
                }else{
                    type_gba.push({gba: "LIMA", precio: row[properties[5]]})
                    type_gba.push({gba: "PROVINCIA", precio: row[properties[5]]})
                }
            }
        }

        type_gba.map(tgba => {
            data.push({
                codigo                      : row[properties[2]] ? row[properties[2]].toString() : null,
                gba                         : tgba.gba,
                tipo                        : workbook_title,
                precio                      : tgba.precio,
                fecha                       : "01-"+date_month.toString()+"-"+date_year.toString(),
                dia                         : 1,
                mes                         : parseInt(date_month),
                anio                        : parseInt(date_year),
            })
        })

        num_row = num_row + 1
    }

    return { messages_error, add_master_price, data, dates_row }
}

controller.ValExistsData = async (file, sheet_not_found) => {

    let exists_data   = true
    let message       = ''
    let status        = 200

    if (!file) {
        exists_data = false
        message     = 'No se ha subido ningún archivo'
        status      = 500
    }

    const workbook = XLSX.read(file.data)
    if(!workbook.Sheets['PLISTA B2B']){
        exists_data = false
        message     = 'Lo sentimos no se encontró la hoja data'
        status      = 500
        sheet_not_found.push("No se encontro la hoja PLISTA B2B")
    }

    if(!workbook.Sheets['PLISTA Tradicional']){
        exists_data = false
        message     = 'Lo sentimos no se encontró la hoja data'
        status      = 500
        sheet_not_found.push("No se encontro la hoja PLISTA Tradicional")
    }

    return { exists_data, message, status, workbook: workbook ? workbook : null }
}

controller.ValAddMessageLog = (rows_error, messages_error, name_column, num_row, type, name_dts = null, title_sheet) => {

    let msg_log = ''

    switch (type) {
        case 'empty':
            msg_log = `Lo sentimos, algunos códigos de la hoja ${title_sheet} de ${name_column} se encuentran vacios, recordar que este campo es obligatorio`
            break;
        case 'not number':
            msg_log = `Lo sentimos, en la hoja ${title_sheet} algunos de los ${name_column} no son númericos`
            break;
        case 'format invalid':
            msg_log = `Lo sentimos, en la hoja ${title_sheet} algunos de los ${name_column} no tienen el formato válido`
            break;
        case 'inconsistent data':
            msg_log = `Lo sentimos, algunos precios totales no cuadran con las cantidades y precios unitarios`
            break;
        case 'distributor not found':
            msg_log = `El código ${name_dts} de la hoja ${title_sheet} no se encuentra en la maestra distribuidoras`
            break;
        default:
            msg_log = `Lo sentimos, el tipo de dato para ${name_column} de la hoja ${title_sheet} es inválido`
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