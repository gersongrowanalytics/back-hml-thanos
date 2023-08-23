const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const XLSX = require('xlsx')

const SellInUploadController = require('../../../../Methods/CargaArchivos/SI/SellInUpload/SellInUpload')

controller.ValSellInUpload = async (req, res) => {
    const {
        req_action_file
    } = req.body

    const {
        usutoken
    } = req.headers

    const file = req.files.carga_sellin
    let error_api = false
    let error_log = []
    let messages = []
    let messages_error_value = []
    let borrar_data_value = []
    let data_value = []

    try{
        const usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : usutoken
            },
            select : {
                usuid : true
            }
        })

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(exists_data){
            const { messages_error, sell_in, borrar_data, data, codcli_esp, cods_dts } = await controller.ValCellsFile(workbook, usu)

            messages_error_value = messages_error
            borrar_data_value = borrar_data
            data_value = data

            messages = messages_error.flatMap(mess => mess.notificaciones.map(notif => notif.msg))

            if(!sell_in){
                error_api = true
            }
        }else{
            error_api = true
        }
    }catch(error){
        console.log(error)
        if(error){
            error_api = true
            error_log.push("Validacion Sell In: "+error.toString())
        }   
    }finally{
        if(error_api){
            await SellInUploadController.MetSellInUpload(req, res, null, null, true, messages_error_value, error_log)

            res.status(500)
            return res.json({
                respuesta       : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error_value,
                messages_error  : messages
            })
        }else{
            SellInUploadController.MetSellInUpload(req, res, data_value, borrar_data_value, false, null, error_log)
        }
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
    const nameExcel = workbook.SheetNames[0]
    if(!workbook.Sheets[nameExcel]){
        exists_data = false
        message     = 'Lo sentimos no se encontró la hoja con nombre "data"'
        status      = 500
    }

    return { exists_data, message, status, workbook: workbook ? workbook : null }
}

controller.ValCellsFile = async (workbook, usu) => {

    const nameExcel = workbook.SheetNames[0]
    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets[nameExcel], {defval:""})
    let properties  = Object.keys(rows[0])

    let sell_in = true
    let messages_error  = []
    let borrar_data     = []
    const data          = []
    const codcli_esp    = []

    const columns_empty     = []
    const cods_dts          = []

    const columns_name = [
        { value   : 0, name    : 'Organización ventas' },
        { value   : 1, name    : 'Canal distribución' },
        { value   : 2, name    : 'Sector' },
        { value   : 3, name    : 'Solicitante' },
        { value   : 4, name    : 'Destinatario mcía.' },
        { value   : 5, name    : 'Familia Material' },
        { value   : 6, name    : 'Jerarquia Material 1' },
        { value   : 7, name    : 'Material' },
        { value   : 8, name    : 'Tiene Cargo (S,NVTA,NMKT,C)' },
        { value   : 9, name    : 'Fecha' },
        { value   : 10, name   : 'Comuna' },
        { value   : 11, name   : 'kgnetofac' },
        { value   : 12, name   : 'kgnetofac' },
        { value   : 13, name   : 'ubnetofac' },
        { value   : 14, name   : 'ubnetofac' },
        { value   : 15, name   : 'VendDestin' },
        { value   : 16, name   : 'SegmMateri' },
        { value   : 17, name   : 'msvalnetfa' },
        { value   : 18, name   : 'msvalnetfa' },
        { value   : 19, name   : 'mevalnetfa' },
        { value   : 20, name   : 'mevalnetfa' },
    ]

    const size_rows = rows.length
    let num_row = 1

    for await (const row of rows){

        let cod_solicitante = ""
        let solicitante = ""
        let cod_destinatario = ""
        let destinatario = ""
        let cod_material = ""
        let material = ""
        let day_date = 0
        let month_date = 0
        let year_date = 0
        
        if(!row[properties[3]]){
            sell_in = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[3]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[3]['name'], num_row, 'empty', null)
        }else{
            const [text_cod_solicitante, ...text_solicitante] = row[properties[3]].split(/\s+/)
            cod_solicitante = text_cod_solicitante
            solicitante = text_solicitante.join(" ")
        }
        
        if(!row[properties[4]]){
            sell_in = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'empty', null)
        }else{
            const [text_cod_destinatario, ...text_destinatario] = row[properties[4]].split(/\s+/)
            cod_destinatario = text_cod_destinatario
            destinatario = text_destinatario.join(" ")
        }

        if(!row[properties[7]]){
            sell_in = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[7]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[7]['name'], num_row, 'empty', null)
        }else{
            const [text_cod_material, ...text_material] = row[properties[7]].split(/\s+/)
            cod_material = text_cod_material
            material = text_material.join(" ")
        }

        if(!row[properties[9]]){
            sell_in = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[9]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[9]['name'], num_row, 'empty', null)
        }else{
            const text_excel = row[properties[9]].split(".")
            day_date = text_excel[0]
            month_date = text_excel[1]
            year_date = text_excel[2]
            const date_find = borrar_data.find(dat => dat.anio == year_date && dat.mes == month_date)
            if(!date_find){
                borrar_data.push({mes: parseInt(month_date), anio: parseInt(year_date)})
            }
        }

        data.push({
            organizacion_ventas             : row[properties[0]]    ?  row[properties[0]].toString().trim() : '',
            canal_distribucion              : row[properties[1]]    ?  row[properties[1]].toString().trim() : '',
            sector                          : row[properties[2]]    ?  row[properties[2]].toString().trim() : '',
            cod_solicitante                 : cod_solicitante,
            solicitante                     : solicitante,
            cod_destinatario                : cod_destinatario,
            destinatario                    : destinatario,
            familia_material                : row[properties[5]]    ?  row[properties[5]].toString().trim() : '',
            jerarquia_material              : row[properties[6]]    ?  row[properties[6]].toString().trim() : '',
            cod_material                    : cod_material,
            material                        : material,
            cargo                           : row[properties[8]]    ?  row[properties[8]].toString().trim() : '',
            fecha                           : row[properties[9]]    ?  row[properties[9]].toString().trim() : '',
            comuna                          : row[properties[10]]    ?  row[properties[10]].toString().trim() : '',
            kgnetofac                       : row[properties[11]]    ?  parseFloat(row[properties[11]]) : 0,
            kgnetofac_medida                : row[properties[12]]    ?  row[properties[12]].toString().trim() : '',
            ubnetofac                       : row[properties[13]]    ?  parseFloat(row[properties[13]]) : 0,
            ubnetofac_tipo                  : row[properties[14]]    ?  row[properties[14]].toString().trim() : '',
            vend_destin                     : row[properties[15]]    ?  parseFloat(row[properties[15]]) : 0,
            segm_materi                     : row[properties[16]]    ?  row[properties[16]].toString().trim() : '',
            msvalnetfa_pen                  : row[properties[17]]    ?  parseFloat(row[properties[17]]) : 0,
            msvalnetfa_pen_tipo             : row[properties[18]]    ?  row[properties[18]].toString().trim() : '',
            msvalnetfa_usd                  : row[properties[19]]    ?  parseFloat(row[properties[19]]) : 0,
            msvalnetfa_usd_tipo             : row[properties[20]]    ?  row[properties[20]].toString().trim() : '',
            dia                             : parseInt(day_date),
            mes                             : parseInt(month_date),
            anio                            : parseInt(year_date),
        })

        num_row = num_row + 1
    }

    const messages_emptys = columns_empty.filter(col => col.empty_count == size_rows)
    const cols_emptys = columns_empty.filter(col => col.empty_count == size_rows).map(emp => emp.name)

    if(messages_emptys.length > 0){
        messages_emptys.forEach(mes => {
            let rows_error  = messages_error.findIndex(meserror => meserror.columna == mes.name)
            controller.ValAddMessageLog(rows_error, messages_error, mes.name, -1, 'empty rows', null)
        });
    }

    const messages_error_copy = [...messages_error]
    messages_error = []

    messages_error_copy.forEach(msg => {
        if(!cols_emptys.includes(msg.columna)){
            messages_error.push(msg)
        }else{
            messages_error.push({
                columna : msg.columna,
                notificaciones : msg.notificaciones.filter(not => not.type == 'empty rows')
            })
        }
    })

    return { messages_error, sell_in, borrar_data, data, codcli_esp, cods_dts }
}

controller.ValAddMessageLog = (rows_error, messages_error, name_column, num_row, type, name_dts = null, extra) => {

    let msg_log = ''

    switch (type) {
        case 'empty':
            msg_log = `Lo sentimos, algunos códigos de ${name_column} se encuentran vacios, recordar que este campo es obligatorio`
            break;
        case 'not number':
            msg_log = `Lo sentimos, algunos de los ${name_column} no son númericos`
            break;
        case 'date range':
            msg_log = `Lo sentimos, algunos registros tienen una fecha diferente a la seleccionada "${extra}. Para poder subir esta información, se necesita la aprobación por correo del area de BI"`
            break;
        case 'format invalid':
            msg_log = `Lo sentimos, algunos de los ${name_column} no tienen el formato válido`
            break;
        case 'number of digits':
            msg_log = `Lo sentimos, algunos de los ${name_column} no tienen la cantidad de digitos correctos`
            break;
        case 'distribuitor not share information':
            msg_log = `Lo sentimos, la distribuidora con código ${name_dts} tiene el tipo de conexión "NO COMPARTE"`
            break;
        case 'inconsistent data':
            msg_log = `Lo sentimos, algunos precios totales no cuadran con las cantidades y precios unitarios`
            break;
        case 'distributor not found':
            msg_log = `El código ${name_dts} no se encuentra en la maestra distribuidoras`
            break;
        case 'empty rows':
            msg_log = `Lo sentimos, la columna ${name_column} se encuentra completamente vacia`
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
        if(type != 'distributor not found' && type != 'distribuitor not share information'){
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