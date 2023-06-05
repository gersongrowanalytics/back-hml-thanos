const controller = {}
const XLSX = require('xlsx')
const MasterClientesGrowController = require('../../../Methods/CargaArchivos/MasterClientesGrow/MasterClientesGrow')

controller.ValMasterClientesGrow = async ( req, res ) => {
    
    try{

        const file = req.files.masterclientes_grow
        const data  = []

        const workbook = XLSX.read(file.data)
        if(!workbook.Sheets['Hoja1']){
            res.status(500).json({
                response    : false,
                message     : 'Ha ocurrido un error al cargar master clientes grow'
            })
        }

        const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})
        let properties  = Object.keys(rows[0])


        for await (const row of rows){

            data.push({
                cod_organizacion        : row[properties[0]]    ?  row[properties[0]].toString() : '',
                organizacion_venta      : row[properties[1]]    ?  row[properties[1]].toString() : '',
                codigo_division         : row[properties[2]]    ?  row[properties[2]].toString() : '',
                division                : row[properties[3]]    ?  row[properties[3]].toString() : '',
                codigo_destinatario     : row[properties[4]]    ?  row[properties[4]].toString() : '',
                destinatario            : row[properties[5]]    ?  row[properties[5]].toString() : '',
                codigo_solicitante      : row[properties[6]]    ?  row[properties[6]].toString() : '',
                solicitante             : row[properties[7]]    ?  row[properties[7]].toString() : '',
                ruc                     : row[properties[8]]    ?  row[properties[8]].toString() : '',
                cliente_hml             : row[properties[9]]    ?  row[properties[9]].toString() : '',
                grupo_cliente_hml       : row[properties[10]]    ?  row[properties[10]].toString() : '',
                sucursal_hml            : row[properties[11]]    ?  row[properties[11]].toString() : '',
                supervisor              : row[properties[12]]    ?  row[properties[12]].toString() : '',
                territorio              : row[properties[13]]    ?  row[properties[13]].toString() : '',
                zona                    : row[properties[14]]    ?  row[properties[14]].toString() : '',
                canal_atencion          : row[properties[15]]    ?  row[properties[15]].toString() : '',
                segmento_cliente        : row[properties[16]]    ?  row[properties[16]].toString() : '',
                subsegmento             : row[properties[17]]    ?  row[properties[17]].toString() : '',
                tipo_atencion           : row[properties[18]]    ?  row[properties[18]].toString() : '',
                segmento_regional       : row[properties[19]]    ?  row[properties[19]].toString() : '',
                conexion                : row[properties[20]]    ?  row[properties[20]].toString() : '',
                estado                  : row[properties[21]]    ?  row[properties[21]].toString() : '',
                codigo_pais             : row[properties[22]]    ?  row[properties[22]].toString() : '',
                pais                    : row[properties[23]]    ?  row[properties[23]].toString() : '',
                codigo_departamento     : row[properties[24]]    ?  row[properties[24]].toString() : '',
                departamento            : row[properties[25]]    ?  row[properties[25]].toString() : '',
                codigo_provincia        : row[properties[26]]    ?  row[properties[26]].toString() : '',
                provincia               : row[properties[27]]    ?  row[properties[27]].toString() : '',
                codigo_distrito         : row[properties[28]]    ?  row[properties[28]].toString() : '',
                distrito                : row[properties[29]]    ?  row[properties[29]].toString() : '',
                direccion               : row[properties[30]]    ?  row[properties[30]].toString() : '',
                zona_venta              : row[properties[31]]    ?  row[properties[31]].toString() : '',
            })
        }

        MasterClientesGrowController.MetMasterClientesGrow(req, res, data)

        res.status(200).json({
            response    : true,
            message     : 'Se cargó master clientes grow correctamente'
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master clientes grow'
        })
    }
}

module.exports = controller