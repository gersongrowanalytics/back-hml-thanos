const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')
const ShowDate = require('../../Controllers/Validations/Date/ShowDate/ValShowDate')

const protectedRoutes = express.Router();

protectedRoutes.post('/show-date', ShowDate.ValShowDate)

router.use('/date', protectedRoutes);

module.exports = router