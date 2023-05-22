const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const XLSX = require('xlsx')
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarMasterProductosSo = async (req, res) => {

    const {  } = req.body

    try{
        const nombre_archivo = 'Homologados'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/homologaciones/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
            const ventas_so = await prisma.ventas_so.findMany({
                select: {
                    id: true,
                    unidad_medida: true,
                    pro_so_id: true,
                    master_productos_so: {
                        select: {
                            codigo_producto: true,
                            descripcion_producto: true,
                            master_distribuidoras: {
                                select: {
                                    codigo_dt: true,
                                    nomb_dt: true,
                                    nomb_cliente: true,
                                }
                            },
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
                const master_distribuidoras_obj = {codigo_dt: '', nomb_dt: '', nomb_cliente: ''}
                const master_productos_obj = {cod_producto: '', nomb_producto: ''}

                const { codigo_dt, nomb_dt, nomb_cliente } = ven.master_productos_so 
                    ?   ven.master_productos_so.master_distribuidoras 
                        ?   ven.master_productos_so.master_distribuidoras 
                        :   master_distribuidoras_obj
                    :   master_distribuidoras_obj
                const { cod_producto, nomb_producto } = ven.master_productos_so
                    ?   ven.master_productos_so.master_productos 
                        ?   ven.master_productos_so.master_productos 
                        :   master_productos_obj
                    :   master_productos_obj

                data_excel.push({
                    "COD_CLIENT_SI": codigo_dt,
                    "CLIENT_SI": nomb_dt,
                    "SUBSIDIARY": nomb_cliente,
                    "COD_MATERIAL_SO": ven.master_productos_so ? ven.master_productos_so.codigo_producto : '',
                    "MATERIAL_SO": ven.master_productos_so ? ven.master_productos_so.descripcion_producto : '',
                    "COD_UOM" : "",
                    "UOM": ven.unidad_medida,
                    "COD_MATERIAL_SI": cod_producto,
                    "MATERIAL_SI": nomb_producto,
                })
            })

            const encabezado = ['COD_CLIENT_SI', 'CLIENT_SI', 'SUBSIDIARY', 'COD_MATERIAL_SO', 'MATERIAL_SO', 'COD_UOM', 'UOM', 'COD_MATERIAL_SI', 'MATERIAL_SI']

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
            console.log("Se guardo correctamente el s3 Homologados");
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