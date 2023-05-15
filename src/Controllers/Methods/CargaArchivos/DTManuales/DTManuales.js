const controller = {}
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

controller.MetDTManuales = async (req, res) => {

    const file = req.files.carga_manual
    
    const workbook  = XLSX.read(file.data)
    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval:""})

    try{

        const data = rows.map((row, pos) => {

            let properties = Object.keys(rows[0])

                return {
                    
                    proid                           : null,
                    codigo_distribuidor             : row[properties[0]] ?  row[properties[1]].toString() : '',
                    fecha                           : row[properties[1]] ?  row[properties[2]].toString() : '',
                    nro_factura                     : row[properties[2]] ?  row[properties[3]].toString() : '',
                    codigo_cliente                  : row[properties[3]] ?  row[properties[4]].toString() : '',
                    ruc                             : row[properties[4]] ?  row[properties[5]].toString() : '',
                    razon_social                    : row[properties[5]] ?  row[properties[6]].toString() : '',
                    mercado_categoria_tipo          : row[properties[6]] ?  row[properties[7]].toString() : '',
                    codigo_vendedor_distribuidor    : row[properties[7]] ?  row[properties[8]].toString() : '',
                    dni_vendedor_distribuidor       : row[properties[8]] ?  row[properties[9]].toString() : '',
                    nombre_vendedor_distribuidor    : row[properties[9]] ? row[properties[10]].toString() : '',
                    codigo_producto                 : row[properties[10]] ? row[properties[11]].toString() : '',
                    descripcion_producto            : row[properties[11]] ? row[properties[12]].toString() : '',
                    cantidad                        : row[properties[12]] ? row[properties[13]].toString() : '',
                    unidad_medida                   : row[properties[13]] ? row[properties[14]].toString() : '',
                    precio_unitario                 : row[properties[14]] ? row[properties[15]].toString() : '',
                    precio_total_sin_igv            : row[properties[15]] ? row[properties[16]].toString() : '',
                    desde                           : row[properties[16]] ? row[properties[16]].toString() : '',
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
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
}


module.exports = controller