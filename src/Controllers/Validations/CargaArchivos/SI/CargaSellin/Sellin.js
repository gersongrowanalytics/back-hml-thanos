const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx')

const SellinController = require('../../../../Methods/CargaArchivos/SI/CargaSellin/Sellin')

controller.ValSellin = async (req, res) => {

    const file          = req.files.carga_sellin

    try{

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }

        const { messages_error, add_sellin, borrar_data, data } = await controller.ValCellsFile(workbook)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg));

        if(!add_sellin){
            await SellinController.MetSellin(req, res, null, null, true, messages_error)
            res.status(500)
            return res.json({
                response        : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error,
                messages_error  : messages
            })
        }

        SellinController.MetSellin(req, res, data, borrar_data, false)

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
    if(!workbook.Sheets['Ventas_SI']){
        exists_data = false
        message     = 'Lo sentimos no se encontró la hoja con nombre "Ventas_SI"'
        status      = 500
    }

    return { exists_data, message, status, workbook: workbook ? workbook : null }
}



controller.ValCellsFile = async (workbook) => {

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Ventas_SI'], {defval:""})
    let properties  = Object.keys(rows[0])

    const cod_prod = await prisma.master_productos.findMany({
        select : {
            id              : true,
            cod_producto    : true
        }
    })

    let cod_prod_exists = []

    let add_sellin = true
    let messages_error  = []
    let borrar_data     = []
    const data          = []
    const verify_cells  = [ 0, 1, 2 ]

    const columns_name = [
        { value   : 0, name    : 'DATE_TRANSACTION' },
        { value   : 1, name    : 'COD_CLIENTE_SI' },
        { value   : 2, name    : 'COD_MATERIAL' },
        { value   : 3, name    : 'METRIC_1' },
        { value   : 4, name    : 'METRIC_2' },
        { value   : 5, name    : 'METRIC_3' },
        { value   : 6, name    : 'METRIC_4' },
        { value   : 7, name    : 'METRIC_5' },
        { value   : 8, name    : 'METRIC_6' },
        { value   : 9, name    : 'METRIC_7' },
        { value   : 10, name   : 'METRIC_8' },
        { value   : 11, name   : 'METRIC_9' },
        { value   : 12, name   : 'METRIC_10' }
    ]

    let num_row = 1
    for await (const row of rows){

        let fecha_capturada
        let fecha_dia
        let fecha_mes
        let fecha_anio
        let fecha
        let proid
        let metric_one
        let metric_two
        let metric_three
        
        if(row[properties[0]]){
            if(typeof(row[properties[0]]) == 'string'){
                const fechaJavaScript = row[properties[1]].split('/')
                fecha_dia     = fechaJavaScript[2]
                fecha_mes     = fechaJavaScript[1]
                fecha_anio    = fechaJavaScript[0]
                fecha = fecha_anio + "-" + fecha_mes + "-" + fecha_dia
            }else{
                const fechaJavaScript = XLSX.SSF.parse_date_code(row[properties[0]]);
                fecha_mes = fechaJavaScript.m <= 9 ?"0"+fechaJavaScript.m.toString() :fechaJavaScript.m.toString();
                fecha_anio = fechaJavaScript.y.toString()
                fecha_dia = fechaJavaScript.d.toString()
                fecha = fecha_anio + "-" + fecha_mes + "-" + fecha_dia
            }
            fecha_capturada = fecha_anio + "-" + fecha_mes
            let existe_fec = false
            borrar_data.map((dat) => {
                if(dat == fecha_capturada){
                    existe_fec = true
                }
            })

            if(existe_fec == false){
                borrar_data.push(fecha_capturada)
            }
        }
        
        verify_cells.forEach(function(cell){
            if(!row[properties[cell]]){
                add_sellin = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[cell]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[cell]['name'], num_row, 'empty')
            }
        })

        
        if(row[properties[2]]){
            let prod_local = cod_prod_exists.find( prod => prod.cod_producto == row[properties[2]])

            if(prod_local){
                proid = prod_local.id
                cod_prod_exists.push({
                    id: prod_local.id,
                    cod_producto : prod_local.cod_producto
                })
            }else{
                let prod = cod_prod.find( prod => prod.cod_producto == row[properties[2]])
                if(prod){
                    proid = prod.id
                    cod_prod_exists.push({
                        id: prod.id,
                        cod_producto : prod.cod_producto
                    })
                }else{
                    add_sellin = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[2]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[2]['name'], num_row, 'product not found')
                }
            }
        }

        const val_metric_one = row[properties[3]]
        if( isNaN(val_metric_one) ){
            add_sellin = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[3]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[3]['name'], num_row, 'not number')
        }else{
            metric_one = isNaN(parseFloat(val_metric_one)) ? 0 : parseFloat(row[properties[3]])
        }


        const val_metric_two = row[properties[4]]
        if( isNaN(val_metric_two) ){
            add_sellin = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'not number')
        }else{
            metric_two = isNaN(parseFloat(val_metric_two)) ? 0 : parseFloat(row[properties[4]])
        }

        const val_metric_three = row[properties[5]]
        if( isNaN(val_metric_three) ){
            add_sellin = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[5]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[5]['name'], num_row, 'not number')
        }else{
            metric_three = isNaN(parseFloat(val_metric_three)) ? 0 : parseFloat(row[properties[5]])
        }

        data.push({
            fecha                   : fecha,
            codigo_cliente          : row[properties[1]]    ?   row[properties[1]].toString() : '',
            // proid                   : 1,
            proid                   : proid,
            metric_one              : metric_one,
            metric_two              : metric_two,
            metric_three            : metric_three,
            metric_four             : row[properties[6]]    ?  parseFloat(row[properties[6]]) : 0,
            metric_five             : row[properties[7]]    ?  parseFloat(row[properties[7]]) : 0,
            metric_six              : row[properties[8]]    ?  parseFloat(row[properties[8]]) : 0,
            metric_seven            : row[properties[9]]    ?  parseFloat(row[properties[9]]) : 0,
            metric_eight            : row[properties[10]]   ?  parseFloat(row[properties[10]]) : 0,
            metric_nine             : row[properties[11]]   ?  parseFloat(row[properties[11]]) : 0,
            metric_teen             : row[properties[12]]   ?  parseFloat(row[properties[12]]) : 0,
            precio                  : parseFloat(row[properties[5]]) / parseFloat(row[properties[4]]),
            dia                     : parseInt(fecha_dia),
            mes                     : parseInt(fecha_mes),
            anio                    : parseInt(fecha_anio),
        })

        num_row = num_row + 1
    }

    return { messages_error, add_sellin, borrar_data, data }
}


controller.ValAddMessageLog = (rows_error, messages_error, name_column, num_row, type, name_dts = null) => {

    let msg_log = ''

    switch (type) {
        case 'empty':
            msg_log = `Lo sentimos, algunos valores de ${name_column} se encuentran vacios, recordar que este campo es obligatorio`
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
        case 'product not found':
            msg_log = `El código ${name_column} no se encuentra en la maestra productos`
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