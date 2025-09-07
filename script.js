// Space Dodger Game

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

// Load images
const shipImg = new Image();
shipImg.src = "ship.png";       // your spaceship PNG

const asteroidImg = new Image();
asteroidImg.src = "asteroid.png";  // your asteroid PNG

// Player
const player = {
  w: 50,
  h: 50,
  x: (canvas.width - 50) / 2,
  y: canvas.height - 80,
  speed: 360
};

// Controls
let keys = { left: false, right: false };

// Obstacles
let obstacles = [];
let spawnTimer = 0;
const spawnInterval = 900;
let score = 0;
let gameOver = false;

// Stars (background)
const stars = [];
const starCount = 120;
for (let i = 0; i < starCount; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: 20 + Math.random() * 60
  });
}

let lastTime = 0;

// Spawn asteroid
function spawnObstacle() {
  const size = 30 + Math.random() * 50;
  const x = Math.random() * (canvas.width - size);
  const speed = 100 + Math.random() * 180;
  obstacles.push({ x, y: -size, w: size, h: size, speed });
}

// Collision detection
function collides(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Update game state
function update(dt) {
  if (gameOver) return;

  // Player movement
  if (keys.left) player.x -= player.speed * dt;
  if (keys.right) player.x += player.speed * dt;

  // Keep player inside canvas
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // Spawn asteroids
  spawnTimer += dt * 1000;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnObstacle();
  }

  // Move asteroids
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += o.speed * dt;
    if (o.y > canvas.height) {
      obstacles.splice(i, 1);
      score += 1;
    } else if (collides(player, o)) {
      gameOver = true;
    }
  }

  // Move stars
  for (let s of stars) {
    s.y += s.speed * dt;
    if (s.y > canvas.height) {
      s.y = -s.size;
      s.x = Math.random() * canvas.width;
    }
  }
}

// Draw everything
function draw() {
  // Background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = 'white';
  for (let s of stars) {
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // Player
  ctx.drawImage(shipImg, player.x, player.y, player.w, player.h);

  // Obstacles
  obstacles.forEach(o => {
    ctx.drawImage(asteroidImg, o.x, o.y, o.w, o.h);
  });

  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 30);

  // Game Over
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '18px sans-serif';
    ctx.fillText('Press Enter to restart', canvas.width / 2, canvas.height / 2 + 30);
  }
}

// Game loop
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

// Input
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  if (e.key === 'Enter' && gameOver) restart();
});

window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

// Restart
function restart() {
  obstacles = [];
  score = 0;
  gameOver = false;
  player.x = (canvas.width - player.w) / 2;
  spawnTimer = 0;
  lastTime = 0;
  requestAnimationFrame(loop);
}

// Start
requestAnimationFrame(loop);
