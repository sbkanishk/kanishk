/**
 * 1. INTERSECTION OBSERVER
 * Handles the smooth "Fade In" as you scroll.
 */
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


/**
 * 2. MOUSE TRACKING GLOW
 * Makes the skill cards respond to your mouse position.
 */
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});


/**
 * 3. THE SECRET GAME TRIGGER
 * Click the logo "Kanishk" 5 times to launch the game.
 */
let clickCount = 0;
const logo = document.querySelector('.logo');

logo.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 5) {
        openGame();
        clickCount = 0;
    }
});


/**
 * 4. FLAPPY KANISHK GAME ENGINE
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverlay = document.getElementById('game-overlay');
const gameUI = document.getElementById('game-ui');
const scoreLabel = document.getElementById('score-display');

// Set canvas size (Responsive-ish)
canvas.width = 400;
canvas.height = 600;

let birdImg = new Image();
birdImg.src = 'me.jpg'; // <--- MAKE SURE YOUR PHOTO FILENAME MATCHES THIS!

let bird, pipes, score, gameRunning, animationId;
let frameCounter = 0;

function openGame() {
    gameOverlay.style.display = 'flex';
    resetGame();
}

function closeGame() {
    gameOverlay.style.display = 'none';
    gameRunning = false;
    cancelAnimationFrame(animationId);
}

function resetGame() {
    bird = { x: 50, y: 300, w: 45, h: 45, gravity: 0.5, lift: -8, velocity: 0 };
    pipes = [];
    score = 0;
    frameCounter = 0;
    gameRunning = false;
    scoreLabel.innerText = '0';
    gameUI.style.display = 'block';
    gameUI.innerHTML = `
        <h1 style="margin-bottom:10px">Flappy Kanishk</h1>
        <p style="margin-bottom:20px">Avoid the "Bugs" using SPACE or CLICK</p>
        <button onclick="startGame()" class="btn primary">Start Mission</button>
        <button onclick="closeGame()" class="btn secondary">Exit</button>
    `;
    draw(); // Draw first frame
}

function startGame() {
    gameUI.style.display = 'none';
    gameRunning = true;
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    frameCounter++;
    
    // Bird Physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Floor/Ceiling collision
    if (bird.y + bird.h > canvas.height || bird.y < 0) endGame();

    // Pipe generation
    if (frameCounter % 90 === 0) {
        let gap = 160;
        let pipeWidth = 60;
        let minPipeHeight = 50;
        let pipeTopHeight = Math.random() * (canvas.height - gap - (minPipeHeight * 2)) + minPipeHeight;
        pipes.push({
            x: canvas.width,
            top: pipeTopHeight,
            bottom: canvas.height - pipeTopHeight - gap,
            passed: false
        });
    }

    // Pipe movement & Collision
    pipes.forEach((p, index) => {
        p.x -= 3.5;

        // Collision Check
        if (bird.x + bird.w > p.x && bird.x < p.x + 60) {
            if (bird.y < p.top || bird.y + bird.h > canvas.height - p.bottom) {
                endGame();
            }
        }

        // Score Update
        if (!p.passed && bird.x > p.x + 60) {
            score++;
            scoreLabel.innerText = score;
            p.passed = true;
        }

        // Remove old pipes
        if (p.x < -60) pipes.splice(index, 1);
    });
}

function draw() {
    // Background
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Pipes
    ctx.fillStyle = '#6366f1';
    pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, 60, p.top);
        // Bottom pipe
        ctx.fillRect(p.x, canvas.height - p.bottom, 60, p.bottom);
        
        // Add "Bug" text to pipes for fun
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "12px Inter";
        ctx.fillText("LOGIC ERROR", p.x + 5, 30);
    });

    // Draw Bird (You!)
    ctx.save();
    // Simple tilt effect based on velocity
    let rotation = bird.velocity * 0.05;
    ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2);
    ctx.rotate(rotation);
    ctx.drawImage(birdImg, -bird.w/2, -bird.h/2, bird.w, bird.h);
    ctx.restore();
}

function endGame() {
    gameRunning = false;
    gameUI.style.display = 'block';
    gameUI.innerHTML = `
        <h1 style="color:#ff4d4d">CRASHED!</h1>
        <p>Your logic failed at ${score} points.</p>
        <button onclick="startGame()" class="btn primary">Retry</button>
        <button onclick="closeGame()" class="btn secondary">Close</button>
    `;
}

// Input Handling
const flap = () => { if (gameRunning) bird.velocity = bird.lift; };
window.addEventListener('keydown', (e) => { if (e.code === 'Space') flap(); });
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });
