const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const XLSX = require('xlsx')
const fs = require('fs')

controller.MetDescargarMasterProductosSo = async (req, res) => {

    const {  } = req.body

    try{
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

        let productos_hml_form = []
        await ventas_so.map((ven, index) => {
            const { codigo_dt, nomb_dt, nomb_cliente } = ven.master_productos_so 
                ? ven.master_productos_so.master_distribuidoras 
                : {codigo_dt: null, nomb_dt: null, nomb_cliente: null}
            const { cod_producto, nomb_producto } = ven.master_productos_so.master_productos
                ? ven.master_productos_so.master_productos 
                : {cod_producto: null, nomb_producto: null}

            productos_hml_form.push({
                "COD_CLIENT_SI": codigo_dt,
                "CLIENT_SI": nomb_dt,
                "SUBSIDIARY": nomb_cliente,
                "COD_MATERIAL_SO": ven.master_productos_so ? ven.master_productos_so.codigo_producto : null,
                "MATERIAL_SO": ven.master_productos_so ? ven.master_productos_so.descripcion_producto : null,
                "COD_UOM" : "",
                "UOM": ven.unidad_medida,
                "COD_MATERIAL_SI": cod_producto,
                "MATERIAL_SI": nomb_producto,
            })
        })

        const encabezado = ['COD_CLIENT_SI', 'CLIENT_SI', 'SUBSIDIARY', 'COD_MATERIAL_SO', 'MATERIAL_SO', 'UOM', 'COD_MATERIAL_SI', 'MATERIAL_SI']

        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(productos_hml_form, encabezado)

        const columnas = [
            { wch: 15 },{ wch: 15 },{ wch: 20 },{ wch: 15 },{ wch: 25 },{ wch: 15 },{ wch: 15 },{ wch: 20 }
        ]
        worksheet['!cols'] = columnas

        // const styles = {
        //     header: {
        //       font: { bold: true },
        //       fill: { fgColor: { rgb: 'CCCCCC' } },
        //       alignment: { horizontal: 'center' },
        //     },
        //     cell: {
        //       font: { bold: false, sz: 12, },
        //       fill: { fgColor: { rgb: 'FFFFFF' } },
        //       alignment: { horizontal: 'left' },
        //     },
        // }

        // const rangoCeldas = XLSX.utils.decode_range(worksheet['!ref']);
        // for (let col = rangoCeldas.s.c; col <= rangoCeldas.e.c; ++col) {
        //     const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
        //     const cellStyle = col === 0 ? styles.header : styles.cell;
        //     if (headerCell) headerCell.s = cellStyle;
        //     for (let row = 1; row <= rangoCeldas.e.r; ++row) {
        //         const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        //         if (cell) cell.s = cellStyle;
        //     }
        // }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
        const nombre_excel = 'Homologados-'+Math.random().toString(24).substr(2, 6)+'.xlsx' 
        const ubicacion_excel = 'src/public/DescargarData/Homologaciones/'+nombre_excel

        XLSX.writeFile(workbook, ubicacion_excel)

        res.status(200)
        res.json({
            message : 'Se descargó exitosamente.',
            respuesta : true,
            data: nombre_excel
        })
        // res.download(nombreArchivo)
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