const { GameModel, GameStatuses } = require('../models/gameModel');

const GameController = {};

// Find first game which waiting to play or create new if theres no game waiting
GameController.getGame = 
    async function getGame(playerId) {
        const waitingGames = await GameModel.find({ gameStatus: GameStatuses.WAITING });

        if (waitingGames.length > 0) {
            let activeGame = await GameModel.findOneAndUpdate(
                { _id: waitingGames[0]._id },
                { 
                    $set: {
                        gameStatus: GameStatuses.ACTIVE,
                        players: [...waitingGames[0].players, playerId],
                        currentPlayer: Math.floor(Math.random() * 2) === 0 ? playerId : waitingGames[0].players[0]
                    }
                },
                { new: true });

            return activeGame;
        } else {
            const newGame = await GameModel.create({ players: [playerId] });
            return newGame;
        }
    };


    GameController.getUpdatedGame = 
    async function getUpdatedGame(gameId) {
        return await GameModel.findOne({ _id: gameId });
    };

// Checking game victory function
GameController.checkGameVictory =
    function checkGameVictory(gameBoard, location) {

        let {row, col} = location;

        function cellVal(row, col) {
            if (gameBoard[row] == undefined || gameBoard[row][col] == undefined) {
                return -1;
            } else {
                return gameBoard[row][col];
            }
        }

        function getAdj(row, col, row_inc, col_inc) {
            if (cellVal(row, col) == cellVal(row + row_inc, col + col_inc)) {
                return 1 + getAdj(row + row_inc, col + col_inc, row_inc, col_inc);
            } else {
                return 0;
            }
        }


        if (getAdj(row, col, 0, 1) + getAdj(row, col, 0, -1) > 2) {
            return true;
        } else {
            if (getAdj(row, col, 1, 0) > 2) {
                return true;
            } else {
                if (getAdj(row, col, -1, 1) + getAdj(row, col, 1, -1) > 2) {
                    return true;
                } else {
                    if (getAdj(row, col, 1, 1) + getAdj(row, col, -1, -1) > 2) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    };

// Add disc to game board and update game state
GameController.addDiscToGame = 
    async function addDiscToGame(game, location, playerId) {
        let newGameBoard = [...game.gameBoard];
        newGameBoard[location.row][location.col] = playerId;

        return await GameModel.findOneAndUpdate(
            { _id: game._id },
            { 
                $set: { 
                    gameBoard: newGameBoard,
                    currentPlayer: game.players.filter((player) => player !== playerId)[0],
                    ...(GameController.checkGameVictory(newGameBoard, location) ? 
                        { gameStatus: GameStatuses.DONE, winner: playerId }: {}
                       )
                },
            },
            { new: true }
        )
    };

module.exports = GameController;