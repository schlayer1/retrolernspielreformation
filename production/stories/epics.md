# CCGS Epics: Die Reformation (1517–1555)

## Übersicht der Entwicklungs-Epen

### 🏰 EPIC-01: Engine-Fundament & Dual-Layer-Architektur
* **Story 1.1:** Initialisierung von Vite, TypeScript und Phaser 3.80+ mit PixelArt-Pipeline (`pixelArt: true`, Nearest Neighbor).
* **Story 1.2:** Retina HTML5/CSS3 DOM-Overlay (`#ui-layer`) mit barrierefreier Typografie und responsiven Media Queries.
* **Story 1.3:** Single-Proximity DOM-Interaktionslabel (`< 44px` Erkennung, flüssige 250ms CSS-Animation, maximal 1 aktives Badge).
* **Story 1.4:** Eingabesteuerung (Tastatur `WASD`/Pfeile/`E`/`I`/`ESC` + Touch D-Pad für iPad & Mobile).
* **Story 1.5:** Dual-Audio Engine (Synthesizer Choral/Orgel/Laute WebAudio + 4-Surface Footstep-Sounds).

### 📜 EPIC-02: Die 5 didaktischen Mitmach- & Interaktions-Stationen
* **Story 2.1:** *Die Druckerpresse* (Kapitel 2): Lettern spiegelverkehrt setzen, Schwärze walzen, Spindelzug, Flugschriften-Erfolg.
* **Story 2.2:** *Die Wartburg-Schreibstube* (Kapitel 5): Luther-Sprachlabor („Dem Volk aufs Maul schauen“ – Wort-Puzzle).
* **Story 2.3:** *Die Tetzel-Ablasskasse* (Kapitel 1): Kassenbuch, Gulden-/Groschen-Vergleich, didaktische Entlarvung.
* **Story 2.4:** *Der 360°-Quelleninspektor*: Lupe, Hotspots und Verstehensfragen für 5 historische Primärdokumente.
* **Story 2.5:** *Das 1-Klick A4-Hefterblatt (`PrintSheet`)*: Schulgerechtes, tintensparendes Druckdokument (Zusammenfassung, Zeitstrahl, Urkunde).

### 🏛️ EPIC-03: Kapitel 1 bis 8 (Storyline, Quests & Schauplätze)
* **Story 3.1:** *Kapitel 1 (Wittenberg 1517)*: Tetzel auf dem Markt, Luthers 95 Thesen an der Schlosskirche.
* **Story 3.2:** *Kapitel 2 (Cranach-Werkstatt 1518)*: Die Medienrevolution – Holzschnitt und Druck.
* **Story 3.3:** *Kapitel 3 (Augsburg 1518)*: Verhör vor Kardinal Cajetan, diplomatische Flucht bei Nacht.
* **Story 3.4:** *Kapitel 4 (Worms 1521)*: Reichstag vor Kaiser Karl V., Standhaftigkeit und Wormser Edikt.
* **Story 3.5:** *Kapitel 5 (Wartburg 1521/22)*: Junker Jörg, Entführung und deutsche Bibelübersetzung.
* **Story 3.6:** *Kapitel 6 (Wittenberg 1522–1525)*: Katharina von Bora, Schwarzes Kloster und evangelisches Pfarrhaus.
* **Story 3.7:** *Kapitel 7 (Bauernkrieg 1525)*: Zwölf Artikel, Thomas Müntzer, friedenspädagogische Aufarbeitung.
* **Story 3.8:** *Kapitel 8 (Augsburg 1530/1555)*: Confessio Augustana, Religionsfrieden („Cuius regio, eius religio“) & Chronisten-Diplom.

### 🧪 EPIC-04: QA, Headless-Browser-Verifikation & Epochenhub-Integration
* **Story 4.1:** Automatisierter Layout-Overlap-Checker (`scripts/check_layout_overlaps.cjs`).
* **Story 4.2:** Headless-Browser-Verifikation (`scripts/verify_in_browser.cjs`) mit 10 Pflicht-Screenshots in `production/qa/evidence/`.
* **Story 4.3:** Finale Epochenhub-Integration und Vercel-Deployment.
