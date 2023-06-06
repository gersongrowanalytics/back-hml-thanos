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

        if(!add_clients){
            await MasterClientesController.MetMasterClientes(req, res, null, true, messages_error)
            res.status(500)
            return res.json({
                message : 'Lo sentimos se encontraron algunas observaciones',
                messages_error : messages_error,
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
    let messages_error_cod_client = false
    let messages_error_nomb_client = false
    let messages_error = []

    const data = rows.map((row, pos) => {

        let properties = Object.keys(rows[0])

        if(!row[properties[0]]){
            add_clients = false
            if(!messages_error_cod_client){
                messages_error_cod_client = true
                messages_error.push("Lo sentimos, algunos códigos se encuentran vacios")
            }
        }

        if(!row[properties[4]]){
            add_clients = false
            if(!messages_error_nomb_client){
                messages_error_nomb_client = true
                messages_error.push("Lo sentimos, algunos nombres de clientes se encuentran vacios")
            }
        }

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

module.exports = controller