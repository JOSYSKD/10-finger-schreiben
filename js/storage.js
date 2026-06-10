// ============================================================================
//  storage.js  –  Fortschritt, Statistiken & Erfolge in localStorage
// ============================================================================
const KEY = 'tt10_save_v1';

const DEFAULT = {
  settings: { sound: true, volume: 0.5, theme: 'neon', lang: 'de', showKeyboard: true, showFingers: true },
  stats: {
    totalChars: 0, totalErrors: 0, totalTimeMs: 0, runs: 0,
    bestWpm: 0, bestAccuracy: 0, bestCombo: 0, bestGameScore: 0,
    history: [],          // [{date, wpm, acc, mode}]
    perKeyErrors: {},     // { 'a': 3, 'b': 1 ... }  für die Heatmap
    daysActive: [],       // ['2026-06-09', ...]
  },
  lessons: {},            // { l1: {done:true, bestWpm, bestAcc, stars} }
  achievements: {},       // { first_run: true }
  tmux: { bestScore: 0, lessonDone: false, mastered: {}, bestArchitect: 0, bestArchitectLevel: 0 }, // tmux-Shortcut-Modul
};

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw);
    return deepMerge(structuredClone(DEFAULT), parsed);
  } catch {
    return structuredClone(DEFAULT);
  }
}

function deepMerge(base, extra) {
  for (const k in extra) {
    if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k])) {
      base[k] = deepMerge(base[k] || {}, extra[k]);
    } else {
      base[k] = extra[k];
    }
  }
  return base;
}

export const Store = {
  get data() { return data; },
  get settings() { return data.settings; },
  get stats() { return data.stats; },
  get tmux() { return data.tmux; },

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  },

  setSetting(k, v) { data.settings[k] = v; this.save(); },

  markActiveToday() {
    const today = new Date().toISOString().slice(0, 10);
    if (!data.stats.daysActive.includes(today)) {
      data.stats.daysActive.push(today);
      this.save();
    }
  },

  // Ergebnis einer Tipp-Runde verbuchen
  recordRun({ chars, errors, timeMs, wpm, accuracy, combo, mode, perKey }) {
    const s = data.stats;
    s.totalChars += chars;
    s.totalErrors += errors;
    s.totalTimeMs += timeMs;
    s.runs += 1;
    s.bestWpm = Math.max(s.bestWpm, wpm);
    s.bestAccuracy = Math.max(s.bestAccuracy, accuracy);
    s.bestCombo = Math.max(s.bestCombo, combo || 0);
    s.history.push({ date: Date.now(), wpm: Math.round(wpm), acc: Math.round(accuracy), mode });
    if (s.history.length > 200) s.history = s.history.slice(-200);
    if (perKey) for (const k in perKey) s.perKeyErrors[k] = (s.perKeyErrors[k] || 0) + perKey[k];
    this.markActiveToday();
    this.save();
  },

  recordGameScore(score) {
    if (score > data.stats.bestGameScore) data.stats.bestGameScore = score;
    this.markActiveToday();
    this.save();
  },

  // ---- tmux-Shortcut-Modul ----
  recordTmuxScore(score) {
    if (score > data.tmux.bestScore) data.tmux.bestScore = score;
    this.markActiveToday();
    this.save();
  },
  finishTmuxLesson() {
    data.tmux.lessonDone = true;
    this.markActiveToday();
    this.save();
  },
  markTmuxMastered(id) {
    data.tmux.mastered[id] = true;
    this.save();
  },
  recordArchitect(score, level) {
    if (score > data.tmux.bestArchitect) data.tmux.bestArchitect = score;
    if (level > data.tmux.bestArchitectLevel) data.tmux.bestArchitectLevel = level;
    this.markActiveToday();
    this.save();
  },

  completeLesson(id, wpm, acc) {
    const stars = acc >= 98 && wpm >= 30 ? 3 : acc >= 95 ? 2 : 1;
    const prev = data.lessons[id] || { bestWpm: 0, bestAcc: 0, stars: 0 };
    data.lessons[id] = {
      done: true,
      bestWpm: Math.max(prev.bestWpm, Math.round(wpm)),
      bestAcc: Math.max(prev.bestAcc, Math.round(acc)),
      stars: Math.max(prev.stars, stars),
    };
    this.save();
    return data.lessons[id];
  },

  lessonsDone() { return Object.values(data.lessons).filter(l => l.done).length; },

  unlock(id) {
    if (data.achievements[id]) return false;
    data.achievements[id] = true;
    this.save();
    return true;   // true = neu freigeschaltet
  },
  hasAchievement(id) { return !!data.achievements[id]; },

  reset() {
    data = structuredClone(DEFAULT);
    this.save();
  },
};
