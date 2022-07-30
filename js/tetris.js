let lastTime = 0;
let dropInterval = 1000;
let dropCounter = 0;
let pause = false;
let mainTheme = false;
let mainThemeAnteriorState = false;
let maxLevel = 17;

const canvas = document.getElementById("tetris");
const canvasNextPiece = document.getElementById("nextPiece");
const context = canvas.getContext("2d");
const contextNextPiece = canvasNextPiece.getContext("2d");
const grid = createMatriz(10, 20);
const colors = [
    null,
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink'
];
const player = {
    pos: {x: 0, y:0},
    matriz: null,
    nextPiece: null,
    score: 0,
    level: 0,
    lines: 0
}

context.scale(20, 20);
contextNextPiece.scale(19, 19);

function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ]
        case 'O':
            return [
                [2, 2],
                [2, 2],
            ]
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ]
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ]
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ]
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ]
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ]
    }
}

function createMatriz(width, height) {
    const matriz = [];

    while (height--) {
        matriz.push(new Array(width).fill(0));
    }
    return matriz;
}

function collide(grid, player) {
    const matriz = player.matriz;
    const offset = player.pos;

    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x< matriz[y].length; ++x) {
            if (matriz[y][x] !== 0 && (grid[y + offset.y] && grid[y + offset.y][x + offset.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(grid, player) {
    player.matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function drawMatriz(matriz, offset) {
    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawMatrizNextPiece(matriz, offset) {
    contextNextPiece.fillStyle = "#000";
    contextNextPiece.fillRect(0,0, canvasNextPiece.width, canvasNextPiece.height);

    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                contextNextPiece.fillStyle = colors[value];
                contextNextPiece.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = "#000"
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatriz(grid, {x:0, y:0});
    drawMatriz(player.matriz, player.pos);
    drawMatrizNextPiece(player.nextPiece, {x: 1, y:1});
}

function gridSweep() {
    let rowCount = 1;
    outer: for (let y = grid.length - 1; y > 0; --y) {

        for(let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x]  === 0) {
                continue outer;
            }
        }

        const row = grid.splice(y, 1)[0].fill(0)
        document.getElementById("line-complete").volume = 0.2;
        document.getElementById("line-complete").play();
        grid.unshift(row);
        ++y;

        player.score += rowCount * 10;
        player.lines++;
        rowCount += 2;

        if (player.lines % 4 === 0) {
            if (player.level < maxLevel) {
                document.getElementById("level-up").volume = 0.3;
                document.getElementById("level-up").play();
                document.getElementById("main-theme").playbackRate += 0.05;
                player.level++;
            } else if (player.level === maxLevel) {
                document.getElementById('level').innerHTML = 'Max';
            }
        }
    }
}

function update(time = 0) {
    if (pause) {
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function playerDrop() {
    player.pos.y++;

    if (collide(grid, player)) {
        player.pos.y--;
        merge(grid, player);
        playerReset();
        gridSweep();
        updateScore();
    }

    dropCounter = 0;
}

function playerMove(direction) {
    player.pos.x += direction;

    if (collide(grid, player)) {
        player.pos.x -= direction;
    }
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matriz);

    while (collide(grid, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matriz[0].length) {
            rotate(player.matriz);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matriz) {
    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matriz[x][y], matriz[y][x]] = [matriz[y][x], matriz[x][y]]
        }
    }
    matriz.forEach(row => row.reverse());
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    dropInterval = 1000 - (player.level * 50);

    if (player.nextPiece === null) {
        player.matriz = createPiece(pieces[pieces.length * Math.random() | 0]);
    } else {
        player.matriz = player.nextPiece;
    }

    player.nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.x = (grid[0].length / 2 | 0) - (player.matriz[0].length / 2 | 0);
    player.pos.y = 0;

    if (collide(grid, player)) {

        if (mainTheme === true) {
            playPauseMainTheme();
        }

        document.getElementById("game-over").volume = 0.1;
        document.getElementById("game-over").play();
        pause = true;

        let modalGameOver = new bootstrap.Modal(document.getElementById('game-over-modal'), {
            backdrop: false,
            keyboard: false
        });

        modalGameOver.show();
    }
}

function pauseNow(pauseAction) {
    pause = pauseAction;

    if (pause) {
        document.getElementById('background-tetris').style.display= "block";
        document.getElementById('ui-pause').style.display= "block";
        mainThemeAnteriorState = mainTheme;

        if (mainTheme === true) {
            playPauseMainTheme()
        }
    } else {
        document.getElementById('background-tetris').style.display = "none";
        document.getElementById('ui-pause').style.display= "none";

        if (mainThemeAnteriorState) {
            playPauseMainTheme();
        }

        update();
    }
}

function gameStart() {
    document.getElementById('background-tetris').style.display = "none"
    document.getElementById('ui-main-menu').style.display = "none"
    document.getElementById('game-body').style.display = "flex"
    playPauseMainTheme()
    document.getElementById("main-theme").volume = 0.1;
    pause = false;
    playerReset();
    updateScore();
    update();
}

function resetGame() {
    document.getElementById("main-theme").playbackRate = 1.0;
    grid.forEach(row => row.fill(0));
    player.score = 0;
    player.level = 0;
    player.lines = 0;
    updateScore();
}

function restartGame() {
    resetGame()
    gameStart()
}

function exitGame() {
    document.getElementById('game-body').style.display = "none";
    document.getElementById('ui-main-menu').style.display = "block";
    document.getElementById('ui-pause').style.display = "none";
    document.getElementById('background-tetris').style.display = "block";
    mainTheme = true;
    resetGame();
    playPauseMainTheme()
}

function howToPlay() {
    let modalHowToPlay = new bootstrap.Modal(document.getElementById('how-to-play'))
    modalHowToPlay.show();
}

function playPauseMainTheme() {
    if (mainTheme === false) {
        document.getElementById("main-theme").play();
        mainTheme = true;
    } else {
        document.getElementById("main-theme").pause();
        mainTheme = false;
    }
}

function updateScore() {
    document.getElementById('score').innerHTML = player.score;
    document.getElementById('lines').innerHTML = player.lines;

    if (player.level !== maxLevel) {
        document.getElementById('level').innerHTML = player.level;
    }
}

document.addEventListener("keydown", event => {
    switch (event.keyCode) {
        case 40:
            playerDrop()
            break;
        case 37:
            playerMove(-1)
            break;
        case 39:
            playerMove(1)
            break;
        case 32:
            playerRotate();
            break;
        case 27:
            if (pause) {
                pauseNow(false)
            } else {
                pauseNow(true)
            }
            break;
        case 77:
            playPauseMainTheme();
            break;
    }
});