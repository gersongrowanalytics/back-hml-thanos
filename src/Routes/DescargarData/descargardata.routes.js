const express = require('express')
const router = express.Router()

// Middlewares
const authMiddleware = require('../../Middleware/authMiddleware')
const permissionMiddleware = require('../../Middleware/permissionMiddleware')

// Controllers
const ValDescargarHomologados = require('../../Controllers/Validations/DescargarData/DescargarHomologados/ValDescargarHomologados')
const ValDescargarMasterDistribuidoras = require('../../Controllers/Validations/DescargarData/DescargarMasterDistribuidoras/ValDescargarMasterDistribuidoras')
const ValDescargarMasterProductos = require('../../Controllers/Validations/DescargarData/DescargarMasterProductos/ValDescargarMasterProductos')
const ValDescargarMasterClientesGrow = require('../../Controllers/Validations/DescargarData/DescargarMasterClientesGrow/ValDescargarMasterClientesGrow')
const ValDescargarInventarios = require('../../Controllers/Validations/DescargarData/DescargarInventarios/ValDescargarInventarios')
const ValDescargarMasterProductosGrow = require('../../Controllers/Validations/DescargarData/DescargarMasterProductosGrow/ValDescargarMasterProductosGrow')
const ValDescargarMasterProductosSo = require('../../Controllers/Validations/DescargarData/DescargarMasterProductosSo/ValDescargarMasterProductosSo')
const ValRemoveDescargarExcel = require('../../Controllers/Validations/DescargarData/RemoveDescargarExcel/ValRemoveDescargarExcel')
const ValDescargarNoHomologados = require('../../Controllers/Validations/DescargarData/DescargarNoHomologados/ValDescargarNoHomologados')


const protectedRoutes = express.Router();
// protectedRoutes.use(authMiddleware);


// **** **** **** **** **** //
// RUTAS DESCARGAR PRODUCTOS HOMOLOGADOS - NO HOMOLOGADOS
// **** **** **** **** **** //
protectedRoutes.post('/products-approveds', ValDescargarHomologados.ValDescargarHomologados)
protectedRoutes.post('/products-non-approveds', ValDescargarNoHomologados.ValDescargarNoHomologados)
protectedRoutes.post('/distributors', ValDescargarMasterDistribuidoras.ValDescargarMasterDistribuidoras)
protectedRoutes.post('/products', ValDescargarMasterProductos.ValDescargarMasterProductos)
protectedRoutes.post('/products-so', ValDescargarMasterProductosSo.ValDescargarMasterProductosSo)
protectedRoutes.post('/master-products', ValDescargarMasterProductosGrow.ValDescargarMasterProductosGrow)
protectedRoutes.post('/master-clients', ValDescargarMasterClientesGrow.ValDescargarMasterClientesGrow)
protectedRoutes.post('/inventories', ValDescargarInventarios.ValDescargarInventarios)
protectedRoutes.post('/remove-excel', ValRemoveDescargarExcel.ValRemoveDescargarExcel)

protectedRoutes.get('/download-file/:type/:namefile', (req, res) => {

    const req_type = req.params.type;
    const req_namefile = req.params.namefile;
    
    let ubicacion = ""

    if(req_type == "products"){
        ubicacion = "public/DescargarData/Maestra Productos/"+req_namefile
    }else if(req_type == "distributors"){
        ubicacion = "public/DescargarData/Maestra Clientes/"+req_namefile
    }else if(req_type == "products-so"){
        ubicacion = "public/DescargarData/Homologaciones/"+req_namefile
    }
  
    res.download(ubicacion, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Ocurrió un error al descargar el archivo.');
        }
    });
});


router.use('/descargar-data', protectedRoutes);

module.exports = router