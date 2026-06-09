// ============================================================================
//  engine.js  –  Kern-Tipplogik: Text rendern, Eingabe prüfen, Live-Statistik
// ============================================================================
import { Sound } from './audio.js';
import { CHAR_TO_FINGER } from './data.js';

export class TypingEngine {
  constructor({ textEl, onUpdate, onFinish, onChar, mode = 'lesson', timeLimit = 0 }) {
    this.textEl = textEl;
    this.onUpdate = onUpdate || (() => {});
    this.onFinish = onFinish || (() => {});
    this.onChar = onChar || (() => {});   // (char, ok, finger) für Keyboard/Hand
    this.mode = mode;
    this.timeLimit = timeLimit;           // Sekunden, 0 = bis Text fertig
    this.reset();
  }

  reset() {
    this.target = '';
    this.pos = 0;
    this.typed = 0;
    this.errors = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = null;
    this.endTime = null;
    this.perKey = {};
    this.finished = false;
    this._raf = null;
    this._spans = [];
  }

  setText(text) {
    this.reset();
    this.target = text;
    this.render();
    this.updateCaret();
    this.emitNext();
  }

  render() {
    this.textEl.innerHTML = '';
    this._spans = [];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.target.length; i++) {
      const span = document.createElement('span');
      span.className = 'ch';
      const c = this.target[i];
      span.textContent = c === ' ' ? ' ' : c;
      if (c === ' ') span.classList.add('ch-space');
      frag.appendChild(span);
      this._spans.push(span);
    }
    this.textEl.appendChild(frag);
  }

  start() {
    if (this.startTime) return;
    this.startTime = performance.now();
    this._tick();
  }

  _tick() {
    if (this.finished) return;
    const stats = this.computeStats();
    this.onUpdate(stats);
    if (this.timeLimit && stats.elapsed >= this.timeLimit) {
      this.finish();
      return;
    }
    this._raf = requestAnimationFrame(() => this._tick());
  }

  // Verarbeitet einen einzelnen Zeichen-Input
  input(char) {
    if (this.finished || this.pos >= this.target.length) return;
    if (!this.startTime) this.start();

    const expected = this.target[this.pos];
    const ok = char === expected;
    const span = this._spans[this.pos];

    this.typed++;
    if (ok) {
      span.className = 'ch ch-correct';
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      Sound.key();
      if (this.combo > 0 && this.combo % 10 === 0) Sound.combo(this.combo);
      this.pos++;
    } else {
      span.classList.add('ch-wrong');
      this.errors++;
      this.combo = 0;
      const k = expected === ' ' ? 'space' : expected.toLowerCase();
      this.perKey[k] = (this.perKey[k] || 0) + 1;
      Sound.error();
      // Im Lektions-/Testmodus: stehenbleiben bis richtig (klassisch). pos NICHT erhöhen.
    }

    const finger = CHAR_TO_FINGER[expected.toLowerCase()];
    this.onChar(expected, ok, finger);
    this.updateCaret();
    this.emitNext();

    if (this.pos >= this.target.length) this.finish();
  }

  backspace() {
    if (this.finished || this.pos === 0) return;
    // nur über bereits korrekte Zeichen zurück
    this.pos--;
    const span = this._spans[this.pos];
    span.className = 'ch';
    if (this.target[this.pos] === ' ') span.classList.add('ch-space');
    this.updateCaret();
    this.emitNext();
  }

  updateCaret() {
    this._spans.forEach(s => s.classList.remove('ch-caret'));
    if (this.pos < this._spans.length) {
      const s = this._spans[this.pos];
      s.classList.add('ch-caret');
      // sanftes Scrollen, damit der Cursor sichtbar bleibt
      const box = this.textEl.getBoundingClientRect();
      const cr = s.getBoundingClientRect();
      if (cr.top - box.top > box.height * 0.6) {
        this.textEl.scrollTop += cr.top - box.top - box.height * 0.4;
      }
    }
  }

  emitNext() {
    this.nextChar = this.pos < this.target.length ? this.target[this.pos] : null;
  }

  computeStats() {
    const now = this.finished ? this.endTime : performance.now();
    const elapsedMs = this.startTime ? now - this.startTime : 0;
    const elapsed = elapsedMs / 1000;
    const minutes = elapsedMs / 60000 || 1 / 60000;
    const correctChars = this.pos;
    const wpm = elapsedMs > 0 ? (correctChars / 5) / (elapsedMs / 60000) : 0;
    const accuracy = this.typed > 0 ? (this.typed - this.errors) / this.typed * 100 : 100;
    const progress = this.target.length ? this.pos / this.target.length : 0;
    return {
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, accuracy),
      elapsed,
      remaining: this.timeLimit ? Math.max(0, this.timeLimit - elapsed) : null,
      combo: this.combo,
      maxCombo: this.maxCombo,
      errors: this.errors,
      progress,
      correctChars,
    };
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.endTime = performance.now();
    if (this._raf) cancelAnimationFrame(this._raf);
    const stats = this.computeStats();
    Sound.finish();
    this.onFinish({
      ...stats,
      chars: this.typed,
      timeMs: this.endTime - (this.startTime || this.endTime),
      perKey: this.perKey,
      mode: this.mode,
    });
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.finished = true;
  }
}
