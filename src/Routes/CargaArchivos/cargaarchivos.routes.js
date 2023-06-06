const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValDTManuales = require('../../Controllers/Validations/CargaArchivos/DTManuales/ValDTManuales')
const ValMasterClientes = require('../../Controllers/Validations/CargaArchivos/MasterClientes/ValMasterClientes')
const ValMasterDT = require('../../Controllers/Validations/CargaArchivos/MasterMateriales/ValMasterMateriales')
const ValMasterPrice = require('../../Controllers/Validations/CargaArchivos/MasterPrecios/ValMasterPrecios')
const ValMasterPriceXlsx = require('../../Controllers/Validations/CargaArchivos/MasterPrecios/ValMasterPreciosXlsx')
const ValDowloadGenerateUrl = require('../../Controllers/Validations/CargaArchivos/Helpers/ValDowloadGenerateUrl')

const ValMasterCliGrow = require('../../Controllers/Validations/CargaArchivos/MasterClientesGrow/MasterClientesGrow')
const ValMasterProGrow = require('../../Controllers/Validations/CargaArchivos/MasterProductosGrow/MasterProductosGrow')
const ValCarArchivoS3 = require('../../Controllers/Validations/CargaArchivos/CargaArchivoS3/CargaArchivoS3')

const ValMasterCliSof = require('../../Controllers/Validations/CargaArchivos/MasterClientesSoftys/MasterClientesSoftys')

const ValSellin = require('../../Controllers/Validations/CargaArchivos/SI/CargaSellin/Sellin')

const ValInventories = require('../../Controllers/Validations/CargaArchivos/Inventarios/ValInventarios')

const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS CARGAR DT MANUALES
// **** **** **** **** **** //
protectedRoutes.post('/dt-manuales', ValDTManuales.ValDTManuales)

// **** **** **** **** **** //
// RUTAS CARGAR MASTER CLIENTES
// **** **** **** **** **** //
protectedRoutes.post('/master-clientes', ValMasterClientes.ValMasterClientes)

// **** **** **** **** **** //
// RUTAS CARGAR MASTER MATERIALES
// **** **** **** **** **** //
protectedRoutes.post('/master-materiales', ValMasterDT.ValMasterMateriales)


// **** **** **** **** **** //
// RUTAS CARGAR SELLIN
// **** **** **** **** **** //
protectedRoutes.post('/upload-sellin', ValSellin.ValSellin)


// **** **** **** **** **** //
// RUTAS CARGAR SELLIN
// **** **** **** **** **** //
protectedRoutes.post('/inventories', ValInventories.ValIntenvarios)

// **** **** **** **** **** //
// RUTAS CARGAR MASTER CLIENTES GROW
// **** **** **** **** **** //
protectedRoutes.post('/master-clientes-grow', ValMasterCliGrow.ValMasterClientesGrow)

// **** **** **** **** **** //
// RUTAS CARGAR MASTER CLIENTES SOFTYS
// **** **** **** **** **** //
protectedRoutes.post('/master-clientes-softys', ValMasterCliSof.ValMasterClientesSoftys)

// **** **** **** **** **** //
// RUTAS CARGAR MASTER PRODUCTOS GROW
// **** **** **** **** **** //
protectedRoutes.post('/master-productos-grow', ValMasterProGrow.ValMasterProductosGrow)

// **** **** **** **** **** //
// RUTAS CARGAR ARCHIVO S3
// **** **** **** **** **** //
protectedRoutes.post('/guardar-s3', ValCarArchivoS3.ValCargaArchivoS3)

// **** **** **** **** **** //
// RUTAS DOWNLOAD EXCEL
// **** **** **** **** **** //
protectedRoutes.get('/generar-descarga', ValDowloadGenerateUrl.ValDowloadGenerateUrl)

// **** **** **** **** **** //
// RUTAS CARGAR MASTER PRECIOS
// **** **** **** **** **** //
protectedRoutes.post('/master-precios', function(req, res){

    if(req.files.master_precios['mimetype'] == 'text/csv'){
        ValMasterPrice.ValMasterPrecios(req, res)
    }else if(req.files.master_precios['mimetype'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
        ValMasterPriceXlsx.ValMasterPreciosXlsx(req, res)
    }else{
        res.status(500).json({
            response    : false,
            message     :'Archivo no valido'
        })
    }
})

router.use('/carga-archivos', protectedRoutes);

module.exports = router