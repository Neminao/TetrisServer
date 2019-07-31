/*var app = require('http').createServer()
var io = module.exports.io = require('socket.io')(app)

const PORT = process.env.PORT || 3231

const SocketManager = require('./SocketManager')

io.on('connection', SocketManager)

app.listen(PORT, ()=>{
	console.log("Connected to port:" + PORT);
})
*/


const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = module.exports.io = require('socket.io')(server);

const PORT = process.env.PORT || 3231

app.use(express.static(path.join(__dirname, '../..build')));

app.get('/', (req,res,next) => {
	res.sendFile(__dirname+'./index.html')
});

const SocketManager = require('./SocketManager')

io.on('connection', SocketManager)

server.listen(PORT);