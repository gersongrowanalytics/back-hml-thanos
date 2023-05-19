const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValDescargarHomologados = require('../../Controllers/Validations/DescargarData/DescargarHomologados/ValDescargarHomologados')
const ValDescargarMasterDistribuidoras = require('../../Controllers/Validations/DescargarData/DescargarMasterDistribuidoras/ValDescargarMasterDistribuidoras')
const ValDescargarMasterProductos = require('../../Controllers/Validations/DescargarData/DescargarMasterProductos/ValDescargarMasterProductos')
const ValDescargarMasterProductosSo = require('../../Controllers/Validations/DescargarData/DescargarMasterProductosSo/ValDescargarMasterProductosSo')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS DESCARGAR PRODUCTOS HOMOLOGADOS
// **** **** **** **** **** //
protectedRoutes.post('/products-approveds', ValDescargarHomologados.ValDescargarHomologados)
protectedRoutes.post('/distributors', ValDescargarMasterDistribuidoras.ValDescargarMasterDistribuidoras)
protectedRoutes.post('/products', ValDescargarMasterProductos.ValDescargarMasterProductos)
protectedRoutes.post('/products-so', ValDescargarMasterProductosSo.ValDescargarMasterProductosSo)


router.use('/descargar-data', protectedRoutes);

module.exports = router