const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const CheckFile = require('../../S3/CheckFileS3')
const UploadFile = require('../../S3/UploadFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarMasterProductos = async (req, res) => {

    const {  } = req.body

    try{
        const nombre_archivo = 'Maestra Productos'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/maaestraproductos/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
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
                const { cod_producto, nomb_producto, division, sector, categoria, subcategoria, segmento, presentacion, peso, paquetexbulto, unidadxpqte, metroxund, ean13, ean14, minund, estado, marco } = product
                data_excel.push({
                    "CODIGOPRODUCTO" : cod_producto ? cod_producto : '',
                    "NOMBREPRODUCTO" : nomb_producto ? nomb_producto : '',
                    "DIVISION" : division ? division : '',
                    "SECTOR" : sector ? sector : '',
                    "CATEGORIA" : categoria ? categoria : '',
                    "SUBCATEGORIA" : subcategoria ? subcategoria : '',
                    "SEGMENTO" : segmento ? segmento : '',
                    "PRESENTACION" : presentacion ? presentacion : '',
                    "PESO" : peso ? peso : '',
                    "PAQUETEXBULTO" : paquetexbulto ? paquetexbulto : '',
                    "UNIDADXPQTE" : unidadxpqte ? unidadxpqte : '',
                    "MTSXUND" : metroxund ? metroxund : '',
                    "EAN13" : ean13 ? ean13 : '',
                    "EAN14" : ean14 ? ean14 : '',
                    "MINUND" : minund ? minund : '',
                    "ESTADO" : estado ? estado : '',
                    "MARCA" : marco ? marco : '',
                })
            })

            const encabezado = ['CODIGOPRODUCTO', 'NOMBREPRODUCTO', 'DIVISION', 'SECTOR', 'CATEGORIA', 'SUBCATEGORIA', 'SEGMENTO', 'PRESENTACION', 'PESO', 'PAQUETEXBULTO', 'UNIDADXPQTE', 'MTSXUND', 'EAN13', 'EAN14', 'MINUND', 'ESTADO', 'MARCA']
            
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Datos')

            const headerStyle = {
                font: {
                    color: { argb: 'ffffff' },
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '4472C4' },
                },
            }

            const cellStylePar = {
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'D9E1F2' },
                },
            }

            const cellStyleImpar = {
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF' },
                },
            }

            const columnA = worksheet.getColumn(1)
            columnA.width = 20
            const columnB = worksheet.getColumn(2)
            columnB.width = 25
            const columnC = worksheet.getColumn(3)
            columnC.width = 25
            const columnD = worksheet.getColumn(4)
            columnD.width = 25
            const columnE = worksheet.getColumn(5)
            columnE.width = 25
            const columnF = worksheet.getColumn(6)
            columnF.width = 20
            const columnG = worksheet.getColumn(7)
            columnG.width = 25
            const columnH = worksheet.getColumn(8)
            columnH.width = 20
            const columnI = worksheet.getColumn(9)
            columnI.width = 25

            const headerRow = worksheet.addRow(encabezado)
            headerRow.eachCell((cell) => {
                cell.fill = headerStyle.fill
                cell.font = headerStyle.font
                cell.border = {
                    top: {style:'thin', color: {argb:'8EA9DB'}},
                    left: {style:'thin', color: {argb:'8EA9DB'}},
                    bottom: {style:'thin', color: {argb:'8EA9DB'}},
                    right: {style:'thin', color: {argb:'8EA9DB'}}
                }
            })

            data_excel.forEach((row, index) => {
                const rowData = Object.values(row)
                const dataRow = worksheet.addRow(rowData)
                if(index % 2 === 0){
                    dataRow.eachCell((cell) => {
                        cell.border = {
                            top: {style:'thin', color: {argb:'8EA9DB'}},
                            bottom: {style:'thin', color: {argb:'8EA9DB'}}
                        }
                        cell.fill = cellStylePar.fill
                    })
                }else{
                    dataRow.eachCell((cell) => {
                        cell.border = {
                            right: {style:'thin', color: {argb:'D9D9D9'}},
                            left: {style:'thin', color: {argb:'D9D9D9'}}
                        }
                        cell.fill = cellStyleImpar.fill
                    })
                }
            })

            const archivoExcel = await workbook.xlsx.writeBuffer()

            await UploadFile.UploadFileS3(archivoExcel, ubicacion_s3)
            console.log("Se guardo el s3 Maestra Productos");
            
        }

        const url = await GenerateUrl.GenerateUrlS3(ubicacion_s3)
        console.log("Se genero url correctamente")

        res.status(200)
        res.json({
            message : 'Se descargó exitosamente.',
            respuesta : true,
            data: url
        })
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