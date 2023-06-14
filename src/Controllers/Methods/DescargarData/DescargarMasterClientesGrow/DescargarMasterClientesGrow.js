const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarMasterClientesGrow = async (req, res) => {

    const {  } = req.body;

    try{

        const nombre_archivo = 'Master Clientes'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/masterclientesgrow/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        if(!respuestaFile){
            const masterclientes_grow = await prisma.masterclientes_grow.findMany({
                select: {
                    id: true,
                    cod_organizacion: true,
                    organizacion_venta: true,
                    codigo_division: true,
                    division: true,
                    codigo_destinatario: true,
                    destinatario: true,
                    codigo_solicitante: true,
                    solicitante: true,
                    ruc: true,
                    cliente_hml: true,
                    grupo_cliente_hml: true,
                    sucursal_hml: true,
                    supervisor: true,
                    territorio: true,
                    zona: true,
                    canal_atencion: true,
                    segmento_cliente: true,
                    subsegmento: true,
                    tipo_atencion: true,
                    segmento_regional: true,
                    conexion: true,
                    estado: true,
                    codigo_pais: true,
                    pais: true,
                    codigo_departamento: true,
                    departamento: true,
                    codigo_provincia: true,
                    provincia: true,
                    codigo_distrito: true,
                    distrito: true,
                    direccion: true,
                    zona_venta: true
                },
            })

            let data_excel = []
            await masterclientes_grow.map(mcg => {
                data_excel.push({
                    "CODIGO ORGANIZACIÓN VENTAS": mcg.cod_organizacion ? mcg.cod_organizacion : '',
                    "ORGANIZACIÓN VENTAS": mcg.organizacion_venta ? mcg.organizacion_venta : '',
                    "CODIGO DIVISION": mcg.codigo_division ? mcg.codigo_division : '',
                    "DIVISION": mcg.division ? mcg.division : '',
                    "CODIGO DESTINATARIO": mcg.codigo_destinatario ? mcg.codigo_destinatario : '',
                    "DESTINATARIO": mcg.destinatario ? mcg.destinatario : '',
                    "CODIGO SOLICITANTE": mcg.codigo_solicitante ? mcg.codigo_solicitante : '',
                    "SOLICITANTE": mcg.solicitante ? mcg.solicitante : '',
                    "RUC": mcg.ruc ? mcg.ruc : '',
                    "CLIENTE HML": mcg.cliente_hml ? mcg.cliente_hml : '',
                    "GRUPO CLIENTE HML": mcg.grupo_cliente_hml ? mcg.grupo_cliente_hml : '',
                    "SUCURSAL HML": mcg.sucursal_hml ? mcg.sucursal_hml : '',
                    "SUPERVISOR": mcg.supervisor ? mcg.supervisor : '',
                    "TERRITORIO": mcg.territorio ? mcg.territorio : '',
                    "ZONA": mcg.zona ? mcg.zona : '',
                    "CANAL DE ATENCION": mcg.canal_atencion ? mcg.canal_atencion : '',
                    "SEGMENTO CLIENTE FINAL": mcg.segmento_cliente ? mcg.segmento_cliente : '',
                    "SUBSEGMENTO": mcg.subsegmento ? mcg.subsegmento : '',
                    "TIPO ATENCION": mcg.tipo_atencion ? mcg.tipo_atencion : '',
                    "SEGMENTO REGIONAL": mcg.segmento_regional ? mcg.segmento_regional : '',
                    "CONEXIÓN": mcg.conexion ? mcg.conexion : '',
                    "ESTADO": mcg.estado ? mcg.estado : '',
                    "CODIGO PAIS": mcg.codigo_pais ? mcg.codigo_pais : '',
                    "PAIS": mcg.pais ? mcg.pais : '',
                    "CODIGO DEPARTAMENTO": mcg.codigo_departamento ? mcg.codigo_departamento : '',
                    "DEPARTAMENTO": mcg.departamento ? mcg.departamento : '',
                    "CODIGO PROVINCIA": mcg.codigo_provincia ? mcg.codigo_provincia : '',
                    "PROVINCIA": mcg.provincia ? mcg.provincia : '',
                    "CODIGO DISTRITO": mcg.codigo_distrito ? mcg.codigo_distrito : '',
                    "DISTRITO": mcg.distrito ? mcg.distrito : '',
                    "DIRECCION": mcg.direccion ? mcg.direccion : '',
                    "ZONA VENTA": mcg.zona_venta ? mcg.zona_venta : '',
                })
            })

            const encabezado = ['CODIGO ORGANIZACIÓN VENTAS', 'ORGANIZACIÓN VENTAS', 'CODIGO DIVISION', 'DIVISION', 'CODIGO DESTINATARIO', 'DESTINATARIO', 'CODIGO SOLICITANTE', 'SOLICITANTE', 'RUC', 'CLIENTE HML', 'GRUPO CLIENTE HML', 'SUCURSAL HML', 'SUPERVISOR', 'TERRITORIO', 'ZONA', 'CANAL DE ATENCION', 'SEGMENTO CLIENTE FINAL', 'SUBSEGMENTO', 'TIPO ATENCION', 'SEGMENTO REGIONAL', 'CONEXIÓN', 'ESTADO', 'CODIGO PAIS', 'PAIS', 'CODIGO DEPARTAMENTO', 'DEPARTAMENTO', 'CODIGO PROVINCIA', 'PROVINCIA', 'CODIGO DISTRITO', 'DISTRITO', 'DIRECCION', 'ZONA VENTA']

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos')

            const arrayWidth = [
                {key: 1, width: 25},
                {key: 2, width: 30},
                {key: 3, width: 20},
                {key: 4, width: 20},
                {key: 5, width: 25},
                {key: 6, width: 30},
                {key: 7, width: 20},
                {key: 8, width: 30},
                {key: 9, width: 20},
                {key: 10, width: 25},
                {key: 11, width: 20},
                {key: 12, width: 25},
                {key: 13, width: 20},
                {key: 14, width: 20},
                {key: 15, width: 20},
                {key: 16, width: 20},
                {key: 17, width: 25},
                {key: 18, width: 30},
                {key: 19, width: 20},
                {key: 20, width: 20},
                {key: 21, width: 20},
                {key: 22, width: 20},
                {key: 23, width: 20},
                {key: 24, width: 20},
                {key: 25, width: 25},
                {key: 26, width: 25},
                {key: 27, width: 20},
                {key: 28, width: 20},
                {key: 29, width: 20},
                {key: 30, width: 20},
                {key: 31, width: 20},
                {key: 32, width: 25},
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
                {key: 7, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 8, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 9, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 10, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 11, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 12, color: { argb: '0070C0' }, background: { argb: 'DDEBF7' }, body: { argb: 'DDEBF7' }},
                {key: 13, color: { argb: '000000' }, background: { argb: 'FFC000' }, body: { argb: 'FFFFFF' }},
                {key: 14, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 15, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 16, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 17, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 18, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 19, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 20, color: { argb: 'FFFFFF' }, background: { argb: 'C65911' }, body: { argb: 'FFFFFF' }},
                {key: 21, color: { argb: 'FFFFFF' }, background: { argb: '0070C0' }, body: { argb: 'FFFFFF' }},
                {key: 22, color: { argb: 'FFFFFF' }, background: { argb: '0070C0' }, body: { argb: 'FFFFFF' }},
                {key: 23, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 24, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 25, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 26, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 27, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 28, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 29, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 30, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 31, color: { argb: 'FFFFFF' }, background: { argb: '00B050' }, body: { argb: 'FFFFFF' }},
                {key: 32, color: { argb: 'FFFFFF' }, background: { argb: '548235' }, body: { argb: 'FFFFFF' }},
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
                            bold: true
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