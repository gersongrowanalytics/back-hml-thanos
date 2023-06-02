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