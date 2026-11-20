import { REFORMATION_ITEMS, ReformationItemId, REFORMATION_RECIPES } from '../data/items';
import { REFORMATION_CHAPTERS, ChapterData } from '../data/chapters';
import { REFORMATION_LEXICON } from '../data/lexicon';
import { ReformationPlayerGender, ReformationPlayerRole, ReformationSaveData, SaveManager } from './SaveManager';

export interface ReformationRoleDefinition {
  id: ReformationPlayerRole;
  name: string;
  historicalTitle: string;
  description: string;
  bonusText: string;
  icon: string;
}

export const REFORMATION_ROLES: ReformationRoleDefinition[] = [
  {
    id: 'drucker',
    name: 'Druckergeselle & Schriftsetzer',
    historicalTitle: 'Meister der Lettern im Cranach-Hof',
    description: 'Du beherrschst den spiegelverkehrten Satz, mischst ölhaltige Schwärze und kennst die Mechanik der Druckerpresse.',
    bonusText: '+2 Bleilettern, Druckerschwärze & Papierbögen',
    icon: '/assets/icons/relic_silberdenar.png',
  },
  {
    id: 'kurier',
    name: 'Kurfürstlicher Botenreiter',
    historicalTitle: 'Eilmelder Friedrichs des Weisen',
    description: 'Auf schnellem Ross überbringst du vertrauliche Depeschen zwischen Wittenberg, Augsburg, Worms und der Wartburg.',
    bonusText: '+1 Geleitbrief, Brotfladen & Reitstiefel',
    icon: '/assets/icons/relic_lehnsurkunde.png',
  },
  {
    id: 'chronist',
    name: 'Kanzleischreiber & Humanist',
    historicalTitle: 'Gelehrter & Schüler Melanchthons',
    description: 'Du schreibst Latein und Deutsch, sicherst historische Originaldokumente und protokollierst die Disputationen.',
    bonusText: '+2 Pergament, Gänsekiel & Gallustinte',
    icon: '/assets/icons/relic_codex.png',
  },
];

type Listener = () => void;

export class GameState {
  public chapter = 1;
  public maxUnlockedChapter = 1;
  public completedChapters = new Set<number>();
  public inventory: Partial<Record<ReformationItemId, number>> = {};
  public craftedOnce = new Set<ReformationItemId>();
  public quizPerfect = new Set<number>();
  public discoveredRelics = new Set<string>();
  public lexiconRead = new Set<string>();
  public unlockedLexicon = new Set<string>();
  public playerX = 23 * 16;
  public playerY = 25 * 16;
  public questCompleted = false;
  public gender: ReformationPlayerGender = 'male';
  public role: ReformationPlayerRole = 'drucker';
  public roleBonusApplied = false;
  public playerName = 'Lucas';
  public malePreviewUrl = '';
  public femalePreviewUrl = '';
  public playTimeSeconds = 0;
  public walkedDistanceMeters = 0;
  public storyFlags: Record<string, boolean> = {};
  public dilemmaSummary = '';

  // Bildungs- & Charakterwerte (0..100)
  public knowledge = 35;
  public courage = 40;
  public piety = 50;
  public dayTime = 0.25; // 0..1 (Tag/Nacht Zyklus)

  // 4-Punkte-Kapitel-Gating
  public chapterObjectives: Record<number, boolean[]> = {
    1: [false, false, false, false],
    2: [false, false, false, false],
    3: [false, false, false, false],
    4: [false, false, false, false],
    5: [false, false, false, false],
    6: [false, false, false, false],
    7: [false, false, false, false],
    8: [false, false, false, false],
  };

  public compassText = '';
  public activeObjectiveText = '';

  private listeners: Listener[] = [];

  constructor() {
    this.initDefaultInventory();
    this.checkLexiconUnlocks();
  }

  public checkLexiconUnlocks(): string[] {
    const newlyUnlocked: string[] = [];
    for (const entry of REFORMATION_LEXICON) {
      if (!this.unlockedLexicon.has(entry.id)) {
        const canUnlock =
          entry.minChapter <= this.chapter ||
          (entry.unlockRelicId && this.discoveredRelics.has(entry.unlockRelicId)) ||
          (entry.unlockCraftId && this.craftedOnce.has(entry.unlockCraftId as any));
        if (canUnlock) {
          this.unlockedLexicon.add(entry.id);
          newlyUnlocked.push(entry.term);
        }
      }
    }
    return newlyUnlocked;
  }

  private initDefaultInventory(): void {
    this.inventory = {
      brot_fladen: 2,
      papierbogen: 3,
      holz: 2,
      bleilettern: 2,
    };
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public notify(): void {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch (e) {
        console.error('GameState listener error:', e);
      }
    }
    this.autoSave();
  }

  public getChapterData(ch?: number): ChapterData {
    const target = ch ?? this.chapter;
    return REFORMATION_CHAPTERS.find((c) => c.number === target) ?? REFORMATION_CHAPTERS[0];
  }

  public completeObjective(ch: number, index: number): void {
    if (!this.chapterObjectives[ch]) {
      this.chapterObjectives[ch] = [false, false, false, false];
    }
    if (!this.chapterObjectives[ch][index]) {
      this.chapterObjectives[ch][index] = true;
      this.knowledge = Math.min(100, this.knowledge + 8);
      this.courage = Math.min(100, this.courage + 5);

      // Prüfe, ob alle 4 Objectives erfüllt sind
      if (this.chapterObjectives[ch].every(Boolean)) {
        this.completedChapters.add(ch);
        if (ch < 8) {
          this.maxUnlockedChapter = Math.max(this.maxUnlockedChapter, ch + 1);
        }
      }
      const newlyUnlocked = this.checkLexiconUnlocks();
      if (newlyUnlocked.length > 0 && typeof window !== 'undefined' && (window as any).__showToast) {
        (window as any).__showToast(`📖 Neues Lexikonwissen: ${newlyUnlocked[0]}`);
      }
      this.notify();
    }
  }

  public applyRoleBonus(): void {
    if (this.roleBonusApplied) return;
    if (this.role === 'drucker') {
      this.inventory.bleilettern = (this.inventory.bleilettern ?? 0) + 2;
      this.inventory.druckerschwaerze = (this.inventory.druckerschwaerze ?? 0) + 2;
      this.inventory.papierbogen = (this.inventory.papierbogen ?? 0) + 2;
    } else if (this.role === 'kurier') {
      this.inventory.brot_fladen = (this.inventory.brot_fladen ?? 0) + 2;
      this.inventory.apfel = (this.inventory.apfel ?? 0) + 2;
      this.inventory.pergament = (this.inventory.pergament ?? 0) + 1;
      this.courage = Math.min(100, this.courage + 8);
    } else if (this.role === 'chronist') {
      this.inventory.pergament = (this.inventory.pergament ?? 0) + 2;
      this.inventory.tinte_feder = (this.inventory.tinte_feder ?? 0) + 2;
      this.inventory.flugschrift = (this.inventory.flugschrift ?? 0) + 1;
      this.knowledge = Math.min(100, this.knowledge + 8);
    }
    this.roleBonusApplied = true;
    this.notify();
  }

  public setChapter(ch: number): void {
    if (ch >= 1 && ch <= 8) {
      this.chapter = ch;
      if (!this.chapterObjectives[ch]) {
        this.chapterObjectives[ch] = [false, false, false, false];
      }
      this.checkLexiconUnlocks();
      this.notify();
    }
  }

  public addItem(id: ReformationItemId, count = 1): void {
    this.inventory[id] = (this.inventory[id] ?? 0) + count;
    this.notify();
  }

  public removeItem(id: ReformationItemId, count = 1): boolean {
    const current = this.inventory[id] ?? 0;
    if (current < count) return false;
    this.inventory[id] = current - count;
    if (this.inventory[id] === 0) {
      delete this.inventory[id];
    }
    this.notify();
    return true;
  }

  public hasItem(id: ReformationItemId, count = 1): boolean {
    return (this.inventory[id] ?? 0) >= count;
  }

  public craft(recipeId: string): boolean {
    const r = REFORMATION_RECIPES.find((rec) => rec.id === recipeId);
    if (!r) return false;
    for (const ing of r.ingredients) {
      if (!this.hasItem(ing.item, ing.count)) return false;
    }
    for (const ing of r.ingredients) {
      this.removeItem(ing.item, ing.count);
    }
    this.addItem(r.outputItem, r.outputCount);
    this.craftedOnce.add(r.outputItem);
    this.knowledge = Math.min(100, this.knowledge + 5);
    this.notify();
    return true;
  }

  public eat(): string {
    const foodItems: { id: ReformationItemId; boost: number; icon: string }[] = [
      { id: 'brot_fladen', boost: 10, icon: '🍞' },
      { id: 'apfel', boost: 8, icon: '🍎' },
      { id: 'bier_krug', boost: 12, icon: '🍺' },
    ];
    for (const f of foodItems) {
      if ((this.inventory[f.id] || 0) > 0) {
        this.removeItem(f.id, 1);
        this.piety = Math.min(100, this.piety + f.boost);
        this.courage = Math.min(100, this.courage + 5);
        this.notify();
        return `${f.icon} Du stärkst dich mit ${REFORMATION_ITEMS[f.id]?.name || f.id}! (+${f.boost} Frömmigkeit & +5 Mut)`;
      }
    }
    return '🍞 Kein Proviant im Beutel! Besorge Brote, Äpfel oder Klosterbier.';
  }

  public discoverRelic(id: string): void {
    if (!this.discoveredRelics.has(id)) {
      this.discoveredRelics.add(id);
      this.knowledge = Math.min(100, this.knowledge + 12);
      this.notify();
    }
  }

  public markLexiconRead(id: string): void {
    if (!this.lexiconRead.has(id)) {
      this.lexiconRead.add(id);
      this.knowledge = Math.min(100, this.knowledge + 3);
      this.notify();
    }
  }

  public getEpochenPunkte(): number {
    let pts = 0;
    pts += this.completedChapters.size * 150;
    pts += this.discoveredRelics.size * 80;
    pts += this.quizPerfect.size * 50;
    pts += this.craftedOnce.size * 30;
    pts += this.lexiconRead.size * 10;
    pts += Math.floor(this.knowledge * 2);
    return pts;
  }

  public getChronistenRang(): { title: string; tier: 'Bronze' | 'Silber' | 'Gold' | 'Meister'; color: string } {
    const pts = this.getEpochenPunkte();
    if (pts >= 1200) {
      return { title: 'Großer Chronist der Reformation', tier: 'Meister', color: '#fbbf24' };
    }
    if (pts >= 800) {
      return { title: 'Kanzleischreiber & Magister', tier: 'Gold', color: '#f59e0b' };
    }
    if (pts >= 450) {
      return { title: 'Werkstattgeselle Cranachs', tier: 'Silber', color: '#94a3b8' };
    }
    return { title: 'Druckerlehrling zu Wittenberg', tier: 'Bronze', color: '#b45309' };
  }

  public generateHefterCode(): string {
    const clean = (this.playerName || 'LUC')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .padEnd(3, 'X')
      .substring(0, 3);
    const chTag = `K0${this.chapter}`;
    const cc = String(this.completedChapters.size).padStart(2, '0');
    const rr = String(this.discoveredRelics.size).padStart(2, '0');
    const chk = ((this.chapter * 17 + this.completedChapters.size * 31 + this.discoveredRelics.size * 47 + this.knowledge) % 90) + 10;
    return `REF-${chTag}-${clean}-${cc}${rr}-${chk}`;
  }

  public checkQuest(ch?: number): boolean {
    const c = ch ?? this.chapter;
    const objs = this.chapterObjectives[c];
    if (!objs) return false;
    return objs.every((o) => o === true);
  }

  public selectStartChapter(chId: number): void {
    const ch = Math.max(1, Math.min(8, Math.round(chId) || 1));
    this.chapter = ch;
    this.maxUnlockedChapter = Math.max(this.maxUnlockedChapter, ch);
    const data = this.getChapterData(ch);
    this.playerX = data.spawn.x;
    this.playerY = data.spawn.y;
    this.checkLexiconUnlocks();
    this.notify();
  }

  public loadFromHefterCode(code: string): boolean {
    if (!code) return false;
    const trimmed = code.trim().toUpperCase();
    if (!trimmed.startsWith('REF-')) return false;
    const parts = trimmed.split('-');
    if (parts.length < 3) return false;

    if (parts[1].startsWith('K') && parts.length >= 4) {
      const parsedCh = parseInt(parts[1].slice(1), 10);
      const ch = Number.isFinite(parsedCh) ? Math.max(1, Math.min(8, parsedCh)) : 1;
      const namePart = parts[2] || 'LUC';
      this.playerName = namePart.charAt(0) + namePart.slice(1).toLowerCase();
      this.chapter = ch;
      this.maxUnlockedChapter = Math.max(this.maxUnlockedChapter, ch);
      for (let i = 1; i < ch; i++) {
        this.completedChapters.add(i);
        this.chapterObjectives[i] = [true, true, true, true];
      }
      const sp = this.getChapterData(ch).spawn;
      this.playerX = sp.x;
      this.playerY = sp.y;
    } else {
      const legacyName = parts[1] || 'Lucas';
      this.playerName = legacyName.charAt(0) + legacyName.slice(1).toLowerCase();
    }
    this.checkLexiconUnlocks();
    this.notify();
    return true;
  }

  public autoSave(): void {
    SaveManager.save({
      chapter: this.chapter,
      maxUnlockedChapter: this.maxUnlockedChapter,
      completedChapters: Array.from(this.completedChapters),
      inventory: this.inventory,
      craftedOnce: Array.from(this.craftedOnce),
      playerX: this.playerX,
      playerY: this.playerY,
      quizPerfect: Array.from(this.quizPerfect),
      gender: this.gender,
      role: this.role,
      roleBonusApplied: this.roleBonusApplied,
      chapterObjectives: this.chapterObjectives,
      discoveredRelics: Array.from(this.discoveredRelics),
      lexiconRead: Array.from(this.lexiconRead),
      unlockedLexicon: Array.from(this.unlockedLexicon),
      playerName: this.playerName,
      playTimeSeconds: this.playTimeSeconds,
      walkedDistanceMeters: this.walkedDistanceMeters,
      storyFlags: this.storyFlags,
      dilemmaSummary: this.dilemmaSummary,
      knowledge: this.knowledge,
      courage: this.courage,
      piety: this.piety,
    });
  }

  public load(): boolean {
    const data = SaveManager.load();
    if (!data) return false;
    this.chapter = data.chapter || 1;
    this.maxUnlockedChapter = data.maxUnlockedChapter || 1;
    this.completedChapters = new Set(data.completedChapters || []);
    this.inventory = data.inventory || {};
    this.craftedOnce = new Set(data.craftedOnce || []);
    this.playerX = data.playerX || 23 * 16;
    this.playerY = data.playerY || 25 * 16;
    this.quizPerfect = new Set(data.quizPerfect || []);
    this.gender = data.gender || 'male';
    this.role = data.role || 'drucker';
    this.roleBonusApplied = Boolean(data.roleBonusApplied);
    if (data.chapterObjectives) {
      for (const [k, v] of Object.entries(data.chapterObjectives)) {
        this.chapterObjectives[Number(k)] = v;
      }
    }
    this.discoveredRelics = new Set(data.discoveredRelics || []);
    this.lexiconRead = new Set(data.lexiconRead || []);
    this.unlockedLexicon = new Set(data.unlockedLexicon || []);
    this.playerName = data.playerName || 'Lucas';
    this.playTimeSeconds = data.playTimeSeconds || 0;
    this.walkedDistanceMeters = data.walkedDistanceMeters || 0;
    this.storyFlags = data.storyFlags || {};
    this.dilemmaSummary = data.dilemmaSummary || '';
    this.knowledge = data.knowledge ?? 35;
    this.courage = data.courage ?? 40;
    this.piety = data.piety ?? 50;
    this.checkLexiconUnlocks();
    return true;
  }
}

export const gameState = new GameState();
