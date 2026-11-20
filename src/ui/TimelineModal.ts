import { sound } from '../audio/sound';

export interface TimelinePhase {
  epoch: string;
  century: string;
  title: string;
  focus: string;
  techInnovation: string;
}

export class TimelineModal {
  private overlay: HTMLElement | null = null;

  private phases: TimelinePhase[] = [
    {
      epoch: 'Frühe Reformation (1517–1521)',
      century: 'Thesenanschlag bis Wormser Reichstag',
      title: 'Kritik am Ablass, theologische Disputationen & Standhaftigkeit vor dem Kaiser',
      focus: '95 Thesen gegen Johann Tetzel, Bannandrohung durch Papst Leo X., Verbrennung der Bannbulle und Luthers Weigerung des Widerrufs vor Kaiser Karl V. („Hier stehe ich“).',
      techInnovation: 'Rasanter Aufstieg der Flugschriften, Lettern-Bleisatz in Wittenberg und Holzschnitt-Propaganda von Lucas Cranach.',
    },
    {
      epoch: 'Verbreitung & Radikalisierung (1521–1530)',
      century: 'Wartburg, Bildersturm, Bauernkrieg & Bekenntnis',
      title: 'Bibelübersetzung ins Deutsche, Entstehung des evangelischen Pfarrhauses & Confessio Augustana',
      focus: 'Junker Jörg übersetzt das Neue Testament in nur 11 Wochen auf der Wartburg; soziale Unruhen und Niederschlagung des Bauernkriegs; Vorlage des Augsburger Bekenntnisses 1530.',
      techInnovation: 'Septembertestament als Fundament der neuhochdeutschen Schriftsprache, reformatorische Kirchenlieder und Katechismus-Drucke.',
    },
    {
      epoch: 'Konfessionalisierung & Frieden (1530–1555)',
      century: 'Schmalkaldischer Bund bis Augsburger Religionsfrieden',
      title: 'Glaubenskriege, Reichsgesetze & völkerrechtliche Anerkennung',
      focus: 'Schmalkaldischer Krieg zwischen Kaiser und evangelischen Fürsten; Augsburger Religionsfrieden 1555 mit dem Grundsatz „Cuius regio, eius religio“ und dem Ius emigrandi.',
      techInnovation: 'Reichsweite Notariatsakten, doppelte Kanzleiführung katholischer und evangelischer Territorien, Schulordnungen für Knaben und Mädchen.',
    },
  ];

  public open(onClose?: () => void): void {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'timeline-modal';
      this.overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(24, 16, 10, 0.72);
        backdrop-filter: blur(4px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    sound.playClick();
    this.overlay.style.display = 'flex';

    this.overlay.innerHTML = `
      <div style="background: linear-gradient(180deg, #fdf6e3, #f5e6c8); border: 2px solid #8b5a2b; border-radius: 12px; max-width: 680px; width: 100%; color: #2c1a0e; box-shadow: 0 20px 50px rgba(28, 18, 10, 0.55); overflow: hidden;">
        <div style="background: linear-gradient(90deg, #f3e1bc, #ebd2a2); padding: 14px 20px; border-bottom: 1.5px solid #c99e63; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.9px; color: #92400e; font-weight: 800;">⏳ Epochen-Zeitstrahl</div>
            <div style="font-size: 16px; font-weight: 800; color: #2c1a0e; font-family: 'Cinzel', Georgia, serif;">Die Reformation im Heiligen Römischen Reich (1517–1555)</div>
          </div>
          <button id="tl-close-btn" style="background: #fffbeb; border: 1.5px solid #b45309; color: #78350f; font-size: 16px; font-weight: 800; cursor: pointer; border-radius: 6px; width: 32px; height: 32px;">✕</button>
        </div>

        <div style="padding: 18px; max-height: 72vh; overflow-y: auto;">
          ${this.phases
            .map(
              (p, idx) => `
            <div style="background: #fffdf7; border: 1px solid #d6b888; border-left: 4px solid #b45309; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                <span style="font-weight: 800; color: #92400e; font-size: 13.5px;">Phase ${idx + 1}: ${p.epoch}</span>
                <span style="font-size: 11px; color: #6b4c2f; font-weight: 600;">${p.century}</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 700; color: #1c1008; margin-bottom: 6px;">${p.title}</div>
              <p style="font-size: 12px; line-height: 1.48; color: #3f2814; margin: 0 0 8px 0;">${p.focus}</p>
              <div style="background: #f9eccf; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; color: #78350f;">
                💡 <strong>Medien & Errungenschaft:</strong> ${p.techInnovation}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div style="padding: 12px 20px; background: #f2e1be; border-top: 1.5px solid #c99e63; text-align: right;">
          <button id="tl-ok-btn" style="background: #b45309; border: 1.5px solid #78350f; color: #fff; font-weight: 800; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 13px;">Schließen ✓</button>
        </div>
      </div>
    `;

    const close = () => {
      sound.playClick();
      this.close();
      if (onClose) onClose();
    };

    this.overlay.querySelector('#tl-close-btn')?.addEventListener('click', close);
    this.overlay.querySelector('#tl-ok-btn')?.addEventListener('click', close);
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }
}
