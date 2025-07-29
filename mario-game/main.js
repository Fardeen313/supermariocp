const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const startBtn = document.getElementById('startBtn');
const scoreDiv = document.getElementById('score');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const config = {
  gravity: 0.8,
  jumpPower: 15,
  marioWidth: 40,
  marioHeight: 50,
  obstacleWidth: 30,
  obstacleHeight: 40,
  obstacleGapMin: 200,
  obstacleGapMax: 400,
  speed: 5,
  homeX: 3000,
};

let mario;
let obstacles;
let keys;
let distance;
let gameRunning;
let animationId;
let scrollX;

function initGame() {
  mario = {
    x: 100,
    y: canvas.height - config.marioHeight - 50,
    width: config.marioWidth,
    height: config.marioHeight,
    dy: 0,
    grounded: true,
    color: 'red',
  };

  obstacles = [];
  keys = {};
  distance = 0;
  scrollX = 0;
  gameRunning = true;
  scoreDiv.textContent = 'Distance: 0';

  let nextObstacleX = 600;
  while (nextObstacleX < config.homeX) {
    obstacles.push({
      x: nextObstacleX,
      y: canvas.height - config.obstacleHeight - 50,
      width: config.obstacleWidth,
      height: config.obstacleHeight,
      color: 'brown',
    });
    nextObstacleX += config.obstacleGapMin + Math.random() * (config.obstacleGapMax - config.obstacleGapMin);
  }
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

function drawMario() {
  // Body
  ctx.fillStyle = mario.color;
  ctx.fillRect(mario.x, mario.y, mario.width, mario.height);

  // Face
  const faceRadius = 15;
  const faceX = mario.x + mario.width / 2;
  const faceY = mario.y + 20;

  ctx.fillStyle = '#f5d6b4'; // skin tone
  ctx.beginPath();
  ctx.arc(faceX, faceY, faceRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(faceX - 6, faceY - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(faceX + 6, faceY - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (smile)
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(faceX, faceY + 5, 7, 0, Math.PI);
  ctx.stroke();

  // Nose (line)
  ctx.beginPath();
  ctx.moveTo(faceX, faceY);
  ctx.lineTo(faceX, faceY + 5);
  ctx.stroke();
}

function drawObstacles() {
  obstacles.forEach(obs => {
    const screenX = obs.x - scrollX;
    if (screenX + obs.width > 0 && screenX < canvas.width) {
      ctx.fillStyle = obs.color;
      ctx.fillRect(screenX, obs.y, obs.width, obs.height);
    }
  });
}

function update() {
  if (!gameRunning) return;

  let moveX = 0;
  if (keys.right) moveX = config.speed;
  if (keys.left) moveX = -config.speed;

  mario.x += moveX;

  // No left wall, allow negative x (offscreen left)
  if (mario.x > canvas.width / 2) {
    scrollX += moveX;
    mario.x = canvas.width / 2;
  }

  distance = scrollX + mario.x;
  if (distance < 0) distance = 0;
  scoreDiv.textContent = 'Distance: ' + Math.floor(distance);

  if (!mario.grounded) {
    mario.dy += config.gravity;
    mario.y += mario.dy;
    if (mario.y + mario.height >= canvas.height - 50) {
      mario.y = canvas.height - 50 - mario.height;
      mario.grounded = true;
      mario.dy = 0;
    }
  }

  if ((keys.up || keys.space) && mario.grounded) {
    mario.dy = -config.jumpPower;
    mario.grounded = false;
  }

  // Collision detection
  for (let obs of obstacles) {
    const screenX = obs.x - scrollX;
    if (
      screenX < mario.x + mario.width &&
      screenX + obs.width > mario.x &&
      mario.y + mario.height > obs.y
    ) {
      gameOver();
      return;
    }
  }

  clear();
  drawGround();
  drawObstacles();
  drawMario();

  if (distance >= config.homeX) {
    youWin();
    return;
  }

  animationId = requestAnimationFrame(update);
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  let restart = confirm("Game Over! You hit an obstacle!\n\nRestart?");
  if (restart) {
    startGame();
  } else {
    backToHome();
  }
}

function youWin() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  let restart = confirm("🎉 You Win! You reached home!\n\nPlay again?");
  if (restart) {
    startGame();
  } else {
    backToHome();
  }
}

function backToHome() {
  gameScreen.style.display = 'none';
  homeScreen.style.display = 'block';
}

function startGame() {
  initGame();
  homeScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  update();
}

startBtn.addEventListener('click', () => {
  startGame();
});

window.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === ' ') keys.space = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'ArrowLeft') keys.left = true;
});

window.addEventListener('keyup', (e) => {
  if (!gameRunning) return;
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === ' ') keys.space = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'ArrowLeft') keys.left = false;
});

