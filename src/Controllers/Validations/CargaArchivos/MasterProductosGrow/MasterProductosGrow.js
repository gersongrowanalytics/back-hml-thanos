const controller = {}
const XLSX = require('xlsx')
const MasterProductosGrowController = require('../../../Methods/CargaArchivos/MasterProductosGrow/MasterProductosGrow')

controller.ValMasterProductosGrow = async ( req, res ) => {
    
    const {
        req_action_file,
        req_plataforma
    } = req.body
    
    try{

        const file = req.files.maestra_producto
        const data  = []

        const workbook = XLSX.read(file.data)
        if(!workbook.Sheets['Hoja1']){
            res.status(500).json({
                response    : false,
                message     : 'Lo sentimos no se encontró la hoja con nombre "Hoja1"',
                notificaciones : []
            })
            return false
        }

        const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})
        let properties  = Object.keys(rows[0])


        for await (const row of rows){

            data.push({
                cod_organizacion            : row[properties[0]]    ?  row[properties[0]].toString() : '',
                organizacion_venta          : row[properties[1]]    ?  row[properties[1]].toString() : '',
                codigo_division             : row[properties[2]]    ?  row[properties[2]].toString() : '',
                division                    : row[properties[3]]    ?  row[properties[3]].toString() : '',
                codigo_material             : row[properties[4]]    ?  row[properties[4]].toString() : '',
                material_softys             : row[properties[5]]    ?  row[properties[5]].toString() : '',
                categoria_softys            : row[properties[6]]    ?  row[properties[6]].toString() : '',
                categoria_marketing         : row[properties[7]]    ?  row[properties[7]].toString() : '',
                codigo_sector               : row[properties[8]]    ?  row[properties[8]].toString() : '',
                sector                      : row[properties[9]]    ?  row[properties[9]].toString() : '',
                codigo_segmentacion         : row[properties[10]]    ?  row[properties[10]].toString() : '',
                segmentacion                : row[properties[11]]    ?  row[properties[11]].toString() : '',
                codigo_presentacion         : row[properties[12]]    ?  row[properties[12]].toString() : '',
                presentacion                : row[properties[13]]    ?  row[properties[13]].toString() : '',
                codigo_marca                : row[properties[14]]    ?  row[properties[14]].toString() : '',
                marca                       : row[properties[15]]    ?  row[properties[15]].toString() : '',
                codigo_formato              : row[properties[16]]    ?  row[properties[16]].toString() : '',
                formato                     : row[properties[17]]    ?  row[properties[17]].toString() : '',
                codigo_talla                : row[properties[18]]    ?  row[properties[18]].toString() : '',
                talla                       : row[properties[19]]    ?  row[properties[19]].toString() : '',
                codigo_conteo               : row[properties[20]]    ?  row[properties[20]].toString() : '',
                conteo                      : row[properties[21]]    ?  row[properties[21]].toString() : '',
                subcategoria_marketing      : row[properties[22]]    ?  row[properties[22]].toString() : '',
                division_softys             : row[properties[23]]    ?  row[properties[23]].toString() : '',
                subcategoria                : row[properties[24]]    ?  row[properties[24]].toString() : '',
                disponible_softys           : row[properties[25]]    ?  row[properties[25]].toString() : '',
                peso_kg                     : row[properties[26]]    ?  parseFloat(row[properties[26]]) : null,
                factor_bultos               : row[properties[27]]    ?  parseFloat(row[properties[27]]) : null,
                paquetes_bulto              : row[properties[28]]    ?  parseFloat(row[properties[28]]) : null,
                factor_unidad_minima        : row[properties[29]]    ?  parseFloat(row[properties[29]]) : null,
                factor_toneladas            : row[properties[30]]    ?  parseFloat(row[properties[30]]) : null,
                factor_miles                : row[properties[31]]    ?  parseFloat(row[properties[31]]) : null,
                estado                      : row[properties[33]]    ?  row[properties[32]].toString() : '',
                unidades_hojas              : row[properties[33]]    ?  parseFloat(row[properties[33]]) : null,
                metros_unidad               : row[properties[34]]    ?  parseFloat(row[properties[34]]) : null,
                disponible                  : row[properties[35]]    ?  row[properties[35]].toString() : '',
            })
        }

        MasterProductosGrowController.MetMasterProductosGrow(req, res, data)

    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al cargar master productos grow',
            notificaciones : []
        })
        return false
    }
}

module.exports = controller