const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ExcelJS = require('exceljs')
const UploadFile = require('../../S3/UploadFileS3')
const CheckFile = require('../../S3/CheckFileS3')
const GenerateUrl = require('../../S3/GenerateUrlS3')

controller.MetDescargarHomologados = async (req, res) => {

    const {  } = req.body;
    const { usutoken } = req.headers;

    console.log("usutoken: ---");
    console.log(usutoken);

    try{

        let productos_so

        let usuario = await prisma.usuusuarios.findMany({
            where: {
                usutoken : usutoken
            },
            take : 1
        })

        if(usuario.length > 0){
            usuario = usuario[0]
        }

        const nombre_archivo = 'Homologaciones'
        const ubicacion_s3 = 'hmlthanos/pe/tradicional/archivosgenerados/homologaciones/'+nombre_archivo+'.xlsx'
        const respuestaFile = await CheckFile.CheckFileS3(ubicacion_s3)

        // if(!respuestaFile){
        if(true){
            productos_so = await prisma.master_productos_so.findMany({
                select: {
                    id: true,
                    ruc: true,
                    codigo_producto: true,
                    descripcion_producto: true,
                    unidad_medida: true, //Nuevo
                    precio_unitario: true,
                    desde: true,
                    coeficiente : true, //Nuevo
                    cod_unidad_medida : true, //Nuevo
                    unidad_minima: true,
                    unidad_minima_unitaria : true, //Nuevo
                    pk_extractor_venta_so : true,
                    bonificado : true, //Nuevo
                    updated_at : true,
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
                // distinct : ['pk_venta_so_hml']
            })

            let data_excel = []

            productos_so.map(pso => {
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

                if(usuario.tpuid == 1){
                    data_excel.push({
                        "codigo_distribuidor": masterclientes_obj,
                        "nombre_distribuidor": pso?.masterclientes_grow?.destinatario,
                        "UnidadDeMedida": pso.unidad_medida ? pso.unidad_medida : '',
                        "codigo_producto_distribuidor": pso.codigo_producto ? pso.codigo_producto : '',
                        "nombre_producto_distribuidor": pso.descripcion_producto ? pso.descripcion_producto : '',
                        
                        "codigo_producto_maestro": cod_producto_obj,
                        "unidad_minima": cod_producto_obj == "OTROS"
                                            ? '1' 
                                            : pso.unidad_minima ? pso.unidad_minima : '',
                        "fecha_inicial": pso.desde ? pso.desde : '',
                    })
                }else{
                    data_excel.push({
                        "codigo_distribuidor": masterclientes_obj,
                        "nombre_distribuidor": pso?.masterclientes_grow?.destinatario,
                        // "UnidadDeMedida": pso.unidad_medida ? pso.unidad_medida : '',
                        "codigo_producto_distribuidor": pso.codigo_producto ? pso.codigo_producto : '',
                        "nombre_producto_distribuidor": pso.descripcion_producto ? pso.descripcion_producto : '',
                        
                        "codigo_producto_maestro": cod_producto_obj,
                        // "unidad_minima": cod_producto_obj == "OTROS" 
                        //                     ? '1' 
                        //                     : pso.unidad_minima ? pso.unidad_minima : '',
                        // "fecha_inicial": pso.desde ? pso.desde : '',
                    })
                }
                
            })

            // for await (const pso of productos_so){

            //     const data_filtro = await prisma.ventas_so.aggregate({
            //         _avg :{
            //             precio_unitario : true
            //         },
            //         _max: {
            //             precio_unitario: true,
            //           },
            //         _min: {
            //             precio_unitario: true,
            //         },
            //         _sum : {
            //             precio_total_sin_igv : true,
            //             cantidad : true
            //         },
            //         where : {
            //             pk_extractor_venta_so : pso.pk_extractor_venta_so
            //         }
            //     })

            //     const precio_total = data_filtro._sum.precio_total_sin_igv ? data_filtro._sum.precio_total_sin_igv : 0
            //     const cantidad_total = data_filtro._sum.cantidad ? data_filtro._sum.cantidad : 0
        
            //     const masterclientes_obj = pso.masterclientes_grow 
            //                             ? pso.masterclientes_grow.codigo_destinatario 
            //                                 ? pso.masterclientes_grow.codigo_destinatario
            //                                 : ''
            //                             : ''
            //     const cod_producto_obj = pso.master_productos_grow 
            //                             ? pso.master_productos_grow.codigo_material 
            //                                 ? pso.master_productos_grow.codigo_material
            //                                 : ''
            //                             : ''
            //     const nomb_producto_obj = pso.master_productos_grow 
            //                             ? pso.master_productos_grow.material_softys 
            //                                 ? pso.master_productos_grow.material_softys 
            //                                 : ''
            //                             : ''
            //     //Crea el campo fecha de homologacion para agregarla al excel
            //     const date = new Date(pso.updated_at);
            //     const formattedDate = date.toLocaleString("en-US", {
            //     format: "dd-MM-YYYY HH:mm"
            //     });

            //     //Crea las columnas promedio precio total y promedio precio para agregarlos al excel
            //     let prom_precio = data_filtro._avg.precio_unitario ? data_filtro._avg.precio_unitario : 0
            //     prom_precio = parseFloat(prom_precio).toFixed(2)
            //     let prom_precio_total = precio_total/cantidad_total
            //     prom_precio_total = parseFloat(prom_precio_total).toFixed(2)
            //     data_excel.push({
            //         "codigo_distribuidor": masterclientes_obj,
            //         "nombre_distribuidor": pso?.masterclientes_grow?.destinatario,
            //         "UnidadDeMedida": pso.unidad_medida ? pso.unidad_medida : '',
            //         "codigo_producto_distribuidor": pso.codigo_producto ? pso.codigo_producto : '',
            //         "nombre_producto_distribuidor": pso.descripcion_producto ? pso.descripcion_producto : '',
            //         "codigo_producto_maestro": cod_producto_obj,
            //         "unidad_minima": pso.unidad_minima ? pso.unidad_minima : '',
            //         "fecha_inicial": pso.desde ? pso.desde : '',
            //         //Agrega los valores de las columnas al excel(fecha, promedio_precio_total, promedio_precio)
            //         "Promedio_precio_total" :  prom_precio_total,
            //         "Promedio_precio"   : prom_precio,
            //         // "Promedio_precio"   : data_filtro._avg.precio_unitario ? data_filtro._avg.precio_unitario : 0,
            //         "fecha_homologada" : formattedDate.toString()
            //     })
            // }

            let encabezado = [
                'codigo_distribuidor', 
                'nombre_distribuidor', 
                // 'UnidadDeMedida', 
                'codigo_producto_distribuidor', 
                'nombre_producto_distribuidor', 
                'codigo_producto_maestro', 
                // 'unidad_minima',
                // 'fecha_inicial',
            ]

            if(usuario.tpuid == 1){
                encabezado = [
                    'codigo_distribuidor', 
                    'nombre_distribuidor', 
                    'UnidadDeMedida', 
                    'codigo_producto_distribuidor', 
                    'nombre_producto_distribuidor', 
                    'codigo_producto_maestro', 
                    'unidad_minima',
                    'fecha_inicial',
                ]
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos')

            if(usuario.tpuid == 1){
                await controller.AddInfoApprovalCombo(workbook, usuario, productos_so)
            }
        
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
            column2.width = 30
            const column3 = worksheet.getColumn(3)
            column3.width = 20
            const column4 = worksheet.getColumn(4)
            column4.width = 30
            const column5 = worksheet.getColumn(5)
            column5.width = 30
            const column6 = worksheet.getColumn(6)
            column6.width = 30
            const column7 = worksheet.getColumn(7)
            column7.width = 30
            const column8 = worksheet.getColumn(8)
            column8.width = 30
            const column9 = worksheet.getColumn(9)
            column9.width = 30
            const column10 = worksheet.getColumn(10)
            column10.width = 30
            const column11 = worksheet.getColumn(11)
            column11.width = 30
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

controller.AddInfoApprovalCombo = async ( workbook, usuario, productos_so )  => {

    let data_excel = []
    const worksheetCombo = workbook.addWorksheet('Combo')

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

    const column1 = worksheetCombo.getColumn(1)
    column1.width = 20
    const column2 = worksheetCombo.getColumn(2)
    column2.width = 30
    const column3 = worksheetCombo.getColumn(3)
    column3.width = 30
    const column4 = worksheetCombo.getColumn(4)
    column4.width = 30
    const column5 = worksheetCombo.getColumn(5)
    column5.width = 30
    const column6 = worksheetCombo.getColumn(6)
    column6.width = 20
    const column7 = worksheetCombo.getColumn(7)
    column7.width = 30
    const column8 = worksheetCombo.getColumn(8)
    column8.width = 20
    const column9 = worksheetCombo.getColumn(9)
    column9.width = 20
    const column10 = worksheetCombo.getColumn(10)
    column10.width = 20
    const column11 = worksheetCombo.getColumn(11)
    column11.width = 20
    const column12 = worksheetCombo.getColumn(12)
    column12.width = 20

    let encabezado = [
        'codigo_distribuidor', 
        'nombre_distribuidor',
        'codigo_producto_distribuidor', 
        'nombre_producto_distribuidor', 
        'codigo_producto_maestro', 
        'codigo_unidad_medida',
        'unidad_medida',
        'coeficiente',
        'unidad_minina_unitaria',
        'bonificacion'
    ]

    if(usuario.tpuid == 1){
        encabezado = [
            'codigo_distribuidor',
            'nombre_distribuidor', 
            'codigo_producto_distribuidor', 
            'nombre_producto_distribuidor', 
            'codigo_producto_maestro', 
            'unidad_minima',
            'codigo_unidad_medida',
            'unidad_medida',
            'coeficiente',
            'unidad_minina_unitaria',
            'bonificacion',
            'fecha_inicial',
        ]
    }

    productos_so.map(pso => {
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

        if(usuario.tpuid == 1){
            data_excel.push({
                "codigo_distribuidor": masterclientes_obj,
                "nombre_distribuidor": pso?.masterclientes_grow?.destinatario,
                // "UnidadDeMedida": pso.unidad_medida ? pso.unidad_medida : '',
                "codigo_producto_distribuidor": pso.codigo_producto ? pso.codigo_producto : '',
                "nombre_producto_distribuidor": pso.descripcion_producto ? pso.descripcion_producto : '',
                
                "codigo_producto_maestro": cod_producto_obj,
                "unidad_minima": cod_producto_obj == "OTROS"
                                    ? '1' 
                                    : pso.unidad_minima ? pso.unidad_minima : '',
                "codigo_unidad_medida" : pso.cod_unidad_medida ? pso.cod_unidad_medida : '',
                "unidad_medida" : pso.unidad_medida ? pso.unidad_medida : '',
                "coeficiente" : pso.coeficiente ? pso.coeficiente : '',
                "unidad_minima_unitaria" : pso.unidad_minima_unitaria ? pso.unidad_minima_unitaria : '',
                "bonificacion" : pso.bonificado ? 'Si' : 'No',
                "fecha_inicial": pso.desde ? pso.desde : '',
            })
        }else{
            data_excel.push({
                "codigo_distribuidor": masterclientes_obj,
                "nombre_distribuidor": pso?.masterclientes_grow?.destinatario,
                "codigo_producto_distribuidor": pso.codigo_producto ? pso.codigo_producto : '',
                "nombre_producto_distribuidor": pso.descripcion_producto ? pso.descripcion_producto : '',
                "codigo_producto_maestro": cod_producto_obj,
                "codigo_unidad_medida" : pso.cod_unidad_medida ? pso.cod_unidad_medida : '',
                "unidad_medida" : pso.unidad_medida ? pso.unidad_medida : '',
                "coeficiente" : pso.coeficiente ? pso.coeficiente : '',
                "unidad_minima_unitaria" : pso.unidad_minima_unitaria ? pso.unidad_minima_unitaria : '',
                "bonificacion" : pso.bonificado ? 'Si' : 'No',
            })
        }
        
    })

    let styleHeaderRed
    if(usuario.tpuid == 1){
        styleHeaderRed = [ 1, 6, 7 , 8 , 9, 10, 11 ]
    }else{
        styleHeaderRed = [ 0, 5, 6 , 7, 9 ]
    }

    const headerRow = worksheetCombo.addRow(encabezado)
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
        const dataRow = worksheetCombo.addRow(rowData)
    })
}
module.exports = controller