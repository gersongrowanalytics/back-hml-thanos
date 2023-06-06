const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValMosNoHomController = require('../../Controllers/Validations/Homologaciones/NoHomologados/MostrarNoHomologados/ValMostrarNoHomologados')
const ValMostrarUniqueNoHomologadoController = require('../../Controllers/Validations/Homologaciones/NoHomologados/MostrarNoHomologados/ValMostrarUniqueNoHomologado')
const ValMosHomController = require('../../Controllers/Validations/Homologaciones/Homologados/MostrarHomologados/ValMostrarHomologados')
const ValMosProController = require('../../Controllers/Validations/Homologaciones/Helpers/MostrarProductos/ValMostrarProductos')
const ValRegHomController = require('../../Controllers/Validations/Homologaciones/NoHomologados/RegistrarHomologacion/ValRegistrarHomologacion')
const ValActHomController = require('../../Controllers/Validations/Homologaciones/Homologados/ActualizarHomologados/ValActualizarHomologados')
const ValActProHom = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/ActualizarHomologacion')
const ValMosNoHomMasterController = require('../../Controllers/Validations/Homologaciones/NoHomologados/MostrarNoHomologadosMaster/MostrarNoHomologadosMaster')
const ValMostrarHomologadosMasterController = require('../../Controllers/Validations/Homologaciones/Homologados/MostrarHomologadosMaster/MostrarHomologadosMaster')
const ValMosPaqBulProController = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/PaquetexBultoProducto/PaquetexBultoProducto')
const ValObtenerInfoSI = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/SI/InfoSI/InfoSI')
const ValObtenerInfoSO = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/SO/InfoSO/InfoSO')
const ValObtenerInfoMasterPrecios   = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/MasterPrecios/ValInfoMasterPrecios')
const ValObtenerInfoInvController = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/InfoInventarios/InfoInventarios')
const ValActualizarInventarios = require('../../Controllers/Validations/Homologaciones/NoHomologados/ActualizarHomologacion/Inventarios/ActualizarInventario/ActualizarInventario')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS HELPERS
// **** **** **** **** **** //
protectedRoutes.post('/get-master-products', ValMosProController.ValMostrarProductos)

// **** **** **** **** **** //
// RUTAS HOMOLOGACIONES
// **** **** **** **** **** //
protectedRoutes.get('/get-approved-products', ValMosHomController.ValMostrarHomologados)
protectedRoutes.post('/upload-approved', ValActHomController.ValActualizarHomologados)
protectedRoutes.post('/get-approved-product', ValMostrarHomologadosMasterController.ValMostrarHomologadosMaster)

// **** **** **** **** **** //
// RUTAS NO HOMOLOGACIONES
// **** **** **** **** **** //
protectedRoutes.post('/get-non-approved-products', ValMosNoHomController.ValMostrarNoHomologados)
protectedRoutes.post('/get-unique-non-approved-product', ValMostrarUniqueNoHomologadoController.ValMostrarUniqueNoHomologado)
protectedRoutes.post('/register-product', ValRegHomController.ValRegistrarHomologacion)
protectedRoutes.post('/update-non-approved-products', ValActProHom.ValActualizarHomologacion)
protectedRoutes.post('/get-non-approved-product', ValMosNoHomMasterController.ValMostrarNoHomologadosMaster)
protectedRoutes.post('/get-paqxbul-product', ValMosPaqBulProController.ValObtenerPaquetexBultoProduto)

protectedRoutes.post('/get-si', ValObtenerInfoSI.ValObtenerInfoSI)
protectedRoutes.post('/get-so', ValObtenerInfoSO.ValObtenerInfoSO)
protectedRoutes.post('/get-inv', ValObtenerInfoInvController.ValInfoInventarios)

protectedRoutes.post('/update-inv', ValActualizarInventarios.ValActualizarInventario)

protectedRoutes.post('/get-master-price', ValObtenerInfoMasterPrecios.ValObtenerInfoMasterPrecios)


router.use('/approvals', protectedRoutes);

module.exports = router