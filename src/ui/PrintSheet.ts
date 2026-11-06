import { gameState } from '../systems/GameState';
import { REFORMATION_RELICS } from '../data/relics';
import { REFORMATION_LEXICON } from '../data/lexicon';

export class PrintSheet {
  private el: HTMLElement;

  constructor() {
    const existing = document.getElementById('hefter-print-sheet');
    if (existing) {
      this.el = existing;
    } else {
      this.el = document.createElement('div');
      this.el.id = 'hefter-print-sheet';
      document.body.appendChild(this.el);
    }
    this.injectStyles();
  }

  public print(): void {
    gameState.storyFlags['opened_certificate'] = true;
    gameState.notify();
    this.render();
    window.print();
  }

  private render(): void {
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE');
    const hefterCode = gameState.generateHefterCode();
    const rang = gameState.getChronistenRang();

    const discoveredRelicsList = REFORMATION_RELICS.filter((r) => gameState.discoveredRelics.has(r.id));
    const coreTerms = REFORMATION_LEXICON.filter((l) => ['ablasshandel', 'thesen_95', 'buchdruck', 'sola_scriptura', 'augsburger_religionsfrieden'].includes(l.id));

    this.el.innerHTML = `
      <div class="print-page">
        <!-- 1. Schulkopf -->
        <div class="print-header">
          <div class="header-left">
            <h1 class="school-name">Staatliche Regelschule Heimbürgeschule Kahla</h1>
            <h2 class="lesson-topic">Fach Geschichte • Klassenstufe 7/8 • Die Reformation (1517–1555)</h2>
          </div>
          <div class="header-right">
            <div class="meta-row"><strong>Name:</strong> ${gameState.playerName}</div>
            <div class="meta-row"><strong>Datum:</strong> ${dateStr}</div>
            <div class="meta-row"><strong>Hefter-Code:</strong> <span class="code-badge">${hefterCode}</span></div>
          </div>
        </div>

        <div class="print-divider"></div>

        <div class="print-title-banner">
          <h2>Arbeits- & Hefterblatt: Die Reformation – Glaube, Macht & die Medienrevolution</h2>
          <div class="rank-tag">Erreichter Rang: <strong>${rang.title} (${rang.tier}-Stufe)</strong> • ${gameState.getEpochenPunkte()} Epochenpunkte</div>
        </div>

        <!-- 2. Geborgene Relikte & Historische Quellen -->
        <div class="print-section">
          <h3 class="section-heading">1. Historische Primärquellen & Leitfunde</h3>
          <p class="section-desc">Folgende Schlüsseldokumente wurden im Spielverlauf geborgen, transkribiert und historisch eingeordnet:</p>
          <div class="relic-grid">
            ${
              discoveredRelicsList.length > 0
                ? discoveredRelicsList
                    .map(
                      (r) => `
                <div class="relic-item">
                  <div class="relic-title"><strong>${r.name}</strong> (${r.year}, ${r.location})</div>
                  <div class="relic-text">${r.historicalSignificance}</div>
                </div>
              `
                    )
                    .join('')
                : '<div class="empty-hint">Im Spielverlauf wurden noch keine Primärquellen geborgen. Erkunde die Schlosskirche, Cranachs Presse und die Wartburg!</div>'
            }
          </div>
        </div>

        <!-- 3. Die 4 Sola-Prinzipien -->
        <div class="print-section">
          <h3 class="section-heading">2. Das theologische Fundament: Die 4 „Sola“-Säulen</h3>
          <div class="sola-grid">
            <div class="sola-box">
              <strong>Sola Scriptura</strong>
              <span>Allein die Heilige Schrift (Bibel) gilt als Richtschnur des Glaubens, nicht Papstdekrete.</span>
            </div>
            <div class="sola-box">
              <strong>Sola Fide</strong>
              <span>Allein durch den persönlichen Glauben wird der Mensch vor Gott gerechtfertigt.</span>
            </div>
            <div class="sola-box">
              <strong>Sola Gratia</strong>
              <span>Allein durch Gottes unverdiente Gnade empfängt der Gläubige das Seelenheil.</span>
            </div>
            <div class="sola-box">
              <strong>Solus Christus</strong>
              <span>Allein Christus ist der Mittler zwischen Gott und den Menschen (Priestertum aller Gläubigen).</span>
            </div>
          </div>
        </div>

        <!-- 4. Glossar & Fachbegriffe -->
        <div class="print-section">
          <h3 class="section-heading">3. Historisches Kernlexikon</h3>
          <div class="lexicon-grid">
            ${coreTerms
              .map(
                (term) => `
              <div class="lex-item">
                <span class="lex-term"><strong>${term.term}:</strong></span>
                <span class="lex-def">${term.definition}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- 5. Zeitstrahl der Epoche -->
        <div class="print-section">
          <h3 class="section-heading">4. Chronologie der Reformation (1517–1555)</h3>
          <div class="timeline-row">
            <div class="t-node"><strong>1517</strong><br/>95 Thesen Wittenberg</div>
            <div class="t-arrow">➔</div>
            <div class="t-node"><strong>1518</strong><br/>Cajetan Augsburg</div>
            <div class="t-arrow">➔</div>
            <div class="t-node"><strong>1521</strong><br/>Reichstag Worms</div>
            <div class="t-arrow">➔</div>
            <div class="t-node"><strong>1522</strong><br/>Wartburg-Bibel</div>
            <div class="t-arrow">➔</div>
            <div class="t-node"><strong>1525</strong><br/>Bauernkrieg</div>
            <div class="t-arrow">➔</div>
            <div class="t-node"><strong>1555</strong><br/>Religionsfrieden</div>
          </div>
        </div>

        <!-- 6. Lehrer-Bewertung & Notizen -->
        <div class="print-footer-grid">
          <div class="notes-box">
            <span class="box-label">Didaktische Reflexion des Schülers / der Schülerin:</span>
            <div class="lines"></div>
            <div class="lines"></div>
            <div class="lines"></div>
          </div>
          <div class="sign-box">
            <div class="sign-field">Gesehen (Fachlehrer/in Geschichte):</div>
            <div class="sign-line">Datum, Unterschrift</div>
          </div>
        </div>
      </div>
    `;
  }

  private injectStyles(): void {
    if (document.getElementById('hefter-print-styles')) return;
    const style = document.createElement('style');
    style.id = 'hefter-print-styles';
    style.textContent = `
      #hefter-print-sheet {
        display: none;
      }

      @media print {
        body > *:not(#hefter-print-sheet) {
          display: none !important;
        }

        #hefter-print-sheet {
          display: block !important;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: 'Inter', -apple-system, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.4 !important;
          margin: 0 !important;
          padding: 10mm 15mm !important;
        }

        .print-page {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .school-name {
          font-size: 13pt;
          font-weight: 800;
          margin: 0;
          color: #111827;
        }

        .lesson-topic {
          font-size: 10pt;
          font-weight: 600;
          color: #4b5563;
          margin: 2px 0 0 0;
        }

        .header-right {
          font-size: 9.5pt;
          text-align: right;
        }

        .code-badge {
          font-family: monospace;
          font-weight: 700;
          background: #f3f4f6;
          padding: 2px 6px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .print-divider {
          height: 2px;
          background: #111827;
          margin: 8px 0 12px 0;
        }

        .print-title-banner {
          background: #f9fafb;
          border: 1.5px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .print-title-banner h2 {
          font-size: 11pt;
          font-weight: 700;
          margin: 0;
        }

        .rank-tag {
          font-size: 9.5pt;
          color: #374151;
        }

        .print-section {
          margin-bottom: 12px;
        }

        .section-heading {
          font-size: 10.5pt;
          font-weight: 800;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 3px;
          margin: 0 0 6px 0;
          color: #1f2937;
        }

        .section-desc {
          font-size: 9pt;
          color: #4b5563;
          margin: 0 0 6px 0;
        }

        .relic-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .relic-item {
          border-left: 3px solid #b45309;
          padding-left: 8px;
          font-size: 9pt;
        }

        .sola-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .sola-box {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 6px;
          font-size: 8.5pt;
          background: #fafafa;
        }

        .sola-box strong {
          display: block;
          color: #b45309;
          margin-bottom: 3px;
        }

        .lexicon-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          font-size: 8.5pt;
        }

        .timeline-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 8pt;
          text-align: center;
        }

        .t-node strong {
          color: #b45309;
        }

        .print-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-top: 14px;
        }

        .notes-box {
          border: 1px dashed #9ca3af;
          border-radius: 6px;
          padding: 8px;
          height: 65px;
        }

        .box-label {
          font-size: 8.5pt;
          font-weight: 700;
          color: #4b5563;
        }

        .lines {
          border-bottom: 1px solid #e5e7eb;
          height: 16px;
        }

        .sign-box {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sign-field {
          font-size: 8.5pt;
          font-weight: 700;
        }

        .sign-line {
          font-size: 8pt;
          color: #9ca3af;
          border-top: 1px solid #4b5563;
          padding-top: 4px;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
