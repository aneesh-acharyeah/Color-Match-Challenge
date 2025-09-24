(() => {
  // DOM Elements
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score');
  const levelDisplay = document.getElementById('level');
  const overlay = document.getElementById('overlay');
  const finalScoreEl = document.getElementById('final-score');
  const restartButton = document.getElementById('restart-button');

  // Resize canvas responsively
  function resize() {
    const maxWidth = 900;
    const w = Math.min(window.innerWidth - 40, maxWidth);
    const h = w * 0.75;
    canvas.width = w;
    canvas.height = h;
  }
  window.addEventListener('resize', resize);
  resize();

  // Game state
  let score = 0;
  let level = 1;
  let blockSpeed = 2;
  const blockSize = 50;
  let platformWidth = 150;
  let platformX = canvas.width / 2 - platformWidth / 2;
  const platformHeight = 20;
  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
  let platformColor = getRandomColor();
  let blocks = [];
  let lastTime = 0;

  // Input handling
  let leftPressed = false;
  let rightPressed = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
    e.preventDefault(); // prevent scroll
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
  });

  // Helper: Random color
  function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Create falling block
  function createBlock() {
    const color = getRandomColor();
    const x = Math.random() * (canvas.width - blockSize);
    blocks.push({ x, y: -blockSize, color });
  }

  // Move platform
  function movePlatform() {
    if (leftPressed && platformX > 0) {
      platformX -= 10;
    }
    if (rightPressed && platformX + platformWidth < canvas.width) {
      platformX += 10;
    }
  }

  // Draw functions
  function drawPlatform() {
    ctx.fillStyle = platformColor;
    ctx.fillRect(platformX, canvas.height - platformHeight, platformWidth, platformHeight);

    // Highlight edge
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(platformX, canvas.height - platformHeight, platformWidth, platformHeight);
  }

  function drawBlocks() {
    blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, blockSize, blockSize);

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = block.color;
      ctx.fillRect(block.x, block.y, blockSize, blockSize);
      ctx.shadowBlur = 0;
    });
  }

  function updateScore() {
    scoreDisplay.textContent = score;
  }

  function updateLevel() {
    levelDisplay.textContent = level;
  }

  // Check landing & scoring
  function checkBlockLanding() {
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      const onPlatformY = block.y + blockSize >= canvas.height - platformHeight;
      const withinX = block.x + blockSize > platformX && block.x < platformX + platformWidth;

      if (onPlatformY && withinX) {
        if (block.color === platformColor) {
          score++;
          updateScore();
          blocks.splice(i, 1); // Remove matched block
        } else {
          gameOver();
        }
      }
    }
  }

  // Move and clean up blocks
  function moveBlocks(dt) {
    for (let i = blocks.length - 1; i >= 0; i--) {
      blocks[i].y += blockSpeed * dt * 60;

      // Missed block (reached bottom)
      if (blocks[i].y > canvas.height) {
        gameOver();
      }
    }
    // Filter out off-screen blocks (cleanup)
    blocks = blocks.filter(b => b.y <= canvas.height);
  }

  // Level up logic
  function checkLevelUp() {
    const newLevel = Math.floor(score / 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      blockSpeed += 0.5;
      platformColor = getRandomColor();
      updateLevel();
    }
  }

  // Game over
  function gameOver() {
    cancelAnimationFrame(gameLoopRef);
    finalScoreEl.textContent = score;
    overlay.style.display = 'flex';
  }

  // Restart game
  function restartGame() {
    score = 0;
    level = 1;
    blockSpeed = 2;
    blocks = [];
    platformWidth = 150;
    platformX = canvas.width / 2 - platformWidth / 2;
    platformColor = getRandomColor();
    updateScore();
    updateLevel();
    overlay.style.display = 'none';
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  restartButton.addEventListener('click', restartGame);

  // Render loop
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#1a1a1a');
    bg.addColorStop(1, '#333');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPlatform();
    drawBlocks();
  }

  // Main game loop
  function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    movePlatform();
    moveBlocks(dt);
    checkBlockLanding();
    checkLevelUp();

    render();

    // Spawn blocks
    if (Math.random() < 0.02 + level * 0.002) {
      createBlock();
    }

    gameLoopRef = requestAnimationFrame(gameLoop);
  }

  let gameLoopRef;
  lastTime = performance.now();
  gameLoopRef = requestAnimationFrame(gameLoop);
})();
