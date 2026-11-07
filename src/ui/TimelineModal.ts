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
      title: 'Militärische Glaubenskriege, Reichsgesetze & völkerrechtliche Anerkennung',
      focus: 'Schmalkaldischer Krieg zwischen Kaiser und evangelischen Fürsten; Augsburger Religionsfrieden 1555 mit dem Grundsatz „Cuius regio, eius religio“ und dem Ius emigrandi.',
      techInnovation: 'Reichsweite Notariatsakten, doppelte Kanzleiführung katholischer und evangelischer Territorien, Schulordnungen für Knaben und Mädchen.',
    },
  ];

  public open(onClose?: () => void): void {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'timeline-modal';
      this.overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(14, 10, 8, 0.88);
        backdrop-filter: blur(5px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    sound.playClick();
    this.overlay.style.display = 'flex';

    this.overlay.innerHTML = `
      <div style="background: linear-gradient(145deg, #24160e, #140d08); border: 2px solid #b45309; border-radius: 12px; max-width: 680px; width: 100%; color: #fef3c7; box-shadow: 0 20px 50px rgba(0,0,0,0.85); overflow: hidden;">
        <div style="background: rgba(180, 83, 9, 0.2); padding: 14px 20px; border-bottom: 1px solid rgba(180, 83, 9, 0.4); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: bold;">⏳ Epochen-Zeitstrahl (Taste Z)</div>
            <div style="font-size: 16px; font-weight: bold; color: #fff;">Die Reformation im Heiligen Römischen Reich (1517–1555)</div>
          </div>
          <button id="tl-close-btn" style="background: transparent; border: none; color: #fbbf24; font-size: 22px; cursor: pointer; padding: 0 6px;">✕</button>
        </div>

        <div style="padding: 18px; max-height: 72vh; overflow-y: auto;">
          ${this.phases
            .map(
              (p, idx) => `
            <div style="background: rgba(0,0,0,0.35); border-left: 4px solid #b45309; border-radius: 6px; padding: 12px 14px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #fbbf24; font-size: 13.5px;">Phase ${idx + 1}: ${p.epoch}</span>
                <span style="font-size: 11px; color: #cbd5e1;">${p.century}</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 600; color: #fef3c7; margin-bottom: 6px;">${p.title}</div>
              <p style="font-size: 12px; line-height: 1.45; color: #e2e8f0; margin-bottom: 8px;">${p.focus}</p>
              <div style="background: rgba(180, 83, 9, 0.15); border-radius: 4px; padding: 6px 10px; font-size: 11.5px; color: #fde68a;">
                💡 <strong>Medien & Errungenschaft:</strong> ${p.techInnovation}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div style="padding: 12px 20px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(180, 83, 9, 0.3); text-align: right;">
          <button id="tl-ok-btn" style="background: #b45309; border: 1px solid #d97706; color: #fff; font-weight: bold; padding: 7px 18px; border-radius: 6px; cursor: pointer;">Verstanden</button>
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
