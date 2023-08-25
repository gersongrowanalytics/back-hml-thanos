const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx')
const HomologacionesController = require('../../../Methods/CargaArchivos/Homologaciones/Homologaciones')

controller.ValHomologaciones = async (req, res) => {

    const {
        req_action_file
    } = req.body
    
    const file = req.files.listado_homologaciones

    try{

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }

        const { messages_error, add_list_approvals, data } = await controller.ValCellsFile(workbook)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg));

        if(!add_list_approvals){
            res.status(500)
            return res.json({
                response        : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error,
                messages_error  : messages

            })
        }

        HomologacionesController.MetHomologaciones(req, res, data)

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
    if(!workbook.Sheets['Hoja1']){
        exists_data = false
        message     = 'Lo sentimos no se encontró la hoja con nombre "Hoja1"'
        status      = 500
    }

    return { exists_data, message, status, workbook: workbook ? workbook : null }
}

controller.ValCellsFile = async (workbook) => {

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})
    let properties  = Object.keys(rows[0])

    let add_list_approvals = true
    let messages_error  = []
    const data          = []

    const columns_name = [
        { value   : 0, name    : 'codigo_distribuidor' },
        { value   : 1, name    : 'Codigo Grow' },
        { value   : 2, name    : 'nombre_distribuidor' },
        { value   : 3, name    : 'codigo_producto_distribuidor' },
        { value   : 4, name    : 'nombre_producto_distribuidor' },
        { value   : 5, name    : 'codigo_producto_maestro' },
        { value   : 6, name    : 'fecha_inicial' },
        { value   : 8, name    : 'es_homologado' }, 
        { value   : 10, name   : 'cod_und' },
        { value   : 11, name   : 'und' }
    ]

    const columns = {
        ex_cod_distribuidor : 'codigo_distribuidor',
        ex_nom_distribuidor : 'nombre_distribuidor',
        ex_cod_und          : 'cod_und',
        ex_und              : 'und',

        ex_cod_prod_dist    : 'codigo_producto_distribuidor',
        ex_nom_prod_dist    : 'nombre_producto_distribuidor',
        ex_und_hml          : 'unidad_medida_hml',
        ex_cod_prod_maestro : 'codigo_producto_maestro',
        ex_unidad_minima    : 'unidad_minima',
        ex_fecha_inicial    : 'fecha_inicial'
    }

    let num_row = 1
    for await (const row of rows){

        if(!row[properties[0]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns.ex_cod_distribuidor)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_cod_distribuidor, num_row, 'empty')
        }

        if(!row[properties[1]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns.ex_nom_distribuidor)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_nom_distribuidor, num_row, 'empty')
        }

        if(!row[properties[2]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns.ex_cod_und)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_cod_und, num_row, 'empty')
        }

        if(!row[properties[3]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna ==  columns.ex_und)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_und, num_row, 'empty')
        }

        if(!row[properties[4]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns.ex_cod_prod_dist)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_cod_prod_dist, num_row, 'empty')
        }

        if(!row[properties[5]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns.ex_nom_prod_dist)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_nom_prod_dist, num_row, 'empty')
        }

        if(!row[properties[6]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna ==  columns.ex_und_hml)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_und_hml, num_row, 'empty')
        }

        if(!row[properties[7]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna ==  columns.ex_cod_prod_maestro)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_cod_prod_maestro, num_row, 'empty')
        }

        if(!row[properties[8]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna ==  columns.ex_unidad_minima)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_unidad_minima, num_row, 'empty')
        }

        if(!row[properties[9]]){
            // add_list_approvals = false
            let rows_error  = messages_error.findIndex(mes => mes.columna ==  columns.ex_fecha_inicial)
            controller.ValAddMessageLog(rows_error, messages_error, columns.ex_fecha_inicial, num_row, 'empty')
        }

        data.push({
            cod_distribuidor          : row[properties[0]] ? row[properties[0]] : '',
            nombre_distribuidor       : row[properties[1]] ? row[properties[1]] : '',
            cod_und                   : row[properties[2]] ? row[properties[2]] : '',
            und                       : row[properties[3]] ? row[properties[3]] : '',
            cod_producto_distribuidor : row[properties[4]] ? row[properties[4]] : '',
            nom_producto_distribuidor : row[properties[5]] ? row[properties[5]] : '',
            cod_und_hml               : row[properties[6]] ? row[properties[6]] : '',
            cod_producto_maestro      : row[properties[7]] ? row[properties[7]] : '',
            unidad_minima             : row[properties[8]] ? row[properties[8]] : '',
            fecha_inicial             : row[properties[9]] ? row[properties[9]] : '',
        })

        num_row = num_row + 1
    }

    return { messages_error, add_list_approvals, data }
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