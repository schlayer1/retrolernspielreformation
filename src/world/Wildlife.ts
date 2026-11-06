import Phaser from 'phaser';

export type AnimalState = 'idle_breathe' | 'graze_eat' | 'wander_tether' | 'player_aware';

interface AnimalEntity {
  sprite: Phaser.GameObjects.Sprite;
  baseX: number;
  baseY: number;
  wanderRadius: number;
  speed: number;
  baseScale: number;
  state: AnimalState;
  stateTimer: number;
  targetX: number;
  targetY: number;
  facingRight: boolean;
  stepPhase: number;
  activeTween: Phaser.Tweens.Tween | null;
  idleAnim?: string;
  walkAnim?: string;
  actionAnim?: string;
}

export class WildlifeManager {
  private scene: Phaser.Scene;
  private animals: AnimalEntity[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(): void {
    // 1. Kurfürstliche Botenpferde (Wittenberg & Hof)
    this.spawnAnimal(32 * 16, 26 * 16, 'horse', 24, 12, 0.95, 'horse');
    this.spawnAnimal(48 * 16, 28 * 16, 'horse', 24, 12, 0.95, 'horse');

    // 2. Katharinas Klosterziegen & Rinder (Klostergarten)
    this.spawnAnimal(34 * 16, 60 * 16, 'cow_brown', 20, 10, 0.85, 'cow_brown');
    this.spawnAnimal(30 * 16, 62 * 16, 'calf_brown', 18, 12, 0.8, 'calf_brown');

    // 3. Schafe auf den Thüringer Hängen bei der Wartburg
    this.spawnAnimal(18 * 16, 82 * 16, 'sheep', 22, 10, 0.85, 'sheep');
    this.spawnAnimal(22 * 16, 84 * 16, 'sheep_baby', 16, 12, 0.8, 'sheep_baby');

    // 4. Hühner auf dem Hof Cranachs
    this.spawnAnimal(40 * 16, 24 * 16, 'chicken_brown', 14, 15, 0.9, 'chicken_brown');
    this.spawnAnimal(42 * 16, 25 * 16, 'chick_dark', 10, 16, 0.9, 'chick_dark');
  }

  private spawnAnimal(
    x: number,
    y: number,
    spriteKey: string,
    wanderRadius: number,
    speed: number,
    baseScale: number,
    animBase: string
  ): void {
    if (!this.scene.textures.exists(spriteKey)) return;

    const sprite = this.scene.add.sprite(x, y, spriteKey).setScale(baseScale).setDepth(y);

    const ent: AnimalEntity = {
      sprite,
      baseX: x,
      baseY: y,
      wanderRadius: wanderRadius * 16,
      speed,
      baseScale,
      state: 'idle_breathe',
      stateTimer: Phaser.Math.Between(2000, 5000),
      targetX: x,
      targetY: y,
      facingRight: false,
      stepPhase: 0,
      activeTween: null,
      idleAnim: `${animBase}-idle`,
      walkAnim: `${animBase}-walk`,
      actionAnim: `${animBase}-action`,
    };

    this.startBreatheTween(ent);
    this.animals.push(ent);
  }

  private startBreatheTween(ent: AnimalEntity): void {
    if (ent.activeTween) {
      ent.activeTween.stop();
      ent.activeTween = null;
    }
    ent.activeTween = this.scene.tweens.add({
      targets: ent.sprite,
      scaleY: { from: ent.baseScale * 0.96, to: ent.baseScale * 1.04 },
      duration: 1200 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public update(delta: number, playerX: number, playerY: number): void {
    for (const ent of this.animals) {
      ent.stateTimer -= delta;

      // Distanz zum Spieler
      const distToPlayer = Phaser.Math.Distance.Between(ent.sprite.x, ent.sprite.y, playerX, playerY);

      if (distToPlayer < 48 && ent.state !== 'player_aware') {
        ent.state = 'player_aware';
        ent.stateTimer = 1500;
        ent.facingRight = playerX > ent.sprite.x;
        ent.sprite.setFlipX(!ent.facingRight);
        continue;
      }

      if (ent.stateTimer <= 0) {
        // Zustandswechsel
        const r = Math.random();
        if (r < 0.45) {
          ent.state = 'idle_breathe';
          ent.stateTimer = Phaser.Math.Between(3000, 6000);
          this.startBreatheTween(ent);
        } else if (r < 0.75) {
          ent.state = 'wander_tether';
          ent.stateTimer = Phaser.Math.Between(3000, 5000);
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * ent.wanderRadius;
          ent.targetX = ent.baseX + Math.cos(angle) * dist;
          ent.targetY = ent.baseY + Math.sin(angle) * dist;
          ent.facingRight = ent.targetX > ent.sprite.x;
          ent.sprite.setFlipX(!ent.facingRight);
          if (ent.activeTween) {
            ent.activeTween.stop();
            ent.activeTween = null;
          }
        } else {
          ent.state = 'graze_eat';
          ent.stateTimer = Phaser.Math.Between(3000, 5000);
          this.startBreatheTween(ent);
        }
      }

      // Wanderbewegung
      if (ent.state === 'wander_tether') {
        const step = (ent.speed * delta) / 1000;
        const distToTarget = Phaser.Math.Distance.Between(ent.sprite.x, ent.sprite.y, ent.targetX, ent.targetY);

        if (distToTarget > 4) {
          const angle = Phaser.Math.Angle.Between(ent.sprite.x, ent.sprite.y, ent.targetX, ent.targetY);
          ent.sprite.x += Math.cos(angle) * step;
          ent.sprite.y += Math.sin(angle) * step;
          ent.sprite.setDepth(ent.sprite.y);
        } else {
          ent.state = 'idle_breathe';
          ent.stateTimer = 2000;
          this.startBreatheTween(ent);
        }
      }
    }
  }
}
