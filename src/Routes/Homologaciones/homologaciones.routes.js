const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValMosNoHomController = require('../../Controllers/Validations/Homologaciones/NoHomologados/MostrarNoHomologados/ValMostrarNoHomologados')
const ValMosHomController = require('../../Controllers/Validations/Homologaciones/Homologados/MostrarHomologados/ValMostrarHomologados')
const ValMosProController = require('../../Controllers/Validations/Homologaciones/Helpers/MostrarProductos/ValMostrarProductos')
const ValRegHomController = require('../../Controllers/Validations/Homologaciones/NoHomologados/RegistrarHomologacion/ValRegistrarHomologacion')
const ValActHomController = require('../../Controllers/Validations/Homologaciones/Homologados/ActualizarHomologados/ValActualizarHomologados')

const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS HELPERS
// **** **** **** **** **** //
protectedRoutes.get('/get-master-products', ValMosProController.ValMostrarProductos)

// **** **** **** **** **** //
// RUTAS HOMOLOGACIONES
// **** **** **** **** **** //
protectedRoutes.get('/get-approved-products', ValMosHomController.ValMostrarHomologados)
protectedRoutes.post('/upload-approved', ValActHomController.ValActualizarHomologados)

// **** **** **** **** **** //
// RUTAS NO HOMOLOGACIONES
// **** **** **** **** **** //
protectedRoutes.post('/get-non-approved-products', ValMosNoHomController.ValMostrarNoHomologados)
protectedRoutes.post('/register-product', ValRegHomController.ValRegistrarHomologacion)

router.use('/approvals', protectedRoutes);

module.exports = router