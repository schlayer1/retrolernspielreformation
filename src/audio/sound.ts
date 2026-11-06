class ReformationSynthesizer {
  private getContext: () => AudioContext | null;
  private isPlaying = false;
  private stepInterval: any = null;
  private stepIndex = 0;
  private masterGain: GainNode | null = null;

  constructor(getContext: () => AudioContext | null) {
    this.getContext = getContext;
  }

  public start(chapter = 1, volume = 0.22): void {
    this.stop();
    this.isPlaying = true;
    this.stepIndex = 0;

    const ctx = this.getContext();
    if (!ctx) return;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Sakrale Renaissance-Tonleitern (Dorisch / Kantionalsatz à la „Ein feste Burg“)
    const isDramatic = chapter === 4 || chapter === 7; // Worms & Bauernkrieg
    const chordProgressions = isDramatic
      ? [
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
          [196.0, 246.94, 293.66], // G
          [164.81, 207.65, 246.94], // E-Dur
        ]
      : [
          [261.63, 329.63, 392.0], // C
          [196.0, 246.94, 293.66], // G
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
        ];

    // Melodie: Reformation Choral
    const leadMelody = isDramatic
      ? [440, 440, 440, 392, 440, 523.25, 493.88, 440]
      : [523.25, 523.25, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88];

    const stepDuration = 0.24;

    this.stepInterval = setInterval(() => {
      if (!this.isPlaying) return;
      const actx = this.getContext();
      if (!actx || !this.masterGain) return;

      const chordIdx = Math.floor(this.stepIndex / 4) % chordProgressions.length;
      const currentChord = chordProgressions[chordIdx];
      const arpNote = currentChord[this.stepIndex % 3];
      const leadNote = leadMelody[Math.floor(this.stepIndex / 2) % leadMelody.length];
      const bassNote = currentChord[0] / 2;

      const now = actx.currentTime;

      // 1. Orgel / Gamben-Arpeggio
      const arpOsc = actx.createOscillator();
      const arpGain = actx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(arpNote, now);
      arpGain.gain.setValueAtTime(0.08, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);
      arpOsc.connect(arpGain);
      arpGain.connect(this.masterGain);
      arpOsc.start(now);
      arpOsc.stop(now + stepDuration);

      // 2. Orgel-Pedal Bass
      if (this.stepIndex % 4 === 0) {
        const bassOsc = actx.createOscillator();
        const bassGain = actx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassNote, now);
        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 3.8);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 4);
      }

      // 3. Choral Lead-Stimme
      if (this.stepIndex % 2 === 0) {
        const leadOsc = actx.createOscillator();
        const leadGain = actx.createGain();
        leadOsc.type = isDramatic ? 'sawtooth' : 'triangle';
        leadOsc.frequency.setValueAtTime(leadNote, now);
        leadGain.gain.setValueAtTime(0.07, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);
        leadOsc.connect(leadGain);
        leadGain.connect(this.masterGain);
        leadOsc.start(now);
        leadOsc.stop(now + stepDuration * 2);
      }

      this.stepIndex = (this.stepIndex + 1) % (chordProgressions.length * 4);
    }, stepDuration * 1000);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }

  public setVolume(vol: number): void {
    if (this.masterGain && this.getContext()) {
      this.masterGain.gain.setValueAtTime(vol, this.getContext()!.currentTime);
    }
  }
}

export class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private synth: ReformationSynthesizer;
  private muted = false;
  private volume = 0.35;
  private lastFootstepTime = 0;

  constructor() {
    this.synth = new ReformationSynthesizer(() => this.getAudioContext());
  }

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

    const tracks = ['/assets/audio/bgm/bgm_warmth.mp3', '/assets/audio/bgm/bgm_patterns.mp3', '/assets/audio/bgm/bgm_heart.mp3'];
    const trackUrl = tracks[(chapter - 1) % tracks.length];

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.volume;

      this.bgmAudio.onerror = () => {
        console.warn('MP3 BGM nicht vorhanden, wechsle zum Renaissance-Synthesizer...');
        this.synth.start(chapter, this.volume * 0.7);
      };
    }

    this.bgmAudio.src = trackUrl;
    this.bgmAudio.play().catch(() => {
      // Autoplay fallback auf Synthesizer
      this.synth.start(chapter, this.volume * 0.7);
    });
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.synth.stop();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) this.bgmAudio.volume = this.volume;
    this.synth.setVolume(this.volume * 0.7);
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      this.startBGM(1);
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getVolume(): number {
    return this.volume;
  }

  // SFX Synthesizer
  public click(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public questStep(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.16);
    });
  }

  public success(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.18, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.28);
    });
  }

  public door(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.22);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public footstep(surface: 'stone' | 'dirt' | 'grass' | 'wood' = 'grass'): void {
    if (this.muted) return;
    const nowMs = Date.now();
    if (nowMs - this.lastFootstepTime < 320) return;
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
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    } else if (surface === 'dirt') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    } else if (surface === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const sound = new SoundManager();
(window as any).__gameSound = sound;
