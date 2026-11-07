import { DidacticStation } from '../data/stations';
import { gameState } from '../systems/GameState';
import { sound } from '../audio/sound';

export class StationModal {
  private overlay: HTMLElement | null = null;
  private currentStepIndex = 0;
  private activeStation: DidacticStation | null = null;

  public open(station: DidacticStation, onComplete?: () => void): void {
    this.activeStation = station;
    this.currentStepIndex = 0;

    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'station-modal';
      this.overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(14, 10, 8, 0.88);
        backdrop-filter: blur(5px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    const render = () => {
      if (!this.overlay || !this.activeStation) return;
      const st = this.activeStation;
      const step = st.steps[this.currentStepIndex] || st.steps[0];
      const isLastStep = this.currentStepIndex >= st.steps.length - 1;

      this.overlay.innerHTML = `
        <div style="background: linear-gradient(145deg, #24160e, #140d08); border: 2px solid #b45309; border-radius: 12px; max-width: 620px; width: 100%; color: #fef3c7; box-shadow: 0 20px 50px rgba(0,0,0,0.85); overflow: hidden;">
          <div style="background: rgba(180, 83, 9, 0.2); padding: 14px 20px; border-bottom: 1px solid rgba(180, 83, 9, 0.4); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: bold;">🏛️ Didaktische Mitmach-Station: ${st.badge}</div>
              <div style="font-size: 16px; font-weight: bold; color: #fff;">${st.name}</div>
            </div>
            <button id="station-close-btn" style="background: transparent; border: none; color: #fbbf24; font-size: 22px; cursor: pointer; padding: 0 6px;">✕</button>
          </div>

          <div style="padding: 18px 20px; max-height: 70vh; overflow-y: auto;">
            <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 12px; line-height: 1.45; background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: 6px;">
              📍 <em>${st.location}</em> · ${st.intro}
            </div>

            <div style="background: rgba(180, 83, 9, 0.12); border-left: 3px solid #b45309; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: bold; color: #fbbf24; text-transform: uppercase;">${step.title} (Schritt ${this.currentStepIndex + 1}/${st.steps.length})</div>
              <div style="font-size: 13.5px; font-weight: 600; color: #fff; margin-top: 4px; line-height: 1.4;">${step.prompt}</div>
            </div>

            <div id="station-options-list" style="display: flex; flex-direction: column; gap: 8px;">
              ${step.options
                .map(
                  (opt, optIdx) => `
                <button class="station-opt-btn" data-idx="${optIdx}" style="background: rgba(42, 29, 18, 0.9); border: 1.5px solid #78350f; color: #fef3c7; border-radius: 8px; padding: 10px 14px; text-align: left; cursor: pointer; font-size: 12.5px; line-height: 1.35; transition: 0.15s;">
                  ${opt.text}
                </button>
              `
                )
                .join('')}
            </div>

            <div id="station-feedback-box" style="display: none; margin-top: 12px; padding: 10px 14px; border-radius: 6px; font-size: 12px; line-height: 1.4;"></div>
          </div>

          <div style="padding: 12px 20px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(180, 83, 9, 0.3); display: flex; justify-content: flex-end; gap: 10px;">
            <button id="station-next-btn" style="display: none; background: #b45309; border: 1px solid #d97706; color: #fff; font-weight: bold; padding: 7px 18px; border-radius: 6px; cursor: pointer;">
              ${isLastStep ? 'Station abschließen (+100 Pkt)' : 'Nächster Schritt ➜'}
            </button>
          </div>
        </div>
      `;

      this.overlay.querySelector('#station-close-btn')?.addEventListener('click', () => {
        sound.playClick();
        this.close();
      });

      const nextBtn = this.overlay.querySelector('#station-next-btn') as HTMLButtonElement;
      const feedbackBox = this.overlay.querySelector('#station-feedback-box') as HTMLDivElement;

      this.overlay.querySelectorAll('.station-opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
          const opt = step.options[idx];

          if (opt.isCorrect) {
            sound.playSuccess();
            feedbackBox.style.display = 'block';
            feedbackBox.style.background = 'rgba(22, 101, 52, 0.35)';
            feedbackBox.style.border = '1px solid #16a34a';
            feedbackBox.style.color = '#86efac';
            feedbackBox.innerHTML = `✅ <strong>Historisch zutreffend!</strong> ${opt.feedback}`;
            nextBtn.style.display = 'inline-block';

            // Disable buttons
            this.overlay?.querySelectorAll('.station-opt-btn').forEach((b) => ((b as HTMLButtonElement).disabled = true));
            btn.setAttribute('style', 'background: rgba(22, 101, 52, 0.5); border: 1.5px solid #22c55e; color: #fff; border-radius: 8px; padding: 10px 14px; text-align: left; font-size: 12.5px;');
          } else {
            sound.playClick();
            feedbackBox.style.display = 'block';
            feedbackBox.style.background = 'rgba(153, 27, 27, 0.35)';
            feedbackBox.style.border = '1px solid #dc2626';
            feedbackBox.style.color = '#fca5a5';
            feedbackBox.innerHTML = `❌ <strong>Noch nicht ganz:</strong> ${opt.feedback}`;
          }
        });
      });

      nextBtn?.addEventListener('click', () => {
        if (isLastStep) {
          gameState.storyFlags[`${st.id}_completed`] = true;
          gameState.knowledge = Math.min(100, gameState.knowledge + 15);
          gameState.notify();
          this.close();
          if (onComplete) onComplete();
        } else {
          this.currentStepIndex++;
          render();
        }
      });
    };

    sound.playSelect();
    this.overlay.style.display = 'flex';
    render();
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }
}
