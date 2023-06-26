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

        const nombre_archivo = 'Homologaciones'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/homologaciones/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
            const productos_so = await prisma.master_productos_so.findMany({
                select: {
                    id: true,
                    ruc: true,
                    codigo_producto: true,
                    descripcion_producto: true,
                    unidad_medida: true,
                    precio_unitario: true,
                    desde: true,
                    masterclientes_grow:{
                        select: {
                            codigo_destinatario: true,
                            destinatario: true
                        }
                    },
                    master_productos_grow: {
                        select: {
                            codigo_material: true,
                            material_softys: true
                        }
                    }
                },
                where: {
                    m_pro_grow : {
                        not: null
                    },
                    homologado : true,
                },
                distinct : ['pk_venta_so_hml']
            })

            let data_excel = []
            await productos_so.map(pso => {
                const masterclientes_obj = pso.masterclientes_grow 
                                        ? pso.masterclientes_grow.codigo_destinatario 
                                            ? pso.masterclientes_grow.codigo_destinatario
                                            : ''
                                        : ''
                const cod_producto_obj = pso.master_productos_grow 
                                        ? pso.master_productos_grow.codigo_material 
                                            ? pso.master_productos_grow.codigo_material
                                            : ''
                                        : ''
                const nomb_producto_obj = pso.master_productos_grow 
                                        ? pso.master_productos_grow.material_softys 
                                            ? pso.master_productos_grow.material_softys 
                                            : ''
                                        : ''
                data_excel.push({
                    "codigo_distribuidor": masterclientes_obj,
                    "nombre_distribuidor": pso?.masterclientes_grow?.destinatario,
                    // "Fecha": '',
                    // "NroFactura": '',
                    // "CodigoCliente": '',
                    // "RUC": pso.ruc ? pso.ruc : '',
                    // "RazonSocial": '',
                    // "Mercado/Categoria/Tipo": '',
                    // "CodigoVendedorDistribuidor": '',
                    // "DNIVendedorDistribuidor": '',
                    // "NombreVendedorDistribuidor": '',
                    "codigo_producto_distribuidor": pso.codigo_producto ? pso.codigo_producto : '',
                    "nombre_producto_distribuidor": pso.descripcion_producto ? pso.descripcion_producto : '',
                    // "Cantidad": pso.cantidad ? pso.cantidad : '',
                    "UnidadDeMedida": pso.unidad_medida ? pso.unidad_medida : '',
                    // "PrecioUnitario": pso.precio_unitario ? pso.precio_unitario : '',
                    // "PrecioTotalSinIGV": '',
                    "codigo_producto_maestro": cod_producto_obj,
                    "fecha_inicial": pso.desde ? pso.desde : '',
                    // "ProductoHML": nomb_producto_obj,
                })
            })

            const encabezado = [
                'codigo_distribuidor', 
                'nombre_distribuidor', 
                // 'Fecha', 'NroFactura', 'CodigoCliente', 'RUC', 'RazonSocial', 'Mercado/Categoria/Tipo', 'CodigoVendedorDistribuidor', 'DNIVendedorDistribuidor', 'NombreVendedorDistribuidor', 
                'codigo_producto_distribuidor', 
                'nombre_producto_distribuidor', 
                // 'Cantidad', 'UnidadDeMedida', 'PrecioUnitario', 'PrecioTotalSinIGV', 
                'codigo_producto_maestro', 
                // 'ProductoHML'
                'fecha_inicial'

            ]

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos')

            const headerStyleRed = {
                font: {
                    color: { argb: '000000' },
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'C0504D' },
                },
            }

            const headerStyleGreen = {
                font: {
                    color: { argb: '000000' },
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '9BBB59' },
                },
            }

            const column1 = worksheet.getColumn(1)
            column1.width = 20
            const column2 = worksheet.getColumn(2)
            column2.width = 20
            const column3 = worksheet.getColumn(3)
            column3.width = 20
            const column4 = worksheet.getColumn(4)
            column4.width = 20
            const column5 = worksheet.getColumn(5)
            column5.width = 20
            const column6 = worksheet.getColumn(6)
            column6.width = 20
            const column7 = worksheet.getColumn(7)
            column7.width = 30
            const column8 = worksheet.getColumn(8)
            column8.width = 30
            const column9 = worksheet.getColumn(9)
            column9.width = 30
            const column10 = worksheet.getColumn(10)
            column10.width = 30
            const column11 = worksheet.getColumn(11)
            column11.width = 20
            const column12 = worksheet.getColumn(12)
            column12.width = 30
            const column13 = worksheet.getColumn(13)
            column13.width = 20
            const column14 = worksheet.getColumn(14)
            column14.width = 20
            const column15 = worksheet.getColumn(15)
            column15.width = 20
            const column16 = worksheet.getColumn(16)
            column16.width = 20
            const column17 = worksheet.getColumn(17)
            column17.width = 20
            const column18 = worksheet.getColumn(18)
            column18.width = 20

            const styleHeaderRed = [0, 1, 3, 7, 10, 11, 12, 13, 14, 15]

            const headerRow = worksheet.addRow(encabezado)
            headerRow.eachCell((cell, index) => {
                if(styleHeaderRed.find(shr => shr == index)){
                    cell.fill = headerStyleRed.fill
                }else{
                    cell.fill = headerStyleGreen.fill
                }
                cell.font = headerStyleRed.font
            })

            data_excel.forEach((row) => {
                const rowData = Object.values(row)
                const dataRow = worksheet.addRow(rowData)
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