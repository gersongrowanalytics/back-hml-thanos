const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')
const CreateAudits = require('../../Controllers/Validations/Audits/CreateAudits/CreateAudits')

const protectedRoutes = express.Router();

protectedRoutes.post('/audits-create', CreateAudits.ValCreateAudits)

router.use('/audits', protectedRoutes);

module.exports = router