const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValDTManuales = require('../../Controllers/Validations/CargaArchivos/DTManuales/ValDTManuales')
const ValMasterClientes = require('../../Controllers/Validations/CargaArchivos/MasterClientes/ValMasterClientes')
const ValMasterDT = require('../../Controllers/Validations/CargaArchivos/MasterMateriales/ValMasterMateriales')


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
// RUTAS CARGAR MASTER DISTRIBUIDORAS
// **** **** **** **** **** //
protectedRoutes.post('/master-distribuidoras', ValMasterDT.ValMasterMateriales)

router.use('/carga-archivos', protectedRoutes);

module.exports = router