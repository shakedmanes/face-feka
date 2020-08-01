const jwt = require('jsonwebtoken');
const GameController = require('../controllers/gameController');
const GameStatuses = require('../models/gameModel').GameStatuses;
const config = require('../config');

function socketRouter(masterSocket) {

    // Authentication middleware to socket 
    masterSocket.use(function(socket, next) {
        if (socket.handshake.query && socket.handshake.query.token){            
            jwt.verify(socket.handshake.query.token, config.SECRET, function(err, decoded) {
              if (err) return next(new Error('Authentication error'));              
              socket.decoded = decoded;
              next();
            });
          }
          else {
            next(new Error('Authentication error'));
          }    
        }
    );

    masterSocket.on('connection', async (socket) => {        

        // Find new / already started game to join
        let game = await GameController.getGame(socket.decoded._id);
        
        // Add the socket to the game room        
        socket.join(game._id);        

        // Game is already started by other player or new player just connected
        if (game.gameStatus === GameStatuses.ACTIVE) {           

            let players = getClientsSocket(masterSocket, game._id).map((socket) => socket.decoded.fullName);

            // Send all players names
            masterSocket.to(game._id).emit(config.SOCKET_EVENTS.PLAYERS_NAMES, { players });            
            
            masterSocket.to(game._id).emit(config.SOCKET_EVENTS.GAME_READY, game.toJSON());
        }

        // When someone is playing
        socket.on(config.SOCKET_EVENTS.PLAYER_NOTIFY_GAME_TURN, async (location) => {
            game = await GameController.getUpdatedGame(game._id);
            let playerId = socket.decoded._id;

            game = await GameController.addDiscToGame(game, location, playerId);            

            masterSocket.to(game._id).emit(config.SOCKET_EVENTS.CHANGE_GAME_STATE, {                
                currentPlayer: game.currentPlayer,
                previousStep: location,
                gameStatus: game.gameStatus,
                ...(game.gameStatus === GameStatuses.DONE ? { winner: playerId } : {} )
            });
        });

    });
}

// Gets all clients of specific room
function getClientsSocket(io, roomId) {
    let clientSockets = [];
    let allClientsInRoom = Object.keys(io.sockets.adapter.rooms[roomId].sockets);
    
    for (let clientId of allClientsInRoom) {        
        clientSockets.push(io.sockets.sockets[clientId]);
    }
    
    return clientSockets;
}

module.exports = socketRouter;