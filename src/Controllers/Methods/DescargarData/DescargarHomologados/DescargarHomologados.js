const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarHomologados = async (req, res) => {

    const {  } = req.body;

    try{

        const nombre_archivo = 'Master Productos So'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/masterproductosso/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
            const productos_so = await prisma.master_productos_so.findMany({
                // where: {
                //     proid : {
                //         not: null
                //     }
                // },
                select: {
                    id: true,
                    proid: true,
                    m_dt_id: true,
                    pk_venta_so: true,
                    pk_extractor_venta_so: true,
                    codigo_distribuidor: true,
                    codigo_producto: true,
                    cod_unidad_medida: true,
                    unidad_medida: true,
                    descripcion_producto: true,
                    precio_unitario: true,
                    ruc: true,
                    desde: true,
                    hasta: true,
                    s_ytd: true,
                    s_mtd: true,
                    unidad_minima: true,
                    combo: true,
                    cod_unidad_medida_hml: true,
                    unidad_medida_hml: true,
                    coeficiente: true,
                    unidad_minima_unitaria: true,
                    bonificado: true,
                },
                
            })

            let data_excel = []
            await productos_so.map(pso => {
                data_excel.push({
                    'ID': pso.id ? pso.id : '',
                    'PROID': pso.proid ? pso.proid : '',
                    'M_DT_ID': pso.m_dt_id ? pso.m_dt_id : '',
                    'PK_VENTA_SO': pso.pk_venta_so ? pso.pk_venta_so : '',
                    'PK_EXTRACTOR_VENTA_SO': pso.pk_extractor_venta_so ? pso.pk_extractor_venta_so : '',
                    'CODIGO_DISTRIBUIDOR': pso.codigo_distribuidor ? pso.codigo_distribuidor : '',
                    'CODIGO_PRODUCTO': pso.codigo_producto ? pso.codigo_producto : '',
                    'COD_UNIDAD_MEDIDA': pso.cod_unidad_medida ? pso.cod_unidad_medida : '',
                    'UNIDAD_MEDIDA': pso.unidad_medida ? pso.unidad_medida : '',
                    'DESCRIPCION_PRODUCTO': pso.descripcion_producto ? pso.descripcion_producto : '',
                    'PRECIO_UNITARIO': pso.precio_unitario ? pso.precio_unitario : '',
                    'RUC': pso.ruc ? pso.ruc : '',
                    'DESDE': pso.desde ? pso.desde : '',
                    'HASTA': pso.hasta ? pso.hasta : '',
                    'S_YTD': pso.s_ytd ? pso.s_ytd : '',
                    'S_MTD': pso.s_mtd ? pso.s_mtd : '',
                    'UNIDAD_MINIMA': pso.unidad_minima ? pso.unidad_minima : '',
                    'COMBO': pso.combo ? pso.combo : '',
                    'COD_UNIDAD_MEDIDA_HML': pso.cod_unidad_medida_hml ? pso.cod_unidad_medida_hml : '',
                    'UNIDAD_MEDIDA_HML': pso.unidad_medida_hml ? pso.unidad_medida_hml : '',
                    'COEFICIENTE': pso.coeficiente ? pso.coeficiente : '',
                    'UNIDAD_MINIMA_UNITARIA': pso.unidad_minima_unitaria ? pso.unidad_minima_unitaria : '',
                    'BONIFICADA': pso.bonificado ? pso.bonificado : '',
                })
            })

            const encabezado = ['ID', 'PROID', 'M_DT_ID', 'PK_VENTA_SO', 'PK_EXTRACTOR_VENTA_SO', 'CODIGO_DISTRIBUIDOR', 'CODIGO_PRODUCTO', 'COD_UNIDAD_MEDIDA', 'UNIDAD_MEDIDA', 'DESCRIPCION_PRODUCTO', 'PRECIO_UNITARIO', 'RUC', 'DESDE', 'HASTA', 'S_YTD', 'S_MTD', 'UNIDAD_MINIMA', 'COMBO', 'COD_UNIDAD_MEDIDA_HML', 'UNIDAD_MEDIDA_HML', 'COEFICIENTE', 'UNIDAD_MINIMA_UNITARIA', 'BONIFICADA']

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos')

            const headerStyle = {
                font: {
                    color: { argb: '000000' },
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'DDEBF7' },
                },
            }

            const column1 = worksheet.getColumn(1)
            column1.width = 20
            const column2 = worksheet.getColumn(2)
            column2.width = 25
            const column3 = worksheet.getColumn(3)
            column3.width = 25
            const column4 = worksheet.getColumn(4)
            column4.width = 25
            const column5 = worksheet.getColumn(5)
            column5.width = 25
            const column6 = worksheet.getColumn(6)
            column6.width = 20
            const column7 = worksheet.getColumn(7)
            column7.width = 25
            const column8 = worksheet.getColumn(8)
            column8.width = 20
            const column9 = worksheet.getColumn(9)
            column9.width = 25
            const column10 = worksheet.getColumn(10)
            column10.width = 20
            const column11 = worksheet.getColumn(11)
            column11.width = 25
            const column12 = worksheet.getColumn(12)
            column12.width = 25
            const column13 = worksheet.getColumn(13)
            column13.width = 25
            const column14 = worksheet.getColumn(14)
            column14.width = 25
            const column15 = worksheet.getColumn(15)
            column15.width = 20
            const column16 = worksheet.getColumn(16)
            column16.width = 25
            const column17 = worksheet.getColumn(17)
            column17.width = 20
            const column18 = worksheet.getColumn(18)
            column18.width = 25
            const column19 = worksheet.getColumn(19)
            column19.width = 25
            const column20 = worksheet.getColumn(20)
            column20.width = 20
            const column21 = worksheet.getColumn(21)
            column21.width = 25
            const column22 = worksheet.getColumn(22)
            column22.width = 20
            const column23 = worksheet.getColumn(23)
            column23.width = 25

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

            data_excel.forEach((row) => {
                const rowData = Object.values(row)
                const dataRow = worksheet.addRow(rowData)
                dataRow.eachCell((cell) => {
                    cell.border = {
                        top: {style:'thin', color: {argb:'4472C4'}},
                        left: {style:'thin', color: {argb:'4472C4'}},
                        bottom: {style:'thin', color: {argb:'4472C4'}},
                        right: {style:'thin', color: {argb:'4472C4'}}
                    }
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