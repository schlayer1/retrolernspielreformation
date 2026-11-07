import { ReformationItemId } from '../data/items';

export type ReformationPlayerRole = 'drucker' | 'kurier' | 'chronist';
export type ReformationPlayerGender = 'male' | 'female';

export interface ReformationSaveData {
  chapter: number;
  maxUnlockedChapter: number;
  completedChapters: number[];
  inventory: Partial<Record<ReformationItemId, number>>;
  craftedOnce: ReformationItemId[];
  playerX: number;
  playerY: number;
  quizPerfect: number[];
  gender: ReformationPlayerGender;
  role: ReformationPlayerRole;
  discoveredRelics: string[];
  lexiconRead: string[];
  unlockedLexicon?: string[];
  playerName: string;
  playTimeSeconds: number;
  walkedDistanceMeters?: number;
  storyFlags?: Record<string, boolean>;
  dilemmaSummary?: string;
  knowledge?: number;
  courage?: number;
  piety?: number;
}

const STORAGE_KEY = 'retro_save_reformation_1517';

export class SaveManager {
  static save(data: ReformationSaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }

  static load(): ReformationSaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ReformationSaveData;
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
