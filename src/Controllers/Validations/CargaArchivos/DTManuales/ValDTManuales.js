const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const DTManualesController = require('../../../Methods/CargaArchivos/DTManuales/DTManuales')
const DTManualesMasterClientesGrowController = require('../../../Methods/CargaArchivos/DTManuales/DTManualesMasterClientesGrow')
const moment = require('moment');

controller.ValDTManuales = async (req, res) => {

    const {
        req_action_file,
        req_date_updated
    } = req.body

    const {
        usutoken
    } = req.headers

    const file          = req.files.carga_manual

    try{

        const date = req_date_updated
        
        const usu = await prisma.usuusuarios.findFirst({
            where : {
                usutoken : usutoken
            },
            select : {
                usuid : true,
                tpuid : true
            }
        })

        const action_file = JSON.parse(req_action_file)

        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
                notificaciones : []
            })
        }

        const { messages_error, add_dt_manuales, borrar_data, data, codcli_esp, cods_dts } = await controller.ValCellsFile(workbook, usu, date)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg));

        if(!add_dt_manuales){
            await DTManualesController.MetDTManuales(req, res, null, null, true, messages_error)
            await prisma.$disconnect()

            return res.status(500).json({
                respuesta       : false,
                message         : 'Lo sentimos se encontraron algunas observaciones',
                notificaciones  : messages_error,
                messages_error  : messages
            })
        }

        if(action_file.process_data){
            DTManualesController.MetDTManuales(req, res, data, borrar_data, false)
        }
        
    }catch(error){
        console.log(error)
        res.status(500).json({
            message : 'Lo sentimos hubo un error al momento de leer el archivo',
            respuesta: false,
            devmsg  : error,
            notificaciones: [],
            messages_error: [],
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

controller.ValCellsFile = async (workbook, usu, date) => {

    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval:""})
    let properties  = Object.keys(rows[0])

    const [ req_year, req_month ] = date.split("-")
    // const cod_dts = await prisma.master_distribuidoras.findMany({
    //     select : {
    //         codigo_dt   : true,
    //         id          : true
    //     }
    // })

    const cod_dts = await prisma.masterclientes_grow.findMany({
        select : {
            codigo_destinatario : true,
            id                  : true,
            conexion            : true
        }
    })

    let add_dt_manuales = true
    let messages_error  = []
    let borrar_data     = []
    const data          = []
    const verify_cells  = [3, 7, 10, 11, 12, 13]
    const codcli_esp    = []

    const mcl_grow_local    = []
    const mcl_nogrow_local  = []
    const columns_empty     = []
    const cods_dts          = []

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
        { value   : 10, name   : 'CodigoProducto' },
        { value   : 11, name   : 'DescripcionProducto' },
        { value   : 12, name   : 'Cantidad' },
        { value   : 13, name   : 'UnidadDeMedida' },
        { value   : 14, name   : 'PrecioUnitario' },
        { value   : 15, name   : 'PrecioTotalSinIGV' },
    ]

    const size_rows = rows.length
    let num_row = 1

    for await (const row of rows){

        let m_dt_id = null

        let date_excel
        let day_date
        let month_date
        let year_date
        let date_final
        
        if(typeof(row[properties[1]]) == 'number'){
            date_excel = XLSX.SSF.parse_date_code(row[properties[1]])
            month_date = date_excel.m <= 9 ?"0"+date_excel.m.toString() :date_excel.m.toString();
            day_date = date_excel.d
            year_date = date_excel.y
            date_final = year_date.toString()+"-"+ month_date.toString()
        }else if(typeof(row[properties[1]]) == 'string'){
            let separators
            if(row[properties[1]].includes('/')){
                separators = 'DD/MM/YYYY'
            }else{
                separators = 'DD-MM-YYYY'
            }
            const date_excel = moment(row[properties[1]], separators);
            month_date = date_excel.month() + 1 <= 9 ? "0"+ (date_excel.month() + 1).toString() : date_excel.month() + 1
            day_date = date_excel.date()
            year_date = date_excel.year()
            date_final = year_date.toString() +'-'+ month_date.toString()
        }

        if(!row[properties[0]]){

            //Si no existe el código distribuidor
            add_dt_manuales = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[0]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[0]['name'], num_row, 'empty', null)

        }else{

            if(!cods_dts.includes(row[properties[0]].toString().trim())){
                cods_dts.push(row[properties[0]].toString().trim())
            }

            if(cod_dts.findIndex(dts => dts.codigo_destinatario == row[properties[0]]) == -1){
                add_dt_manuales = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[0]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[0]['name'], num_row, 'distributor not found', row[properties[0]])
            }else{

                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[0]['name'])
                let find_dts = cod_dts.find(dt => dt.codigo_destinatario == row[properties[0]].toString().trim())
                m_dt_id = find_dts.id
                if(find_dts.conexion.toLocaleLowerCase() == "NO COMPARTE".toLocaleLowerCase()){                    
                    add_dt_manuales = false
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[0]['name'], num_row, 'distribuitor not share information', row[properties[0]])
                }
    
                let existe_cod = false
                borrar_data.map((dat) => {
                    if(dat.cod_dt == row[properties[0]].toString().trim() && dat.fecha == date_final ){
                        existe_cod = true
                    }
                })
    
                if(existe_cod == false){
                    borrar_data.push({
                        cod_dt : row[properties[0]].toString().trim(),
                        fecha : date_final
                    })
                }
            }
        }

        if(!row[properties[1]]){
            add_dt_manuales = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[1]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[1]['name'], num_row, 'empty', null)
        }else{

            let existe_fec = false
            borrar_data.map((dat) => {
                if(dat.cod_dt == row[properties[0]].toString().trim() && dat.fecha == date_final){
                    existe_fec = true
                }
            })

            if(existe_fec == false){
                borrar_data.push({
                    cod_dt : row[properties[0]].toString().trim(),
                    fecha : date_final
                })
            }
        }

        if(usu.tpuid != 1){
            if(row[properties[4]]){
                
                if(row[properties[4]].toString().length != 11 && row[properties[4]].toString().length != 8){
                    add_dt_manuales = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'number of digits', null)
                }
        
                if(isNaN(row[properties[4]])){
                    add_dt_manuales = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'not number', null)
                }
            }
    
            if(row[properties[8]]){
                
                if(row[properties[8]].toString().length != 8 && row[properties[8]].toString().length != 9){
                    add_dt_manuales = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[8]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[8]['name'], num_row, 'number of digits', null)
                }
        
                if(isNaN(row[properties[8]])){
                    add_dt_manuales = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[8]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[8]['name'], num_row, 'not number', null)
                }
            }
        }

        verify_cells.forEach(function(cell){
            if(!row[properties[cell]]){
                add_dt_manuales = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[cell]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[cell]['name'], num_row, 'empty', null)

                let index_empty = columns_empty.findIndex(col => col.name == columns_name[cell]['name']) 
                if(index_empty == -1){
                    columns_empty.push({
                        name : columns_name[cell]['name'],
                        empty_count : 1
                    })
                }else{
                    columns_empty[index_empty]['empty_count'] = columns_empty[index_empty]['empty_count'] + 1
                }
            }
        })

        if(isNaN(row[properties[12]])){
            add_dt_manuales = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[12]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[12]['name'], num_row, 'not number', null)
        }

        if(isNaN(row[properties[14]])){
            add_dt_manuales = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[14]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[14]['name'], num_row, 'not number', null)
        }

        if(row[properties[14]] === ''){
            add_dt_manuales = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[14]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[14]['name'], num_row, 'empty', null)
        }

        if(row[properties[15]] === ''){
            add_dt_manuales = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[15]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[15]['name'], num_row, 'empty', null)
        }else{

            const row_precio_total = row[properties[15]]

            if(isNaN(row_precio_total)){
                add_dt_manuales = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[15]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[15]['name'], num_row, 'not number', null)
            }else{
                const row_cantidad = row[properties[12]]
                const row_precio = row[properties[14]]
                const precioTotal = Number(row_cantidad) * Number(row_precio)
                const dif_totales = precioTotal - row_precio_total
                if(dif_totales >= 1 || dif_totales <= -1){
                    add_dt_manuales = false
                    let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[15]['name'])
                    controller.ValAddMessageLog(rows_error, messages_error, columns_name[15]['name'], num_row, 'inconsistent data', null)
                }
            }
        }

        if(row[properties[3]]){
            if(!codcli_esp.includes(row[properties[3]].toString().trim())){
                codcli_esp.push(row[properties[3]].toString().trim())
            }
        }

        let id_mcl_grow
        if(row[properties[0]]){
            id_mcl_grow = await DTManualesMasterClientesGrowController.MetDTManualesMasterClientesGrow(row[properties[0]], mcl_grow_local, mcl_nogrow_local)
        }


        let cod_unidad_medida   = row[properties[13]].toString().substring(0,3)
        let unidad_medida       = row[properties[13]].toString()
        let precio_unitario     = row[properties[15]]/row[properties[12]]

        const pk_venta_so           = row[properties[0]].toString().trim() + row[properties[10]].toString().trim()
        const pk_extractor_venta_so = row[properties[0]].toString().trim() + row[properties[10]].toString().trim() + cod_unidad_medida + unidad_medida

        if(usu.usuid != 1){
            if(parseInt(month_date) != parseInt(req_month) || parseInt(year_date) != parseInt(req_year)){
                add_dt_manuales = false
                let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[1]['name'])
                controller.ValAddMessageLog(rows_error, messages_error, columns_name[1]['name'], num_row, 'date range', null, date)
            }
        }

        data.push({
            pro_so_id                       : null,
            pk_venta_so                     : pk_venta_so,
            m_cl_grow                       : id_mcl_grow,
            pk_extractor_venta_so           : pk_extractor_venta_so,
            codigo_distribuidor             : row[properties[0]]    ?  row[properties[0]].toString().trim() : '',
            fecha                           : date_final            ?  date_final.toString() : '',
            nro_factura                     : row[properties[2]]    ?  row[properties[2]].toString() : '',
            codigo_cliente                  : row[properties[3]]    ?  row[properties[3]].toString().trim() : '',
            ruc                             : row[properties[4]]    ?  row[properties[4]].toString() : '',
            razon_social                    : row[properties[5]]    ?  row[properties[5]].toString().trim() : '',
            mercado_categoria_tipo          : row[properties[6]]    ?  row[properties[6]].toString() : '',
            codigo_vendedor_distribuidor    : row[properties[7]]    ?  row[properties[7]].toString() : '',
            dni_vendedor_distribuidor       : row[properties[8]]    ?  row[properties[8]].toString() : '',
            nombre_vendedor_distribuidor    : row[properties[9]]    ? row[properties[9]].toString() : '',
            codigo_producto                 : row[properties[10]]   ? row[properties[10]].toString().trim() : '',
            descripcion_producto            : row[properties[11]]   ? row[properties[11]].toString().replace(/\r\n+/g, ' ') : '',
            cantidad                        : row[properties[12]]   ? row[properties[12]].toString() : '',
            cod_unidad_medida               : cod_unidad_medida,
            unidad_medida                   : unidad_medida,
            precio_unitario                 : precio_unitario,
            precio_total_sin_igv            : row[properties[15]] === 0 ? '0' : row[properties[15]].toString(),
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

    return { messages_error, add_dt_manuales, borrar_data, data, codcli_esp, cods_dts }
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