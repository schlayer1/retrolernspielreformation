import { CHAPTERS } from '../data/chapters';

const TRACK_URL_MAP: Record<string, string> = {
  start: '/assets/audio/bgm/bgm_heart.mp3',
  ref_k01_thesen: '/assets/audio/bgm/bgm_warmth.mp3',
  ref_k02_buchdruck: '/assets/audio/bgm/bgm_patterns.mp3',
  ref_k03_bannbulle: '/assets/audio/bgm/bgm_oracle.mp3',
  ref_k04_worms: '/assets/audio/bgm/bgm_desert_epic.mp3',
  ref_k05_wartburg: '/assets/audio/bgm/bgm_mist.mp3',
  ref_k06_bildersturm: '/assets/audio/bgm/bgm_warmth.mp3',
  ref_k07_bauernkrieg: '/assets/audio/bgm/bgm_desert_battle.mp3',
  ref_k08_religionsfrieden: '/assets/audio/bgm/bgm_heart.mp3',
};

export class MusicManager {
  private static instance: MusicManager;
  private currentTrackId: string | null = null;
  private currentTitle = 'Reformations-Choral';
  private audioEl: HTMLAudioElement | null = null;
  private mutedState = false;
  private volume = 0.42;
  private synthCtx: AudioContext | null = null;
  private synthInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public playStartTheme(): void {
    this.currentTitle = 'Titelmelodie · Reformation 1517';
    this.playChapterMusic('start');
  }

  public playChapterTrack(trackOrChapter: string | number | any): void {
    this.playChapterMusic(trackOrChapter);
  }

  public playChapterMusic(trackOrChapter: string | number | any): void {
    let trackId = 'ref_k01_thesen';
    if (typeof trackOrChapter === 'number') {
      const ch = CHAPTERS.find((c) => c.number === trackOrChapter || c.id === trackOrChapter);
      if (ch?.music?.trackId) trackId = ch.music.trackId;
      if (ch?.music?.title) this.currentTitle = ch.music.title;
    } else if (typeof trackOrChapter === 'string') {
      trackId = trackOrChapter;
      const ch = CHAPTERS.find((c) => c.music?.trackId === trackOrChapter);
      if (ch?.music?.title) this.currentTitle = ch.music.title;
    } else if (trackOrChapter && typeof trackOrChapter === 'object' && trackOrChapter.id) {
      const ch = CHAPTERS.find((c) => c.id === trackOrChapter.id);
      if (ch?.music?.trackId) trackId = ch.music.trackId;
      if (ch?.music?.title) this.currentTitle = ch.music.title;
    }

    if (this.currentTrackId === trackId && (this.audioEl || this.synthInterval)) {
      return;
    }

    this.stopCurrent();
    this.currentTrackId = trackId;

    if (this.mutedState) return;

    const mp3Path = TRACK_URL_MAP[trackId] || '/assets/audio/bgm/bgm_warmth.mp3';
    const audio = new Audio(mp3Path);
    audio.loop = true;
    audio.volume = this.volume;

    audio
      .play()
      .then(() => {
        if (this.currentTrackId === trackId && !this.mutedState) {
          this.audioEl = audio;
        } else {
          audio.pause();
        }
      })
      .catch(() => {
        // Fallback WebAudio Synthesizer wenn Autoplay noch gesperrt oder pausiert
        this.startFallbackChiptune();
      });
  }

  private startFallbackChiptune(): void {
    if (this.mutedState || this.synthInterval) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.synthCtx) {
        this.synthCtx = new AudioCtx();
      }
      if (this.synthCtx.state === 'suspended') {
        this.synthCtx.resume().catch(() => {});
      }

      const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      let noteIdx = 0;

      this.synthInterval = setInterval(() => {
        if (!this.synthCtx || this.mutedState || this.synthCtx.state !== 'running') return;
        const now = this.synthCtx.currentTime;
        const osc = this.synthCtx.createOscillator();
        const gain = this.synthCtx.createGain();
        osc.type = 'triangle';
        const freq = scale[noteIdx % scale.length];
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.035 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(gain);
        gain.connect(this.synthCtx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
        noteIdx = (noteIdx + 1) % scale.length;
      }, 460);
    } catch {
      // Autoplay blocked until user interaction
    }
  }

  public stopCurrent(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
      this.audioEl = null;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.currentTrackId = null;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.mutedState = !this.mutedState;
    if (this.mutedState) {
      if (this.audioEl) this.audioEl.pause();
      if (this.synthInterval) {
        clearInterval(this.synthInterval);
        this.synthInterval = null;
      }
    } else if (this.currentTrackId) {
      const trk = this.currentTrackId;
      this.currentTrackId = null;
      this.playChapterMusic(trk);
    }
    return this.mutedState;
  }

  public setMuted(muted: boolean): void {
    if (this.mutedState === muted) return;
    this.toggleMute();
  }

  public isMuted(): boolean {
    return this.mutedState;
  }

  public get muted(): boolean {
    return this.mutedState;
  }

  public getCurrentTitle(): string {
    return this.currentTitle;
  }
}

export const musicManager = MusicManager.getInstance();
