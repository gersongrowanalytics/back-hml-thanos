const express = require('express')
const router = express.Router()

const ValCrearUsuarios = require('../../Controllers/Validations/Administrar/CrearUsuarios/ValCrearUsuarios')
const ValObtenerTiposUsuarios = require('../../Controllers/Validations/Administrar/TiposUsuarios/ObtenerTiposUsuarios/ObtenerTiposUsuarios')
const ValObtenerTipoUsuario = require('../../Controllers/Validations/Administrar/TiposUsuarios/ObtenerTipoUsuario/ObtenerTipoUsuario')
const ValObtenerTipoUsuarioNuevo = require('../../Controllers/Validations/Administrar/TiposUsuarios/ObtenerTipoUsuario/ObtenerTipoUsuarioNuevo')

const ValEditarTipoUsuario = require('../../Controllers/Validations/Administrar/TiposUsuarios/EditarTipoUsuario/EditarTipoUsuario')
const ValCrearTipoUsuario = require('../../Controllers/Validations/Administrar/TiposUsuarios/CrearTipoUsuario/CrearTipoUsuario')
const ValEliminarTipoUsuario = require('../../Controllers/Validations/Administrar/TiposUsuarios/EliminarTipoUsuario/EliminarTipoUsuario')
const ValObtenerPermisos = require('../../Controllers/Validations/Administrar/Permisos/ObtenerPermisos/ObtenerPermisos')
const ValObtenerPermiso = require('../../Controllers/Validations/Administrar/Permisos/ObtenerPermiso/ObtenerPermiso')
const ValEliminarPermiso = require('../../Controllers/Validations/Administrar/Permisos/EliminarPermiso/EliminarPermiso')
const ValEditarPermiso = require('../../Controllers/Validations/Administrar/Permisos/EditarPermiso/EditarPermiso')

const ValObtenerUsuarios = require('../../Controllers/Validations/Administrar/Usuarios/MostrarUsuarios/MostrarUsuarios')

const protectedRoutes = express.Router()

protectedRoutes.post('/create-users', ValCrearUsuarios.ValCrearUsuarios)
protectedRoutes.post('/get-types-users', ValObtenerTiposUsuarios.ValObtenerTiposusuarios)
protectedRoutes.post('/get-type-user', ValObtenerTipoUsuario.ValObtenerTipousuario)
protectedRoutes.post('/get-type-user-new', ValObtenerTipoUsuarioNuevo.ValObtenerTipousuarioNuevo)
protectedRoutes.post('/edit-type-user', ValEditarTipoUsuario.ValEditarTipoUsuario)
protectedRoutes.post('/create-type-user', ValCrearTipoUsuario.ValCrearTipoUsuario)
protectedRoutes.post('/delete-type-user', ValEliminarTipoUsuario.ValEliminarTipoUsuario)

protectedRoutes.post('/get-permissions', ValObtenerPermisos.ValObtenerPermisos)
protectedRoutes.post('/get-permission', ValObtenerPermiso.ValObtenerPermiso)
protectedRoutes.post('/delete-permission', ValEliminarPermiso.ValEliminarPermiso)
protectedRoutes.post('/edit-permission', ValEditarPermiso.ValEditarPermiso)


protectedRoutes.post('/get-users', ValObtenerUsuarios.ValMostrarUsuarios)

router.use('/manage', protectedRoutes)

module.exports = router