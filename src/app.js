const express = require("express")
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const route = require('./Routes/index')
const socketHandler = require('./Socket/socket');

const app = express()
app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.json())
app.use(route)

app.get("/", (req, res) => {
    res.send("Hola Mundo desde el home")
})

const server = http.createServer(app);
const io = socketIO(server);

socketHandler(io);

server.listen(8002, () => {
    console.log('Express en Lineas en el puerto 8002')
})