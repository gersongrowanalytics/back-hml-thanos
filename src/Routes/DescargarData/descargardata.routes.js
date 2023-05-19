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