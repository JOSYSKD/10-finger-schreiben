// ============================================================================
//  audio.js  –  Sound-Effekte komplett synthetisiert (kein Datei-Download)
// ============================================================================
let ctx = null;
let master = null;
export const Sound = {
  enabled: true,
  volume: 0.5,

  _ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = this.volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  },

  setVolume(v) {
    this.volume = v;
    if (master) master.gain.value = v;
  },

  _tone(freq, dur, type = 'sine', vol = 0.3, slideTo = null) {
    if (!this.enabled) return;
    this._ensure();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.02);
  },

  key()    { this._tone(420 + Math.random() * 60, 0.05, 'triangle', 0.18); },
  error()  { this._tone(180, 0.18, 'sawtooth', 0.22, 90); },
  word()   { this._tone(660, 0.08, 'sine', 0.22); },
  combo(n) { this._tone(520 + Math.min(n, 40) * 12, 0.07, 'square', 0.16); },
  finish() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._tone(f, 0.18, 'sine', 0.25), i * 90)); },
  levelup(){ [392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._tone(f, 0.16, 'triangle', 0.22), i * 70)); },
  achievement() { [659, 880, 1175].forEach((f, i) => setTimeout(() => this._tone(f, 0.22, 'sine', 0.28), i * 110)); },
  explode(){ this._tone(120, 0.25, 'sawtooth', 0.25, 50); },
  shoot()  { this._tone(880, 0.05, 'square', 0.12, 1320); },
};
