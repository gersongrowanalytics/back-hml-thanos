const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValObtenerInfoSO              = require('../../Controllers/Validations/SO/InfoSO.js/InfoSO')
const ValObtenerInfoMasterPrecios   = require('../../Controllers/Validations/CargaArchivos/MasterPrecios/ValInfoMasterPrecios')

const protectedRoutes = express.Router();

// **** **** **** **** **** //
// RUTAS SO
// **** **** **** **** **** //
protectedRoutes.post('/get-so', ValObtenerInfoSO.ValObtenerInfoSO)
protectedRoutes.post('/get-master-price', ValObtenerInfoMasterPrecios.ValObtenerInfoMasterPrecios)

router.use('/info', protectedRoutes);

module.exports = router