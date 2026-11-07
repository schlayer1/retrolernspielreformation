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
  public playerX = 22 * 16;
  public playerY = 24 * 16;
  public questCompleted = false;
  public gender: ReformationPlayerGender = 'male';
  public role: ReformationPlayerRole = 'drucker';
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
      this.checkLexiconUnlocks();
      this.notify();
    }
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
    const foodItems: ReformationItemId[] = ['brot_fladen'] as any;
    for (const item of foodItems) {
      if ((this.inventory[item] || 0) > 0) {
        this.removeItem(item, 1);
        this.piety = Math.min(100, this.piety + 10);
        this.notify();
        return `🍞 Du stärkst dich mit ${REFORMATION_ITEMS[item]?.name || item}! (+10 Frömmigkeit & Kraft)`;
      }
    }
    return '🍞 Kein Proviant im Beutel! Besorge dir Brote auf dem Wittenberger Markt.';
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
    const base = this.playerName.substring(0, 3).toUpperCase();
    const hash = Math.abs(
      (this.getEpochenPunkte() * 37 + this.discoveredRelics.size * 101) % 9000
    ) + 1000;
    return `REF-${base}-${hash}`;
  }

  public checkQuest(ch?: number): boolean {
    const c = ch ?? this.chapter;
    const objs = this.chapterObjectives[c];
    if (!objs) return false;
    return objs.every((o) => o === true);
  }

  public selectStartChapter(chId: number): void {
    this.chapter = Math.max(1, Math.min(8, chId));
    this.notify();
  }

  public loadFromHefterCode(code: string): boolean {
    if (!code || !code.startsWith('REF-')) return false;
    const parts = code.trim().split('-');
    if (parts.length < 3) return false;
    this.playerName = parts[1] || 'Lucas';
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
    this.playerX = data.playerX || 22 * 16;
    this.playerY = data.playerY || 24 * 16;
    this.quizPerfect = new Set(data.quizPerfect || []);
    this.gender = data.gender || 'male';
    this.role = data.role || 'drucker';
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
