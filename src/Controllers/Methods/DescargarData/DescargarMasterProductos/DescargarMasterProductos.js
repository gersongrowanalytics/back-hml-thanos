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

        let data_excel = []

        master_productos.map((product) => {
            data_excel.push({
                "CODIGOPRODUCTO" : product.cod_producto,
                "NOMBREPRODUCTO" : product.nomb_producto,
                "DIVISION" : product.division,
                "SECTOR" : product.sector,
                "CATEGORIA" : product.categoria,
                "SUBCATEGORIA" : product.subcategoria,
                "SEGMENTO" : product.segmento,
                "PRESENTACION" : product.presentacion,
                "PESO" : product.peso,
                "PAQUETEXBULTO" : product.paquetexbulto,
                "UNIDADXPQTE" : product.unidadxpqte,
                "MTSXUND" : product.metroxund,
                "EAN13" : product.ean13,
                "EAN14" : product.ean14,
                "MINUND" : product.minund,
                "ESTADO" : product.estado,
                "MARCA" : product.marco,
            })
        })


        const encabezado = ['CODIGOPRODUCTO', 'NOMBREPRODUCTO', 'DIVISION', 'SECTOR', 'CATEGORIA', 'SUBCATEGORIA', 'SEGMENTO', 'PRESENTACION', 'PESO', 'PAQUETEXBULTO', 'UNIDADXPQTE', 'MTSXUND', 'EAN13', 'EAN14', 'MINUND', 'ESTADO', 'MARCA']
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(data_excel, encabezado)

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
        
        const nombre_excel = 'Maestra Productos-'+Math.random().toString(24).substr(2, 6)+'.xlsx';
        // const ubicacion_excel = 'src/public/DescargarData/Maestra Productos/'+nombre_excel
        const ubicacion_excel = 'public/DescargarData/Maestra Productos/'+nombre_excel

        XLSX.writeFile(workbook, ubicacion_excel)

        res.status(200)
        res.json({
            message : 'Se descargó exitosamente.',
            respuesta : true,
            data : nombre_excel
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