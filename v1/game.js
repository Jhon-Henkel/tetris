const cvs = document.getElementById('tetris');
const ctx = cvs.getContext('2d');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');

//linhas
const ROW = 20;
//colunas
const COL = 10;
//quantidade de pixels por quadrado
const SQ = 30;
//cor padrão
const defaultColor = '#111111';
//borda de cada quadrado
const defaultBorder = 'rgba(255, 255, 255, 0.1)';

let canMove = true;

let speed = 500;
let dropStart = Date.now();
let score = 0;
let board = [];

for (let currentRow = 0; currentRow < ROW; currentRow ++) {
    board[currentRow] = [];
    for (let currentCol = 0; currentCol < COL; currentCol ++) {
        board[currentRow][currentCol] = defaultColor;
    }
}

drawBoard();

const PIECES = [
    [Z, 'red'],
    [S, 'green'],
    [T, 'yellow'],
    [O, 'blue'],
    [L, 'purple'],
    [I, 'cyan'],
    [J, 'orange'],
];

let piece = randomPiece();

drop();

document.addEventListener("keydown", CONTROL)