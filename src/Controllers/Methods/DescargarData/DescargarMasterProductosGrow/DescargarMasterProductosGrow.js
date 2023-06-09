const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarMasterProductosGrow = async (req, res) => {

    const {  } = req.body;

    try{

        const nombre_archivo = 'Master Productos'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/masterproductosgrow/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(true){
            const master_productos_grow = await prisma.master_productos_grow.findMany({
                select: {
                    id: true,
                    cod_organizacion: true,
                    organizacion_venta: true,
                    codigo_division: true,
                    division: true,
                    codigo_material: true,
                    material_softys: true,
                    categoria_softys: true,
                    categoria_marketing: true,
                    codigo_sector: true,
                    sector: true,
                    codigo_segmentacion: true,
                    segmentacion: true,
                    codigo_presentacion: true,
                    presentacion: true,
                    codigo_marca: true,
                    marca: true,
                    codigo_formato: true,
                    formato: true,
                    codigo_talla: true,
                    talla: true,
                    codigo_conteo: true,
                    conteo: true,
                    subcategoria_marketing: true,
                    division_softys: true,
                    subcategoria: true,
                    disponible_softys: true,
                    peso_kg: true,
                    factor_bultos: true,
                    paquetes_bulto: true,
                    factor_unidad_minima: true,
                    factor_toneladas: true,
                    factor_miles: true,
                    estado: true,
                    unidades_hojas: true,
                    metros_unidad: true,
                    disponible: true,
                },
            })

            let data_excel = []
            await master_productos_grow.map(mpg => {
                data_excel.push({
                    "CODIGO ORGANIZACIÓN VENTAS": mpg.cod_organizacion ?  mpg.cod_organizacion : '',
                    "ORGANIZACIÓN VENTAS": mpg.organizacion_venta ?  mpg.organizacion_venta : '',
                    "CODIGO DIVISION": mpg.codigo_division ?  mpg.codigo_division : '',
                    "DIVISION": mpg.division ?  mpg.division : '',
                    "CODIGO MATERIAL": mpg.codigo_material ?  mpg.codigo_material : '',
                    "MATERIAL_SOFTYS": mpg.material_softys ?  mpg.material_softys : '',
                    "CATEGORIA SOFTYS": mpg.categoria_softys ?  mpg.categoria_softys : '',
                    "CATEGORIA MARKETING": mpg.categoria_marketing ?  mpg.categoria_marketing : '',
                    "CODIGO SECTOR": mpg.codigo_sector ?  mpg.codigo_sector : '',
                    "SECTOR": mpg.sector ?  mpg.sector : '',
                    "CODIGO SEGMENTACION": mpg.codigo_segmentacion ?  mpg.codigo_segmentacion : '',
                    "SEGMENTACIÓN": mpg.segmentacion ?  mpg.segmentacion : '',
                    "CODIGO PRESENTACION": mpg.codigo_presentacion ?  mpg.codigo_presentacion : '',
                    "PRESENTACIÓN": mpg.presentacion ?  mpg.presentacion : '',
                    "CODIGO MARCA": mpg.codigo_marca ?  mpg.codigo_marca : '',
                    "MARCA": mpg.marca ?  mpg.marca : '',
                    "CODIGO FORMATO": mpg.codigo_formato ?  mpg.codigo_formato : '',
                    "FORMATO": mpg.formato ?  mpg.formato : '',
                    "CODIGO TALLA": mpg.codigo_talla ?  mpg.codigo_talla : '',
                    "TALLA": mpg.talla ?  mpg.talla : '',
                    "CODIGO CONTEO": mpg.codigo_conteo ?  mpg.codigo_conteo : '',
                    "CONTEO": mpg.conteo ?  mpg.conteo : '',
                    "SUBCATEGORIA MARKETING": mpg.subcategoria_marketing ?  mpg.subcategoria_marketing : '',
                    "DIVISION SOFTYS": mpg.division_softys ?  mpg.division_softys : '',
                    "SUBCATEGORÍA": mpg.subcategoria ?  mpg.subcategoria : '',
                    "DISPONIBLE SOFTYS": mpg.disponible_softys ?  mpg.disponible_softys : '',
                    "PESO KG": mpg.peso_kg ?  mpg.peso_kg : '',
                    "FACTOR A BULTOS": mpg.factor_bultos ?  mpg.factor_bultos : '',
                    "PAQUETES X BULTO": mpg.paquetes_bulto ?  mpg.paquetes_bulto : '',
                    "FACTOR A UNIDAD MÍNIMA INDIVISIBLE": mpg.factor_unidad_minima ?  mpg.factor_unidad_minima : '',
                    "FACTOR A TONELADAS": mpg.factor_toneladas ?  mpg.factor_toneladas : '',
                    "FACTOR A MILES DE UNIDADES": mpg.factor_miles ?  mpg.factor_miles : '',
                    "ESTADO": mpg.estado ?  mpg.estado : '',
                    "UNIDADES / HOJAS X PAQUETE": mpg.unidades_hojas ?  mpg.unidades_hojas : '',
                    "METROS X UNIDAD": mpg.metros_unidad ?  mpg.metros_unidad : '',
                    "DISPONIBLE": mpg.disponible ?  mpg.disponible : '',
                })
            })

            const encabezado = ['CODIGO ORGANIZACIÓN VENTAS', 'ORGANIZACIÓN VENTAS', 'CODIGO DIVISION', 'DIVISION', 'CODIGO MATERIAL', 'MATERIAL_SOFTYS', 'CATEGORIA SOFTYS', 'CATEGORIA MARKETING', 'CODIGO SECTOR', 'SECTOR', 'CODIGO SEGMENTACION', 'SEGMENTACIÓN', 'CODIGO PRESENTACION', 'PRESENTACIÓN', 'CODIGO MARCA', 'MARCA', 'CODIGO FORMATO', 'FORMATO', 'CODIGO TALLA', 'TALLA', 'CODIGO CONTEO', 'CONTEO', 'SUBCATEGORIA MARKETING', 'DIVISION SOFTYS', 'SUBCATEGORÍA', 'DISPONIBLE SOFTYS', 'PESO KG', 'FACTOR A BULTOS', 'PAQUETES X BULTO', 'FACTOR A UNIDAD MÍNIMA INDIVISIBLE', 'FACTOR A TONELADAS', 'FACTOR A MILES DE UNIDADES', 'ESTADO', 'UNIDADES / HOJAS X PAQUETE', 'METROS X UNIDAD', 'DISPONIBLE']

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos')

            const arrayWidth = [
                {key: 1, width: 25},
                {key: 2, width: 20},
                {key: 3, width: 20},
                {key: 4, width: 15},
                {key: 5, width: 20},
                {key: 6, width: 30},
                {key: 7, width: 20},
                {key: 8, width: 25},
                {key: 9, width: 20},
                {key: 10, width: 20},
                {key: 11, width: 25},
                {key: 12, width: 20},
                {key: 13, width: 25},
                {key: 14, width: 20},
                {key: 15, width: 20},
                {key: 16, width: 15},
                {key: 17, width: 20},
                {key: 18, width: 15},
                {key: 19, width: 20},
                {key: 20, width: 15},
                {key: 21, width: 20},
                {key: 22, width: 15},
                {key: 23, width: 25},
                {key: 24, width: 20},
                {key: 25, width: 25},
                {key: 26, width: 20},
                {key: 27, width: 20},
                {key: 28, width: 20},
                {key: 29, width: 20},
                {key: 30, width: 30},
                {key: 31, width: 25},
                {key: 32, width: 25},
                {key: 33, width: 15},
                {key: 34, width: 25},
                {key: 35, width: 20},
                {key: 36, width: 15},
            ]

            arrayWidth.map(aw => {
                const column = worksheet.getColumn(aw.key)
                column.width = aw.width
            })

            const styleHeaderBody = [
                {key: 1, color: { argb: '000000' }, background: { argb: 'F2F2F2' }, body: { argb: 'F2F2F2' }},
                {key: 2, color: { argb: '000000' }, background: { argb: 'F2F2F2' }, body: { argb: 'F2F2F2' }},
                {key: 3, color: { argb: '000000' }, background: { argb: 'F2F2F2' }, body: { argb: 'F2F2F2' }},
                {key: 4, color: { argb: '000000' }, background: { argb: 'F2F2F2' }, body: { argb: 'F2F2F2' }},
                {key: 5, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 6, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 7, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 8, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 9, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 10, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 11, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 12, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 13, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 14, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 15, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 16, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 17, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 18, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 19, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 20, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 21, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 22, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 23, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 24, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 25, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 26, color: { argb: 'FFFFFF' }, background: { argb: '806000' }, body: { argb: 'FFFFFF' }},
                {key: 27, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 28, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 29, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 30, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 31, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 32, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 33, color: { argb: '000000' }, background: { argb: 'FFC000' }, body: { argb: 'FFFFFF' }},
                {key: 34, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 35, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 36, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
            ]

            const headerRow = worksheet.addRow(encabezado)
            headerRow.eachCell((cell, index) => {
                styleHeaderBody.find(sh => {
                    if(sh.key == index){
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: sh.background,
                        }
                        cell.font = {
                            color: sh.color,
                            bold: true,
                            size: 11,
                        }
                        cell.border = {
                            top: {style:'thin', color: {argb:'8EA9DB'}},
                            bottom: {style:'thin', color: {argb:'8EA9DB'}},
                            left: null,
                            right: null,
                        }
                    }
                })
            })

            data_excel.forEach((row) => {
                const rowData = Object.values(row)
                const dataRow = worksheet.addRow(rowData)
                dataRow.eachCell((cell, index) => {
                    cell.border = {
                        top: null,
                        bottom: null,
                        left: null,
                        right: null,
                    }
                    cell.font = {
                        size: 11,
                    }
                    styleHeaderBody.find(shb => {
                        if(shb.key == index){
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: shb.body,
                            }
                        }
                    })
                })
            })

            const archivoExcel = await workbook.xlsx.writeBuffer()

            await UploadFile.UploadFileS3(archivoExcel, ubicacion_s3)
            console.log("Se guardo correctamente el s3 Homologados")
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
            message : 'Lo sentimos hubo un error al momento de descargar los productos homologados',
            devmsg  : error,
            respuesta : false
        })
    }
}

module.exports = controller