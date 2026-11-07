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

interface AmbientPigeon {
  sprite: Phaser.GameObjects.Sprite;
  baseX: number;
  baseY: number;
  timer: number;
}

export class WildlifeManager {
  private scene: Phaser.Scene;
  private animals: AnimalEntity[] = [];
  private ducks: AmbientDuck[] = [];
  private frogs: BankFrog[] = [];
  private butterflies: AmbientButterfly[] = [];
  private pigeons: AmbientPigeon[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(): void {
    // 1. Marktplatz Wittenberg: Stadttauben & Haustiere direkt am Startort (x: 16..42, y: 20..26)
    this.spawnPigeon(25 * 16, 25 * 16, false);
    this.spawnPigeon(28 * 16, 23 * 16, false);
    this.spawnPigeon(24 * 16, 23 * 16, true);
    this.spawnAnimal(17 * 16, 24 * 16, 'farm_dog_idle', 14, 16, 0.9, 'dog');
    this.spawnAnimal(34 * 16, 23 * 16, 'farm_cat_idle', 12, 14, 0.9, 'cat');

    // 2. Hofhühner bei Cranachs Hofatelier (x: 38..44, y: 22..25)
    this.spawnAnimal(38 * 16, 23 * 16, 'farm_chicken_idle', 10, 18, 0.9, 'chicken');
    this.spawnAnimal(42 * 16, 22 * 16, 'farm_chicken_idle', 10, 18, 0.9, 'chicken');

    // 3. Kurfürstliche Schlosskoppel (Weide östlich des Marktes: x: 30..48, y: 28..34)
    this.spawnAnimal(32 * 16, 29 * 16, 'farm_horse_idle', 22, 15, 1.0, 'horse');
    this.spawnAnimal(44 * 16, 30 * 16, 'farm_horse_idle', 22, 15, 1.0, 'horse');

    // 4. Katharinas Klostergarten & Augustiner-Weide (x: 28..42, y: 54..64)
    this.spawnAnimal(34 * 16, 56 * 16, 'farm_cow_idle', 18, 14, 0.95, 'cow');
    this.spawnAnimal(40 * 16, 60 * 16, 'farm_cow_idle', 16, 14, 0.85, 'cow');
    this.spawnAnimal(36 * 16, 62 * 16, 'farm_pig_idle', 14, 15, 0.9, 'pig');

    // 5. Wollige Bergschafe an den Hängen der Wartburg (x: 14..26, y: 78..86)
    this.spawnAnimal(16 * 16, 80 * 16, 'farm_sheep_idle', 18, 14, 0.9, 'sheep');
    this.spawnAnimal(24 * 16, 82 * 16, 'farm_sheep_idle', 16, 14, 0.8, 'sheep');

    // 6. Bauernkate Frankenhausen (x: 54..66, y: 72..80)
    this.spawnAnimal(58 * 16, 76 * 16, 'farm_chicken_idle', 12, 18, 0.9, 'chicken');
    this.spawnAnimal(62 * 16, 74 * 16, 'farm_chicken_idle', 12, 18, 0.9, 'chicken');

    // 7. Schwimmende Wildenten auf der Elbe / Mulde
    this.spawnDuck(49 * 16, 20 * 16, 40, 10);
    this.spawnDuck(51 * 16, 36 * 16, 48, 12);
    this.spawnDuck(48 * 16, 52 * 16, 50, 11);
    this.spawnDuck(50 * 16, 68 * 16, 44, 9);

    // 8. Uferfrösche an den feuchten Schilfkanten
    this.spawnFrog(46 * 16, 30 * 16);
    this.spawnFrog(54 * 16, 48 * 16);
    this.spawnFrog(46 * 16, 66 * 16);

    // 9. Zierliche Schmetterlinge über blühenden Wiesen
    this.spawnButterfly(23 * 16, 20 * 16, 20, 14, 'blue');
    this.spawnButterfly(44 * 16, 50 * 16, 28, 18, 'yellow');
    this.spawnButterfly(24 * 16, 78 * 16, 30, 20, 'blue');
    this.spawnButterfly(60 * 16, 64 * 16, 26, 16, 'yellow');
  }

  private spawnPigeon(x: number, y: number, isWhite: boolean): void {
    const key = isWhite ? 'pigeon_white_peck' : 'pigeon_peck';
    const anim = isWhite ? 'pigeon-white-peck' : 'pigeon-peck';
    if (!this.scene.textures.exists(key)) return;

    // Native frame is 13x11 px: scale 1.0 renders a crisp, delicate 16-bit pigeon reaching player ankle height
    const sprite = this.scene.add.sprite(x, y, key).setScale(1.0).setDepth(y);
    if (this.scene.anims.exists(anim)) {
      sprite.play(anim);
      const totalFrames = sprite.anims.currentAnim?.frames.length || 16;
      const startIdx = Phaser.Math.Between(0, totalFrames - 1);
      const frame = sprite.anims.currentAnim?.frames[startIdx];
      if (frame) {
        sprite.anims.setCurrentFrame(frame);
      }
    }
    this.pigeons.push({
      sprite,
      baseX: x,
      baseY: y,
      timer: Phaser.Math.Between(2000, 5000),
    });
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
    const actionAnim = this.scene.anims.exists(`${animBase}-graze`)
      ? `${animBase}-graze`
      : (this.scene.anims.exists(`${animBase}-peck`) ? `${animBase}-peck` : undefined);

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
      actionAnim,
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

      // Player proximity reaction (< 36px)
      const dPlayer = Phaser.Math.Distance.Between(ent.sprite.x, ent.sprite.y, playerX, playerY);
      if (dPlayer < 36 && ent.state !== 'player_aware') {
        ent.state = 'player_aware';
        ent.stateTimer = 1600;
        ent.facingRight = playerX < ent.sprite.x;
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
          frog.sprite.x += (frog.sprite.x > 50 * 16 ? -1 : 1) * 8;
        }
      } else {
        frog.hopTimer -= delta;
        if (frog.hopTimer <= 0) {
          frog.isHopping = false;
          if (this.scene.anims.exists('frog-idle')) {
            frog.sprite.play('frog-idle', true);
          }
        }
      }
    }

    // 4. Butterflies Orbiting
    for (const b of this.butterflies) {
      b.angle += b.speed * delta;
      b.sprite.x = b.centerX + Math.cos(b.angle) * b.radiusX;
      b.sprite.y = b.centerY + Math.sin(b.angle * 1.5) * b.radiusY;
      b.sprite.setFlipX(Math.cos(b.angle) < 0);
    }

    // 5. Stadttauben am Markt
    for (const p of this.pigeons) {
      p.timer -= delta;
      if (p.timer <= 0) {
        p.timer = Phaser.Math.Between(2500, 6000);
        p.sprite.setFlipX(Math.random() < 0.5);
      }
      const dPlayer = Phaser.Math.Distance.Between(p.sprite.x, p.sprite.y, playerX, playerY);
      if (dPlayer < 24) {
        // Taube weicht einen Schritt aus
        const dx = p.sprite.x - playerX;
        const dy = p.sprite.y - playerY;
        const dist = Math.hypot(dx, dy) || 1;
        p.sprite.x += (dx / dist) * 1.5;
        p.sprite.y += (dy / dist) * 1.5;
        p.sprite.setDepth(p.sprite.y);
      }
    }
  }
}
