/**
 * Vokabel Master+ - Vokabeltrainer PWA
 * Mobile-First, Offline-First, Keine externen Abhängigkeiten
 */

// ============================================
// KONSTANTEN & KONFIGURATION
// ============================================

const CONFIG = {
  // Spaced Repetition Intervalle (in Tagen)
  INTERVALS: [1, 3, 7, 14, 30, 60],
  // IndexedDB Konfiguration
  DB_NAME: 'vokabel-master-db',
  DB_VERSION: 1,
  // Stores
  STORE_VOCAB: 'vocabulary',
  STORE_PROGRESS: 'progress',
  STORE_SETTINGS: 'settings',
  STORE_STATS: 'stats',
  // Default Einstellungen
  DEFAULT_SETTINGS: {
    theme: 'system',
    tolerantMode: true, // Groß-/Kleinschreibung ignorieren
    showHints: true,
    speechEnabled: true,
    speechLang: 'en-US',
    nativeLang: 'de-DE',
    cardsPerSession: 10,
    soundEnabled: false // Sound effects for correct/incorrect answers (default off)
  },
  // Quiz Optionen
  MC_OPTIONS_COUNT: 4
};

// ============================================
// GLOBALER STATE
// ============================================

const state = {
  db: null,
  vocabulary: [],
  progress: {},
  settings: { ...CONFIG.DEFAULT_SETTINGS },
  stats: {
    totalReviews: 0,
    correctAnswers: 0,
    streak: 0,
    lastStudyDate: null,
    dailyStats: {}
  },
  currentView: 'learn',
  currentSession: null,
  currentCardIndex: 0,
  sessionResults: []
};

// ============================================
// INDEXEDDB WRAPPER
// ============================================

const DB = {
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        state.db = request.result;
        resolve(state.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Vocabulary Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_VOCAB)) {
          const vocabStore = db.createObjectStore(CONFIG.STORE_VOCAB, { keyPath: 'id' });
          vocabStore.createIndex('category', 'category', { unique: false });
          vocabStore.createIndex('difficulty', 'difficulty', { unique: false });
        }

        // Progress Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_PROGRESS)) {
          db.createObjectStore(CONFIG.STORE_PROGRESS, { keyPath: 'vocabId' });
        }

        // Settings Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_SETTINGS)) {
          db.createObjectStore(CONFIG.STORE_SETTINGS, { keyPath: 'key' });
        }

        // Stats Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_STATS)) {
          db.createObjectStore(CONFIG.STORE_STATS, { keyPath: 'key' });
        }
      };
    });
  },

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
};

// ============================================
// DATEN MANAGEMENT
// ============================================

const DataManager = {
  async loadAll() {
    try {
      // Vokabeln laden
      state.vocabulary = await DB.getAll(CONFIG.STORE_VOCAB);

      // Progress laden
      const progressData = await DB.getAll(CONFIG.STORE_PROGRESS);
      state.progress = {};
      progressData.forEach(p => {
        state.progress[p.vocabId] = p;
      });

      // Settings laden
      const settingsData = await DB.get(CONFIG.STORE_SETTINGS, 'userSettings');
      if (settingsData) {
        state.settings = { ...CONFIG.DEFAULT_SETTINGS, ...settingsData.value };
      }

      // Stats laden
      const statsData = await DB.get(CONFIG.STORE_STATS, 'userStats');
      if (statsData) {
        state.stats = { ...state.stats, ...statsData.value };
      }

      // Streak prüfen
      this.checkStreak();

    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      Toast.show('Fehler beim Laden der Daten', 'error');
    }
  },

  async saveVocab(vocab) {
    if (!vocab.id) {
      vocab.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    vocab.createdAt = vocab.createdAt || new Date().toISOString();
    vocab.updatedAt = new Date().toISOString();

    await DB.put(CONFIG.STORE_VOCAB, vocab);

    // State aktualisieren
    const index = state.vocabulary.findIndex(v => v.id === vocab.id);
    if (index >= 0) {
      state.vocabulary[index] = vocab;
    } else {
      state.vocabulary.push(vocab);
    }

    return vocab;
  },

  async deleteVocab(id) {
    await DB.delete(CONFIG.STORE_VOCAB, id);
    await DB.delete(CONFIG.STORE_PROGRESS, id);

    state.vocabulary = state.vocabulary.filter(v => v.id !== id);
    delete state.progress[id];
  },

  async saveProgress(vocabId, isCorrect) {
    const now = new Date();
    const progress = state.progress[vocabId] || {
      vocabId,
      level: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReview: null,
      nextReview: null
    };

    if (isCorrect) {
      progress.correctCount++;
      progress.level = Math.min(progress.level + 1, CONFIG.INTERVALS.length - 1);
    } else {
      progress.incorrectCount++;
      progress.level = Math.max(0, progress.level - 1);
    }

    progress.lastReview = now.toISOString();

    // Nächste Wiederholung berechnen
    const intervalDays = CONFIG.INTERVALS[progress.level];
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    progress.nextReview = nextDate.toISOString();

    await DB.put(CONFIG.STORE_PROGRESS, progress);
    state.progress[vocabId] = progress;

    // Stats aktualisieren
    await this.updateStats(isCorrect);
  },

  async updateStats(isCorrect) {
    const today = new Date().toISOString().split('T')[0];

    state.stats.totalReviews++;
    if (isCorrect) {
      state.stats.correctAnswers++;
    }

    // Tagesstatistik
    if (!state.stats.dailyStats[today]) {
      state.stats.dailyStats[today] = { reviews: 0, correct: 0 };
    }
    state.stats.dailyStats[today].reviews++;
    if (isCorrect) {
      state.stats.dailyStats[today].correct++;
    }

    // Streak aktualisieren
    if (state.stats.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (state.stats.lastStudyDate === yesterdayStr) {
        state.stats.streak++;
      } else if (state.stats.lastStudyDate !== today) {
        state.stats.streak = 1;
      }
      state.stats.lastStudyDate = today;
    }

    await DB.put(CONFIG.STORE_STATS, { key: 'userStats', value: state.stats });
  },

  checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (state.stats.lastStudyDate &&
        state.stats.lastStudyDate !== today &&
        state.stats.lastStudyDate !== yesterdayStr) {
      state.stats.streak = 0;
    }
  },

  async saveSettings(settings) {
    state.settings = { ...state.settings, ...settings };
    await DB.put(CONFIG.STORE_SETTINGS, { key: 'userSettings', value: state.settings });
  },

  // Fällige Karten ermitteln
  getDueCards() {
    const now = new Date();
    return state.vocabulary.filter(vocab => {
      const progress = state.progress[vocab.id];
      if (!progress || !progress.nextReview) return false;
      return new Date(progress.nextReview) <= now;
    });
  },

  // Neue Karten (noch nie gelernt)
  getNewCards() {
    return state.vocabulary.filter(vocab => !state.progress[vocab.id]);
  },

  // Fehlerkarten (letzte Antwort falsch oder niedriges Level)
  getErrorCards() {
    return state.vocabulary.filter(vocab => {
      const progress = state.progress[vocab.id];
      if (!progress) return false;
      return progress.level === 0 || progress.incorrectCount > progress.correctCount;
    });
  },

  // Export als JSON
  exportData() {
    const data = {
      vocabulary: state.vocabulary,
      progress: Object.values(state.progress),
      settings: state.settings,
      stats: state.stats,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vokabel-master-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import aus JSON
  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // Vokabeln importieren
          if (data.vocabulary && Array.isArray(data.vocabulary)) {
            for (const vocab of data.vocabulary) {
              await this.saveVocab(vocab);
            }
          }

          // Progress importieren
          if (data.progress && Array.isArray(data.progress)) {
            for (const prog of data.progress) {
              await DB.put(CONFIG.STORE_PROGRESS, prog);
              state.progress[prog.vocabId] = prog;
            }
          }

          resolve(data.vocabulary?.length || 0);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  // Import aus CSV (Format: native;foreign;example;category;difficulty)
  async importCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const lines = e.target.result.split('\n').filter(l => l.trim());
          let count = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || (i === 0 && line.toLowerCase().includes('native'))) continue;

            const parts = line.split(';').map(p => p.trim());
            if (parts.length >= 2) {
              const vocab = {
                native: parts[0],
                foreign: parts[1],
                example: parts[2] || '',
                category: parts[3] || '',
                difficulty: parseInt(parts[4]) || 1,
                note: parts[5] || ''
              };
              await this.saveVocab(vocab);
              count++;
            }
          }

          resolve(count);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
};

// ============================================
// UI KOMPONENTEN
// ============================================

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

const Modal = {
  overlay: null,

  init() {
    this.overlay = document.getElementById('modal-overlay');
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  },

  open(title, content, footer = '') {
    const modal = this.overlay.querySelector('.modal');
    modal.innerHTML = `
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="btn btn-ghost btn-icon" onclick="Modal.close()" aria-label="Schließen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;
    this.overlay.classList.add('active');

    // Focus trap
    const focusable = modal.querySelectorAll('button, input, select, textarea');
    if (focusable.length) focusable[0].focus();
  },

  close() {
    this.overlay.classList.remove('active');
  }
};

// ============================================
// VIEWS
// ============================================

const Views = {
  current: 'learn',

  init() {
    // Navigation Events
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) this.show(view);
      });
    });
  },

  show(viewName) {
    // Aktive View wechseln
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const viewEl = document.getElementById(`view-${viewName}`);
    const navEl = document.querySelector(`[data-view="${viewName}"]`);

    if (viewEl) viewEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    this.current = viewName;
    state.currentView = viewName;

    // View-spezifische Initialisierung
    switch (viewName) {
      case 'learn':
        LearnView.init();
        break;
      case 'words':
        WordsView.init();
        break;
      case 'stats':
        StatsView.init();
        break;
      case 'settings':
        SettingsView.init();
        break;
    }
  }
};

// ============================================
// LEARN VIEW
// ============================================

const LearnView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-learn');
    const dueCards = DataManager.getDueCards();
    const newCards = DataManager.getNewCards();
    const errorCards = DataManager.getErrorCards();

    container.innerHTML = `
      ${state.stats.streak > 0 ? `
        <div class="streak-display">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <div class="streak-value">${state.stats.streak}</div>
            <div class="streak-label">Tage in Folge</div>
          </div>
        </div>
      ` : ''}

      <h2 class="mb-md">Lernmodus wählen</h2>

      <div class="mode-selector">
        <button class="mode-card" onclick="LearnView.startSession('flashcard')" aria-label="Karteikarten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <path d="M3 10h18"/>
          </svg>
          <span class="mode-card-title">Karteikarten</span>
          <span class="mode-card-desc">Umdrehen & Merken</span>
        </button>

        <button class="mode-card" onclick="LearnView.startSession('mc')" aria-label="Multiple Choice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span class="mode-card-title">Multiple Choice</span>
          <span class="mode-card-desc">4 Optionen wählen</span>
        </button>

        <button class="mode-card" onclick="LearnView.startSession('typing')" aria-label="Tippen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
          </svg>
          <span class="mode-card-title">Tippen</span>
          <span class="mode-card-desc">Antwort eingeben</span>
        </button>

        <button class="mode-card" onclick="LearnView.startSession('dictation')" aria-label="Diktat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <span class="mode-card-title">Diktat</span>
          <span class="mode-card-desc">Anhören & Schreiben</span>
        </button>
      </div>

      <h2 class="mb-md">Sitzung starten</h2>

      <div class="session-modes">
        <button class="session-mode-btn" onclick="LearnView.startSessionWithCards('due')" ${dueCards.length === 0 ? 'disabled' : ''}>
          <div class="session-mode-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <div>
              <div class="session-mode-title">Heute lernen</div>
              <div class="session-mode-count">${dueCards.length} Karten fällig</div>
            </div>
          </div>
          <span class="badge">${dueCards.length}</span>
        </button>

        <button class="session-mode-btn" onclick="LearnView.startSessionWithCards('new')" ${newCards.length === 0 ? 'disabled' : ''}>
          <div class="session-mode-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <div>
              <div class="session-mode-title">Neue Karten</div>
              <div class="session-mode-count">${newCards.length} ungeübt</div>
            </div>
          </div>
          <span class="badge">${newCards.length}</span>
        </button>

        <button class="session-mode-btn" onclick="LearnView.startSessionWithCards('errors')" ${errorCards.length === 0 ? 'disabled' : ''}>
          <div class="session-mode-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            <div>
              <div class="session-mode-title">Fehler wiederholen</div>
              <div class="session-mode-count">${errorCards.length} Problemkarten</div>
            </div>
          </div>
          <span class="badge badge-error">${errorCards.length}</span>
        </button>
      </div>

      ${state.vocabulary.length === 0 ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3>Keine Vokabeln</h3>
          <p>Füge zuerst Vokabeln hinzu, um mit dem Lernen zu beginnen.</p>
          <button class="btn btn-primary mt-md" onclick="Views.show('words')">
            Vokabeln hinzufügen
          </button>
        </div>
      ` : ''}
    `;
  },

  startSession(mode) {
    state.currentSession = {
      mode,
      cardSet: 'all'
    };
    this.showModeSelection();
  },

  startSessionWithCards(cardSet) {
    state.currentSession = {
      mode: null,
      cardSet
    };
    this.showModeSelection();
  },

  showModeSelection() {
    const session = state.currentSession;

    if (session.mode && !session.cardSet) {
      session.cardSet = 'all';
    }

    if (!session.mode) {
      // Modus-Auswahl zeigen
      Modal.open('Übungsart wählen', `
        <div class="mode-selector">
          <button class="mode-card" onclick="LearnView.selectMode('flashcard')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            <span class="mode-card-title">Karteikarten</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('mc')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span class="mode-card-title">Multiple Choice</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('typing')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
            </svg>
            <span class="mode-card-title">Tippen</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('dictation')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
            <span class="mode-card-title">Diktat</span>
          </button>
        </div>
      `);
      return;
    }

    this.beginSession();
  },

  selectMode(mode) {
    state.currentSession.mode = mode;
    Modal.close();
    this.beginSession();
  },

  beginSession() {
    const session = state.currentSession;
    let cards = [];

    switch (session.cardSet) {
      case 'due':
        cards = DataManager.getDueCards();
        break;
      case 'new':
        cards = DataManager.getNewCards();
        break;
      case 'errors':
        cards = DataManager.getErrorCards();
        break;
      default:
        cards = [...state.vocabulary];
    }

    // Mischen und limitieren
    cards = this.shuffle(cards).slice(0, state.settings.cardsPerSession);

    if (cards.length === 0) {
      Toast.show('Keine Karten verfügbar', 'info');
      return;
    }

    session.cards = cards;
    state.currentCardIndex = 0;
    state.sessionResults = [];

    this.renderExercise();
  },

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  renderExercise() {
    const session = state.currentSession;
    const card = session.cards[state.currentCardIndex];
    const progress = (state.currentCardIndex / session.cards.length) * 100;

    const container = document.getElementById('view-learn');

    container.innerHTML = `
      <div class="session-info">
        <span>Karte ${state.currentCardIndex + 1} von ${session.cards.length}</span>
        <button class="btn btn-ghost btn-icon" onclick="LearnView.endSession()" aria-label="Beenden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div id="exercise-content"></div>
    `;

    const content = document.getElementById('exercise-content');

    switch (session.mode) {
      case 'flashcard':
        this.renderFlashcard(content, card);
        break;
      case 'mc':
        this.renderMultipleChoice(content, card);
        break;
      case 'typing':
        this.renderTyping(content, card);
        break;
      case 'dictation':
        this.renderDictation(content, card);
        break;
    }
  },

  renderFlashcard(container, card) {
    container.innerHTML = `
      <div class="flashcard-container">
        <div class="flashcard" id="flashcard" onclick="LearnView.flipCard()" role="button" tabindex="0" aria-label="Karte umdrehen">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-word">${this.escapeHtml(card.native)}</div>
            ${state.settings.showHints && card.category ? `<div class="flashcard-hint">${this.escapeHtml(card.category)}</div>` : ''}
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-word">${this.escapeHtml(card.foreign)}</div>
            ${card.example ? `<div class="flashcard-example">${this.escapeHtml(card.example)}</div>` : ''}
          </div>
        </div>
      </div>
      <p class="text-center text-muted mb-md">Tippe auf die Karte zum Umdrehen</p>
      <div class="action-row" id="flashcard-actions" style="display: none;">
        <button class="btn btn-error btn-lg" onclick="LearnView.answer(false)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Falsch
        </button>
        <button class="btn btn-success btn-lg" onclick="LearnView.answer(true)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Richtig
        </button>
      </div>
    `;

    // Keyboard support
    document.getElementById('flashcard').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.flipCard();
      }
    });
  },

  flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');

    // Aktionen anzeigen nach erstem Flip
    document.getElementById('flashcard-actions').style.display = 'flex';
  },

  renderMultipleChoice(container, card) {
    // Falsche Optionen generieren
    const otherCards = state.vocabulary.filter(v => v.id !== card.id);
    const wrongOptions = this.shuffle(otherCards)
      .slice(0, CONFIG.MC_OPTIONS_COUNT - 1)
      .map(v => v.foreign);

    const options = this.shuffle([card.foreign, ...wrongOptions]);

    container.innerHTML = `
      <div class="typing-question">
        <div class="text-muted mb-sm">Was heißt...</div>
        <div>${this.escapeHtml(card.native)}</div>
      </div>
      <div class="mc-options">
        ${options.map((opt, i) => `
          <button class="mc-option" data-answer="${this.escapeHtml(opt)}" onclick="LearnView.checkMCAnswer(this, '${this.escapeAttr(card.foreign)}')">
            <span style="font-weight: 600; color: var(--color-primary);">${String.fromCharCode(65 + i)}</span>
            <span>${this.escapeHtml(opt)}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  checkMCAnswer(button, correct) {
    const selected = button.dataset.answer;
    const isCorrect = this.compareAnswers(selected, correct);

    // Alle Buttons deaktivieren
    document.querySelectorAll('.mc-option').forEach(btn => {
      btn.disabled = true;
      if (this.compareAnswers(btn.dataset.answer, correct)) {
        btn.classList.add('correct');
      } else if (btn === button && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    setTimeout(() => this.answer(isCorrect), 1000);
  },

  renderTyping(container, card) {
    container.innerHTML = `
      <div class="typing-question">
        <div class="text-muted mb-sm">Übersetze...</div>
        <div>${this.escapeHtml(card.native)}</div>
      </div>
      <div class="typing-input-wrapper">
        <input type="text" class="form-input typing-input" id="typing-answer"
               placeholder="Deine Antwort..." autocomplete="off" autocapitalize="off" autofocus>
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="LearnView.checkTypingAnswer('${this.escapeAttr(card.foreign)}')">
        Prüfen
      </button>
      <div id="typing-feedback"></div>
    `;

    // Enter-Taste zum Absenden
    document.getElementById('typing-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkTypingAnswer(card.foreign);
      }
    });
  },

  checkTypingAnswer(correct) {
    const input = document.getElementById('typing-answer');
    const answer = input.value.trim();
    const isCorrect = this.compareAnswers(answer, correct);

    const feedback = document.getElementById('typing-feedback');

    if (isCorrect) {
      feedback.innerHTML = `<div class="typing-feedback correct">Richtig!</div>`;
    } else {
      feedback.innerHTML = `
        <div class="typing-feedback incorrect">
          Falsch. Richtig wäre: <strong>${this.escapeHtml(correct)}</strong>
        </div>
      `;
    }

    input.disabled = true;

    setTimeout(() => this.answer(isCorrect), 1500);
  },

  renderDictation(container, card) {
    const speechAvailable = 'speechSynthesis' in window && state.settings.speechEnabled;

    container.innerHTML = `
      <div class="dictation-controls">
        <button class="speak-btn" onclick="LearnView.speak('${this.escapeAttr(card.foreign)}')"
                ${!speechAvailable ? 'disabled title="Sprachausgabe nicht verfügbar"' : ''}
                aria-label="Wort anhören">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p class="text-muted">${speechAvailable ? 'Tippe zum Anhören' : 'Sprachausgabe nicht verfügbar'}</p>
      </div>
      <div class="typing-question">
        <div class="text-muted mb-sm">Schreibe das gehörte Wort</div>
        ${!speechAvailable ? `<div class="text-muted" style="font-size: 0.875rem;">Hinweis: ${this.escapeHtml(card.native)}</div>` : ''}
      </div>
      <div class="typing-input-wrapper">
        <input type="text" class="form-input typing-input" id="dictation-answer"
               placeholder="Deine Antwort..." autocomplete="off" autocapitalize="off">
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="LearnView.checkDictationAnswer('${this.escapeAttr(card.foreign)}')">
        Prüfen
      </button>
      <div id="dictation-feedback"></div>
    `;

    // Automatisch abspielen
    if (speechAvailable) {
      setTimeout(() => this.speak(card.foreign), 500);
    }

    // Enter-Taste
    document.getElementById('dictation-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkDictationAnswer(card.foreign);
      }
    });
  },

  speak(text) {
    if ('speechSynthesis' in window) {
      // Wait for voices to load before speaking
      const doSpeak = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = state.settings.speechLang;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      };

      // Check if voices are already loaded
      if (speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        // Wait for voices to load
        speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
      }
    }
  },

  checkDictationAnswer(correct) {
    const input = document.getElementById('dictation-answer');
    const answer = input.value.trim();
    const isCorrect = this.compareAnswers(answer, correct);

    const feedback = document.getElementById('dictation-feedback');

    if (isCorrect) {
      feedback.innerHTML = `<div class="typing-feedback correct">Richtig!</div>`;
    } else {
      feedback.innerHTML = `
        <div class="typing-feedback incorrect">
          Falsch. Richtig wäre: <strong>${this.escapeHtml(correct)}</strong>
        </div>
      `;
    }

    input.disabled = true;

    setTimeout(() => this.answer(isCorrect), 1500);
  },

  compareAnswers(given, correct) {
    if (!given || !correct) return false;

    let a = given.trim();
    let b = correct.trim();

    if (state.settings.tolerantMode) {
      a = a.toLowerCase();
      b = b.toLowerCase();

      // Umlaute normalisieren
      const normalize = (s) => s
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '');

      return normalize(a) === normalize(b) || a === b.toLowerCase();
    }

    return a === b;
  },

  async answer(isCorrect) {
    const card = state.currentSession.cards[state.currentCardIndex];

    state.sessionResults.push({
      vocabId: card.id,
      correct: isCorrect
    });

    await DataManager.saveProgress(card.id, isCorrect);

    state.currentCardIndex++;

    if (state.currentCardIndex >= state.currentSession.cards.length) {
      this.showResults();
    } else {
      this.renderExercise();
    }
  },

  showResults() {
    const correct = state.sessionResults.filter(r => r.correct).length;
    const total = state.sessionResults.length;
    const percentage = Math.round((correct / total) * 100);

    let message = '';
    if (percentage === 100) message = 'Perfekt! Alle richtig!';
    else if (percentage >= 80) message = 'Sehr gut gemacht!';
    else if (percentage >= 60) message = 'Gut, weiter so!';
    else if (percentage >= 40) message = 'Weiter üben!';
    else message = 'Nicht aufgeben!';

    const container = document.getElementById('view-learn');

    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="results-summary">
            <div class="results-score">${percentage}%</div>
            <div class="results-message">${message}</div>
            <div class="results-details">
              <div class="results-detail">
                <div class="results-detail-value text-success">${correct}</div>
                <div class="results-detail-label">Richtig</div>
              </div>
              <div class="results-detail">
                <div class="results-detail-value text-error">${total - correct}</div>
                <div class="results-detail-label">Falsch</div>
              </div>
            </div>
            <div class="action-row">
              <button class="btn btn-secondary" onclick="LearnView.init()">
                Zurück
              </button>
              <button class="btn btn-primary" onclick="LearnView.beginSession()">
                Nochmal
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Session zurücksetzen
    state.currentSession = null;
  },

  endSession() {
    if (state.sessionResults.length > 0) {
      if (confirm('Sitzung wirklich beenden?')) {
        state.currentSession = null;
        this.init();
      }
    } else {
      state.currentSession = null;
      this.init();
    }
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeAttr(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
};

// ============================================
// WORDS VIEW
// ============================================

const WordsView = {
  filter: '',
  category: '',

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-words');

    // Kategorien sammeln
    const categories = [...new Set(state.vocabulary.map(v => v.category).filter(Boolean))];

    // Filtern
    let filtered = state.vocabulary;
    if (this.filter) {
      const f = this.filter.toLowerCase();
      filtered = filtered.filter(v =>
        v.native.toLowerCase().includes(f) ||
        v.foreign.toLowerCase().includes(f)
      );
    }
    if (this.category) {
      filtered = filtered.filter(v => v.category === this.category);
    }

    container.innerHTML = `
      <div class="search-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="form-input search-input" placeholder="Suchen..."
               value="${this.escapeHtml(this.filter)}" oninput="WordsView.setFilter(this.value)">
      </div>

      ${categories.length > 0 ? `
        <div class="filter-chips">
          <button class="filter-chip ${!this.category ? 'active' : ''}" onclick="WordsView.setCategory('')">Alle</button>
          ${categories.map(cat => `
            <button class="filter-chip ${this.category === cat ? 'active' : ''}"
                    onclick="WordsView.setCategory('${this.escapeAttr(cat)}')">${this.escapeHtml(cat)}</button>
          `).join('')}
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
        <span class="text-muted">${filtered.length} Vokabeln</span>
        <button class="btn btn-primary" onclick="WordsView.showAddModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Hinzufügen
        </button>
      </div>

      ${filtered.length === 0 ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3>Keine Vokabeln</h3>
          <p>${this.filter || this.category ? 'Keine Treffer für diese Filter.' : 'Füge deine ersten Vokabeln hinzu!'}</p>
        </div>
      ` : `
        <div class="vocab-list">
          ${filtered.map(vocab => this.renderVocabItem(vocab)).join('')}
        </div>
      `}
    `;
  },

  renderVocabItem(vocab) {
    const progress = state.progress[vocab.id];
    const level = progress ? progress.level : -1;

    return `
      <div class="vocab-item">
        <div class="vocab-item-content">
          <div class="vocab-item-native">${this.escapeHtml(vocab.native)}</div>
          <div class="vocab-item-foreign">${this.escapeHtml(vocab.foreign)}</div>
          <div class="vocab-item-meta">
            ${vocab.category ? `<span class="badge">${this.escapeHtml(vocab.category)}</span> ` : ''}
            ${this.renderDifficulty(vocab.difficulty || 1)}
            ${level >= 0 ? ` · Level ${level + 1}` : ' · Neu'}
          </div>
        </div>
        <div class="vocab-item-actions">
          <button class="btn btn-ghost btn-icon" onclick="WordsView.showEditModal('${vocab.id}')" aria-label="Bearbeiten">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-ghost btn-icon" onclick="WordsView.deleteVocab('${vocab.id}')" aria-label="Löschen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  renderDifficulty(level) {
    return `
      <span class="difficulty">
        ${[1, 2, 3].map(i => `<span class="difficulty-dot ${i <= level ? 'filled' : ''}"></span>`).join('')}
      </span>
    `;
  },

  setFilter(value) {
    this.filter = value;
    this.render();
  },

  setCategory(cat) {
    this.category = cat;
    this.render();
  },

  showAddModal() {
    Modal.open('Neue Vokabel', this.getVocabForm(), `
      <button class="btn btn-secondary" onclick="Modal.close()">Abbrechen</button>
      <button class="btn btn-primary" onclick="WordsView.saveVocab()">Speichern</button>
    `);

    document.getElementById('vocab-native').focus();
  },

  showEditModal(id) {
    const vocab = state.vocabulary.find(v => v.id === id);
    if (!vocab) return;

    Modal.open('Vokabel bearbeiten', this.getVocabForm(vocab), `
      <button class="btn btn-secondary" onclick="Modal.close()">Abbrechen</button>
      <button class="btn btn-primary" onclick="WordsView.saveVocab('${id}')">Speichern</button>
    `);
  },

  getVocabForm(vocab = {}) {
    return `
      <form id="vocab-form" onsubmit="event.preventDefault(); WordsView.saveVocab('${vocab.id || ''}');">
        <div class="form-group">
          <label class="form-label" for="vocab-native">Muttersprache (z.B. Deutsch) *</label>
          <input type="text" class="form-input" id="vocab-native" required
                 value="${this.escapeHtml(vocab.native || '')}" placeholder="z.B. Hund">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-foreign">Fremdsprache (z.B. Englisch) *</label>
          <input type="text" class="form-input" id="vocab-foreign" required
                 value="${this.escapeHtml(vocab.foreign || '')}" placeholder="z.B. dog">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-example">Beispielsatz (optional)</label>
          <textarea class="form-input" id="vocab-example" rows="2"
                    placeholder="z.B. The dog is running.">${this.escapeHtml(vocab.example || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-category">Kategorie/Unit (optional)</label>
          <input type="text" class="form-input" id="vocab-category"
                 value="${this.escapeHtml(vocab.category || '')}" placeholder="z.B. Unit 1, Tiere">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-difficulty">Schwierigkeit</label>
          <select class="form-input" id="vocab-difficulty">
            <option value="1" ${vocab.difficulty === 1 ? 'selected' : ''}>Leicht</option>
            <option value="2" ${vocab.difficulty === 2 ? 'selected' : ''}>Mittel</option>
            <option value="3" ${vocab.difficulty === 3 ? 'selected' : ''}>Schwer</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-note">Notiz (optional)</label>
          <textarea class="form-input" id="vocab-note" rows="2"
                    placeholder="z.B. Merkhilfe...">${this.escapeHtml(vocab.note || '')}</textarea>
        </div>
      </form>
    `;
  },

  async saveVocab(id = '') {
    const native = document.getElementById('vocab-native').value.trim();
    const foreign = document.getElementById('vocab-foreign').value.trim();

    if (!native || !foreign) {
      Toast.show('Bitte fülle die Pflichtfelder aus', 'error');
      return;
    }

    const vocab = {
      id: id || undefined,
      native,
      foreign,
      example: document.getElementById('vocab-example').value.trim(),
      category: document.getElementById('vocab-category').value.trim(),
      difficulty: parseInt(document.getElementById('vocab-difficulty').value),
      note: document.getElementById('vocab-note').value.trim()
    };

    if (id) {
      const existing = state.vocabulary.find(v => v.id === id);
      if (existing) {
        vocab.createdAt = existing.createdAt;
      }
    }

    await DataManager.saveVocab(vocab);
    Modal.close();
    Toast.show(id ? 'Vokabel aktualisiert' : 'Vokabel hinzugefügt', 'success');
    this.render();
  },

  async deleteVocab(id) {
    if (!confirm('Vokabel wirklich löschen?')) return;

    await DataManager.deleteVocab(id);
    Toast.show('Vokabel gelöscht', 'info');
    this.render();
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeAttr(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
};

// ============================================
// STATS VIEW
// ============================================

const StatsView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-stats');

    const totalVocab = state.vocabulary.length;
    const learnedVocab = Object.keys(state.progress).length;
    const masteredVocab = Object.values(state.progress).filter(p => p.level >= 3).length;
    const accuracy = state.stats.totalReviews > 0
      ? Math.round((state.stats.correctAnswers / state.stats.totalReviews) * 100)
      : 0;

    // Top Fehlerwörter
    const errorWords = state.vocabulary
      .filter(v => state.progress[v.id])
      .map(v => {
        const progress = state.progress[v.id];
        const total = progress.correctCount + progress.incorrectCount;
        const errorRate = total > 0 ? (progress.incorrectCount / total) : 0;
        return { ...v, errorRate };
      })
      .filter(v => v.errorRate > 0.3)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);

    // Heute
    const today = new Date().toISOString().split('T')[0];
    const todayStats = state.stats.dailyStats[today] || { reviews: 0, correct: 0 };

    container.innerHTML = `
      ${state.stats.streak > 0 ? `
        <div class="streak-display">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <div class="streak-value">${state.stats.streak}</div>
            <div class="streak-label">Tage Streak</div>
          </div>
        </div>
      ` : ''}

      <h2 class="mb-md">Übersicht</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${totalVocab}</div>
          <div class="stat-label">Vokabeln gesamt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${learnedVocab}</div>
          <div class="stat-label">Gelernt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${masteredVocab}</div>
          <div class="stat-label">Gemeistert</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">Genauigkeit</div>
        </div>
      </div>

      <h2 class="mb-md">Heute</h2>

      <div class="card mb-lg">
        <div class="card-body">
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${todayStats.reviews}</div>
              <div class="text-muted">Wiederholungen</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${todayStats.correct}</div>
              <div class="text-muted">Richtig</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-error);">${todayStats.reviews - todayStats.correct}</div>
              <div class="text-muted">Falsch</div>
            </div>
          </div>
        </div>
      </div>

      ${errorWords.length > 0 ? `
        <h2 class="mb-md">Problemwörter</h2>
        <div class="card">
          <div class="card-body">
            <div class="vocab-list">
              ${errorWords.map(word => `
                <div class="vocab-item" style="border: none; padding: var(--space-sm) 0;">
                  <div class="vocab-item-content">
                    <div class="vocab-item-native">${this.escapeHtml(word.native)}</div>
                    <div class="vocab-item-foreign">${this.escapeHtml(word.foreign)}</div>
                  </div>
                  <span class="badge badge-error">${Math.round(word.errorRate * 100)}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <h2 class="mb-md mt-lg">Statistiken</h2>
      <div class="card">
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <div style="display: flex; justify-content: space-between;">
              <span>Gesamte Wiederholungen</span>
              <strong>${state.stats.totalReviews}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Davon richtig</span>
              <strong>${state.stats.correctAnswers}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Längster Streak</span>
              <strong>${state.stats.streak} Tage</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ============================================
// SETTINGS VIEW
// ============================================

const SettingsView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-settings');

    container.innerHTML = `
      <div class="settings-section">
        <h3>Darstellung</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Design</div>
            <div class="settings-item-desc">Hell, Dunkel oder System</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setTheme(this.value)">
            <option value="system" ${state.settings.theme === 'system' ? 'selected' : ''}>System</option>
            <option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>Hell</option>
            <option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>Dunkel</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Lernen</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Toleranter Modus</div>
            <div class="settings-item-desc">Groß-/Kleinschreibung ignorieren</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.tolerantMode ? 'checked' : ''}
                   onchange="SettingsView.setSetting('tolerantMode', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Hinweise anzeigen</div>
            <div class="settings-item-desc">Kategorie bei Karteikarten</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.showHints ? 'checked' : ''}
                   onchange="SettingsView.setSetting('showHints', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Karten pro Sitzung</div>
            <div class="settings-item-desc">Maximale Anzahl</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setSetting('cardsPerSession', parseInt(this.value))">
            ${[5, 10, 15, 20, 30, 50].map(n => `
              <option value="${n}" ${state.settings.cardsPerSession === n ? 'selected' : ''}>${n}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Sprache & Audio</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Sprachausgabe</div>
            <div class="settings-item-desc">Für Diktat-Modus</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.speechEnabled ? 'checked' : ''}
                   onchange="SettingsView.setSetting('speechEnabled', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Sound-Effekte</div>
            <div class="settings-item-desc">Bei richtig/falsch</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.soundEnabled ? 'checked' : ''}
                   onchange="SettingsView.setSetting('soundEnabled', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Fremdsprache</div>
            <div class="settings-item-desc">Für Aussprache</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setSetting('speechLang', this.value)">
            <option value="en-US" ${state.settings.speechLang === 'en-US' ? 'selected' : ''}>Englisch (US)</option>
            <option value="en-GB" ${state.settings.speechLang === 'en-GB' ? 'selected' : ''}>Englisch (UK)</option>
            <option value="fr-FR" ${state.settings.speechLang === 'fr-FR' ? 'selected' : ''}>Französisch</option>
            <option value="es-ES" ${state.settings.speechLang === 'es-ES' ? 'selected' : ''}>Spanisch</option>
            <option value="it-IT" ${state.settings.speechLang === 'it-IT' ? 'selected' : ''}>Italienisch</option>
            <option value="de-DE" ${state.settings.speechLang === 'de-DE' ? 'selected' : ''}>Deutsch</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Daten</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Daten exportieren</div>
            <div class="settings-item-desc">Als JSON-Backup</div>
          </div>
          <button class="btn btn-secondary" onclick="DataManager.exportData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">JSON importieren</div>
            <div class="settings-item-desc">Backup wiederherstellen</div>
          </div>
          <div class="file-input-wrapper">
            <input type="file" class="file-input" id="import-json" accept=".json"
                   onchange="SettingsView.importJSON(this.files[0])">
            <button class="btn btn-secondary" onclick="document.getElementById('import-json').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import
            </button>
          </div>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">CSV importieren</div>
            <div class="settings-item-desc">Format: native;foreign;example;category;difficulty</div>
          </div>
          <div class="file-input-wrapper">
            <input type="file" class="file-input" id="import-csv" accept=".csv,.txt"
                   onchange="SettingsView.importCSV(this.files[0])">
            <button class="btn btn-secondary" onclick="document.getElementById('import-csv').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              CSV
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>Gefahrenzone</h3>

        <div class="settings-item" style="border-color: var(--color-error);">
          <div>
            <div class="settings-item-label">Alle Daten löschen</div>
            <div class="settings-item-desc">Unwiderruflich!</div>
          </div>
          <button class="btn btn-error" onclick="SettingsView.clearAllData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Löschen
          </button>
        </div>
      </div>

      <div class="text-center text-muted mt-lg">
        <p>Vokabel Master+ v1.0</p>
        <p style="font-size: 0.75rem;">Made with ❤️ for learners</p>
      </div>
    `;
  },

  async setTheme(theme) {
    await DataManager.saveSettings({ theme });
    // Also save to localStorage for FOUC prevention script in index.html
    localStorage.setItem('vokabel-theme', theme);
    applyTheme(theme);
  },

  async setSetting(key, value) {
    await DataManager.saveSettings({ [key]: value });
  },

  async importJSON(file) {
    if (!file) return;
    try {
      const count = await DataManager.importJSON(file);
      Toast.show(`${count} Vokabeln importiert`, 'success');
      await DataManager.loadAll();
      this.render();
    } catch (error) {
      Toast.show('Fehler beim Import', 'error');
      console.error(error);
    }
  },

  async importCSV(file) {
    if (!file) return;
    try {
      const count = await DataManager.importCSV(file);
      Toast.show(`${count} Vokabeln importiert`, 'success');
      await DataManager.loadAll();
      this.render();
    } catch (error) {
      Toast.show('Fehler beim Import', 'error');
      console.error(error);
    }
  },

  async clearAllData() {
    if (!confirm('Wirklich ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden!')) return;
    if (!confirm('Bist du sicher? Alle Vokabeln und Fortschritte gehen verloren!')) return;

    await DB.clear(CONFIG.STORE_VOCAB);
    await DB.clear(CONFIG.STORE_PROGRESS);
    await DB.clear(CONFIG.STORE_STATS);

    state.vocabulary = [];
    state.progress = {};
    state.stats = {
      totalReviews: 0,
      correctAnswers: 0,
      streak: 0,
      lastStudyDate: null,
      dailyStats: {}
    };

    Toast.show('Alle Daten gelöscht', 'info');
    Views.show('learn');
  }
};

// ============================================
// THEME HANDLING
// ============================================

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

// System theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.settings.theme === 'system') {
    applyTheme('system');
  }
});

// ============================================
// PWA INSTALL PROMPT
// ============================================

let deferredPrompt = null;

function setupInstallPrompt() {
  const installButton = document.getElementById('install-button');
  if (!installButton) return;

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.classList.add('show');
  });

  // Handle install button click
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      Toast.show('App wird installiert!', 'success');
    }

    deferredPrompt = null;
    installButton.classList.remove('show');
  });

  // Hide button if app is already installed
  window.addEventListener('appinstalled', () => {
    installButton.classList.remove('show');
    deferredPrompt = null;
    Toast.show('App erfolgreich installiert!', 'success');
  });

  // Check if running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    installButton.classList.remove('show');
  }
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registriert:', registration.scope);
    } catch (error) {
      console.error('Service Worker Fehler:', error);
    }
  }
}

// ============================================
// APP INITIALIZATION
// ============================================

async function initApp() {
  try {
    // Service Worker registrieren
    await registerServiceWorker();

    // PWA Install Prompt einrichten
    setupInstallPrompt();

    // Datenbank öffnen
    await DB.open();

    // Daten laden
    await DataManager.loadAll();

    // Theme anwenden
    applyTheme(state.settings.theme);

    // UI Komponenten initialisieren
    Toast.init();
    Modal.init();
    Views.init();

    // Start-View anzeigen
    Views.show('learn');

    console.log('Vokabel Master+ initialisiert');

  } catch (error) {
    console.error('Initialisierung fehlgeschlagen:', error);
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Fehler</h1>
        <p>Die App konnte nicht geladen werden.</p>
        <p>${error.message}</p>
        <button onclick="location.reload()">Neu laden</button>
      </div>
    `;
  }
}

// App starten wenn DOM geladen
document.addEventListener('DOMContentLoaded', initApp);

// Prevent zoom on double-tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Keyboard shortcut for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    Modal.close();
  }
});
