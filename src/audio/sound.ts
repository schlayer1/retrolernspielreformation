import { musicManager } from './MusicManager';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.42;
  private theme: 'choral' | 'lute' = 'choral';
  private lastFootstepTime = 0;

  private getAudioContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public startBGM(chapter = 1): void {
    if (this.muted) return;
    musicManager.playChapterTrack(chapter);
  }

  public stopBGM(): void {
    musicManager.stopCurrent();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    musicManager.setVolume(this.volume);
  }

  public getVolume(): number {
    return musicManager.getVolume();
  }

  public toggleMute(): boolean {
    this.muted = musicManager.toggleMute();
    return this.muted;
  }

  public setMuted(m: boolean): void {
    this.muted = m;
    musicManager.setMuted(m);
  }

  public isMuted(): boolean {
    return musicManager.isMuted();
  }

  public get bgmMuted(): boolean {
    return musicManager.isMuted();
  }

  public setTheme(theme: 'choral' | 'lute'): void {
    this.theme = theme;
  }

  public getTheme(): 'choral' | 'lute' {
    return this.theme;
  }

  public toggleTheme(): 'choral' | 'lute' {
    this.theme = this.theme === 'choral' ? 'lute' : 'choral';
    return this.theme;
  }

  public setIndoorAcoustics(indoor: boolean): void {
    this.theme = indoor ? 'lute' : 'choral';
  }

  // SFX Synthesizer
  public click(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public questStep(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.13, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.16);
    });
  }

  public success(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.16, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.28);
    });
  }

  public door(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.2);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public footstep(surface: 'stone' | 'dirt' | 'grass' | 'wood' = 'grass'): void {
    if (this.isMuted()) return;
    const nowMs = Date.now();
    if (nowMs - this.lastFootstepTime < 300) return;
    this.lastFootstepTime = nowMs;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    if (surface === 'stone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    } else if (surface === 'dirt') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    } else if (surface === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(460, now);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playClick(): void { this.click(); }
  public playSelect(): void { this.click(); }
  public playSuccess(): void { this.success(); }
  public playFanfare(): void { this.success(); }
  public playCollect(): void { this.questStep(); }
  public playPickup(): void { this.questStep(); }
  public playDialog(): void { this.click(); }
  public playCraft(): void { this.questStep(); }
  public playError(): void { this.door(); }
  public playQuestDone(): void { this.success(); }
  public step(surface?: any): void { this.footstep(surface); }
  public playFootstep(surface?: any): void { this.footstep(surface); }
  public toggleBGM(): boolean { return this.toggleMute(); }
}

export const sound = new SoundManager();
(window as any).__gameSound = sound;
