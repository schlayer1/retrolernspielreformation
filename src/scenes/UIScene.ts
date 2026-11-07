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
        <div id="hud-compass" class="hud-compass-box">
          ${gameState.compassText || '🧭 <strong>Ziel:</strong> Folge dem goldenen Wegweiser'}
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

  public openMentorDialog(mentor: MentorData, onClose?: () => void): void {
    this.activeModal = 'dialog';
    this.modalOverlay.style.display = 'flex';

    const pKey = mentor.portraitKey || 'luther_young';
    const neutralSrc = `/assets/portraits/${pKey}_neutral.png`;
    const happySrc = `/assets/portraits/${pKey}_happy.png`;

    const hasDilemma = REFORMATION_DILEMMAS.some(
      (d) => d.chapter === gameState.chapter && !gameState.storyFlags[`dilemma_ch${d.chapter}_done`]
    );

    this.modalOverlay.innerHTML = `
      <div class="dialog-box-card">
        <div class="dialog-speaker-header">
          <div class="portrait-box-64">
            <img id="mentor-portrait-img" src="${neutralSrc}" class="portrait-img-64" alt="${mentor.name}" />
          </div>
          <div class="speaker-info">
            <h2 class="speaker-name">${mentor.name}</h2>
            <span class="speaker-role">${mentor.role}</span>
          </div>
        </div>

        <div class="dialog-content">
          <p class="dialog-speech-text">${mentor.speech}</p>
        </div>

        <div class="dialog-actions" style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          ${
            hasDilemma
              ? `<button id="btn-open-dilemma" class="btn-dilemma-trigger">⚖️ Historische Gewissensfrage verhandeln</button>`
              : `<div></div>`
          }
          <button id="btn-dialog-close" class="btn-primary">Verstanden, ich mache mich an die Arbeit ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btn-open-dilemma')?.addEventListener('click', () => {
      this.closeModal();
      this.openDilemmaModal(gameState.chapter, () => {
        onClose?.();
      });
    });

    document.getElementById('btn-dialog-close')?.addEventListener('click', () => {
      const img = document.getElementById('mentor-portrait-img') as HTMLImageElement | null;
      if (img) {
        img.src = happySrc;
        img.style.transform = 'scale(1.08)';
      }
      sound.success();
      setTimeout(() => {
        this.closeModal();
        onClose?.();
      }, 350);
    });
  }

  public openDilemmaModal(chapterNum?: number, onFinish?: () => void): void {
    const ch = chapterNum ?? gameState.chapter;
    const dilemma = REFORMATION_DILEMMAS.find((d) => d.chapter === ch);
    if (!dilemma) return;

    this.activeModal = 'dilemma';
    this.dilemmaModal.open(dilemma, (choice) => {
      gameState.storyFlags[`dilemma_ch${ch}_done`] = true;
      gameState.dilemmaSummary += (gameState.dilemmaSummary ? ' | ' : '') + `K${ch}: ${choice.text}`;
      gameState.courage += Math.round(choice.points / 2);
      gameState.knowledge += Math.round(choice.points / 2);
      this.showToast(`⚖️ Gewissensentscheidung: +${choice.points} Punkte!`);
      this.renderHUD();
      this.closeModal();
      onFinish?.();
    });
  }

  public openRelicModal(relic: ReformationRelic): void {
    this.activeModal = 'relic';
    this.modalOverlay.style.display = 'flex';

    const aversTitle = relic.aversTitle || relic.name;
    const aversDetails = relic.aversDetails || relic.description;
    const reversTitle = relic.reversTitle || 'Rückseite & Siegelabdruck';
    const reversDetails = relic.reversDetails || relic.historicalSignificance;
    const didacticSummary = relic.didacticSummary || relic.explanation;

    this.modalOverlay.innerHTML = `
      <div class="relic-modal-card">
        <div class="relic-header">
          <span class="relic-epoch">${relic.epoch} • ${relic.year}</span>
          <h2 class="relic-name">${relic.name}</h2>
          <span class="relic-location">Fundort: ${relic.location}</span>
        </div>

        <div class="relic-body">
          <div class="relic-flip-container">
            <div id="relic-flip-card" class="relic-flip-card">
              <!-- AVERS -->
              <div class="relic-flip-face relic-face-avers">
                <div class="relic-stamp">AVERS • VORDERSEITE DER ORIGINALQUELLE</div>
                <div class="relic-icon-center">
                  <img src="${relic.icon}" class="relic-large-icon" alt="${relic.name}" />
                </div>
                <h3 class="relic-face-title">${aversTitle}</h3>
                <p class="relic-desc">${aversDetails}</p>
              </div>

              <!-- REVERS -->
              <div class="relic-flip-face relic-face-revers">
                <div class="relic-stamp">REVERS • RÜCKSEITE, SIEGEL & ZEUGNIS</div>
                <div class="relic-icon-center">
                  <span style="font-size: 38px; display:inline-block; margin: 6px 0;">📜</span>
                </div>
                <h3 class="relic-face-title">${reversTitle}</h3>
                <p class="relic-desc">${reversDetails}</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 10px 0 14px 0;">
            <button id="btn-relic-flip" class="btn-sub" style="font-size: 11.5px; font-weight: 700; background: #fef3c7; border: 1.5px solid #b45309; color: #78350f;">
              🔄 Fundstück wenden (360° Avers / Revers)
            </button>
          </div>

          <div class="relic-didactic-box">
            <span class="didactic-badge">💡 Didaktischer Merksatz für den Unterricht</span>
            <p>${didacticSummary}</p>
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

        <div class="relic-footer" style="margin-top:14px; display:flex; justify-content:flex-end;">
          <button id="btn-relic-close" class="btn-sub">Schließen [ESC]</button>
        </div>
      </div>
    `;

    // 3D Flip toggle
    const flipCard = document.getElementById('relic-flip-card');
    document.getElementById('btn-relic-flip')?.addEventListener('click', () => {
      sound.click();
      flipCard?.classList.toggle('flipped');
    });

    const btns = this.modalOverlay.querySelectorAll('.quiz-opt-btn');
    const fb = document.getElementById('quiz-feedback');

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
        btns.forEach((b) => ((b as HTMLButtonElement).disabled = true));

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

  public openGutenbergWorkshopModal(onComplete?: () => void): void {
    this.activeModal = 'station';
    this.modalOverlay.style.display = 'flex';

    let phase: 1 | 2 | 3 | 4 = 1;
    let composedLetters: string[] = [];
    const targetWord = 'SOLA FIDE';
    const letterChoices = ['S', 'O', 'L', 'A', 'F', 'I', 'D', 'E', 'R', 'T', 'M', 'G', 'P'];

    const render = () => {
      if (phase === 1) {
        const isComplete = composedLetters.join('') === targetWord;
        this.modalOverlay.innerHTML = `
          <div class="station-card" style="max-width: 680px;">
            <div class="modal-header">
              <div>
                <span class="relic-epoch">Wittenberg 1517 • Werkstatt Cranach</span>
                <h2>⚙️ Der Gutenberg-Setzkasten & Winkelhaken</h2>
              </div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>

            <div style="font-size:12px; color:#4b5563; margin-bottom:12px; line-height:1.4;">
              Luthers Flugschrift <strong>„SOLA FIDE“</strong> (Allein durch den Glauben) muss im Winkelhaken gesetzt werden.
              <br/><strong style="color:#b45309;">⚠️ Eisernes Druckergesetz:</strong> Der Bleistempel druckt spiegelverkehrt ab!
            </div>

            <!-- Winkelhaken (Composing Stick) -->
            <div style="background:#1e293b; border:2px solid #94a3b8; border-radius:8px; padding:12px; margin-bottom:14px; text-align:center;">
              <div style="font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                Messing-Winkelhaken (Spiegelverkehrter Satz im Zeilenschiff)
              </div>
              <div style="min-height:48px; background:#0f172a; border:1.5px dashed #475569; border-radius:6px; display:flex; align-items:center; justify-content:center; gap:6px; padding:4px 8px;">
                ${
                  composedLetters.length === 0
                    ? '<span style="color:#64748b; font-size:11px;">[Setzkasten leer. Klicke unten auf die Bleilettern]</span>'
                    : composedLetters
                        .map((l) =>
                          l === ' '
                            ? '<span style="display:inline-block; width:18px; height:32px; background:#334155; border-radius:3px; border:1px solid #475569;" title="Spatium (Leerzeichen)"></span>'
                            : `<span style="display:inline-flex; width:28px; height:34px; background:#e2e8f0; color:#0f172a; font-family:\'Cinzel\',serif; font-weight:900; font-size:18px; border-radius:4px; border:2px solid #94a3b8; align-items:center; justify-content:center; box-shadow:inset 0 1px 3px rgba(0,0,0,0.3); transform:scaleX(-1) scaleY(-1);">${l}</span>`
                        )
                        .join('')
                }
              </div>
              <div style="margin-top:6px; font-size:11px; color:${isComplete ? '#4ade80' : '#cbd5e1'}; font-weight:600;">
                Gelesener Abdruck: „${composedLetters.join('')}“ ${isComplete ? '✓ (Exakt 9 Zeichen)' : ''}
              </div>
            </div>

            <!-- Setzkasten (Lead Type Drawer) -->
            <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:10px; margin-bottom:12px;">
              <div style="font-size:11px; font-weight:700; color:#78350f; margin-bottom:6px;">
                Bleilettern aus dem Setzkasten wählen:
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${letterChoices
                  .map(
                    (ch) => `
                  <button class="btn-sub btn-letter" data-char="${ch}" style="min-width:34px; padding:6px 10px; font-weight:700; font-size:13px; font-family:\'Cinzel\',serif;">
                    ${ch}
                  </button>
                `
                  )
                  .join('')}
                <button id="btn-space" class="btn-sub" style="padding:6px 12px; font-size:11px; font-weight:600;">
                  ␣ Spatium (Leerzeichen)
                </button>
                <button id="btn-backspace" class="btn-sub" style="padding:6px 12px; font-size:11px; font-weight:600; color:#b91c1c;">
                  ⌫ Rückgängig
                </button>
              </div>
            </div>

            <!-- Action Footer -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
              <button id="btn-cancel" class="btn-sub">Abbrechen</button>
              <button id="btn-next-phase" class="btn-primary" style="display:${isComplete ? 'inline-block' : 'none'};">
                Schritt 2: Druckerschwärze auftragen 🖌️ ➔
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-workshop-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-station-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-cancel')?.addEventListener('click', () => this.closeModal());

        this.modalOverlay.querySelectorAll('.btn-letter').forEach((btn) => {
          btn.addEventListener('click', () => {
            const ch = btn.getAttribute('data-char');
            if (ch && composedLetters.length < 12) {
              sound.click();
              composedLetters.push(ch);
              render();
            }
          });
        });

        document.getElementById('btn-space')?.addEventListener('click', () => {
          if (composedLetters.length > 0 && composedLetters[composedLetters.length - 1] !== ' ') {
            sound.click();
            composedLetters.push(' ');
            render();
          }
        });

        document.getElementById('btn-backspace')?.addEventListener('click', () => {
          sound.click();
          composedLetters.pop();
          render();
        });

        document.getElementById('btn-next-phase')?.addEventListener('click', () => {
          sound.success();
          phase = 2;
          render();
        });
      } else if (phase === 2) {
        this.modalOverlay.innerHTML = `
          <div class="station-card" style="max-width: 680px;">
            <div class="modal-header">
              <div>
                <span class="relic-epoch">Schritt 2 von 4 • Farbküche</span>
                <h2>🖌️ Druckerschwärze auftragen</h2>
              </div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>

            <div style="text-align:center; padding:16px 0;">
              <div style="font-size:42px; margin-bottom:8px;">🪵 🖌️ 📜</div>
              <p style="font-size:13px; color:#374151; max-width:500px; margin:0 auto 16px; line-height:1.5;">
                Die Bleilettern liegen fest im Zeilenschiff. Nun müssen die beiden ledernen <strong>Druckballen</strong> mit kochendem <em>Leinölfirnis</em> und feinstem <em>Kienruß</em> gleichmäßig über den Satz geschlagen werden.
              </p>

              <button id="btn-apply-ink" class="btn-primary" style="padding:10px 24px; font-size:14px;">
                Druckballen schlagen (Farbe auftragen) ➔
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-workshop-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-station-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-apply-ink')?.addEventListener('click', () => {
          sound.click();
          phase = 3;
          render();
        });
      } else if (phase === 3) {
        this.modalOverlay.innerHTML = `
          <div class="station-card" style="max-width: 680px;">
            <div class="modal-header">
              <div>
                <span class="relic-epoch">Schritt 3 von 4 • Spindelpresse</span>
                <h2>⚙️ Die Druckerpresse spannen</h2>
              </div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>

            <div style="text-align:center; padding:16px 0;">
              <div style="font-size:46px; margin-bottom:10px;">🔩 📐 📜</div>
              <p style="font-size:13px; color:#374151; max-width:500px; margin:0 auto 16px; line-height:1.5;">
                Das feuchte Hadernpapier liegt auf dem Druckstock. Lege den hölzernen <strong>Schwengel</strong> der Eichenpresse mit vollem Körpereinsatz um, um den nötigen Druck zu erzeugen!
              </p>

              <button id="btn-press-lever" class="btn-primary" style="padding:12px 28px; font-size:14px; background:#b45309; border-color:#78350f;">
                Presse mit Hebelzug spannen ⚙️
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-workshop-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-station-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-press-lever')?.addEventListener('click', () => {
          sound.door();
          phase = 4;
          render();
        });
      } else if (phase === 4) {
        gameState.addItem('flugblatt_sola_fide', 1);
        gameState.knowledge += 25;
        gameState.courage += 10;
        gameState.completeObjective(2, 2);
        sound.questStep();

        this.modalOverlay.innerHTML = `
          <div class="station-card" style="max-width: 680px; background:#fffbeb; border:2.5px solid #d97706;">
            <div class="modal-header">
              <div>
                <span class="relic-epoch" style="color:#b45309;">Meisterstück vollendet • Wittenberg 1517</span>
                <h2 style="color:#78350f;">📜 Frischer Flugblatt-Abzug</h2>
              </div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>

            <!-- Historischer Flugblatt-Körper -->
            <div style="background:#ffffff; border:2px solid #b45309; border-radius:8px; padding:20px; text-align:center; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#78350f; margin-bottom:8px;">
                Disputatio pro declaratione virtutis indulgentiarum
              </div>
              <h1 style="font-family:\'Cinzel\',serif; font-size:26px; color:#991b1b; margin:6px 0 10px; font-weight:900; letter-spacing:3px;">
                SOLA FIDE
              </h1>
              <div style="font-size:13px; font-weight:600; color:#1f2937; margin-bottom:12px;">
                Allein durch den Glauben • Aus Gnade gerechtfertigt
              </div>
              <p style="font-size:12px; color:#4b5563; line-height:1.6; max-width:520px; margin:0 auto; font-style:italic;">
                „Der Gerechte wird aus dem Glauben leben. Weder Gold noch Tetzels Ablassbriefe erlösen die Seele vor Gott, sondern allein das lebendige Vertrauen auf das Evangelium Christi.“
              </p>
              <div style="margin-top:14px; font-size:10px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:8px;">
                Gedruckt in der Offizin Lucas Cranach d. Ä. zu Wittenberg im Jahre des Herrn 1517
              </div>
            </div>

            <!-- Belohnung -->
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:10px 14px; font-size:12px; color:#065f46; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
              <span>🏆 <strong>Gegenstand erhalten:</strong> Flugblatt „SOLA FIDE“ (1517)</span>
              <span><strong>+25 Bildung</strong> · <strong>+10 Mut</strong></span>
            </div>

            <div style="text-align:right;">
              <button id="btn-finish-workshop" class="btn-primary" style="padding:10px 22px;">
                Flugblatt einstecken &amp; weiterziehen ➔
              </button>
            </div>
          </div>
        `;

        const handleClose = () => {
          this.closeModal();
          this.renderHUD();
          if (onComplete) onComplete();
        };
        document.getElementById('btn-workshop-close')?.addEventListener('click', handleClose);
        document.getElementById('btn-station-close')?.addEventListener('click', handleClose);

        document.getElementById('btn-finish-workshop')?.addEventListener('click', () => {
          this.closeModal();
          this.renderHUD();
          this.showToast('📜 Flugblatt „SOLA FIDE“ im Inventar verstaut!');
          if (onComplete) onComplete();
        });
      }
    };

    render();
  }

  public openStationModal(stationId: string): void {
    if (stationId === 'station_druckerei') {
      this.openGutenbergWorkshopModal();
      return;
    }

    const station = REFORMATION_STATIONS.find((s) => s.id === stationId);
    if (!station) return;

    this.activeModal = 'station';
    this.modalOverlay.style.display = 'flex';

    let currentStepIdx = 0;
    let stepCompleted = false;

    const render = () => {
      const step = station.steps[currentStepIdx];
      const isLastStep = currentStepIdx === station.steps.length - 1;

      this.modalOverlay.innerHTML = `
        <div class="station-card">
          <div class="modal-header">
            <div>
              <span class="relic-epoch">${station.location} • ${station.badge}</span>
              <h2>⚙️ ${station.name}</h2>
            </div>
            <button id="btn-station-close" class="btn-close">✕</button>
          </div>

          <div style="font-size:12px; color:#4b5563; margin-bottom:12px; line-height:1.4;">
            ${station.intro}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:11px; font-weight:700; color:#92400e; background:#fef3c7; padding:4px 10px; border-radius:6px; border:1px solid #fde68a;">
            <span>${step.title}</span>
            <span>Schritt ${currentStepIdx + 1} von ${station.steps.length}</span>
          </div>

          <div class="quiz-box" style="margin-top:0;">
            <div class="quiz-question" style="font-weight:600; color:#1f2937; margin-bottom:8px;">${step.prompt}</div>
            <div class="quiz-options">
              ${step.options
                .map(
                  (opt, idx) => `
                <button class="quiz-opt-btn station-opt-btn" data-index="${idx}">${opt.text}</button>
              `
                )
                .join('')}
            </div>
            <div id="station-feedback" class="quiz-feedback" style="display:none;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
            <span style="font-size:11px; color:#6b7280;">Epochensäule: ${station.historicalPillar}</span>
            <div style="display:flex; gap:8px;">
              <button id="btn-station-next" class="btn-primary" style="display:${stepCompleted ? 'inline-block' : 'none'};">
                ${isLastStep ? 'Station abschließen ✓' : 'Nächster Schritt →'}
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-station-close')?.addEventListener('click', () => this.closeModal());

      const btns = this.modalOverlay.querySelectorAll('.station-opt-btn');
      const fb = document.getElementById('station-feedback');
      const nextBtn = document.getElementById('btn-station-next') as HTMLButtonElement | null;

      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
          const selectedOpt = step.options[idx];

          if (selectedOpt.isCorrect) {
            btns.forEach((b) => ((b as HTMLButtonElement).disabled = true));
            btn.classList.add('correct');
            if (fb) {
              fb.style.display = 'block';
              fb.className = 'quiz-feedback correct';
              fb.innerHTML = `✓ Ausgezeichnet! ${selectedOpt.feedback}`;
            }
            sound.success();
            stepCompleted = true;
            if (nextBtn) nextBtn.style.display = 'inline-block';
          } else {
            if (fb) {
              fb.style.display = 'block';
              fb.className = 'quiz-feedback wrong';
              fb.innerHTML = `✕ Noch nicht ganz: ${selectedOpt.feedback}`;
            }
            sound.click();
          }
        });
      });

      nextBtn?.addEventListener('click', () => {
        sound.click();
        if (isLastStep) {
          gameState.completeObjective(station.chapter, 2);
          gameState.knowledge += 15;
          gameState.courage += 5;
          this.closeModal();
          this.showToast(`🏆 Station '${station.name}' gemeistert! (+15 Bildung, +5 Mut)`);
          this.renderHUD();
          sound.questStep();
        } else {
          currentStepIdx++;
          stepCompleted = false;
          render();
        }
      });
    };

    render();
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

    gameState.checkLexiconUnlocks();

    const categories = [
      'Alle',
      'Glaube & Theologie',
      'Medien & Handwerk',
      'Politik & Reich',
      'Persönlichkeiten',
      'Gesellschaft & Aufruhr',
    ];

    const filteredEntries =
      this.lexiconFilterCategory === 'Alle'
        ? REFORMATION_LEXICON
        : REFORMATION_LEXICON.filter((e) => e.category === this.lexiconFilterCategory);

    let selectedEntry = REFORMATION_LEXICON.find((l) => l.id === this.selectedLexiconId);
    if (!selectedEntry || (this.lexiconFilterCategory !== 'Alle' && selectedEntry.category !== this.lexiconFilterCategory)) {
      selectedEntry = filteredEntries[0] || REFORMATION_LEXICON[0];
      this.selectedLexiconId = selectedEntry.id;
    }

    const isUnlocked = gameState.unlockedLexicon.has(selectedEntry.id);
    const unlockedCount = gameState.unlockedLexicon.size;

    this.modalOverlay.innerHTML = `
      <div class="lexicon-card" style="max-width: 720px;">
        <div class="modal-header">
          <div>
            <span class="relic-epoch">Geschichts-Nachschlagewerk</span>
            <h2>📖 Lexikon der Reformation (${unlockedCount} / ${REFORMATION_LEXICON.length} Begriffe freigeschaltet)</h2>
          </div>
          <button id="btn-lex-close" class="btn-close">✕</button>
        </div>

        <div class="lex-filter-bar">
          ${categories
            .map(
              (cat) => `
            <button class="lex-cat-pill ${cat === this.lexiconFilterCategory ? 'active' : ''}" data-cat="${cat}">
              ${cat}
            </button>
          `
            )
            .join('')}
        </div>

        <div class="lexicon-split">
          <div class="lex-list-col">
            ${filteredEntries
              .map((l) => {
                const unlocked = gameState.unlockedLexicon.has(l.id);
                const isActive = l.id === this.selectedLexiconId;
                return `
                <div class="lex-list-item ${isActive ? 'active' : ''} ${unlocked ? 'unlocked' : 'locked'}" data-id="${l.id}">
                  <span class="lex-status-icon">${unlocked ? '📜' : '🔒'}</span>
                  <div class="lex-item-texts">
                    <strong>${unlocked ? l.term : '??? ' + l.term}</strong>
                    <span class="lex-cat">${l.category}</span>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>

          <div class="lex-detail-col">
            ${
              isUnlocked
                ? `
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span class="detail-cat" style="font-size:11px; font-weight:700; color:#b45309; text-transform:uppercase;">${selectedEntry.category}</span>
                  <h3 class="detail-term" style="font-family:'Cinzel',serif; font-size:18px; font-weight:800; color:#78350f; margin:4px 0 10px 0;">${selectedEntry.term}</h3>
                </div>
                <button id="btn-lex-speak" class="btn-sub" style="font-size:11px; padding:5px 10px;" title="Begriff vorlesen">
                  🔊 Vorlesen
                </button>
              </div>
              <div class="detail-def" style="margin-top:8px; font-size:12.5px; line-height:1.5; color:#1f2937;">
                <strong>Definition:</strong> ${selectedEntry.definition}
              </div>
              <div class="detail-context" style="margin-top:10px; font-size:12px; line-height:1.5; color:#4b5563;">
                <strong>Historischer Kontext:</strong> ${selectedEntry.historicalContext}
              </div>
              <div class="detail-merksatz" style="margin-top:14px; background:#ecfdf5; border:1px solid #10b981; border-radius:8px; padding:10px 12px; font-size:11.5px; color:#065f46; line-height:1.45;">
                <strong style="display:block; margin-bottom:2px;">💡 Merksatz für die Geschichtsstunde:</strong>
                ${selectedEntry.merksatz}
              </div>
            `
                : `
              <div class="lex-locked-placeholder" style="text-align:center; padding:32px 16px;">
                <div style="font-size:42px; margin-bottom:10px;">🔒</div>
                <h3 style="font-family:'Cinzel',serif; color:#78350f; margin-bottom:8px;">${selectedEntry.term} ist noch versiegelt</h3>
                <p style="font-size:12px; color:#6b7280; line-height:1.5; max-width:380px; margin:0 auto 16px;">
                  Diesen geschichtlichen Begriff hast du noch nicht erforscht. Erforsche die Epoche, um das Wissen freizuschalten!
                </p>
                <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:12px; max-width:380px; margin:0 auto; font-size:12px; color:#92400e; text-align:left;">
                  <strong>💡 Such-Tipp zum Freischalten:</strong><br/>
                  ${selectedEntry.unlockHint}
                  <div style="margin-top:6px; font-size:10.5px; color:#b45309;">
                    Kapitel: Ab Kapitel ${selectedEntry.minChapter} verfügbar
                  </div>
                </div>
              </div>
            `
            }
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-lex-close')?.addEventListener('click', () => this.closeModal());

    this.modalOverlay.querySelectorAll('.lex-cat-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-cat');
        if (cat) {
          this.lexiconFilterCategory = cat;
          sound.click();
          this.openLexiconModal();
        }
      });
    });

    this.modalOverlay.querySelectorAll('.lex-list-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) {
          this.selectedLexiconId = id;
          sound.click();
          if (gameState.unlockedLexicon.has(id)) {
            gameState.markLexiconRead(id);
          }
          this.openLexiconModal();
        }
      });
    });

    document.getElementById('btn-lex-speak')?.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `${selectedEntry.term}. ${selectedEntry.definition} ${selectedEntry.merksatz}`;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'de-DE';
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
        this.showToast('🔊 Begriff wird vorgelesen...');
      } else {
        this.showToast('Sprachsynthese im Browser nicht verfügbar');
      }
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
            <span class="tile-icon">${sound.isMuted() ? '🔇' : sound.getTheme() === 'lute' ? '🪕' : '🎵'}</span>
            <strong>Klangkulisse</strong>
            <span>${sound.isMuted() ? 'Stumm geschaltet' : sound.getTheme() === 'lute' ? 'Renaissance-Laute' : 'Sakral-Orgel (Choral)'}</span>
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
      if (sound.isMuted()) {
        sound.toggleMute();
        sound.setTheme('choral');
      } else if (sound.getTheme() === 'choral') {
        sound.setTheme('lute');
      } else {
        sound.toggleMute();
      }
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
    this.toastContainer.innerHTML = '';
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
