const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const MetActYTDMTD = require('../../Controllers/Methods/Actualizaciones/ActualizarYTDMTD')

const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS ACTUALIZACION YTD MTD
// **** **** **** **** **** //
protectedRoutes.get('/actualizar-ytd-mtd', MetActYTDMTD.MetActualizarYTDMTD)
protectedRoutes.get('/actualizar-clientes-products-so', MetActYTDMTD.MetActualizarMClientes)

router.use('/actualizaciones', protectedRoutes);

module.exports = router