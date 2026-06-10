// ============================================================================
//  tmux.js  –  tmux-Shortcut-Trainer:  Lektion (lernen) + Spiel (anwenden)
//  Beide Module nutzen das echte Prefix-Konzept:  Strg+b  los  dann  Taste.
// ============================================================================
import { Sound } from './audio.js';
import { Store } from './storage.js';

// ---------------------------------------------------------------------------
//  Datenbasis: jede Aktion mit Zweittaste (key = e.key zum Vergleichen,
//  glyph = Anzeige auf der Tastenkappe) und – fürs Spiel – einer action,
//  die das Mock-Terminal sichtbar reagieren lässt.
// ---------------------------------------------------------------------------
export const TMUX = {
  prefixGlyphs: ['Strg', 'b'],

  steps: [
    // ---- Sessions ----
    { sect: 'Sessions', glyph: 'd',  key: 'd', name: 'Detach',            desc: 'Session ablegen – läuft im Hintergrund weiter', action: 'detach' },
    { sect: 'Sessions', glyph: 's',  key: 's', name: 'Session-Liste',     desc: 'Zwischen Sessions wechseln' },
    { sect: 'Sessions', glyph: '$',  key: '$', name: 'Session umbenennen',desc: 'Der aktuellen Session einen Namen geben', shift: true },

    // ---- Fenster (Tabs) ----
    { sect: 'Fenster', glyph: 'c',  key: 'c', name: 'Neues Fenster',      desc: 'Wie ein neuer Tab', action: 'new-window' },
    { sect: 'Fenster', glyph: ',',  key: ',', name: 'Fenster umbenennen', desc: 'Dem Fenster einen Namen geben', action: 'rename-window' },
    { sect: 'Fenster', glyph: 'n',  key: 'n', name: 'Nächstes Fenster',   desc: 'Einen Tab weiter', action: 'next-window' },
    { sect: 'Fenster', glyph: 'p',  key: 'p', name: 'Vorheriges Fenster', desc: 'Einen Tab zurück', action: 'prev-window' },
    { sect: 'Fenster', glyph: 'w',  key: 'w', name: 'Fenster-Liste',      desc: 'Alle Fenster zur Auswahl' },
    { sect: 'Fenster', glyph: '&',  key: '&', name: 'Fenster schließen',  desc: 'Aktuellen Tab schließen', shift: true, action: 'close-window' },

    // ---- Panes (Splits) ----
    { sect: 'Panes', glyph: '%',  key: '%',          name: 'Vertikal splitten',  desc: 'Zwei Panes nebeneinander', shift: true, action: 'split-v' },
    { sect: 'Panes', glyph: '"',  key: '"',          name: 'Horizontal splitten',desc: 'Zwei Panes übereinander', shift: true, action: 'split-h' },
    { sect: 'Panes', glyph: '→',  key: 'ArrowRight', name: 'Pane wechseln',      desc: 'Mit den Pfeiltasten zum Nachbar-Pane', action: 'pane-dir' },
    { sect: 'Panes', glyph: 'o',  key: 'o',          name: 'Pane durchwechseln', desc: 'Reihum durch alle Panes', action: 'pane-next' },
    { sect: 'Panes', glyph: 'z',  key: 'z',          name: 'Pane zoomen',        desc: 'Vollbild an/aus – sehr nützlich!', action: 'zoom' },
    { sect: 'Panes', glyph: 'x',  key: 'x',          name: 'Pane schließen',     desc: 'Aktuelles Pane schließen', action: 'close-pane' },
    { sect: 'Panes', glyph: 'Leer', key: ' ',        name: 'Layout wechseln',    desc: 'Anordnung der Panes durchschalten', action: 'layout' },

    // ---- Copy-Mode ----
    { sect: 'Copy-Mode', glyph: '[', key: '[', name: 'Copy-Mode',  desc: 'Scrollen & Text markieren', action: 'copy-mode' },
    { sect: 'Copy-Mode', glyph: ']', key: ']', name: 'Einfügen',   desc: 'Kopiertes wieder einsetzen' },

    // ---- Extras ----
    { sect: 'Extras', glyph: '?', key: '?', name: 'Hilfe',       desc: 'Alle Shortcuts anzeigen', shift: true },
    { sect: 'Extras', glyph: 't', key: 't', name: 'Große Uhr',   desc: 'Bildschirmfüllende Uhr', action: 'clock' },
    { sect: 'Extras', glyph: ':', key: ':', name: 'Befehlszeile',desc: 'tmux-Kommandos direkt eingeben', shift: true },
  ],
};

// Die fürs Spiel geeigneten (sichtbar animierbaren) Aktionen
const ARENA_MISSIONS = [
  { instr: 'Öffne ein neues Fenster',     glyph: 'c', key: 'c', action: 'new-window' },
  { instr: 'Geh zum nächsten Fenster',    glyph: 'n', key: 'n', action: 'next-window' },
  { instr: 'Geh zum vorherigen Fenster',  glyph: 'p', key: 'p', action: 'prev-window' },
  { instr: 'Benenne das Fenster um',      glyph: ',', key: ',', action: 'rename-window' },
  { instr: 'Schließe das aktuelle Fenster', glyph: '&', key: '&', shift: true, action: 'close-window' },
  { instr: 'Splitte vertikal (nebeneinander)', glyph: '%', key: '%', shift: true, action: 'split-v' },
  { instr: 'Splitte horizontal (übereinander)', glyph: '"', key: '"', shift: true, action: 'split-h' },
  { instr: 'Wechsle reihum durch die Panes', glyph: 'o', key: 'o', action: 'pane-next' },
  { instr: 'Zoome das aktuelle Pane',     glyph: 'z', key: 'z', action: 'zoom' },
  { instr: 'Schließe das aktuelle Pane',  glyph: 'x', key: 'x', action: 'close-pane' },
  { instr: 'Lege die Session ab (detach)', glyph: 'd', key: 'd', action: 'detach' },
  { instr: 'Öffne den Copy-Mode',         glyph: '[', key: '[', action: 'copy-mode' },
  { instr: 'Zeig die große Uhr',          glyph: 't', key: 't', action: 'clock' },
];

const WIN_NAMES = ['bash', 'vim', 'htop', 'logs', 'node', 'git', 'ssh', 'fish', 'top', 'make'];
const rand = (a) => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------------------
//  Kleiner Tasten-Renderer (Tastenkappen als HTML)
// ---------------------------------------------------------------------------
function keycapsHTML(step) {
  const second = step.shift
    ? `<kbd class="cap">⇧</kbd><kbd class="cap">${step.glyph}</kbd>`
    : `<kbd class="cap">${step.glyph}</kbd>`;
  return `
    <kbd class="cap">Strg</kbd><span class="plus">+</span><kbd class="cap">b</kbd>
    <span class="then">dann</span>${second}`;
}

// ---------------------------------------------------------------------------
//  Chord-Erkennung:  Strg+b  „armiert" das Prefix,  die nächste Taste löst aus.
//  onArm()  – Prefix wurde gedrückt
//  onChord(key, ctrlKey)  – Zweittaste nach dem Prefix
//  onStray(key)  – Taste OHNE vorheriges Prefix (zum sanften Erinnern)
// ---------------------------------------------------------------------------
function makeChordReader({ onArm, onChord, onStray }) {
  let armed = false;
  function handle(e) {
    if (e.key === 'Escape') return;            // Menü-Rückkehr macht app.js
    if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') return;

    // Prefix:  Strg + b
    if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      armed = true;
      onArm && onArm();
      return;
    }
    if (armed) {
      e.preventDefault();
      armed = false;
      onChord && onChord(e);
      return;
    }
    // Taste ohne Prefix
    if (e.key.length === 1 || e.key.startsWith('Arrow')) {
      onStray && onStray(e);
    }
  }
  return {
    handle,
    get armed() { return armed; },
    disarm() { armed = false; },
  };
}

// Vergleicht ein Tastatur-Event mit der erwarteten Zweittaste eines Schritts.
function keyMatches(e, step) {
  let k = e.key;
  if (k.length === 1) k = k.toLowerCase();
  let want = step.key;
  if (want.length === 1) want = want.toLowerCase();
  return k === want;
}

// ===========================================================================
//  LEKTION  –  interaktiver, geführter Shortcut-Trainer
// ===========================================================================
export function mountTmuxLesson(root, { onExit, confetti }) {
  let idx = 0;
  const total = TMUX.steps.length;
  let done = false;

  function render() {
    const step = TMUX.steps[idx];
    const pct = (idx / total) * 100;
    root.innerHTML = `
      <div class="tmux-lesson">
        <div class="tl-top">
          <span class="tl-sect">${step.sect}</span>
          <span class="tl-count">${idx + 1} / ${total}</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>

        <div class="tl-card" id="tl-card">
          <div class="tl-name">${step.name}</div>
          <div class="tl-desc">${step.desc}</div>
          <div class="tl-keys">${keycapsHTML(step)}</div>
          <div class="tl-prefix" id="tl-prefix">
            <span class="lamp"></span> Prefix bereit – jetzt <b>${step.shift ? '⇧ ' : ''}${step.glyph}</b> drücken
          </div>
          <div class="tl-hint" id="tl-hint">Drücke <kbd>Strg</kbd>+<kbd>b</kbd>, lass los, dann die Taste.</div>
        </div>

        <div class="tl-actions">
          <button class="btn-ghost" id="tl-skip">Überspringen →</button>
        </div>
        <div class="hint">💡 Du drückst die echten Tasten – wie später im Terminal. <kbd>Esc</kbd> = Menü</div>
      </div>`;

    document.getElementById('tl-skip').addEventListener('click', () => next(false));
  }

  function success() {
    const card = document.getElementById('tl-card');
    if (card) card.classList.add('ok');
    Sound.word();
    Store.markTmuxMastered(TMUX.steps[idx].key + (TMUX.steps[idx].shift ? 'S' : ''));
    setTimeout(() => next(true), 420);
  }

  function fail() {
    const card = document.getElementById('tl-card');
    if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
    Sound.error();
  }

  function next(wasCorrect) {
    if (done) return;
    if (idx + 1 >= total) { finish(); return; }
    idx++;
    render();
  }

  function finish() {
    done = true;
    Store.finishTmuxLesson();
    confetti && confetti();
    Sound.finish();
    root.innerHTML = `
      <div class="tl-finish">
        <div class="tl-finish-icon">🏆</div>
        <h2>Geschafft!</h2>
        <p>Du kennst jetzt alle wichtigen tmux-Shortcuts.<br>
        Zeit, sie im Spiel <b>tmux Command Arena</b> anzuwenden!</p>
        <div class="result-actions">
          <button class="btn-primary big" id="tl-again">↻ Nochmal üben</button>
          <button class="btn-ghost" id="tl-back">Zurück zum Menü</button>
        </div>
      </div>`;
    document.getElementById('tl-again').addEventListener('click', () => { idx = 0; done = false; render(); });
    document.getElementById('tl-back').addEventListener('click', () => onExit && onExit());
  }

  const reader = makeChordReader({
    onArm: () => {
      const p = document.getElementById('tl-prefix');
      if (p) p.classList.add('armed');
      Sound.key();
    },
    onChord: (e) => {
      const p = document.getElementById('tl-prefix');
      if (p) p.classList.remove('armed');
      if (keyMatches(e, TMUX.steps[idx])) success(); else fail();
    },
    onStray: () => {
      const h = document.getElementById('tl-hint');
      if (h) { h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); }
    },
  });

  window.addEventListener('keydown', reader.handle);
  render();
  return () => window.removeEventListener('keydown', reader.handle);
}

// ===========================================================================
//  SPIEL  –  „tmux Command Arena":  Aufträge ausführen, Mock-Terminal reagiert
// ===========================================================================
export function mountTmuxArena(root, { onExit, confetti }) {
  // --- Mock-Terminal-Zustand ---
  const term = {
    windows: [{ name: rand(WIN_NAMES), panes: [{}], active: 0, dir: 'v', zoom: false }],
    active: 0,
    get cur() { return this.windows[this.active]; },
  };

  // --- Spielzustand ---
  let running = false, over = false;
  let score = 0, lives = 5, level = 1, combo = 0, maxCombo = 0;
  let solved = 0, mistakes = 0;
  let mission = null, missionDeadline = 0, missionTime = 6000;
  let rafId = 0;

  // ---------- Terminal-Aktionen ----------
  function applyAction(a) {
    const w = term.cur;
    switch (a) {
      case 'new-window':
        term.windows.push({ name: rand(WIN_NAMES), panes: [{}], active: 0, dir: 'v', zoom: false });
        term.active = term.windows.length - 1; break;
      case 'close-window':
        if (term.windows.length > 1) {
          term.windows.splice(term.active, 1);
          term.active = Math.min(term.active, term.windows.length - 1);
        } break;
      case 'next-window':
        term.active = (term.active + 1) % term.windows.length; break;
      case 'prev-window':
        term.active = (term.active - 1 + term.windows.length) % term.windows.length; break;
      case 'rename-window':
        w.name = rand(WIN_NAMES); flashTerm('umbenannt'); break;
      case 'split-v':
        w.panes.push({}); w.dir = 'v'; w.active = w.panes.length - 1; w.zoom = false; break;
      case 'split-h':
        w.panes.push({}); w.dir = 'h'; w.active = w.panes.length - 1; w.zoom = false; break;
      case 'pane-next':
        w.active = (w.active + 1) % w.panes.length; break;
      case 'close-pane':
        if (w.panes.length > 1) { w.panes.splice(w.active, 1); w.active = Math.min(w.active, w.panes.length - 1); }
        break;
      case 'zoom':
        w.zoom = !w.zoom; break;
      case 'copy-mode':
        w.copy = true; renderTerm(); setTimeout(() => { w.copy = false; if (running) renderTerm(); }, 1100); return;
      case 'clock':
        showClock(); break;
      case 'detach':
        showDetach(); break;
    }
    renderTerm();
  }

  // ---------- Mock-Terminal rendern ----------
  function renderTerm() {
    const tabs = term.windows.map((w, i) =>
      `<span class="mt-tab ${i === term.active ? 'on' : ''}">${i}:${w.name}${w.zoom ? '✛' : ''}</span>`).join('');

    const w = term.cur;
    const shown = w.zoom ? [w.panes[w.active]] : w.panes;
    const panes = shown.map((p, i) => {
      const realIdx = w.zoom ? w.active : i;
      const on = realIdx === w.active;
      return `<div class="mt-pane ${on ? 'on' : ''} ${w.copy && on ? 'copy' : ''}">
        <div class="mt-line"><span class="mt-prompt">${w.name} ❯</span> ${rand(FAKE_CMDS)}</div>
        <div class="mt-line dim">${rand(FAKE_OUT)}</div>
        ${w.copy && on ? '<div class="mt-badge">-- COPY --</div>' : ''}
        ${on ? '<span class="mt-caret"></span>' : ''}
      </div>`;
    }).join('');

    const layout = `mt-body dir-${w.dir} ${w.zoom ? 'zoom' : ''}`;
    const term$ = document.getElementById('mt');
    if (term$) term$.innerHTML = `
      <div class="mt-tabs">${tabs}</div>
      <div class="${layout}" style="--n:${shown.length}">${panes}</div>
      <div class="mt-status">[${term.active}] ${w.name} · ${w.panes.length} Pane${w.panes.length > 1 ? 's' : ''}${w.zoom ? ' · ZOOM' : ''}</div>`;
  }
  const FAKE_CMDS = ['ls -la', 'git status', 'npm run dev', 'vim app.js', 'htop', 'cd ~/projekt', 'make build', './deploy.sh'];
  const FAKE_OUT = ['done in 1.2s', 'On branch master', '✓ 14 passed', 'Listening on :3000', 'up to date', 'compiled ✔'];

  function flashTerm() {
    const t = document.getElementById('mt');
    if (t) { t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); }
  }
  function showClock() {
    const o = document.getElementById('mt-fx');
    if (!o) return;
    const t = new Date().toTimeString().slice(0, 5);
    o.innerHTML = `<div class="mt-clock">${t}</div>`;
    o.classList.add('show');
    setTimeout(() => o.classList.remove('show'), 1100);
  }
  function showDetach() {
    const o = document.getElementById('mt-fx');
    if (!o) return;
    o.innerHTML = `<div class="mt-detach">[detached]<br><small>…reattach…</small></div>`;
    o.classList.add('show');
    setTimeout(() => o.classList.remove('show'), 1100);
  }

  // ---------- Mission-Steuerung ----------
  function newMission() {
    // bevorzugt Aufträge, die im aktuellen Zustand sichtbar etwas bewirken
    let pool = ARENA_MISSIONS.filter(m => {
      if (m.action === 'close-window') return term.windows.length > 1;
      if (m.action === 'close-pane' || m.action === 'pane-next' || m.action === 'zoom') return true;
      return true;
    });
    if (mission) pool = pool.filter(m => m.action !== mission.action) || pool;
    mission = rand(pool.length ? pool : ARENA_MISSIONS);
    missionTime = Math.max(2600, 6200 - level * 350);
    missionDeadline = performance.now() + missionTime;
    renderMission();
  }

  function renderMission() {
    const el = document.getElementById('mt-mission');
    if (!el || !mission) return;
    el.innerHTML = `
      <div class="mm-label">Auftrag</div>
      <div class="mm-instr">${mission.instr}</div>
      <div class="mm-hint">${keycapsHTML(mission)}</div>`;
  }

  function tick(now) {
    if (!running) return;
    const left = missionDeadline - now;
    const bar = document.getElementById('mt-timebar');
    if (bar) {
      const pct = Math.max(0, left / missionTime) * 100;
      bar.style.width = pct + '%';
      bar.style.background = pct < 30 ? 'var(--bad)' : 'linear-gradient(90deg,var(--accent),var(--accent2))';
    }
    if (left <= 0) { loseLife('⏱ Zeit abgelaufen'); }
    rafId = requestAnimationFrame(tick);
  }

  // ---------- Treffer / Fehler ----------
  function hit() {
    solved++;
    combo++; maxCombo = Math.max(maxCombo, combo);
    const timeBonus = Math.round(Math.max(0, (missionDeadline - performance.now()) / missionTime) * 30);
    const pts = 40 + combo * 5 + timeBonus;
    score += pts;
    const newLevel = 1 + Math.floor(score / 250);
    if (newLevel > level) { level = newLevel; Sound.levelup(); pulse('level'); }
    Sound.shoot();
    floatPoints('+' + pts);
    applyAction(mission.action);
    emit();
    if (lives > 0) newMission();
  }

  function wrong() {
    mistakes++;
    combo = 0;
    Sound.error();
    shakeArena();
    emit();
  }

  function loseLife(reason) {
    lives--;
    combo = 0;
    Sound.explode();
    shakeArena();
    emit();
    if (lives <= 0) { endGame(); return; }
    newMission();
  }

  // ---------- HUD ----------
  function emit() {
    set('a-score', score);
    set('a-level', level);
    set('a-combo', combo);
    set('a-lives', '❤️'.repeat(Math.max(0, lives)) || '💀');
  }
  function set(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
  function floatPoints(txt) {
    const host = document.getElementById('mt-float'); if (!host) return;
    const s = document.createElement('span'); s.className = 'float-pt'; s.textContent = txt;
    host.appendChild(s); setTimeout(() => s.remove(), 900);
  }
  function pulse(cls) {
    const e = document.getElementById('a-level'); if (e) { e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); }
  }
  function shakeArena() {
    const a = document.getElementById('arena'); if (a) { a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
  }

  // ---------- Chord-Eingabe ----------
  const reader = makeChordReader({
    onArm: () => { setPrefix(true); Sound.key(); },
    onChord: (e) => {
      setPrefix(false);
      if (!running) return;
      if (keyMatches(e, mission)) hit(); else wrong();
    },
    onStray: () => { if (running) hintPrefix(); },
  });
  function setPrefix(on) {
    const p = document.getElementById('mt-prefix');
    if (p) p.classList.toggle('armed', on);
  }
  function hintPrefix() {
    const p = document.getElementById('mt-prefix');
    if (p) { p.classList.remove('blink'); void p.offsetWidth; p.classList.add('blink'); }
  }

  // ---------- Views: Start / Spiel / Ende ----------
  function viewStart() {
    root.innerHTML = `
      <div class="arena-wrap">
        <div class="arena-overlay">
          <h2>🖥️ tmux Command Arena</h2>
          <p>Aufträge ploppen oben auf – führe sie mit dem <b>echten Shortcut</b> aus:<br>
          <kbd>Strg</kbd>+<kbd>b</kbd> &nbsp;loslassen&nbsp; dann die Taste.<br>
          Das Terminal reagiert live. Schnell sein gibt Bonus, die Combo bringt Punkte!</p>
          <button class="btn-primary big" id="a-start">▶ Los geht's</button>
          <p class="muted small">Rekord: ${Store.tmux.bestScore} Punkte · ${Store.tmux.lessonDone ? '✅ Lektion gemeistert' : '📚 Tipp: erst die Lektion machen'}</p>
        </div>
      </div>`;
    document.getElementById('a-start').addEventListener('click', start);
  }

  function viewGame() {
    root.innerHTML = `
      <div class="arena-wrap" id="arena">
        <div class="arena-hud">
          <div class="ghud"><b id="a-score">0</b><span>Punkte</span></div>
          <div class="ghud"><b id="a-level">1</b><span>Level</span></div>
          <div class="ghud"><b id="a-combo">0</b><span>Combo</span></div>
          <div class="ghud lives"><b id="a-lives">❤️❤️❤️❤️❤️</b><span>Leben</span></div>
        </div>

        <div class="arena-mission">
          <div class="mt-prefix" id="mt-prefix"><span class="lamp"></span>PREFIX</div>
          <div class="mm-card" id="mt-mission"></div>
          <div class="mt-float" id="mt-float"></div>
        </div>
        <div class="mt-timebar-wrap"><div class="mt-timebar" id="mt-timebar"></div></div>

        <div class="mock-term-shell">
          <div class="mock-term" id="mt"></div>
          <div class="mt-fx" id="mt-fx"></div>
        </div>
        <div class="hint">Tipp die Tasten wirklich – wie im echten Terminal. <kbd>Esc</kbd> beendet.</div>
      </div>`;
    renderTerm();
    renderMission();
    emit();
  }

  function start() {
    running = true; over = false;
    score = 0; lives = 5; level = 1; combo = 0; maxCombo = 0; solved = 0; mistakes = 0;
    term.windows = [{ name: rand(WIN_NAMES), panes: [{}], active: 0, dir: 'v', zoom: false }];
    term.active = 0;
    viewGame();
    newMission();
    rafId = requestAnimationFrame(tick);
  }

  function endGame() {
    running = false; over = true;
    cancelAnimationFrame(rafId);
    Sound.finish();
    Store.recordTmuxScore(score);
    const acc = solved + mistakes > 0 ? Math.round(solved / (solved + mistakes) * 100) : 100;
    const rec = score >= Store.tmux.bestScore;
    if (score >= 300) confetti && confetti();
    root.innerHTML = `
      <div class="arena-wrap">
        <div class="arena-overlay">
          <h2>🏁 Runde vorbei</h2>
          <div class="result-grid">
            <div class="rcard big"><b>${score}</b><span>Punkte</span></div>
            <div class="rcard"><b>${level}</b><span>Level</span></div>
            <div class="rcard"><b>${maxCombo}</b><span>Top-Combo</span></div>
            <div class="rcard"><b>${solved}</b><span>Aufträge</span></div>
            <div class="rcard"><b>${acc}%</b><span>Treffer</span></div>
          </div>
          ${rec ? '<p class="newrec">🎉 Neuer Rekord!</p>' : ''}
          <div class="result-actions">
            <button class="btn-primary big" id="a-restart">↻ Nochmal</button>
            <button class="btn-ghost" id="a-menu">Menü</button>
          </div>
        </div>
      </div>`;
    document.getElementById('a-restart').addEventListener('click', start);
    document.getElementById('a-menu').addEventListener('click', () => onExit && onExit());
  }

  window.addEventListener('keydown', reader.handle);
  viewStart();

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener('keydown', reader.handle);
  };
}
