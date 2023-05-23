const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const CheckFile = require('../../S3/CheckFileS3')
const UploadFile = require('../../S3/UploadFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarMasterDistribuidoras = async (req, res) => {

    const {  } = req.body

    try{
        const nombre_archivo = 'Maestra Distribuidoras'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/maestraclientes/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
            const master_distribuidoras = await prisma.master_distribuidoras.findMany({
                select: {
                    codigo_dt: true,
                    region: true,
                    supervisor: true,
                    localidad: true,
                    nomb_dt: true,
                    check_venta: true,
                    nomb_cliente: true,
                    latitud: true,
                    longitud: true,
                    oficina_two: true,
                    subcanal: true,
                    sap_solicitante: true,
                    sap_destinatario: true,
                    diferencial: true,
                    canal_atencion: true,
                    cod_solicitante: true,
                    cod_destinatario: true,
                    canal_trade: true,
                }
            })

            let data_excel = []
            master_distribuidoras.map((distribuidora) => {
                const { codigo_dt, region, supervisor, localidad, nomb_dt, check_venta, nomb_cliente, latitud, longitud, oficina_two, subcanal, sap_solicitante, sap_destinatario, diferencial, canal_atencion, cod_solicitante, cod_destinatario, canal_trade } = distribuidora
                data_excel.push({
                    "CodigoDistribuidor" : codigo_dt ? codigo_dt : '',
                    "Region" : region ? region : '',
                    "Supervisor" : supervisor ? supervisor : '',
                    "Localidad" : localidad ? localidad : '',
                    "NombreDistribuidor" : nomb_dt ? nomb_dt : '',
                    "CheckVentas" : check_venta ? check_venta : '',
                    "NombreCliente" : nomb_cliente ? nomb_cliente : '',
                    "Latitud" : latitud ? latitud : '',
                    "Longitud" : longitud ? longitud : '',
                    "OFICINA2" : oficina_two ? oficina_two : '',
                    "SUBCANAL" : subcanal ? subcanal : '',
                    "SAP_SOLICITANTE" : sap_solicitante ? sap_solicitante : '',
                    "SAP_DESTINATARIO" : sap_destinatario ? sap_destinatario : '',
                    "diferenciaL" : diferencial ? diferencial : '',
                    "Canal Atencion" : canal_atencion ? canal_atencion : '',
                    "COD_SOLICITANTE" : cod_solicitante ? cod_solicitante : '',
                    "COD_DESTINATARIO" : cod_destinatario ? cod_destinatario : '',
                    "CANAL_TRADE" : canal_trade ? canal_trade : ''
                })
            })

            const encabezado = ['CodigoDistribuidor', 'Region', 'Supervisor', 'Localidad', 'NombreDistribuidor', 'CheckVentas', 'NombreCliente', 'Latitud', 'Longitud', 'OFICINA2', 'SUBCANAL', 'SAP_SOLICITANTE', 'SAP_DESTINATARIO', 'diferencial', 'Canal Atencion', 'COD_SOLICITANTE', 'COD_DESTINATARIO', 'CANAL_TRADE']

            const workbook = new ExcelJS.Workbook();
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

            const column1 = worksheet.getColumn(1)
            column1.width = 25
            const column2 = worksheet.getColumn(2)
            column2.width = 35
            const column3 = worksheet.getColumn(3)
            column3.width = 15
            const column4 = worksheet.getColumn(4)
            column4.width = 25
            const column5 = worksheet.getColumn(5)
            column5.width = 25
            const column6 = worksheet.getColumn(6)
            column6.width = 25
            const column7 = worksheet.getColumn(7)
            column7.width = 20
            const column8 = worksheet.getColumn(8)
            column8.width = 20
            const column9 = worksheet.getColumn(9)
            column9.width = 15
            const column10 = worksheet.getColumn(10)
            column10.width = 20
            const column11 = worksheet.getColumn(11)
            column11.width = 20
            const column12 = worksheet.getColumn(12)
            column12.width = 15
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
            console.log("Se guardo el s3 Maestra Distribuidoras");
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
            message : 'Lo sentimos hubo un error al momento de descargar.',
            devmsg  : error,
            respuesta : false
        })
    }
}

module.exports = controller