const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true
};

const GameStatuses = {
  ACTIVE: 'ACTIVE',
  DONE: 'DONE',
  WAITING: 'WAITING',
};

const GameSchema = new mongoose.Schema({
  gameBoard: {
      type: Array,
      required: true,
      default: (
        function(){
          const gameField = new Array();
          for (var i = 0; i < 6; i++) {
            gameField[i] = new Array();
            for (var j = 0; j < 7; j++) {
              gameField[i].push(0);
            }
          }
          return gameField;
        }
      )()
  },
  players: {
    type: Array,
    required: true
  },
  currentPlayer: {
    type: String,
    default: null,
  },
  gameStatus: {
    type: String,
    required: true,
    enum: Object.keys(GameStatuses),
    default: GameStatuses.WAITING,
  },
  winner: {
    type: String,
    default: null
  }
}, schemaOptions);

const GameModel = mongoose.model('Game', GameSchema);

module.exports = {
  GameModel,
  GameStatuses
};