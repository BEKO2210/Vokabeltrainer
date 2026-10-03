/**
 * Vokabel Master+ – Vokabeltrainer PWA
 * Mobile-first, offline-first, ohne externe Abhängigkeiten.
 * Die mitgelieferten Vokabeln liegen in vocabulary.js (PRESET_VOCABULARY).
 */
'use strict';

// ============================================
// KONFIGURATION
// ============================================

const CONFIG = {
  version: '2.3.0',
  // Version der mitgelieferten Vokabelliste. Erhöhen, wenn vocabulary.js geändert wird,
  // damit bestehende Installationen die Änderungen einmalig übernehmen.
  PRESET_VERSION: 5,
  // Spaced-Repetition-Intervalle in Tagen (Level 0–5)
  INTERVALS: [1, 3, 7, 14, 30, 60],
  MASTERED_LEVEL: 4,
  DB_NAME: 'vokabel-master-db',
  DB_VERSION: 2,
  STORE_VOCAB: 'vocabulary',
  STORE_PROGRESS: 'progress',
  STORE_SETTINGS: 'settings',
  STORE_STATS: 'stats',
  STORE_SELECTION: 'selection',
  CUSTOM_CATEGORY: 'Eigene Wörter',
  MC_OPTIONS: 4,
  SEARCH_LIMIT: 80,
  DEFAULT_SETTINGS: {
    theme: 'system',
    tolerantMode: true,
    showHints: true,
    speechEnabled: true,
    speechLang: 'en-US',
    nativeLang: 'de-DE',
    cardsPerSession: 20,
    dailyGoal: 20,
    soundEnabled: true,
    hapticsEnabled: true,
    practiceDirection: 'de-en', // 'de-en' | 'en-de' | 'mixed'
    gradeLevel: 'all', // 'A1' (Klasse 5–6) | 'A2' (bis Klasse 8) | 'all'
    lastMode: 'flashcard',
    presetSyncVersion: 0,
    difficultyMigrationV1Done: false
  }
};

const MODES = {
  flashcard: { label: 'Karteikarten', desc: 'Aufdecken & einschätzen', icon: 'cards' },
  mc: { label: 'Auswahl', desc: '4 Antworten, eine stimmt', icon: 'listCheck' },
  typing: { label: 'Schreiben', desc: 'Antwort eintippen', icon: 'keyboard' },
  dictation: { label: 'Diktat', desc: 'Hören & schreiben', icon: 'headphones' }
};

// Niveaustufen (GER) und ihre Zuordnung zu Klassen
const LEVELS = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const GRADE_LEVELS = [
  ['A1', 'Klasse 5–6', 'Grundwortschatz'],
  ['A2', 'Klasse 5–8', 'Grund- und Aufbauwortschatz'],
  ['all', 'Alle Wörter', 'Auch Wörter für höhere Klassen']
];

function gradeLabel() {
  const g = GRADE_LEVELS.find(x => x[0] === state.settings.gradeLevel) || GRADE_LEVELS[2];
  return g[1];
}

// ============================================
// HILFSFUNKTIONEN
// ============================================

const Utils = {
  esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // Lokales Datum als YYYY-MM-DD (nicht UTC, sonst zählt 0–2 Uhr zum Vortag)
  dateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  endOfToday() {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  },

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  hue(text) {
    let h = 0;
    for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) % 360;
    return h;
  },

  monogram(text) {
    const match = String(text).match(/[\p{L}\p{N}]/u);
    return match ? match[0].toUpperCase() : '?';
  },

  num(n) {
    return Number(n || 0).toLocaleString('de-DE');
  },

  plural(n, one, many) {
    return `${Utils.num(n)} ${n === 1 ? one : many}`;
  },

  newId() {
    return 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  },

  download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || '').replace(/^﻿/, ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
};

// Icon-Set (Linien-Icons, 24×24)
const ICONS = {
  home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/>',
  book: '<path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6l0 13"/><path d="M12 6l0 13"/><path d="M21 6l0 13"/>',
  chart: '<path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
  settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
  flame: '<path d="M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.621 -2.333 5.588c0 3.704 3.134 6.706 7 6.706s7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235"/>',
  check: '<path d="M5 12l5 5l10 -10"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
  plus: '<path d="M12 5l0 14"/><path d="M5 12l14 0"/>',
  search: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>',
  chevronRight: '<path d="M9 6l6 6l-6 6"/>',
  chevronLeft: '<path d="M15 6l-6 6l6 6"/>',
  volume: '<path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/>',
  turtle: '<path d="M12 5c-4 0 -7 3 -7 7h14c0 -4 -3 -7 -7 -7z"/><path d="M5 12l-2 2"/><path d="M19 12l2 2"/><path d="M8 12v3"/><path d="M16 12v3"/><path d="M19 9h1.5a1.5 1.5 0 0 1 0 3h-1.5"/>',
  cards: '<path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304z"/><path d="M15 4h1a1 1 0 0 1 1 1v3.5"/><path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374"/>',
  listCheck: '<path d="M3.5 5.5l1.5 1.5l2.5 -2.5"/><path d="M3.5 11.5l1.5 1.5l2.5 -2.5"/><path d="M3.5 17.5l1.5 1.5l2.5 -2.5"/><path d="M11 6l9 0"/><path d="M11 12l9 0"/><path d="M11 18l9 0"/>',
  keyboard: '<path d="M2 8a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z"/><path d="M6 10l0 .01"/><path d="M10 10l0 .01"/><path d="M14 10l0 .01"/><path d="M18 10l0 .01"/><path d="M6 14l0 .01"/><path d="M18 14l0 .01"/><path d="M10 14l4 .01"/>',
  headphones: '<path d="M4 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"/><path d="M15 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/>',
  clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>',
  sparkles: '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>',
  alert: '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
  shuffle: '<path d="M18 4l3 3l-3 3"/><path d="M18 20l3 -3l-3 -3"/><path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"/><path d="M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3"/>',
  target: '<path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>',
  download: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/>',
  upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>',
  file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  table: '<path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M3 10h18"/><path d="M10 3v18"/>',
  trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>',
  info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>',
  shield: '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>',
  edit: '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>',
  lightbulb: '<path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"/><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"/><path d="M9.7 17l4.6 0"/>',
  arrowRight: '<path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/>',
  rotate: '<path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5"/>',
  smartphone: '<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z"/><path d="M11 4h2"/><path d="M12 17v.01"/>',
  trophy: '<path d="M8 21l8 0"/><path d="M12 17l0 4"/><path d="M7 4l10 0"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>'
};

// Themenbilder: Icon + Farbton je mitgelieferter Kategorie
const TOPIC_ICONS = {
  plane: '<path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z"/>',
  school: '<path d="M22 9l-10 -4l-10 4l10 4l10 -4v6"/><path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4"/>',
  ball: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55z"/><path d="M12 7v-4m3 13l2.5 3m-.74 -8.55l3.74 -1.45m-11.44 7.05l-2.56 2.95m.74 -8.55l-3.74 -1.45"/>',
  food: '<path d="M19 3v12h-5c-.023 -3.681 .184 -7.406 5 -12zm0 12v6h-1v-3m-10 -14v17m-3 -17v3a3 3 0 1 0 6 0v-3"/>',
  briefcase: '<path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"/><path d="M12 12l0 .01"/><path d="M3 13a20 20 0 0 0 18 0"/>',
  sofa: '<path d="M4 11a2 2 0 0 1 2 2v1h12v-1a2 2 0 1 1 4 0v5a1 1 0 0 1 -1 1h-18a1 1 0 0 1 -1 -1v-5a2 2 0 0 1 2 -2z"/><path d="M4 11v-3a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v3"/><path d="M12 5v9"/>',
  heart: '<path d="M19.5 13.572l-7.5 7.428l-2.896 -2.868m-6.117 -8.104a5 5 0 0 1 9.013 -3.022a5 5 0 1 1 7.5 6.572"/><path d="M3 13h2l2 3l2 -6l1 3h3"/>',
  laptop: '<path d="M3 19l18 0"/><path d="M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"/>',
  leaf: '<path d="M5 21c.5 -4.5 2.5 -8 7 -10"/><path d="M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z"/>',
  smile: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 10l.01 0"/><path d="M15 10l.01 0"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/>',
  bag: '<path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z"/><path d="M9 11v-5a3 3 0 0 1 6 0v5"/>',
  chat: '<path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10"/><path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2"/>',
  paw: '<path d="M14.7 13.5c-1.1 -2 -1.441 -2.5 -2.7 -2.5c-1.259 0 -1.736 .755 -2.836 2.747c-.942 1.703 -2.846 1.845 -3.321 3.291c-.097 .265 -.145 .677 -.143 .962c0 1.176 .787 2 1.8 2c1.259 0 3 -1 4.5 -1s3.241 1 4.5 1c1.013 0 1.8 -.823 1.8 -2c0 -.285 -.049 -.697 -.146 -.962c-.475 -1.451 -2.512 -1.835 -3.454 -3.538z"/><path d="M20.188 8.082a1.039 1.039 0 0 0 -.406 -.082h-.015c-.735 .012 -1.56 .75 -1.993 1.866c-.519 1.335 -.28 2.7 .538 3.052c.129 .055 .267 .082 .406 .082c.739 0 1.575 -.742 2.011 -1.866c.516 -1.335 .273 -2.7 -.54 -3.052z"/><path d="M9.474 9c.055 0 .109 0 .163 -.011c.944 -.128 1.533 -1.346 1.32 -2.722c-.203 -1.297 -1.047 -2.267 -1.932 -2.267c-.055 0 -.109 0 -.163 .011c-.944 .128 -1.533 1.346 -1.32 2.722c.204 1.293 1.048 2.267 1.933 2.267z"/><path d="M16.456 6.733c.214 -1.376 -.375 -2.594 -1.32 -2.722a1.164 1.164 0 0 0 -.162 -.011c-.885 0 -1.728 .97 -1.93 2.267c-.214 1.376 .375 2.594 1.32 2.722c.054 .007 .108 .011 .162 .011c.885 0 1.73 -.974 1.93 -2.267z"/><path d="M5.69 12.918c.816 -.352 1.054 -1.719 .536 -3.052c-.436 -1.124 -1.271 -1.866 -2.009 -1.866c-.14 0 -.277 .027 -.407 .082c-.816 .352 -1.054 1.719 -.536 3.052c.436 1.124 1.271 1.866 2.009 1.866c.14 0 .277 -.027 .407 -.082z"/>',
  run: '<path d="M12 4a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M4 17l5 1l.75 -1.5"/><path d="M15 21l0 -4l-4 -3l1 -6"/><path d="M7 12l0 -3l5 -1l3 3l3 1"/>',
  palette: '<path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/><path d="M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
  users: '<path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>',
  calendar: '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/><path d="M11 15h1"/><path d="M12 15v3"/>',
  quote: '<path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"/><path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"/>',
  abc: '<path d="M3 16v-6a2 2 0 1 1 4 0v6"/><path d="M3 13h4"/><path d="M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0 -4 0v1"/><path d="M20.732 12a2 2 0 0 0 -3.732 1v1a2 2 0 0 0 3.726 1.01"/>',
  bank: '<path d="M3 21l18 0"/><path d="M3 10l18 0"/><path d="M5 6l7 -3l7 3"/><path d="M4 10l0 11"/><path d="M20 10l0 11"/><path d="M8 14l0 3"/><path d="M12 14l0 3"/><path d="M16 14l0 3"/>',
  bulb: '<path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"/><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"/><path d="M9.7 17l4.6 0"/>',
  pencil: '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>'
};

const TOPIC_THEMES = {
  'Alltag & Reisen': { icon: 'plane', hue: 200 },
  'Schule & Bildung': { icon: 'school', hue: 238 },
  'Freizeit & Hobbys': { icon: 'ball', hue: 145 },
  'Essen & Trinken': { icon: 'food', hue: 24 },
  'Beruf & Arbeit': { icon: 'briefcase', hue: 268 },
  'Haus & Wohnen': { icon: 'sofa', hue: 38 },
  'Körper & Gesundheit': { icon: 'heart', hue: 350 },
  'Technik & Internet': { icon: 'laptop', hue: 218 },
  'Natur & Umwelt': { icon: 'leaf', hue: 110 },
  'Gefühle & Charakter': { icon: 'smile', hue: 48 },
  'Einkaufen & Mode': { icon: 'bag', hue: 318 },
  'Kommunikation & Medien': { icon: 'chat', hue: 182 },
  'Tierwelt': { icon: 'paw', hue: 12 },
  'Alltagshandlungen': { icon: 'run', hue: 165 },
  'Merkmale & Eigenschaften': { icon: 'palette', hue: 292 },
  'Familie & Freunde': { icon: 'users', hue: 335 },
  'Zahlen & Zeit': { icon: 'calendar', hue: 58 },
  'Gesellschaft & Politik': { icon: 'bank', hue: 196 },
  'Allgemeine Begriffe': { icon: 'bulb', hue: 80 },
  'Sätze & Redewendungen': { icon: 'quote', hue: 128 },
  'Kleine Wörter': { icon: 'abc', hue: 275 },
  'Eigene Wörter': { icon: 'pencil', hue: 252 }
};

// Kleines Themenbild (eigene Themen bekommen den Anfangsbuchstaben)
function topicAvatar(name, size = '') {
  const theme = TOPIC_THEMES[name];
  const hue = theme ? theme.hue : Utils.hue(name);
  const cls = `avatar ${size ? `avatar--${size}` : ''}`;
  if (!theme) return `<span class="${cls}" style="--h:${hue}" aria-hidden="true">${Utils.esc(Utils.monogram(name))}</span>`;
  const px = size === 'lg' ? 26 : size === 'sm' ? 14 : 22;
  return `<span class="${cls}" style="--h:${hue}" aria-hidden="true"><svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" focusable="false">${TOPIC_ICONS[theme.icon]}</svg></span>`;
}

function icon(name, size = 20, extraClass = '') {
  return `<svg class="icon ${extraClass}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

// ============================================
// STATE
// ============================================

function defaultStats() {
  return {
    totalReviews: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    lastGoalDate: null,
    dailyStats: {},
    dailyCorrect: 0,
    goalReached: false,
    lastCategory: null
  };
}

const state = {
  db: null,
  vocabulary: [],
  selectedWords: new Set(),
  progress: {},
  settings: { ...CONFIG.DEFAULT_SETTINGS },
  stats: defaultStats(),
  currentTab: 'home',
  deferredPrompt: null
};

// ============================================
// INDEXEDDB
// ============================================

const DB = {
  open() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Dein Browser unterstützt keine lokale Datenbank.'));
        return;
      }
      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onblocked = () => console.warn('IndexedDB-Upgrade blockiert (anderer Tab offen)');
      request.onsuccess = () => {
        state.db = request.result;
        state.db.onversionchange = () => state.db.close();
        resolve(state.db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(CONFIG.STORE_VOCAB)) {
          const vocabStore = db.createObjectStore(CONFIG.STORE_VOCAB, { keyPath: 'id' });
          vocabStore.createIndex('category', 'category', { unique: false });
          vocabStore.createIndex('difficulty', 'difficulty', { unique: false });
        }
        if (!db.objectStoreNames.contains(CONFIG.STORE_PROGRESS)) {
          db.createObjectStore(CONFIG.STORE_PROGRESS, { keyPath: 'vocabId' });
        }
        if (!db.objectStoreNames.contains(CONFIG.STORE_SETTINGS)) {
          db.createObjectStore(CONFIG.STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(CONFIG.STORE_STATS)) {
          db.createObjectStore(CONFIG.STORE_STATS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(CONFIG.STORE_SELECTION)) {
          db.createObjectStore(CONFIG.STORE_SELECTION, { keyPath: 'vocabId' });
        }
      };
    });
  },

  request(storeName, mode, fn) {
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction(storeName, mode);
      const req = fn(tx.objectStore(storeName));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  },

  getAll(storeName) {
    return this.request(storeName, 'readonly', store => store.getAll());
  },

  get(storeName, key) {
    return this.request(storeName, 'readonly', store => store.get(key));
  },

  put(storeName, data) {
    return this.request(storeName, 'readwrite', store => store.put(data));
  },

  delete(storeName, key) {
    return this.request(storeName, 'readwrite', store => store.delete(key));
  },

  clear(storeName) {
    return this.request(storeName, 'readwrite', store => store.clear());
  },

  // Viele Datensätze in einer einzigen Transaktion schreiben (schnell beim ersten Start)
  putMany(storeName, items) {
    if (!items.length) return Promise.resolve();
    return this.request(storeName, 'readwrite', store => {
      items.forEach(item => store.put(item));
      return null;
    });
  },

  deleteMany(storeName, keys) {
    if (!keys.length) return Promise.resolve();
    return this.request(storeName, 'readwrite', store => {
      keys.forEach(key => store.delete(key));
      return null;
    });
  }
};

// ============================================
// DATEN
// ============================================

const DataManager = {
  presetOrder: new Map(),
  categoryOrder: new Map(),

  buildPresetIndex() {
    let i = 0;
    PRESET_VOCABULARY.categories.forEach((cat, ci) => {
      this.categoryOrder.set(cat.name, ci);
      cat.words.forEach(w => this.presetOrder.set(`${cat.name}|${w.native}`, i++));
    });
  },

  sortVocabulary() {
    const order = (v) => {
      const idx = this.presetOrder.get(`${v.category}|${v.native}`);
      return idx === undefined ? Number.MAX_SAFE_INTEGER : idx;
    };
    state.vocabulary.sort((a, b) => {
      const d = order(a) - order(b);
      if (d !== 0) return d;
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
  },

  // Schreibweisen-unabhängiger Schlüssel (für die Umlaut-Korrektur der Preset-Liste)
  foldKey(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s+/g, ' ')
      .trim();
  },

  calculateDifficulty(vocab) {
    const strip = (s) => String(s || '').trim().replace(/^(der|die|das|the|a|an|to)\s+/i, '');
    const native = strip(vocab.native);
    const foreign = strip(vocab.foreign);
    const avgLen = Math.round((native.length + foreign.length) / 2);
    const isPhrase = /\s/.test(native) || /\s/.test(foreign);
    if (!isPhrase && avgLen <= 7) return 1;
    if (isPhrase || avgLen >= 12) return 3;
    return 2;
  },

  sanitizeVocabularyEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const str = (value, maxLen) => (typeof value === 'string' ? value.trim().slice(0, maxLen) : '');
    const native = str(raw.native, 160);
    const foreign = str(raw.foreign, 160);
    if (!native || !foreign) return null;
    const difficulty = Math.min(Math.max(parseInt(raw.difficulty, 10) || 0, 0), 3);
    return {
      id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim().slice(0, 120) : undefined,
      native,
      foreign,
      example: str(raw.example, 500),
      exampleDe: str(raw.exampleDe, 500),
      category: str(raw.category, 80) || CONFIG.CUSTOM_CATEGORY,
      difficulty: difficulty || this.calculateDifficulty({ native, foreign }),
      note: str(raw.note, 500),
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined
    };
  },

  sanitizeProgressEntry(raw, allowedIds) {
    if (!raw || typeof raw !== 'object') return null;
    const vocabId = typeof raw.vocabId === 'string' ? raw.vocabId.trim() : '';
    if (!vocabId || !allowedIds.has(vocabId)) return null;
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    return {
      vocabId,
      level: clamp(parseInt(raw.level, 10) || 0, 0, CONFIG.INTERVALS.length - 1),
      correctCount: clamp(parseInt(raw.correctCount, 10) || 0, 0, 1000000),
      incorrectCount: clamp(parseInt(raw.incorrectCount, 10) || 0, 0, 1000000),
      lastReview: typeof raw.lastReview === 'string' ? raw.lastReview : null,
      nextReview: typeof raw.nextReview === 'string' ? raw.nextReview : null
    };
  },

  parseCSVLine(line, delimiter = ';') {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return { values, inQuotes };
  },

  async loadAll() {
    state.vocabulary = await DB.getAll(CONFIG.STORE_VOCAB);
    this.sortVocabulary();

    const progressData = await DB.getAll(CONFIG.STORE_PROGRESS);
    state.progress = {};
    progressData.forEach(p => { state.progress[p.vocabId] = p; });

    const settingsData = await DB.get(CONFIG.STORE_SETTINGS, 'userSettings');
    state.settings = { ...CONFIG.DEFAULT_SETTINGS, ...(settingsData ? settingsData.value : {}) };
    // Bestandsnutzer: bisheriges festes Tagesziel (50) beibehalten
    if (settingsData && settingsData.value && settingsData.value.dailyGoal === undefined) {
      state.settings.dailyGoal = 50;
    }

    const statsData = await DB.get(CONFIG.STORE_STATS, 'userStats');
    state.stats = { ...defaultStats(), ...(statsData ? statsData.value : {}) };
    if (!state.stats.dailyStats || typeof state.stats.dailyStats !== 'object') state.stats.dailyStats = {};
    state.stats.bestStreak = Math.max(state.stats.bestStreak || 0, state.stats.streak || 0);

    const selection = await DB.getAll(CONFIG.STORE_SELECTION);
    state.selectedWords = new Set(selection.map(s => s.vocabId));

    this.checkDay();
  },

  async saveSettings(partial) {
    state.settings = { ...state.settings, ...partial };
    await DB.put(CONFIG.STORE_SETTINGS, { key: 'userSettings', value: state.settings });
  },

  async saveStats() {
    await DB.put(CONFIG.STORE_STATS, { key: 'userStats', value: state.stats });
  },

  // Erster Start: alle mitgelieferten Vokabeln in einer Transaktion anlegen
  async seedPresetVocabulary() {
    if (state.vocabulary.length > 0) return false;
    const now = new Date().toISOString();
    const base = Date.now();
    const vocab = [];
    let i = 0;
    for (const category of PRESET_VOCABULARY.categories) {
      for (const word of category.words) {
        vocab.push({
          id: `v_${base}_${(i++).toString(36).padStart(4, '0')}`,
          native: word.native,
          foreign: word.foreign,
          example: word.example || '',
          exampleDe: word.exampleDe || '',
          category: category.name,
          level: word.level || '',
          difficulty: this.calculateDifficulty(word),
          note: '',
          createdAt: now,
          updatedAt: now
        });
      }
    }
    await DB.putMany(CONFIG.STORE_VOCAB, vocab);
    await DB.putMany(CONFIG.STORE_SELECTION, vocab.map(v => ({ vocabId: v.id })));
    state.vocabulary = vocab;
    vocab.forEach(v => state.selectedWords.add(v.id));
    this.sortVocabulary();
    await this.saveSettings({ presetSyncVersion: CONFIG.PRESET_VERSION, difficultyMigrationV1Done: true });
    return true;
  },

  // Änderungen an der mitgelieferten Liste übernehmen, ohne Lernstand zu verlieren.
  // Zuordnung über das deutsche Wort: Jedes deutsche Wort gibt es in der Liste genau einmal.
  // Doppelte Einträge (z. B. aus der früheren Klassenliste) werden zusammengeführt.
  async syncPresetVocabulary() {
    if (state.settings.presetSyncVersion >= CONFIG.PRESET_VERSION) return;

    const fold = (t) => this.foldKey(t);
    const nowIso = new Date().toISOString();
    const legacy = typeof PRESET_LEGACY_CATEGORIES !== 'undefined' ? PRESET_LEGACY_CATEGORIES : [];
    const renameList = typeof PRESET_NATIVE_RENAMES !== 'undefined' ? PRESET_NATIVE_RENAMES : [];
    const removedList = typeof PRESET_REMOVED_NATIVES !== 'undefined' ? PRESET_REMOVED_NATIVES : [];
    const renames = new Map(renameList.map(([cat, from, to]) => [`${cat}|${fold(from)}`, fold(to)]));
    const removed = new Set(removedList.map(fold));
    const presetCats = new Set([...legacy, ...PRESET_VOCABULARY.categories.map(c => c.name)]);

    const targets = new Map();
    for (const cat of PRESET_VOCABULARY.categories) {
      for (const word of cat.words) targets.set(fold(word.native), { category: cat.name, word });
    }

    const groups = new Map();
    const deleteIds = [];
    const updates = new Map();
    for (const v of state.vocabulary) {
      if (!presetCats.has(v.category) || v.category === CONFIG.CUSTOM_CATEGORY) continue; // eigene Wörter bleiben
      let key = fold(v.native);
      key = renames.get(`${v.category}|${key}`) || renames.get(`*|${key}`) || key;
      if (targets.has(key)) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(v);
      } else if (removed.has(key)) {
        deleteIds.push(v.id);
      } else if (!targets.size || !PRESET_VOCABULARY.categories.some(c => c.name === v.category)) {
        // Selbst geändertes Wort aus einem aufgelösten Thema -> zu den eigenen Wörtern
        updates.set(v.id, { ...v, category: CONFIG.CUSTOM_CATEGORY, updatedAt: nowIso });
      }
    }

    const score = (v) => {
      const p = state.progress[v.id];
      return p ? p.level * 100000 + p.correctCount * 10 - p.incorrectCount : -1;
    };
    const progressUpdates = [];
    const selectIds = [];
    const added = [];
    const topicSelected = new Map();
    let counter = 0;

    for (const [key, t] of targets) {
      const list = groups.get(key) || [];
      if (!list.length) {
        added.push({
          id: `v_${Date.now()}_${(counter++).toString(36).padStart(4, '0')}${Math.random().toString(36).slice(2, 6)}`,
          native: t.word.native,
          foreign: t.word.foreign,
          example: t.word.example || '',
          exampleDe: t.word.exampleDe || '',
          category: t.category,
          level: t.word.level || '',
          difficulty: this.calculateDifficulty(t.word),
          note: '',
          createdAt: nowIso,
          updatedAt: nowIso
        });
        continue;
      }
      list.sort((a, b) => score(b) - score(a));
      const keep = list[0];
      const others = list.slice(1);
      const anySelected = list.some(v => state.selectedWords.has(v.id));
      if (anySelected && !state.selectedWords.has(keep.id)) selectIds.push(keep.id);
      topicSelected.set(t.category, (topicSelected.get(t.category) || false) || anySelected);

      // Lernstand zusammenführen: beste Stufe bleibt, Zähler werden addiert
      const progs = list.map(v => state.progress[v.id]).filter(Boolean);
      if (progs.length > 1) {
        const merged = { ...state.progress[keep.id] };
        merged.correctCount = progs.reduce((sum, p) => sum + (p.correctCount || 0), 0);
        merged.incorrectCount = progs.reduce((sum, p) => sum + (p.incorrectCount || 0), 0);
        progressUpdates.push(merged);
      }

      updates.set(keep.id, {
        ...keep,
        category: t.category,
        native: t.word.native,
        foreign: t.word.foreign,
        example: t.word.example || '',
        exampleDe: t.word.exampleDe || '',
        level: t.word.level || '',
        note: keep.note || others.map(v => v.note).find(Boolean) || '',
        updatedAt: nowIso
      });
      others.forEach(v => deleteIds.push(v.id));
    }

    // Neue Wörter auswählen, außer ihr Thema wurde bewusst abgewählt
    added.forEach(v => {
      if (topicSelected.get(v.category) !== false || state.selectedWords.size === 0) selectIds.push(v.id);
    });

    const del = new Set(deleteIds);
    await DB.deleteMany(CONFIG.STORE_VOCAB, deleteIds);
    await DB.deleteMany(CONFIG.STORE_PROGRESS, deleteIds);
    await DB.deleteMany(CONFIG.STORE_SELECTION, deleteIds);
    await DB.putMany(CONFIG.STORE_VOCAB, [...updates.values(), ...added]);
    await DB.putMany(CONFIG.STORE_PROGRESS, progressUpdates);
    await DB.putMany(CONFIG.STORE_SELECTION, selectIds.map(id => ({ vocabId: id })));

    state.vocabulary = state.vocabulary
      .filter(v => !del.has(v.id))
      .map(v => updates.get(v.id) || v)
      .concat(added);
    deleteIds.forEach(id => { delete state.progress[id]; state.selectedWords.delete(id); });
    progressUpdates.forEach(p => { state.progress[p.vocabId] = p; });
    selectIds.forEach(id => state.selectedWords.add(id));
    this.sortVocabulary();

    await this.saveSettings({ presetSyncVersion: CONFIG.PRESET_VERSION, difficultyMigrationV1Done: true });
    console.info(`Vokabelliste aktualisiert: ${updates.size} übernommen, ${added.length} neu, ${deleteIds.length} entfernt`);
  },

  async saveVocab(vocab) {
    const isNew = !vocab.id;
    if (isNew) {
      const n = vocab.native.toLowerCase().trim();
      const f = vocab.foreign.toLowerCase().trim();
      const duplicate = state.vocabulary.find(v =>
        v.native.toLowerCase().trim() === n && v.foreign.toLowerCase().trim() === f);
      if (duplicate) {
        vocab.id = duplicate.id;
        vocab.createdAt = duplicate.createdAt;
      } else {
        vocab.id = Utils.newId();
      }
    }
    const nowIso = new Date().toISOString();
    vocab.createdAt = vocab.createdAt || nowIso;
    vocab.updatedAt = nowIso;
    if (!vocab.difficulty) vocab.difficulty = this.calculateDifficulty(vocab);

    await DB.put(CONFIG.STORE_VOCAB, vocab);
    const index = state.vocabulary.findIndex(v => v.id === vocab.id);
    if (index >= 0) state.vocabulary[index] = vocab;
    else state.vocabulary.push(vocab);

    if (isNew && !state.selectedWords.has(vocab.id)) {
      state.selectedWords.add(vocab.id);
      await DB.put(CONFIG.STORE_SELECTION, { vocabId: vocab.id });
    }
    return vocab;
  },

  async deleteVocab(id) {
    const vocab = state.vocabulary.find(v => v.id === id);
    if (!vocab) return null;
    const snapshot = { vocab, progress: state.progress[id] || null, selected: state.selectedWords.has(id) };
    await DB.delete(CONFIG.STORE_VOCAB, id);
    await DB.delete(CONFIG.STORE_PROGRESS, id);
    await DB.delete(CONFIG.STORE_SELECTION, id);
    state.vocabulary = state.vocabulary.filter(v => v.id !== id);
    delete state.progress[id];
    state.selectedWords.delete(id);
    return snapshot;
  },

  async restoreVocab(snapshot) {
    if (!snapshot) return;
    await DB.put(CONFIG.STORE_VOCAB, snapshot.vocab);
    state.vocabulary.push(snapshot.vocab);
    this.sortVocabulary();
    if (snapshot.progress) {
      await DB.put(CONFIG.STORE_PROGRESS, snapshot.progress);
      state.progress[snapshot.vocab.id] = snapshot.progress;
    }
    if (snapshot.selected) {
      await DB.put(CONFIG.STORE_SELECTION, { vocabId: snapshot.vocab.id });
      state.selectedWords.add(snapshot.vocab.id);
    }
  },

  async setSelection(ids, selected) {
    const changedIds = ids.filter(id => state.selectedWords.has(id) !== selected);
    if (!changedIds.length) return;
    if (selected) {
      changedIds.forEach(id => state.selectedWords.add(id));
      await DB.putMany(CONFIG.STORE_SELECTION, changedIds.map(id => ({ vocabId: id })));
    } else {
      changedIds.forEach(id => state.selectedWords.delete(id));
      await DB.deleteMany(CONFIG.STORE_SELECTION, changedIds);
    }
  },

  // Antwort speichern. Gibt true zurück, wenn dadurch das Tagesziel erreicht wurde.
  async saveProgress(vocabId, isCorrect) {
    const now = new Date();
    const progress = state.progress[vocabId] || {
      vocabId, level: 0, correctCount: 0, incorrectCount: 0, lastReview: null, nextReview: null
    };
    const isFirstReview = !state.progress[vocabId];

    if (isCorrect) {
      progress.correctCount++;
      // Neue Wörter, die sofort sitzen, springen nicht direkt auf 3 Tage, sondern starten bei 1 Tag
      progress.level = isFirstReview ? 0 : Math.min(progress.level + 1, CONFIG.INTERVALS.length - 1);
    } else {
      progress.incorrectCount++;
      progress.level = Math.max(0, progress.level - 1);
    }
    progress.lastReview = now.toISOString();
    // Falsche Antworten kommen morgen wieder, richtige nach dem Intervall ihrer Stufe
    progress.nextReview = Utils.addDays(now, isCorrect ? CONFIG.INTERVALS[progress.level] : 1).toISOString();

    state.progress[vocabId] = progress;
    await DB.put(CONFIG.STORE_PROGRESS, progress);
    return this.updateStats(isCorrect);
  },

  async updateStats(isCorrect) {
    const today = Utils.dateKey();
    this.checkDay();
    const s = state.stats;
    s.totalReviews++;
    if (isCorrect) s.correctAnswers++;
    s.lastStudyDate = today;

    if (!s.dailyStats[today]) s.dailyStats[today] = { reviews: 0, correct: 0, goalReached: false };
    s.dailyStats[today].reviews++;

    let goalJustReached = false;
    if (isCorrect) {
      s.dailyStats[today].correct++;
      s.dailyCorrect++;
      if (s.dailyCorrect >= state.settings.dailyGoal && !s.goalReached) {
        s.goalReached = true;
        s.dailyStats[today].goalReached = true;
        const yesterday = Utils.dateKey(Utils.addDays(new Date(), -1));
        if (s.lastGoalDate === yesterday) s.streak++;
        else if (s.lastGoalDate !== today) s.streak = 1;
        s.bestStreak = Math.max(s.bestStreak || 0, s.streak);
        s.lastGoalDate = today;
        goalJustReached = true;
      }
    }
    await this.saveStats();
    return goalJustReached;
  },

  // Tageswechsel prüfen (Tageszähler zurücksetzen, Streak ggf. beenden)
  checkDay() {
    const s = state.stats;
    const today = Utils.dateKey();
    const yesterday = Utils.dateKey(Utils.addDays(new Date(), -1));
    if (s.lastStudyDate && s.lastStudyDate !== today) {
      s.dailyCorrect = 0;
      s.goalReached = false;
      s.lastStudyDate = today;
    }
    if (s.lastGoalDate && s.lastGoalDate !== today && s.lastGoalDate !== yesterday) {
      s.streak = 0;
    }
    const cutoff = Utils.dateKey(Utils.addDays(new Date(), -120));
    for (const date of Object.keys(s.dailyStats || {})) {
      if (date < cutoff) delete s.dailyStats[date];
    }
  },

  // ---------- Abfragen ----------

  // Wörter der gewählten Klassenstufe (eigene Wörter ohne Niveau sind immer dabei)
  inLevel(v) {
    const max = LEVELS[state.settings.gradeLevel];
    if (!max || !v.level) return true;
    return (LEVELS[v.level] || 99) <= max;
  },

  visible() {
    if (!LEVELS[state.settings.gradeLevel]) return state.vocabulary;
    return state.vocabulary.filter(v => this.inLevel(v));
  },

  getPool() {
    const words = this.visible();
    if (state.selectedWords.size === 0) return words;
    const pool = words.filter(v => state.selectedWords.has(v.id));
    return pool;
  },

  isDue(vocab, endOfDay = Utils.endOfToday()) {
    const p = state.progress[vocab.id];
    return !!(p && p.nextReview && new Date(p.nextReview) <= endOfDay);
  },

  isProblem(vocab) {
    const p = state.progress[vocab.id];
    return !!(p && (p.incorrectCount > p.correctCount || (p.level === 0 && p.incorrectCount > 0)));
  },

  getDueCards(pool = this.getPool()) {
    const end = Utils.endOfToday();
    return pool
      .filter(v => this.isDue(v, end))
      .sort((a, b) => new Date(state.progress[a.id].nextReview) - new Date(state.progress[b.id].nextReview));
  },

  getNewCards(pool = this.getPool()) {
    return pool.filter(v => !state.progress[v.id]);
  },

  getErrorCards(pool = this.getPool()) {
    const rate = (v) => {
      const p = state.progress[v.id];
      return p.incorrectCount / Math.max(1, p.correctCount + p.incorrectCount);
    };
    return pool.filter(v => this.isProblem(v)).sort((a, b) => rate(b) - rate(a));
  },

  getCategories() {
    const map = new Map();
    for (const v of this.visible()) {
      const name = v.category || CONFIG.CUSTOM_CATEGORY;
      if (!map.has(name)) map.set(name, { name, total: 0, selected: 0, learned: 0, mastered: 0, due: 0 });
      const c = map.get(name);
      c.total++;
      if (state.selectedWords.has(v.id)) c.selected++;
      const p = state.progress[v.id];
      if (p) {
        c.learned++;
        if (p.level >= CONFIG.MASTERED_LEVEL) c.mastered++;
      }
    }
    const order = (name) => (this.categoryOrder.has(name) ? this.categoryOrder.get(name) : -1);
    return [...map.values()].sort((a, b) => order(a.name) - order(b.name) || a.name.localeCompare(b.name, 'de'));
  },

  // ---------- Import / Export ----------

  exportData() {
    const data = {
      app: 'Vokabel Master+',
      version: CONFIG.version,
      exportedAt: new Date().toISOString(),
      vocabulary: state.vocabulary,
      progress: Object.values(state.progress),
      selection: [...state.selectedWords],
      settings: state.settings,
      stats: state.stats
    };
    Utils.download(`vokabel-master-backup-${Utils.dateKey()}.json`, JSON.stringify(data, null, 2), 'application/json');
  },

  async importJSON(file) {
    const data = JSON.parse(await Utils.readFile(file));
    if (!data || typeof data !== 'object') throw new Error('Ungültiges Format');
    const vocabulary = Array.isArray(data.vocabulary) ? data.vocabulary : [];
    const progress = Array.isArray(data.progress) ? data.progress : [];
    if (!vocabulary.length) throw new Error('Keine Vokabeln in der Datei gefunden');

    let importedVocab = 0;
    let skippedVocab = 0;
    let importedProgress = 0;
    const idMap = new Map();
    const seenIds = new Set();

    for (const raw of vocabulary) {
      const vocab = this.sanitizeVocabularyEntry(raw);
      if (!vocab) { skippedVocab++; continue; }
      const originalId = vocab.id;
      if (vocab.id) {
        if (seenIds.has(vocab.id)) vocab.id = undefined;
        else seenIds.add(vocab.id);
        if (vocab.id) {
          const existing = state.vocabulary.find(v => v.id === vocab.id);
          const sameWord = existing &&
            existing.native.toLowerCase().trim() === vocab.native.toLowerCase().trim() &&
            existing.foreign.toLowerCase().trim() === vocab.foreign.toLowerCase().trim();
          if (existing && !sameWord) vocab.id = undefined;
        }
      }
      const isNewId = vocab.id && !state.vocabulary.some(v => v.id === vocab.id);
      const saved = await this.saveVocab(vocab);
      if (isNewId && !state.selectedWords.has(saved.id)) {
        state.selectedWords.add(saved.id);
        await DB.put(CONFIG.STORE_SELECTION, { vocabId: saved.id });
      }
      importedVocab++;
      if (originalId) idMap.set(originalId, saved.id);
    }

    const allowed = new Set(state.vocabulary.map(v => v.id));
    const progressItems = [];
    for (const raw of progress) {
      const mapped = { ...raw };
      if (typeof mapped.vocabId === 'string' && idMap.has(mapped.vocabId)) mapped.vocabId = idMap.get(mapped.vocabId);
      const prog = this.sanitizeProgressEntry(mapped, allowed);
      if (!prog) continue;
      progressItems.push(prog);
      state.progress[prog.vocabId] = prog;
      importedProgress++;
    }
    await DB.putMany(CONFIG.STORE_PROGRESS, progressItems);
    this.sortVocabulary();
    return { importedVocab, skippedVocab, importedProgress };
  },

  async importCSV(file) {
    const text = await Utils.readFile(file);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Datei ist leer');
    const delimiter = (lines[0].split(';').length >= 2) ? ';' : (lines[0].includes('\t') ? '\t' : ',');
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && /^"?native"?\s*[;,\t]/i.test(line)) continue;
      const { values: parts, inQuotes } = this.parseCSVLine(line, delimiter);
      if (inQuotes || parts.length < 2) { skipped++; continue; }
      const vocab = parts.length === 5
        ? { native: parts[0], foreign: parts[1], example: parts[2], category: parts[3], difficulty: parts[4] }
        : { native: parts[0], foreign: parts[1], example: parts[2], exampleDe: parts[3], category: parts[4], difficulty: parts[5], note: parts[6] };
      const sanitized = this.sanitizeVocabularyEntry(vocab);
      if (!sanitized) { skipped++; continue; }
      await this.saveVocab(sanitized);
      imported++;
    }
    this.sortVocabulary();
    return { imported, skipped };
  },

  downloadCSVTemplate() {
    const csv = 'native;foreign;example;exampleDe;category;difficulty\n' +
      'das Haus;house;The house is big.;Das Haus ist groß.;Eigene Wörter;1\n';
    Utils.download('vokabel-vorlage.csv', '﻿' + csv, 'text/csv;charset=utf-8');
  },

  async resetProgress() {
    await DB.clear(CONFIG.STORE_PROGRESS);
    await DB.clear(CONFIG.STORE_STATS);
    state.progress = {};
    state.stats = defaultStats();
  },

  async resetAll() {
    await DB.clear(CONFIG.STORE_VOCAB);
    await DB.clear(CONFIG.STORE_PROGRESS);
    await DB.clear(CONFIG.STORE_STATS);
    await DB.clear(CONFIG.STORE_SELECTION);
    state.vocabulary = [];
    state.progress = {};
    state.selectedWords = new Set();
    state.stats = defaultStats();
    await this.seedPresetVocabulary();
  },

  countCustomWords() {
    return state.vocabulary.filter(v => !this.presetOrder.has(`${v.category}|${v.native}`)).length;
  }
};

// ============================================
// ANTWORTPRÜFUNG
// ============================================

const Answer = {
  // Varianten einer Lösung: "clock/watch" -> ["clock/watch", "clock", "watch"]
  variants(correct) {
    const base = String(correct).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = base.split(/\s*[\/;]\s*/).map(p => p.trim()).filter(Boolean);
    return [...new Set([String(correct).trim(), base, ...parts])].filter(Boolean);
  },

  fold(text) {
    return String(text)
      .normalize('NFC')
      .toLowerCase()
      .replace(/[’`´]/g, "'")
      .replace(/\([^)]*\)/g, ' ')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9À-ɏ' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^(der|die|das|den|dem|ein|eine|the|a|an|to) /, '');
  },

  distance(a, b) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 2) return 3;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let last = prev[0];
      prev[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = prev[j];
        prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
        last = tmp;
      }
    }
    return prev[b.length];
  },

  // Ergebnis: 'correct' | 'typo' | 'wrong'
  check(given, correct) {
    const input = String(given || '').trim();
    if (!input) return 'wrong';
    const variants = this.variants(correct);
    if (!state.settings.tolerantMode) {
      const g = input.replace(/\s+/g, ' ');
      return variants.some(v => v === g) ? 'correct' : 'wrong';
    }
    const g = this.fold(input);
    if (!g) return 'wrong';
    if (variants.some(v => this.fold(v) === g)) return 'correct';
    const close = variants.some(v => {
      const t = this.fold(v);
      return t.length >= 5 && this.distance(g, t) <= 1;
    });
    return close ? 'typo' : 'wrong';
  },

  // Erste Variante für die Anzeige in der Auswahl ("plane / airplane" -> "plane"),
  // damit die richtige Antwort nicht an Schrägstrichen erkennbar ist
  primary(text) {
    return String(text || '').split(/\s+\/\s+/)[0].trim();
  },

  // Kernwort zum Hervorheben im Beispielsatz (ohne Artikel/„to“)
  core(text) {
    return String(text || '')
      .replace(/\([^)]*\)/g, '')
      .split('/')[0]
      .trim()
      .replace(/^(der|die|das|the|a|an|to)\s+/i, '');
  }
};

// ============================================
// AUDIO & HAPTIK
// ============================================

const Speech = {
  voices: [],

  init() {
    if (!this.available()) return;
    const load = () => { this.voices = window.speechSynthesis.getVoices() || []; };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
  },

  available() {
    return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
  },

  enabled() {
    return this.available() && state.settings.speechEnabled;
  },

  pickVoice(lang) {
    const l = (lang || '').toLowerCase();
    const exact = this.voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-') === l);
    const family = this.voices.filter(v => (v.lang || '').toLowerCase().startsWith(l.split('-')[0]));
    const candidates = exact.length ? exact : family;
    const premium = /(google|natural|enhanced|premium|neural|siri|samsung)/i;
    return candidates.find(v => premium.test(v.name || '')) || candidates[0] || null;
  },

  speak(text, lang, rate = 0.95) {
    if (!this.enabled() || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const clean = String(text).replace(/\([^)]*\)/g, '').replace(/\s*\/\s*/g, ', ').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;
    u.rate = rate;
    const voice = this.pickVoice(lang);
    if (voice) u.voice = voice;
    synth.speak(u);
  }
};

const Feedback = {
  ctx: null,

  play(kind) {
    if (state.settings.hapticsEnabled && navigator.vibrate) {
      try { navigator.vibrate(kind === 'wrong' ? [25, 40, 25] : 10); } catch (_) { /* ignore */ }
    }
    if (!state.settings.soundEnabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!this.ctx) this.ctx = new Ctx();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume().catch(() => null);
      const notes = kind === 'wrong' ? [[330, 0], [262, 0.09]] : kind === 'goal' ? [[659, 0], [784, 0.08], [988, 0.16]] : [[740, 0], [988, 0.07]];
      notes.forEach(([freq, offset]) => {
        const t = ctx.currentTime + 0.01 + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = kind === 'wrong' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.08, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch (error) {
      console.warn('Sound nicht verfügbar:', error);
    }
  }
};

// ============================================
// ZURÜCK-TASTE (Android) für Overlays & Übung
// ============================================

const BackStack = {
  layers: [],
  skip: 0,

  push(onBack) {
    this.layers.push(onBack);
    history.pushState({ layer: this.layers.length }, '');
  },

  // Overlay wurde per UI geschlossen -> History-Eintrag still entfernen
  pop() {
    if (!this.layers.length) return;
    this.layers.pop();
    this.skip++;
    history.back();
  },

  handle() {
    if (this.skip > 0) { this.skip--; return; }
    const cb = this.layers.pop();
    if (cb) cb();
  }
};

// ============================================
// TOAST
// ============================================

const Toast = {
  show(message, { type = 'info', duration = 3200, actionLabel = '', onAction = null } = {}) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const iconName = type === 'success' ? 'check' : type === 'error' ? 'alert' : type === 'goal' ? 'trophy' : 'info';
    el.innerHTML = `
      <span class="toast-icon">${icon(iconName, 18)}</span>
      <span class="toast-text">${Utils.esc(message)}</span>
      ${actionLabel ? `<button type="button" class="toast-action">${Utils.esc(actionLabel)}</button>` : ''}
    `;
    const remove = () => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 220);
    };
    if (actionLabel && onAction) {
      el.querySelector('.toast-action').addEventListener('click', () => { onAction(); remove(); });
    }
    root.appendChild(el);
    while (root.children.length > 3) root.firstElementChild.remove();
    setTimeout(remove, duration);
  }
};

// ============================================
// SHEET (Dialog / Bottom-Sheet)
// ============================================

const Sheet = {
  current: null,

  open({ title, body = '', actions = [], onOpen = null, onClose = null, size = '' }) {
    if (this.current) this.close({ silent: true });
    const root = document.getElementById('sheet-root');
    const lastFocus = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'sheet-backdrop';
    wrap.innerHTML = `
      <div class="sheet ${size ? `sheet--${size}` : ''}" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet-grip" aria-hidden="true"></div>
        <header class="sheet-header">
          <h2 id="sheet-title">${Utils.esc(title)}</h2>
          <button type="button" class="icon-btn" data-sheet-close aria-label="Schließen">${icon('x', 20)}</button>
        </header>
        <div class="sheet-body">${body}</div>
        ${actions.length ? `<footer class="sheet-footer">${actions.map((a, i) => `
          <button type="button" class="btn ${a.variant ? `btn--${a.variant}` : 'btn--secondary'} ${a.icon ? 'btn--icon' : ''}" data-sheet-action="${i}" ${a.icon ? `aria-label="${Utils.esc(a.label)}" title="${Utils.esc(a.label)}"` : ''}>${a.icon ? icon(a.icon, 20) : Utils.esc(a.label)}</button>
        `).join('')}</footer>` : ''}
      </div>`;
    root.appendChild(wrap);
    document.body.classList.add('has-sheet');
    requestAnimationFrame(() => wrap.classList.add('is-open'));

    const sheet = wrap.querySelector('.sheet');
    this.current = { wrap, sheet, onClose, lastFocus };

    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-sheet-close]')) this.close();
      const actionBtn = e.target.closest('[data-sheet-action]');
      if (actionBtn) {
        const action = actions[Number(actionBtn.dataset.sheetAction)];
        if (action && action.onClick) action.onClick(sheet);
        else this.close();
      }
    });

    BackStack.push(() => this.close({ fromBack: true }));
    if (onOpen) onOpen(sheet);
    const focusTarget = sheet.querySelector('[autofocus]') || sheet.querySelector('.sheet-header .icon-btn');
    if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 60);
    return sheet;
  },

  close({ fromBack = false, silent = false } = {}) {
    const cur = this.current;
    if (!cur) return;
    this.current = null;
    if (!fromBack) BackStack.pop();
    cur.wrap.classList.remove('is-open');
    setTimeout(() => cur.wrap.remove(), silent ? 0 : 220);
    if (!document.querySelector('.sheet-backdrop.is-open')) document.body.classList.remove('has-sheet');
    if (cur.lastFocus && cur.lastFocus.focus && document.contains(cur.lastFocus)) cur.lastFocus.focus({ preventScroll: true });
    if (cur.onClose) cur.onClose();
  },

  confirm({ title, message, confirmLabel = 'OK', cancelLabel = 'Abbrechen', danger = false }) {
    return new Promise((resolve) => {
      let answered = false;
      this.open({
        title,
        size: 'small',
        body: `<p class="sheet-text">${message}</p>`,
        actions: [
          { label: cancelLabel, variant: 'secondary', onClick: () => { answered = true; this.close(); resolve(false); } },
          { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: () => { answered = true; this.close(); resolve(true); } }
        ],
        onClose: () => { if (!answered) resolve(false); }
      });
    });
  }
};

// ============================================
// NAVIGATION
// ============================================

const Views = {
  tabs: ['home', 'words', 'stats', 'settings'],

  show(tab, { scroll = true } = {}) {
    if (!this.tabs.includes(tab)) tab = 'home';
    state.currentTab = tab;
    document.querySelectorAll('.view[data-tab]').forEach(v => { v.hidden = v.dataset.tab !== tab; });
    document.querySelectorAll('.tab').forEach(t => {
      const active = t.dataset.tab === tab;
      t.classList.toggle('is-active', active);
      if (active) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    this.render(tab);
    if (scroll) window.scrollTo(0, 0);
  },

  render(tab = state.currentTab) {
    switch (tab) {
      case 'home': HomeView.render(); break;
      case 'words': WordsView.render(); break;
      case 'stats': StatsView.render(); break;
      case 'settings': SettingsView.render(); break;
    }
  }
};

// ============================================
// START
// ============================================

const HomeView = {
  greeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Gute Nacht';
    if (h < 11) return 'Guten Morgen';
    if (h < 18) return 'Hallo';
    return 'Guten Abend';
  },

  render() {
    const el = document.getElementById('view-home');
    DataManager.checkDay();
    const s = state.stats;
    const goal = state.settings.dailyGoal;
    const done = s.dailyCorrect || 0;
    const pct = Math.min(done / goal, 1);
    const pool = DataManager.getPool();
    const due = DataManager.getDueCards(pool).length;
    const fresh = DataManager.getNewCards(pool).length;
    const errors = DataManager.getErrorCards(pool).length;
    const mode = MODES[state.settings.lastMode] ? state.settings.lastMode : 'flashcard';
    const plan = Session.planSmart();
    const categories = DataManager.getCategories();
    const selectedTopics = categories.filter(c => c.selected > 0).length;
    const dateText = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    const circumference = 2 * Math.PI * 42;
    const showInstall = state.deferredPrompt && !localStorage.getItem('vm-install-dismissed');

    let planText = 'Keine Wörter verfügbar';
    if (plan.due || plan.fresh) {
      const parts = [];
      if (plan.due) parts.push(Utils.plural(plan.due, 'Wiederholung', 'Wiederholungen'));
      if (plan.fresh) parts.push(Utils.plural(plan.fresh, 'neues Wort', 'neue Wörter'));
      planText = parts.join(' + ');
    } else if (plan.total) {
      planText = `${Utils.plural(plan.total, 'Wort', 'Wörter')} zum Festigen`;
    }

    el.innerHTML = `
      <header class="page-header">
        <div>
          <p class="eyebrow">${Utils.esc(dateText)}</p>
          <h1 class="page-title">${this.greeting()}!</h1>
        </div>
        <div class="streak-pill ${s.streak > 0 ? 'is-active' : ''}" title="Tage in Folge mit erreichtem Tagesziel">
          ${icon('flame', 18)}<span>${s.streak || 0}</span>
          <span class="sr-only">Tage in Folge</span>
        </div>
      </header>

      <section class="hero card">
        <div class="hero-ring" role="img" aria-label="Tagesziel: ${done} von ${goal}">
          <svg viewBox="0 0 100 100">
            <circle class="ring-track" cx="50" cy="50" r="42"/>
            <circle class="ring-value ${s.goalReached ? 'is-done' : ''}" cx="50" cy="50" r="42"
              stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${(circumference * (1 - pct)).toFixed(1)}"/>
          </svg>
          <div class="hero-ring-label">
            ${s.goalReached ? icon('check', 28, 'text-success') : `<strong>${done}</strong><span>von ${goal}</span>`}
          </div>
        </div>
        <div class="hero-text">
          <h2>${s.goalReached ? 'Tagesziel geschafft!' : 'Tagesziel'}</h2>
          <p>${s.goalReached
            ? 'Stark! Jede weitere Runde festigt dein Wissen.'
            : `Noch ${Utils.plural(goal - done, 'richtige Antwort', 'richtige Antworten')} bis zum Ziel.`}</p>
        </div>
      </section>

      <button type="button" class="cta" data-action="start-smart" ${plan.total ? '' : 'disabled'}>
        <span class="cta-icon">${icon('sparkles', 24)}</span>
        <span class="cta-text">
          <span class="cta-title">Jetzt lernen</span>
          <span class="cta-sub">${Utils.esc(planText)} · ${MODES[mode].label}</span>
        </span>
        <span class="cta-arrow">${icon('arrowRight', 22)}</span>
      </button>

      <section class="section">
        <h2 class="section-title">Übungsart</h2>
        <div class="mode-grid" role="radiogroup" aria-label="Übungsart">
          ${Object.entries(MODES).map(([key, m]) => {
            const disabled = key === 'dictation' && !Speech.enabled();
            return `
            <button type="button" class="mode-tile ${mode === key ? 'is-selected' : ''}" role="radio"
              aria-checked="${mode === key}" data-action="set-mode" data-mode="${key}" ${disabled ? 'disabled' : ''}>
              <span class="mode-icon">${icon(m.icon, 22)}</span>
              <span class="mode-label">${m.label}</span>
              <span class="mode-desc">${disabled ? 'Sprachausgabe aus' : m.desc}</span>
            </button>`;
          }).join('')}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Gezielt üben</h2>
        <div class="list card">
          ${this.sourceRow('due', 'clock', 'Fällige Wiederholungen', 'Was heute dran ist', due, 'primary')}
          ${this.sourceRow('new', 'plus', 'Neue Wörter', 'Noch nie geübt', fresh, 'info')}
          ${this.sourceRow('errors', 'target', 'Fehler wiederholen', 'Deine schwierigen Wörter', errors, 'danger')}
          ${this.sourceRow('all', 'shuffle', 'Zufallsmix', 'Aus allen gewählten Wörtern', pool.length, 'neutral')}
        </div>
      </section>

      <button type="button" class="topic-summary card" data-action="tab" data-tab="words">
        <span class="topic-summary-icon">${icon('book', 20)}</span>
        <span class="topic-summary-text">
          <strong>${state.selectedWords.size === 0 ? 'Alle Themen' : Utils.plural(selectedTopics, 'Thema', 'Themen')} ausgewählt</strong>
          <span>${Utils.esc(gradeLabel())} · ${Utils.plural(pool.length, 'Wort', 'Wörter')} im Training</span>
        </span>
        ${icon('chevronRight', 20, 'muted')}
      </button>

      ${showInstall ? `
        <div class="install-banner card">
          <span class="install-icon">${icon('smartphone', 22)}</span>
          <div class="install-text">
            <strong>Als App installieren</strong>
            <span>Schneller Start, funktioniert offline.</span>
          </div>
          <button type="button" class="btn btn--primary btn--sm" data-action="install">Installieren</button>
          <button type="button" class="icon-btn" data-action="install-dismiss" aria-label="Ausblenden">${icon('x', 18)}</button>
        </div>` : ''}
    `;
  },

  sourceRow(source, iconName, title, sub, count, tone) {
    return `
      <button type="button" class="row" data-action="start-source" data-source="${source}" ${count ? '' : 'disabled'}>
        <span class="row-icon tone-${tone}">${icon(iconName, 20)}</span>
        <span class="row-text">
          <span class="row-title">${title}</span>
          <span class="row-sub">${sub}</span>
        </span>
        <span class="count-badge ${count ? `tone-${tone}` : ''}">${Utils.num(count)}</span>
      </button>`;
  }
};

// ============================================
// ÜBUNG
// ============================================

const Session = {
  s: null,

  // Mischung für "Jetzt lernen": erst fällige, dann neue Wörter
  planSmart() {
    const limit = state.settings.cardsPerSession;
    const pool = DataManager.getPool();
    const due = DataManager.getDueCards(pool);
    const fresh = DataManager.getNewCards(pool);
    const takeDue = Math.min(due.length, limit);
    const takeNew = Math.min(fresh.length, limit - takeDue);
    if (takeDue + takeNew > 0) {
      return { cards: [...due.slice(0, takeDue), ...fresh.slice(0, takeNew)], due: takeDue, fresh: takeNew, total: takeDue + takeNew };
    }
    const errors = DataManager.getErrorCards(pool);
    const fallback = errors.length ? errors : Utils.shuffle(pool);
    const cards = fallback.slice(0, limit);
    return { cards, due: 0, fresh: 0, total: cards.length };
  },

  cardsFor(source, extra = {}) {
    const limit = state.settings.cardsPerSession;
    const pool = DataManager.getPool();
    switch (source) {
      case 'smart': return this.planSmart().cards;
      case 'due': return DataManager.getDueCards(pool).slice(0, limit);
      case 'new': return DataManager.getNewCards(pool).slice(0, limit);
      case 'errors': return DataManager.getErrorCards(pool).slice(0, limit);
      case 'all': return Utils.shuffle(pool).slice(0, limit);
      case 'category': {
        const words = DataManager.visible().filter(v => v.category === extra.category);
        const due = DataManager.getDueCards(words);
        const fresh = DataManager.getNewCards(words);
        const rest = Utils.shuffle(words.filter(v => !due.includes(v) && !fresh.includes(v)))
          .sort((a, b) => (state.progress[a.id]?.level || 0) - (state.progress[b.id]?.level || 0));
        return [...due, ...fresh, ...rest].slice(0, limit);
      }
      case 'ids': {
        const set = new Set(extra.ids || []);
        return state.vocabulary.filter(v => set.has(v.id));
      }
      default: return [];
    }
  },

  start(source, extra = {}) {
    let mode = MODES[state.settings.lastMode] ? state.settings.lastMode : 'flashcard';
    if (mode === 'dictation' && !Speech.enabled()) mode = 'typing';
    const cards = this.cardsFor(source, extra);
    if (!cards.length) {
      Toast.show('Hier gibt es gerade nichts zu üben.', { type: 'info' });
      return;
    }
    const dirSetting = state.settings.practiceDirection;
    const items = Utils.shuffle(cards).map(card => ({
      card,
      dir: dirSetting === 'mixed' ? (Math.random() < 0.5 ? 'de-en' : 'en-de') : (dirSetting === 'en-de' ? 'en-de' : 'de-en'),
      retry: false
    }));

    if (cards[0].category) {
      state.stats.lastCategory = cards[0].category;
      DataManager.saveStats();
    }

    const wasActive = !!this.s;
    this.s = {
      source, extra, mode, items,
      total: cards.length,
      pos: 0,
      first: new Map(),
      requeued: new Set(),
      phase: 'question',
      pending: null,
      busy: false,
      flipped: false,
      timer: null,
      goalReached: false
    };
    document.body.classList.add('in-session');
    document.getElementById('view-session').hidden = false;
    document.querySelectorAll('.view[data-tab]').forEach(v => { v.hidden = true; });
    if (!wasActive) BackStack.push(() => this.onBack());
    window.scrollTo(0, 0);
    this.render();
  },

  onBack() {
    if (!this.s) return;
    // Zurück-Taste: Ebene sofort wieder anlegen und nachfragen
    BackStack.push(() => this.onBack());
    this.requestExit();
  },

  async requestExit() {
    const s = this.s;
    if (!s) return;
    if (s.phase === 'results' || (s.pos === 0 && s.phase === 'question')) {
      this.exit();
      return;
    }
    const ok = await Sheet.confirm({
      title: 'Runde beenden?',
      message: 'Deine bisherigen Antworten sind gespeichert.',
      confirmLabel: 'Beenden',
      cancelLabel: 'Weiterlernen'
    });
    if (ok) {
      if (this.s && this.s.phase === 'feedback') await this.commit();
      this.exit();
    }
  },

  exit() {
    if (!this.s) return;
    clearTimeout(this.s.timer);
    this.s = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    BackStack.pop();
    document.body.classList.remove('in-session');
    const view = document.getElementById('view-session');
    view.hidden = true;
    view.innerHTML = '';
    Views.show(state.currentTab);
  },

  item() {
    return this.s.items[this.s.pos];
  },

  qa(item) {
    const { card, dir } = item;
    const deEn = dir === 'de-en';
    return {
      // Als Frage nur die erste Variante zeigen, damit keine Alternative die Lösung verrät
      question: deEn ? card.native : Answer.primary(card.foreign),
      answer: deEn ? card.foreign : card.native,
      qLang: deEn ? state.settings.nativeLang : state.settings.speechLang,
      aLang: deEn ? state.settings.speechLang : state.settings.nativeLang,
      qLabel: deEn ? 'Deutsch' : 'Englisch',
      aLabel: deEn ? 'Englisch' : 'Deutsch',
      foreignIsQuestion: !deEn
    };
  },

  render() {
    const s = this.s;
    const view = document.getElementById('view-session');
    if (s.phase === 'results') {
      view.innerHTML = this.renderResults();
      return;
    }
    const item = this.item();
    const progress = (s.pos / s.items.length) * 100;
    s.phase = 'question';
    s.pending = null;
    s.flipped = false;
    s.hintLevel = 0;

    let body = '';
    switch (s.mode) {
      case 'flashcard': body = this.renderFlashcard(item); break;
      case 'mc': body = this.renderMC(item); break;
      case 'typing': body = this.renderTyping(item, false); break;
      case 'dictation': body = this.renderTyping(item, true); break;
    }

    view.innerHTML = `
      <div class="session">
        <header class="session-top">
          <button type="button" class="icon-btn" data-action="session-close" aria-label="Runde beenden">${icon('x', 22)}</button>
          <div class="session-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${s.items.length}" aria-valuenow="${s.pos}">
            <div class="session-progress-fill" style="width:${progress}%"></div>
          </div>
          <span class="session-count">${Math.min(s.pos + 1, s.items.length)}/${s.items.length}</span>
        </header>
        <div class="session-body" id="session-body">
          ${item.retry ? `<div class="retry-chip">${icon('rotate', 14)} Noch einmal</div>` : ''}
          ${body}
        </div>
      </div>
    `;

    if (s.mode === 'typing' || s.mode === 'dictation') {
      const input = document.getElementById('answer-input');
      if (input) setTimeout(() => input.focus({ preventScroll: true }), 30);
    }
    if (s.mode === 'dictation') {
      setTimeout(() => this.speakAnswer(item), 350);
    }
    if (s.mode === 'mc' && this.qa(item).foreignIsQuestion) {
      setTimeout(() => Speech.speak(item.card.foreign, state.settings.speechLang), 250);
    }
  },

  speakBtn(text, lang, label = 'Anhören') {
    if (!Speech.enabled()) return '';
    return `<button type="button" class="speak-btn" data-action="speak" data-text="${Utils.esc(text)}" data-lang="${Utils.esc(lang)}" aria-label="${label}">${icon('volume', 20)}</button>`;
  },

  highlight(text, term) {
    const escaped = Utils.esc(text);
    const core = Answer.core(term);
    if (!core || core.length < 2) return escaped;
    const pattern = Utils.esc(core).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return escaped.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
    } catch (_) {
      return escaped;
    }
  },

  exampleBlock(item) {
    const { card, dir } = item;
    const qa = this.qa(item);
    const main = dir === 'de-en' ? card.example : card.exampleDe;
    const translation = dir === 'de-en' ? card.exampleDe : card.example;
    if (!main && !translation) return '';
    const first = main || translation;
    const second = main ? translation : '';
    return `
      <div class="example">
        <p class="example-main">${this.highlight(first, main ? qa.answer : qa.question)}</p>
        ${second ? `<p class="example-sub">${this.highlight(second, qa.question)}</p>` : ''}
      </div>`;
  },

  hint(card) {
    return state.settings.showHints && card.category
      ? `<span class="q-hint">${topicAvatar(card.category, 'sm')}${Utils.esc(card.category)}</span>` : '';
  },

  // ---------- Karteikarten ----------

  renderFlashcard(item) {
    const qa = this.qa(item);
    const card = item.card;
    return `
      <div class="flip" id="flip" data-action="flip" role="button" tabindex="0" aria-label="Karte umdrehen">
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <span class="q-label">${qa.qLabel}</span>
            <div class="q-word" lang="${qa.qLang}">${Utils.esc(qa.question)}</div>
            ${qa.foreignIsQuestion ? this.speakBtn(card.foreign, state.settings.speechLang) : ''}
            ${this.hint(card)}
            <span class="flip-tip">${icon('rotate', 16)} Tippen zum Umdrehen</span>
          </div>
          <div class="flip-face flip-back" aria-hidden="true">
            <span class="q-label">${qa.aLabel}</span>
            <div class="q-word q-word--answer" lang="${qa.aLang}">${Utils.esc(qa.answer)}</div>
            ${this.speakBtn(card.foreign, state.settings.speechLang)}
            <div class="q-sub">${Utils.esc(qa.question)}</div>
            ${this.exampleBlock(item)}
            ${card.note ? `<p class="note">${icon('lightbulb', 16)} ${Utils.esc(card.note)}</p>` : ''}
          </div>
        </div>
      </div>
      <div class="session-actions" id="session-actions">
        <button type="button" class="btn btn--primary btn--lg btn--block" data-action="flip">Aufdecken</button>
      </div>
      <p class="kbd-hint">Leertaste: umdrehen · 1: nochmal · 2: gewusst</p>
    `;
  },

  flip() {
    const s = this.s;
    if (!s || s.mode !== 'flashcard' || s.phase !== 'question') return;
    const flipEl = document.getElementById('flip');
    s.flipped = !s.flipped;
    flipEl.classList.toggle('is-flipped', s.flipped);
    flipEl.querySelector('.flip-front').setAttribute('aria-hidden', String(s.flipped));
    flipEl.querySelector('.flip-back').setAttribute('aria-hidden', String(!s.flipped));
    const actions = document.getElementById('session-actions');
    if (s.flipped && !actions.dataset.rated) {
      actions.dataset.rated = '1';
      actions.innerHTML = `
        <button type="button" class="btn btn--again btn--lg" data-action="rate" data-correct="0">${icon('rotate', 20)} Nochmal</button>
        <button type="button" class="btn btn--good btn--lg" data-action="rate" data-correct="1">${icon('check', 20)} Gewusst</button>
      `;
      if (state.settings.speechEnabled && !this.qa(this.item()).foreignIsQuestion) {
        Speech.speak(this.item().card.foreign, state.settings.speechLang);
      }
    }
  },

  async rate(correct) {
    const s = this.s;
    if (!s || s.busy || s.mode !== 'flashcard' || !s.flipped) return;
    s.pending = correct;
    Feedback.play(correct ? 'correct' : 'wrong');
    await this.next();
  },

  // ---------- Multiple Choice ----------

  distractors(item) {
    const qa = this.qa(item);
    const answerField = item.dir === 'de-en' ? 'foreign' : 'native';
    // Alle Schreibweisen, die für diese Karte richtig wären
    const correctKeys = new Set(Answer.variants(qa.answer).map(v => Answer.fold(v)).filter(Boolean));
    // Andere Karten mit derselben Bedeutung (z. B. doppelte Wörter in zwei Themen)
    const questionKey = Answer.fold(Answer.primary(qa.question));
    const questionField = item.dir === 'de-en' ? 'native' : 'foreign';
    const shape = (t) => (/^to\s/i.test(t) ? 'verb' : /^(der|die|das)\s/i.test(t) ? 'noun' : /\s/.test(t.trim()) ? 'phrase' : 'word');
    const targetShape = shape(qa.answer);
    const seen = new Set();
    const scored = [];
    for (const v of state.vocabulary) {
      if (v.id === item.card.id) continue;
      if (Answer.fold(Answer.primary(v[questionField])) === questionKey) continue;
      const text = v[answerField];
      const shown = Answer.primary(text);
      const key = Answer.fold(shown);
      if (!key || seen.has(key)) continue;
      // Nie eine Option anbieten, die ebenfalls richtig wäre
      if (Answer.variants(text).some(x => correctKeys.has(Answer.fold(x)))) continue;
      seen.add(key);
      let score = Math.random();
      if (v.category === item.card.category) score += 2;
      if (shape(text) === targetShape) score += 1;
      scored.push({ text, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, CONFIG.MC_OPTIONS - 1).map(x => x.text);
  },

  renderMC(item) {
    const qa = this.qa(item);
    const options = Utils.shuffle([qa.answer, ...this.distractors(item)].map(o => Answer.primary(o)));
    this.s.mcOptions = options;
    return `
      <div class="q-card">
        <span class="q-label">Was heißt …</span>
        <div class="q-word" lang="${qa.qLang}">${Utils.esc(qa.question)}</div>
        ${qa.foreignIsQuestion ? this.speakBtn(item.card.foreign, state.settings.speechLang) : ''}
        ${this.hint(item.card)}
      </div>
      <div class="mc-options" role="group" aria-label="Antwortmöglichkeiten">
        ${options.map((opt, i) => `
          <button type="button" class="mc-option" data-action="mc-pick" data-index="${i}" lang="${qa.aLang}">
            <span class="mc-key" aria-hidden="true">${i + 1}</span>
            <span class="mc-text">${Utils.esc(opt)}</span>
          </button>`).join('')}
      </div>
      <div class="session-actions" id="session-actions"></div>
    `;
  },

  pickMC(index) {
    const s = this.s;
    if (!s || s.mode !== 'mc' || s.phase !== 'question') return;
    const item = this.item();
    const qa = this.qa(item);
    const chosen = s.mcOptions[index];
    if (chosen === undefined) return;
    const correct = Answer.fold(chosen) === Answer.fold(Answer.primary(qa.answer));
    s.phase = 'feedback';
    s.pending = correct;
    document.querySelectorAll('.mc-option').forEach((btn, i) => {
      btn.disabled = true;
      const isAnswer = Answer.fold(s.mcOptions[i]) === Answer.fold(Answer.primary(qa.answer));
      if (isAnswer) btn.classList.add('is-correct');
      else if (i === index) btn.classList.add('is-wrong');
      else btn.classList.add('is-dim');
    });
    Feedback.play(correct ? 'correct' : 'wrong');
    if (correct) {
      s.timer = setTimeout(() => this.next(), 750);
    } else {
      document.getElementById('session-actions').innerHTML = this.feedbackPanel('wrong', qa, item) + this.nextButton();
      this.focusNext();
    }
  },

  // ---------- Schreiben & Diktat ----------

  renderTyping(item, dictation) {
    const qa = this.qa(item);
    const card = item.card;
    const lang = dictation ? state.settings.speechLang : qa.aLang;
    const placeholder = dictation ? 'Was hörst du?' : (qa.aLabel === 'Englisch' ? 'Auf Englisch …' : 'Auf Deutsch …');
    const top = dictation ? `
      <div class="q-card q-card--dictation">
        <span class="q-label">Hör genau hin</span>
        <div class="dictation-buttons">
          <button type="button" class="speak-big" data-action="speak-answer" aria-label="Wort anhören">${icon('volume', 34)}</button>
          <button type="button" class="speak-slow" data-action="speak-answer" data-slow="1" aria-label="Langsam anhören">${icon('turtle', 22)}<span>Langsam</span></button>
        </div>
        ${this.hint(card)}
      </div>` : `
      <div class="q-card">
        <span class="q-label">Übersetze</span>
        <div class="q-word" lang="${qa.qLang}">${Utils.esc(qa.question)}</div>
        ${qa.foreignIsQuestion ? this.speakBtn(card.foreign, state.settings.speechLang) : ''}
        ${this.hint(card)}
      </div>`;
    return `
      ${top}
      <form class="answer-form" data-submit="answer" autocomplete="off">
        <label class="sr-only" for="answer-input">Deine Antwort</label>
        <input id="answer-input" class="answer-input" type="text" lang="${lang}" placeholder="${placeholder}"
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">
        <div class="answer-tools">
          <button type="button" class="btn btn--ghost btn--sm" data-action="hint">${icon('lightbulb', 18)} Tipp</button>
          <span class="hint-text" id="hint-text" aria-live="polite"></span>
        </div>
        <div class="session-actions" id="session-actions">
          <button type="submit" class="btn btn--primary btn--lg btn--block">Prüfen</button>
        </div>
      </form>
    `;
  },

  speakAnswer(item, slow = false) {
    Speech.speak(item.card.foreign, state.settings.speechLang, slow ? 0.6 : 0.9);
  },

  expectedAnswer(item) {
    return this.s.mode === 'dictation' ? item.card.foreign : this.qa(item).answer;
  },

  showHint() {
    const s = this.s;
    if (!s || s.phase !== 'question') return;
    const item = this.item();
    const answer = Answer.variants(this.expectedAnswer(item))[1] || this.expectedAnswer(item);
    s.hintLevel = (s.hintLevel || 0) + 1;
    const shown = answer.slice(0, Math.min(s.hintLevel, Math.max(1, answer.length - 1)));
    const masked = shown + answer.slice(shown.length).replace(/[^\s]/g, '·');
    const el = document.getElementById('hint-text');
    if (el) el.textContent = masked;
    const input = document.getElementById('answer-input');
    if (input) input.focus({ preventScroll: true });
  },

  submitAnswer() {
    const s = this.s;
    if (!s) return;
    if (s.phase === 'feedback') { this.next(); return; }
    if (s.phase !== 'question') return;
    const input = document.getElementById('answer-input');
    const given = input.value;
    if (!given.trim()) {
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
      return;
    }
    const item = this.item();
    const expected = this.expectedAnswer(item);
    const result = Answer.check(given, expected);
    s.phase = 'feedback';
    s.pending = result !== 'wrong';
    s.hintLevel = 0;
    input.readOnly = true;
    input.classList.add(result === 'wrong' ? 'is-wrong' : 'is-correct');
    Feedback.play(result === 'wrong' ? 'wrong' : 'correct');
    const qa = this.qa(item);
    if (s.mode === 'dictation') qa.answer = expected;
    document.querySelector('.answer-tools').innerHTML = '';
    document.getElementById('session-actions').innerHTML =
      this.feedbackPanel(result, qa, item, given) + this.nextButton(result === 'wrong');
    if (s.mode === 'dictation' || !qa.foreignIsQuestion) Speech.speak(item.card.foreign, state.settings.speechLang);
    // Tastatur offen lassen: Fokus bleibt im Feld, Enter = Weiter
    input.focus({ preventScroll: true });
  },

  feedbackPanel(result, qa, item, given = '') {
    const title = result === 'correct' ? 'Richtig!' : result === 'typo' ? 'Fast richtig!' : 'Leider falsch';
    const iconName = result === 'wrong' ? 'x' : 'check';
    const meaning = this.s.mode === 'dictation' ? `<span class="fb-meaning">${Utils.esc(item.card.native)}</span>` : '';
    return `
      <div class="feedback feedback--${result}" role="status">
        <span class="feedback-icon">${icon(iconName, 20)}</span>
        <div class="feedback-text">
          <strong>${title}</strong>
          ${result === 'correct' && !meaning ? '' : `<span>${result === 'typo' ? 'Richtig geschrieben: ' : result === 'wrong' ? 'Richtig ist: ' : ''}<b lang="${qa.aLang}">${Utils.esc(qa.answer)}</b></span>`}
          ${meaning}
          ${result === 'wrong' && given ? `<span class="fb-given">Deine Antwort: ${Utils.esc(given)}</span>` : ''}
        </div>
      </div>`;
  },

  nextButton(allowOverride = false) {
    return `
      <div class="next-row">
        ${allowOverride && this.s.mode !== 'mc' ? '<button type="button" class="btn btn--ghost" data-action="override">Ich lag richtig</button>' : ''}
        <button type="button" class="btn btn--primary btn--lg next-btn" data-action="next">Weiter ${icon('arrowRight', 20)}</button>
      </div>`;
  },

  focusNext() {
    const btn = document.querySelector('.next-btn');
    if (btn) setTimeout(() => btn.focus({ preventScroll: true }), 30);
  },

  override() {
    const s = this.s;
    if (!s || s.phase !== 'feedback' || s.pending) return;
    s.pending = true;
    this.next();
  },

  // ---------- Ablauf ----------

  async commit() {
    const s = this.s;
    const item = this.item();
    const correct = !!s.pending;
    const id = item.card.id;
    if (!s.first.has(id)) {
      s.first.set(id, correct);
      const goal = await DataManager.saveProgress(id, correct);
      if (goal) {
        s.goalReached = true;
        Feedback.play('goal');
        Toast.show(`Tagesziel erreicht! ${state.stats.streak} ${state.stats.streak === 1 ? 'Tag' : 'Tage'} in Folge.`, { type: 'goal', duration: 4000 });
      }
    }
    if (!correct && !s.requeued.has(id)) {
      s.requeued.add(id);
      s.items.push({ ...item, retry: true });
    }
  },

  async next() {
    const s = this.s;
    if (!s || s.busy) return;
    if (s.mode !== 'flashcard' && s.phase !== 'feedback') return;
    s.busy = true;
    clearTimeout(s.timer);
    try {
      await this.commit();
      s.pos++;
      if (s.pos >= s.items.length) s.phase = 'results';
      this.render();
    } finally {
      if (this.s) this.s.busy = false;
    }
  },

  renderResults() {
    const s = this.s;
    const total = s.first.size;
    const correct = [...s.first.values()].filter(Boolean).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const missed = state.vocabulary.filter(v => s.first.get(v.id) === false);
    let title = 'Nicht aufgeben!';
    if (pct === 100) title = 'Perfekt!';
    else if (pct >= 80) title = 'Sehr gut!';
    else if (pct >= 60) title = 'Gut gemacht!';
    else if (pct >= 40) title = 'Weiter so!';
    const circumference = 2 * Math.PI * 42;
    const goal = state.settings.dailyGoal;

    return `
      <div class="results">
        <div class="results-ring" role="img" aria-label="${pct} Prozent richtig">
          <svg viewBox="0 0 100 100">
            <circle class="ring-track" cx="50" cy="50" r="42"/>
            <circle class="ring-value ${pct >= 60 ? 'is-done' : ''}" cx="50" cy="50" r="42"
              stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${(circumference * (1 - pct / 100)).toFixed(1)}"/>
          </svg>
          <div class="results-ring-label"><strong>${pct}%</strong></div>
        </div>
        <h1 class="results-title">${title}</h1>
        <p class="results-sub">${correct} von ${Utils.plural(total, 'Wort', 'Wörtern')} auf Anhieb gewusst</p>

        <div class="results-chips">
          <span class="chip ${state.stats.goalReached ? 'chip--success' : ''}">${icon('target', 16)} Tagesziel ${Math.min(state.stats.dailyCorrect, goal)}/${goal}</span>
          ${state.stats.streak > 0 ? `<span class="chip chip--flame">${icon('flame', 16)} ${Utils.plural(state.stats.streak, 'Tag', 'Tage')}</span>` : ''}
        </div>

        ${missed.length ? `
          <section class="section results-missed">
            <h2 class="section-title">Das übst du nochmal</h2>
            <div class="list card">
              ${missed.map(v => `
                <div class="row row--static">
                  <span class="row-text">
                    <span class="row-title">${Utils.esc(v.native)}</span>
                    <span class="row-sub" lang="en">${Utils.esc(v.foreign)}</span>
                  </span>
                  ${Speech.enabled() ? `<button type="button" class="icon-btn" data-action="speak" data-text="${Utils.esc(v.foreign)}" data-lang="${Utils.esc(state.settings.speechLang)}" aria-label="Anhören">${icon('volume', 18)}</button>` : ''}
                </div>`).join('')}
            </div>
          </section>` : ''}

        <div class="results-actions">
          ${missed.length ? `<button type="button" class="btn btn--primary btn--lg btn--block" data-action="practice-missed">${icon('target', 20)} Fehler üben (${missed.length})</button>` : ''}
          <button type="button" class="btn ${missed.length ? 'btn--secondary' : 'btn--primary'} btn--lg btn--block" data-action="session-again">${icon('refresh', 20)} Neue Runde</button>
          <button type="button" class="btn btn--ghost btn--block" data-action="session-done">Fertig</button>
        </div>
      </div>
    `;
  },

  onKey(e) {
    const s = this.s;
    if (!s || Sheet.current) return;
    const inInput = e.target && e.target.tagName === 'INPUT';
    if (e.key === 'Escape') { e.preventDefault(); this.requestExit(); return; }
    if (s.phase === 'results') return;

    if (s.mode === 'flashcard') {
      if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('button:not(#flip)')) { e.preventDefault(); this.flip(); }
      else if (s.flipped && (e.key === '1' || e.key === 'ArrowLeft')) this.rate(false);
      else if (s.flipped && (e.key === '2' || e.key === 'ArrowRight')) this.rate(true);
      return;
    }
    if (s.mode === 'mc') {
      if (s.phase === 'question' && /^[1-4]$/.test(e.key)) this.pickMC(Number(e.key) - 1);
      else if (s.phase === 'feedback' && e.key === 'Enter' && !e.target.closest('button')) { e.preventDefault(); this.next(); }
      return;
    }
    if (!inInput && s.phase === 'feedback' && e.key === 'Enter' && !e.target.closest('button')) {
      e.preventDefault();
      this.next();
    }
  }
};

// ============================================
// WÖRTER
// ============================================

const WordsView = {
  topic: null,
  editing: null,
  query: '',
  limit: CONFIG.SEARCH_LIMIT,

  render() {
    const el = document.getElementById('view-words');
    if (this.topic && !DataManager.visible().some(v => v.category === this.topic)) this.topic = null;
    if (this.topic) {
      el.innerHTML = this.renderTopic(this.topic);
    } else {
      el.innerHTML = this.renderOverview();
      this.bindSearch();
      this.renderResults();
    }
  },

  renderOverview() {
    return `
      <header class="page-header">
        <div>
          <p class="eyebrow">${Utils.plural(DataManager.visible().length, 'Wort', 'Wörter')} · ${Utils.esc(gradeLabel())}</p>
          <h1 class="page-title">Wörter</h1>
        </div>
        <button type="button" class="btn btn--primary btn--sm" data-action="word-add">${icon('plus', 18)} Neu</button>
      </header>
      <div class="search">
        ${icon('search', 20, 'search-icon')}
        <input id="word-search" class="search-input" type="search" placeholder="Wort suchen …"
          value="${Utils.esc(this.query)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" aria-label="Wörter durchsuchen">
        <button type="button" class="search-clear icon-btn" data-action="search-clear" aria-label="Suche leeren" ${this.query ? '' : 'hidden'}>${icon('x', 18)}</button>
      </div>
      <div id="words-results"></div>
    `;
  },

  bindSearch() {
    const input = document.getElementById('word-search');
    if (!input) return;
    const update = Utils.debounce(() => {
      this.limit = CONFIG.SEARCH_LIMIT;
      this.renderResults();
    }, 120);
    input.addEventListener('input', () => {
      this.query = input.value;
      document.querySelector('.search-clear').hidden = !this.query;
      update();
    });
  },

  renderResults() {
    const box = document.getElementById('words-results');
    if (!box) return;
    const q = this.query.trim();
    if (!q) {
      box.innerHTML = this.renderTopicList();
      return;
    }
    const fq = Answer.fold(q) || q.toLowerCase();
    const lower = q.toLowerCase();
    const hits = state.vocabulary.filter(v =>
      v.native.toLowerCase().includes(lower) || v.foreign.toLowerCase().includes(lower) ||
      Answer.fold(v.native).includes(fq) || Answer.fold(v.foreign).includes(fq));
    if (!hits.length) {
      box.innerHTML = `
        <div class="empty">
          ${icon('search', 32)}
          <h3>Nichts gefunden</h3>
          <p>Kein Wort passt zu „${Utils.esc(q)}“.</p>
          <button type="button" class="btn btn--secondary" data-action="word-add" data-prefill="${Utils.esc(q)}">${icon('plus', 18)} Als neues Wort anlegen</button>
        </div>`;
      return;
    }
    const shown = hits.slice(0, this.limit);
    box.innerHTML = `
      <p class="list-meta">${Utils.plural(hits.length, 'Treffer', 'Treffer')}</p>
      <div class="list card">${shown.map(v => this.wordRow(v, true)).join('')}</div>
      ${hits.length > shown.length ? `<button type="button" class="btn btn--ghost btn--block" data-action="show-more">Mehr anzeigen (${Utils.num(hits.length - shown.length)})</button>` : ''}
    `;
  },

  renderTopicList() {
    const cats = DataManager.getCategories();
    if (!cats.length) {
      return `
        <div class="empty">
          ${icon('book', 32)}
          <h3>Noch keine Wörter</h3>
          <p>Lege dein erstes eigenes Wort an.</p>
          <button type="button" class="btn btn--primary" data-action="word-add">${icon('plus', 18)} Wort anlegen</button>
        </div>`;
    }
    const shown = DataManager.visible();
    const allSelected = shown.length > 0 && shown.every(v => state.selectedWords.has(v.id));
    return `
      <div class="list-head">
        <h2 class="section-title">Themen</h2>
        <button type="button" class="link-btn" data-action="select-all-topics" data-on="${allSelected ? '0' : '1'}">${allSelected ? 'Alle abwählen' : 'Alle auswählen'}</button>
      </div>
      <p class="list-meta">Häkchen = wird geübt</p>
      <div class="list card">
        ${cats.map(c => this.topicRow(c)).join('')}
      </div>
    `;
  },

  topicRow(c) {
    const stateAttr = c.selected === 0 ? 'false' : c.selected === c.total ? 'true' : 'mixed';
    const pct = c.total ? Math.round((c.mastered / c.total) * 100) : 0;
    const learnedPct = c.total ? Math.round((c.learned / c.total) * 100) : 0;
    return `
      <div class="row topic-row">
        <button type="button" class="check" role="checkbox" aria-checked="${stateAttr}" data-action="topic-toggle"
          data-cat="${Utils.esc(c.name)}" aria-label="${Utils.esc(c.name)} üben">
          ${stateAttr === 'mixed' ? '<span class="check-dash"></span>' : icon('check', 16)}
        </button>
        <button type="button" class="topic-main" data-action="topic-open" data-cat="${Utils.esc(c.name)}">
          ${topicAvatar(c.name)}
          <span class="row-text">
            <span class="row-title">${Utils.esc(c.name)}</span>
            <span class="row-sub">${Utils.plural(c.total, 'Wort', 'Wörter')} · ${learnedPct}% geübt</span>
            <span class="mini-bar" aria-hidden="true"><span style="width:${learnedPct}%"></span><span class="mini-bar-mastered" style="width:${pct}%"></span></span>
          </span>
          ${icon('chevronRight', 20, 'muted')}
        </button>
      </div>`;
  },

  levelDots(vocab) {
    const p = state.progress[vocab.id];
    if (!p) return '<span class="level level--new" title="Neu">Neu</span>';
    const level = p.level + 1;
    const label = p.level >= CONFIG.MASTERED_LEVEL ? 'Gemeistert' : `Stufe ${level} von ${CONFIG.INTERVALS.length}`;
    return `<span class="level" title="${label}" aria-label="${label}">${CONFIG.INTERVALS.map((_, i) =>
      `<i class="${i < level ? 'on' : ''}"></i>`).join('')}</span>`;
  },

  wordRow(v, showCategory = false) {
    const selected = state.selectedWords.has(v.id);
    return `
      <div class="row word-row" data-id="${Utils.esc(v.id)}">
        <button type="button" class="check" role="checkbox" aria-checked="${selected}" data-action="word-toggle"
          data-id="${Utils.esc(v.id)}" aria-label="${Utils.esc(v.native)} üben">${icon('check', 16)}</button>
        <button type="button" class="word-main" data-action="word-edit" data-id="${Utils.esc(v.id)}">
          <span class="row-text">
            <span class="row-title">${Utils.esc(v.native)}</span>
            <span class="row-sub" lang="en">${Utils.esc(v.foreign)}${showCategory ? ` · <span class="muted">${Utils.esc(v.category)}</span>` : ''}</span>
          </span>
          ${this.levelDots(v)}
        </button>
      </div>`;
  },

  renderTopic(name) {
    const words = DataManager.visible().filter(v => v.category === name);
    const c = DataManager.getCategories().find(x => x.name === name) || { total: 0, selected: 0, learned: 0, mastered: 0 };
    const due = DataManager.getDueCards(words).length;
    const allSelected = c.selected === c.total;
    return `
      <header class="page-header page-header--sub">
        <button type="button" class="icon-btn" data-action="topic-back" aria-label="Zurück zu den Themen">${icon('chevronLeft', 24)}</button>
        ${topicAvatar(name, 'lg')}
        <div class="page-header-text">
          <h1 class="page-title page-title--sm">${Utils.esc(name)}</h1>
          <p class="eyebrow">${Utils.plural(c.total, 'Wort', 'Wörter')} · ${c.mastered} gemeistert</p>
        </div>
      </header>

      <div class="topic-stats card">
        <div><strong>${c.learned}</strong><span>geübt</span></div>
        <div><strong>${due}</strong><span>fällig</span></div>
        <div><strong>${c.total - c.learned}</strong><span>neu</span></div>
      </div>

      <button type="button" class="btn btn--primary btn--lg btn--block" data-action="topic-practice" data-cat="${Utils.esc(name)}">
        ${icon('sparkles', 20)} Dieses Thema üben
      </button>

      <div class="list-head">
        <h2 class="section-title">Wörter</h2>
        <button type="button" class="link-btn" data-action="topic-select" data-cat="${Utils.esc(name)}" data-on="${allSelected ? '0' : '1'}">
          ${allSelected ? 'Alle abwählen' : 'Alle auswählen'}
        </button>
      </div>
      <p class="list-meta" id="topic-selection-meta">${c.selected} von ${c.total} im Training</p>
      <div class="list card">
        ${words.map(v => this.wordRow(v)).join('')}
      </div>
      <button type="button" class="btn btn--secondary btn--block mt" data-action="word-add" data-cat="${Utils.esc(name)}">${icon('plus', 18)} Wort zu diesem Thema hinzufügen</button>
    `;
  },

  async toggleWord(btn) {
    const id = btn.dataset.id;
    const on = !state.selectedWords.has(id);
    await DataManager.setSelection([id], on);
    btn.setAttribute('aria-checked', String(on));
    if (this.topic) {
      const words = DataManager.visible().filter(v => v.category === this.topic);
      const selected = words.filter(v => state.selectedWords.has(v.id)).length;
      const meta = document.getElementById('topic-selection-meta');
      if (meta) meta.textContent = `${selected} von ${words.length} im Training`;
    }
  },

  async toggleTopic(name) {
    const ids = DataManager.visible().filter(v => v.category === name).map(v => v.id);
    const allOn = ids.every(id => state.selectedWords.has(id));
    await DataManager.setSelection(ids, !allOn);
    this.renderResults();
  },

  openForm(vocab = null, defaults = {}) {
    const isEdit = !!vocab;
    const v = vocab || { native: '', foreign: '', example: '', exampleDe: '', note: '', category: defaults.category || CONFIG.CUSTOM_CATEGORY };
    if (!isEdit && defaults.prefill) {
      // Suchbegriff vorausfüllen (Deutsch, wenn Umlaute/Großschreibung, sonst Englisch)
      if (/[äöüßÄÖÜ]|^[A-ZÄÖÜ]/.test(defaults.prefill)) v.native = defaults.prefill;
      else v.foreign = defaults.prefill;
    }
    const categories = DataManager.getCategories().map(c => c.name);
    if (!categories.includes(CONFIG.CUSTOM_CATEGORY)) categories.unshift(CONFIG.CUSTOM_CATEGORY);
    const p = isEdit ? state.progress[v.id] : null;
    this.editing = isEdit ? v : null;

    const actions = [];
    if (isEdit) actions.push({ label: 'Wort löschen', icon: 'trash', variant: 'danger-ghost', onClick: () => this.remove(v.id) });
    actions.push({ label: 'Abbrechen', variant: 'secondary' });
    actions.push({ label: 'Speichern', variant: 'primary', onClick: (sheet) => this.saveForm(sheet, isEdit ? v : null) });

    Sheet.open({
      title: isEdit ? 'Wort bearbeiten' : 'Neues Wort',
      body: `
        <form class="form" id="vocab-form" data-submit="vocab" novalidate>
          <div class="field">
            <label for="f-native">Deutsch</label>
            <input id="f-native" name="native" type="text" required value="${Utils.esc(v.native)}" placeholder="z. B. der Hund" ${isEdit ? '' : 'autofocus'} autocomplete="off">
          </div>
          <div class="field">
            <label for="f-foreign">Englisch</label>
            <input id="f-foreign" name="foreign" type="text" required lang="en" value="${Utils.esc(v.foreign)}" placeholder="z. B. dog" autocomplete="off" autocapitalize="off">
            <small>Mehrere richtige Antworten mit „/“ trennen, z. B. clock / watch</small>
          </div>
          <div class="field">
            <label for="f-category">Thema</label>
            <input id="f-category" name="category" type="text" list="category-list" value="${Utils.esc(v.category)}" autocomplete="off">
            <datalist id="category-list">${categories.map(c => `<option value="${Utils.esc(c)}"></option>`).join('')}</datalist>
          </div>
          <details class="field-more" ${v.example || v.exampleDe || v.note ? 'open' : ''}>
            <summary>Beispielsätze & Notiz</summary>
            <div class="field">
              <label for="f-example">Beispielsatz Englisch</label>
              <textarea id="f-example" name="example" rows="2" lang="en" placeholder="The dog is running.">${Utils.esc(v.example)}</textarea>
            </div>
            <div class="field">
              <label for="f-example-de">Beispielsatz Deutsch</label>
              <textarea id="f-example-de" name="exampleDe" rows="2" placeholder="Der Hund rennt.">${Utils.esc(v.exampleDe)}</textarea>
            </div>
            <div class="field">
              <label for="f-note">Merkhilfe</label>
              <textarea id="f-note" name="note" rows="2" placeholder="z. B. Eselsbrücke">${Utils.esc(v.note)}</textarea>
            </div>
          </details>
          ${p ? `<p class="form-meta">Stufe ${p.level + 1} von ${CONFIG.INTERVALS.length} · ${p.correctCount}× richtig · ${p.incorrectCount}× falsch</p>` : ''}
          <button type="submit" hidden></button>
        </form>`,
      actions
    });
  },

  async saveForm(sheet, existing) {
    const form = sheet.querySelector('#vocab-form');
    const data = Object.fromEntries(new FormData(form).entries());
    const native = String(data.native || '').trim();
    const foreign = String(data.foreign || '').trim();
    let invalid = false;
    [['f-native', native], ['f-foreign', foreign]].forEach(([id, val]) => {
      const input = form.querySelector(`#${id}`);
      input.classList.toggle('is-invalid', !val);
      if (!val) invalid = true;
    });
    if (invalid) {
      form.querySelector('.is-invalid').focus();
      return;
    }
    const vocab = {
      ...(existing || {}),
      id: existing ? existing.id : undefined,
      native,
      foreign,
      category: String(data.category || '').trim().slice(0, 80) || CONFIG.CUSTOM_CATEGORY,
      example: String(data.example || '').trim(),
      exampleDe: String(data.exampleDe || '').trim(),
      note: String(data.note || '').trim()
    };
    if (existing && (existing.native !== native || existing.foreign !== foreign)) {
      vocab.difficulty = DataManager.calculateDifficulty(vocab);
    }
    await DataManager.saveVocab(vocab);
    DataManager.sortVocabulary();
    Sheet.close();
    Toast.show(existing ? 'Gespeichert' : 'Wort hinzugefügt', { type: 'success' });
    this.render();
  },

  async remove(id) {
    Sheet.close();
    const snapshot = await DataManager.deleteVocab(id);
    this.render();
    if (snapshot) {
      Toast.show(`„${snapshot.vocab.native}“ gelöscht`, {
        duration: 5000,
        actionLabel: 'Rückgängig',
        onAction: async () => {
          await DataManager.restoreVocab(snapshot);
          this.render();
        }
      });
    }
  }
};

// ============================================
// STATISTIK
// ============================================

const StatsView = {
  render() {
    const el = document.getElementById('view-stats');
    const total = state.vocabulary.length;
    const ids = new Set(state.vocabulary.map(v => v.id));
    const progress = Object.values(state.progress).filter(p => ids.has(p.vocabId));
    const learned = progress.length;
    const mastered = progress.filter(p => p.level >= CONFIG.MASTERED_LEVEL).length;
    const firm = progress.filter(p => p.level >= 2 && p.level < CONFIG.MASTERED_LEVEL).length;
    const learning = learned - mastered - firm;
    const fresh = Math.max(total - learned, 0);
    const accuracy = state.stats.totalReviews ? Math.round((state.stats.correctAnswers / state.stats.totalReviews) * 100) : 0;
    const share = (n) => (total ? (n / total) * 100 : 0);

    // Letzte 14 Tage
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = Utils.addDays(new Date(), -i);
      const key = Utils.dateKey(d);
      const ds = state.stats.dailyStats[key] || { reviews: 0, correct: 0, goalReached: false };
      days.push({ key, d, ...ds });
    }
    const maxReviews = Math.max(state.settings.dailyGoal, ...days.map(d => d.reviews));
    const weekReviews = days.slice(-7).reduce((sum, d) => sum + d.reviews, 0);
    const activeDays = days.filter(d => d.reviews > 0).length;

    const problems = DataManager.getErrorCards(state.vocabulary).slice(0, 8);
    const cats = DataManager.getCategories().filter(c => c.learned > 0)
      .sort((a, b) => (b.learned / b.total) - (a.learned / a.total));

    el.innerHTML = `
      <header class="page-header">
        <div>
          <p class="eyebrow">Dein Fortschritt</p>
          <h1 class="page-title">Statistik</h1>
        </div>
      </header>

      <div class="tiles">
        <div class="tile card"><span class="tile-icon tone-flame">${icon('flame', 20)}</span><strong>${state.stats.streak || 0}</strong><span>Tage in Folge</span></div>
        <div class="tile card"><span class="tile-icon tone-primary">${icon('trophy', 20)}</span><strong>${state.stats.bestStreak || 0}</strong><span>Beste Serie</span></div>
        <div class="tile card"><span class="tile-icon tone-success">${icon('check', 20)}</span><strong>${accuracy}%</strong><span>Trefferquote</span></div>
        <div class="tile card"><span class="tile-icon tone-info">${icon('chart', 20)}</span><strong>${Utils.num(state.stats.totalReviews)}</strong><span>Antworten</span></div>
      </div>

      <section class="section">
        <h2 class="section-title">Letzte 14 Tage</h2>
        <div class="card chart-card">
          <div class="chart" role="img" aria-label="${weekReviews} Antworten in den letzten 7 Tagen">
            <div class="chart-goal" style="bottom:${(state.settings.dailyGoal / maxReviews) * 100}%"><span>Ziel</span></div>
            ${days.map((d, i) => `
              <div class="chart-col ${i === days.length - 1 ? 'is-today' : ''}">
                <div class="chart-bar ${d.goalReached ? 'is-goal' : ''}" style="height:${d.reviews ? Math.max((d.reviews / maxReviews) * 100, 4) : 0}%" title="${d.d.toLocaleDateString('de-DE')}: ${d.reviews} Antworten, ${d.correct} richtig"></div>
                <span class="chart-label">${d.d.toLocaleDateString('de-DE', { weekday: 'narrow' })}</span>
              </div>`).join('')}
          </div>
          <p class="chart-foot">${Utils.plural(weekReviews, 'Antwort', 'Antworten')} diese Woche · an ${Utils.plural(activeDays, 'Tag', 'Tagen')} gelernt</p>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Wortschatz</h2>
        <div class="card mastery-card">
          <div class="stack-bar" aria-hidden="true">
            <span class="seg seg--mastered" style="width:${share(mastered)}%"></span>
            <span class="seg seg--firm" style="width:${share(firm)}%"></span>
            <span class="seg seg--learning" style="width:${share(learning)}%"></span>
          </div>
          <ul class="legend">
            <li><i class="seg--mastered"></i>Gemeistert<b>${Utils.num(mastered)}</b></li>
            <li><i class="seg--firm"></i>Gefestigt<b>${Utils.num(firm)}</b></li>
            <li><i class="seg--learning"></i>Am Lernen<b>${Utils.num(learning)}</b></li>
            <li><i class="seg--new"></i>Neu<b>${Utils.num(fresh)}</b></li>
          </ul>
        </div>
      </section>

      ${problems.length ? `
        <section class="section">
          <div class="list-head">
            <h2 class="section-title">Schwierige Wörter</h2>
            <button type="button" class="link-btn" data-action="practice-problems">Üben</button>
          </div>
          <div class="list card">
            ${problems.map(v => {
              const p = state.progress[v.id];
              const rate = Math.round((p.incorrectCount / Math.max(1, p.correctCount + p.incorrectCount)) * 100);
              return `
                <div class="row row--static">
                  <span class="row-text">
                    <span class="row-title">${Utils.esc(v.native)}</span>
                    <span class="row-sub" lang="en">${Utils.esc(v.foreign)}</span>
                  </span>
                  <span class="count-badge tone-danger">${rate}% falsch</span>
                </div>`;
            }).join('')}
          </div>
        </section>` : ''}

      ${cats.length ? `
        <section class="section">
          <h2 class="section-title">Themen</h2>
          <div class="list card">
            ${cats.map(c => {
              const pct = Math.round((c.learned / c.total) * 100);
              return `
                <div class="row row--static">
                  ${topicAvatar(c.name)}
                  <span class="row-text">
                    <span class="row-title">${Utils.esc(c.name)}</span>
                    <span class="mini-bar" aria-hidden="true"><span style="width:${pct}%"></span><span class="mini-bar-mastered" style="width:${Math.round((c.mastered / c.total) * 100)}%"></span></span>
                  </span>
                  <span class="pct">${pct}%</span>
                </div>`;
            }).join('')}
          </div>
        </section>` : `
        <div class="empty">
          ${icon('chart', 32)}
          <h3>Noch keine Daten</h3>
          <p>Starte deine erste Runde – hier siehst du dann deinen Fortschritt.</p>
        </div>`}
    `;
  }
};

// ============================================
// EINSTELLUNGEN
// ============================================

const SettingsView = {
  segmented(key, options, current) {
    return `
      <div class="segmented" role="radiogroup">
        ${options.map(([value, label]) => `
          <button type="button" role="radio" aria-checked="${String(current) === String(value)}"
            data-action="set" data-key="${key}" data-value="${value}">${label}</button>`).join('')}
      </div>`;
  },

  toggle(key, title, sub) {
    const on = !!state.settings[key];
    return `
      <button type="button" class="row" role="switch" aria-checked="${on}" data-action="toggle" data-key="${key}">
        <span class="row-text">
          <span class="row-title">${title}</span>
          ${sub ? `<span class="row-sub">${sub}</span>` : ''}
        </span>
        <span class="switch" aria-hidden="true"><span></span></span>
      </button>`;
  },

  navRow(action, iconName, title, sub = '', tone = 'neutral') {
    return `
      <button type="button" class="row" data-action="${action}">
        <span class="row-icon tone-${tone}">${icon(iconName, 20)}</span>
        <span class="row-text">
          <span class="row-title">${title}</span>
          ${sub ? `<span class="row-sub">${sub}</span>` : ''}
        </span>
        ${icon('chevronRight', 20, 'muted')}
      </button>`;
  },

  render() {
    const el = document.getElementById('view-settings');
    const st = state.settings;
    el.innerHTML = `
      <header class="page-header">
        <div>
          <p class="eyebrow">Vokabel Master+</p>
          <h1 class="page-title">Einstellungen</h1>
        </div>
      </header>

      <section class="section">
        <h2 class="section-title">Lernen</h2>
        <div class="card settings-card">
          <div class="setting">
            <div class="setting-label"><span class="row-title">Klassenstufe</span><span class="row-sub">${Utils.esc((GRADE_LEVELS.find(x => x[0] === st.gradeLevel) || GRADE_LEVELS[2])[2])}</span></div>
            ${this.segmented('gradeLevel', [['A1', 'Kl. 5–6'], ['A2', 'Kl. 5–8'], ['all', 'Alle']], st.gradeLevel)}
          </div>
          <div class="setting">
            <div class="setting-label"><span class="row-title">Tagesziel</span><span class="row-sub">Richtige Antworten pro Tag</span></div>
            ${this.segmented('dailyGoal', [[10, '10'], [20, '20'], [30, '30'], [50, '50']], st.dailyGoal)}
          </div>
          <div class="setting">
            <div class="setting-label"><span class="row-title">Wörter pro Runde</span></div>
            ${this.segmented('cardsPerSession', [[10, '10'], [20, '20'], [30, '30'], [50, '50']], st.cardsPerSession)}
          </div>
          <div class="setting">
            <div class="setting-label"><span class="row-title">Abfragerichtung</span><span class="row-sub">Was wird gezeigt, was gefragt?</span></div>
            ${this.segmented('practiceDirection', [['de-en', 'DE → EN'], ['en-de', 'EN → DE'], ['mixed', 'Gemischt']], st.practiceDirection)}
          </div>
        </div>
        <div class="list card">
          ${this.toggle('tolerantMode', 'Nachsichtig prüfen', 'Groß-/Kleinschreibung, Artikel und kleine Tippfehler verzeihen')}
          ${this.toggle('showHints', 'Thema anzeigen', 'Kleiner Hinweis auf der Karte')}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Ton & Aussprache</h2>
        <div class="list card">
          ${Speech.available() ? this.toggle('speechEnabled', 'Aussprache', 'Englische Wörter vorlesen') : `
            <div class="row row--static"><span class="row-text"><span class="row-title">Aussprache</span><span class="row-sub">Auf diesem Gerät nicht verfügbar</span></span></div>`}
          ${this.toggle('soundEnabled', 'Töne', 'Kurzer Klang bei richtig und falsch')}
          ${'vibrate' in navigator ? this.toggle('hapticsEnabled', 'Vibration', 'Kurzes Feedback bei Antworten') : ''}
        </div>
        ${Speech.available() && st.speechEnabled ? `
        <div class="card settings-card">
          <div class="setting">
            <div class="setting-label"><span class="row-title">Akzent</span></div>
            ${this.segmented('speechLang', [['en-US', 'Amerikanisch'], ['en-GB', 'Britisch']], st.speechLang)}
          </div>
        </div>` : ''}
      </section>

      <section class="section">
        <h2 class="section-title">Darstellung</h2>
        <div class="card settings-card">
          <div class="setting">
            <div class="setting-label"><span class="row-title">Design</span></div>
            ${this.segmented('theme', [['system', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']], st.theme)}
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Daten & Sicherung</h2>
        <p class="section-note">Alles bleibt auf diesem Gerät. Sichere regelmäßig, bevor du Browserdaten löschst.</p>
        <div class="list card">
          ${this.navRow('export', 'download', 'Sicherung speichern', 'Wörter & Fortschritt als Datei', 'primary')}
          ${this.navRow('import-json', 'upload', 'Sicherung laden', 'Aus einer Sicherungsdatei wiederherstellen', 'primary')}
          ${this.navRow('import-csv', 'table', 'Wortliste importieren', 'CSV-Datei, z. B. aus Excel', 'info')}
          ${this.navRow('csv-template', 'file', 'CSV-Vorlage herunterladen', '', 'info')}
        </div>
        <input type="file" id="file-json" accept=".json,application/json" data-change="import-json" hidden>
        <input type="file" id="file-csv" accept=".csv,.txt,text/csv,text/plain" data-change="import-csv" hidden>
      </section>

      <section class="section">
        <h2 class="section-title">App</h2>
        <div class="list card">
          ${state.deferredPrompt ? this.navRow('install', 'smartphone', 'App installieren', 'Auf den Startbildschirm', 'success') : ''}
          ${this.navRow('check-update', 'refresh', 'Nach Updates suchen', `Version ${CONFIG.version}`, 'neutral')}
          ${this.navRow('legal', 'shield', 'Impressum & Datenschutz', '', 'neutral')}
          ${this.navRow('terms', 'info', 'Nutzungsbedingungen', '', 'neutral')}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Zurücksetzen</h2>
        <div class="list card">
          ${this.navRow('reset-progress', 'rotate', 'Lernfortschritt zurücksetzen', 'Wörter bleiben, Statistik beginnt neu', 'warning')}
          ${this.navRow('reset-all', 'trash', 'Alles löschen', 'Eigene Wörter, Fortschritt & Auswahl', 'danger')}
        </div>
      </section>

      <p class="footer-note">Vokabel Master+ ${CONFIG.version} · offline & ohne Konto</p>
    `;
  },

  async set(key, raw) {
    const numeric = ['dailyGoal', 'cardsPerSession'];
    const value = numeric.includes(key) ? parseInt(raw, 10) : raw;
    await DataManager.saveSettings({ [key]: value });
    if (key === 'theme') {
      try { localStorage.setItem('vokabel-theme', value); } catch (_) { /* ignore */ }
      applyTheme(value);
    }
    if (key === 'dailyGoal') {
      // Ziel erneut bewerten, damit Anzeige und Streak konsistent sind
      const s = state.stats;
      if (s.dailyCorrect < value) s.goalReached = false;
      await DataManager.saveStats();
    }
    this.render();
  },

  async toggle_(key) {
    await DataManager.saveSettings({ [key]: !state.settings[key] });
    if (key === 'soundEnabled' && state.settings.soundEnabled) Feedback.play('correct');
    this.render();
  },

  showLegal() {
    Sheet.open({
      title: 'Impressum & Datenschutz',
      size: 'large',
      body: `
        <div class="prose">
          <h3>Impressum</h3>
          <p><strong>Betreiber der Anwendung:</strong><br>Belkis Aslani<br>Vogelsangstr. 32<br>71691 Freiberg am Neckar</p>
          <p><strong>Kontakt:</strong><br>Telefon: +49 176 81462526<br>E-Mail: belkis.aslani@gmail.com</p>
          <h3>Quellen</h3>
          <p>Die Wortauswahl und die Einstufung nach Niveau (A1/A2) stützen sich unter anderem auf: The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tokyo University of Foreign Studies. Retrieved from http://www.cefr-j.org/download.html. Deutsche Übersetzungen und Beispielsätze sind eigene Inhalte dieser App.</p>
          <h3>Datenschutzerklärung</h3>
          <p>Diese Anwendung („Vokabel Master+“) ist eine reine Offline-Anwendung (Progressive Web App). Alle Daten werden ausschließlich lokal in der Datenbank Ihres Webbrowsers (IndexedDB) gespeichert.</p>
          <p><strong>Datenerhebung:</strong><br>Es werden keine personenbezogenen Daten an externe Server übertragen. Die von Ihnen eingegebenen Vokabeln und Lernfortschritte verbleiben auf Ihrem Gerät.</p>
          <p><strong>Berechtigungen:</strong><br>Die Anwendung nutzt die Cache-Funktion Ihres Browsers (Service Worker), um offline-fähig zu sein. Hierfür werden keine persönlichen Profile erstellt.</p>
          <p><strong>Sprachausgabe:</strong><br>Für das Vorlesen wird die Sprachausgabe Ihres Geräts bzw. Browsers verwendet. Je nach Browser kann diese einen Online-Dienst des Browser-Herstellers nutzen.</p>
          <p><strong>Ihre Rechte:</strong><br>Da alle Daten lokal gespeichert sind, können Sie diese jederzeit selbst löschen (in den Einstellungen unter „Alles löschen“ oder durch Löschen der Browserdaten).</p>
        </div>`,
      actions: [{ label: 'Schließen', variant: 'primary' }]
    });
  },

  showTerms() {
    Sheet.open({
      title: 'Nutzungsbedingungen',
      size: 'large',
      body: `
        <div class="prose">
          <p><strong>Vokabel Master+</strong> – Vokabeltrainer-App</p>
          <h3>1. Geltungsbereich</h3>
          <p>Diese Nutzungsbedingungen gelten für die Nutzung der App „Vokabel Master+“. Die App wird kostenlos und ohne Gewinnabsicht bereitgestellt.</p>
          <h3>2. Bereitstellung & Wartung</h3>
          <p>Die App wird vom Entwickler gepflegt und gewartet, solange die Kinder die App nutzen und Unterstützung benötigen. Sobald die Kinder in der Lage sind, die App eigenständig zu verwalten und weiterzuentwickeln, wird die Verantwortung an sie übergeben.</p>
          <h3>3. Kostenfreiheit</h3>
          <p>Die Nutzung der App ist vollständig kostenlos. Es fallen keine Gebühren, Abonnements oder In-App-Käufe an. Es werden keine Werbeanzeigen geschaltet.</p>
          <h3>4. Datenschutz</h3>
          <p>Alle Lern-Daten (Vokabeln, Fortschritt, Einstellungen) werden ausschließlich lokal auf dem Gerät des Nutzers gespeichert. Es werden keine persönlichen Daten an Server oder Dritte übermittelt. Die App funktioniert vollständig offline.</p>
          <h3>5. Haftung</h3>
          <p>Die App wird „wie besehen“ bereitgestellt. Für die Richtigkeit der enthaltenen Vokabeln und Übersetzungen wird keine Garantie übernommen. Die App ersetzt keinen professionellen Sprachunterricht.</p>
          <h3>6. Urheberrecht</h3>
          <p>Die Vokabellisten basieren auf dem öffentlich zugänglichen Grundwortschatz des Lehrplans für Gymnasien. Die App selbst und ihr Quellcode sind Eigentum des Entwicklers.</p>
          <h3>7. Übergabe</h3>
          <p>Es ist ausdrücklich vorgesehen, dass diese App zu einem späteren Zeitpunkt an die Kinder übergeben wird, damit sie die Anwendung eigenständig weiterentwickeln und pflegen können. Dies ist Teil des Lernprozesses.</p>
          <h3>8. Änderungen</h3>
          <p>Diese Bedingungen können jederzeit angepasst werden. Bei wesentlichen Änderungen wird innerhalb der App darauf hingewiesen.</p>
          <p class="muted">Stand: März 2026</p>
        </div>`,
      actions: [{ label: 'Verstanden', variant: 'primary' }]
    });
  },

  async importJSON(file) {
    if (!file) return;
    try {
      const r = await DataManager.importJSON(file);
      Toast.show(`${Utils.plural(r.importedVocab, 'Wort', 'Wörter')} und ${r.importedProgress} Lernstände geladen${r.skippedVocab ? ` (${r.skippedVocab} übersprungen)` : ''}`, { type: 'success', duration: 4500 });
    } catch (error) {
      console.error(error);
      Toast.show(`Laden fehlgeschlagen: ${error.message || 'Datei ungültig'}`, { type: 'error', duration: 4500 });
    }
    this.render();
  },

  async importCSV(file) {
    if (!file) return;
    try {
      const r = await DataManager.importCSV(file);
      Toast.show(`${Utils.plural(r.imported, 'Wort', 'Wörter')} importiert${r.skipped ? ` (${r.skipped} Zeilen übersprungen)` : ''}`, { type: r.imported ? 'success' : 'info', duration: 4500 });
    } catch (error) {
      console.error(error);
      Toast.show(`Import fehlgeschlagen: ${error.message || 'Datei ungültig'}`, { type: 'error', duration: 4500 });
    }
    this.render();
  },

  async checkUpdate() {
    Toast.show('Suche nach Updates …');
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.update().catch(() => null)));
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(n => n.startsWith('vokabel-master-')).map(n => caches.delete(n)));
      }
    } catch (error) {
      console.warn(error);
    }
    setTimeout(() => location.reload(), 400);
  },

  async resetProgress() {
    const ok = await Sheet.confirm({
      title: 'Lernfortschritt zurücksetzen?',
      message: 'Alle Lernstände, die Serie und die Statistik werden gelöscht. Deine Wörter und die Auswahl bleiben erhalten.',
      confirmLabel: 'Zurücksetzen',
      danger: true
    });
    if (!ok) return;
    await DataManager.resetProgress();
    Toast.show('Lernfortschritt zurückgesetzt', { type: 'success' });
    this.render();
  },

  async resetAll() {
    const custom = DataManager.countCustomWords();
    const ok = await Sheet.confirm({
      title: 'Wirklich alles löschen?',
      message: `${custom > 0 ? `<strong>${Utils.plural(custom, 'eigenes Wort geht', 'eigene Wörter gehen')} verloren.</strong> Speichere vorher eine Sicherung.<br><br>` : ''}Fortschritt, Statistik und Auswahl werden gelöscht, die mitgelieferten Wörter neu geladen. Das kann nicht rückgängig gemacht werden.`,
      confirmLabel: 'Alles löschen',
      danger: true
    });
    if (!ok) return;
    await DataManager.resetAll();
    Toast.show('Alles gelöscht und neu geladen', { type: 'success' });
    Views.show('home');
  }
};

// ============================================
// AKTIONEN (Event-Delegation)
// ============================================

const Actions = {
  tab: (el) => Views.show(el.dataset.tab),

  // Start
  'start-smart': () => Session.start('smart'),
  'start-source': (el) => Session.start(el.dataset.source),
  'set-mode': async (el) => {
    await DataManager.saveSettings({ lastMode: el.dataset.mode });
    HomeView.render();
  },
  install: () => triggerInstall(),
  'install-dismiss': () => {
    try { localStorage.setItem('vm-install-dismissed', '1'); } catch (_) { /* ignore */ }
    HomeView.render();
  },

  // Übung
  'session-close': () => Session.requestExit(),
  flip: () => Session.flip(),
  rate: (el) => Session.rate(el.dataset.correct === '1'),
  'mc-pick': (el) => Session.pickMC(Number(el.dataset.index)),
  hint: () => Session.showHint(),
  next: () => Session.next(),
  override: () => Session.override(),
  speak: (el) => Speech.speak(el.dataset.text, el.dataset.lang),
  'speak-answer': (el) => Session.speakAnswer(Session.item(), el.dataset.slow === '1'),
  'practice-missed': () => {
    const ids = [...Session.s.first.entries()].filter(([, ok]) => !ok).map(([id]) => id);
    Session.start('ids', { ids });
  },
  'session-again': () => {
    const { source, extra } = Session.s;
    Session.start(source === 'ids' ? 'smart' : source, extra);
  },
  'session-done': () => Session.exit(),

  // Wörter
  'search-clear': () => {
    WordsView.query = '';
    const input = document.getElementById('word-search');
    if (input) { input.value = ''; input.focus(); }
    document.querySelector('.search-clear').hidden = true;
    WordsView.renderResults();
  },
  'show-more': () => {
    WordsView.limit += CONFIG.SEARCH_LIMIT;
    WordsView.renderResults();
  },
  'topic-open': (el) => {
    WordsView.topic = el.dataset.cat;
    WordsView.render();
    window.scrollTo(0, 0);
  },
  'topic-back': () => {
    WordsView.topic = null;
    WordsView.render();
  },
  'topic-toggle': (el) => WordsView.toggleTopic(el.dataset.cat),
  'topic-select': async (el) => {
    const ids = DataManager.visible().filter(v => v.category === el.dataset.cat).map(v => v.id);
    await DataManager.setSelection(ids, el.dataset.on === '1');
    WordsView.render();
  },
  'select-all-topics': async (el) => {
    await DataManager.setSelection(DataManager.visible().map(v => v.id), el.dataset.on === '1');
    WordsView.renderResults();
  },
  'topic-practice': (el) => Session.start('category', { category: el.dataset.cat }),
  'word-toggle': (el) => WordsView.toggleWord(el),
  'word-edit': (el) => {
    const vocab = state.vocabulary.find(v => v.id === el.dataset.id);
    if (vocab) WordsView.openForm(vocab);
  },
  'word-add': (el) => WordsView.openForm(null, { category: el.dataset.cat || WordsView.topic || undefined, prefill: el.dataset.prefill }),

  // Statistik
  'practice-problems': () => {
    const ids = DataManager.getErrorCards(state.vocabulary).slice(0, state.settings.cardsPerSession).map(v => v.id);
    Session.start('ids', { ids });
  },

  // Einstellungen
  set: (el) => SettingsView.set(el.dataset.key, el.dataset.value),
  toggle: (el) => SettingsView.toggle_(el.dataset.key),
  export: () => {
    DataManager.exportData();
    Toast.show('Sicherung wird gespeichert', { type: 'success' });
  },
  'import-json': () => document.getElementById('file-json').click(),
  'import-csv': () => document.getElementById('file-csv').click(),
  'csv-template': () => DataManager.downloadCSVTemplate(),
  'check-update': () => SettingsView.checkUpdate(),
  legal: () => SettingsView.showLegal(),
  terms: () => SettingsView.showTerms(),
  'reset-progress': () => SettingsView.resetProgress(),
  'reset-all': () => SettingsView.resetAll()
};

const ChangeHandlers = {
  'import-json': (el) => { SettingsView.importJSON(el.files[0]); el.value = ''; },
  'import-csv': (el) => { SettingsView.importCSV(el.files[0]); el.value = ''; }
};

const SubmitHandlers = {
  answer: () => Session.submitAnswer(),
  vocab: () => {
    if (Sheet.current) WordsView.saveForm(Sheet.current.sheet, WordsView.editing);
  }
};

function bindGlobalEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    const handler = Actions[el.dataset.action];
    if (!handler) return;
    e.preventDefault();
    Promise.resolve(handler(el, e)).catch(err => {
      console.error(err);
      Toast.show('Da ist etwas schiefgelaufen.', { type: 'error' });
    });
  });

  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && ChangeHandlers[el.dataset.change]) ChangeHandlers[el.dataset.change](el, e);
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-submit]');
    if (!form) return;
    e.preventDefault();
    const handler = SubmitHandlers[form.dataset.submit];
    if (handler) handler(form, e);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && Sheet.current) {
      e.preventDefault();
      Sheet.close();
      return;
    }
    if (Session.s) {
      Session.onKey(e);
      return;
    }
    // Tastatur-Bedienung für role="button"-Elemente
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-action]')) {
      e.preventDefault();
      e.target.click();
    }
  });

  window.addEventListener('popstate', () => BackStack.handle());

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !Session.s && !Sheet.current) {
      // Tageswechsel, während die App im Hintergrund war
      DataManager.checkDay();
      if (state.currentTab === 'home') HomeView.render();
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'system') applyTheme('system');
  });
}

// ============================================
// THEME, INSTALLATION, SERVICE WORKER
// ============================================

function applyTheme(theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#0d0f16' : '#f6f7fb');
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
    if (!Session.s) Views.render();
  });
  window.addEventListener('appinstalled', () => {
    state.deferredPrompt = null;
    Toast.show('App installiert!', { type: 'success' });
    if (!Session.s) Views.render();
  });
}

async function triggerInstall() {
  const prompt = state.deferredPrompt;
  if (!prompt) {
    Toast.show('Installation ist in diesem Browser nicht verfügbar. Nutze „Zum Startbildschirm hinzufügen“ im Browsermenü.', { duration: 5000 });
    return;
  }
  prompt.prompt();
  try { await prompt.userChoice; } catch (_) { /* ignore */ }
  state.deferredPrompt = null;
  Views.render();
}

async function registerServiceWorker() {
  const ok = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!ok || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./sw.js');
  } catch (error) {
    console.warn('Service Worker konnte nicht registriert werden:', error);
  }
}

// ============================================
// INITIALISIERUNG
// ============================================

async function initApp() {
  try {
    bindGlobalEvents();
    setupInstallPrompt();
    Speech.init();
    DataManager.buildPresetIndex();

    await DB.open();
    await DataManager.loadAll();
    const seeded = await DataManager.seedPresetVocabulary();
    if (!seeded) await DataManager.syncPresetVocabulary();

    applyTheme(state.settings.theme);
    try { localStorage.setItem('vokabel-theme', state.settings.theme); } catch (_) { /* ignore */ }

    document.body.classList.remove('is-loading');
    Views.show('home');
    registerServiceWorker();
  } catch (error) {
    console.error('Initialisierung fehlgeschlagen:', error);
    document.body.classList.remove('is-loading');
    document.getElementById('main').innerHTML = `
      <div class="empty empty--fatal">
        ${icon('alert', 36)}
        <h3>Die App konnte nicht starten</h3>
        <p>${Utils.esc(error && error.message ? error.message : 'Unbekannter Fehler')}</p>
        <p class="muted">Tipp: Im privaten Modus speichern manche Browser keine Daten.</p>
        <button type="button" class="btn btn--primary" onclick="location.reload()">Neu laden</button>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', initApp);
