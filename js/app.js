// ============================================================================
//  app.js  –  Hauptsteuerung: Views, Routing, Verknüpfung aller Module
// ============================================================================
import { LESSONS, ACHIEVEMENTS, FINGERS, CHAR_TO_FINGER, WORDS_DE, WORDS_EN, SENTENCES_DE, SENTENCES_EN, shuffle } from './data.js';
import { Sound } from './audio.js';
import { Store } from './storage.js';
import { TypingEngine } from './engine.js';
import { WordRain } from './game.js';
import { VirtualKeyboard, buildFingerLegend, buildHands, highlightFinger } from './keyboard.js';
import { mountTmuxLesson, mountTmuxArena, mountTmuxArchitect, TMUX } from './tmux.js';
const TMUX_COUNT = TMUX.steps.length;

const app = document.getElementById('view');
const $ = (sel, el = document) => el.querySelector(sel);

let current = { cleanup: null };
function go(renderFn) {
  if (current.cleanup) current.cleanup();
  current = { cleanup: null };
  app.classList.remove('fade-in'); void app.offsetWidth; app.classList.add('fade-in');
  renderFn();
}

// ---------------------------------------------------------------------------
//  Theme & Sound aus den Einstellungen anwenden
// ---------------------------------------------------------------------------
function applySettings() {
  const s = Store.settings;
  document.documentElement.dataset.theme = s.theme;
  Sound.enabled = s.sound;
  Sound.setVolume(s.volume);
}

// ---------------------------------------------------------------------------
//  Erfolge prüfen & Toast anzeigen
// ---------------------------------------------------------------------------
function checkAchievements(ctx = {}) {
  const s = Store.stats;
  const tests = [
    ['first_run', s.runs >= 1],
    ['wpm_20', s.bestWpm >= 20], ['wpm_40', s.bestWpm >= 40],
    ['wpm_60', s.bestWpm >= 60], ['wpm_80', s.bestWpm >= 80],
    ['acc_100', ctx.accuracy >= 100],
    ['combo_50', s.bestCombo >= 50],
    ['lessons_5', Store.lessonsDone() >= 5],
    ['lessons_all', Store.lessonsDone() >= LESSONS.length],
    ['game_500', s.bestGameScore >= 500],
    ['streak_3', s.daysActive.length >= 3],
    ['keys_5000', s.totalChars >= 5000],
  ];
  for (const [id, cond] of tests) {
    if (cond && Store.unlock(id)) {
      const a = ACHIEVEMENTS.find(x => x.id === id);
      showToast(`${a.icon} Erfolg: ${a.title}`, a.desc);
      Sound.achievement();
    }
  }
}

function showToast(title, desc) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-title">${title}</div><div class="toast-desc">${desc || ''}</div>`;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('show'), 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4200);
}

function confetti() {
  const c = document.createElement('div');
  c.className = 'confetti';
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = `hsl(${Math.random() * 360},80%,60%)`;
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.animationDuration = 1.5 + Math.random() * 1.5 + 's';
    c.appendChild(p);
  }
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 3500);
}

// ===========================================================================
//  VIEW: Hauptmenü
// ===========================================================================
function viewHome() {
  const s = Store.stats;
  app.innerHTML = `
    <div class="home">
      <header class="hero">
        <h1 class="logo">⌨️ <span>10-Finger</span> Schreiben</h1>
        <p class="tagline">Lerne Tippen wie ein Profi – mit Lektionen, Tests & Arcade-Spiel.</p>
        <div class="hero-stats">
          <div class="hstat"><b>${Math.round(s.bestWpm)}</b><span>Beste WPM</span></div>
          <div class="hstat"><b>${Math.round(s.bestAccuracy)}%</b><span>Beste Genauigkeit</span></div>
          <div class="hstat"><b>${Store.lessonsDone()}/${LESSONS.length}</b><span>Lektionen</span></div>
          <div class="hstat"><b>${s.bestGameScore}</b><span>Wortregen-Rekord</span></div>
        </div>
      </header>
      <div class="menu-grid">
        ${tile('lessons','📚','Lektionen','Schritt für Schritt vom Anfänger zum Profi')}
        ${tile('test','⏱️','Schreibtest','Wie schnell & genau bist du wirklich?')}
        ${tile('game','👾','Wortregen','Arcade-Spiel: tippe Wörter weg, bevor sie fallen')}
        ${tile('stats','📊','Statistiken','Verlauf, Bestwerte & Fehler-Heatmap')}
        ${tile('achievements','🏆','Erfolge','Sammle alle Auszeichnungen')}
        ${tile('settings','⚙️','Einstellungen','Design, Sound & Sprache')}
      </div>

      <div class="special-zone">
        <div class="special-head">
          <span class="special-tag">⚡ NEU</span>
          <h2>tmux-Shortcuts meistern</h2>
          <p>Lerne die wichtigsten Terminal-Kürzel – und wende sie im Spiel an.</p>
        </div>
        <div class="special-grid">
          <button class="special-btn learn" data-go="tmuxLesson">
            <div class="sb-glow"></div>
            <div class="sb-icon">📖</div>
            <div class="sb-text">
              <div class="sb-title">Lektion</div>
              <div class="sb-desc">Alle ${TMUX_COUNT} Shortcuts Schritt für Schritt – mit echten Tasten</div>
            </div>
            <div class="sb-badge">${Store.tmux.lessonDone ? '✅ gemeistert' : 'starten →'}</div>
          </button>
          <button class="special-btn play" data-go="tmuxArena">
            <div class="sb-glow"></div>
            <div class="sb-icon">🖥️</div>
            <div class="sb-text">
              <div class="sb-title">tmux Command Arena</div>
              <div class="sb-desc">Führ Aufträge live aus – das Terminal reagiert in Echtzeit</div>
            </div>
            <div class="sb-badge">🏆 ${Store.tmux.bestScore}</div>
          </button>
          <button class="special-btn build" data-go="tmuxArchitect">
            <div class="sb-glow"></div>
            <div class="sb-icon">🏗️</div>
            <div class="sb-text">
              <div class="sb-title">tmux Architect</div>
              <div class="sb-desc">Puzzle: bau vorgegebene Split-Layouts mit echten Shortcuts nach</div>
            </div>
            <div class="sb-badge">🏆 ${Store.tmux.bestArchitect}</div>
          </button>
        </div>
      </div>

      <footer class="foot">Mit ❤️ gebaut · Drücke <kbd>Esc</kbd> jederzeit fürs Menü</footer>
    </div>`;
  app.querySelectorAll('[data-go]').forEach(el =>
    el.addEventListener('click', () => routes[el.dataset.go]()));
}
function tile(go, icon, title, desc) {
  return `<button class="tile" data-go="${go}">
    <div class="tile-icon">${icon}</div>
    <div class="tile-title">${title}</div>
    <div class="tile-desc">${desc}</div>
  </button>`;
}

// ===========================================================================
//  VIEW: Lektions-Auswahl
// ===========================================================================
function viewLessons() {
  const cards = LESSONS.map((l, i) => {
    const prog = Store.data.lessons[l.id];
    const locked = false; // alle frei – Anfängerfreundlich
    const stars = prog ? '★'.repeat(prog.stars) + '☆'.repeat(3 - prog.stars) : '☆☆☆';
    return `<button class="lesson-card ${prog?.done ? 'done' : ''}" data-id="${l.id}">
      <div class="lc-num">${i + 1}</div>
      <div class="lc-body">
        <div class="lc-title">${l.icon} ${l.title}</div>
        <div class="lc-desc">${l.desc}</div>
        <div class="lc-stars">${stars}${prog?.done ? ` · ${prog.bestWpm} WPM` : ''}</div>
      </div>
    </button>`;
  }).join('');
  app.innerHTML = `
    ${topbar('📚 Lektionen')}
    <div class="lesson-list">${cards}</div>`;
  bindBack();
  app.querySelectorAll('.lesson-card').forEach(el =>
    el.addEventListener('click', () => startTyping({ lessonId: el.dataset.id })));
}

// ===========================================================================
//  VIEW: Test-Auswahl
// ===========================================================================
function viewTest() {
  app.innerHTML = `
    ${topbar('⏱️ Schreibtest')}
    <div class="picker">
      <h2>Wähle deinen Test</h2>
      <div class="opt-row"><span>Inhalt</span>
        <div class="seg" id="test-content">
          <button data-v="words" class="active">Wörter</button>
          <button data-v="sentences">Sätze</button>
        </div>
      </div>
      <div class="opt-row"><span>Dauer</span>
        <div class="seg" id="test-time">
          <button data-v="15">15 s</button>
          <button data-v="30" class="active">30 s</button>
          <button data-v="60">60 s</button>
          <button data-v="0">Bis Ende</button>
        </div>
      </div>
      <button class="btn-primary big" id="start-test">Test starten →</button>
    </div>`;
  bindBack();
  let content = 'words', time = 30;
  segHandler('#test-content', v => content = v);
  segHandler('#test-time', v => time = +v);
  $('#start-test').addEventListener('click', () =>
    startTyping({ test: { content, time } }));
}

function segHandler(sel, cb) {
  const seg = $(sel);
  seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    seg.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    cb(b.dataset.v);
    Sound.key();
  }));
}

// ===========================================================================
//  Tipp-Bildschirm (Lektion ODER Test)
// ===========================================================================
function buildText({ lessonId, test }) {
  if (lessonId) {
    const lesson = LESSONS.find(l => l.id === lessonId);
    return { text: lesson.gen().join(' '), title: lesson.title, lesson };
  }
  // Test
  const lang = Store.settings.lang;
  if (test.content === 'sentences') {
    const src = lang === 'en' ? SENTENCES_EN : SENTENCES_DE;
    let out = [], i = 0;
    while (out.join(' ').length < 600) out.push(src[i++ % src.length]);
    return { text: out.join(' '), title: 'Satz-Test' };
  }
  const pool = lang === 'en' ? WORDS_EN : WORDS_DE;
  const words = [];
  for (let i = 0; i < 220; i++) words.push(pool[Math.floor(Math.random() * pool.length)]);
  return { text: words.join(' '), title: 'Wort-Test' };
}

function startTyping(opts) {
  go(() => renderTyping(opts));
}

function renderTyping(opts) {
  const { text, title, lesson } = buildText(opts);
  const timeLimit = opts.test ? opts.test.time : 0;
  const showKb = Store.settings.showKeyboard;
  const showFingers = Store.settings.showFingers;

  app.innerHTML = `
    ${topbar(lesson ? `${lesson.icon} ${lesson.title}` : `⏱️ ${title}`)}
    <div class="typing">
      <div class="hud">
        <div class="hud-item"><span id="hud-wpm">0</span><label>WPM</label></div>
        <div class="hud-item"><span id="hud-acc">100%</span><label>Genauigkeit</label></div>
        <div class="hud-item"><span id="hud-combo">0</span><label>Combo</label></div>
        <div class="hud-item"><span id="hud-time">${timeLimit ? timeLimit + 's' : '—'}</span><label>${timeLimit ? 'Zeit' : 'Verg.'}</label></div>
      </div>
      <div class="progress"><div class="progress-bar" id="prog"></div></div>
      <div class="text-box" id="text" tabindex="0"></div>
      ${showFingers ? '<div class="hands" id="hands"></div>' : ''}
      ${showKb ? '<div class="keyboard" id="kb"></div>' : ''}
      <div class="hint">Tippe den Text ab. <kbd>Esc</kbd> = Menü · Bei Fehlern: korrigieren um weiterzukommen.</div>
    </div>`;
  bindBack();

  const textEl = $('#text');
  let kb = null, handsEl = null;
  if (showKb) kb = new VirtualKeyboard($('#kb'));
  if (showFingers) { handsEl = $('#hands'); buildHands(handsEl); }

  const engine = new TypingEngine({
    textEl,
    mode: lesson ? 'lesson' : 'test',
    timeLimit,
    onUpdate: (st) => {
      $('#hud-wpm').textContent = Math.round(st.wpm);
      $('#hud-acc').textContent = Math.round(st.accuracy) + '%';
      $('#hud-combo').textContent = st.combo;
      $('#hud-time').textContent = timeLimit
        ? Math.ceil(st.remaining) + 's'
        : st.elapsed.toFixed(0) + 's';
      $('#prog').style.width = (st.progress * 100) + '%';
    },
    onChar: (ch, ok) => {
      if (kb) kb.flash(ch, ok);
    },
    onFinish: (res) => finishTyping(res, opts, lesson),
  });
  engine.setText(text);
  if (kb) kb.highlightNext(engine.nextChar);
  if (handsEl) highlightFinger(handsEl, fingerOf(engine.nextChar));

  // versteckte Texteingabe für saubere Tastenverarbeitung
  const onKey = (e) => {
    if (e.key === 'Escape') return; // von bindBack behandelt
    if (e.key === 'Backspace') { e.preventDefault(); engine.backspace(); refreshHints(); return; }
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (e.key.length === 1) {
      e.preventDefault();
      engine.input(e.key);
      refreshHints();
    }
  };
  function refreshHints() {
    if (kb) kb.highlightNext(engine.nextChar);
    if (handsEl) highlightFinger(handsEl, fingerOf(engine.nextChar));
  }
  window.addEventListener('keydown', onKey);
  textEl.focus();

  current.cleanup = () => { window.removeEventListener('keydown', onKey); engine.destroy(); };
}

function fingerOf(ch) {
  if (ch == null) return null;
  if (ch === ' ') return 8;
  return CHAR_TO_FINGER[ch.toLowerCase()] ?? null;
}

function finishTyping(res, opts, lesson) {
  Store.recordRun({
    chars: res.chars, errors: res.errors, timeMs: res.timeMs,
    wpm: res.wpm, accuracy: res.accuracy, combo: res.maxCombo,
    mode: res.mode, perKey: res.perKey,
  });
  let lessonResult = null;
  if (lesson) {
    lessonResult = Store.completeLesson(lesson.id, res.wpm, res.accuracy);
  }
  checkAchievements({ accuracy: res.accuracy });
  if (res.accuracy >= 98) confetti();

  go(() => {
    const stars = lessonResult ? '★'.repeat(lessonResult.stars) + '☆'.repeat(3 - lessonResult.stars) : '';
    app.innerHTML = `
      ${topbar('🎉 Ergebnis')}
      <div class="result">
        ${lessonResult ? `<div class="result-stars">${stars}</div>` : ''}
        <div class="result-grid">
          <div class="rcard big"><b>${Math.round(res.wpm)}</b><span>WPM</span></div>
          <div class="rcard"><b>${Math.round(res.accuracy)}%</b><span>Genauigkeit</span></div>
          <div class="rcard"><b>${res.maxCombo}</b><span>Top-Combo</span></div>
          <div class="rcard"><b>${res.errors}</b><span>Fehler</span></div>
          <div class="rcard"><b>${res.elapsed.toFixed(1)}s</b><span>Zeit</span></div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" id="again">↻ Nochmal</button>
          ${lesson ? '<button class="btn-ghost" id="next">Nächste Lektion →</button>' : ''}
          <button class="btn-ghost" id="tomenu">Menü</button>
        </div>
      </div>`;
    $('#again').addEventListener('click', () => startTyping(opts));
    $('#tomenu').addEventListener('click', routes.home);
    if (lesson) $('#next')?.addEventListener('click', () => {
      const idx = LESSONS.findIndex(l => l.id === lesson.id);
      const nxt = LESSONS[idx + 1];
      if (nxt) startTyping({ lessonId: nxt.id }); else routes.lessons();
    });
  });
}

// ===========================================================================
//  VIEW: Wortregen-Spiel
// ===========================================================================
function viewGame() {
  app.innerHTML = `
    ${topbar('👾 Wortregen')}
    <div class="game-wrap">
      <div class="game-hud">
        <div class="ghud"><b id="g-score">0</b><span>Punkte</span></div>
        <div class="ghud"><b id="g-level">1</b><span>Level</span></div>
        <div class="ghud"><b id="g-combo">0</b><span>Combo</span></div>
        <div class="ghud lives"><b id="g-lives">❤️❤️❤️❤️❤️</b><span>Leben</span></div>
      </div>
      <div class="canvas-box">
        <canvas id="game-canvas"></canvas>
        <div class="game-overlay" id="g-overlay">
          <h2>👾 Wortregen</h2>
          <p>Tippe die fallenden Wörter ab, bevor sie den Boden erreichen!<br>
          Je länger das Wort & je höher deine Combo, desto mehr Punkte.</p>
          <button class="btn-primary big" id="g-start">▶ Spiel starten</button>
        </div>
      </div>
      <div class="hint">5 Leben · jedes Wort, das durchkommt, kostet ein Leben · <kbd>Esc</kbd> beendet</div>
    </div>`;
  bindBack();
  const canvas = $('#game-canvas');
  const overlay = $('#g-overlay');
  let game = null;

  function startGame() {
    overlay.style.display = 'none';
    game = new WordRain(canvas, {
      lang: Store.settings.lang,
      onState: (st) => {
        $('#g-score').textContent = st.score;
        $('#g-level').textContent = st.level;
        $('#g-combo').textContent = st.combo;
        $('#g-lives').textContent = '❤️'.repeat(Math.max(0, st.lives)) || '💀';
      },
      onEnd: (res) => {
        Store.recordGameScore(res.score);
        Store.recordRun({
          chars: res.chars, errors: res.errors, timeMs: res.timeMs,
          wpm: (res.chars / 5) / (res.timeMs / 60000) || 0,
          accuracy: res.accuracy, combo: res.maxCombo, mode: 'game', perKey: {},
        });
        checkAchievements({ accuracy: res.accuracy });
        if (res.score >= 500) confetti();
        overlay.style.display = 'flex';
        overlay.innerHTML = `
          <h2>🏁 Game Over</h2>
          <div class="result-grid">
            <div class="rcard big"><b>${res.score}</b><span>Punkte</span></div>
            <div class="rcard"><b>${res.level}</b><span>Level</span></div>
            <div class="rcard"><b>${res.maxCombo}</b><span>Top-Combo</span></div>
            <div class="rcard"><b>${Math.round(res.accuracy)}%</b><span>Treffer</span></div>
          </div>
          ${res.score >= Store.stats.bestGameScore ? '<p class="newrec">🎉 Neuer Rekord!</p>' : ''}
          <button class="btn-primary big" id="g-restart">↻ Nochmal</button>`;
        $('#g-restart').addEventListener('click', startGame);
      },
    });
    game.start();
  }
  $('#g-start').addEventListener('click', startGame);
  window.addEventListener('resize', () => game && game.resize());
  current.cleanup = () => game && game.destroy();
}

// ===========================================================================
//  VIEW: tmux-Lektion  &  tmux Command Arena
// ===========================================================================
function viewTmuxLesson() {
  app.innerHTML = `${topbar('📖 tmux-Lektion')}<div id="tmux-root"></div>`;
  bindBack();
  const cleanup = mountTmuxLesson($('#tmux-root'), { onExit: routes.home, confetti });
  current.cleanup = cleanup;
}
function viewTmuxArena() {
  app.innerHTML = `${topbar('🖥️ tmux Command Arena')}<div id="tmux-root"></div>`;
  bindBack();
  const cleanup = mountTmuxArena($('#tmux-root'), { onExit: routes.home, confetti });
  current.cleanup = cleanup;
}
function viewTmuxArchitect() {
  app.innerHTML = `${topbar('🏗️ tmux Architect')}<div id="tmux-root"></div>`;
  bindBack();
  const cleanup = mountTmuxArchitect($('#tmux-root'), { onExit: routes.home, confetti });
  current.cleanup = cleanup;
}

// ===========================================================================
//  VIEW: Statistiken
// ===========================================================================
function viewStats() {
  const s = Store.stats;
  const recent = s.history.slice(-30);
  const maxWpm = Math.max(20, ...recent.map(h => h.wpm));
  const bars = recent.map(h =>
    `<div class="bar" style="height:${(h.wpm / maxWpm) * 100}%" title="${h.wpm} WPM · ${h.acc}%"></div>`
  ).join('') || '<p class="muted">Noch keine Daten – leg los! 🚀</p>';

  // Heatmap der häufigsten Fehler-Tasten
  const keyErr = Object.entries(s.perKeyErrors).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const maxErr = Math.max(1, ...keyErr.map(k => k[1]));
  const heat = keyErr.map(([k, n]) =>
    `<div class="heat-key" style="--h:${n / maxErr}">${k === 'space' ? '␣' : k}<small>${n}</small></div>`
  ).join('') || '<p class="muted">Keine Fehler erfasst – stark! 🎯</p>';

  const avgWpm = recent.length ? Math.round(recent.reduce((a, b) => a + b.wpm, 0) / recent.length) : 0;

  app.innerHTML = `
    ${topbar('📊 Statistiken')}
    <div class="stats-page">
      <div class="stat-cards">
        <div class="scard"><b>${Math.round(s.bestWpm)}</b><span>Beste WPM</span></div>
        <div class="scard"><b>${avgWpm}</b><span>Ø WPM (letzte)</span></div>
        <div class="scard"><b>${Math.round(s.bestAccuracy)}%</b><span>Beste Genauigkeit</span></div>
        <div class="scard"><b>${s.bestCombo}</b><span>Top-Combo</span></div>
        <div class="scard"><b>${s.runs}</b><span>Runden</span></div>
        <div class="scard"><b>${s.totalChars.toLocaleString('de')}</b><span>Zeichen total</span></div>
        <div class="scard"><b>${(s.totalTimeMs / 60000).toFixed(0)} min</b><span>Übungszeit</span></div>
        <div class="scard"><b>${s.daysActive.length}</b><span>Aktive Tage</span></div>
      </div>
      <h3>WPM-Verlauf (letzte 30 Runden)</h3>
      <div class="chart">${bars}</div>
      <h3>Fehler-Heatmap (häufigste Tippfehler)</h3>
      <div class="heatmap">${heat}</div>
      <button class="btn-danger" id="reset-stats">⟲ Alle Daten zurücksetzen</button>
    </div>`;
  bindBack();
  $('#reset-stats').addEventListener('click', () => {
    if (confirm('Wirklich ALLE Fortschritte, Statistiken und Erfolge löschen?')) {
      Store.reset(); applySettings(); routes.stats();
    }
  });
}

// ===========================================================================
//  VIEW: Erfolge
// ===========================================================================
function viewAchievements() {
  const items = ACHIEVEMENTS.map(a => {
    const got = Store.hasAchievement(a.id);
    return `<div class="ach ${got ? 'got' : 'locked'}">
      <div class="ach-icon">${got ? a.icon : '🔒'}</div>
      <div class="ach-body"><b>${a.title}</b><span>${a.desc}</span></div>
    </div>`;
  }).join('');
  const got = ACHIEVEMENTS.filter(a => Store.hasAchievement(a.id)).length;
  app.innerHTML = `
    ${topbar('🏆 Erfolge')}
    <div class="ach-page">
      <div class="ach-progress">${got} / ${ACHIEVEMENTS.length} freigeschaltet</div>
      <div class="ach-grid">${items}</div>
    </div>`;
  bindBack();
}

// ===========================================================================
//  VIEW: Einstellungen
// ===========================================================================
function viewSettings() {
  const s = Store.settings;
  const themes = [
    ['neon', 'Neon Nacht'], ['ocean', 'Ozean'], ['sunset', 'Sonnenuntergang'],
    ['forest', 'Wald'], ['mono', 'Mono Hell'],
  ];
  app.innerHTML = `
    ${topbar('⚙️ Einstellungen')}
    <div class="settings">
      <div class="set-row">
        <label>🎨 Design</label>
        <div class="theme-row">
          ${themes.map(([v, n]) => `<button class="theme-chip ${s.theme === v ? 'active' : ''}" data-theme="${v}"><span class="tc-prev tc-${v}"></span>${n}</button>`).join('')}
        </div>
      </div>
      <div class="set-row">
        <label>🌍 Sprache der Texte</label>
        <div class="seg" id="set-lang">
          <button data-v="de" class="${s.lang === 'de' ? 'active' : ''}">Deutsch</button>
          <button data-v="en" class="${s.lang === 'en' ? 'active' : ''}">English</button>
        </div>
      </div>
      <div class="set-row toggle-row">
        <label>🔊 Soundeffekte</label>
        <input type="checkbox" id="set-sound" ${s.sound ? 'checked' : ''} class="switch">
      </div>
      <div class="set-row">
        <label>🔉 Lautstärke</label>
        <input type="range" id="set-vol" min="0" max="1" step="0.05" value="${s.volume}">
      </div>
      <div class="set-row toggle-row">
        <label>⌨️ Bildschirm-Tastatur anzeigen</label>
        <input type="checkbox" id="set-kb" ${s.showKeyboard ? 'checked' : ''} class="switch">
      </div>
      <div class="set-row toggle-row">
        <label>✋ Hand-/Finger-Hinweise anzeigen</label>
        <input type="checkbox" id="set-fingers" ${s.showFingers ? 'checked' : ''} class="switch">
      </div>
      <div class="set-row">
        <label>🌈 Finger-Legende</label>
        <div class="legend" id="legend"></div>
      </div>
    </div>`;
  bindBack();
  buildFingerLegend($('#legend'));
  app.querySelectorAll('.theme-chip').forEach(b => b.addEventListener('click', () => {
    Store.setSetting('theme', b.dataset.theme); applySettings(); Sound.key(); viewSettings();
  }));
  segHandler('#set-lang', v => Store.setSetting('lang', v));
  $('#set-sound').addEventListener('change', e => { Store.setSetting('sound', e.target.checked); applySettings(); });
  $('#set-vol').addEventListener('input', e => { Store.setSetting('volume', +e.target.value); applySettings(); Sound.key(); });
  $('#set-kb').addEventListener('change', e => Store.setSetting('showKeyboard', e.target.checked));
  $('#set-fingers').addEventListener('change', e => Store.setSetting('showFingers', e.target.checked));
}

// ---------------------------------------------------------------------------
//  Gemeinsame UI-Helfer
// ---------------------------------------------------------------------------
function topbar(title) {
  return `<div class="topbar">
    <button class="back-btn" id="back">← Menü</button>
    <h2 class="topbar-title">${title}</h2>
    <div class="topbar-spacer"></div>
  </div>`;
}
function bindBack() {
  const b = $('#back');
  if (b) b.addEventListener('click', routes.home);
}

// ---------------------------------------------------------------------------
//  Routing
// ---------------------------------------------------------------------------
const routes = {
  home: () => go(viewHome),
  lessons: () => go(viewLessons),
  test: () => go(viewTest),
  game: () => go(viewGame),
  tmuxLesson: () => go(viewTmuxLesson),
  tmuxArena: () => go(viewTmuxArena),
  tmuxArchitect: () => go(viewTmuxArchitect),
  stats: () => go(viewStats),
  achievements: () => go(viewAchievements),
  settings: () => go(viewSettings),
};

// Globales Esc -> zurück ins Menü
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') routes.home();
});

// Start
applySettings();
routes.home();
