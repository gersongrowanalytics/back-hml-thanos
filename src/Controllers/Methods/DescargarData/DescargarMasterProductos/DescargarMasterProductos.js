const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const XLSX = require('xlsx')
const fs = require('fs')

controller.MetDescargarMasterProductos = async (req, res) => {

    const {  } = req.body

    try{
        const master_productos = await prisma.master_productos.findMany({
            select: {
                cod_producto: true,
                nomb_producto: true,
                division: true,
                sector: true,
                categoria: true,
                subcategoria: true,
                segmento: true,
                presentacion: true,
                peso: true,
                paquetexbulto: true,
                unidadxpqte: true,
                metroxund: true,
                ean13: true,
                ean14: true,
                minund: true,
                estado: true,
                marco: true,
            },
        })

        const encabezado = ['CODIGOPRODUCTO', 'NOMBREPRODUCTO', 'DIVISION', 'SECTOR', 'CATEGORIA', 'SUBCATEGORIA', 'SEGMENTO', 'PRESENTACION', 'PESO', 'PAQUETEXBULTO', 'UNIDADXPQTE', 'MTSXUND', 'EAN13', 'EAN14', 'MINUND', 'ESTADO', 'MARCA']
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(master_productos, encabezado)

        const styles = {
            header: {
              font: { bold: true },
              fill: { fgColor: { rgb: 'CCCCCC' } },
              alignment: { horizontal: 'center' },
            },
            // cell: {
            //   font: { bold: false, sz: 12 },
            //   fill: { fgColor: { rgb: 'FFFFFF' } },
            //   alignment: { horizontal: 'left' },
            // },
        }

        const columnas = [
            { wch: 15 },{ wch: 30 },{ wch: 20 },{ wch: 20 },{ wch: 20 },{ wch: 25 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },
        ]

        worksheet['!cols'] = columnas

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
        const nombreArchivo = 'MasterProductos.xlsx'
        XLSX.writeFile(workbook, nombreArchivo)

        res.status(200)
        res.json({
            message : 'Se descargó exitosamente.',
            respuesta : true
        })
        // res.download(nombreArchivo)
    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de descargar',
            devmsg  : error,
            respuesta : false
        })
    }
}

module.exports = controller