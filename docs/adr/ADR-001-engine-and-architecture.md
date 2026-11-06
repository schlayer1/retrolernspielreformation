# ADR-001: Dual-Layer Engine & Asset-Pipeline Architektur

## Status
**Akzeptiert** (Phase 1 — Concept & Systems Design)

## Datum
2026-11-06

## Kontext
Für das Geschichtslernspiel „Die Reformation (1517–1555)“ wird eine Architektur benötigt, die:
1. Den nostalgischen Charme eines 16-Bit SNES-Klassikers (Secret of Mana / Chrono Trigger) erzeugt.
2. Auf modernen hochauflösenden Displays (4K/5K Retina iMacs, MacBooks, iPads, Smartboards) absolut gestochen scharfen, lesbaren und barrierefreien Text liefert.
3. Den didaktischen Richtlinien des `snes-history-game` Standards und dem Agilen Workflow des `claude-code-game-studio` (CCGS) entspricht.
4. Nahtlos auf die über 185.000 Assets der lokalen `assets_library` und die Metadaten des `Retro Asset Studio` zugreifen kann.

## Entscheidung

### 1. Dual-Layer-Prinzip (Canvas + DOM)
* **Layer 1 (Canvas):** Phaser 3 (WebGL mit Canvas-Fallback). Auflösung 640×360 px, gestreckt auf den Viewport per `Phaser.Scale.FIT`, `pixelArt: true` (Nearest Neighbor Interpolation). Zuständig für Charaktere, Tilesets, Partikel, Wetter und Licht.
* **Layer 2 (DOM):** Nativer `#ui-layer` in HTML5/CSS3 mit absoluter Positionierung über dem Canvas. Zuständig für Dialogboxen, 64x64 SNES-Porträts, Quelleninspektor, Menüs, Minispiele und A4-Druckansicht.

### 2. Asset-Sourcing & Pipeline
* Die Roh-Assets stammen direkt aus dem lokalen Verzeichnis `/Users/nicolekeller/Desktop/Antigravity Projekte/Epochenhub Retro Games/assets_library`.
* Es ist **kein MCP-Server notwendig**, da Antigravity über direkte Dateisystem- und Shell-Zugriffsrechte verfügt und auf die Indizes (`asset_cache.json` in Retro Asset Studio) zugreifen kann.
* Ausgewählte Sets werden in optimierten Formaten nach `public/assets/` des Zielprojekts übertragen.
* Zusätzliche Wunsch-Assets des Nutzers können via Retro Asset Studio über den **Asset-Korb** („📋 Prompt für KI kopieren“ oder „🚀 In Zielspiel kopieren“) nahtlos integriert werden.

### 3. Friedens- und Handlungspädagogik
* Das Spiel implementiert keine Kampf- oder Waffenmechaniken.
* Interaktionen basieren auf Dialogen, Spurensicherung, Quellenarbeit, Worträtseln, handwerklichen Minispielen und logistischen Aufgaben.

### 4. QA & Test-Automatisierung
* `puppeteer-core` wird für automatisierte Headless-Browser-Tests und visuelle Verifikations-Screenshots in `production/qa/evidence/` eingesetzt.
* `scripts/check_layout_overlaps.cjs` verhindert Textüberlappungen und Barrierefreiheitsprobleme vor jedem Build.

## Konsequenzen
* **Positiv:** Vollständige Kontrolle über Rendering und Typografie; keine verwaschenen Schriften; extreme Performance (stabile 60 FPS auch auf älteren Schul-Tablets).
* **Positiv:** Nahtlose Kompatibilität mit dem bestehenden Epochenhub und automatische Deployment-Fähigkeit auf Vercel.
* **Neutral:** Strikte Disziplin bei der Trennung von Spielwelt-Koordinaten (Phaser) und Bildschirm-Koordinaten (DOM-Overlay).
