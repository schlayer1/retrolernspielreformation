# Game Design Document: Spielmechaniken & Didaktische Stationen
## Die Reformation: Glaube, Macht & die Medienrevolution (1517–1555)

---

### 1. Dual-Layer-Engine & Steuerung
* **Phaser 3 Canvas:** 640×360 Basisauflösung mit Nearest-Neighbor-Skalierung für authentisches 16-Bit SNES-Gefühl (2x Pixel Zoom, A2-Boden-Engine, Bayer-Dithering, Partikeleffekte für Kaminfeuer/Rauch, Flora-Wind).
* **HTML5/CSS3 Retina DOM-Overlay (`#ui-layer`):** Gestochen scharfe Vektor-Typografie für Dialoge, Zitate, Quelltexte und Menüs – garantiert 100% Barrierefreiheit und Lesbarkeit auf 4K-iMacs, MacBooks, iPads und Smartboards.
* **Single-Proximity DOM-Labels:** Interaktive Objekte und NPCs zeigen ein elegantes, animiertes Badge (`[E] Sprechen` oder `[E] Untersuchen`), sobald der Spieler näher als 44 Pixel herantritt. Es ist zu jedem Zeitpunkt maximal EIN Label aktiv.
* **Eingabesystem:**
  * Tastatur: `WASD` / Pfeiltasten zum Bewegen, `E` / Leertaste zur Interaktion, `I` für Chronik-Tasche, `M` für Karte, `ESC` für Pause-Dashboard.
  * Mobile & Tablet: Virtuelles D-Pad und Touch-Aktionsbuttons (voll responsiv für iPads und Handys < 450px).

---

### 2. Die 5 didaktischen Mitmach- & Interaktions-Stationen

#### Station 1: Die Cranach-Druckerpresse (Kapitel 2)
* **Spielmechanik:** Minispiel in der Werkstatt.
  1. **Lettern setzen:** Der Spieler wählt aus einem Setzkasten Bleilettern aus und muss sie im Winkelhaken *spiegelverkehrt* anordnen (z. B. den Titel der Flugschrift: *„Von der Freiheit eines Christenmenschen“*).
  2. **Einfärben:** Mit Lederballen wird Druckerschwärze gleichmäßig aufgetragen (Timing-Balken).
  3. **Pressen:** Die Holzspindel wird über einen Drehbeschleuniger heruntergeschraubt.
  4. **Ergebnis:** Das fertige Flugblatt wird begutachtet. Bei fehlerfreiem Satz schaltet Lucas 30 zusätzliche Exemplare für die Stadtboten frei.

#### Station 2: Die Wartburg-Schreibstube („Dem Volk aufs Maul schauen“) (Kapitel 5)
* **Spielmechanik:** Historisches Sprachlabor und Worträtsel.
  * Martin Luther sitzt an seinem Pult und hadert mit der griechischen Vorlage (Erasmus von Rotterdam).
  * Drei Textstellen müssen vollendet werden. Zu jedem veralteten oder steifen lateinischen Begriff stehen drei deutsche Formulierungen zur Auswahl:
    * Beispiel: Wie übersetzen wir *„ex abundantia cordis os loquitur“*?
      * A: „Aus der Überfülle des Herzkammer-Gewebes redet der Mund.“
      * B: **„Wes das Herz voll ist, des geht der Mund über.“** (Richtig!)
      * C: „Wer viel fühlt, spricht viele Laute.“
  * Schüler lernen spielerisch, wie viele Alltagsredewendungen (z. B. *„ein Buch mit sieben Siegeln“*, *„Perlen vor die Säue werfen“*, *„sein Licht unter den Scheffel stellen“*) von Martin Luther erfunden wurden.

#### Station 3: Die Tetzel-Ablasskasse (Kapitel 1)
* **Spielmechanik:** Analytisches Rechnen & Quellenkritik.
  * Vor den Toren Wittenbergs baut Johann Tetzel seinen Eisenkasten und das rote Kreuz auf.
  * Lucas inspiziert die Preisliste des Erzbischofs: Wie viele Gulden und Groschen verlangt Tetzel für welche Sünden (Diebstahl, Meineid, Verleumdung)?
  * **Vergleichsaufgabe:** Wie viele Monate muss ein einfacher Tagelöhner oder Bauer arbeiten, um einen Ablassbrief für seine verstorbene Mutter zu finanzieren?
  * Entlarvung des Finanzsystems: Schüler erkennen die Verflechtung zwischen Petersdom-Neubau in Rom und den Schulden des Hauses Hohenzollern bei den Fuggern.

#### Station 4: Der 360°-Quelleninspektor (Kapitel 1–8)
* **Didaktische Funktion:** Historische Primärquellen im Großformat untersuchen.
  * Schüler können Dokumente mit einer Lupe abfahren, Siegel drehen und Transkriptionen einblenden:
    * **Quelle 1:** Originaldruck der 95 Thesen (Nürnberg, 1517).
    * **Quelle 2:** Holzschnitt von Lucas Cranach: *Himmelreich vs. Papstkirche* (visuelle Propaganda der Reformationszeit).
    * **Quelle 3:** Das Wormser Edikt mit kaiserlichem Siegel von Karl V.
    * **Quelle 4:** Die Zwölf Artikel der Bauernschaft (Memmingen, 1525).
    * **Quelle 5:** Der Augsburger Religionsfriede (Reichsabschied von 1555).
  * Jede Quelle besitzt 3 anklickbare „Hotspots“, die didaktische Erklärungen und Fragen für das Hefterblatt freischalten.

#### Station 5: Das 1-Klick A4-Schulhefterblatt (`PrintSheet`)
* **Features:**
  * Erreichbar über das Menü oder nach Abschluss von Kapitel 8.
  * **Tintensparend & sauber formatiert:** Schwarzer Text auf weißem Grund (`#ffffff`), Vektor-Grafiken, keine dunklen Spiel-Hintergründe.
  * Enthält:
    * Vor- und Nachname des Schülers / der Schülerin, Klasse und Datum.
    * Kompakter Zeitstrahl (1517 bis 1555).
    * Die 4 "Sola"-Prinzipien der Reformation (*Sola Fide, Sola Gratia, Sola Scriptura, Solus Christus*).
    * Ausgefüllte Lösungen der Schreibstube und Druckerei.
    * Chronisten-Rang (Bronze / Silber / Gold / Meister-Chronist).
    * QR-Code zum Nachspielen und Teilen.

---

### 3. Audiokonzept & Living-World Atmosphäre
* **WebAudio Chiptune & Sakral-Synthese:**
  * Stimmungsvolle Lauten- und Gambenklänge für die Städte.
  * Feierliche Orgel- und Choralharmonisierungen für Kirchen und Klöster (z. B. prozedural angelehnt an *„Ein feste Burg ist unser Gott“* und Gregorianik).
  * Wind, Krähengekrächze und Regen auf der Wartburg.
* **4-Surface Footsteps:**
  * Steinpflaster (Wittenberger Markt / Worms)
  * Holzdielen (Druckerwerkstatt / Wartburgstube)
  * Waldboden & Schotter (Thüringer Wald / Umland)
  * Matsch & Stroh (Bauernhof / Heerlager)
