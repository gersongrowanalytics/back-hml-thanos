const controller = {}
const XLSX = require('xlsx')
const MasterClientesSoftysController = require('../../../Methods/CargaArchivos/MasterClientesSoftys/MasterClientesSoftys')

controller.ValMasterClientesSoftys = async ( req, res ) => {

    try{

        const file = req.files.master_clientes_softys
        const data  = []

        const workbook = XLSX.read(file.data)
        if(!workbook.Sheets['Cliente_SI']){
            res.status(500).json({
                response    : false,
                message     : 'Ha ocurrido un error al cargar master clientes grow'
            })
        }

        const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Cliente_SI'], {defval:""})
        let properties  = Object.keys(rows[0])

        for await (const row of rows){

            data.push({
                cod_sales_organizacion  : row[properties[0]]    ?  row[properties[0]].toString() : '',
                sales_organizacion      : row[properties[1]]    ?  row[properties[1]].toString() : '',
                cod_negocio             : row[properties[2]]    ?  row[properties[2]].toString() : '',
                negocio                 : row[properties[3]]    ?  row[properties[3]].toString() : '',
                cod_ship_to             : row[properties[4]]    ?  row[properties[4]].toString() : '',
                ship_to                 : row[properties[5]]    ?  row[properties[5]].toString() : '',
                cod_sold_to             : row[properties[6]]    ?  row[properties[6]].toString() : '',
                sold_to                 : row[properties[7]]    ?  row[properties[7]].toString() : '',
                hml_cod_cliente         : row[properties[8]]    ?  row[properties[8]].toString() : '',
                hml_cliente             : row[properties[9]]    ?  row[properties[9]].toString() : '',
                hml_cod_subsidiario     : row[properties[10]]    ?  row[properties[10]].toString() : '',
                hml_subsidiario         : row[properties[11]]    ?  row[properties[11]].toString() : '',
                class_one               : row[properties[12]]    ?  row[properties[12]].toString() : '',
                class_two               : row[properties[13]]    ?  row[properties[13]].toString() : '',
                class_three             : row[properties[14]]    ?  row[properties[14]].toString() : '',
                class_four              : row[properties[15]]    ?  row[properties[15]].toString() : '',
                class_five              : row[properties[16]]    ?  row[properties[16]].toString() : '',
                class_six               : row[properties[17]]    ?  row[properties[17]].toString() : '',
                class_seven             : row[properties[18]]    ?  row[properties[18]].toString() : '',
                class_eight             : row[properties[19]]    ?  row[properties[19]].toString() : '',
                class_nine              : row[properties[20]]    ?  row[properties[20]].toString() : '',
                class_ten               : row[properties[21]]    ?  row[properties[21]].toString() : '',
                hml_cod_pais            : row[properties[22]]    ?  row[properties[22]].toString() : '',
                hml_pais                : row[properties[23]]    ?  row[properties[23]].toString() : '',
                hml_cod_departamento    : row[properties[24]]    ?  row[properties[24]].toString() : '',
                hml_departamento        : row[properties[25]]    ?  row[properties[25]].toString() : '',
                hml_cod_provincia       : row[properties[26]]    ?  row[properties[26]].toString() : '',
                hml_provincia           : row[properties[27]]    ?  row[properties[27]].toString() : '',
                hml_cod_distrito        : row[properties[28]]    ?  row[properties[28]].toString() : '',
                hml_distrito            : row[properties[29]]    ?  row[properties[29]].toString() : '',
                hml_direccion           : row[properties[30]]    ?  row[properties[30]].toString() : '',
            })
        }

        MasterClientesSoftysController.MetMasterClientesSoftys(req, res, data)

    }catch(err){
        console.log(err)
        return res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar la maestra de clientes softys'
        })
    }
}

module.exports = controller