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

    // 2. Main Character Spritesheets (48x64 standard 16-bit Keep Characters)
    this.load.spritesheet('character', '/assets/characters/keep_squire.png', {
      frameWidth: 48,
      frameHeight: 64,
    });
    this.load.spritesheet('character_female', '/assets/characters/keep_peasant_f.png', {
      frameWidth: 48,
      frameHeight: 64,
    });

    // 3. Keep Characters (48x64)
    const chars = [
      'keep_monk',
      'keep_noble',
      'keep_king',
      'keep_guard',
      'keep_captain',
      'keep_merchant',
      'keep_farmer',
    ];
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

    // 5. Fauna & Companion (16-Bit Living World Strips & Sheets)
    this.load.spritesheet('farm_dog_walk', '/assets/fauna/farm_dog_walk_strip.png', {
      frameWidth: 26,
      frameHeight: 21,
    });
    this.load.spritesheet('farm_dog_idle', '/assets/fauna/farm_dog_idle_strip.png', {
      frameWidth: 26,
      frameHeight: 21,
    });
    this.load.spritesheet('farm_horse_walk', '/assets/fauna/farm_horse_walk_strip.png', {
      frameWidth: 46,
      frameHeight: 39,
    });
    this.load.spritesheet('farm_horse_idle', '/assets/fauna/farm_horse_idle_strip.png', {
      frameWidth: 46,
      frameHeight: 39,
    });
    this.load.spritesheet('farm_horse_graze', '/assets/fauna/farm_horse_graze_strip.png', {
      frameWidth: 46,
      frameHeight: 39,
    });
    this.load.spritesheet('farm_cow_walk', '/assets/fauna/farm_cow_brown_walk_strip.png', {
      frameWidth: 40,
      frameHeight: 30,
    });
    this.load.spritesheet('farm_cow_idle', '/assets/fauna/farm_cow_brown_idle_strip.png', {
      frameWidth: 40,
      frameHeight: 30,
    });
    this.load.spritesheet('farm_cow_graze', '/assets/fauna/farm_cow_graze_strip.png', {
      frameWidth: 40,
      frameHeight: 30,
    });
    this.load.spritesheet('farm_sheep_walk', '/assets/fauna/farm_sheep_walk_strip.png', {
      frameWidth: 30,
      frameHeight: 24,
    });
    this.load.spritesheet('farm_sheep_idle', '/assets/fauna/farm_sheep_idle_strip.png', {
      frameWidth: 30,
      frameHeight: 24,
    });
    this.load.spritesheet('farm_sheep_graze', '/assets/fauna/farm_sheep_graze_strip.png', {
      frameWidth: 30,
      frameHeight: 24,
    });
    this.load.spritesheet('farm_pig_walk', '/assets/fauna/farm_pig_walk_strip.png', {
      frameWidth: 30,
      frameHeight: 23,
    });
    this.load.spritesheet('farm_pig_idle', '/assets/fauna/farm_pig_idle_strip.png', {
      frameWidth: 30,
      frameHeight: 23,
    });
    this.load.spritesheet('farm_chicken_walk', '/assets/fauna/farm_chicken_brown_walk_strip.png', {
      frameWidth: 18,
      frameHeight: 17,
    });
    this.load.spritesheet('farm_chicken_peck', '/assets/fauna/farm_chicken_brown_peck_strip.png', {
      frameWidth: 18,
      frameHeight: 17,
    });
    this.load.spritesheet('farm_chicken_idle', '/assets/fauna/farm_chicken_idle_strip.png', {
      frameWidth: 18,
      frameHeight: 17,
    });
    this.load.spritesheet('farm_duck_swim', '/assets/fauna/farm_duck_swim_strip.png', {
      frameWidth: 21,
      frameHeight: 17,
    });
    this.load.spritesheet('farm_duck_walk', '/assets/fauna/farm_duck_walk_strip.png', {
      frameWidth: 21,
      frameHeight: 17,
    });
    this.load.spritesheet('farm_frog_hop', '/assets/fauna/farm_frog_hop_strip.png', {
      frameWidth: 18,
      frameHeight: 18,
    });
    this.load.spritesheet('farm_frog_idle', '/assets/fauna/farm_frog_idle_strip.png', {
      frameWidth: 18,
      frameHeight: 18,
    });
    this.load.spritesheet('farm_butterfly_blue', '/assets/fauna/farm_butterfly_blue_strip.png', {
      frameWidth: 16,
      frameHeight: 13,
    });
    this.load.spritesheet('farm_butterfly_yellow', '/assets/fauna/farm_butterfly_yellow_strip.png', {
      frameWidth: 16,
      frameHeight: 13,
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
    this.createAnimations();
    this.extractPreviewImages();
    this.scene.start('WorldScene');
    this.scene.start('UIScene');
  }

  private extractPreviewImages(): void {
    const toDataUrl = (texKey: string, sx = 12, sy = 6, sw = 24, sh = 48): string => {
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

    gameState.malePreviewUrl = toDataUrl('character', 12, 6, 24, 48);
    gameState.femalePreviewUrl = toDataUrl('character_female', 12, 6, 24, 48) || gameState.malePreviewUrl;
  }

  private createAnimations(): void {
    // 48x64 Standard 16-Bit Keep Player Animations
    // Row 0: Idle Down (f0)
    // Row 1: Idle Up (f6)
    // Row 2: Idle Right (f12)
    // Row 3: Idle Left (f18)
    // Row 4: Walk Down (f24..29)
    // Row 5: Walk Up (f30..35)
    // Row 6: Walk Right (f36..41)
    // Row 7: Walk Left (f42..47)
    const charConfigs = [
      { name: 'down', walkStart: 24, walkEnd: 29, idleFrame: 0 },
      { name: 'up', walkStart: 30, walkEnd: 35, idleFrame: 6 },
      { name: 'right', walkStart: 36, walkEnd: 41, idleFrame: 12 },
      { name: 'left', walkStart: 42, walkEnd: 47, idleFrame: 18 },
    ];

    charConfigs.forEach(({ name, walkStart, walkEnd, idleFrame }) => {
      // Male / default
      if (!this.anims.exists(`walk-${name}`)) {
        this.anims.create({
          key: `walk-${name}`,
          frames: this.anims.generateFrameNumbers('character', { start: walkStart, end: walkEnd }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`walk-male-${name}`)) {
        this.anims.create({
          key: `walk-male-${name}`,
          frames: this.anims.generateFrameNumbers('character', { start: walkStart, end: walkEnd }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`idle-male-${name}`)) {
        this.anims.create({
          key: `idle-male-${name}`,
          frames: [{ key: 'character', frame: idleFrame }],
          frameRate: 1,
        });
      }
      if (!this.anims.exists(`idle-${name}`)) {
        this.anims.create({
          key: `idle-${name}`,
          frames: [{ key: 'character', frame: idleFrame }],
          frameRate: 1,
        });
      }

      // Female
      if (this.textures.exists('character_female')) {
        if (!this.anims.exists(`walk-female-${name}`)) {
          this.anims.create({
            key: `walk-female-${name}`,
            frames: this.anims.generateFrameNumbers('character_female', { start: walkStart, end: walkEnd }),
            frameRate: 8,
            repeat: -1,
          });
        }
        if (!this.anims.exists(`idle-female-${name}`)) {
          this.anims.create({
            key: `idle-female-${name}`,
            frames: [{ key: 'character_female', frame: idleFrame }],
            frameRate: 1,
          });
        }
      }
    });

    // NPC keep characters: walk-down and idle
    const npcKeepList = ['keep_monk', 'keep_noble', 'keep_king', 'keep_guard', 'keep_captain', 'keep_merchant', 'keep_farmer'];
    npcKeepList.forEach((k) => {
      if (this.textures.exists(k)) {
        if (!this.anims.exists(`${k}-walk-down`)) {
          this.anims.create({
            key: `${k}-walk-down`,
            frames: this.anims.generateFrameNumbers(k, { start: 24, end: 29 }),
            frameRate: 6,
            repeat: -1,
          });
        }
        if (!this.anims.exists(`${k}-idle-down`)) {
          this.anims.create({
            key: `${k}-idle-down`,
            frames: [{ key: k, frame: 0 }],
            frameRate: 1,
          });
        }
      }
    });

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

    // Fauna Animations
    // Horse
    if (this.textures.exists('farm_horse_walk') && !this.anims.exists('horse-walk')) {
      this.anims.create({
        key: 'horse-walk',
        frames: this.anims.generateFrameNumbers('farm_horse_walk', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_horse_idle') && !this.anims.exists('horse-idle')) {
      this.anims.create({
        key: 'horse-idle',
        frames: this.anims.generateFrameNumbers('farm_horse_idle', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_horse_graze') && !this.anims.exists('horse-graze')) {
      this.anims.create({
        key: 'horse-graze',
        frames: this.anims.generateFrameNumbers('farm_horse_graze', { start: 0, end: 7 }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Cow
    if (this.textures.exists('farm_cow_walk') && !this.anims.exists('cow-walk')) {
      this.anims.create({
        key: 'cow-walk',
        frames: this.anims.generateFrameNumbers('farm_cow_walk', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_cow_idle') && !this.anims.exists('cow-idle')) {
      this.anims.create({
        key: 'cow-idle',
        frames: this.anims.generateFrameNumbers('farm_cow_idle', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_cow_graze') && !this.anims.exists('cow-graze')) {
      this.anims.create({
        key: 'cow-graze',
        frames: this.anims.generateFrameNumbers('farm_cow_graze', { start: 0, end: 7 }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Sheep
    if (this.textures.exists('farm_sheep_walk') && !this.anims.exists('sheep-walk')) {
      this.anims.create({
        key: 'sheep-walk',
        frames: this.anims.generateFrameNumbers('farm_sheep_walk', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_sheep_idle') && !this.anims.exists('sheep-idle')) {
      this.anims.create({
        key: 'sheep-idle',
        frames: this.anims.generateFrameNumbers('farm_sheep_idle', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_sheep_graze') && !this.anims.exists('sheep-graze')) {
      this.anims.create({
        key: 'sheep-graze',
        frames: this.anims.generateFrameNumbers('farm_sheep_graze', { start: 0, end: 7 }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Pig
    if (this.textures.exists('farm_pig_walk') && !this.anims.exists('pig-walk')) {
      this.anims.create({
        key: 'pig-walk',
        frames: this.anims.generateFrameNumbers('farm_pig_walk', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_pig_idle') && !this.anims.exists('pig-idle')) {
      this.anims.create({
        key: 'pig-idle',
        frames: this.anims.generateFrameNumbers('farm_pig_idle', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Chicken
    if (this.textures.exists('farm_chicken_walk') && !this.anims.exists('chicken-walk')) {
      this.anims.create({
        key: 'chicken-walk',
        frames: this.anims.generateFrameNumbers('farm_chicken_walk', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_chicken_peck') && !this.anims.exists('chicken-peck')) {
      this.anims.create({
        key: 'chicken-peck',
        frames: this.anims.generateFrameNumbers('farm_chicken_peck', { start: 0, end: 5 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_chicken_idle') && !this.anims.exists('chicken-idle')) {
      this.anims.create({
        key: 'chicken-idle',
        frames: this.anims.generateFrameNumbers('farm_chicken_idle', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Duck
    if (this.textures.exists('farm_duck_swim') && !this.anims.exists('duck-swim')) {
      this.anims.create({
        key: 'duck-swim',
        frames: this.anims.generateFrameNumbers('farm_duck_swim', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_duck_walk') && !this.anims.exists('duck-walk')) {
      this.anims.create({
        key: 'duck-walk',
        frames: this.anims.generateFrameNumbers('farm_duck_walk', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1,
      });
    }

    // Frog
    if (this.textures.exists('farm_frog_hop') && !this.anims.exists('frog-hop')) {
      this.anims.create({
        key: 'frog-hop',
        frames: this.anims.generateFrameNumbers('farm_frog_hop', { start: 0, end: 6 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_frog_idle') && !this.anims.exists('frog-idle')) {
      this.anims.create({
        key: 'frog-idle',
        frames: this.anims.generateFrameNumbers('farm_frog_idle', { start: 0, end: 6 }),
        frameRate: 3,
        repeat: -1,
      });
    }

    // Butterflies
    if (this.textures.exists('farm_butterfly_blue') && !this.anims.exists('butterfly-blue-fly')) {
      this.anims.create({
        key: 'butterfly-blue-fly',
        frames: this.anims.generateFrameNumbers('farm_butterfly_blue', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_butterfly_yellow') && !this.anims.exists('butterfly-yellow-fly')) {
      this.anims.create({
        key: 'butterfly-yellow-fly',
        frames: this.anims.generateFrameNumbers('farm_butterfly_yellow', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }

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
