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
        position: fixed; inset: 0; background: rgba(24, 16, 10, 0.72);
        backdrop-filter: blur(4px); z-index: 3500; display: flex;
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
        <div style="background: linear-gradient(180deg, #fdf6e3, #f5e6c8); border: 2px solid #8b5a2b; border-radius: 12px; max-width: 620px; width: 100%; color: #2c1a0e; box-shadow: 0 20px 50px rgba(28, 18, 10, 0.55); overflow: hidden;">
          <div style="background: linear-gradient(90deg, #f3e1bc, #ebd2a2); padding: 14px 20px; border-bottom: 1.5px solid #c99e63; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.9px; color: #92400e; font-weight: 800;">🏛️ Mitmach-Station · ${st.badge}</div>
              <div style="font-size: 16px; font-weight: 800; color: #2c1a0e; font-family: 'Cinzel', Georgia, serif;">${st.name}</div>
            </div>
            <button id="station-close-btn" style="background: #fffbeb; border: 1.5px solid #b45309; color: #78350f; font-size: 16px; font-weight: 800; cursor: pointer; border-radius: 6px; width: 32px; height: 32px; line-height: 1;">✕</button>
          </div>

          <div style="padding: 18px 20px; max-height: 70vh; overflow-y: auto;">
            <div style="font-size: 12.5px; color: #4a321e; margin-bottom: 12px; line-height: 1.48; background: #fffbf0; border: 1px solid #d6b888; padding: 10px 14px; border-radius: 8px;">
              📍 <strong>${st.location}:</strong> ${st.intro}
            </div>

            <div style="background: #f9eccf; border-left: 4px solid #b45309; border-radius: 6px; padding: 12px 14px; margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase;">${step.title} · Schritt ${this.currentStepIndex + 1}/${st.steps.length}</div>
              <div style="font-size: 14px; font-weight: 700; color: #1c1008; margin-top: 4px; line-height: 1.42;">${step.prompt}</div>
            </div>

            <div id="station-options-list" style="display: flex; flex-direction: column; gap: 8px;">
              ${step.options
                .map(
                  (opt, optIdx) => `
                <button class="station-opt-btn" data-idx="${optIdx}" style="background: #fffdf7; border: 1.5px solid #c9a46d; color: #2c1a0e; border-radius: 8px; padding: 11px 14px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 600; line-height: 1.38; transition: 0.15s;">
                  ${opt.text}
                </button>
              `
                )
                .join('')}
            </div>

            <div id="station-feedback-box" style="display: none; margin-top: 12px; padding: 10px 14px; border-radius: 8px; font-size: 12.5px; line-height: 1.45;"></div>
          </div>

          <div style="padding: 12px 20px; background: #f2e1be; border-top: 1.5px solid #c99e63; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <span style="font-size: 11.5px; color: #6b4c2f;">Lernpfeiler: ${st.historicalPillar}</span>
            <button id="station-next-btn" style="display: none; background: #b45309; border: 1.5px solid #78350f; color: #fff; font-weight: 800; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 13px;">
              ${isLastStep ? 'Station abschließen ✓' : 'Nächster Schritt ➜'}
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
            feedbackBox.style.background = '#dcfce7';
            feedbackBox.style.border = '1.5px solid #15803d';
            feedbackBox.style.color = '#14532d';
            feedbackBox.innerHTML = `✅ <strong>Historisch zutreffend!</strong> ${opt.feedback}`;
            nextBtn.style.display = 'inline-block';

            this.overlay?.querySelectorAll('.station-opt-btn').forEach((b) => ((b as HTMLButtonElement).disabled = true));
            btn.setAttribute(
              'style',
              'background: #dcfce7; border: 2px solid #15803d; color: #14532d; border-radius: 8px; padding: 11px 14px; text-align: left; font-size: 13px; font-weight: 700;'
            );
          } else {
            sound.playClick();
            feedbackBox.style.display = 'block';
            feedbackBox.style.background = '#fee2e2';
            feedbackBox.style.border = '1.5px solid #b91c1c';
            feedbackBox.style.color = '#7f1d1d';
            feedbackBox.innerHTML = `❌ <strong>Noch nicht ganz:</strong> ${opt.feedback}`;
          }
        });
      });

      nextBtn?.addEventListener('click', () => {
        if (isLastStep) {
          gameState.storyFlags[`${st.id}_completed`] = true;
          gameState.knowledge = Math.min(100, gameState.knowledge + 12);
          gameState.completeObjective(st.chapter, 2);
          gameState.notify();
          this.close();
          (window as any).__showToast?.(`✅ Station „${st.name}“ gemeistert!`);
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
