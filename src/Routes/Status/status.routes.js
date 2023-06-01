const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValMostrarEstadoPendiente = require('../../Controllers/Validations/Status/EstadoPendiente/MostrarEstadoPendiente')
const ValActualizarStatusHomologacion = require('../../Controllers/Validations/Status/EstadoPendiente/ActualizarStatusHomologacion')
const ValCrearAmbienteStatus = require('../../Controllers/Validations/Status/CrearAmbienteStatus/CrearAmbienteStatus')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS STATUS
// **** **** **** **** **** //
protectedRoutes.post('/show/pending-states', ValMostrarEstadoPendiente.ValMostrarEstadoPendiente)
protectedRoutes.post('/edit/status-approval', ValActualizarStatusHomologacion.ValActualizarStatusHomologacion)
protectedRoutes.post('/config/create-environment', ValCrearAmbienteStatus.ValCrearAmbienteStatus)

router.use('/status', protectedRoutes);

module.exports = router