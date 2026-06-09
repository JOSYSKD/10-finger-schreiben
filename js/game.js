// ============================================================================
//  game.js  –  "Wortregen": fallende Wörter abtippen (Arcade-Modus)
// ============================================================================
import { Sound } from './audio.js';
import { wordPool } from './data.js';

export class WordRain {
  constructor(canvas, { lang = 'de', onState, onEnd }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pool = wordPool(lang);
    this.onState = onState || (() => {});
    this.onEnd = onEnd || (() => {});
    this.running = false;
    this._onKey = this._handleKey.bind(this);
  }

  start() {
    this.resize();
    this.words = [];        // {text, typed, x, y, vy, color}
    this.particles = [];
    this.score = 0;
    this.lives = 5;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.typedTotal = 0;
    this.errors = 0;
    this.spawnEvery = 1800;  // ms
    this.lastSpawn = 0;
    this.fallSpeed = 0.35;   // px pro ms-frame Basis
    this.active = null;      // aktuell anvisiertes Wort
    this.running = true;
    this.startTime = performance.now();
    window.addEventListener('keydown', this._onKey);
    this._loop(performance.now());
    this.emit();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.W = rect.width; this.H = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _spawn() {
    const len = Math.min(3 + Math.floor(this.level / 2), 9);
    const candidates = this.pool.filter(w => w.length <= len + 2);
    const text = candidates[Math.floor(Math.random() * candidates.length)] || 'tipp';
    const fontW = text.length * 13 + 30;
    const x = Math.random() * Math.max(10, this.W - fontW - 20) + 10;
    const hue = Math.floor(Math.random() * 360);
    this.words.push({
      text, typed: 0, x, y: -20,
      vy: this.fallSpeed * (0.7 + Math.random() * 0.6) * (1 + this.level * 0.06),
      hue, w: fontW,
    });
  }

  _handleKey(e) {
    if (!this.running) return;
    if (e.key === 'Escape') { this.end(); return; }
    if (e.key.length !== 1) return;
    e.preventDefault();
    const ch = e.key;
    this.typedTotal++;

    // aktives Wort fortsetzen oder ein passendes neues anvisieren
    if (!this.active || this.active.typed >= this.active.text.length) {
      this.active = this.words
        .filter(w => w.text[0] === ch)
        .sort((a, b) => b.y - a.y)[0] || null;   // das tiefste passende
    }

    if (this.active && this.active.text[this.active.typed] === ch) {
      this.active.typed++;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      Sound.shoot();
      if (this.active.typed >= this.active.text.length) {
        this._destroyWord(this.active);
        this.active = null;
      }
    } else {
      this.combo = 0;
      this.errors++;
      Sound.error();
      // angefangene Tipp-Markierung des aktiven Wortes zurücksetzen
      if (this.active) this.active.typed = 0;
      this.active = null;
    }
    this.emit();
  }

  _destroyWord(word) {
    const i = this.words.indexOf(word);
    if (i >= 0) this.words.splice(i, 1);
    const pts = word.text.length * 10 * (1 + Math.floor(this.combo / 5));
    this.score += pts;
    Sound.explode();
    this._burst(word.x + word.w / 2, word.y, word.hue);
    // Level-Aufstieg alle 300 Punkte
    const newLevel = 1 + Math.floor(this.score / 300);
    if (newLevel > this.level) {
      this.level = newLevel;
      this.spawnEvery = Math.max(550, 1800 - this.level * 110);
      Sound.levelup();
    }
  }

  _burst(x, y, hue) {
    for (let i = 0; i < 18; i++) {
      const a = (Math.PI * 2 * i) / 18 + Math.random();
      const sp = 1 + Math.random() * 3;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, hue: hue + Math.random() * 40 - 20,
      });
    }
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min(40, now - (this._last || now));
    this._last = now;

    if (now - this.lastSpawn > this.spawnEvery) {
      this._spawn();
      this.lastSpawn = now;
    }

    // bewegen
    for (const w of this.words) w.y += w.vy * dt;
    // verlorene Wörter (unten raus)
    for (let i = this.words.length - 1; i >= 0; i--) {
      if (this.words[i].y > this.H - 6) {
        if (this.words[i] === this.active) this.active = null;
        this.words.splice(i, 1);
        this.lives--;
        this.combo = 0;
        Sound.explode();
        if (this.lives <= 0) { this.draw(); this.end(); return; }
        this.emit();
      }
    }
    // partikel
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06; p.vy += 0.04 * dt * 0.06;
      p.life -= 0.02 * dt * 0.06 * 16;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.draw();
    requestAnimationFrame((t) => this._loop(t));
  }

  draw() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    // "Bodenlinie"
    ctx.strokeStyle = 'rgba(255,90,120,.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(0, H - 4); ctx.lineTo(W, H - 4); ctx.stroke();
    ctx.setLineDash([]);

    ctx.textBaseline = 'middle';
    ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
    for (const w of this.words) {
      const isActive = w === this.active;
      // Kapsel
      ctx.fillStyle = `hsla(${w.hue}, 70%, ${isActive ? 28 : 20}%, .85)`;
      roundRect(ctx, w.x, w.y - 18, w.w, 36, 18); ctx.fill();
      ctx.lineWidth = isActive ? 3 : 1.5;
      ctx.strokeStyle = `hsla(${w.hue}, 85%, 65%, ${isActive ? 1 : .6})`;
      roundRect(ctx, w.x, w.y - 18, w.w, 36, 18); ctx.stroke();
      // Text: getippter Teil hervorgehoben
      const tx = w.x + 16;
      const done = w.text.slice(0, w.typed);
      const rest = w.text.slice(w.typed);
      ctx.fillStyle = '#5ee0d6';
      ctx.fillText(done, tx, w.y);
      const dw = ctx.measureText(done).width;
      ctx.fillStyle = '#fff';
      ctx.fillText(rest, tx + dw, w.y);
    }
    // partikel
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = `hsl(${p.hue}, 90%, 60%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  emit() {
    this.onState({
      score: this.score, lives: this.lives, level: this.level,
      combo: this.combo, maxCombo: this.maxCombo,
    });
  }

  end() {
    if (!this.running) return;
    this.running = false;
    window.removeEventListener('keydown', this._onKey);
    Sound.finish();
    const timeMs = performance.now() - this.startTime;
    const accuracy = this.typedTotal > 0 ? (this.typedTotal - this.errors) / this.typedTotal * 100 : 100;
    this.onEnd({
      score: this.score, level: this.level, maxCombo: this.maxCombo,
      chars: this.typedTotal, errors: this.errors, accuracy, timeMs,
    });
  }

  destroy() {
    this.running = false;
    window.removeEventListener('keydown', this._onKey);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
