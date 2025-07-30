// ===== Starlight Rogues - Core Game Architecture =====

// --- 0. Utility Functions ---
window.srUtils = {
  clamp: function(v, min, max) { return Math.max(min, Math.min(max, v)); },
  randRange: function(min, max) { return Math.random() * (max - min) + min; },
  pointDist: function(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }
};

// --- 1. Level Data ---
window.level1 = {
  stages: [
    {
      waves: [
        {
          // V-formation, simple enemies
          spawnPattern: 'V',
          enemyCount: 7,
          enemyHP: 2,
          speed: 1.1,
          delay: 0 // immediate
        }
      ]
    }
  ]
};

// --- 2. Game State ---
window.GameState = function() {
  this.screen = 'start'; // start, playing, stageComplete
  this.score = 0;
  this.currency = 0;
  this.playerHealth = 6;
  this.playerMaxHealth = 6;
  this.level = 1;
  this.stage = 1;
  this.wave = 1;
  this.waveEnemiesRemaining = 0;
  this.isPaused = false;
};
window.GameState.prototype = {
  reset: function() {
    this.score = 0;
    this.currency = 0;
    this.playerHealth = 6;
    this.level = 1;
    this.stage = 1;
    this.wave = 1;
    this.waveEnemiesRemaining = 0;
    this.isPaused = false;
  }
};

// --- 3. Entities ---
// 3.1 Player
window.Player = function(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 22;
  this.speed = 4.2;
  this.colorA = "#00cfff";
  this.colorB = "#0441a1";
  this.health = window.gameState ? window.gameState.playerMaxHealth : 6;
  this.maxHealth = 6;
  this.shootCooldown = 0;
  this.bullets = [];
  this.isAlive = true;
  this.invuln = 0;
};
window.Player.prototype = {
  update: function(input, dt) {
    if (!this.isAlive) return;
    // Movement
    let dx = 0, dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    // Touch drag
    if (input.touchActive && input.touchMove) {
      this.x = window.srUtils.clamp(input.touchMove.x, this.radius, window.GameLoop.CANVAS_W - this.radius);
      this.y = window.srUtils.clamp(input.touchMove.y, this.radius, window.GameLoop.CANVAS_H - this.radius);
    } else {
      if (dx || dy) {
        let mag = Math.sqrt(dx*dx+dy*dy);
        if (mag) { dx /= mag; dy /= mag; }
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        // Clamp to bounds
        this.x = window.srUtils.clamp(this.x, this.radius, window.GameLoop.CANVAS_W - this.radius);
        this.y = window.srUtils.clamp(this.y, this.radius, window.GameLoop.CANVAS_H - this.radius);
      }
    }
    // Shooting
    if (input.shoot || input.touchShoot) {
      if (this.shootCooldown <= 0) {
        this.bullets.push({ x: this.x, y: this.y - this.radius - 8, vy: -8, r: 5, alive: true });
        this.shootCooldown = 0.18;
      }
    }
    // Bullets update
    for (let b of this.bullets) {
      b.y += b.vy;
      if (b.y < -10) b.alive = false;
    }
    this.bullets = this.bullets.filter(b => b.alive);
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.invuln > 0) this.invuln -= dt;
  },
  draw: function(ctx) {
    // Ship: glowing circle + triangle cockpit
    ctx.save();
    ctx.beginPath();
    let grad = ctx.createRadialGradient(this.x, this.y, 7, this.x, this.y, this.radius);
    grad.addColorStop(0, this.colorA);
    grad.addColorStop(1, this.colorB);
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#00eaffcc";
    ctx.shadowBlur = 16;
    ctx.globalAlpha = (this.invuln > 0 && Math.floor(this.invuln*10)%2===0) ? 0.55 : 1.0;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Cockpit
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.radius + 5);
    ctx.lineTo(this.x - 9, this.y + 5);
    ctx.lineTo(this.x + 9, this.y + 5);
    ctx.closePath();
    ctx.fillStyle = "#fff9";
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.restore();
    // Bullets
    for (let b of this.bullets) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      let grad2 = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r);
      grad2.addColorStop(0, "#fff");
      grad2.addColorStop(1, "#1ec7ff");
      ctx.fillStyle = grad2;
      ctx.shadowColor = "#0ff";
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.95;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },
  takeDamage: function(dmg) {
    if (this.invuln > 0) return;
    this.health -= dmg;
    if (window.gameState) window.gameState.playerHealth = this.health;
    if (this.health <= 0) { this.isAlive = false; }
    this.invuln = 1.0;
  },
  collect: function(type, value) {
    if (type === "currency") {
      window.gameState.currency += value;
    } else if (type === "powerup") {
      this.health = Math.min(this.maxHealth, this.health + value);
      window.gameState.playerHealth = this.health;
    }
  }
};
// 3.2 Enemy
window.Enemy = function(x, y, hp, speed) {
  this.x = x;
  this.y = y;
  this.radius = 18;
  this.hp = hp;
  this.maxHp = hp;
  this.speed = speed;
  this.colorA = "#fd2";
  this.colorB = "#c40";
  this.alive = true;
  this.hitFlash = 0;
  this.dropChance = 1.0;
};
window.Enemy.prototype = {
  update: function(dt) {
    this.y += this.speed;
    if (this.hitFlash > 0) this.hitFlash -= dt*2;
    if (this.y > window.GameLoop.CANVAS_H + 30) this.alive = false;
  },
  draw: function(ctx) {
    ctx.save();
    // Body
    ctx.beginPath();
    let grad = ctx.createRadialGradient(this.x, this.y, 6, this.x, this.y, this.radius);
    grad.addColorStop(0, this.hitFlash > 0 ? "#fff" : this.colorA);
    grad.addColorStop(1, this.colorB);
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#ff8000cc";
    ctx.shadowBlur = 12;
    ctx.globalAlpha = this.alive ? 1 : 0.7;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Wings (V)
    ctx.strokeStyle = "#fff8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius, this.y + 6);
    ctx.lineTo(this.x, this.y - this.radius * 0.7);
    ctx.lineTo(this.x + this.radius, this.y + 6);
    ctx.stroke();
    // Health bar
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#333";
    ctx.fillRect(this.x - 14, this.y + this.radius + 4, 28, 5);
    ctx.fillStyle = "#f90";
    let hpr = Math.max(0, this.hp/this.maxHp);
    ctx.fillRect(this.x - 14, this.y + this.radius + 4, 28*hpr, 5);
    ctx.globalAlpha = 1.0;
    ctx.restore();
  },
  takeDamage: function(d) {
    this.hp -= d;
    this.hitFlash = 1;
    if (this.hp <= 0) this.alive = false;
  }
};
// 3.3 Powerup
window.Powerup = function(x, y, type, value) {
  this.x = x; this.y = y;
  this.radius = 14;
  this.type = type; // 'powerup'
  this.value = value; // amount to heal
  this.vy = 2.2;
  this.alive = true;
};
window.Powerup.prototype = {
  update: function(dt) {
    this.y += this.vy;
    if (this.y > window.GameLoop.CANVAS_H + 24) this.alive = false;
  },
  draw: function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = "#77fbcb";
    ctx.shadowColor = "#46ffe6";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Plus sign
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x - 6, this.y);
    ctx.lineTo(this.x + 6, this.y);
    ctx.moveTo(this.x, this.y - 6);
    ctx.lineTo(this.x, this.y + 6);
    ctx.stroke();
    ctx.restore();
  }
};
// 3.4 Currency
window.Currency = function(x, y, value) {
  this.x = x; this.y = y;
  this.radius = 11;
  this.value = value;
  this.vy = 2.3;
  this.alive = true;
};
window.Currency.prototype = {
  update: function(dt) {
    this.y += this.vy;
    if (this.y > window.GameLoop.CANVAS_H + 20) this.alive = false;
  },
  draw: function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    let grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.radius);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, "#ffe011");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#ffd600";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Dollar sign
    ctx.font = "bold 15px monospace";
    ctx.fillStyle = "#a96b00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", this.x, this.y+1);
    ctx.restore();
  }
};

// --- 4. Input Handler ---
window.InputHandler = function(canvas) {
  this.left = false; this.right = false; this.up = false; this.down = false; this.shoot = false;
  this.touchActive = false;
  this.touchMove = null;
  this.touchShoot = false;
  this._initEvents(canvas);
};
window.InputHandler.prototype = {
  _initEvents: function(canvas) {
    // Keyboard
    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.down = true;
      if (e.code === 'Space') this.shoot = true;
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.down = false;
      if (e.code === 'Space') this.shoot = false;
    });
    // Touch: drag to move, tap to shoot
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        let rect = canvas.getBoundingClientRect();
        let tx = (e.touches[0].clientX - rect.left) * (canvas.width/rect.width);
        let ty = (e.touches[0].clientY - rect.top) * (canvas.height/rect.height);
        if (ty > window.GameLoop.CANVAS_H * 0.5) {
          this.touchActive = true;
          this.touchMove = { x: tx, y: ty };
        } else {
          this.touchShoot = true;
        }
      }
    });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && this.touchActive) {
        let rect = canvas.getBoundingClientRect();
        let tx = (e.touches[0].clientX - rect.left) * (canvas.width/rect.width);
        let ty = (e.touches[0].clientY - rect.top) * (canvas.height/rect.height);
        this.touchMove = { x: tx, y: ty };
      }
    });
    canvas.addEventListener('touchend', e => {
      this.touchActive = false;
      this.touchMove = null;
      this.touchShoot = false;
    });
    // Mouse: drag to move, click to shoot
    let mouseDrag = false;
    canvas.addEventListener('mousedown', e => {
      let rect = canvas.getBoundingClientRect();
      let y = (e.clientY - rect.top) * (canvas.height/rect.height);
      if (y > window.GameLoop.CANVAS_H * 0.5) {
        mouseDrag = true;
        this.touchActive = true;
      } else {
        this.shoot = true;
      }
    });
    canvas.addEventListener('mousemove', e => {
      if (mouseDrag && this.touchActive) {
        let rect = canvas.getBoundingClientRect();
        let x = (e.clientX - rect.left) * (canvas.width/rect.width);
        let y = (e.clientY - rect.top) * (canvas.height/rect.height);
        this.touchMove = { x, y };
      }
    });
    window.addEventListener('mouseup', e => {
      mouseDrag = false;
      this.touchActive = false;
      this.touchMove = null;
      this.shoot = false;
    });
  }
};

// --- 5. Game Loop ---
window.GameLoop = function(canvas, ctx, onGameOver, onStageComplete) {
  this.canvas = canvas;
  this.ctx = ctx;
  this.input = new window.InputHandler(canvas);
  this.onGameOver = onGameOver;
  this.onStageComplete = onStageComplete;
  this.player = null;
  this.enemies = [];
  this.powerups = [];
  this.currency = [];
  this.bgOffset = 0;
  this.lastTime = 0;
  this.running = false;
  this.waveStarted = false;
  this.spawned = 0;
  this.waveData = null;
  this.setSize();
};
window.GameLoop.CANVAS_W = 360;
window.GameLoop.CANVAS_H = 576;
window.GameLoop.prototype = {
  setSize: function() {
    let dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.GameLoop.CANVAS_W * dpr;
    this.canvas.height = window.GameLoop.CANVAS_H * dpr;
    this.canvas.style.width = window.GameLoop.CANVAS_W + "px";
    this.canvas.style.height = window.GameLoop.CANVAS_H + "px";
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.scale(dpr, dpr);
  },
  start: function() {
    this.running = true;
    this.waveStarted = false;
    this.player = new window.Player(window.GameLoop.CANVAS_W/2, window.GameLoop.CANVAS_H*0.82);
    this.enemies = [];
    this.powerups = [];
    this.currency = [];
    this.bgOffset = 0;
    this.spawned = 0;
    // --- Load wave data ---
    let lvl = window.level1.stages[window.gameState.stage-1];
    this.waveData = lvl.waves[window.gameState.wave-1];
    window.gameState.waveEnemiesRemaining = this.waveData.enemyCount;
    this._spawnWave();
    this.lastTime = performance.now();
    this.render();
  },
  _spawnWave: function() {
    // V-formation
    let n = this.waveData.enemyCount;
    let cx = window.GameLoop.CANVAS_W/2;
    let y0 = 50;
    let spread = 100 + 12*n;
    for (let i=0; i<n; ++i) {
      let angle = (i - (n-1)/2) * (Math.PI/13); // moderate V spread
      let x = cx + Math.sin(angle) * spread;
      let y = y0 + Math.abs(i - (n-1)/2) * 12;
      this.enemies.push(new window.Enemy(x, y, this.waveData.enemyHP, this.waveData.speed));
    }
    this.waveStarted = true;
    this.spawned = n;
  },
  render: function(now) {
    if (!this.running) return;
    if (!now) now = performance.now();
    let dt = Math.min((now - this.lastTime)/1000, 0.04);
    this.lastTime = now;
    // --- Update ---
    this._update(dt);
    // --- Draw ---
    this._draw();
    // Next frame
    requestAnimationFrame(this.render.bind(this));
  },
  _update: function(dt) {
    // Background scroll
    this.bgOffset += 30*dt;
    if (this.bgOffset > window.GameLoop.CANVAS_H) this.bgOffset = 0;
    // Player
    this.player.update(this.input, dt);
    // Enemies
    for (let e of this.enemies) e.update(dt);
    // Powerups/Currency
    for (let p of this.powerups) p.update(dt);
    for (let c of this.currency) c.update(dt);
    // Collisions: bullets<>enemies
    for (let bullet of this.player.bullets) {
      for (let enemy of this.enemies) {
        if (!bullet.alive || !enemy.alive) continue;
        if (window.srUtils.pointDist(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.radius+bullet.r) {
          bullet.alive = false; enemy.takeDamage(1);
          if (!enemy.alive) {
            window.gameState.score += 100;
            window.gameState.waveEnemiesRemaining--;
            // Drops
            if (Math.random() < 0.66) {
              if (Math.random() < 0.6) {
                this.currency.push(new window.Currency(enemy.x, enemy.y, 1));
              } else {
                this.powerups.push(new window.Powerup(enemy.x, enemy.y, 'powerup', 2));
              }
            }
          }
        }
      }
    }
    // Player<>enemies
    for (let enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (window.srUtils.pointDist(this.player.x, this.player.y, enemy.x, enemy.y) < enemy.radius+this.player.radius-4) {
        this.player.takeDamage(2);
        enemy.alive = false;
        window.gameState.waveEnemiesRemaining--;
      }
    }
    // Player<>powerups
    for (let p of this.powerups) {
      if (!p.alive) continue;
      if (window.srUtils.pointDist(this.player.x, this.player.y, p.x, p.y) < p.radius+this.player.radius-2) {
        this.player.collect('powerup', p.value);
        p.alive = false;
      }
    }
    // Player<>currency
    for (let c of this.currency) {
      if (!c.alive) continue;
      if (window.srUtils.pointDist(this.player.x, this.player.y, c.x, c.y) < c.radius+this.player.radius-2) {
        this.player.collect('currency', c.value);
        c.alive = false;
      }
    }
    // Remove dead
    this.enemies = this.enemies.filter(e => e.alive);
    this.powerups = this.powerups.filter(e => e.alive);
    this.currency = this.currency.filter(e => e.alive);
    // Game over
    if (!this.player.isAlive) {
      this.running = false;
      setTimeout(()=>this.onGameOver(), 700);
      return;
    }
    // Wave complete
    if (window.gameState.waveEnemiesRemaining <= 0 && this.enemies.length === 0) {
      this.running = false;
      setTimeout(()=>this.onStageComplete(), 900);
      return;
    }
  },
  _draw: function() {
    let ctx = this.ctx;
    // --- Background ---
    ctx.clearRect(0,0,window.GameLoop.CANVAS_W,window.GameLoop.CANVAS_H);
    // Starfield (scrolling dots)
    ctx.save();
    ctx.fillStyle = "#fff3";
    for (let i=0; i<36; ++i) {
      let y = (i*48 + (this.bgOffset%48));
      let x = (i*61)%window.GameLoop.CANVAS_W;
      ctx.globalAlpha = 0.28 + 0.15*Math.sin(i);
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + (i%3), 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    // --- Entities ---
    this.player.draw(ctx);
    for (let e of this.enemies) e.draw(ctx);
    for (let p of this.powerups) p.draw(ctx);
    for (let c of this.currency) c.draw(ctx);
  }
};

// --- 6. UI Components ---
// 6.1 Start Screen
window.StartScreen = function(container, onStart) {
  this.container = container;
  this.onStart = onStart;
  this._render();
};
window.StartScreen.prototype = {
  _render: function() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full h-[576px] bg-gradient-to-b from-blue-900/90 to-black/95">
        <div class="sr-title mb-3">Starlight Rogues</div>
        <div class="sr-instructions">
          <span class="block mb-2">Move: <kbd>Arrow Keys</kbd> or <kbd>WASD</kbd> or drag<br/>Shoot: <kbd>Space</kbd> or tap/click top of screen</span>
          <span class="block mt-1">Defeat all enemies to win the stage.<br/>Collect <span class="text-yellow-200">currency</span> &amp; <span class="text-green-200">powerups</span>!</span>
        </div>
        <button id="srStartBtn" class="sr-btn mt-6 mb-7">Start Game</button>
        <div class="text-xs text-white/30 mt-2">v0.1 Roguelike Demo</div>
      </div>
    `;
    let btn = document.getElementById('srStartBtn');
    btn.onclick = () => { this.onStart(); };
  },
  destroy: function() {
    this.container.innerHTML = '';
  }
};
// 6.2 HUD
window.HUD = function(container) {
  this.container = container;
  this._render();
};
window.HUD.prototype = {
  _render: function() {
    // Insert HUD containers
    // Health bar (top-left), Score (top-right), Currency (bottom-right)
    let hudHtml = `
      <div class="sr-hud" id="hudHealth">
        <span class="text-white font-semibold text-xs">HEALTH</span>
        <div class="sr-hud-bar bg-gray-700">
          <div class="sr-hud-bar-inner bg-gradient-to-r from-green-400 to-green-700" style="width:100%;"></div>
        </div>
      </div>
      <div class="sr-score" id="hudScore">Score: 0</div>
      <div class="sr-currency" id="hudCurrency">
        <span class="inline-block w-4 h-4 rounded-full bg-yellow-300 shadow-md mr-1"></span>
        <span id="hudCurrencyVal">0</span>
      </div>
    `;
    this._hudNode = document.createElement('div');
    this._hudNode.innerHTML = hudHtml;
    this.container.appendChild(this._hudNode);
  },
  update: function(gs) {
    // Health
    let hp = Math.max(0, gs.playerHealth), maxHp = gs.playerMaxHealth;
    let perc = (maxHp>0 ? Math.max(0, Math.min(1, hp/maxHp)) : 0);
    let b = this._hudNode.querySelector('.sr-hud-bar-inner');
    b.style.width = `${perc*100}%`;
    b.style.background = perc > 0.6 ? 'linear-gradient(90deg,#36ff68,#257c48)' : perc > 0.3 ? 'linear-gradient(90deg,#ffed36,#c49716)' : 'linear-gradient(90deg,#ff4b36,#911)';
    // Score
    let s = this._hudNode.querySelector('#hudScore');
    s.textContent = "Score: "+gs.score;
    // Currency
    let c = this._hudNode.querySelector('#hudCurrencyVal');
    c.textContent = gs.currency;
  },
  destroy: function() {
    if (this._hudNode && this._hudNode.parentElement) this._hudNode.parentElement.removeChild(this._hudNode);
  }
};
// 6.3 Stage Complete Overlay
window.StageCompleteOverlay = function(container, onContinue) {
  this.container = container;
  this.onContinue = onContinue;
  this._render();
};
window.StageCompleteOverlay.prototype = {
  _render: function() {
    let div = document.createElement('div');
    div.className = "sr-stage-complete";
    div.innerHTML = `
      <div class="text-3xl font-bold text-yellow-300 mb-2">Stage Complete!</div>
      <div class="text-white text-lg mb-4">You cleared the wave.<br/>Score: <span id="scoVal">${window.gameState.score}</span></div>
      <button class="sr-btn" id="nextBtn">Play Again</button>
    `;
    this.container.appendChild(div);
    div.querySelector("#nextBtn").onclick = () => { this.onContinue(); };
    this._node = div;
  },
  destroy: function() {
    if (this._node && this._node.parentElement) this._node.parentElement.removeChild(this._node);
  }
};
// 6.4 Game Over Overlay
window.GameOverOverlay = function(container, onContinue) {
  this.container = container;
  this.onContinue = onContinue;
  this._render();
};
window.GameOverOverlay.prototype = {
  _render: function() {
    let div = document.createElement('div');
    div.className = "sr-stage-complete";
    div.innerHTML = `
      <div class="text-3xl font-bold text-red-400 mb-2">Game Over</div>
      <div class="text-white text-lg mb-4">Your ship was destroyed.<br/>Score: <span id="scoVal">${window.gameState.score}</span></div>
      <button class="sr-btn" id="retryBtn">Retry</button>
    `;
    this.container.appendChild(div);
    div.querySelector("#retryBtn").onclick = () => { this.onContinue(); };
    this._node = div;
  },
  destroy: function() {
    if (this._node && this._node.parentElement) this._node.parentElement.removeChild(this._node);
  }
};

// --- 7. Game Screen ---
window.GameScreen = function(container, onGameEnd, onStageComplete) {
  this.container = container;
  this.onGameEnd = onGameEnd;
  this.onStageComplete = onStageComplete;
  this.canvas = document.createElement('canvas');
  this.canvas.tabIndex = 1;
  this.canvas.className = "block bg-black rounded-lg mx-auto";
  this.ctx = this.canvas.getContext('2d');
  this.hud = null;
  this.gameloop = null;
  this._render();
};
window.GameScreen.prototype = {
  _render: function() {
    this.container.innerHTML = "";
    this.container.appendChild(this.canvas);
    // Set initial size
    this._resizeCanvas();
    // HUD
    this.hud = new window.HUD(this.container);
    // Start loop
    this.gameloop = new window.GameLoop(this.canvas, this.ctx,
      this._onGameOver.bind(this),
      this._onStageComplete.bind(this)
    );
    this.gameloop.start();
    // Focus for keyboard
    setTimeout(() => this.canvas.focus(), 120);
    // Responsive
    window.addEventListener('resize', this._resizeCanvas.bind(this));
    // HUD update timer
    this._hudUpdater = setInterval(() => this.hud.update(window.gameState), 120);
  },
  _resizeCanvas: function() {
    // Fit to container width, keep aspect ratio.
    let parent = this.container;
    let maxW = parent.offsetWidth;
    let aspect = window.GameLoop.CANVAS_W / window.GameLoop.CANVAS_H;
    let w = Math.min(maxW, 500);
    let h = w / aspect;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    // Keep internal resolution for sharpness; GameLoop will set .width/.height
    if (this.gameloop) this.gameloop.setSize();
  },
  destroy: function() {
    if (this.hud) { this.hud.destroy(); }
    if (this._hudUpdater) { clearInterval(this._hudUpdater); }
    if (this.gameloop) { this.gameloop.running = false; }
    window.removeEventListener('resize', this._resizeCanvas.bind(this));
    this.container.innerHTML = "";
  },
  _onGameOver: function() {
    this.hud.update(window.gameState);
    new window.GameOverOverlay(this.container, () => {
      this.destroy();
      window.gameState.reset();
      window.App.showStart();
    });
  },
  _onStageComplete: function() {
    this.hud.update(window.gameState);
    new window.StageCompleteOverlay(this.container, () => {
      this.destroy();
      window.gameState.reset();
      window.App.showStart();
    });
  }
};

// --- 8. App Manager ---
window.App = {
  container: null,
  currScreen: null,
  showStart: function() {
    if (this.currScreen && this.currScreen.destroy) this.currScreen.destroy();
    this.currScreen = new window.StartScreen(this.container, this.showGame.bind(this));
  },
  showGame: function() {
    if (this.currScreen && this.currScreen.destroy) this.currScreen.destroy();
    this.currScreen = new window.GameScreen(this.container);
  }
};

// --- 9. Init ---
window.gameState = new window.GameState();
function initGame() {
  let container = document.getElementById('gameContainer');
  window.App.container = container;
  window.App.showStart();
}
window.addEventListener('DOMContentLoaded', initGame);