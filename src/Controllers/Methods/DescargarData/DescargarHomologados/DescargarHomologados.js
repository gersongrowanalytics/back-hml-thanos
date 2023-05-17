const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const XLSX = require('xlsx');

controller.MetDescargarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        const productos_hml = await prisma.master_productos_so.findMany({
            where: {
                proid : {
                    not: null
                }
            },
            select: {
                master_distribuidoras: {
                    select: {
                        codigo_dt : true,
                        nomb_cliente : true
                    }
                },
                master_productos: {
                    select: {
                        
                    }
                },
                
            },
            
        })

        // Crea un nuevo libro de Excel
        const workbook = XLSX.utils.book_new();

        // Crea una hoja de cálculo y asigna los datos al libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Convierte el libro de Excel en un archivo binario
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Establece las cabeceras de la respuesta HTTP para descargar el archivo
        res.setHeader('Content-Disposition', 'attachment; filename="datos.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Envía el archivo binario como respuesta
        res.send(excelBuffer);


    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de descargar los productos homologados',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller