// ============================================================================
//  keyboard.js  –  virtuelle Tastatur + Finger-Highlighting + Handgrafik
// ============================================================================
import { KEYBOARD_ROWS, FINGERS, CHAR_TO_FINGER } from './data.js';

export class VirtualKeyboard {
  constructor(container) {
    this.container = container;
    this.keyEls = new Map();   // normalisiertes Zeichen -> Element
    this.build();
  }

  build() {
    this.container.innerHTML = '';
    const kb = document.createElement('div');
    kb.className = 'vk';
    for (const row of KEYBOARD_ROWS) {
      const r = document.createElement('div');
      r.className = 'vk-row';
      for (const key of row) {
        const el = document.createElement('div');
        el.className = 'vk-key';
        if (key.home) el.classList.add('vk-home');
        if (key.code === 'Space') el.classList.add('vk-space');
        if (key.w) el.style.flex = `${key.w} 0 0`;
        const fc = FINGERS[key.f]?.color || '#888';
        el.style.setProperty('--fc', fc);
        el.textContent = key.k;
        el.dataset.finger = key.f;
        this.container.dataset; // noop
        const norm = key.k && key.k.length === 1 ? key.k.toLowerCase() : null;
        if (norm) this.keyEls.set(norm, el);
        if (key.code === 'Space') this.keyEls.set(' ', el);
        r.appendChild(el);
      }
      kb.appendChild(r);
    }
    this.container.appendChild(kb);
  }

  // Hebt die nächste zu tippende Taste hervor
  highlightNext(ch) {
    this.clearNext();
    if (ch == null) return;
    const lower = ch.toLowerCase();
    const el = this.keyEls.get(lower);
    if (el) el.classList.add('vk-next');
    // Bei Großbuchstaben/Sonderzeichen Shift markieren
    const needsShift = /[A-ZÄÖÜ!"§$%&/()=?;:_]/.test(ch);
    if (needsShift) {
      const finger = CHAR_TO_FINGER[lower];
      // Shift mit der jeweils anderen Hand
      const shiftCode = finger != null && finger <= 3 ? 'ShiftRight' : 'ShiftLeft';
      for (const [, e] of this.keyEls) {} // keine direkten Codes -> per Klassenname suchen
      const shiftEl = [...this.container.querySelectorAll('.vk-key')]
        .find(e => e.textContent === '⇧' && (shiftCode === 'ShiftRight' ? e.style.flex.startsWith('2.6') : e.style.flex.startsWith('1.4')));
      if (shiftEl) shiftEl.classList.add('vk-next-shift');
    }
  }

  clearNext() {
    this.container.querySelectorAll('.vk-next, .vk-next-shift')
      .forEach(e => e.classList.remove('vk-next', 'vk-next-shift'));
  }

  // Kurzes Aufblitzen beim Tastendruck (richtig/falsch)
  flash(ch, ok) {
    const el = this.keyEls.get((ch || '').toLowerCase());
    if (!el) return;
    el.classList.remove('vk-hit', 'vk-miss');
    void el.offsetWidth;
    el.classList.add(ok ? 'vk-hit' : 'vk-miss');
    setTimeout(() => el.classList.remove('vk-hit', 'vk-miss'), 220);
  }
}

// Legende der Finger-Farben
export function buildFingerLegend(container) {
  container.innerHTML = '';
  const seen = new Set();
  FINGERS.forEach((f) => {
    const key = f.color;
    if (seen.has(key)) return;
    seen.add(key);
    const item = document.createElement('div');
    item.className = 'leg-item';
    item.innerHTML = `<span class="leg-dot" style="background:${f.color}"></span>${f.name}`;
    container.appendChild(item);
  });
}

// SVG-Hände, hebt den aktuell benötigten Finger hervor
export function buildHands(container) {
  container.innerHTML = `
    <svg viewBox="0 0 420 150" class="hands-svg" aria-hidden="true">
      ${handSvg('L')}
      ${handSvg('R')}
    </svg>`;
}

function handSvg(side) {
  // Vereinfachte Hand: 5 "Finger"-Pillen, indexiert über data-finger
  const baseX = side === 'L' ? 10 : 220;
  const flip = side === 'L' ? 1 : -1;
  // Finger-Indizes je Hand (kl,ring,mittel,zeige,daumen)
  const idx = side === 'L' ? [0, 1, 2, 3, 8] : [7, 6, 5, 4, 8];
  const heights = [70, 95, 105, 92, 55];
  let pills = '';
  for (let i = 0; i < 5; i++) {
    const isThumb = i === 4;
    const x = side === 'L' ? baseX + i * 32 : baseX + (4 - i) * 32;
    const h = heights[i];
    const y = 120 - h;
    if (isThumb) {
      const tx = side === 'L' ? baseX + 150 : baseX + 4;
      pills += `<rect class="finger" data-finger="8" x="${tx}" y="78" width="40" height="22" rx="11"
                 transform="rotate(${flip * 35} ${tx + 20} 89)"></rect>`;
    } else {
      pills += `<rect class="finger" data-finger="${idx[i]}" x="${x}" y="${y}" width="24" height="${h}" rx="12"></rect>`;
    }
  }
  // Handfläche
  const palmX = baseX - 4;
  pills += `<rect class="palm" x="${palmX}" y="105" width="150" height="35" rx="14"></rect>`;
  return `<g class="hand hand-${side}">${pills}</g>`;
}

export function highlightFinger(container, finger) {
  container.querySelectorAll('.finger.active').forEach(e => e.classList.remove('active'));
  if (finger == null) return;
  const el = container.querySelector(`.finger[data-finger="${finger}"]`);
  if (el) {
    el.classList.add('active');
    el.style.fill = FINGERS[finger]?.color || '#fff';
  }
}
