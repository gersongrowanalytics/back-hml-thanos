const express = require('express')
const router = express.Router()
const routes_approvals = require('./Homologaciones/homologaciones.routes')
const routes_administration = require('./Administracion/administracion.routes')
const routes_carga_archivos = require('./CargaArchivos/cargaarchivos.routes')
const routes_administrar = require('./Administrar/administrar.routes')
const routes_descargar_data = require('./DescargarData/descargardata.routes')
const UserValidation = require('../Controllers/Validations/Login/ValUserValidation')
const ValTokenUsuario = require('../Controllers/Validations/Administrar/TokenUsuario/ValTokenUsuario')
const LogOut = require('../Controllers/Validations/Login/ValLogOut')
const routes_status = require('./Status/status.routes')
const authMiddleware = require('../Middleware/authMiddleware')
const permissionMiddleware = require('../Middleware/permissionMiddleware')

const protectedRoutes = express.Router();
protectedRoutes.use(authMiddleware);

// CONTROLADORES DE RUTAS
const Login = require('../Controllers/Validations/Login/Login')
const MigrarVentas = require('../Controllers/Methods/Reprocesos/BDAthena/MigrarVentas')
const MigrarInventario = require('../Controllers/Methods/Reprocesos/BDAthena/MigrarInventario')

const publicRoutes = express.Router();
publicRoutes.post('/athena-ventas', MigrarVentas.MetMigrarVentas)
publicRoutes.post('/athena-inventario', MigrarInventario.MetMigrarInventario)
publicRoutes.post('/log-in', Login.ValLogin)
protectedRoutes.get('/validation-user', UserValidation.ValUserValidation)
protectedRoutes.get('/log-out', LogOut.ValLogOut)
protectedRoutes.post('/token-user', ValTokenUsuario.ValTokenUsuario)

router.use('/public', publicRoutes);
router.use('/protected', protectedRoutes);

router.use(routes_approvals);
router.use(routes_administration);
router.use(routes_carga_archivos);
router.use(routes_administrar);
router.use(routes_descargar_data);
router.use(routes_status);

module.exports = router