import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // 1. World & Terrain
    this.load.atlas('world_atlas', '/assets/world/world_atlas.png', '/assets/world/world_atlas.json');
    this.load.image('ground_a2', '/assets/world/ground_a2.png');
    this.load.image('ground_med_a2', '/assets/world/ground_med_a2.png');
    this.load.image('cliffs_nature', '/assets/world/cliffs_nature.png');
    this.load.image('Overworld', '/assets/gfx/Overworld.png');

    // 2. Main Character Spritesheet (16x32)
    this.load.spritesheet('character', '/assets/characters/keep_monk.png', {
      frameWidth: 48,
      frameHeight: 64,
    });

    // 3. Keep Characters (48x64)
    const chars = ['keep_monk', 'keep_noble', 'keep_king', 'keep_guard'];
    for (const c of chars) {
      this.load.spritesheet(c, `/assets/characters/${c}.png`, {
        frameWidth: 48,
        frameHeight: 64,
      });
    }

    // 4. Strip animations
    this.load.spritesheet('farm_baker_walk_down_strip', '/assets/characters/farm_baker_walk_down_strip.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('farm_farmer_girl_idle_down_strip', '/assets/characters/farm_farmer_girl_idle_down_strip.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 5. Fauna & Companion
    this.load.spritesheet('farm_dog_walk', '/assets/fauna/farm_dog_walk_strip.png', {
      frameWidth: 26,
      frameHeight: 21,
    });
    this.load.spritesheet('farm_dog_idle', '/assets/fauna/farm_dog_idle_strip.png', {
      frameWidth: 26,
      frameHeight: 21,
    });
    this.load.spritesheet('cow_brown', '/assets/fauna/cow_brown.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('calf_brown', '/assets/fauna/calf_brown.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('horse', '/assets/fauna/horse.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sheep', '/assets/fauna/sheep.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sheep_baby', '/assets/fauna/sheep_baby.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('chicken_brown', '/assets/fauna/chicken_brown.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chick_dark', '/assets/fauna/chick_dark.png', { frameWidth: 16, frameHeight: 16 });

    // 6. Real 16-Bit Props & Architecture
    const props = [
      'chapel',
      'well',
      'cottage_stone',
      'cottage_thatch',
      'monastery_scriptorium_desk',
      'monastery_book_lectern',
      'monastery_altar_shrine',
      'monastery_herbal_planter',
      'fortress_gatehouse',
      'fortress_battlement',
      'royal_throne_gold',
      'stall_red',
      'stall_blue',
      'stall_green',
      'keep',
      'peasant_thatched_cottage',
      'cart_hay',
      'cart_goods',
      'bench',
      'bench_stone',
      'barrel',
      'crates',
    ];
    for (const p of props) {
      this.load.image(p, `/assets/props/${p}.png`);
    }

    // 7. Relic icons
    this.load.image('relic_marker_glow', '/assets/icons/relic_marker_glow.png');
    this.load.image('relic_codex', '/assets/icons/relic_codex.png');
    this.load.image('relic_lehnsurkunde', '/assets/icons/relic_lehnsurkunde.png');
    this.load.image('relic_silberdenar', '/assets/icons/relic_silberdenar.png');
  }

  create(): void {
    this.createAnimations();
    this.scene.start('WorldScene');
    this.scene.start('UIScene');
  }

  private createAnimations(): void {
    // Player Character Anims (48x64 standard: row 0 idle, row 1 walk down)
    const createKeepAnims = (key: string) => {
      if (this.textures.exists(key)) {
        if (!this.anims.exists(`${key}-walk-down`)) {
          this.anims.create({
            key: `${key}-walk-down`,
            frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1,
          });
        }
      }
    };

    createKeepAnims('character');
    createKeepAnims('keep_monk');
    createKeepAnims('keep_noble');
    createKeepAnims('keep_king');
    createKeepAnims('keep_guard');

    // Dog Anims
    if (this.textures.exists('farm_dog_walk') && !this.anims.exists('dog-walk')) {
      this.anims.create({
        key: 'dog-walk',
        frames: this.anims.generateFrameNumbers('farm_dog_walk', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_dog_idle') && !this.anims.exists('dog-idle')) {
      this.anims.create({
        key: 'dog-idle',
        frames: this.anims.generateFrameNumbers('farm_dog_idle', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });
    }
  }
}
