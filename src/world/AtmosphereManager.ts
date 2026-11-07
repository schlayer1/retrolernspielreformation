import Phaser from 'phaser';

export type AtmospherePreset = 'DAWN' | 'MIDDAY' | 'STORM_CRISIS' | 'GLOOM_CATACOMBS' | 'DUSK_FALL';

interface LightConfig {
  color: number;
  alpha: number;
}

const PRESETS: Record<AtmospherePreset, LightConfig> = {
  DAWN: { color: 0xffedd5, alpha: 0.12 }, // Morgenröte (Kap. 1, 2)
  MIDDAY: { color: 0xffffff, alpha: 0.04 }, // Pracht & Disputation (Kap. 3, 4)
  GLOOM_CATACOMBS: { color: 0x1c1917, alpha: 0.45 }, // Wartburg Versteck (Kap. 5)
  STORM_CRISIS: { color: 0x334155, alpha: 0.32 }, // Bauernkrieg (Kap. 7)
  DUSK_FALL: { color: 0xfb7185, alpha: 0.18 }, // Religionsfrieden (Kap. 8)
};

interface DriftingLeaf {
  sprite: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  sineOffset: number;
}

export class AtmosphereManager {
  private scene: Phaser.Scene;
  private tintOverlay: Phaser.GameObjects.Rectangle | null = null;
  private currentPreset: AtmospherePreset = 'DAWN';
  private leaves: DriftingLeaf[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(mapW: number, mapH: number): void {
    const W = mapW * 16;
    const H = mapH * 16;

    // 1. Fullscreen tint overlay
    this.tintOverlay = this.scene.add.rectangle(0, 0, W, H, PRESETS.DAWN.color, PRESETS.DAWN.alpha);
    this.tintOverlay.setOrigin(0, 0);
    this.tintOverlay.setDepth(9999);
    this.tintOverlay.setScrollFactor(1);

    // 2. Secret of Mana Drifting Nature Leaves (14 drifting autumn particles)
    for (let i = 0; i < 14; i++) {
      const g = this.scene.add.graphics();
      // Draw small 3x2 pixel leaf
      const isGold = i % 2 === 0;
      g.fillStyle(isGold ? 0xd97706 : 0xb45309, 0.85);
      g.fillRect(0, 0, 3, 2);
      g.setDepth(9998);

      this.leaves.push({
        sprite: g,
        x: Phaser.Math.Between(20, Math.min(94 * 16, W)),
        y: Phaser.Math.Between(20, H),
        speedX: Phaser.Math.FloatBetween(22, 38),
        speedY: Phaser.Math.FloatBetween(12, 22),
        sineOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  public setChapterMood(chapter: number): void {
    let preset: AtmospherePreset = 'DAWN';
    if (chapter <= 2) preset = 'DAWN';
    else if (chapter <= 4) preset = 'MIDDAY';
    else if (chapter === 5) preset = 'GLOOM_CATACOMBS';
    else if (chapter === 6) preset = 'DAWN';
    else if (chapter === 7) preset = 'STORM_CRISIS';
    else preset = 'DUSK_FALL';

    if (preset === this.currentPreset || !this.tintOverlay) return;
    this.currentPreset = preset;
    const target = PRESETS[preset];

    this.scene.tweens.add({
      targets: this.tintOverlay,
      fillColor: target.color,
      fillAlpha: target.alpha,
      duration: 1200,
      ease: 'Cubic.easeInOut',
    });
  }

  public update(deltaMs: number, camX: number, camY: number): void {
    const stepSec = deltaMs / 1000;
    const cam = this.scene.cameras.main;

    for (const leaf of this.leaves) {
      leaf.sineOffset += stepSec * 2.5;
      leaf.x += leaf.speedX * stepSec + Math.sin(leaf.sineOffset) * 0.8;
      leaf.y += leaf.speedY * stepSec;

      // Wrap around active camera viewport
      if (leaf.x > cam.worldView.right + 20) {
        leaf.x = cam.worldView.left - 20;
        leaf.y = cam.worldView.top + Phaser.Math.Between(0, cam.worldView.height);
      }
      if (leaf.y > cam.worldView.bottom + 20) {
        leaf.y = cam.worldView.top - 20;
        leaf.x = cam.worldView.left + Phaser.Math.Between(0, cam.worldView.width);
      }

      leaf.sprite.setPosition(leaf.x, leaf.y);
    }
  }
}
