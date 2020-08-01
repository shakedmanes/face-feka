document.addEventListener("DOMContentLoaded", function (event) {

    const socketsEvents = {
        GAME_READY: 'game_ready',
        CHANGE_GAME_STATE: 'change_game_state',
        PLAYERS_NAMES: 'players_names',
        PLAYER_NOTIFY_GAME_TURN: 'player_notify_game_turn'
    }

    const GameStatuses = {
        ACTIVE: 'ACTIVE',
        DONE: 'DONE',
        WAITING: 'WAITING',
    };

    // Extract token cookie
    const tokenCookie = (function() {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${'token'}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();  
        }
        return null;
    })();

    let gameField = new Array();
    let board = document.getElementById("game-table");
    let currentCol;
    let currentRow;
    let currentPlayer;
    let friendId;
    let myProperties = JSON.parse(atob(tokenCookie.split('.')[1]));
    let myGameId = myProperties._id;
    let myFullName = myProperties.fullName;
    let id = 1;

    console.log(myGameId);

    const socket = io.connect({
        query: `token=${tokenCookie}`
    });

    socket.open();    

    // Players names initialization
    socket.on(socketsEvents.PLAYERS_NAMES, (data) => {        
        document.getElementById('friendTagName').innerHTML = 
            data.players[data.players.indexOf(myFullName) === 0 ? 1 : 0];
    });

    socket.on(socketsEvents.GAME_READY, (game) => {
        friendId = game.players[game.players.indexOf(myGameId) === 0 ? 1 : 0]
        if (game.currentPlayer === myGameId) {
            changeGameStatus(`Your Turn!`);
        } else {
            changeGameStatus(`Friend's Turn...`);
        }
        newgame(game.currentPlayer);
    });

    socket.on(socketsEvents.CHANGE_GAME_STATE, (game) => {
        console.log(`Game state changed`);
        console.log(game);
        if (game.gameStatus === GameStatuses.ACTIVE) {
            if (game.currentPlayer === myGameId) {
                changeGameStatus(`Your Turn!`);

                // Update game state (friend move)
                currentRow = game.previousStep.row;
                currentCol = game.previousStep.col;
                placeDisc(friendId);

                // Your move
                placeDisc(myGameId);
            }
            else {
                changeGameStatus(`Friend's Turn...`);
            }

            

        } else if (game.gameStatus === GameStatuses.DONE) {
            if (currentPlayer === myGameId && game.winner !== myGameId) {
                // Update game state (friend move)
                currentRow = game.previousStep.row;
                currentCol = game.previousStep.col;
                placeDisc(friendId);
            }

            changeGameStatus(`Game is over, ${game.winner === myGameId ? 'the winner is you!': 'you lose.' }`);
        }
    });    

    function changeGameStatus(status) {
        document.getElementById('gameStatus').innerHTML = status;
    }

    function newgame(firstPlayer) {
        prepareField();
        if (firstPlayer === myGameId) {
            placeDisc(firstPlayer);
        }
    }

    function firstFreeRow(col, player) {
        for (var i = 0; i < 6; i++) {
            if (gameField[i][col] != 0) {
                break;
            }
        }
        gameField[i - 1][col] = player;
        return i - 1;
    }

    function possibleColumns() {
        var moves_array = new Array();
        for (var i = 0; i < 7; i++) {
            if (gameField[0][i] == 0) {
                moves_array.push(i);
            }
        }
        return moves_array;
    }

    function Disc(player) {
        this.player = player;
        this.color = player == myGameId ? 'red' : 'yellow';
        this.id = id.toString();
        this.dropped = false;
        id++;

        this.addToScene = function () {
            board.innerHTML += '<div id="d' + this.id + '" class="disc ' + this.color + '"></div>';
            if (currentPlayer === friendId) {                
                document.getElementById('d' + this.id).style.left = (14 + 60 * currentCol) + "px";
                dropDisc(this.id, currentPlayer);
            }
        }

        var $this = this;
        document.onmousemove = function (evt) {
            if (currentPlayer == myGameId && !$this.dropped) {
                currentCol = Math.floor((evt.clientX - board.offsetLeft) / 60);
                if (currentCol < 0) { currentCol = 0; }
                if (currentCol > 6) { currentCol = 6; }
                document.getElementById('d' + $this.id).style.left = (14 + 60 * currentCol) + "px";
                document.getElementById('d' + $this.id).style.top = "-55px";
            }
        }
        document.onload = function (evt) {
            if (currentPlayer == myGameId) {
                currentCol = Math.floor((evt.clientX - board.offsetLeft) / 60);
                if (currentCol < 0) { currentCol = 0; }
                if (currentCol > 6) { currentCol = 6; }
                document.getElementById('d' + $this.id).style.left = (14 + 60 * currentCol) + "px";
                document.getElementById('d' + $this.id).style.top = "-55px";
            }
        }

        document.onclick = function (evt) {
            if (currentPlayer == myGameId && !$this.dropped) {
                if (possibleColumns().indexOf(currentCol) != -1) {
                    dropDisc($this.id, $this.player);
                    $this.dropped = true;                    
                }
            }
        }
    }

    function dropDisc(cid, player) {
        currentRow = firstFreeRow(currentCol, player);
        moveit(cid, (14 + currentRow * 60));
        currentPlayer = player;
        if (player === myGameId) {
            socket.emit(socketsEvents.PLAYER_NOTIFY_GAME_TURN, { row: currentRow, col: currentCol }, (data) => console.log(data));
        }
    }

    function placeDisc(player) {
        currentPlayer = player;
        var disc = new Disc(player);
        disc.addToScene();
    }

    function prepareField() {
        gameField = new Array();
        for (var i = 0; i < 6; i++) {
            gameField[i] = new Array();
            for (var j = 0; j < 7; j++) {
                gameField[i].push(0);
            }
        }
    }

    function moveit(who, where) {
        document.getElementById('d' + who).style.top = where + 'px';
    }
});