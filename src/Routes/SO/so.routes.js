const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValObtenerInfoSO = require('../../Controllers/Validations/SO/InfoSO.js/InfoSO')

const protectedRoutes = express.Router();

// **** **** **** **** **** //
// RUTAS SO
// **** **** **** **** **** //
protectedRoutes.post('/get-info', ValObtenerInfoSO.ValObtenerInfoSO)

router.use('/so', protectedRoutes);

module.exports = router