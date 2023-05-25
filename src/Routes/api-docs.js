const swaggerJSDoc      = require('swagger-jsdoc')
const swaggerUI         = require('swagger-ui-express')
const swaggerDocument   =  require('./swagger.json')
const path = require('path');
const fs = require('fs');

const jsonData = require('../Routes/Swagger/swagger')

const docsPath = path.join(__dirname, 'Swagger');

// fs.writeFile('data.json', jsonData, 'utf8', function(err) {
//     if (err) {
//       console.log('Error al escribir en el archivo:', err);
//     } else {
//       console.log('Archivo JSON creado exitosamente.');
//     }
// });

const swaggerOptions = {
    definition : {
        openapi : '3.0.0',
        info    : { title : 'Api Swagger', version: '1.0.0'}
    },
    swaggerDefinition : {
        info : {
            version     : '1.0.0',
            title       : 'Documentación Corporativa V2',
            description : 'Documentación API',
            contact     : {
                name    : 'Grow',
                url     : 'Grow Analytics'
            }
        },
        servers : ['http://127.0.0.1:8002']
    },
    apis        : ['src/Routes/index.js']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)
const swaggerDocs = (app, port) => {
    app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
}

module.exports = { swaggerDocs }