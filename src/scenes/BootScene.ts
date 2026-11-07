import Phaser from 'phaser';
import { gameState } from '../systems/GameState';

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
    this.load.image('cliffs_desert', '/assets/world/cliffs_desert.png');
    this.load.image('Overworld', '/assets/gfx/Overworld.png');

    // 2. Main Character Spritesheet (16x32)
    this.load.spritesheet('character', '/assets/gfx/character.png', {
      frameWidth: 16,
      frameHeight: 32,
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
      'gatehouse',
      'house_tall_slate',
      'house_gable_tile',
      'tower_round',
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
      'hearth',
      'bookcase',
      'bookcase_narrow',
      'book_pile',
      'book_open',
      'armchair_green',
      'armor_stand',
      'banner_wall',
      'banner_stand',
      'window_curtains',
      'interior_guild_library_day',
      'interior_guild_library_night',
      'interior_tavern_day',
      'interior_tavern_night',
      'interior_alchemist_day',
      'interior_inn_rooms_day',
      'interior_store_smithy_day',
      'house_gable_slate',
      'statue_king',
      'flowerbed_gold',
      'village_stone_well_prop',
    ];
    for (const p of props) {
      this.load.image(p, `/assets/props/${p}.png`);
    }

    // 7. Interior Animated Strips
    this.load.spritesheet('hearth_fire', '/assets/animations/hearth_fire_strip.png', {
      frameWidth: 48,
      frameHeight: 44,
    });
    this.load.spritesheet('dog_sleeping', '/assets/animations/dog_sleeping_strip.png', {
      frameWidth: 48,
      frameHeight: 14,
    });
    this.load.spritesheet('candle_lit', '/assets/animations/candle_lit_strip.png', {
      frameWidth: 8,
      frameHeight: 11,
    });
    this.load.spritesheet('coin_sparkle', '/assets/animations/coin_sparkle_strip.png', {
      frameWidth: 22,
      frameHeight: 22,
    });
    this.load.spritesheet('cauldron', '/assets/animations/cauldron_strip.png', {
      frameWidth: 24,
      frameHeight: 26,
    });

    // 8. Relic icons
    this.load.image('relic_marker_glow', '/assets/icons/relic_marker_glow.png');
    this.load.image('relic_codex', '/assets/icons/relic_codex.png');
    this.load.image('relic_lehnsurkunde', '/assets/icons/relic_lehnsurkunde.png');
    this.load.image('relic_silberdenar', '/assets/icons/relic_silberdenar.png');
  }

  create(): void {
    this.createFemaleCharacterSheet();
    this.createAnimations();
    this.extractPreviewImages();
    this.scene.start('WorldScene');
    this.scene.start('UIScene');
  }

  private createFemaleCharacterSheet(): void {
    try {
      const srcImg = this.textures.get('character').getSourceImage() as HTMLImageElement;
      const w = srcImg.width;
      const h = srcImg.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(srcImg, 0, 0);

      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const a = d[i + 3];
        if (a > 128 && r > 130 && r > g * 1.45 && r > b * 1.45) {
          d[i] = Math.min(255, Math.round(b * 0.9 + 25));
          d[i + 1] = Math.min(255, Math.round(r * 0.68));
          d[i + 2] = Math.min(255, Math.round(r * 1.05));
        }
      }
      ctx.putImageData(imgData, 0, 0);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const fx = col * 16;
          const fy = row * 32;
          ctx.fillStyle = '#f2c94c';
          ctx.fillRect(fx + 5, fy + 9, 6, 1);
          ctx.fillStyle = '#5a3420';
          if (row === 0 || row === 2) {
            ctx.fillRect(fx + 2, fy + 14, 2, 6);
            ctx.fillRect(fx + 12, fy + 14, 2, 6);
            ctx.fillStyle = '#f2c94c';
            ctx.fillRect(fx + 2, fy + 19, 1, 1);
            ctx.fillRect(fx + 13, fy + 19, 1, 1);
          } else if (row === 1) {
            ctx.fillRect(fx + 2, fy + 13, 2, 7);
            ctx.fillStyle = '#f2c94c';
            ctx.fillRect(fx + 2, fy + 19, 1, 1);
          } else if (row === 3) {
            ctx.fillRect(fx + 12, fy + 13, 2, 7);
            ctx.fillStyle = '#f2c94c';
            ctx.fillRect(fx + 13, fy + 19, 1, 1);
          }
        }
      }

      this.textures.addSpriteSheet('character_female', canvas as unknown as HTMLImageElement, {
        frameWidth: 16,
        frameHeight: 32,
      });
    } catch {
      // Fallback
    }
  }

  private extractPreviewImages(): void {
    const toDataUrl = (texKey: string, sx = 0, sy = 0, sw = 16, sh = 32): string => {
      try {
        const src = this.textures.get(texKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        const c = document.createElement('canvas');
        c.width = sw;
        c.height = sh;
        const ctx = c.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
        return c.toDataURL();
      } catch {
        return '';
      }
    };

    gameState.malePreviewUrl = toDataUrl('character', 0, 0, 16, 32);
    gameState.femalePreviewUrl = toDataUrl('character_female', 0, 0, 16, 32) || gameState.malePreviewUrl;
  }

  private createAnimations(): void {
    // 16x32 LPC Player Animations for Male & Female
    const dirs = [
      { name: 'down', start: 0 },
      { name: 'right', start: 17 },
      { name: 'up', start: 34 },
      { name: 'left', start: 51 },
    ];

    dirs.forEach(({ name, start }) => {
      // Male / default
      if (!this.anims.exists(`walk-${name}`)) {
        this.anims.create({
          key: `walk-${name}`,
          frames: this.anims.generateFrameNumbers('character', { start, end: start + 3 }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`walk-male-${name}`)) {
        this.anims.create({
          key: `walk-male-${name}`,
          frames: this.anims.generateFrameNumbers('character', { start, end: start + 3 }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`idle-male-${name}`)) {
        this.anims.create({
          key: `idle-male-${name}`,
          frames: [{ key: 'character', frame: start }],
          frameRate: 1,
        });
      }

      // Female
      if (this.textures.exists('character_female')) {
        if (!this.anims.exists(`walk-female-${name}`)) {
          this.anims.create({
            key: `walk-female-${name}`,
            frames: this.anims.generateFrameNumbers('character_female', { start, end: start + 3 }),
            frameRate: 8,
            repeat: -1,
          });
        }
        if (!this.anims.exists(`idle-female-${name}`)) {
          this.anims.create({
            key: `idle-female-${name}`,
            frames: [{ key: 'character_female', frame: start }],
            frameRate: 1,
          });
        }
      }
    });

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

    // Interior Anims
    if (this.textures.exists('hearth_fire') && !this.anims.exists('hearth-fire')) {
      this.anims.create({
        key: 'hearth-fire',
        frames: this.anims.generateFrameNumbers('hearth_fire', { start: 0, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (this.textures.exists('dog_sleeping') && !this.anims.exists('dog-sleeping-anim')) {
      this.anims.create({
        key: 'dog-sleeping-anim',
        frames: this.anims.generateFrameNumbers('dog_sleeping', { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1,
      });
    }
    if (this.textures.exists('candle_lit') && !this.anims.exists('candle-lit-anim')) {
      this.anims.create({
        key: 'candle-lit-anim',
        frames: this.anims.generateFrameNumbers('candle_lit', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (this.textures.exists('coin_sparkle') && !this.anims.exists('coin-sparkle-anim')) {
      this.anims.create({
        key: 'coin-sparkle-anim',
        frames: this.anims.generateFrameNumbers('coin_sparkle', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (this.textures.exists('cauldron') && !this.anims.exists('cauldron-anim')) {
      this.anims.create({
        key: 'cauldron-anim',
        frames: this.anims.generateFrameNumbers('cauldron', { start: 0, end: 11 }),
        frameRate: 9,
        repeat: -1,
      });
    }
  }
}
