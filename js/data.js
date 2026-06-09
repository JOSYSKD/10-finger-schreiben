// ============================================================================
//  data.js  –  Lerninhalte, Tastatur-Layout, Finger-Zuordnung, Erfolge
// ============================================================================

// Deutsches QWERTZ-Layout, Reihe für Reihe.
// Jede Taste: { k: angezeigtes Zeichen, c: Code/Wert, f: Fingernummer, w: Breite }
// Fingernummern: 0..3 = linke Hand (kl. Finger -> Zeigefinger),
//                4..7 = rechte Hand (Zeigefinger -> kl. Finger), 8 = Daumen
export const KEYBOARD_ROWS = [
  [
    { k: '^', f: 0 }, { k: '1', f: 0 }, { k: '2', f: 1 }, { k: '3', f: 2 },
    { k: '4', f: 3 }, { k: '5', f: 3 }, { k: '6', f: 4 }, { k: '7', f: 4 },
    { k: '8', f: 5 }, { k: '9', f: 6 }, { k: '0', f: 7 }, { k: 'ß', f: 7 },
    { k: '´', f: 7 }, { k: '⌫', code: 'Backspace', f: 7, w: 2 },
  ],
  [
    { k: '↹', code: 'Tab', f: 0, w: 1.5 }, { k: 'Q', f: 0 }, { k: 'W', f: 1 },
    { k: 'E', f: 2 }, { k: 'R', f: 3 }, { k: 'T', f: 3 }, { k: 'Z', f: 4 },
    { k: 'U', f: 4 }, { k: 'I', f: 5 }, { k: 'O', f: 6 }, { k: 'P', f: 7 },
    { k: 'Ü', f: 7 }, { k: '+', f: 7 }, { k: '↵', code: 'Enter', f: 7, w: 1.5 },
  ],
  [
    { k: '⇪', code: 'CapsLock', f: 0, w: 1.8 }, { k: 'A', f: 0 }, { k: 'S', f: 1 },
    { k: 'D', f: 2 }, { k: 'F', f: 3, home: true }, { k: 'G', f: 3 }, { k: 'H', f: 4 },
    { k: 'J', f: 4, home: true }, { k: 'K', f: 5 }, { k: 'L', f: 6 }, { k: 'Ö', f: 7 },
    { k: 'Ä', f: 7 }, { k: '#', f: 7 }, { k: '↵', code: 'Enter2', f: 7, w: 1.2 },
  ],
  [
    { k: '⇧', code: 'ShiftLeft', f: 0, w: 1.4 }, { k: '<', f: 0 }, { k: 'Y', f: 0 },
    { k: 'X', f: 1 }, { k: 'C', f: 2 }, { k: 'V', f: 3 }, { k: 'B', f: 3 },
    { k: 'N', f: 4 }, { k: 'M', f: 4 }, { k: ',', f: 5 }, { k: '.', f: 6 },
    { k: '-', f: 7 }, { k: '⇧', code: 'ShiftRight', f: 7, w: 2.6 },
  ],
  [
    { k: 'Strg', code: 'ControlLeft', f: 0, w: 1.5 }, { k: '⊞', code: 'Meta', f: 0, w: 1.2 },
    { k: 'Alt', code: 'AltLeft', f: 8, w: 1.2 },
    { k: 'Leertaste', code: 'Space', f: 8, w: 6.5 },
    { k: 'Alt', code: 'AltRight', f: 8, w: 1.2 }, { k: 'Strg', code: 'ControlRight', f: 7, w: 1.5 },
  ],
];

// Farbe + Name je Finger (für Tastatur-Einfärbung und Legende)
export const FINGERS = [
  { name: 'Kl. Finger links', short: 'KF',  color: '#ff5e7e', hand: 'L' },
  { name: 'Ringfinger links', short: 'RF',  color: '#ffa14a', hand: 'L' },
  { name: 'Mittelfinger links',short: 'MF', color: '#ffd84a', hand: 'L' },
  { name: 'Zeigefinger links', short: 'ZF', color: '#6ee7a8', hand: 'L' },
  { name: 'Zeigefinger rechts',short: 'ZF', color: '#5ee0d6', hand: 'R' },
  { name: 'Mittelfinger rechts',short:'MF', color: '#62b6ff', hand: 'R' },
  { name: 'Ringfinger rechts', short: 'RF', color: '#9d8cff', hand: 'R' },
  { name: 'Kl. Finger rechts', short: 'KF', color: '#e98cff', hand: 'R' },
  { name: 'Daumen',            short: 'D',  color: '#9aa6c4', hand: '–' },
];

// Zeichen -> Fingernummer (für Finger-Hinweis beim Tippen, normalisiert auf Kleinbuchstaben)
export const CHAR_TO_FINGER = (() => {
  const map = {};
  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.k && key.k.length === 1) map[key.k.toLowerCase()] = key.f;
    }
  }
  map[' '] = 8;
  return map;
})();

// ---------------------------------------------------------------------------
//  Lektionen – progressiver Aufbau vom Grundlagen-Anfänger bis Profi
// ---------------------------------------------------------------------------
export const LESSONS = [
  { id: 'l1', title: 'Grundreihe: f j', icon: '🏠', desc: 'Die Heimtasten für die Zeigefinger.',
    gen: () => genReps(['f','j','ff','jj','fj','jf','fjf','jfj','fjfj','jfjf'], 26) },
  { id: 'l2', title: 'Grundreihe: d k', icon: '🏠', desc: 'Mittelfinger dazu.',
    gen: () => genReps(['d','k','dk','kd','fd','jk','dkf','kjd','fjdk','dkfj'], 26) },
  { id: 'l3', title: 'Grundreihe: s l', icon: '🏠', desc: 'Ringfinger dazu.',
    gen: () => genReps(['s','l','sl','ls','as','öl','sls','lsl','asdf','jklö'], 26) },
  { id: 'l4', title: 'Grundreihe komplett', icon: '⭐', desc: 'a s d f – j k l ö, alles zusammen.',
    gen: () => genWords(['das','als','lass','fass','falls','dass','sosa','aha','jahr','salasa','dolak','flask'], 30) },
  { id: 'l5', title: 'Obere Reihe: e i', icon: '⬆️', desc: 'Erste Tasten der oberen Reihe.',
    gen: () => genReps(['e','i','ei','ie','die','wie','sie','ide','feile','leise','seife'], 26) },
  { id: 'l6', title: 'Obere Reihe: r u', icon: '⬆️', desc: 'Zeigefinger nach oben.',
    gen: () => genWords(['rufe','ruder','uhr','flur','klar','spur','feuer','dauer','sauer','laura'], 30) },
  { id: 'l7', title: 'Obere Reihe: w o', icon: '⬆️', desc: 'Mittel- & Ringfinger oben.',
    gen: () => genWords(['wort','wolke','woche','oder','ofen','sofa','wolf','sowie','flow','rowdy'], 30) },
  { id: 'l8', title: 'Obere Reihe: q p t z', icon: '⬆️', desc: 'Restliche obere Reihe.',
    gen: () => genWords(['platz','typ','zeit','quiz','tasse','katze','pferd','quer','zopf','party'], 30) },
  { id: 'l9', title: 'Untere Reihe: v n', icon: '⬇️', desc: 'Zeigefinger nach unten.',
    gen: () => genWords(['von','vase','nase','name','nuvo','nivea','vans','niveau','nerven','venen'], 30) },
  { id: 'l10', title: 'Untere Reihe: c m', icon: '⬇️', desc: 'Mittelfinger & Zeigefinger unten.',
    gen: () => genWords(['mama','code','macht','mond','musik','clip','comic','memo','moment','camp'], 30) },
  { id: 'l11', title: 'Untere Reihe: x b , .', icon: '⬇️', desc: 'Komma, Punkt & Co.',
    gen: () => genWords(['box','baum','bett','xaver','bombe,','obst.','box,','beben.','baby','boxen'], 30) },
  { id: 'l12', title: 'Umlaute & ß', icon: '🇩🇪', desc: 'ä ö ü ß sicher treffen.',
    gen: () => genWords(['über','schön','grün','süß','straße','mädchen','größe','fühlen','möbel','hände'], 30) },
  { id: 'l13', title: 'Großschreibung', icon: '🔠', desc: 'Shift mit der Gegenhand nutzen.',
    gen: () => genWords(['Hallo','Berlin','Montag','Auto','Schule','Pizza','Klaus','Wasser','Computer','Tastatur'], 30) },
  { id: 'l14', title: 'Zahlenreihe', icon: '🔢', desc: 'Die Ziffern 0–9.',
    gen: () => genWords(['12','345','678','90','2024','3,14','100','42','007','1989'], 30) },
  { id: 'l15', title: 'Satzzeichen', icon: '❓', desc: '. , ! ? ; : und mehr.',
    gen: () => genWords(['Hallo!','Wie geht\'s?','Ja, klar.','Stopp!','Oh; nein:','100%','E-Mail','3:0','z.B.','usw.'], 24) },
  { id: 'l16', title: 'Profi: ganze Sätze', icon: '🏆', desc: 'Echte Sätze für den Flow.',
    gen: () => SENTENCES_DE.slice() },
];

function genReps(units, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(units[i % units.length]);
  return shuffle(out);
}
function genWords(words, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(words[Math.floor(Math.random() * words.length)]);
  return out;
}

// ---------------------------------------------------------------------------
//  Wortlisten für Tests & Spiele
// ---------------------------------------------------------------------------
export const WORDS_DE = ('der die das und ist ich nicht ein eine mit dem auf für von zu im sich auch es an werden aus er hat dass sie nach wird bei einer um am sind noch wie einem über einen so zum war haben nur oder aber vor zur bis mehr durch man sein wurde sei viel doch jetzt immer ganz weil leben welt zeit jahr tag haus hand kopf wort spiel licht musik wasser feuer erde luft baum blume vogel katze hund pferd auto stadt land meer berg fluss wald wiese sonne mond stern wolke regen schnee wind sturm freund liebe glück mut kraft sinn idee plan ziel weg tür fenster tisch stuhl buch brief zahl farbe form klang ruhe').split(' ');

export const WORDS_EN = ('the of and to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part').split(' ');

export const SENTENCES_DE = [
  'Der frühe Vogel fängt den Wurm.',
  'Übung macht den Meister, das ist klar.',
  'Zehn flinke Finger tippen ohne Pause.',
  'Wer schreibt, der bleibt am Ball.',
  'Schnelle Worte fließen wie ein Fluss.',
  'Jeder Anfang ist schwer, doch er lohnt sich.',
  'Die Sonne scheint hell über der Stadt.',
  'Mit Geduld und Spucke fängt man eine Mücke.',
  'Programmieren macht riesigen Spaß, oder?',
  'Pack die Koffer, wir fahren ans Meer!',
];

export const SENTENCES_EN = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice makes perfect, day by day.',
  'Type with all ten fingers and never look down.',
  'A journey of a thousand miles begins with one step.',
  'Code is poetry written for machines and humans.',
];

// Wörter für den Wortregen (kurz -> einfacher)
export function wordPool(lang) {
  return (lang === 'en' ? WORDS_EN : WORDS_DE).filter(w => w.length >= 2);
}

// ---------------------------------------------------------------------------
//  Erfolge / Achievements
// ---------------------------------------------------------------------------
export const ACHIEVEMENTS = [
  { id: 'first_run',  icon: '🚀', title: 'Erster Start',     desc: 'Schließe deine erste Runde ab.' },
  { id: 'wpm_20',     icon: '🐢', title: 'Es läuft',          desc: 'Erreiche 20 WPM.' },
  { id: 'wpm_40',     icon: '🏃', title: 'Schnelle Finger',   desc: 'Erreiche 40 WPM.' },
  { id: 'wpm_60',     icon: '⚡', title: 'Blitzschnell',       desc: 'Erreiche 60 WPM.' },
  { id: 'wpm_80',     icon: '🔥', title: 'Tipp-Maschine',     desc: 'Erreiche 80 WPM.' },
  { id: 'acc_100',    icon: '🎯', title: 'Makellos',          desc: 'Beende eine Runde mit 100% Genauigkeit.' },
  { id: 'combo_50',   icon: '🔗', title: 'Combo-König',       desc: 'Erreiche eine 50er-Combo.' },
  { id: 'lessons_5',  icon: '📚', title: 'Fleißig',           desc: 'Schließe 5 Lektionen ab.' },
  { id: 'lessons_all',icon: '🎓', title: 'Meisterschüler',    desc: 'Schließe alle Lektionen ab.' },
  { id: 'game_500',   icon: '👾', title: 'Wortvernichter',    desc: 'Erreiche 500 Punkte im Wortregen.' },
  { id: 'streak_3',   icon: '📅', title: 'Drei am Stück',     desc: 'Übe an 3 verschiedenen Tagen.' },
  { id: 'keys_5000',  icon: '⌨️', title: 'Vieltipper',        desc: 'Tippe insgesamt 5.000 Zeichen.' },
];

// ---------------------------------------------------------------------------
//  Hilfsfunktionen
// ---------------------------------------------------------------------------
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
