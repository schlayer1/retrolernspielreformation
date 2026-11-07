import { CHAPTERS } from '../data/chapters';

export class MusicManager {
  private static instance: MusicManager;
  private currentTrackId: string | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.45;
  private synthCtx: AudioContext | null = null;
  private synthInterval: any = null;

  private constructor() {
    // Singleton
  }

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public playChapterTrack(trackOrChapter: string | number | any): void {
    this.playChapterMusic(trackOrChapter);
  }

  public playChapterMusic(trackOrChapter: string | number | any): void {
    let trackId = 'ref_k01_thesen';
    if (typeof trackOrChapter === 'number') {
      const ch = CHAPTERS.find((c) => c.id === trackOrChapter);
      if (ch?.music?.trackId) trackId = ch.music.trackId;
    } else if (typeof trackOrChapter === 'string') {
      trackId = trackOrChapter;
    } else if (trackOrChapter && typeof trackOrChapter === 'object' && trackOrChapter.id) {
      const ch = CHAPTERS.find((c) => c.id === trackOrChapter.id);
      if (ch?.music?.trackId) trackId = ch.music.trackId;
    }

    if (this.currentTrackId === trackId && (this.audioEl || this.synthInterval)) {
      return;
    }

    this.stopCurrent();
    this.currentTrackId = trackId;

    if (this.isMuted) return;

    const mp3Path = `/assets/audio/${trackId}.mp3`;
    const audio = new Audio(mp3Path);
    audio.loop = true;
    audio.volume = this.volume;

    audio
      .play()
      .then(() => {
        this.audioEl = audio;
      })
      .catch(() => {
        // Fallback to 16-bit WebAudio synthesizer
        this.startFallbackChiptune(trackId);
      });
  }

  private startFallbackChiptune(trackId: string): void {
    if (this.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.synthCtx) {
        this.synthCtx = new AudioCtx();
      }
      if (this.synthCtx.state === 'suspended') {
        this.synthCtx.resume();
      }

      // Renaissance chords & melodies in Dorisch / Dur
      const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      let noteIdx = 0;

      this.synthInterval = setInterval(() => {
        if (!this.synthCtx || this.isMuted) return;
        const now = this.synthCtx.currentTime;

        // Lead melody
        const osc = this.synthCtx.createOscillator();
        const gain = this.synthCtx.createGain();
        osc.type = 'triangle';
        const freq = scale[noteIdx % scale.length];
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.045 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(this.synthCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);

        // Gentle sub-bass lute note
        if (noteIdx % 2 === 0) {
          const bass = this.synthCtx.createOscillator();
          const bgain = this.synthCtx.createGain();
          bass.type = 'sine';
          bass.frequency.setValueAtTime(freq / 2, now);
          bgain.gain.setValueAtTime(0.04 * this.volume, now);
          bgain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          bass.connect(bgain);
          bgain.connect(this.synthCtx.destination);
          bass.start(now);
          bass.stop(now + 0.62);
        }

        noteIdx = (noteIdx + 1) % scale.length;
      }, 420);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  public stopCurrent(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.currentTrackId = null;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.audioEl) this.audioEl.pause();
      if (this.synthInterval) {
        clearInterval(this.synthInterval);
        this.synthInterval = null;
      }
    } else {
      if (this.currentTrackId) {
        const trk = this.currentTrackId;
        this.currentTrackId = null;
        this.playChapterMusic(trk);
      }
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    if (this.isMuted === muted) return;
    this.toggleMute();
  }

  public get muted(): boolean {
    return this.isMuted;
  }
}

export const musicManager = MusicManager.getInstance();
