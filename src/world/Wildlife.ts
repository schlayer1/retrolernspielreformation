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

interface AmbientDuck {
  sprite: Phaser.GameObjects.Sprite;
  baseX: number;
  baseY: number;
  driftRangeY: number;
  speed: number;
  dirY: number;
}

interface BankFrog {
  sprite: Phaser.GameObjects.Sprite;
  baseX: number;
  baseY: number;
  isHopping: boolean;
  hopTimer: number;
}

interface AmbientButterfly {
  sprite: Phaser.GameObjects.Sprite;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  angle: number;
  speed: number;
}

export class WildlifeManager {
  private scene: Phaser.Scene;
  private animals: AnimalEntity[] = [];
  private ducks: AmbientDuck[] = [];
  private frogs: BankFrog[] = [];
  private butterflies: AmbientButterfly[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(): void {
    // 1. Kurfürstliche Boten- & Reitpferde auf der Wittenberger Schlosskoppel (x: 28..48, y: 26..30)
    this.spawnAnimal(32 * 16, 28 * 16, 'farm_horse_idle', 20, 15, 1.0, 'horse');
    this.spawnAnimal(46 * 16, 28 * 16, 'farm_horse_idle', 20, 15, 1.0, 'horse');

    // 2. Katharinas Klosterkühe & Hofvieh (Augustinerkloster Weide: x: 28..40, y: 56..64)
    this.spawnAnimal(34 * 16, 58 * 16, 'farm_cow_idle', 18, 14, 0.95, 'cow');
    this.spawnAnimal(30 * 16, 62 * 16, 'farm_cow_idle', 16, 14, 0.85, 'cow');
    this.spawnAnimal(38 * 16, 62 * 16, 'farm_pig_idle', 14, 15, 0.9, 'pig');

    // 3. Wollige Bergschafe auf den Hängen unterhalb der Wartburg (x: 14..26, y: 78..86)
    this.spawnAnimal(16 * 16, 80 * 16, 'farm_sheep_idle', 18, 14, 0.9, 'sheep');
    this.spawnAnimal(24 * 16, 82 * 16, 'farm_sheep_idle', 16, 14, 0.8, 'sheep');

    // 4. Hofhühner bei Cranachs Druckerei & Frankenhausener Bauernkate
    this.spawnAnimal(40 * 16, 24 * 16, 'farm_chicken_idle', 12, 18, 0.9, 'chicken');
    this.spawnAnimal(42 * 16, 25 * 16, 'farm_chicken_idle', 10, 18, 0.9, 'chicken');
    this.spawnAnimal(58 * 16, 74 * 16, 'farm_chicken_idle', 12, 18, 0.9, 'chicken');

    // 5. Schwimmende Wildenten auf der Elbe / Mulde
    this.spawnDuck(49 * 16, 20 * 16, 40, 10);
    this.spawnDuck(51 * 16, 36 * 16, 48, 12);
    this.spawnDuck(48 * 16, 52 * 16, 50, 11);
    this.spawnDuck(50 * 16, 68 * 16, 44, 9);

    // 6. Uferfrösche an den feuchten Schilfkanten
    this.spawnFrog(46 * 16, 30 * 16);
    this.spawnFrog(54 * 16, 48 * 16);
    this.spawnFrog(46 * 16, 66 * 16);

    // 7. Zierliche Schmetterlinge über blühenden Wiesen
    this.spawnButterfly(28 * 16, 16 * 16, 24, 16, 'blue');
    this.spawnButterfly(44 * 16, 50 * 16, 28, 18, 'yellow');
    this.spawnButterfly(24 * 16, 78 * 16, 30, 20, 'blue');
    this.spawnButterfly(60 * 16, 64 * 16, 26, 16, 'yellow');
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
    const tex = this.scene.textures.exists(spriteKey)
      ? spriteKey
      : (this.scene.textures.exists(`${animBase}`) ? animBase : null);
    if (!tex) return;

    const sprite = this.scene.add.sprite(x, y, tex).setScale(baseScale).setDepth(y);

    const idleAnim = `${animBase}-idle`;
    const walkAnim = `${animBase}-walk`;
    const actionAnim = `${animBase}-graze` || `${animBase}-peck`;

    if (this.scene.anims.exists(idleAnim)) {
      sprite.play(idleAnim);
    }

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
      idleAnim: this.scene.anims.exists(idleAnim) ? idleAnim : undefined,
      walkAnim: this.scene.anims.exists(walkAnim) ? walkAnim : undefined,
      actionAnim: this.scene.anims.exists(actionAnim) ? actionAnim : (this.scene.anims.exists(`${animBase}-peck`) ? `${animBase}-peck` : undefined),
    };

    this.startBreatheTween(ent);
    this.animals.push(ent);
  }

  private spawnDuck(x: number, y: number, driftRangeY: number, speed: number): void {
    if (!this.scene.textures.exists('farm_duck_swim')) return;
    const sprite = this.scene.add.sprite(x, y, 'farm_duck_swim').setScale(0.95).setDepth(y);
    if (this.scene.anims.exists('duck-swim')) {
      sprite.play('duck-swim');
    }
    this.ducks.push({
      sprite,
      baseX: x,
      baseY: y,
      driftRangeY,
      speed,
      dirY: Math.random() < 0.5 ? 1 : -1,
    });
  }

  private spawnFrog(x: number, y: number): void {
    if (!this.scene.textures.exists('farm_frog_idle')) return;
    const sprite = this.scene.add.sprite(x, y, 'farm_frog_idle').setScale(0.85).setDepth(y);
    if (this.scene.anims.exists('frog-idle')) {
      sprite.play('frog-idle');
    }
    this.frogs.push({
      sprite,
      baseX: x,
      baseY: y,
      isHopping: false,
      hopTimer: 0,
    });
  }

  private spawnButterfly(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    color: 'blue' | 'yellow'
  ): void {
    const key = color === 'blue' ? 'farm_butterfly_blue' : 'farm_butterfly_yellow';
    if (!this.scene.textures.exists(key)) return;
    const sprite = this.scene.add.sprite(centerX, centerY, key).setScale(0.85).setDepth(centerY + 30);
    const animKey = color === 'blue' ? 'butterfly-blue-fly' : 'butterfly-yellow-fly';
    if (this.scene.anims.exists(animKey)) {
      sprite.play(animKey);
    }
    this.butterflies.push({
      sprite,
      centerX,
      centerY,
      radiusX,
      radiusY,
      angle: Math.random() * Math.PI * 2,
      speed: 0.0018 + Math.random() * 0.001,
    });
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
    // 1. Roaming Herds & Farm Animals
    for (const ent of this.animals) {
      ent.stateTimer -= delta;

      const distToPlayer = Phaser.Math.Distance.Between(ent.sprite.x, ent.sprite.y, playerX, playerY);

      if (distToPlayer < 44 && ent.state !== 'player_aware') {
        ent.state = 'player_aware';
        ent.stateTimer = 1500;
        ent.facingRight = playerX > ent.sprite.x;
        ent.sprite.setFlipX(!ent.facingRight);
        if (ent.idleAnim && this.scene.anims.exists(ent.idleAnim)) {
          ent.sprite.play(ent.idleAnim, true);
        }
        continue;
      }

      if (ent.stateTimer <= 0) {
        const r = Math.random();
        if (r < 0.35) {
          ent.state = 'idle_breathe';
          ent.stateTimer = Phaser.Math.Between(3000, 6000);
          this.startBreatheTween(ent);
          if (ent.idleAnim && this.scene.anims.exists(ent.idleAnim)) {
            ent.sprite.play(ent.idleAnim, true);
          }
        } else if (r < 0.7) {
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
          if (ent.walkAnim && this.scene.anims.exists(ent.walkAnim)) {
            ent.sprite.play(ent.walkAnim, true);
          }
        } else {
          ent.state = 'graze_eat';
          ent.stateTimer = Phaser.Math.Between(3000, 5000);
          this.startBreatheTween(ent);
          const eatAnim = ent.actionAnim || ent.idleAnim;
          if (eatAnim && this.scene.anims.exists(eatAnim)) {
            ent.sprite.play(eatAnim, true);
          }
        }
      }

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
          if (ent.idleAnim && this.scene.anims.exists(ent.idleAnim)) {
            ent.sprite.play(ent.idleAnim, true);
          }
        }
      }
    }

    // 2. Ambient Ducks Floating on the River
    for (const duck of this.ducks) {
      duck.sprite.y += duck.dirY * (duck.speed * delta) / 1000;
      if (Math.abs(duck.sprite.y - duck.baseY) > duck.driftRangeY) {
        duck.dirY *= -1;
      }
      duck.sprite.setDepth(duck.sprite.y);
    }

    // 3. Bank Frogs Reacting to Player
    for (const frog of this.frogs) {
      if (!frog.isHopping) {
        const distToPlayer = Phaser.Math.Distance.Between(frog.sprite.x, frog.sprite.y, playerX, playerY);
        if (distToPlayer < 40) {
          frog.isHopping = true;
          frog.hopTimer = 900;
          if (this.scene.anims.exists('frog-hop')) {
            frog.sprite.play('frog-hop', true);
          }
          // Hop towards water
          const hopDirX = frog.sprite.x > 50 * 16 ? -1 : 1;
          this.scene.tweens.add({
            targets: frog.sprite,
            x: frog.sprite.x + hopDirX * 18,
            y: frog.sprite.y + Phaser.Math.Between(-8, 8),
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => {
              if (this.scene.anims.exists('frog-idle')) {
                frog.sprite.play('frog-idle', true);
              }
              frog.isHopping = false;
            },
          });
        }
      }
    }

    // 4. Fluttering Butterflies
    for (const bf of this.butterflies) {
      bf.angle += bf.speed * delta;
      bf.sprite.x = bf.centerX + Math.cos(bf.angle) * bf.radiusX;
      bf.sprite.y = bf.centerY + Math.sin(bf.angle * 2) * bf.radiusY;
      bf.sprite.setFlipX(Math.sin(bf.angle) < 0);
      bf.sprite.setDepth(bf.sprite.y + 20);
    }
  }
}
