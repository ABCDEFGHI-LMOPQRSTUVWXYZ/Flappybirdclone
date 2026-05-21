// CANVAS ELEMENTS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM elements
const scoreSpan = document.getElementById('scoreValue');
const bestSpan = document.getElementById('bestValue');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// GAME DIMENSIONS
const CANVAS_W = 400;
const CANVAS_H = 600;
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

// GAME STATE
let gameRunning = false;
let score = 0;
let bestScore = localStorage.getItem('flappyBest') ? parseInt(localStorage.getItem('flappyBest')) : 0;
let frameRequest = null;
let animationId = null;

// BIRD PROPERTIES
const bird = {
    x: 70,
    y: CANVAS_H / 2,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.2,
    jumpPower: -4.8,
    rotation: 0
};

// PIPE CONFIGURATION
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPACING = 220;
let pipes = [];

// GRAVITY & PHYSICS
let frameCounter = 0;
let pipeSpawnCounter = 0;
const PIPE_SPAWN_FRAMES = 95;   // frames between each pipe pair

// Load highscore display
bestSpan.innerText = bestScore;

// Helper: update UI
function updateScoreUI() {
    scoreSpan.innerText = score;
    if (score > bestScore) {
        bestScore = score;
        bestSpan.innerText = bestScore;
        localStorage.setItem('flappyBest', bestScore);
    }
}

// Bird drawing function with rotation
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    let rotAngle = bird.velocity * 0.08;
    if (rotAngle > 0.6) rotAngle = 0.6;
    if (rotAngle < -0.5) rotAngle = -0.5;
    ctx.rotate(rotAngle);
    // bird shape (yellow body, orange beak)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFD966';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width/2, bird.height/2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(bird.width/2 - 2, -4);
    ctx.lineTo(bird.width/2 + 8, 0);
    ctx.lineTo(bird.width/2 - 2, 4);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8, -5, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-8, -5, 2.5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#FF8C42';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 2);
    ctx.fill();
    ctx.restore();
    
    // wing animation (simple flap from velocity)
    ctx.fillStyle = '#E6B422';
    ctx.beginPath();
    let wingYOffset = Math.abs(bird.velocity) > 2 ? 6 : 2;
    ctx.ellipse(bird.x + 10, bird.y + 5 + (wingYOffset * 0.5), 10, 7, -0.5, 0, Math.PI*2);
    ctx.fill();
}

// draw pipes
function drawPipes() {
    for (let pipe of pipes) {
        // top pipe
        ctx.fillStyle = '#228B22';
        ctx.shadowBlur = 2;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 35, PIPE_WIDTH + 10, 35);
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(pipe.x - 8, pipe.topHeight - 40, PIPE_WIDTH + 16, 12);
        
        // bottom pipe
        const bottomY = pipe.topHeight + PIPE_GAP;
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_H - bottomY);
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 35);
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(pipe.x - 8, bottomY + 28, PIPE_WIDTH + 16, 12);
        
        // pipe border details
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_H - bottomY);
    }
    ctx.shadowBlur = 0;
}

// draw ground + sky
function drawBackground() {
    // gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#4aa5f0');
    grad.addColorStop(0.7, '#6bc2ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // clouds
    ctx.fillStyle = '#ffffffc0';
    ctx.beginPath();
    ctx.ellipse(60, 70, 35, 30, 0, 0, Math.PI*2);
    ctx.ellipse(95, 60, 40, 32, 0, 0, Math.PI*2);
    ctx.ellipse(130, 70, 30, 28, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(300, 120, 40, 30, 0, 0, Math.PI*2);
    ctx.ellipse(340, 110, 35, 28, 0, 0, Math.PI*2);
    ctx.fill();
    // ground
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(0, CANVAS_H - 65, CANVAS_W, 65);
    ctx.fillStyle = '#C49A6C';
    for(let i=0; i<20; i++) {
        ctx.fillRect(i*30, CANVAS_H - 68, 12, 8);
    }
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(0, CANVAS_H - 70, CANVAS_W, 6);
}

function drawScoreOnCanvas() {
    ctx.font = 'bold 36monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'black';
    ctx.fillText(`${score}`, CANVAS_W/2 - 15, 70);
    ctx.shadowBlur = 0;
}

// collisions
function checkCollisions() {
    // ground or ceiling collision
    if (bird.y + bird.height >= CANVAS_H - 65 || bird.y <= 0) {
        return true;
    }
    
    // pipe collision
    for (let pipe of pipes) {
        // bird hitbox rect
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + PIPE_WIDTH) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + PIPE_GAP) {
                return true;
            }
        }
    }
    return false;
}

// update pipes, scoring, positions
function updateGame() {
    if (!gameRunning) return;
    
    // bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // update pipes movement
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 2.5;
    }
    // remove offscreen pipes
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
    
    // spawn new pipes
    pipeSpawnCounter++;
    if (pipeSpawnCounter >= PIPE_SPAWN_FRAMES) {
        pipeSpawnCounter = 0;
        const minTop = 70;
        const maxTop = CANVAS_H - PIPE_GAP - 90;
        const randomTop = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
        pipes.push({
            x: CANVAS_W,
            topHeight: randomTop,
            counted: false
        });
    }
    
    // scoring: when bird passes pipe
    for (let pipe of pipes) {
        if (!pipe.counted && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.counted = true;
            score++;
            updateScoreUI();
        }
    }
    
    // collision detection
    if (checkCollisions()) {
        gameRunning = false;
        if (frameRequest) {
            cancelAnimationFrame(frameRequest);
            frameRequest = null;
        }
        draw(); // final draw game over
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#ff4444';
        ctx.shadowBlur = 0;
        ctx.fillText('💀 GAME OVER 💀', CANVAS_W/2 - 110, CANVAS_H/2 - 40);
        ctx.font = '18px monospace';
        ctx.fillStyle = '#ffe6b3';
        ctx.fillText('Click "START GAME"', CANVAS_W/2 - 85, CANVAS_H/2 + 20);
        return;
    }
    
    // limit bird rotation for visual
    if (bird.velocity > 8) bird.velocity = 8;
    draw();
}

// jump action
function jump() {
    if (!gameRunning) return;
    bird.velocity = bird.jumpPower;
    // slight upward animation (no extra)
}

// reset all game variables
function resetGame() {
    // stop any running animation
    if (frameRequest) {
        cancelAnimationFrame(frameRequest);
        frameRequest = null;
    }
    // reset bird
    bird.y = CANVAS_H / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    score = 0;
    pipes = [];
    frameCounter = 0;
    pipeSpawnCounter = 20; // give slight delay before first pipe
    updateScoreUI();
    gameRunning = false;   // game not started yet
    draw();
    // draw start message
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#ffffdd';
    ctx.shadowBlur = 2;
    ctx.fillText('⚡ PRESS START ⚡', CANVAS_W/2 - 80, CANVAS_H/2);
}

// main drawing loop
function draw() {
    drawBackground();
    drawPipes();
    drawBird();
    drawScoreOnCanvas();
    
    if (!gameRunning) {
        ctx.font = 'bold 17px monospace';
        ctx.fillStyle = '#2c1e0e';
        ctx.shadowBlur = 0;
        ctx.fillText('🐦 READY?', CANVAS_W/2 - 45, 110);
    }
}

// game loop (update + draw repeatedly)
function gameLoop() {
    if (gameRunning) {
        updateGame();
    } else {
        draw();   // idle draw
    }
    frameRequest = requestAnimationFrame(gameLoop);
}

// start new game session
function startGame() {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    // full reset
    bird.y = CANVAS_H / 2;
    bird.velocity = 0;
    score = 0;
    pipes = [];
    pipeSpawnCounter = 25;
    updateScoreUI();
    gameRunning = true;
    // start loop again
    frameRequest = requestAnimationFrame(gameLoop);
}

// restart: reset and start game instantly
function restartGame() {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    bird.y = CANVAS_H / 2;
    bird.velocity = 0;
    score = 0;
    pipes = [];
    pipeSpawnCounter = 25;
    updateScoreUI();
    gameRunning = true;
    frameRequest = requestAnimationFrame(gameLoop);
}

// EVENT HANDLERS
function handleJump(e) {
    // spacebar or arrow up or click/tap
    if (e.type === 'keydown') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            jump();
        }
        // optional: R restart hotkey
        if (e.code === 'KeyR') {
            e.preventDefault();
            if (gameRunning) {
                restartGame();
            } else {
                startGame();
            }
        }
    } else if (e.type === 'click' && (e.target === canvas || e.target === canvas)) {
        e.preventDefault();
        jump();
    }
}

// touch / mouse for canvas
canvas.addEventListener('click', (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    jump();
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    jump();
});

document.addEventListener('keydown', handleJump);

startBtn.addEventListener('click', () => {
    startGame();
});

restartBtn.addEventListener('click', () => {
    restartGame();
});

// initial draw
resetGame();
// start idle animation loop
frameRequest = requestAnimationFrame(gameLoop);