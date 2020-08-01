const http = require('http');
const express = require('express');
const io = require('socket.io');
const config = require('./config');
const gameRouter = require('./routers/gameRouter');
const socketRouter = require('./routers/socketRouter');
require(`./db/mongoose`);

const app = express();

// Static files serving
app.use('/static', express.static('static'));

// Game routes 
app.use('/game', gameRouter);

// All other requests not found
app.use('*', (req, res) => {
    res.status(404).send('Page not found.');
})


const server =  http.createServer(app);
const socketServer = io(server);

server.listen(config.PORT, () => {
    console.log(`Game server is running on port ${config.PORT}`);
})

socketRouter(socketServer);