// --- 1. CORE LOGIC & ANIMATIONS ---
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(s => observer.observe(s));

// --- 2. GAME ENGINE ---
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('master-game-overlay');
const uiBox = document.getElementById('game-ui-box');
const scoreLabel = document.getElementById('game-score-label');

let currentMode = ''; // 'flappy' or 'runner'
let gameRunning = false;
let gameLoopId;
let score = 0;
let frames = 0;

const playerImg = new Image();
playerImg.src = 'me.jpg'; // REPLACE with your photo filename

// Dimensions
function setGameSize() {
    canvas.width = window.innerWidth < 450 ? 350 : 400;
    canvas.height = 550;
}

function openGame(mode) {
    currentMode = mode;
    setGameSize();
    overlay.style.display = 'flex';
    score = 0;
    frames = 0;
    scoreLabel.innerText = "Score: 0";
    uiBox.style.display = 'block';

    if(mode === 'flappy') {
        document.getElementById('ui-title').innerText = "Flappy Math";
        document.getElementById('ui-desc').innerText = "Use Space or Click to jump through the bugs.";
    } else {
        document.getElementById('ui-title').innerText = "Subway Solver";
        document.getElementById('ui-desc').innerText = "Use Arrow Keys to dodge Logic Errors.";
    }
    
    document.getElementById('ui-start-btn').onclick = startGame;
}

function startGame() {
    uiBox.style.display = 'none';
    score = 0; frames = 0;
    gameRunning = true;
    if(currentMode === 'flappy') initFlappy();
    else initRunner();
    animate();
}

function closeGame() {
    overlay.style.display = 'none';
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
}

// --- FLAPPY LOGIC ---
let bird, pipes;
function initFlappy() {
    bird = { x: 50, y: 250, w: 45, h: 45, v: 0, gravity: 0.5, jump: -8 };
    pipes = [];
}

// --- RUNNER LOGIC ---
let player, bugs;
function initRunner() {
    player = { lane: 1, y: 470, w: 50, h: 50 }; // Lane 0, 1, or 2
    bugs = [];
}

function update() {
    frames++;
    scoreLabel.innerText = "Score: " + score;

    if(currentMode === 'flappy') {
        bird.v += bird.gravity; bird.y += bird.v;
        if(bird.y > canvas.height || bird.y < 0) gameOver();
        
        if(frames % 90 === 0) {
            let gap = 150;
            let h = Math.random() * (canvas.height - gap - 100) + 50;
            pipes.push({ x: canvas.width, t: h, b: canvas.height - h - gap, passed: false });
        }
        pipes.forEach((p, i) => {
            p.x -= 3.5;
            // Collision
            if(bird.x + bird.w > p.x && bird.x < p.x + 55) {
                if(bird.y < p.t || bird.y + bird.h > canvas.height - p.b) gameOver();
            }
            if(!p.passed && p.x < bird.x) { score++; p.passed = true; }
            if(p.x < -60) pipes.splice(i, 1);
        });
    } else {
        // Runner logic
        if(frames % 60 === 0) {
            bugs.push({ lane: Math.floor(Math.random()*3), y: -50 });
        }
        bugs.forEach((b, i) => {
            b.y += (5 + score/5);
            let playerX = player.lane * (canvas.width/3) + (canvas.width/6) - 25;
            let bugX = b.lane * (canvas.width/3) + (canvas.width/6) - 30;
            // Collision
            if(b.y > player.y - 40 && b.y < player.y + 40 && b.lane === player.lane) gameOver();
            if(b.y > canvas.height) { bugs.splice(i,1); score++; }
        });
    }
}

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    if(currentMode === 'flappy') {
        ctx.fillStyle = '#6366f1';
        pipes.forEach(p => {
            ctx.fillRect(p.x, 0, 55, p.t);
            ctx.fillRect(p.x, canvas.height - p.b, 55, p.b);
        });
        ctx.drawImage(playerImg, bird.x, bird.y, bird.w, bird.h);
    } else {
        // Lanes
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        for(let i=1; i<3; i++) {
            ctx.beginPath(); ctx.moveTo(i*canvas.width/3, 0); ctx.lineTo(i*canvas.width/3, canvas.height); ctx.stroke();
        }
        // Player
        let targetX = player.lane * (canvas.width/3) + (canvas.width/6) - 25;
        ctx.drawImage(playerImg, targetX, player.y, player.w, player.h);
        // Bugs
        ctx.fillStyle = "#ff4d4d";
        bugs.forEach(b => {
            let bugX = b.lane * (canvas.width/3) + (canvas.width/6) - 30;
            ctx.fillRect(bugX, b.y, 60, 30);
            ctx.fillStyle = "white"; ctx.font = "10px sans-serif";
            ctx.fillText("BUG", bugX + 15, b.y + 18);
            ctx.fillStyle = "#ff4d4d";
        });
    }
}

function animate() {
    if(!gameRunning) return;
    update();
    draw();
    gameLoopId = requestAnimationFrame(animate);
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
    uiBox.style.display = 'block';
    document.getElementById('ui-title').innerText = "Game Over";
    document.getElementById('ui-desc').innerText = "Score: " + score;
    document.getElementById('ui-start-btn').innerText = "Try Again";
}

// --- INPUTS ---
window.addEventListener('keydown', e => {
    if(currentMode === 'flappy' && e.code === 'Space') bird.v = bird.jump;
    if(currentMode === 'runner') {
        if(e.key === 'ArrowLeft' && player.lane > 0) player.lane--;
        if(e.key === 'ArrowRight' && player.lane < 2) player.lane++;
    }
});
canvas.addEventListener('mousedown', () => { if(currentMode==='flappy') bird.v = bird.jump; });
