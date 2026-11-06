import { ReformationDilemma, DilemmaChoice } from '../data/dilemmas';
import { sound } from '../audio/sound';

export class DilemmaModal {
  private el: HTMLElement;
  private currentDilemma: ReformationDilemma | null = null;
  private onChosenCallback: ((choice: DilemmaChoice) => void) | null = null;

  constructor() {
    const existing = document.getElementById('dilemma-modal');
    if (existing) {
      this.el = existing;
    } else {
      this.el = document.createElement('div');
      this.el.id = 'dilemma-modal';
      this.el.className = 'dilemma-overlay';
      this.el.style.display = 'none';
      document.body.appendChild(this.el);
    }
    this.injectStyles();
  }

  public open(dilemma: ReformationDilemma, onChosen: (choice: DilemmaChoice) => void): void {
    this.currentDilemma = dilemma;
    this.onChosenCallback = onChosen;
    this.render();
    this.el.style.display = 'flex';
  }

  public close(): void {
    this.el.style.display = 'none';
    this.currentDilemma = null;
  }

  private render(): void {
    if (!this.currentDilemma) return;
    const d = this.currentDilemma;

    this.el.innerHTML = `
      <div class="dilemma-card">
        <div class="dilemma-header">
          <span class="dilemma-badge">⚖️ Historisches Gewissens-Dilemma</span>
          <span class="dilemma-chapter">Kapitel ${d.chapter}</span>
        </div>
        <h2 class="dilemma-title">${d.title}</h2>
        <div class="dilemma-body">
          <p class="dilemma-text">${d.situation}</p>
        </div>
        <div class="dilemma-prompt">📜 ${d.historicalQuestion}</div>
        <div class="dilemma-options">
          ${d.choices
            .map(
              (choice, i) => `
            <button class="dilemma-opt-btn" data-index="${i}">
              <div class="opt-head">
                <span class="opt-num">Option ${i + 1}</span>
                <strong class="opt-title">${choice.text}</strong>
              </div>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    const btns = this.el.querySelectorAll('.dilemma-opt-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
        const chosen = d.choices[idx];
        sound.click();
        this.showOutcome(chosen);
      });
    });
  }

  private showOutcome(choice: DilemmaChoice): void {
    this.el.innerHTML = `
      <div class="dilemma-card">
        <div class="dilemma-header">
          <span class="dilemma-badge">📜 Historische Konsequenz</span>
        </div>
        <h2 class="dilemma-title">Deine Entscheidung</h2>
        <div class="dilemma-body">
          <p class="dilemma-outcome-text">„${choice.text}“</p>
          <div class="dilemma-feedback-box">
            ${choice.historicalOutcome}
          </div>
          <div class="dilemma-pts">+${choice.points} Bildungs- & Gewissenspunkte</div>
        </div>
        <button class="btn-primary outcome-close-btn" style="margin-top: 16px; width: 100%;">Im Abenteuer fortfahren</button>
      </div>
    `;

    sound.success();

    const closeBtn = this.el.querySelector('.outcome-close-btn');
    closeBtn?.addEventListener('click', () => {
      sound.click();
      this.close();
      this.onChosenCallback?.(choice);
    });
  }

  private injectStyles(): void {
    if (document.getElementById('dilemma-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'dilemma-modal-styles';
    style.textContent = `
      .dilemma-overlay {
        position: fixed;
        inset: 0;
        background: rgba(16, 12, 8, 0.85);
        backdrop-filter: blur(4px);
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .dilemma-card {
        background: #fdf6e3;
        border: 2px solid #b45309;
        border-radius: 12px;
        max-width: 620px;
        width: 100%;
        padding: 24px;
        color: #291b12;
        box-shadow: 0 12px 48px rgba(0,0,0,0.8);
      }
      .dilemma-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .dilemma-badge {
        font-size: 11px;
        font-weight: 800;
        background: #fef3c7;
        color: #b45309;
        padding: 4px 10px;
        border-radius: 6px;
      }
      .dilemma-chapter {
        font-size: 12px;
        font-weight: 700;
        color: #78350f;
      }
      .dilemma-title {
        font-family: 'Cinzel', serif;
        font-size: 18px;
        font-weight: 800;
        color: #78350f;
        margin: 0 0 12px 0;
      }
      .dilemma-body {
        font-size: 13.5px;
        line-height: 1.55;
        color: #374151;
      }
      .dilemma-prompt {
        font-weight: 700;
        font-size: 13.5px;
        color: #92400e;
        margin: 16px 0 12px 0;
        background: #fffbeb;
        padding: 8px 12px;
        border-left: 3px solid #f59e0b;
        border-radius: 4px;
      }
      .dilemma-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .dilemma-opt-btn {
        background: #fff;
        border: 1.5px solid #d1d5db;
        border-radius: 8px;
        padding: 12px 16px;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .dilemma-opt-btn:hover {
        border-color: #b45309;
        background: #fffbf0;
        transform: translateY(-1px);
      }
      .opt-num {
        font-size: 10.5px;
        font-weight: 700;
        color: #b45309;
        text-transform: uppercase;
        display: block;
        margin-bottom: 2px;
      }
      .opt-title {
        font-size: 13px;
        color: #1f2937;
      }
      .dilemma-outcome-text {
        font-style: italic;
        font-weight: 600;
        color: #78350f;
        margin-bottom: 12px;
      }
      .dilemma-feedback-box {
        background: #f0fdf4;
        border: 1.5px solid #86efac;
        padding: 14px;
        border-radius: 8px;
        color: #166534;
        font-size: 13.5px;
        line-height: 1.5;
      }
      .dilemma-pts {
        margin-top: 12px;
        font-weight: 800;
        color: #b45309;
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);
  }
}
