const express = require('express')
const router = express.Router()

const ValCrearUsuarios = require('../../Controllers/Validations/Administrar/CrearUsuarios/ValCrearUsuarios')
const protectedRoutes = express.Router()

protectedRoutes.post('/create-users', ValCrearUsuarios.ValCrearUsuarios)

router.use('/manage', protectedRoutes)

module.exports = router