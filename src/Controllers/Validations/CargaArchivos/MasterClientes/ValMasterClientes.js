const controller = {}
const XLSX = require('xlsx')
const MasterClientesController = require('../../../Methods/CargaArchivos/MasterClientes/MasterClientes')

controller.ValMasterClientes = async (req, res) => {

    const {
        req_action_file
    } = req.body

    const file = req.files.maestra_cliente;

    try{
        
        const action_file = JSON.parse(req_action_file)
        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }

        const { messages_error, add_clients, data } = await controller.ValCellsFile(workbook)

        const messages = messages_error.flatMap(mess => mess.notificaciones.map(notif=> notif.msg))

        if(!add_clients){
            await MasterClientesController.MetMasterClientes(req, res, null, true, messages_error)
            res.status(500)
            return res.json({
                message : 'Lo sentimos se encontraron algunas observaciones',
                messages_error : messages,
                notificaciones : messages_error,
                respuesta : false
            })
        }

        if(action_file.process_data){
            MasterClientesController.MetMasterClientes(req, res, data, false)
        }else{
            res.status(200).json({
                respuesta   : false,
                message     : 'Se ha validado la data correctamente'
            })
        }

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de..',
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

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})

    let add_clients = true
    let messages_error = []

    const columns_name = [
        { value : 0, name : 'CodigoDistribuidor' },
        { value : 1, name : 'Region' },
        { value : 2, name : 'Supervisor' },
        { value : 3, name : 'Localidad' },
        { value : 4, name : 'NombreDistribuidor' },
    ]

    let num_row = 1
    const data = rows.map((row, pos) => {

        let properties = Object.keys(rows[0])

        if(!row[properties[0]]){
            add_clients = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[0]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[0]['name'], num_row, 'empty')
        }

        if(!row[properties[4]]){
            add_clients = false
            let rows_error  = messages_error.findIndex(mes => mes.columna == columns_name[4]['name'])
            controller.ValAddMessageLog(rows_error, messages_error, columns_name[4]['name'], num_row, 'empty')
        }

        num_row = num_row + 1
        return {
            
            codigo_dt           : row[properties[0]] ?  row[properties[0]].toString() : '',
            region              : row[properties[1]] ? row[properties[1]].toString() : '',
            supervisor          : row[properties[2]] ? row[properties[2]].toString() : '',
            localidad           : row[properties[3]] ? row[properties[3]].toString() : '',
            nomb_dt             : row[properties[4]] ? row[properties[4]].toString() : '',
            check_venta         : row[properties[5]] ? row[properties[5]].toString() : '',
            nomb_cliente        : row[properties[6]] ? row[properties[6]].toString() : '',
            latitud             : row[properties[7]] ? row[properties[7]].toString() : '',
            longitud            : row[properties[8]] ? row[properties[8]].toString() : '',
            oficina_two         : row[properties[9]] ? row[properties[9]].toString() : '',
            subcanal            : row[properties[10]] ? row[properties[10]].toString() : '',
            sap_solicitante     : row[properties[11]] ? row[properties[11]].toString() : '',
            sap_destinatario    : row[properties[12]] ? row[properties[12]].toString() : '',
            diferencial         : row[properties[13]] ? row[properties[13]].toString() : '',
            canal_atencion      : row[properties[14]] ? row[properties[14]].toString() : '',
            cod_solicitante     : row[properties[15]] ? row[properties[15]].toString() : '',
            cod_destinatario    : row[properties[16]] ? row[properties[16]].toString() : '',
            canal_trade         : row[properties[17]] ? row[properties[17]].toString() == 'NULL'? '' : row[properties[17]].toString() : '',
        }
    })

    return { messages_error, add_clients, data }
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
        let index_type_error = messages_error[rows_error]['notificaciones'].findIndex(typ => typ.type == type)

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