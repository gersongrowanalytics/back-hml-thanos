const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValMosPro = require('../../Controllers/Validations/Administracion/Productos/MostrarProductos/ValMostrarProductos')
const ValMosDts = require('../../Controllers/Validations/Administracion/Distribuidoras/MostrarDistribuidoras/ValMostrarDistribuidoras')
const ValCrePro = require('../../Controllers/Validations/Administracion/Productos/CrearProducto/ValCrearProducto')
const ValEdiPro = require('../../Controllers/Validations/Administracion/Productos/EditarProducto/ValEditarProducto')
const ValEdiDts = require('../../Controllers/Validations/Administracion/Distribuidoras/EditarDistribuidora/ValEditarDistribuidora')
const ValCreDts = require('../../Controllers/Validations/Administracion/Distribuidoras/CrearDistribuidora/ValCrearDistribuidora')

const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS PRODUCTOS
// **** **** **** **** **** //
protectedRoutes.get('/get-products', ValMosPro.ValMostrarProductos)
protectedRoutes.post('/create-product', ValCrePro.ValCrearProducto)
protectedRoutes.post('/edit-product', ValEdiPro.ValEditarProducto)

// **** **** **** **** **** //
// RUTAS DISTRIBUIDORAS
// **** **** **** **** **** //
protectedRoutes.get('/get-distributors', ValMosDts.ValMostrarDistribuidoras)
protectedRoutes.post('/create-distributors', ValCreDts.ValCrearDistribuidora)
protectedRoutes.post('/edit-distributors', ValEdiDts.ValEditarDistribuidora)

router.use('/administration', protectedRoutes);

module.exports = router