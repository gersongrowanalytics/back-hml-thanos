const express = require('express')
const router = express.Router()
const routes_approvals = require('./Homologaciones/homologaciones.routes')
const routes_administration = require('./Administracion/administracion.routes')
const routes_carga_archivos = require('./CargaArchivos/cargaarchivos.routes')
const authMiddleware = require('../Middleware/authMiddleware')
const permissionMiddleware = require('../Middleware/permissionMiddleware')

// CONTROLADORES DE RUTAS
const Login = require('../Controllers/Validations/Login/Login')

const publicRoutes = express.Router();
publicRoutes.post('/log-in', Login.ValLogin)

router.use('/public', publicRoutes);

router.use(routes_approvals);
router.use(routes_administration);
router.use(routes_carga_archivos);

module.exports = router