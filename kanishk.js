// Intersection Observer
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
});
document.querySelectorAll('.fade-in').forEach(s => obs.observe(s));

// GAME CORE
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('master-game-overlay');
const scoreDisp = document.getElementById('score-text');
const menu = document.getElementById('menu-overlay');

canvas.width = 400; canvas.height = 550;

let gameRunning = false;
let score = 0;
let mode = ''; // flappy or runner
let bird, pipes, runner, bugs, frame = 0;

const img = new Image();
img.src = 'me.jpg'; // MAKE SURE THIS FILE EXISTS!

function openGame(m) {
    mode = m;
    overlay.style.display = 'flex';
    menu.style.display = 'block';
    document.getElementById('menu-title').innerText = m === 'flappy' ? 'Flappy Kanishk' : 'Subway Solver';
    document.getElementById('start-btn').onclick = startGame;
}

function closeGame() {
    overlay.style.display = 'none';
    gameRunning = false;
}

function startGame() {
    menu.style.display = 'none';
    score = 0; frame = 0;
    if(mode === 'flappy') {
        bird = { x: 50, y: 200, v: 0, g: 0.5, jump: -8 };
        pipes = [];
    } else {
        runner = { lane: 1, y: 480 };
        bugs = [];
    }
    gameRunning = true;
    gameLoop();
}

function gameLoop() {
    if(!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    frame++;
    scoreDisp.innerText = "Score: " + score;

    if(mode === 'flappy') {
        bird.v += bird.g; bird.y += bird.v;
        if(bird.y > 550 || bird.y < 0) endGame();
        if(frame % 100 === 0) {
            let h = Math.random() * 250 + 50;
            pipes.push({ x: 400, t: h, b: 550 - h - 150, p: false });
        }
        pipes.forEach((p, i) => {
            p.x -= 3;
            if(bird.x+30 > p.x && bird.x < p.x+50 && (bird.y < p.t || bird.y+30 > 550-p.b)) endGame();
            if(!p.p && p.x < 50) { score++; p.p = true; }
            if(p.x < -50) pipes.splice(i, 1);
        });
    } else {
        if(frame % 60 === 0) bugs.push({ lane: Math.floor(Math.random()*3), y: -50 });
        bugs.forEach((b, i) => {
            b.y += (5 + score/5);
            let px = runner.lane * 133 + 50;
            if(b.y > 450 && b.y < 520 && b.lane === runner.lane) endGame();
            if(b.y > 550) { bugs.splice(i,1); score++; }
        });
    }
}

function draw() {
    ctx.clearRect(0,0,400,550);
    if(mode === 'flappy') {
        ctx.fillStyle = '#6366f1';
        pipes.forEach(p => { ctx.fillRect(p.x, 0, 50, p.t); ctx.fillRect(p.x, 550-p.b, 50, p.b); });
        ctx.drawImage(img, bird.x, bird.y, 40, 40);
    } else {
        ctx.strokeStyle = '#333';
        for(let i=1; i<3; i++) { ctx.beginPath(); ctx.moveTo(i*133,0); ctx.lineTo(i*133,550); ctx.stroke(); }
        ctx.drawImage(img, runner.lane*133 + 45, runner.y, 40, 40);
        ctx.fillStyle = 'red';
        bugs.forEach(b => ctx.fillRect(b.lane*133+40, b.y, 50, 20));
    }
}

function endGame() {
    gameRunning = false;
    menu.style.display = 'block';
    document.getElementById('menu-title').innerText = "Game Over: " + score;
}

// Controls
window.onkeydown = e => {
    if(mode === 'flappy' && e.code === 'Space') bird.v = bird.jump;
    if(mode === 'runner') {
        if(e.key === 'ArrowLeft' && runner.lane > 0) runner.lane--;
        if(e.key === 'ArrowRight' && runner.lane < 2) runner.lane++;
    }
}
canvas.onmousedown = () => { if(mode === 'flappy') bird.v = bird.jump; }
