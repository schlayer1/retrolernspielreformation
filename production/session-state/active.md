# CCGS Active Session State: Die Reformation (1517–1555)

**Projekt:** Die Reformation: Glaube, Macht & die Medienrevolution  
**Framework:** Claude Code Game Studio (Donchitos CCGS)  
**Standard:** `snes-history-game` (16-Bit Phaser 3 + Retina DOM)  
**Aktuelle Phase:** Phase 7 — Release & Epochenhub-Integration (Vollständig abgeschlossen)  
**Letztes Update:** 2026-11-07  

---

## 🧭 Studio-Status & Phasen-Tracking

| Phase | Name | Status | Gate-Check Kriterien |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Concept (`/start`, `/brainstorm`)** | 🟢 **DONE** | High-Concept Brief, Protagonist Lucas, 8 Kapitel abgestimmt |
| **Phase 2** | **Systems Design (`/design-system`)** | 🟢 **DONE** | GDDs, 5 Relikte, 5 Stationen, 24 Lexikon-Begriffe, Rezepte |
| **Phase 3** | **Technical Setup (`/setup-engine`)** | 🟢 **DONE** | Vite + Phaser 3 + TS Boilerplate, Layout-Checker 0 Overlaps, Build Passed |
| **Phase 4** | **Pre-Production (`/prototype`)** | 🟢 **DONE** | Headless Browser Verifikation, 10 Screenshots |
| **Phase 5** | **Production (`/dev-story`)** | 🟢 **DONE** | Vollständige Kapitel-, Quest- und interaktive Stationslogik |
| **Phase 6** | **Polish & QA (`/qa-plan`, Puppeteer)**| 🟢 **DONE** | Evidenzprüfung & QA-Audit (10 Pflicht-Screenshots) |
| **Phase 7** | **Release & Epochenhub-Integration** | 🟢 **DONE** | Git-Push auf `main`, Einhängung in `games.config.ts`, Cover/Avatar-Sync |

---

## 🎯 Beschlossene Leitplanken (User-Decisions)

1. **Protagonist:** **Lucas**, junger Gehilfe und Geselle in der Wittenberger Werkstatt von Lucas Cranach d. Ä. Dient als flexibler Chronist, Botenreiter für Kurfürst Friedrich und Vertrauter Luthers.
2. **Epochenumfang:** 8 historische Großkapitel (1517 bis 1555) – vom Thesenanschlag über Worms und Wartburg bis zum Augsburger Religionsfrieden.
3. **Asset-Versorgung:** Direkte Anbindung an die lokale `assets_library` aus `Epochenhub Retro Games` sowie Interaktion mit dem laufenden `Retro Asset Studio` (kein MCP erforderlich, direkter Dateizugriff und Cache-Querying).
4. **Epochenhub-Integration:** Erstes Flaggschiff-Spiel der Epochenkategorie **Neuzeit & Moderne** im Epochenhub Kahla.

---

## 📋 Verifizierte Repositorien & Deployment-Zustand
- **Game Repository:** [`schlayer1/retrolernspielreformation`](https://github.com/schlayer1/retrolernspielreformation.git) (Branch `main`, Build: ✅ Pass)
- **Epochenhub Repository:** [`schlayer1/epochenhub`](https://github.com/schlayer1/epochenhub.git) (Branch `main`, Build: ✅ Pass)
- **QA-Screenshots:** 10/10 Pflicht-Screenshots in `production/qa/evidence/` und Artifact-Ordner.
