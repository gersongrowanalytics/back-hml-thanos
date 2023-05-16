const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetMasterMateriales = async (req, res) => {

    const file = req.files.maestra_producto
    
    const workbook  = XLSX.read(file.data)
    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})

    try{

        const data = rows.map((row, pos) => {

            let properties = Object.keys(rows[0])

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
            }

        );

        await prisma.master_productos.createMany({
            data
        });
        
        res.status(200).json({
            message : 'Datos cargas exitosamente',
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de cargar los datos',
            devmsg  : error
        })
    }
}


module.exports = controller