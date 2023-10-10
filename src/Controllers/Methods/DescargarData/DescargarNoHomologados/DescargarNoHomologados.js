const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarNoHomologados = async (req, res) => {

    try{
        const nombre_archivo = 'No Homologados'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/nohomologaciones/'+nombre_archivo+'.xlsx'
        // const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)
        const respuestaFile = false

        if(!respuestaFile){
            const productos_so = await prisma.master_productos_so.findMany({
                where: {
                    homologado : false,
                },
                select: {
                    id: true,
                    codigo_producto: true,
                    descripcion_producto: true,
                    unidad_medida: true,
                    precio_unitario: true,
                    desde: true,
                    codigo_distribuidor: true,
                    unidad_minima: true,
                    cod_unidad_medida : true,
                    masterclientes_grow:{
                        select: {
                            codigo_destinatario: true,
                            destinatario: true
                        }
                    },
                    cantidad : true
                },
                distinct : ['pk_venta_so']
            })

            let data_excel = []

            await productos_so.map(pso => {
                console.log(pso)
                data_excel.push({
                    "codigo_distribuidor"           : pso.codigo_distribuidor ? pso.codigo_distribuidor : '',
                    "nombre_distribuidor"           : pso.masterclientes_grow?.destinatario,
                    "CodUnidadDeMedida"             : pso.cod_unidad_medida ? pso.cod_unidad_medida : '',
                    "UnidadDeMedida"                : pso.unidad_medida ? pso.unidad_medida : '',
                    "codigo_producto_distribuidor"  : pso.codigo_producto ? pso.codigo_producto : '',
                    "nombre_producto_distribuidor"  : pso.descripcion_producto ? pso.descripcion_producto : '',
                    "Cantidad"  : pso.cantidad ? pso.cantidad : '0',
                    // "Cod Producto Homologado"       : '',
                    // "Unidad Medida Homologada"      : '',
                    // "unidad_minima"                 : pso.unidad_minima ? pso.unidad_minima : '',
                    "fecha_inicial"                 : pso.desde ? pso.desde : '',
                })
            })

            const encabezado = [
                'codigo_distribuidor', 
                'nombre_distribuidor', 
                'CodUnidadDeMedida', 
                'UnidadDeMedida', 
                'codigo_producto_distribuidor', 
                'nombre_producto_distribuidor',
                'Cantidad',
                // 'Cod Producto Homologado',
                // 'Unidad Medida Homologada',
                // 'unidad_minima',
                'fecha_inicial',
            ]

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos')

            const headerStylePink = {
                font: {
                    color: { argb: '000000' },
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FDE9D9' },
                },
            }

            const column1 = worksheet.getColumn(1)
            column1.width = 20
            const column2 = worksheet.getColumn(2)
            column2.width = 45
            const column3 = worksheet.getColumn(3)
            column3.width = 20
            const column4 = worksheet.getColumn(4)
            column4.width = 20
            const column5 = worksheet.getColumn(5)
            column5.width = 20
            const column6 = worksheet.getColumn(6)
            column6.width = 45
            const column7 = worksheet.getColumn(7)
            column7.width = 30
            const column8 = worksheet.getColumn(8)
            column8.width = 30
            const column9 = worksheet.getColumn(9)
            column9.width = 30
            const column10 = worksheet.getColumn(10)
            column10.width = 30

            const styleHeaderPink = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

            const headerRow = worksheet.addRow(encabezado)
            headerRow.eachCell((cell, index) => {
                cell.fill = headerStylePink.fill
                cell.font = headerStylePink.font
            })

            data_excel.forEach((row) => {
                const rowData = Object.values(row)
                const dataRow = worksheet.addRow(rowData)
            })

            const archivoExcel = await workbook.xlsx.writeBuffer()

            await UploadFile.UploadFileS3(archivoExcel, ubicacion_s3)
            console.log("Se guardo correctamente el s3 No Homologados")
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
            message : 'Lo sentimos hubo un error al momento de descargar los productos no homologados',
            devmsg  : error,
            respuesta : false
        })
    }

}

module.exports = controller