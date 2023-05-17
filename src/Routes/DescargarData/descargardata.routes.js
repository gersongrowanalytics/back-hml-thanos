const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValDescargarHomologados = require('../../Controllers/Validations/DescargarData/DescargarHomologados/ValDescargarHomologados')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS DESCARGAR PRODUCTOS HOMOLOGADOS
// **** **** **** **** **** //
protectedRoutes.post('/products-approveds', ValDescargarHomologados.ValDescargarHomologados)


router.use('/descargar-data', protectedRoutes);

module.exports = router