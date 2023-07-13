const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValMostrarEstadoPendiente = require('../../Controllers/Validations/Status/EstadoPendiente/MostrarEstadoPendiente')
const ValActualizarStatusHomologacion = require('../../Controllers/Validations/Status/EstadoPendiente/ActualizarStatusHomologacion')
const ValCrearAmbienteStatus = require('../../Controllers/Validations/Status/CrearAmbienteStatus/CrearAmbienteStatus')
const ValActualizarStatusBaseDatos = require('../../Controllers/Validations/Status/EstadoPendiente/ActualizarStatusBaseDatos')
const ValEmailPedingStatus = require('../../Controllers/Validations/Status/EstadoPendiente/ValEmailPedingStatus')
const ValEmailPedingStatusDts = require('../../Controllers/Validations/Status/EstadoPendiente/ValEmailPedingStatusDts')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS STATUS
// **** **** **** **** **** //
protectedRoutes.post('/show/pending-states', ValMostrarEstadoPendiente.ValMostrarEstadoPendiente)
protectedRoutes.post('/edit/status-approval', ValActualizarStatusHomologacion.ValActualizarStatusHomologacion)
protectedRoutes.post('/config/create-environment', ValCrearAmbienteStatus.ValCrearAmbienteStatus)
protectedRoutes.post('/update/esp', ValActualizarStatusBaseDatos.ValActualizarStatusBaseDatos)
protectedRoutes.get('/mail-pending-status', ValEmailPedingStatus.ValEmailPedingStatus)
protectedRoutes.post('/mail-pending-status-dts', ValEmailPedingStatusDts.ValEmailPedingStatusDts)

router.use('/status', protectedRoutes);

module.exports = router