import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { REFORMATION_CHAPTERS, ChapterData, MentorData } from '../data/chapters';
import { REFORMATION_ITEMS, REFORMATION_RECIPES, ReformationItemId } from '../data/items';
import { REFORMATION_LEXICON, LexiconEntry } from '../data/lexicon';
import { REFORMATION_RELICS, ReformationRelic } from '../data/relics';
import { REFORMATION_STATIONS, DidacticStation } from '../data/stations';
import { REFORMATION_DILEMMAS } from '../data/dilemmas';
import { gameState, REFORMATION_ROLES } from '../systems/GameState';
import { ReformationPlayerGender, ReformationPlayerRole } from '../systems/SaveManager';
import { TouchControls } from '../ui/TouchControls';
import { PrintSheet } from '../ui/PrintSheet';
import { DilemmaModal } from '../ui/DilemmaModal';

export type ModalType =
  | 'none'
  | 'start'
  | 'dialog'
  | 'relic'
  | 'station'
  | 'inventory'
  | 'craft'
  | 'lexicon'
  | 'pause'
  | 'dilemma';

export class UIScene extends Phaser.Scene {
  public touchControls!: TouchControls;
  private activeModal: ModalType = 'start';
  private uiRoot!: HTMLDivElement;
  private hudHeader!: HTMLDivElement;
  private questBox!: HTMLDivElement;
  private modalOverlay!: HTMLDivElement;
  private toastContainer!: HTMLDivElement;
  private dilemmaModal = new DilemmaModal();
  private printSheet = new PrintSheet();

  private selectedLexiconId: string = REFORMATION_LEXICON[0].id;
  private lexiconFilterCategory: string = 'Alle';

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.initDOMStructure();
    this.touchControls = new TouchControls((key) => this.handleShortcutKey(key));
    (window as any).__touchControls = this.touchControls;

    this.registerKeyboardShortcuts();

    gameState.subscribe(() => {
      this.renderHUD();
      this.renderQuestTracker();
    });

    this.renderHUD();
    this.renderQuestTracker();
    this.openStartScreen();
  }

  private initDOMStructure(): void {
    this.uiRoot = document.getElementById('ui-layer') as HTMLDivElement;
    if (!this.uiRoot) {
      this.uiRoot = document.createElement('div');
      this.uiRoot.id = 'ui-layer';
      document.body.appendChild(this.uiRoot);
    }
    this.uiRoot.innerHTML = `
      <div id="hud-top-bar" class="hud-top-bar"></div>
      <div id="quest-tracker-box" class="quest-tracker-box"></div>
      <div id="modal-overlay" class="modal-overlay" style="display: none;"></div>
      <div id="toast-container" class="toast-container"></div>
    `;

    this.hudHeader = document.getElementById('hud-top-bar') as HTMLDivElement;
    this.questBox = document.getElementById('quest-tracker-box') as HTMLDivElement;
    this.modalOverlay = document.getElementById('modal-overlay') as HTMLDivElement;
    this.toastContainer = document.getElementById('toast-container') as HTMLDivElement;
  }

  private registerKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      if (this.activeModal !== 'none' && this.activeModal !== 'start') {
        if (e.key === 'Escape') {
          this.closeModal();
        }
        return;
      }
      this.handleShortcutKey(e.key.toUpperCase());
    });
  }

  private handleShortcutKey(key: string): void {
    if (key === 'ESCAPE' || key === 'ESC') {
      if (this.activeModal !== 'none') this.closeModal();
      else this.openPauseDashboard();
    } else if (key === 'I') {
      if (this.activeModal === 'inventory') this.closeModal();
      else this.openInventory();
    } else if (key === 'L') {
      if (this.activeModal === 'lexicon') this.closeModal();
      else this.openLexiconModal();
    } else if (key === 'U') {
      this.printSheet.print();
    }
  }

  public renderHUD(): void {
    if (!this.hudHeader) return;
    const curCh = gameState.getChapterData();
    const isMuted = sound.isMuted();

    this.hudHeader.innerHTML = `
      <div class="hud-left">
        <span class="hud-ch-badge">KAPITEL ${curCh.number}: ${curCh.year}</span>
        <span class="hud-player-badge">📜 ${gameState.playerName} (${gameState.getChronistenRang().title})</span>
        <span class="hud-pts-badge">⭐ ${gameState.getEpochenPunkte()} Pkt</span>
      </div>
      <div class="hud-right">
        <button id="btn-audio" class="hud-btn" title="Ton an/aus">${isMuted ? '🔇' : '🎵'}</button>
        <button id="btn-inv" class="hud-btn" title="Chronik-Tasche [I]">🎒 Tasche</button>
        <button id="btn-lex" class="hud-btn" title="Geschichtslexikon [L]">📖 Lexikon</button>
        <button id="btn-pause" class="hud-btn" title="Pause / Chronik [ESC]">⚙️ Menü</button>
      </div>
    `;

    document.getElementById('btn-audio')?.addEventListener('click', () => {
      sound.toggleMute();
      this.renderHUD();
    });
    document.getElementById('btn-inv')?.addEventListener('click', () => this.openInventory());
    document.getElementById('btn-lex')?.addEventListener('click', () => this.openLexiconModal());
    document.getElementById('btn-pause')?.addEventListener('click', () => this.openPauseDashboard());
  }

  public renderQuestTracker(): void {
    if (!this.questBox) return;
    const curCh = gameState.getChapterData();
    const objectives = curCh.objectives;
    const stateObj = gameState.chapterObjectives[curCh.number] || [false, false, false, false];

    this.questBox.innerHTML = `
      <div class="quest-box-inner">
        <div class="quest-header">
          <span class="quest-title">KAPITEL ${curCh.number}: ${curCh.title}</span>
          <span class="quest-year">${curCh.year}</span>
        </div>
        <div class="quest-primary">${curCh.primaryObjective}</div>
        <div class="quest-checklist">
          ${objectives
            .map(
              (obj, idx) => `
            <div class="quest-item ${stateObj[idx] ? 'completed' : ''}">
              <span class="check-box">${stateObj[idx] ? '✓' : '○'}</span>
              <span class="obj-text">${obj}</span>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="quest-footer">
          <span>Ort: <strong>${curCh.location}</strong></span>
        </div>
      </div>
    `;
  }

  public openStartScreen(): void {
    this.activeModal = 'start';
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="start-screen-card">
        <div class="parchment-border-outer">
          <div class="start-header">
            <span class="sub-lead">16-Bit Geschichtslernspiel • Staatliche Regelschule Heimbürgeschule Kahla</span>
            <h1 class="main-title">Die Reformation</h1>
            <h2 class="sub-title">Glaube, Macht & die Medienrevolution (1517–1555)</h2>
          </div>

          <div class="start-intro-text">
            Wittenberg im Herbst 1517: Der Dominikanermönch Johann Tetzel zieht durchs Land, um Ablassbriefe zu verkaufen.
            Als junger Gehilfe im Cranach-Hof wirst du Zeuge der ersten Medienrevolution der Geschichte.
            Drucke Flugblätter, begleite Martin Luther nach Worms, übersetze die Bibel auf der Wartburg und gestalte den Augsburger Religionsfrieden!
          </div>

          <div class="start-form-section">
            <div class="form-row">
              <label>Name des Chronisten / Schülers:</label>
              <input type="text" id="input-player-name" value="${gameState.playerName}" maxlength="18" class="start-input" />
            </div>

            <div class="form-row">
              <label>Rolle & Schwerpunkt:</label>
              <div class="role-selection-grid">
                ${REFORMATION_ROLES.map(
                  (r) => `
                  <div class="role-card ${r.id === gameState.role ? 'selected' : ''}" data-role="${r.id}">
                    <div class="role-card-header">
                      <strong>${r.name}</strong>
                    </div>
                    <p class="role-desc">${r.description}</p>
                    <div class="role-bonus">${r.bonusText}</div>
                  </div>
                `
                ).join('')}
              </div>
            </div>
          </div>

          <div class="start-actions">
            <button id="btn-start-adventure" class="btn-primary-large">Abenteuer in Wittenberg beginnen ➔</button>
          </div>
        </div>
      </div>
    `;

    // Role selection click
    const cards = this.modalOverlay.querySelectorAll('.role-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        cards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        gameState.role = card.getAttribute('data-role') as ReformationPlayerRole;
        sound.click();
      });
    });

    document.getElementById('btn-start-adventure')?.addEventListener('click', () => {
      const input = document.getElementById('input-player-name') as HTMLInputElement;
      if (input && input.value.trim()) {
        gameState.playerName = input.value.trim();
      }
      sound.success();
      this.closeModal();
      this.showToast(`Willkommen in Wittenberg, ${gameState.playerName}!`);
    });
  }

  public openMentorDialog(mentor: MentorData): void {
    this.activeModal = 'dialog';
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="dialog-box-card">
        <div class="dialog-speaker-header">
          <div class="portrait-box">
            <img src="/assets/icons/relic_codex.png" class="portrait-img" alt="${mentor.name}" />
          </div>
          <div class="speaker-info">
            <h2 class="speaker-name">${mentor.name}</h2>
            <span class="speaker-role">${mentor.role}</span>
          </div>
        </div>

        <div class="dialog-content">
          <p class="dialog-speech-text">${mentor.speech}</p>
        </div>

        <div class="dialog-actions">
          <button id="btn-dialog-close" class="btn-primary">Verstanden, ich mache mich an die Arbeit ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btn-dialog-close')?.addEventListener('click', () => {
      sound.click();
      this.closeModal();
    });
  }

  public openRelicModal(relic: ReformationRelic): void {
    this.activeModal = 'relic';
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="relic-modal-card">
        <div class="relic-header">
          <span class="relic-epoch">${relic.epoch} • ${relic.year}</span>
          <h2 class="relic-name">${relic.name}</h2>
          <span class="relic-location">Fundort: ${relic.location}</span>
        </div>

        <div class="relic-body">
          <div class="relic-icon-center">
            <img src="${relic.icon}" class="relic-large-icon" alt="${relic.name}" />
          </div>
          <p class="relic-desc">${relic.description}</p>
          <div class="relic-significance">
            <strong>Historische Bedeutung:</strong> ${relic.historicalSignificance}
          </div>

          <div class="relic-quiz-box">
            <div class="quiz-question">${relic.question}</div>
            <div class="quiz-options">
              ${relic.options
                .map(
                  (opt, idx) => `
                <button class="quiz-opt-btn" data-index="${idx}">${opt}</button>
              `
                )
                .join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback" style="display:none;"></div>
          </div>
        </div>

        <div class="relic-footer">
          <button id="btn-relic-close" class="btn-sub">Schließen [ESC]</button>
        </div>
      </div>
    `;

    const btns = this.modalOverlay.querySelectorAll('.quiz-opt-btn');
    const fb = document.getElementById('quiz-feedback');

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
        btns.forEach((b) => (b as HTMLButtonElement).disabled = true);

        if (fb) {
          fb.style.display = 'block';
          if (idx === relic.correctOption) {
            fb.className = 'quiz-feedback correct';
            fb.innerHTML = `✓ Richtig! ${relic.explanation}`;
            sound.success();
            gameState.discoverRelic(relic.id);
            gameState.completeObjective(gameState.chapter, 3);
          } else {
            fb.className = 'quiz-feedback wrong';
            fb.innerHTML = `✕ Leider nicht ganz richtig. Hinweis: ${relic.explanation}`;
            sound.click();
            gameState.discoverRelic(relic.id);
          }
        }
      });
    });

    document.getElementById('btn-relic-close')?.addEventListener('click', () => this.closeModal());
  }

  public openInventory(): void {
    this.activeModal = 'inventory';
    this.modalOverlay.style.display = 'flex';

    const items = Object.entries(gameState.inventory);

    this.modalOverlay.innerHTML = `
      <div class="inventory-card">
        <div class="modal-header">
          <h2>🎒 Chronik-Tasche & Werkstatt</h2>
          <button id="btn-inv-close" class="btn-close">✕</button>
        </div>

        <div class="inv-split-container">
          <div class="inv-left">
            <h3>Mitgeführte Gegenstände</h3>
            <div class="inv-grid">
              ${
                items.length > 0
                  ? items
                      .map(([id, count]) => {
                        const itemDef = REFORMATION_ITEMS[id as ReformationItemId];
                        return `
                        <div class="inv-item-slot">
                          <img src="${itemDef?.icon || '/assets/icons/relic_codex.png'}" class="slot-icon" />
                          <div class="slot-info">
                            <strong>${itemDef?.name || id}</strong>
                            <span>Anzahl: ${count}</span>
                          </div>
                        </div>
                      `;
                      })
                      .join('')
                  : '<div class="empty-hint">Tasche ist leer. Sammle Papier, Holz und Lettern in der Werkstatt!</div>'
              }
            </div>
          </div>

          <div class="inv-right">
            <h3>Druckerei & Handwerk (Rezepte)</h3>
            <div class="recipes-list">
              ${REFORMATION_RECIPES.map(
                (r) => `
                <div class="recipe-card">
                  <div class="recipe-header">
                    <strong>${r.name}</strong>
                    <span class="recipe-desc">${r.description}</span>
                  </div>
                  <div class="recipe-costs">
                    Zutaten: ${r.ingredients.map((ing) => `${ing.count}x ${REFORMATION_ITEMS[ing.item]?.name || ing.item}`).join(', ')}
                  </div>
                  <button class="btn-craft" data-recipe="${r.id}">Herstellen ➔</button>
                </div>
              `
              ).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-inv-close')?.addEventListener('click', () => this.closeModal());

    const craftBtns = this.modalOverlay.querySelectorAll('.btn-craft');
    craftBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const recId = btn.getAttribute('data-recipe');
        if (recId) {
          const success = gameState.craft(recId);
          if (success) {
            sound.success();
            this.showToast('Gegenstand erfolgreich hergestellt!');
            this.openInventory();
          } else {
            sound.click();
            this.showToast('Nicht genügend Rohstoffe vorhanden!');
          }
        }
      });
    });
  }

  public openLexiconModal(): void {
    this.activeModal = 'lexicon';
    this.modalOverlay.style.display = 'flex';

    const selectedEntry = REFORMATION_LEXICON.find((l) => l.id === this.selectedLexiconId) || REFORMATION_LEXICON[0];

    this.modalOverlay.innerHTML = `
      <div class="lexicon-card">
        <div class="modal-header">
          <h2>📖 Historisches Reformationslexikon</h2>
          <button id="btn-lex-close" class="btn-close">✕</button>
        </div>

        <div class="lexicon-split">
          <div class="lex-list-col">
            ${REFORMATION_LEXICON.map(
              (l) => `
              <div class="lex-list-item ${l.id === this.selectedLexiconId ? 'active' : ''}" data-id="${l.id}">
                <strong>${l.term}</strong>
                <span class="lex-cat">${l.category}</span>
              </div>
            `
            ).join('')}
          </div>

          <div class="lex-detail-col">
            <span class="detail-cat">${selectedEntry.category}</span>
            <h3 class="detail-term">${selectedEntry.term}</h3>
            <div class="detail-def">
              <strong>Definition:</strong> ${selectedEntry.definition}
            </div>
            <div class="detail-context">
              <strong>Historischer Kontext:</strong> ${selectedEntry.historicalContext}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-lex-close')?.addEventListener('click', () => this.closeModal());

    const items = this.modalOverlay.querySelectorAll('.lex-list-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) {
          this.selectedLexiconId = id;
          sound.click();
          gameState.markLexiconRead(id);
          this.openLexiconModal();
        }
      });
    });
  }

  public openPauseDashboard(): void {
    this.activeModal = 'pause';
    this.modalOverlay.style.display = 'flex';

    const rang = gameState.getChronistenRang();

    this.modalOverlay.innerHTML = `
      <div class="pause-card">
        <div class="modal-header">
          <h2>⚙️ Chronisten-Dashboard & Einstellungen</h2>
          <button id="btn-pause-close" class="btn-close">✕</button>
        </div>

        <div class="pause-grid-7">
          <div class="pause-tile">
            <span class="tile-icon">🏆</span>
            <strong>${rang.title}</strong>
            <span>${gameState.getEpochenPunkte()} Epochenpunkte</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">📜</span>
            <strong>Kapitel ${gameState.chapter} / 8</strong>
            <span>${gameState.completedChapters.size} abgeschlossen</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">🔍</span>
            <strong>${gameState.discoveredRelics.size} / ${REFORMATION_RELICS.length} Quellen</strong>
            <span>geborgen & geprüft</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">📖</span>
            <strong>${gameState.lexiconRead.size} / ${REFORMATION_LEXICON.length} Begriffe</strong>
            <span>im Lexikon studiert</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">🧭</span>
            <strong>${Math.round(gameState.walkedDistanceMeters)} Meter</strong>
            <span>durchs Reich gereist</span>
          </div>
          <div class="pause-tile" id="tile-print-hefter" style="cursor: pointer; background: #fef3c7;">
            <span class="tile-icon">🖨️</span>
            <strong>A4-Hefterblatt</strong>
            <span style="color:#b45309; font-weight:700;">Jetzt drucken [U]</span>
          </div>
          <div class="pause-tile" id="tile-audio-setting" style="cursor: pointer;">
            <span class="tile-icon">${sound.isMuted() ? '🔇' : '🎵'}</span>
            <strong>Klangkulisse</strong>
            <span>${sound.isMuted() ? 'Stumm geschaltet' : 'Aktiviert (WebAudio)'}</span>
          </div>
        </div>

        <div class="pause-footer-actions">
          <button id="btn-save-state" class="btn-sub">💾 Spielstand sichern</button>
          <button id="btn-resume" class="btn-primary">Weiterspielen ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btn-pause-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.closeModal());
    document.getElementById('tile-print-hefter')?.addEventListener('click', () => {
      this.printSheet.print();
    });
    document.getElementById('tile-audio-setting')?.addEventListener('click', () => {
      sound.toggleMute();
      this.openPauseDashboard();
    });
    document.getElementById('btn-save-state')?.addEventListener('click', () => {
      gameState.autoSave();
      sound.success();
      this.showToast('Spielstand im Browser gespeichert!');
    });
  }

  public closeModal(): void {
    this.activeModal = 'none';
    this.modalOverlay.style.display = 'none';
  }

  public showToast(msg: string): void {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'retro-toast';
    toast.textContent = msg;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }
}
