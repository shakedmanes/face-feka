const connection = new WebSocket('ws://localhost:9090');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;

'<?php$session = mt_rand(1,999);?>'
let car1 = new Image();
let car2 = new Image();
let cone = new Image();
let background = new Image();
let money = new Image();
let road = new Image();
let current_player_arrow = new Image();
let speedSound;
let basePos = 0;
let carPlace = 0;
let myMoney = 0;
let otherMoney = 0;
let matrix = [];
let smallDigits = [new Image(),new Image(),new Image(),new Image(),new Image(),
    new Image(),new Image(),new Image(),new Image(),new Image()];
let baseCar1;
let baseCar2;
let car1y;
let car2y;

for (let i = 0; i < 6; i++) {
    matrix[i] = new Array(3);
}

function loadGame() {
    canvas.style.border = "1px solid black";
    background.onload = function () {
        context.drawImage(background, basePos, basePos, background.width, background.height, basePos, basePos, canvas.width, canvas.height);
    };


    road.onload = function () {
        context.drawImage(road, basePos, canvas.height * 0.1, canvas.width, road.height * 3);
        context.drawImage(road, basePos, canvas.height * 0.6, canvas.width, road.height * 3);
        baseCar1 = canvas.height * 0.1 + road.height;
        baseCar2 = canvas.height * 0.6 + road.height;
        car1y = baseCar1;
        car2y = baseCar2;
    };

    car1.onload = function () {
        context.drawImage(car1, basePos, car1y);
    };
    car2.onload = function () {
        context.drawImage(car2, basePos, car2y);
    };

    smallDigits.onload = function() {
        context.drawImage(smallDigits[myMoney], basePos + 20, car1y - 30);
        context.drawImage(smallDigits[otherMoney], basePos + 20, car2y - 30);
    };

    current_player_arrow.onload = function () {
        context.drawImage(current_player_arrow, basePos + car1.width / 2, car1y - 30);
    };

    money.onload = function () {
    };
    cone.onload = function () {
    };
    speedSound = new Audio();

    background.src = "images/background.png";
    road.src = "images/road.png";
    car1.src = "images/car1.png";
    car2.src = "images/car2.png";
    current_player_arrow.src = "images/current_player_arrow.png";
    money.src = "images/money.png";
    cone.src = "images/cone.png";
    for (let i = 0; i < smallDigits.length; i++) {
        smallDigits[i].src = "images/"+i+".png";
    }
    speedSound.src = "sounds/car_speed.wav";
}

function drawCanvas() {
    context.drawImage(background, basePos, basePos, background.width, background.height, basePos, basePos, canvas.width, canvas.height);
    context.drawImage(road, basePos, canvas.height * 0.1, canvas.width, road.height * 3);
    context.drawImage(road, basePos, canvas.height * 0.6, canvas.width, road.height * 3);
    context.drawImage(car1, basePos, car1y);
    context.drawImage(car2, basePos, car2y);
    context.drawImage(smallDigits[myMoney], basePos + 20, car1y - 30);
    context.drawImage(smallDigits[otherMoney], basePos + 20, car2y - 30);

    speedSound.play();

    for (let i = 1; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            if (typeof matrix[i][j] !== "undefined") {
                if (matrix[i][j] === 'money') {
                    context.drawImage(money, basePos + i * 200, canvas.height * 0.1 + j * road.height, money.width * 0.3, money.height * 0.3);
                    context.drawImage(money, basePos + i * 200, canvas.height * 0.6 + j * road.height, money.width * 0.3, money.height * 0.3);
                } else {
                    context.drawImage(cone, basePos + i * 200, canvas.height * 0.1 + road.height * j, cone.width * 0.05, cone.height * 0.05);
                    context.drawImage(cone, basePos + i * 200, canvas.height * 0.6 + road.height * j, cone.width * 0.05, cone.height * 0.05);
                }
            }
        }
    }

    if (typeof matrix[0][carPlace + 1] !== "undefined") {
        if (matrix[0][carPlace + 1] === 'money') {
            myMoney++;
            connection.send(
                JSON.stringify({
                    'type': 'IGetMoney'
                })
            );
        } else {
            connection.send(
                JSON.stringify({
                    'type': 'ILostYouWon'
                })
            );
            alert("You lost! Opponent won with " + otherMoney + " points");
            connection.close();
        }
    }
}

loadGame();
drawCanvas();

connection.onopen = function () {
    connection.send(
        JSON.stringify({
            'type': 'socket',
            'user_id': '<?php echo $session; ?>'
        })
    );
};

connection.onmessage = function (e) {
    let json = JSON.parse(e.data);
    switch (json.type) {
        case 'keyup':
            car2y -= 40;
            drawCanvas();
            break;

        case 'keydown':
            car2y += 40;
            drawCanvas();
            break;

        case 'IGetMoney':
            otherMoney++;
            drawCanvas();
            break;

        case "cone":
        case "money":
            for (let i = 0; i < 5; i++) {
                matrix[i] = matrix[i + 1];
            }
            matrix[5] = new Array(3);
            matrix[5][json.floor] = json.type;
            drawCanvas();
            break;
        case 'ILostYouWon':
            alert("You won! Your Score: " + myMoney +" points");
            connection.close();
            break;
    }
};

connection.onclose = function () {
};

document.onkeypress = (event) => {
    switch (event.keyCode) {
        case 119: // w
            if (carPlace > -1) {
                car1y -= 40;
                drawCanvas();
                connection.send(
                    JSON.stringify({
                        'type': 'keyup'
                    })
                );
                carPlace--;
            }
            break;

        case 115: // s
            if (carPlace < 1) {
                car1y += 40;
                drawCanvas();
                connection.send(
                    JSON.stringify({
                        'type': 'keydown'
                    })
                );
                carPlace++;
            }
            break;
    }
};