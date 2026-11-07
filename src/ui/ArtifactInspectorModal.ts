import { ReformationRelic } from '../data/relics';
import { sound } from '../audio/sound';

export class ArtifactInspectorModal {
  private overlay: HTMLElement | null = null;
  private isBackSide = false;
  private isZoomed = false;

  public open(relic: ReformationRelic, onClose?: () => void): void {
    this.isBackSide = false;
    this.isZoomed = false;

    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'artifact-inspector-modal';
      this.overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(12, 8, 6, 0.88);
        backdrop-filter: blur(6px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: 'Cinzel', Georgia, system-ui, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    const render = () => {
      if (!this.overlay) return;
      const displayTitle = relic.name || 'Historisches Relikt';
      const iconUrl = relic.icon || '/assets/icons/relic_codex.png';
      const dating = relic.year ? `${relic.year} (${relic.epoch})` : relic.epoch;
      const location = relic.location || 'Wittenberg';
      const descText = this.isBackSide
        ? (relic.reversDetails || relic.description)
        : (relic.aversDetails || relic.description);
      const fact = relic.didacticSummary || relic.historicalSignificance || '';

      this.overlay.innerHTML = `
        <div style="background: linear-gradient(145deg, #24160e, #140d08); border: 2px solid #b45309; border-radius: 12px; max-width: 660px; width: 100%; color: #fef3c7; box-shadow: 0 20px 50px rgba(0,0,0,0.85); overflow: hidden;">
          <div style="background: rgba(180, 83, 9, 0.2); padding: 14px 20px; border-bottom: 1px solid rgba(180, 83, 9, 0.4); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: bold;">🔍 Archäologischer 360°-Quelleninspektor</div>
              <div style="font-size: 17px; font-weight: bold; color: #fff; margin-top: 2px;">${displayTitle}</div>
            </div>
            <button id="relic-close-btn" style="background: transparent; border: none; color: #fbbf24; font-size: 24px; cursor: pointer; padding: 0 8px;">✕</button>
          </div>

          <div style="padding: 20px; max-height: 72vh; overflow-y: auto; font-family: 'Inter', system-ui, sans-serif;">
            <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; background: rgba(0,0,0,0.35); padding: 16px; border-radius: 8px; border: 1px solid rgba(180, 83, 9, 0.25);">
              <div style="flex-shrink: 0; text-align: center;">
                <div style="width: 100px; height: 100px; background: radial-gradient(circle, rgba(180,83,9,0.3) 0%, rgba(0,0,0,0.7) 70%); border: 2px solid #b45309; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: transform 0.4s ease; transform: ${this.isBackSide ? 'rotateY(180deg)' : 'rotateY(0)'} scale(${this.isZoomed ? '1.4' : '1.0'});">
                  <img src="${iconUrl}" alt="${displayTitle}" style="width: 70px; height: 70px; object-fit: contain; image-rendering: pixelated;" />
                </div>
                <div style="font-size: 10px; color: #fbbf24; margin-top: 6px; font-weight: 600;">
                  ${this.isBackSide ? '🔄 Revers (Rückseite)' : '🔍 Avers (Vorderseite)'}
                </div>
              </div>

              <div style="flex-grow: 1;">
                <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="background: rgba(180,83,9,0.25); border: 1px solid #b45309; border-radius: 4px; padding: 2px 8px; font-size: 11px; color: #fde68a;">⏳ ${dating}</span>
                  <span style="background: rgba(180,83,9,0.25); border: 1px solid #b45309; border-radius: 4px; padding: 2px 8px; font-size: 11px; color: #fde68a;">📍 ${location}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="relic-flip-btn" style="background: #b45309; border: 1px solid #d97706; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">
                    🔄 360° Wenden
                  </button>
                  <button id="relic-zoom-btn" style="background: rgba(255,255,255,0.08); border: 1px solid #b45309; color: #fbbf24; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                    🔎 ${this.isZoomed ? 'Verkleinern' : 'Lupe (Zoom)'}
                  </button>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <h4 style="font-family: 'Cinzel', Georgia, serif; color: #fbbf24; margin-bottom: 6px; font-size: 14px;">Wissenschaftlicher Befund:</h4>
              <p style="font-size: 13px; line-height: 1.5; color: #fef3c7; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px; border-left: 3px solid #b45309;">
                ${descText}
              </p>
            </div>

            ${
              fact
                ? `
              <div style="background: rgba(180,83,9,0.15); border: 1px dashed #b45309; border-radius: 6px; padding: 12px;">
                <div style="font-size: 11px; font-weight: bold; color: #fbbf24; margin-bottom: 4px; text-transform: uppercase;">💡 Didaktische Primärquellen-Bedeutung</div>
                <div style="font-size: 12.5px; color: #fed7aa; line-height: 1.4;">${fact}</div>
              </div>
            `
                : ''
            }
          </div>

          <div style="background: rgba(0,0,0,0.3); padding: 12px 20px; border-top: 1px solid rgba(180,83,9,0.3); text-align: right;">
            <button id="relic-ok-btn" style="background: #b45309; border: 1px solid #d97706; color: #fff; font-weight: bold; padding: 7px 18px; border-radius: 6px; cursor: pointer;">
              In den Chronisten-Beutel legen
            </button>
          </div>
        </div>
      `;

      this.overlay.querySelector('#relic-flip-btn')?.addEventListener('click', () => {
        sound.playClick();
        this.isBackSide = !this.isBackSide;
        render();
      });

      this.overlay.querySelector('#relic-zoom-btn')?.addEventListener('click', () => {
        sound.playClick();
        this.isZoomed = !this.isZoomed;
        render();
      });

      const closeHandler = () => {
        sound.playClick();
        this.close();
        if (onClose) onClose();
      };

      this.overlay.querySelector('#relic-close-btn')?.addEventListener('click', closeHandler);
      this.overlay.querySelector('#relic-ok-btn')?.addEventListener('click', closeHandler);
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
