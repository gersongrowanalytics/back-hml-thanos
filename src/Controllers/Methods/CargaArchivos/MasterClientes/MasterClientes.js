const controller = {}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx')

controller.MetMasterClientes = async (req, res) => {

    const file = req.files.maestra_cliente;

    if (!file) {
        return res.status(400).send('No se ha subido ningún archivo');
    }

    const workbook  = XLSX.read(file.data)
    const worksheet = workbook.Sheets['Hoja1']
    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets['Hoja1'], {defval:""})


    try{
        // console.log(worksheet)

        console.log(rows)
        const data = rows.map((row, pos) => {

            // console.log(row)

            let properties = Object.keys(rows[0])

            // console.log(row[properties[16]])

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
            }

        );

        await prisma.master_distribuidoras.createMany({
            data
        });

        res.status(200).json({
            message : 'Datos cargas exitosamente',
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de cargar los datos del excel',
            devmsg  : error
        })
    }
}


module.exports = controller