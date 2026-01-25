// Fade-in safety (no blank page ever)
document.querySelectorAll('.fade-in').forEach(el => {
  el.style.opacity = 1;
});

// GAME LOGIC
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('game-overlay');
const scoreText = document.getElementById('score-text');
const menu = document.getElementById('menu');
const menuTitle = document.getElementById('menu-title');

let mode = '';
let score = 0;
let running = false;
let bird, pipes, runner, bugs, frame = 0;

function openGame(m) {
  mode = m;
  overlay.style.display = 'flex';
  menu.style.display = 'block';
  menuTitle.innerText = m === 'flappy' ? 'Flappy Math' : 'Subway Solver';
}

function closeGame() {
  overlay.style.display = 'none';
  running = false;
}

function startGame() {
  menu.style.display = 'none';
  score = 0;
  frame = 0;
  running = true;

  if (mode === 'flappy') {
    bird = { x: 60, y: 200, v: 0 };
    pipes = [];
  } else {
    runner = { lane: 1 };
    bugs = [];
  }

  loop();
}

function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  frame++;
  scoreText.innerText = "Score: " + score;

  if (mode === 'flappy') {
    bird.v += 0.5;
    bird.y += bird.v;
    if (bird.y > 550 || bird.y < 0) end();

    if (frame % 100 === 0)
      pipes.push({ x: 400, gap: 160, top: Math.random()*200+50 });

    pipes.forEach((p,i) => {
      p.x -= 3;
      if (p.x < -50) { pipes.splice(i,1); score++; }
    });
  } else {
    if (frame % 60 === 0)
      bugs.push({ lane: Math.floor(Math.random()*3), y: -40 });

    bugs.forEach((b,i) => {
      b.y += 5;
      if (b.y > 550) { bugs.splice(i,1); score++; }
    });
  }
}

function draw() {
  ctx.clearRect(0,0,400,550);
  ctx.fillStyle = "#6366f1";

  if (mode === 'flappy') {
    pipes.forEach(p => {
      ctx.fillRect(p.x,0,50,p.top);
      ctx.fillRect(p.x,p.top+p.gap,50,550);
    });
    ctx.fillRect(bird.x,bird.y,30,30);
  } else {
    bugs.forEach(b => {
      ctx.fillRect(b.lane*133+50,b.y,40,20);
    });
    ctx.fillRect(runner.lane*133+60,480,30,40);
  }
}

function end() {
  running = false;
  menu.style.display = 'block';
  menuTitle.innerText = "Game Over — Score " + score;
}

window.onkeydown = e => {
  if (mode === 'flappy' && e.code === 'Space') bird.v = -8;
  if (mode === 'runner') {
    if (e.key === 'ArrowLeft' && runner.lane > 0) runner.lane--;
    if (e.key === 'ArrowRight' && runner.lane < 2) runner.lane++;
  }
};

canvas.onclick = () => {
  if (mode === 'flappy') bird.v = -8;
};
