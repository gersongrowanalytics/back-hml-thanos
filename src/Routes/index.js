const express = require('express')
const router = express.Router()
const routes_approvals = require('./Homologaciones/homologaciones.routes')
const routes_administration = require('./Administracion/administracion.routes')
const routes_carga_archivos = require('./CargaArchivos/cargaarchivos.routes')
const routes_administrar = require('./Administrar/administrar.routes')
const UserValidation = require('../Controllers/Validations/Login/ValUserValidation')
const authMiddleware = require('../Middleware/authMiddleware')
const permissionMiddleware = require('../Middleware/permissionMiddleware')

const protectedRoutes = express.Router();
protectedRoutes.use(authMiddleware);

// CONTROLADORES DE RUTAS
const Login = require('../Controllers/Validations/Login/Login')

const publicRoutes = express.Router();
publicRoutes.post('/log-in', Login.ValLogin)
protectedRoutes.get('/validation-user', UserValidation.ValUserValidation)

router.use('/public', publicRoutes);
router.use('/protected', protectedRoutes);

router.use(routes_approvals);
router.use(routes_administration);
router.use(routes_carga_archivos);
router.use(routes_administrar);

module.exports = router