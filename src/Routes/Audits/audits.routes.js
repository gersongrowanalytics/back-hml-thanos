const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')
const CreateAudits = require('../../Controllers/Validations/Audits/CreateAudits/CreateAudits')
const ShowAudits = require('../../Controllers/Validations/Audits/ShowAudits/ValShowAudits')

const protectedRoutes = express.Router();

protectedRoutes.post('/audits-create', CreateAudits.ValCreateAudits)
protectedRoutes.post('/audits-show', ShowAudits.ValShowAudits)

router.use('/audits', protectedRoutes);

module.exports = router