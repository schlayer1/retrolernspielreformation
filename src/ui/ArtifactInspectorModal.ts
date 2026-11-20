import { ReformationRelic } from '../data/relics';
import { gameState } from '../systems/GameState';
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
        position: fixed; inset: 0; background: rgba(24, 16, 10, 0.72);
        backdrop-filter: blur(4px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: 'Cinzel', Georgia, system-ui, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    const recordDiscovery = () => {
      gameState.discoverRelic(relic.id);
      if (relic.id === 'ablasskasten_tetzel') gameState.completeObjective(1, 1);
      else if (relic.id === 'thesen_95') gameState.completeObjective(1, 3);
      else if (relic.id === 'druckerplatte_cranach') gameState.completeObjective(2, 3);
      else if (relic.id === 'septembertestament') gameState.completeObjective(5, 3);
      else if (relic.id === 'religionsfriede_1555') gameState.completeObjective(8, 3);
    };

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
        <div style="background: linear-gradient(180deg, #fdf6e3, #f5e6c8); border: 2px solid #8b5a2b; border-radius: 12px; max-width: 660px; width: 100%; color: #2c1a0e; box-shadow: 0 20px 50px rgba(28, 18, 10, 0.55); overflow: hidden;">
          <div style="background: linear-gradient(90deg, #f3e1bc, #ebd2a2); padding: 14px 20px; border-bottom: 1.5px solid #c99e63; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.9px; color: #92400e; font-weight: 800; font-family: system-ui, sans-serif;">🔍 360°-Primärquellen-Inspektor</div>
              <div style="font-size: 17px; font-weight: 800; color: #2c1a0e; margin-top: 2px;">${displayTitle}</div>
            </div>
            <button id="relic-close-btn" style="background: #fffbeb; border: 1.5px solid #b45309; color: #78350f; font-size: 16px; font-weight: 800; cursor: pointer; border-radius: 6px; width: 32px; height: 32px;">✕</button>
          </div>

          <div style="padding: 18px 20px; max-height: 72vh; overflow-y: auto; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; gap: 18px; align-items: center; margin-bottom: 16px; background: #fffbf0; padding: 14px; border-radius: 10px; border: 1.5px solid #d6b888;">
              <div style="flex-shrink: 0; text-align: center;">
                <div style="width: 96px; height: 96px; background: radial-gradient(circle, #fef3c7 0%, #e7d0a3 80%); border: 2px solid #8b5a2b; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: transform 0.35s ease; transform: ${this.isBackSide ? 'rotateY(180deg)' : 'rotateY(0)'} scale(${this.isZoomed ? '1.35' : '1.0'});">
                  <img src="${iconUrl}" alt="${displayTitle}" style="width: 68px; height: 68px; object-fit: contain; image-rendering: pixelated;" />
                </div>
                <div style="font-size: 10.5px; color: #78350f; margin-top: 6px; font-weight: 700;">
                  ${this.isBackSide ? '🔄 Revers (Rückseite)' : '🔍 Avers (Vorderseite)'}
                </div>
              </div>

              <div style="flex-grow: 1;">
                <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                  <span style="background: #fef3c7; border: 1px solid #d97706; border-radius: 6px; padding: 3px 9px; font-size: 11.5px; color: #78350f; font-weight: 700;">⏳ ${dating}</span>
                  <span style="background: #fef3c7; border: 1px solid #d97706; border-radius: 6px; padding: 3px 9px; font-size: 11.5px; color: #78350f; font-weight: 700;">📍 ${location}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button id="relic-flip-btn" style="background: #b45309; border: 1.5px solid #78350f; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    🔄 360° Wenden
                  </button>
                  <button id="relic-zoom-btn" style="background: #fffdf7; border: 1.5px solid #8b5a2b; color: #78350f; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    🔎 ${this.isZoomed ? 'Verkleinern' : 'Lupe (Zoom)'}
                  </button>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <h4 style="font-family: 'Cinzel', Georgia, serif; color: #78350f; margin: 0 0 6px 0; font-size: 14px; font-weight: 800;">Historischer Quellenbefund (${this.isBackSide ? 'Revers' : 'Avers'})</h4>
              <p style="font-size: 13px; line-height: 1.5; color: #2c1a0e; background: #fffdf7; padding: 12px; border-radius: 8px; border-left: 4px solid #b45309; margin: 0;">
                ${descText}
              </p>
            </div>

            ${
              fact
                ? `
              <div style="background: #f9eccf; border: 1.5px dashed #b45309; border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; font-weight: 800; color: #92400e; margin-bottom: 4px; text-transform: uppercase;">💡 Historische Einordnung</div>
                <div style="font-size: 12.5px; color: #3f2814; line-height: 1.45;">${fact}</div>
              </div>
            `
                : ''
            }
          </div>

          <div style="background: #f2e1be; padding: 12px 20px; border-top: 1.5px solid #c99e63; text-align: right;">
            <button id="relic-ok-btn" style="background: #b45309; border: 1.5px solid #78350f; color: #fff; font-weight: 800; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 13px;">
              In den Chronisten-Beutel sichern ✓
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
        sound.playSuccess();
        recordDiscovery();
        this.close();
        (window as any).__showToast?.(`📜 Quelle gesichert: ${relic.foundName || relic.name}`);
        if (onClose) onClose();
      };

      this.overlay.querySelector('#relic-close-btn')?.addEventListener('click', closeHandler);
      this.overlay.querySelector('#relic-ok-btn')?.addEventListener('click', closeHandler);
    };

    sound.playSelect();
    recordDiscovery();
    this.overlay.style.display = 'flex';
    render();
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }
}
