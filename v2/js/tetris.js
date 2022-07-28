let lastTime = 0;
let dropInterval = 1000;
let dropCounter = 0;

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const grid = createMatriz(10, 20);
const player = {
    pos: {x: 0, y:0},
    matriz: [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ]
}

context.scale(20, 20);

function createMatriz(width, height) {
    const matriz = [];

    while (height--) {
        matriz.push(new Array(width).fill(0));
    }
    return matriz;
}

function colide(grid, player) {
    const matriz = player.matriz;
    const offset = player.pos;

    for (let y = 0; y < matriz.length; y++) {
        for (let x = 0; x< matriz[y].length; x++) {
            if (matriz[y][x] !== 0 && (grid[y + offset.y] && grid[y + offset.y][x + offset.x]) !== 0) {
                return true;
                //parei emm 28:22
                //https://www.youtube.com/watch?v=L9I9Bn2YaH8
            }
        }
    }
}

function drawMatriz(matriz, offset) {
    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = "red";
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = "#000"
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatriz(grid, {x:0, y:0});
    drawMatriz(player.matriz, player.pos);
}

function update(time = 0) {
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
    dropCounter = 0;
}

document.addEventListener("keydown", event => {
    if (event.keyCode === 40) {
        playerDrop()
    } else if (event.keyCode === 37) {
        player.pos.x--;
    } else if (event.keyCode === 39) {
        player.pos.x++;
    }
});

update();
