const controller = {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const XLSX = require('xlsx')

controller.MetDescargarMasterDistribuidoras = async (req, res) => {

    const {  } = req.body

    try{
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
            data_excel.push({
                "CodigoDistribuidor" : distribuidora.codigo_dt,
                "Region" : distribuidora.region,
                "Supervisor" : distribuidora.supervisor,
                "Localidad" : distribuidora.localidad,
                "NombreDistribuidor" : distribuidora.nomb_dt,
                "CheckVentas" : distribuidora.check_venta,
                "NombreCliente" : distribuidora.nomb_cliente,
                "Latitud" : distribuidora.latitud,
                "Longitud" : distribuidora.longitud,
                "OFICINA2" : distribuidora.oficina_two,
                "SUBCANAL" : distribuidora.subcanal,
                "SAP_SOLICITANTE" : distribuidora.sap_solicitante,
                "SAP_DESTINATARIO" : distribuidora.sap_destinatario,
                "diferenciaL" : distribuidora.diferencial,
                "Canal Atencion" : distribuidora.canal_atencion,
                "COD_SOLICITANTE" : distribuidora.cod_solicitante,
                "COD_DESTINATARIO" : distribuidora.cod_destinatario,
                "CANAL_TRADE" : distribuidora.canal_trade
            })
        })

        
        const encabezado = ['CodigoDistribuidor', 'Region', 'Supervisor', 'Localidad', 'NombreDistribuidor', 'CheckVentas', 'NombreCliente', 'Latitud', 'Longitud', 'OFICINA2', 'SUBCANAL', 'SAP_SOLICITANTE', 'SAP_DESTINATARIO', 'diferencial', 'Canal Atencion', 'COD_SOLICITANTE', 'COD_DESTINATARIO', 'CANAL_TRADE']
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(data_excel, encabezado)

        const columnas = [
            { wch: 30 },{ wch: 15 },{ wch: 20 },{ wch: 20 },{ wch: 30 },{ wch: 15 },{ wch: 35 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 15 },{ wch: 35 },{ wch: 35 },{ wch: 15 },{ wch: 20 },{ wch: 20 },{ wch: 20 },{ wch: 15 },
        ]

        worksheet['!cols'] = columnas

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

        const nombre_excel = 'Maestra Distribuidoras-'+Math.random().toString(24).substr(2, 6)+'.xlsx';
        const ubicacion_excel = 'src/public/DescargarData/Maestra Clientes/'+nombre_excel

        XLSX.writeFile(workbook, ubicacion_excel)

        res.status(200)
        res.json({
            message : 'Se descargó exitosamente.',
            respuesta : true,
            data : nombre_excel
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