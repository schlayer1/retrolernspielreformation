import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { REFORMATION_CHAPTERS, ChapterData, MentorData } from '../data/chapters';
import { REFORMATION_ITEMS, REFORMATION_RECIPES, ReformationItemId } from '../data/items';
import { REFORMATION_LEXICON } from '../data/lexicon';
import { REFORMATION_RELICS, ReformationRelic } from '../data/relics';
import { REFORMATION_STATIONS } from '../data/stations';
import { REFORMATION_DILEMMAS } from '../data/dilemmas';
import { gameState, REFORMATION_ROLES } from '../systems/GameState';
import { ReformationPlayerRole } from '../systems/SaveManager';
import { TouchControls } from '../ui/TouchControls';
import { PrintSheet } from '../ui/PrintSheet';
import { DilemmaModal } from '../ui/DilemmaModal';
import { StationModal } from '../ui/StationModal';
import { ArtifactInspectorModal } from '../ui/ArtifactInspectorModal';
import { TimelineModal } from '../ui/TimelineModal';
import { WorldScene } from './WorldScene';
import { musicManager } from '../audio/MusicManager';

export type ModalType =
  | 'none'
  | 'start'
  | 'dialog'
  | 'relic'
  | 'station'
  | 'inventory'
  | 'craft'
  | 'lexicon'
  | 'timeline'
  | 'certificate'
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
  private stationModal = new StationModal();
  private artifactInspector = new ArtifactInspectorModal();
  private timelineModal = new TimelineModal();
  private lastActionKeyMs = 0;

  private selectedLexiconId: string = REFORMATION_LEXICON[0].id;
  private lexiconFilterCategory = 'Alle';

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.initDOMStructure();
    this.touchControls = new TouchControls((key) => this.handleShortcutKey(key));
    (window as any).__touchControls = this.touchControls;

    this.registerGlobalHooks();
    this.registerKeyboardShortcuts();

    gameState.subscribe(() => {
      this.renderHUD();
      this.renderQuestTracker();
    });

    this.renderHUD();
    this.renderQuestTracker();
    this.openStartScreen();
  }

  private checkExternalModalOpen(): boolean {
    const ids = ['station-modal', 'artifact-inspector-modal', 'timeline-modal', 'dilemma-modal'];
    return ids.some((id) => {
      const el = document.getElementById(id);
      return Boolean(el && el.style.display && el.style.display !== 'none');
    });
  }

  private registerGlobalHooks(): void {
    const win = window as any;
    win.__REF_UI__ = this;
    win.__isModalOpen = () => this.activeModal !== 'none' || this.checkExternalModalOpen();
    win.__openMentorDialog = (mentorOrCh?: any, onClose?: () => void) => {
      this.openMentorDialog(mentorOrCh ?? gameState.chapter, onClose);
    };
    win.__openStation = (id: string) => this.openStation(id);
    win.__openArtifactInspector = (relIdOrObj: any) => this.openArtifactInspector(relIdOrObj);
    win.__openTimeline = () => this.openTimelineModal();
    win.__triggerPrintSheet = () => this.triggerDiplomPrint();
    win.__printHefterSheet = () => this.triggerDiplomPrint();
    win.__showToast = (msg: string) => this.showToast(msg);
    win.__closeModal = () => this.closeModal();
    win.__eatFood = () => this.eatFood();
    win.__toggleModal = (k: string) => this.handleShortcutKey(String(k || '').toUpperCase());
  }

  private initDOMStructure(): void {
    this.uiRoot = document.getElementById('ui-layer') as HTMLDivElement;
    if (!this.uiRoot) {
      this.uiRoot = document.createElement('div');
      this.uiRoot.id = 'ui-layer';
      document.body.appendChild(this.uiRoot);
    }
    this.uiRoot.innerHTML = `
      <div id="hud-top-bar" class="hud-top"></div>
      <div id="quest-tracker-box" class="hud-bottom"></div>
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
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toUpperCase();

      if (e.key === 'Escape') {
        if (this.activeModal !== 'none' && this.activeModal !== 'start') {
          this.closeModal();
        } else if (this.checkExternalModalOpen()) {
          this.closeModal();
        } else if (this.activeModal === 'none') {
          this.openPauseDashboard();
        }
        return;
      }

      if (this.activeModal === 'start') return;

      if (key === 'E' || e.code === 'Space' || e.key === 'Enter') {
        const now = Date.now();
        if (now - this.lastActionKeyMs < 160) return;
        this.lastActionKeyMs = now;

        if (!(window as any).__isModalOpen?.()) {
          e.preventDefault();
          const win = window as any;
          if (win.__activeInterior?.trigger) {
            win.__activeInterior.trigger();
          } else if (win.__triggerInteraction) {
            win.__triggerInteraction();
          }
          return;
        }
      }

      if (['I', 'C', 'H', 'F', 'L', 'Z', 'U', 'P', 'M', 'K'].includes(key)) {
        this.handleShortcutKey(key);
      }
    });
  }

  public handleShortcutKey(key: string): void {
    const k = key.toUpperCase();
    if (k === 'ESCAPE' || k === 'ESC') {
      if (this.activeModal !== 'none' || this.checkExternalModalOpen()) this.closeModal();
      else this.openPauseDashboard();
      return;
    }
    if (k === 'E') {
      const win = window as any;
      if (!(window as any).__isModalOpen?.()) {
        if (win.__activeInterior?.trigger) win.__activeInterior.trigger();
        else if (win.__triggerInteraction) win.__triggerInteraction();
      }
      return;
    }

    sound.click();
    if (k === 'M') {
      const isMuted = sound.toggleMute();
      this.showToast(isMuted ? '🔇 Ton stummgeschaltet' : '🔊 Ton aktiv');
      this.renderHUD();
      return;
    }
    if (k === 'F') {
      this.eatFood();
      return;
    }
    if (k === 'P') {
      if (this.activeModal === 'pause') this.closeModal();
      else this.openPauseDashboard();
      return;
    }
    if (k === 'I') {
      if (this.activeModal === 'inventory') this.closeModal();
      else this.openInventory();
      return;
    }
    if (k === 'C') {
      if (this.activeModal === 'craft') this.closeModal();
      else this.openCraftingModal();
      return;
    }
    if (k === 'H') {
      if (this.activeModal === 'dilemma') this.closeModal();
      else this.openDilemmaModal();
      return;
    }
    if (k === 'L') {
      if (this.activeModal === 'lexicon') this.closeModal();
      else this.openLexiconModal();
      return;
    }
    if (k === 'Z') {
      if (this.activeModal === 'timeline') this.closeModal();
      else this.openTimelineModal();
      return;
    }
    if (k === 'U') {
      if (this.activeModal === 'certificate') this.closeModal();
      else this.openCertificateModal();
      return;
    }
    if (k === 'K') {
      if (this.activeModal === 'start') this.closeModal();
      else this.openStartScreen();
      return;
    }
  }

  public eatFood(): void {
    const msg = gameState.eat();
    this.showToast(msg);
    this.renderHUD();
  }

  public triggerDiplomPrint(): void {
    gameState.storyFlags['opened_certificate'] = true;
    gameState.notify();
    this.printSheet.print();
  }

  private hideChapterBanner(): void {
    const el = document.getElementById('chapter-banner-overlay');
    if (el) el.style.display = 'none';
  }

  public openStation(stationId: string): void {
    if (stationId === 'station_druckerei') {
      this.openGutenbergWorkshopModal(() => {
        this.renderHUD();
        this.renderQuestTracker();
      });
      return;
    }
    const st = REFORMATION_STATIONS.find((s) => s.id === stationId);
    if (!st) return;
    this.closeModal();
    this.hideChapterBanner();
    this.activeModal = 'station';
    this.touchControls?.setVisible(false);
    this.stationModal.open(st, () => {
      this.activeModal = 'none';
      this.closeModal();
      sound.playSuccess();
    });
  }

  public openArtifactInspector(relicIdOrObj: string | ReformationRelic): void {
    const id = typeof relicIdOrObj === 'string' ? relicIdOrObj : relicIdOrObj?.id;
    const rel = REFORMATION_RELICS.find((r) => r.id === id) || REFORMATION_RELICS[0];
    if (!rel) return;
    this.closeModal();
    this.hideChapterBanner();
    this.activeModal = 'relic';
    this.touchControls?.setVisible(false);
    this.artifactInspector.open(rel, () => {
      this.activeModal = 'none';
      this.closeModal();
    });
  }

  public openTimelineModal(): void {
    this.closeModal();
    this.hideChapterBanner();
    this.activeModal = 'timeline';
    this.touchControls?.setVisible(false);
    this.timelineModal.open(() => {
      this.activeModal = 'none';
      this.closeModal();
    });
  }

  public closeModal(): void {
    this.activeModal = 'none';
    this.modalOverlay.style.display = 'none';
    this.dilemmaModal.close();
    this.stationModal.close();
    this.artifactInspector.close();
    this.timelineModal.close();
    this.touchControls?.setVisible(true);

    this.renderHUD();
    this.renderQuestTracker();

    const world = this.scene.get('WorldScene') as WorldScene;
    if (world && world.resetDialogFocus) {
      world.resetDialogFocus();
      world.updateQuestCompass();
    }
  }

  public renderHUD(): void {
    if (!this.hudHeader) return;
    const isStart = this.activeModal === 'start';
    this.hudHeader.style.display = isStart ? 'none' : 'flex';
    if (this.questBox) {
      this.questBox.style.display = isStart ? 'none' : 'flex';
    }
    if (this.touchControls) {
      this.touchControls.setVisible(this.activeModal === 'none' && !this.checkExternalModalOpen());
    }

    const curCh = gameState.getChapterData();
    const roleDef = REFORMATION_ROLES.find((r) => r.id === gameState.role) || REFORMATION_ROLES[0];
    const stateObj = gameState.chapterObjectives[curCh.number] || [false, false, false, false];
    const allDone = gameState.checkQuest(curCh.number);

    const taskText = allDone
      ? `Alle Aufgaben gemeistert! Sprich mit ${curCh.mentor.name} [E].`
      : curCh.primaryObjective;

    const knowPct = Math.max(0, Math.min(100, Math.round(gameState.knowledge)));
    const couragePct = Math.max(0, Math.min(100, Math.round(gameState.courage)));
    const pietyPct = Math.max(0, Math.min(100, Math.round(gameState.piety)));

    this.hudHeader.innerHTML = `
      <div class="hud-card" id="hud-quest-box">
        <div id="hud-chapter-title">
          📜 Kap. ${curCh.number}: ${curCh.title} (${curCh.year}) · ${gameState.playerName} (${roleDef.name})
        </div>
        <div id="hud-quest">
          <div class="hud-primary-task">📋 <strong>Ziel:</strong> ${taskText}</div>
          <div class="quest-steps-list">
            ${curCh.objectives
              .map(
                (obj, idx) => `
              <div class="quest-step-item ${stateObj[idx] ? 'step-done' : ''}">
                <span>${stateObj[idx] ? '✅' : '⬜'}</span>
                <span>${obj}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="hud-mentor-row">
            <span class="hud-mentor-tip ${allDone ? 'done' : ''}">
              ${allDone ? `✨ Bereit für Disputation bei ${curCh.mentor.name}` : `💡 Mentor: ${curCh.mentor.name}`}
            </span>
            <button id="btn-open-mentor-dialog" class="hud-btn hud-btn-compact">
              💬 ${curCh.mentor.name}
            </button>
          </div>
        </div>
        <div id="hud-compass" class="hud-compass-line">${gameState.compassText || '🧭 Wegweiser wird berechnet...'}</div>
      </div>

      <div class="hud-right">
        <div class="hud-card" id="hud-bars-card">
          <div class="bar-row" title="Wissen & Gelehrsamkeit">
            <span>📖 Wissen</span>
            <div class="bar-track"><div class="bar-fill yellow" id="bar-knowledge" style="width:${knowPct}%"></div></div>
            <span id="val-knowledge">${knowPct}%</span>
          </div>
          <div class="bar-row" title="Mut für Gewissen & freies Wort">
            <span>🛡️ Mut</span>
            <div class="bar-track"><div class="bar-fill blue" id="bar-courage" style="width:${couragePct}%"></div></div>
            <span id="val-courage">${couragePct}%</span>
          </div>
          <div class="bar-row" title="Glaube & Frömmigkeit">
            <span>✝️ Glaube</span>
            <div class="bar-track"><div class="bar-fill orange" id="bar-piety" style="width:${pietyPct}%"></div></div>
            <span id="val-piety">${pietyPct}%</span>
          </div>
          <div class="hud-subinfo">
            Lexikon: <b id="hud-lex-count">${gameState.unlockedLexicon.size}/27</b> ·
            🏺 Relikte: <b>${gameState.discoveredRelics.size}/5</b> ·
            🎵 Musik: <b id="hud-music-state">${sound.isMuted() ? 'Aus' : 'An'}</b>
          </div>
        </div>

        <button class="hud-btn mobile-menu-trigger" id="btn-mobile-menu" data-modal="pause">☰ Menü [P]</button>

        <div class="hud-btn-row">
          <button class="hud-btn ${this.activeModal === 'pause' ? 'active' : ''}" id="btn-pause" data-modal="pause"><span class="key-badge">P</span> ⏸ Pause</button>
          <button class="hud-btn ${this.activeModal === 'inventory' ? 'active' : ''}" id="btn-bag" data-modal="inventory"><span class="key-badge">I</span> 🎒 Beutel</button>
          <button class="hud-btn ${this.activeModal === 'craft' ? 'active' : ''}" id="btn-craft" data-modal="craft"><span class="key-badge">C</span> Werkstatt</button>
          <button class="hud-btn ${this.activeModal === 'dilemma' ? 'active' : ''}" id="btn-dilemma" data-modal="dilemma"><span class="key-badge">H</span> Gewissen</button>
          <button class="hud-btn ${this.activeModal === 'lexicon' ? 'active' : ''}" id="btn-lexicon" data-modal="lexicon"><span class="key-badge">L</span> Lexikon</button>
          <button class="hud-btn ${this.activeModal === 'timeline' ? 'active' : ''}" id="btn-timeline" data-modal="timeline"><span class="key-badge">Z</span> Zeitstrahl</button>
          <button class="hud-btn" id="btn-eat" data-action="eat"><span class="key-badge">F</span> Essen</button>
          <button class="hud-btn" id="btn-music" data-action="music"><span class="key-badge">M</span> ${sound.isMuted() ? '🔇 Ton' : '🎵 Ton'}</button>
          <button class="hud-btn" id="btn-epoch" data-modal="start"><span class="key-badge">K</span> Epoche</button>
          <button class="hud-btn ${this.activeModal === 'certificate' ? 'active' : ''}" id="btn-cert" data-modal="certificate"><span class="key-badge">U</span> Diplom</button>
        </div>
      </div>
    `;

    this.hudHeader.querySelector('#btn-open-mentor-dialog')?.addEventListener('click', () => {
      sound.click();
      this.openMentorDialog(curCh.number);
    });

    this.hudHeader.querySelectorAll('.hud-btn').forEach((btn) => {
      if (btn.id === 'btn-open-mentor-dialog') return;
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'eat') {
          this.eatFood();
          return;
        }
        if (action === 'music') {
          this.handleShortcutKey('M');
          return;
        }
        const m = btn.getAttribute('data-modal') as ModalType;
        if (m === 'start') this.openStartScreen();
        else if (m === 'pause') this.openPauseDashboard();
        else if (m === 'inventory') this.openInventory();
        else if (m === 'craft') this.openCraftingModal();
        else if (m === 'dilemma') this.openDilemmaModal();
        else if (m === 'lexicon') this.openLexiconModal();
        else if (m === 'timeline') this.openTimelineModal();
        else if (m === 'certificate') this.openCertificateModal();
      });
    });
  }

  public renderQuestTracker(): void {
    if (!this.questBox) return;
    this.questBox.style.display = this.activeModal === 'start' ? 'none' : 'flex';

    const hotbarItems: ReformationItemId[] = [
      'pergament',
      'bleilettern',
      'druckerschwaerze',
      'holzschnitt_platte',
      'flugschrift',
      'brot_fladen',
      'apfel',
      'bier_krug',
    ];

    const slotsHtml = hotbarItems
      .map((itemId, idx) => {
        const def = REFORMATION_ITEMS[itemId];
        const qty = gameState.inventory[itemId] || 0;
        return `
          <div class="hotbar-slot ${qty > 0 ? 'has-item' : ''}" data-slot-item="${itemId}" title="${def ? def.name : itemId} (${qty} im Beutel)">
            <img src="${def ? def.icon : '/assets/icons/relic_marker_glow.png'}" alt="${def ? def.name : itemId}" style="opacity:${qty > 0 ? '1' : '0.32'}" />
            <span class="count">${qty > 0 ? qty : idx + 1}</span>
          </div>
        `;
      })
      .join('');

    const relicSlotsHtml = REFORMATION_RELICS.map((r) => {
      const found = gameState.discoveredRelics.has(r.id);
      return `
        <div class="hotbar-slot relic-slot ${found ? 'has-item' : ''}" data-slot-relic="${r.id}" title="${found ? r.name : 'Unentdeckte Quelle'}">
          <img src="${r.icon}" alt="${r.name}" style="opacity:${found ? '1' : '0.25'}" />
          <span class="count">${found ? '★' : '🔒'}</span>
        </div>
      `;
    }).join('');

    this.questBox.innerHTML = `
      <div id="hud-hint">WASD/Pfeile = Bewegen · E = Interagieren · F = Proviant · C = Werkstatt · I = Beutel · P = Pause</div>
      <div class="hud-bottom-row">
        <div id="hud-hotbar">
          ${slotsHtml}
          ${relicSlotsHtml}
        </div>
        <button class="hud-btn" id="btn-hotbar-bag" title="Beutel öffnen [I]">
          <span class="key-badge">I</span> 🎒 Beutel
        </button>
      </div>
    `;

    this.questBox.querySelector('#btn-hotbar-bag')?.addEventListener('click', () => this.openInventory());
    this.questBox.querySelectorAll('[data-slot-item]').forEach((el) => {
      el.addEventListener('click', () => this.openInventory());
    });
    this.questBox.querySelectorAll('[data-slot-relic]').forEach((el) => {
      el.addEventListener('click', () => {
        const relId = el.getAttribute('data-slot-relic');
        if (relId) this.openArtifactInspector(relId);
      });
    });
  }

  public openStartScreen(): void {
    this.activeModal = 'start';
    this.touchControls?.setVisible(false);
    this.renderHUD();
    this.renderQuestTracker();
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="startscreen-container">
        <div class="startscreen-header">
          <div class="st-title-line">
            <span class="st-icon">📜</span>
            <h1>DIE REFORMATION: GLAUBE, MACHT &amp; MEDIENREVOLUTION</h1>
            <span class="st-era-tag">Klasse 7/8 · 1517–1555</span>
          </div>
          <p class="st-subtitle">Martin Luthers Thesenanschlag, Lucas Cranachs Buchdruck, der Reichstag zu Worms &amp; die Wartburg</p>
        </div>

        <div class="hero-showcase-box">
          <div class="showcase-title">✨ 8 KAPITEL DER REFORMATION WÄHLEN</div>
          <div class="showcase-grid-8">
            ${REFORMATION_CHAPTERS.map(
              (c) => `
              <div class="sc-card ${c.number === gameState.chapter ? 'active' : ''}" data-start-ch="${c.number}">
                <div class="sc-badge">K${c.number} · ${c.year}</div>
                <div class="sc-name">${c.title}</div>
                <div class="sc-mentor">${c.mentor.name}</div>
              </div>
            `
            ).join('')}
          </div>
        </div>

        <div class="startscreen-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>1. Dein Chronisten-Name:</label>
              <input type="text" id="start-player-name" value="${gameState.playerName}" maxlength="18" />
            </div>
            <div class="form-group">
              <label>2. Spielfigur:</label>
              <div class="gender-btn-group">
                <button class="role-btn ${gameState.gender === 'male' ? 'active' : ''}" id="btn-gender-male">
                  <img src="${gameState.malePreviewUrl}" class="preview-avatar-16x32" alt="Lucas" />
                  👦 Lucas
                </button>
                <button class="role-btn ${gameState.gender === 'female' ? 'active' : ''}" id="btn-gender-female">
                  <img src="${gameState.femalePreviewUrl}" class="preview-avatar-16x32" alt="Katharina" />
                  👧 Katharina
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>3. Historische Rolle (Start-Bonus):</label>
            <div class="roles-selection-grid">
              ${REFORMATION_ROLES.map(
                (r) => `
                <div class="role-card ${gameState.role === r.id ? 'active' : ''}" data-role="${r.id}">
                  <div class="role-head">
                    <img src="${r.icon}" class="role-icon" alt="${r.name}" />
                    <strong>${r.name}</strong>
                  </div>
                  <p class="role-desc">${r.description}</p>
                  <div class="role-bonus">${r.bonusText}</div>
                </div>
              `
              ).join('')}
            </div>
          </div>

          <div class="form-row code-restore-row">
            <div class="form-group flex-1">
              <label>📝 Hefter-Kurzcode vorhanden? (Stunde fortsetzen):</label>
              <div class="code-input-wrap">
                <input type="text" id="start-hefter-code" placeholder="z. B. REF-K03-LUC-0201-42" />
                <button class="btn-sub" id="btn-load-hefter-code">Code laden</button>
              </div>
            </div>
          </div>
        </div>

        <div class="startscreen-footer">
          <div class="controls-hint">
            🎮 WASD/Pfeile = Gehen · [E] = Interagieren · [C] = Werkstatt · [I] = Beutel · [P] = Menü
          </div>
          <button class="start-btn-launch" id="btn-start-game">🚀 Reformation starten!</button>
        </div>
      </div>
    `;

    const nameInput = document.getElementById('start-player-name') as HTMLInputElement;
    nameInput?.addEventListener('input', () => {
      gameState.playerName = nameInput.value.trim() || 'Lucas';
    });

    const btnMale = document.getElementById('btn-gender-male');
    const btnFemale = document.getElementById('btn-gender-female');
    btnMale?.addEventListener('click', () => {
      gameState.gender = 'male';
      if (!nameInput.value || nameInput.value === 'Katharina') {
        nameInput.value = 'Lucas';
        gameState.playerName = 'Lucas';
      }
      btnMale.classList.add('active');
      btnFemale?.classList.remove('active');
      (this.scene.get('WorldScene') as WorldScene)?.refreshCharacterAppearance?.();
    });
    btnFemale?.addEventListener('click', () => {
      gameState.gender = 'female';
      if (!nameInput.value || nameInput.value === 'Lucas') {
        nameInput.value = 'Katharina';
        gameState.playerName = 'Katharina';
      }
      btnFemale.classList.add('active');
      btnMale?.classList.remove('active');
      (this.scene.get('WorldScene') as WorldScene)?.refreshCharacterAppearance?.();
    });

    this.modalOverlay.querySelectorAll('.sc-card').forEach((card) => {
      card.addEventListener('click', () => {
        const ch = parseInt(card.getAttribute('data-start-ch') || '1', 10);
        gameState.selectStartChapter(ch);
        this.openStartScreen();
      });
    });

    this.modalOverlay.querySelectorAll('.role-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const role = (e.currentTarget as HTMLElement).dataset.role as ReformationPlayerRole;
        gameState.role = role;
        this.modalOverlay.querySelectorAll('.role-card').forEach((c) => c.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
      });
    });

    document.getElementById('btn-load-hefter-code')?.addEventListener('click', () => {
      const codeInput = document.getElementById('start-hefter-code') as HTMLInputElement;
      if (codeInput && gameState.loadFromHefterCode(codeInput.value)) {
        sound.success();
        this.showToast(`✅ Hefter-Code geladen! Kapitel ${gameState.chapter} aktiv.`);
        this.openStartScreen();
      } else {
        sound.click();
        this.showToast('❌ Ungültiger Hefter-Code (Format: REF-K0x-NAME-...).');
      }
    });

    const startLaunch = () => {
      sound.door();
      gameState.applyRoleBonus();
      const world = this.scene.get('WorldScene') as WorldScene;
      this.closeModal();
      if (world) {
        world.refreshCharacterAppearance();
        world.teleportToChapter(gameState.chapter);
      }
      musicManager.playChapterTrack(gameState.chapter);
      this.renderHUD();
      this.renderQuestTracker();
    };

    document.getElementById('btn-start-game')?.addEventListener('click', startLaunch);
  }

  public openCertificateModal(): void {
    this.activeModal = 'certificate';
    gameState.storyFlags['opened_certificate'] = true;
    gameState.notify();
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
    this.modalOverlay.style.display = 'flex';

    const rang = gameState.getChronistenRang();

    this.modalOverlay.innerHTML = `
      <div class="modal-card certificate-card">
        <div class="cert-border">
          <div class="cert-seal">📜</div>
          <h1>CHRONISTEN-DIPLOM</h1>
          <h2>DER REFORMATION &amp; MEDIENREVOLUTION</h2>
          <p class="cert-salute">Hiermit wird feierlich beurkundet, dass</p>
          <div class="cert-name">${gameState.playerName}</div>
          <p class="cert-text">
            die 95 Thesen Martin Luthers, die Kunst des Buchdrucks und den Gang der Kirchenerneuerung
            bis zum Augsburger Religionsfrieden 1555 mit herausragendem Scharfsinn erforscht hat.
          </p>
          <div class="cert-rank-box">
            <span>Verliehener Rang:</span>
            <strong>${rang.title} (${rang.tier}-Stufe)</strong>
          </div>
          <div class="cert-footer">
            <span>Hefter-Code: <strong>${gameState.generateHefterCode()}</strong></span>
            <span>Gez. Lucas Cranach d. Ä. &amp; Philipp Melanchthon</span>
          </div>
        </div>
        <div style="display:flex; gap:10px; justify-content:center; margin-top:14px;">
          <button class="btn-primary" id="btn-cert-print">🖨️ A4-Hefterblatt drucken</button>
          <button class="btn-sub" id="btn-cert-close">Schließen</button>
        </div>
      </div>
    `;

    document.getElementById('btn-cert-print')?.addEventListener('click', () => this.triggerDiplomPrint());
    document.getElementById('btn-cert-close')?.addEventListener('click', () => this.closeModal());
  }

  public openMentorDialog(mentorOrChapter: number | MentorData | ChapterData, onClose?: () => void): void {
    this.activeModal = 'dialog';
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
    this.modalOverlay.style.display = 'flex';

    let chData: ChapterData = gameState.getChapterData();
    if (typeof mentorOrChapter === 'number') {
      chData = REFORMATION_CHAPTERS.find((c) => c.number === mentorOrChapter) || chData;
    } else if (mentorOrChapter && 'mentor' in mentorOrChapter) {
      chData = mentorOrChapter;
    } else if (mentorOrChapter && 'name' in mentorOrChapter) {
      chData =
        REFORMATION_CHAPTERS.find((c) => c.mentor.name === mentorOrChapter.name) || chData;
    }

    const mentor = chData.mentor;
    const pKey = mentor.portraitKey || 'luther_young';
    const neutralSrc = `/assets/portraits/${pKey}_neutral.png`;
    const happySrc = `/assets/portraits/${pKey}_happy.png`;

    let quizMode = false;
    let quizIdx = 0;
    let quizCorrectCount = 0;
    let quizAnswered = false;

    const renderDialog = () => {
      const objs = gameState.chapterObjectives[chData.number] || [false, false, false, false];
      const nextStepIdx = objs.findIndex((o) => !o);
      const activeHint =
        nextStepIdx >= 0
          ? chData.hintSteps?.[nextStepIdx] || chData.objectives[nextStepIdx]
          : chData.successMessage;
      const allDone = objs.every(Boolean);
      const hasDilemma = REFORMATION_DILEMMAS.some(
        (d) => d.chapter === chData.number && !gameState.storyFlags[`dilemma_ch${d.chapter}_done`]
      );
      const hasNextChapter = chData.number < 8;

      if (!quizMode) {
        this.modalOverlay.innerHTML = `
          <div class="dialog-box-card">
            <div class="dialog-speaker-header">
              <div class="portrait-box-64">
                <img id="mentor-portrait-img" src="${neutralSrc}" class="portrait-img-64" alt="${mentor.name}" />
              </div>
              <div class="speaker-info">
                <span class="dialog-ch-tag">Kapitel ${chData.number} · ${chData.year}</span>
                <h2 class="speaker-name">${mentor.name}</h2>
                <span class="speaker-role">${mentor.role} · ${chData.location}</span>
              </div>
            </div>

            <div class="dialog-content">
              <p class="dialog-greeting">„${mentor.greeting}“</p>
              <p class="dialog-speech-text">${mentor.speech}</p>
              <div class="dialog-hint-box">
                <strong>🧭 Nächster Schritt (${objs.filter(Boolean).length}/4):</strong> ${activeHint}
              </div>
            </div>

            <div class="dialog-actions" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px;">
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button id="btn-start-quiz" class="btn-primary">🎓 Disputation (Kapitel-Quiz)</button>
                ${
                  hasDilemma
                    ? `<button id="btn-open-dilemma" class="btn-dilemma-trigger">⚖️ Gewissensfrage</button>`
                    : ''
                }
                ${
                  (allDone || gameState.quizPerfect.has(chData.number) || gameState.completedChapters.has(chData.number)) && hasNextChapter
                    ? `<button id="btn-advance-ch" class="btn-dilemma-trigger">⏭ Weiter zu Kapitel ${chData.number + 1} ➔</button>`
                    : ''
                }
              </div>
              <button id="btn-dialog-close" class="btn-sub">Weiter erkunden ➔</button>
            </div>
          </div>
        `;

        document.getElementById('btn-start-quiz')?.addEventListener('click', () => {
          sound.click();
          quizMode = true;
          quizIdx = 0;
          quizCorrectCount = 0;
          quizAnswered = false;
          renderDialog();
        });

        document.getElementById('btn-open-dilemma')?.addEventListener('click', () => {
          this.closeModal();
          this.openDilemmaModal(chData.number, () => onClose?.());
        });

        document.getElementById('btn-advance-ch')?.addEventListener('click', () => {
          sound.success();
          const nextCh = chData.number + 1;
          gameState.completedChapters.add(chData.number);
          gameState.maxUnlockedChapter = Math.max(gameState.maxUnlockedChapter, nextCh);
          this.closeModal();
          const world = this.scene.get('WorldScene') as WorldScene;
          if (world) {
            world.teleportToChapter(nextCh);
          } else {
            gameState.selectStartChapter(nextCh);
          }
          onClose?.();
        });

        document.getElementById('btn-dialog-close')?.addEventListener('click', () => {
          const img = document.getElementById('mentor-portrait-img') as HTMLImageElement | null;
          if (img) img.src = happySrc;
          sound.questStep();
          setTimeout(() => {
            this.closeModal();
            onClose?.();
          }, 220);
        });
      } else {
        const q = chData.quiz[quizIdx];
        const isLastQ = quizIdx >= chData.quiz.length - 1;

        this.modalOverlay.innerHTML = `
          <div class="dialog-box-card">
            <div class="dialog-speaker-header">
              <div class="portrait-box-64">
                <img id="mentor-portrait-img" src="${neutralSrc}" class="portrait-img-64" alt="${mentor.name}" />
              </div>
              <div class="speaker-info">
                <span class="dialog-ch-tag">Disputation · Frage ${quizIdx + 1} von ${chData.quiz.length}</span>
                <h2 class="speaker-name">${mentor.name} prüft dein Wissen</h2>
                <span class="speaker-role">Kapitel ${chData.number}: ${chData.title}</span>
              </div>
            </div>

            <div class="dialog-content">
              <div class="quiz-question" style="font-size:14.5px; font-weight:700; color:#2c1a0e; margin-bottom:10px;">${q.question}</div>
              <div class="quiz-options" style="display:flex; flex-direction:column; gap:8px;">
                ${q.options
                  .map(
                    (opt, oi) => `
                  <button class="quiz-opt-btn dialog-quiz-opt" data-idx="${oi}">${opt}</button>
                `
                  )
                  .join('')}
              </div>
              <div id="dialog-quiz-fb" class="quiz-feedback" style="display:none; margin-top:10px;"></div>
            </div>

            <div class="dialog-actions" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <button id="btn-quiz-back" class="btn-sub">← Zurück zum Gespräch</button>
              <div style="display:flex; gap:8px;">
                <button id="btn-quiz-next" class="btn-primary" style="display:none;">
                  ${isLastQ ? 'Disputation abschließen ✓' : 'Nächste Frage ➜'}
                </button>
                ${
                  isLastQ && chData.number < 8
                    ? `<button id="btn-quiz-next-ch" class="btn-dilemma-trigger" style="display:none;">⏭ Weiter zu Kapitel ${chData.number + 1} ➔</button>`
                    : ''
                }
              </div>
            </div>
          </div>
        `;

        document.getElementById('btn-quiz-back')?.addEventListener('click', () => {
          quizMode = false;
          renderDialog();
        });

        const fbEl = document.getElementById('dialog-quiz-fb');
        const nextBtn = document.getElementById('btn-quiz-next') as HTMLButtonElement | null;
        const nextChBtn = document.getElementById('btn-quiz-next-ch') as HTMLButtonElement | null;

        this.modalOverlay.querySelectorAll('.dialog-quiz-opt').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (quizAnswered) return;
            const chosen = parseInt(btn.getAttribute('data-idx') || '0', 10);
            const isCorrect = chosen === q.correct;
            quizAnswered = true;

            this.modalOverlay
              .querySelectorAll('.dialog-quiz-opt')
              .forEach((b) => ((b as HTMLButtonElement).disabled = true));

            if (isCorrect) {
              quizCorrectCount++;
              btn.classList.add('correct');
              const img = document.getElementById('mentor-portrait-img') as HTMLImageElement | null;
              if (img) img.src = happySrc;
              sound.success();
              if (fbEl) {
                fbEl.style.display = 'block';
                fbEl.className = 'quiz-feedback correct';
                fbEl.innerHTML = `✅ Richtig! ${q.explanation}`;
              }
            } else {
              btn.classList.add('wrong');
              sound.click();
              if (fbEl) {
                fbEl.style.display = 'block';
                fbEl.className = 'quiz-feedback wrong';
                fbEl.innerHTML = `💡 Auflösung: ${q.explanation}`;
              }
            }

            if (nextBtn) nextBtn.style.display = 'inline-block';
            if (isLastQ && isCorrect && nextChBtn) {
              nextChBtn.style.display = 'inline-block';
            }

            if (isLastQ) {
              if (quizCorrectCount === chData.quiz.length) {
                gameState.quizPerfect.add(chData.number);
                gameState.knowledge = Math.min(100, gameState.knowledge + 10);
              }
              if ([4, 6, 7].includes(chData.number)) {
                gameState.completeObjective(chData.number, 3);
              } else {
                gameState.completeObjective(chData.number, 0);
              }
              gameState.notify();
            }
          });
        });

        nextBtn?.addEventListener('click', () => {
          if (!isLastQ) {
            quizIdx++;
            quizAnswered = false;
            renderDialog();
          } else {
            this.showToast(`🎓 Disputation zu Kapitel ${chData.number} abgelegt!`);
            this.closeModal();
            onClose?.();
          }
        });

        nextChBtn?.addEventListener('click', () => {
          const nextCh = chData.number + 1;
          gameState.completedChapters.add(chData.number);
          gameState.maxUnlockedChapter = Math.max(gameState.maxUnlockedChapter, nextCh);
          this.closeModal();
          const world = this.scene.get('WorldScene') as WorldScene;
          if (world) world.teleportToChapter(nextCh);
          else gameState.selectStartChapter(nextCh);
          onClose?.();
        });
      }
    };

    renderDialog();
  }

  public openDilemmaModal(chapterNum?: number, onFinish?: () => void): void {
    const ch = chapterNum ?? gameState.chapter;
    const dilemma = REFORMATION_DILEMMAS.find((d) => d.chapter === ch) || REFORMATION_DILEMMAS[0];
    if (!dilemma) return;

    this.activeModal = 'dilemma';
    this.touchControls?.setVisible(false);
    this.dilemmaModal.open(dilemma, (choice) => {
      gameState.storyFlags[`dilemma_ch${dilemma.chapter}_done`] = true;
      gameState.dilemmaSummary += (gameState.dilemmaSummary ? ' | ' : '') + `K${dilemma.chapter}: ${choice.text}`;
      gameState.courage = Math.min(100, gameState.courage + Math.round(choice.points / 2));
      gameState.knowledge = Math.min(100, gameState.knowledge + Math.round(choice.points / 2));
      if (dilemma.chapter === 3) gameState.completeObjective(3, 3);
      if (dilemma.chapter === 7) gameState.completeObjective(7, 2);
      gameState.notify();
      this.showToast(`⚖️ Gewissensentscheidung: +${choice.points} Punkte!`);
      this.closeModal();
      onFinish?.();
    });
  }

  public openRelicModal(relic: ReformationRelic): void {
    this.openArtifactInspector(relic);
  }

  public openCraftingModal(): void {
    this.activeModal = 'craft';
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="inventory-card">
        <div class="modal-header">
          <div>
            <span class="relic-epoch">Druckerei &amp; Klosterapotheke</span>
            <h2>⚙️ Werkstatt &amp; Handwerkskammer</h2>
          </div>
          <button id="btn-craft-close" class="btn-close">✕</button>
        </div>

        <div class="craft-banner-box">
          <div>
            <strong>📜 Gutenberg-Satzkasten Übung</strong>
            <div style="font-size:12px; color:#5c3d22;">Setze Bleilettern spiegelverkehrt für das Flugblatt „SOLA FIDE“.</div>
          </div>
          <button id="btn-open-gutenberg" class="btn-primary">Gutenberg-Presse starten ➔</button>
        </div>

        <h3 style="margin:14px 0 8px 0; color:#78350f; font-size:14px;">Verfügbare Handwerks-Rezepte</h3>
        <div class="recipes-list">
          ${REFORMATION_RECIPES.map((r) => {
            const canCraft = r.ingredients.every((ing) => gameState.hasItem(ing.item, ing.count));
            const outDef = REFORMATION_ITEMS[r.outputItem];
            return `
              <div class="recipe-card">
                <div class="recipe-header">
                  <strong>${r.name} (${r.outputCount}× ${outDef?.name || r.outputItem})</strong>
                  <span class="recipe-desc">${r.description}</span>
                </div>
                <div class="recipe-costs">
                  Zutaten: ${r.ingredients
                    .map((ing) => {
                      const have = gameState.inventory[ing.item] || 0;
                      const nm = REFORMATION_ITEMS[ing.item]?.name || ing.item;
                      return `<span class="${have >= ing.count ? 'ing-ok' : 'ing-miss'}">${have}/${ing.count} ${nm}</span>`;
                    })
                    .join(' · ')}
                </div>
                <button class="btn-craft" data-recipe="${r.id}" ${canCraft ? '' : 'disabled'}>Herstellen ➔</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-craft-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-open-gutenberg')?.addEventListener('click', () => {
      sound.click();
      this.openGutenbergWorkshopModal(() => this.openCraftingModal());
    });

    this.modalOverlay.querySelectorAll('.btn-craft').forEach((btn) => {
      btn.addEventListener('click', () => {
        const recId = btn.getAttribute('data-recipe');
        if (!recId) return;
        if (gameState.craft(recId)) {
          sound.success();
          this.showToast('🔨 Erfolgreich in der Werkstatt gefertigt!');
          if (recId === 'recipe_flugschrift') gameState.completeObjective(2, 2);
          if (recId === 'recipe_arznei' && gameState.chapter === 6) gameState.completeObjective(6, 2);
          this.openCraftingModal();
        } else {
          sound.click();
          this.showToast('Nicht genügend Rohstoffe im Beutel!');
        }
      });
    });
  }

  public openGutenbergWorkshopModal(onComplete?: () => void): void {
    this.activeModal = 'station';
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
    this.modalOverlay.style.display = 'flex';

    let phase: 1 | 2 | 3 | 4 = 1;
    const composedLetters: string[] = [];
    const targetWord = 'SOLA FIDE';
    const letterChoices = ['S', 'O', 'L', 'A', 'F', 'I', 'D', 'E', 'R', 'T', 'M', 'G', 'P'];

    const render = () => {
      if (phase === 1) {
        const isComplete = composedLetters.join('') === targetWord;
        this.modalOverlay.innerHTML = `
          <div class="station-card" style="max-width: 680px;">
            <div class="modal-header">
              <div>
                <span class="relic-epoch">Wittenberg 1518 · Werkstatt Cranach</span>
                <h2>⚙️ Der Gutenberg-Setzkasten &amp; Winkelhaken</h2>
              </div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>

            <div style="font-size:12.5px; color:#4b3524; margin-bottom:12px; line-height:1.45;">
              Luthers Flugschrift <strong>„SOLA FIDE“</strong> (Allein durch den Glauben) wird im Winkelhaken gesetzt.
              <br/><strong style="color:#92400e;">⚠️ Druckergesetz:</strong> Jede Bleiletter steht spiegelverkehrt im Winkelhaken!
            </div>

            <div style="background:#3e2a1a; border:2px solid #8b5a2b; border-radius:8px; padding:12px; margin-bottom:14px; text-align:center;">
              <div style="font-size:10px; color:#f3d296; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                Messing-Winkelhaken (Spiegelverkehrter Satz)
              </div>
              <div style="min-height:48px; background:#23160c; border:1.5px dashed #b47d43; border-radius:6px; display:flex; align-items:center; justify-content:center; gap:6px; padding:4px 8px; flex-wrap:wrap;">
                ${
                  composedLetters.length === 0
                    ? '<span style="color:#d6b888; font-size:11px;">[Setzkasten leer · Bleilettern anklicken]</span>'
                    : composedLetters
                        .map((l) =>
                          l === ' '
                            ? '<span style="display:inline-block; width:18px; height:32px; background:#5c3d24; border-radius:3px; border:1px solid #9c6f3e;"></span>'
                            : `<span style="display:inline-flex; width:28px; height:34px; background:#e8dec8; color:#2c1a0e; font-family:'Cinzel',serif; font-weight:900; font-size:18px; border-radius:4px; border:2px solid #8b5a2b; align-items:center; justify-content:center; transform:scaleX(-1) scaleY(-1);">${l}</span>`
                        )
                        .join('')
                }
              </div>
              <div style="margin-top:6px; font-size:11.5px; color:${isComplete ? '#86efac' : '#fde68a'}; font-weight:600;">
                Gelesener Abdruck: „${composedLetters.join('')}“ ${isComplete ? '✓ (Exakt)' : ''}
              </div>
            </div>

            <div style="background:#f9eccf; border:1px solid #d6b888; border-radius:8px; padding:10px; margin-bottom:12px;">
              <div style="font-size:11px; font-weight:700; color:#78350f; margin-bottom:6px;">
                Bleilettern aus dem Setzkasten wählen:
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${letterChoices
                  .map(
                    (ch) => `
                  <button class="btn-sub btn-letter" data-char="${ch}" style="min-width:34px; padding:6px 10px; font-weight:700; font-size:13px;">
                    ${ch}
                  </button>
                `
                  )
                  .join('')}
                <button id="btn-space" class="btn-sub">␣ Spatium</button>
                <button id="btn-backspace" class="btn-sub" style="color:#991b1b;">⌫ Rückgängig</button>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
              <button id="btn-cancel" class="btn-sub">Abbrechen</button>
              <button id="btn-next-phase" class="btn-primary" style="display:${isComplete ? 'inline-block' : 'none'};">
                Schritt 2: Druckerschwärze auftragen ➔
              </button>
            </div>
          </div>
        `;

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
              <div><span class="relic-epoch">Schritt 2 von 4</span><h2>🖌️ Druckerschwärze auftragen</h2></div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>
            <div style="text-align:center; padding:16px 0;">
              <div style="font-size:40px; margin-bottom:8px;">🪵 🖌️ 📜</div>
              <p style="font-size:13px; color:#3f2814; max-width:500px; margin:0 auto 16px; line-height:1.5;">
                Die Bleilettern liegen im Zeilenschiff. Schlage die ledernen Druckballen mit Leinölfirnis und Kienruß gleichmäßig über den Satz.
              </p>
              <button id="btn-apply-ink" class="btn-primary">Druckballen schlagen ➔</button>
            </div>
          </div>
        `;
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
              <div><span class="relic-epoch">Schritt 3 von 4</span><h2>⚙️ Die Spindelpresse spannen</h2></div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>
            <div style="text-align:center; padding:16px 0;">
              <div style="font-size:40px; margin-bottom:10px;">🔩 📐 📜</div>
              <p style="font-size:13px; color:#3f2814; max-width:500px; margin:0 auto 16px; line-height:1.5;">
                Das feuchte Hadernpapier liegt auf dem Druckstock. Lege den hölzernen Schwengel der Eichenpresse kraftvoll um!
              </p>
              <button id="btn-press-lever" class="btn-primary">Presse mit Hebelzug spannen ⚙️</button>
            </div>
          </div>
        `;
        document.getElementById('btn-station-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-press-lever')?.addEventListener('click', () => {
          sound.door();
          phase = 4;
          render();
        });
      } else {
        gameState.addItem('flugblatt_sola_fide', 1);
        gameState.craftedOnce.add('flugschrift');
        gameState.knowledge = Math.min(100, gameState.knowledge + 20);
        gameState.courage = Math.min(100, gameState.courage + 10);
        gameState.completeObjective(2, 2);
        sound.questStep();

        this.modalOverlay.innerHTML = `
          <div class="station-card" style="max-width: 680px;">
            <div class="modal-header">
              <div><span class="relic-epoch">Meisterstück · Wittenberg</span><h2>📜 Frischer Flugblatt-Abzug</h2></div>
              <button id="btn-station-close" class="btn-close">✕</button>
            </div>
            <div style="background:#fffdf7; border:2px solid #8b5a2b; border-radius:8px; padding:18px; text-align:center; margin-bottom:14px;">
              <div style="font-size:10.5px; text-transform:uppercase; letter-spacing:2px; color:#78350f;">Disputatio · Wittenberg</div>
              <h1 style="font-family:'Cinzel',serif; font-size:26px; color:#991b1b; margin:6px 0 8px;">SOLA FIDE</h1>
              <p style="font-size:12px; color:#3f2814; line-height:1.5; max-width:500px; margin:0 auto; font-style:italic;">
                „Allein durch den Glauben und Gottes Gnade wird der Mensch gerecht.“
              </p>
            </div>
            <div style="background:#dcfce7; border:1px solid #16a34a; border-radius:6px; padding:10px 14px; font-size:12px; color:#14532d; margin-bottom:14px; display:flex; justify-content:space-between;">
              <span>🏆 <strong>Erhalten:</strong> Flugblatt „SOLA FIDE“</span>
              <span><strong>+20 Wissen · +10 Mut</strong></span>
            </div>
            <div style="text-align:right;">
              <button id="btn-finish-workshop" class="btn-primary">Flugblatt einstecken ➔</button>
            </div>
          </div>
        `;
        const finish = () => {
          this.closeModal();
          this.showToast('📜 Flugblatt „SOLA FIDE“ im Beutel verstaut!');
          onComplete?.();
        };
        document.getElementById('btn-station-close')?.addEventListener('click', finish);
        document.getElementById('btn-finish-workshop')?.addEventListener('click', finish);
      }
    };

    render();
  }

  public openStationModal(stationId: string): void {
    this.openStation(stationId);
  }

  public openInventory(): void {
    this.activeModal = 'inventory';
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
    this.modalOverlay.style.display = 'flex';

    const items = Object.entries(gameState.inventory).filter(([, c]) => (c || 0) > 0);
    const edibleIds = new Set(['brot_fladen', 'apfel', 'bier_krug']);

    this.modalOverlay.innerHTML = `
      <div class="inventory-card">
        <div class="modal-header">
          <div>
            <span class="relic-epoch">Reisegepäck &amp; Quellensammlung</span>
            <h2>🎒 Chronisten-Beutel &amp; Geborgene Relikte</h2>
          </div>
          <button id="btn-inv-close" class="btn-close">✕</button>
        </div>

        <div class="inv-split-container">
          <div class="inv-left">
            <h3>Gegenstände im Beutel (${items.length})</h3>
            <div class="inv-grid">
              ${
                items.length > 0
                  ? items
                      .map(([id, count]) => {
                        const itemDef = REFORMATION_ITEMS[id as ReformationItemId];
                        const isFood = edibleIds.has(id);
                        return `
                        <div class="inv-item-slot">
                          <img src="${itemDef?.icon || '/assets/icons/relic_codex.png'}" class="slot-icon" alt="${itemDef?.name || id}" />
                          <div class="slot-info">
                            <strong>${itemDef?.name || id}</strong>
                            <span>Menge: ${count} · ${itemDef?.category || 'Sache'}</span>
                          </div>
                          ${isFood ? `<button class="btn-sub btn-eat-slot" style="font-size:10.5px; padding:4px 8px;">Essen</button>` : ''}
                        </div>
                      `;
                      })
                      .join('')
                  : '<div class="empty-hint">Der Beutel ist noch leer. Sammle Kisten &amp; Kräuter!</div>'
              }
            </div>
          </div>

          <div class="inv-right">
            <h3>Geborgene Primärquellen (${gameState.discoveredRelics.size} / ${REFORMATION_RELICS.length})</h3>
            <div class="recipes-list">
              ${REFORMATION_RELICS.map((r) => {
                const found = gameState.discoveredRelics.has(r.id);
                return `
                  <div class="recipe-card ${found ? '' : 'locked-relic-card'}">
                    <div class="recipe-header">
                      <strong>${found ? r.name : '🔒 Unentdeckte Quelle'}</strong>
                      <span class="recipe-desc">${found ? `${r.year} · ${r.location}` : `Fundort: ${r.location}`}</span>
                    </div>
                    ${found ? `<button class="btn-sub btn-inspect-relic" data-relic="${r.id}">360° Öffnen</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-inv-close')?.addEventListener('click', () => this.closeModal());
    this.modalOverlay.querySelectorAll('.btn-eat-slot').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.eatFood();
        this.openInventory();
      });
    });
    this.modalOverlay.querySelectorAll('.btn-inspect-relic').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rid = btn.getAttribute('data-relic');
        if (rid) this.openArtifactInspector(rid);
      });
    });
  }

  public openLexiconModal(): void {
    this.activeModal = 'lexicon';
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
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
            <h2>📖 Lexikon der Reformation (${unlockedCount} / ${REFORMATION_LEXICON.length} freigeschaltet)</h2>
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
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <div>
                  <span class="detail-cat" style="font-size:11px; font-weight:700; color:#b45309; text-transform:uppercase;">${selectedEntry.category}</span>
                  <h3 class="detail-term" style="font-family:'Cinzel',serif; font-size:18px; font-weight:800; color:#78350f; margin:4px 0 10px 0;">${selectedEntry.term}</h3>
                </div>
                <button id="btn-lex-speak" class="btn-sub" style="font-size:11px; padding:5px 10px;">🔊 Vorlesen</button>
              </div>
              <div class="detail-def" style="margin-top:8px; font-size:12.5px; line-height:1.5; color:#1f2937;">
                <strong>Definition:</strong> ${selectedEntry.definition}
              </div>
              <div class="detail-context" style="margin-top:10px; font-size:12px; line-height:1.5; color:#4b5563;">
                <strong>Historischer Kontext:</strong> ${selectedEntry.historicalContext}
              </div>
              <div class="detail-merksatz" style="margin-top:14px; background:#ecfdf5; border:1px solid #10b981; border-radius:8px; padding:10px 12px; font-size:11.5px; color:#065f46; line-height:1.45;">
                <strong style="display:block; margin-bottom:2px;">💡 Merksatz:</strong>
                ${selectedEntry.merksatz}
              </div>
            `
                : `
              <div class="lex-locked-placeholder" style="text-align:center; padding:32px 16px;">
                <div style="font-size:42px; margin-bottom:10px;">🔒</div>
                <h3 style="font-family:'Cinzel',serif; color:#78350f; margin-bottom:8px;">${selectedEntry.term} ist versiegelt</h3>
                <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:12px; max-width:380px; margin:0 auto; font-size:12px; color:#92400e; text-align:left;">
                  <strong>💡 Freischalt-Hinweis:</strong> ${selectedEntry.unlockHint} (Ab Kapitel ${selectedEntry.minChapter})
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
          if (gameState.unlockedLexicon.has(id)) gameState.markLexiconRead(id);
          this.openLexiconModal();
        }
      });
    });
    document.getElementById('btn-lex-speak')?.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          `${selectedEntry.term}. ${selectedEntry.definition} ${selectedEntry.merksatz}`
        );
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
    this.touchControls?.setVisible(false);
    this.hideChapterBanner();
    this.modalOverlay.style.display = 'flex';

    const rang = gameState.getChronistenRang();
    const totalSec = Math.max(0, Math.floor(gameState.playTimeSeconds));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    const hefterCode = gameState.generateHefterCode();
    const volPct = Math.round(musicManager.getVolume() * 100);

    this.modalOverlay.innerHTML = `
      <div class="pause-card">
        <div class="modal-header">
          <h2>⚙️ Chronisten-Dashboard (7 Kacheln)</h2>
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
            <span>${gameState.completedChapters.size} gemeistert</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">📖</span>
            <strong>${gameState.unlockedLexicon.size} / ${REFORMATION_LEXICON.length} Lexikon</strong>
            <span>${gameState.discoveredRelics.size} / ${REFORMATION_RELICS.length} Quellen geborgen</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">⏱️</span>
            <strong>${mm}:${ss} Min · ${Math.round(gameState.walkedDistanceMeters)} m</strong>
            <span>Aktive Studienzeit &amp; Reiseweg</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon">🔑</span>
            <strong>Hefter-Code</strong>
            <span class="hefter-code-pill">${hefterCode}</span>
            <button id="btn-copy-code" class="btn-sub" style="margin-top:4px; font-size:10.5px; padding:2px 8px;">Kopieren</button>
          </div>
          <div class="pause-tile" id="tile-print-hefter" style="cursor:pointer; background:#fef3c7;">
            <span class="tile-icon">🖨️</span>
            <strong>A4-Hefterblatt</strong>
            <span style="color:#b45309; font-weight:700;">1-Klick Druck [U]</span>
          </div>
          <div class="pause-tile">
            <span class="tile-icon" id="pause-audio-icon" style="cursor:pointer;">${sound.isMuted() ? '🔇' : '🎵'}</span>
            <strong>Audio (${sound.isMuted() ? 'Aus' : volPct + '%'})</strong>
            <input id="pause-volume-slider" type="range" min="0" max="100" value="${volPct}" style="width:100%; accent-color:#b45309;" />
            <button id="btn-pause-mute" class="btn-sub" style="font-size:10.5px; padding:2px 8px;">${sound.isMuted() ? 'Ton ein' : 'Stumm'}</button>
          </div>
        </div>

        <div class="pause-footer-actions">
          <button id="btn-pause-startscreen" class="btn-sub">🏠 Startscreen [K]</button>
          <button id="btn-save-state" class="btn-sub">💾 Sichern</button>
          <button id="btn-resume" class="btn-primary">Weiterspielen ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btn-pause-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-pause-startscreen')?.addEventListener('click', () => this.openStartScreen());
    document.getElementById('tile-print-hefter')?.addEventListener('click', () => this.triggerDiplomPrint());
    document.getElementById('btn-copy-code')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(hefterCode).catch(() => {});
      this.showToast(`📋 Code kopiert: ${hefterCode}`);
    });
    document.getElementById('btn-pause-mute')?.addEventListener('click', () => {
      sound.toggleMute();
      this.openPauseDashboard();
    });
    document.getElementById('pause-volume-slider')?.addEventListener('input', (e) => {
      const v = parseInt((e.target as HTMLInputElement).value || '42', 10) / 100;
      sound.setVolume(v);
    });
    document.getElementById('btn-save-state')?.addEventListener('click', () => {
      gameState.autoSave();
      sound.success();
      this.showToast('💾 Spielstand im Browser gesichert!');
    });
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
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }
}
