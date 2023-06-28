const express = require("express")
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const route = require('./Routes/index')
const socketHandler = require('./Socket/socket');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
const { swaggerDocs } = require('./Routes/api-docs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


const app = express()
app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json())
app.use(route)

app.get("/", (req, res) => {
    res.send("Hola Mundo desde el home")
})

app.post("/eliminar-cli-grow", async (req, res) => {

    let id_clientes = []
    let id_repetidos = []

    const mcs = await prisma.masterclientes_grow.findMany({})

    for await (const mc of mcs){
        const existe = id_clientes.findIndex(idc =>  idc.codigo_destinatario == mc.codigo_destinatario )
        if(existe == -1){
            id_clientes.push({id: mc.id, codigo_destinatario : mc.codigo_destinatario, cantidad : 1})
        }else{
            id_clientes[existe]['cantidad'] = id_clientes[existe]['cantidad'] + 1
        }
    }

    id_clientes.forEach(element => {
        if(element.cantidad > 1){
            id_repetidos.push(element)
        }
    });

    let eliminar_no_enlazados = []
    let id_enlazado = []

    for await (const rep of id_repetidos){
        const existe_ventas = await prisma.ventas_so.findMany({
            where : {
                m_cl_grow : rep.id
            }
        })

        const existe_esp = await prisma.espestadospendientes.findMany({
            where : {
                m_cl_grow : rep.id
            }
        })

        const existe_master = await prisma.master_productos_so.findMany({
            where : {
                m_cl_grow : rep.id
            }
        })

        if(existe_ventas.length == 0 && existe_master.length == 0 && existe_esp.length == 0){
            eliminar_no_enlazados.push(rep.codigo_destinatario)
        }else{
            id_enlazado.push({id: rep.id, codigo: rep.codigo_destinatario})
        }
    }

    
    const array_no_enlazados = []
    for await (const noenl of eliminar_no_enlazados){

        const mc_noenl = await prisma.masterclientes_grow.findMany({
            where : {
                codigo_destinatario : noenl
            },
            select : {
                id : true,
                codigo_destinatario : true
            }
        })

        let ids = []
        mc_noenl.forEach((ele, index) => {
            if(index != 0){
                ids.push(ele.id)
            }
        });

        array_no_enlazados.push({id : ids, codigo : mc_noenl.codigo_destinatario})
    }

    const array_enlazados = []
    for await (const enl of id_enlazado){

        const mc_enl = await prisma.masterclientes_grow.findMany({
            where : {
                codigo_destinatario : enl.codigo
            },
            select : {
                id : true,
                codigo_destinatario : true
            }
        })

        let ids = []
        mc_enl.forEach((ele, index) => {
            if(index != 0){
                ids.push(ele.id)
            }
        });

        array_enlazados.push({id : ids, codigo : mc_enl.codigo_destinatario})
    }
    
    for await (const enl of array_no_enlazados){
        await prisma.masterclientes_grow.deleteMany({
            where  : {
                id : {
                    in : enl.id
                }
            }
        })
    }

    for await (const enl of array_enlazados){
        await prisma.masterclientes_grow.deleteMany({
            where  : {
                id : {
                    in : enl.id
                }
            }
        })
    }

    res.status(200).json({ok:'ok'})
})

const server = http.createServer(app);
const io = socketIO(server);

socketHandler(io);

server.listen(8002, () => {
    console.log('Express en Lineas en el puerto 8002')
    swaggerDocs(app, 8002)
})