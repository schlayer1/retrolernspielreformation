# CCGS Active Session State: Die Reformation (1517–1555)

**Projekt:** Die Reformation: Glaube, Macht & die Medienrevolution  
**Framework:** Claude Code Game Studio (Donchitos CCGS)  
**Standard:** `snes-history-game` (16-Bit Phaser 3 + Retina DOM)  
**Aktuelle Phase:** Phase 1 — Concept & Systems Design  
**Letztes Update:** 2026-11-06  

---

## 🧭 Studio-Status & Phasen-Tracking

| Phase | Name | Status | Gate-Check Kriterien |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Concept (`/start`, `/brainstorm`)** | 🟢 **DONE** | High-Concept Brief, Protagonist Lucas, 8 Kapitel abgestimmt |
| **Phase 2** | **Systems Design (`/design-system`)** | 🟢 **DONE** | GDDs, 5 Relikte, 5 Stationen, 24 Lexikon-Begriffe, Rezepte |
| **Phase 3** | **Technical Setup (`/setup-engine`)** | 🟢 **DONE** | Vite + Phaser 3 + TS Boilerplate, Layout-Checker 0 Overlaps, Build Passed |
| **Phase 4** | **Pre-Production (`/prototype`)** | 🟡 **IN VERIFICATION** | Headless Browser Verifikation, 8 Screenshots |
| **Phase 5** | **Production (`/dev-story`)** | ⚪ BEREIT | Vollständige Kapitel- und Questlogik aktiv |
| **Phase 6** | **Polish & QA (`/qa-plan`, Puppeteer)**| ⚪ BEREIT | Evidenzprüfung & QA-Audit |
| **Phase 7** | **Release & Epochenhub-Integration** | ⚪ GEPLANT | Git-Push, Build, Verknüpfung im Epochenhub |

---

## 🎯 Beschlossene Leitplanken (User-Decisions)

1. **Protagonist:** **Lucas**, junger Gehilfe und Geselle in der Wittenberger Werkstatt von Lucas Cranach d. Ä. Dient als flexibler Chronist, Botenreiter für Kurfürst Friedrich und Vertrauter Luthers.
2. **Epochenumfang:** 8 historische Großkapitel (1517 bis 1555) – vom Thesenanschlag über Worms und Wartburg bis zum Augsburger Religionsfrieden.
3. **Asset-Versorgung:** Direkte Anbindung an die lokale `assets_library` aus `Epochenhub Retro Games` sowie Interaktion mit dem laufenden `Retro Asset Studio` (kein MCP erforderlich, direkter Dateizugriff und Cache-Querying).

---

## 📋 Nächste Schritte
1. Abnahme des High-Concept GDD (`design/gdd/gdd_reformation_high_concept.md`)
2. Abnahme der Mechanik-Spezifikation (`design/gdd/gdd_mechanics_and_stations.md`)
3. Übergang zu Phase 2 & 3: Anlegen der Codebasis (`package.json`, Vite, Phaser 3)
