const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValMostrarEstadoPendiente = require('../../Controllers/Validations/Status/EstadoPendiente/MostrarEstadoPendiente')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS STAUS
// **** **** **** **** **** //
protectedRoutes.post('/show/pending-states', ValMostrarEstadoPendiente.ValMostrarEstadoPendiente)


router.use('/status', protectedRoutes);

module.exports = router