const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarInventarios = async (req, res) => {

    const { 
        re_date
    } = req.body

    try{
        const nombre_archivo = 'Inventarios'
        let ubicacion_s3
        if(re_date){
            const separateDate = re_date.split("/")
            const joinDate = separateDate[1]+""+separateDate[0]
            ubicacion_s3 = `hmlthanos/pe/tradicional/archivosgenerados/inventarios/${joinDate}/${nombre_archivo}.xlsx`
        }else{
            ubicacion_s3 = `hmlthanos/pe/tradicional/archivosgenerados/inventarios/total/${nombre_archivo}.xlsx`
        }
        console.log(ubicacion_s3);
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
            const ventas_so = await prisma.ventas_so.findMany({
                select: {
                    id: true,
                    pro_so_id: true,
                    fecha: true,
                    nro_factura: true,
                    codigo_cliente: true,
                    ruc: true,
                    razon_social: true,
                    mercado_categoria_tipo: true,
                    codigo_vendedor_distribuidor: true,
                    dni_vendedor_distribuidor: true,
                    nombre_vendedor_distribuidor: true,
                    codigo_producto: true,
                    descripcion_producto: true,
                    cantidad: true,
                    unidad_medida: true,
                    precio_unitario: true,
                    precio_total_sin_igv: true,
                    masterclientes_grow:{
                        select: {
                            codigo_destinatario: true,
                        }
                    },
                    master_productos_so: {
                        select: {
                            master_productos: {
                                select: {
                                    cod_producto: true,
                                    nomb_producto: true,
                                }
                            }
                        }
                    }
                },
                distinct: ['pro_so_id'],
            })

            let data_excel = []
            await ventas_so.map((ven, index) => {
                const masterclientes_obj = ven.masterclientes_grow 
                                        ? ven.masterclientes_grow.codigo_destinatario 
                                            ? ven.masterclientes_grow.codigo_destinatario
                                            : ''
                                        : ''
                const cod_producto_obj = ven.master_productos_so 
                                        ? ven.master_productos_so.master_productos 
                                            ? ven.master_productos_so.master_productos.cod_producto 
                                                ? ven.master_productos_so.master_productos.cod_producto
                                                : ''
                                            : ''
                                        : ''
                const nomb_producto_obj = ven.master_productos_so 
                                        ? ven.master_productos_so.master_productos 
                                            ? ven.master_productos_so.master_productos.nomb_producto 
                                                ? ven.master_productos_so.master_productos.nomb_producto 
                                                : ''
                                            : ''
                                        : ''
                data_excel.push({
                    "CodigoDistribuidor": masterclientes_obj,
                    "Fecha": ven.fecha ? ven.fecha : '',
                    "NroFactura": ven.nro_factura ? ven.nro_factura : '',
                    "CodigoCliente": ven.codigo_cliente ? ven.codigo_cliente : '',
                    "RUC": ven.ruc ? ven.ruc : '',
                    "RazonSocial": ven.razon_social ? ven.razon_social : '',
                    "Mercado/Categoria/Tipo": ven.mercado_categoria_tipo ? ven.mercado_categoria_tipo : '',
                    "CodigoVendedorDistribuidor": ven.codigo_vendedor_distribuidor ? ven.codigo_vendedor_distribuidor : '',
                    "DNIVendedorDistribuidor": ven.dni_vendedor_distribuidor ? ven.dni_vendedor_distribuidor : '',
                    "NombreVendedorDistribuidor": ven.nombre_vendedor_distribuidor ? ven.nombre_vendedor_distribuidor : '',
                    "CodigoProducto": ven.codigo_producto ? ven.codigo_producto : '',
                    "DescripcionProducto": ven.descripcion_producto ? ven.descripcion_producto : '',
                    "Cantidad": ven.cantidad ? ven.cantidad : '',
                    "UnidadDeMedida": ven.unidad_medida ? ven.unidad_medida : '',
                    "PrecioUnitario": ven.precio_unitario ? ven.precio_unitario : '',
                    "PrecioTotalSinIGV": ven.precio_total_sin_igv ? ven.precio_total_sin_igv : '',
                    "CodigoProductoHML": cod_producto_obj,
                    "ProductoHML": nomb_producto_obj,
                })
            })

            const encabezado = ['CodigoDistribuidor', 'Fecha', 'NroFactura', 'CodigoCliente', 'RUC', 'RazonSocial', 'Mercado/Categoria/Tipo', 'CodigoVendedorDistribuidor', 'DNIVendedorDistribuidor', 'NombreVendedorDistribuidor', 'CodigoProducto', 'DescripcionProducto', 'Cantidad', 'UnidadDeMedida', 'PrecioUnitario', 'PrecioTotalSinIGV', 'CodigoProductoHML', 'ProductoHML']

            const workbook = new ExcelJS.Workbook()
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
            message : 'Lo sentimos hubo un error al momento de descargar',
            devmsg  : error,
            respuesta : false
        })
    }
}

module.exports = controller