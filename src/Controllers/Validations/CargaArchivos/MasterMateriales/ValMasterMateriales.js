const controller = {}
const XLSX = require('xlsx')
const MasterDTController = require('../../../Methods/CargaArchivos/MasterMateriales/MasterMateriales')

controller.ValMasterMateriales = async (req, res) => {

    const {
        req_action_file
    } = req.body

    const file = req.files.maestra_producto
    
    try{

        const action_file = JSON.parse(req_action_file)
        const { exists_data, message, status, workbook } = await controller.ValExistsData(file)

        if(!exists_data){
            res.status(status)
            return res.json({
                message,
            })
        }

        const { messages_error, add_products, data } = await controller.ValCellsFile(workbook)

        if(!add_products){
            await MasterDTController.MetMasterMateriales(req, res, null, true, messages_error)
            res.status(500)
            return res.json({
                message : 'Lo sentimos se encontraron algunas observaciones',
                messages_error : messages_error,
                respuesta : false
            })
        }

        if(action_file.process_data){
            MasterDTController.MetMasterMateriales(req, res, data, false)
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

    let add_products = true
    let messages_error_cod_producto = false
    let messages_error_nomb_producto = false
    let messages_error = []

    const data = rows.map((row, pos) => {

        let properties = Object.keys(rows[0])

        if(!row[properties[0]]){
            add_products = false
            if(!messages_error_cod_producto){
                messages_error_cod_producto = true
                messages_error.push("Lo sentimos, algunos códigos se encuentran vacios")
            }
        }

        if(!row[properties[1]]){
            add_products = false
            if(!messages_error_nomb_producto){
                messages_error_nomb_producto = true
                messages_error.push("Lo sentimos, algunos nombres de productos se encuentran vacios")
            }
        }

        return {
            
            cod_producto    : row[properties[0]] ?  row[properties[0]].toString() : '',
            nomb_producto   : row[properties[1]] ?  row[properties[1]].toString() : '',
            division        : row[properties[2]] ?  row[properties[2]].toString() : '',
            sector          : row[properties[3]] ?  row[properties[3]].toString() : '',
            categoria       : row[properties[4]] ?  row[properties[4]].toString() : '',
            subcategoria    : row[properties[5]] ?  row[properties[5]].toString() : '',
            segmento        : row[properties[6]] ?  row[properties[6]].toString() : '',
            presentacion    : row[properties[7]] ?  row[properties[7]].toString() : '',
            peso            : row[properties[8]] ?  row[properties[8]].toString() : '',
            paquetexbulto   : row[properties[9]] ?  row[properties[9]].toString() : '',
            unidadxpqte     : row[properties[10]] ? row[properties[10]].toString() : '',
            metroxund       : row[properties[11]] ? row[properties[11]].toString() : '',
            ean13           : row[properties[12]] ? row[properties[12]].toString() : '',
            ean14           : row[properties[13]] ? row[properties[13]].toString() : '',
            minund          : row[properties[14]] ? row[properties[14]].toString() : '',
            estado          : row[properties[15]] ? row[properties[15]].toString() : '',
            marco           : row[properties[16]] ? row[properties[16]].toString() : '',
        }
    });

    return { messages_error, add_products,  data }

}

module.exports = controller