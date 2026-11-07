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

    // 2. Main Character Spritesheet (Strict 16x32 Steinzeit-Benchmark Standard)
    this.load.spritesheet('character', '/assets/gfx/character.png', {
      frameWidth: 16,
      frameHeight: 32,
    });

    // 3. Mentors & Historical Figures (16x32 Native Pixel Art Sheets)
    const mentorIds = [
      'npc_luther',
      'npc_cranach',
      'npc_cajetan',
      'npc_karl_v',
      'npc_junker_joerg',
      'npc_katharina',
      'npc_muentzer',
      'npc_friedrich',
      'npc_guard',
    ];
    for (const id of mentorIds) {
      this.load.spritesheet(id, `/assets/gfx/npcs/${id}.png`, {
        frameWidth: 16,
        frameHeight: 32,
      });
    }

    // 4. Fauna & Companion (16-Bit Living World Strips & Sheets)
    this.load.spritesheet('farm_dog_walk', '/assets/fauna/farm_dog_walk_strip.png', {
      frameWidth: 26,
      frameHeight: 21,
    });
    this.load.spritesheet('farm_dog_idle', '/assets/fauna/farm_dog_idle_strip.png', {
      frameWidth: 26,
      frameHeight: 21,
    });
    this.load.spritesheet('farm_cat_walk', '/assets/fauna/farm_cat_walk_strip.png', {
      frameWidth: 22,
      frameHeight: 21,
    });
    this.load.spritesheet('farm_cat_idle', '/assets/fauna/farm_cat_idle_strip.png', {
      frameWidth: 22,
      frameHeight: 21,
    });
    this.load.spritesheet('pigeon_peck', '/assets/fauna/cafe_pigeon_pecking_strip.png', {
      frameWidth: 13,
      frameHeight: 11,
    });
    this.load.spritesheet('pigeon_white_peck', '/assets/fauna/cafe_pigeon_white_pecking_strip.png', {
      frameWidth: 13,
      frameHeight: 11,
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
    this.load.spritesheet('farm_butterfly_pink', '/assets/fauna/farm_butterfly_pink_strip.png', {
      frameWidth: 16,
      frameHeight: 13,
    });

    // 5. Authentic 16-Bit Props, Buildings & Town Architecture
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
      'barrel_apples',
      'barrel_water',
      'crates',
      'crate_big',
      'crate_apples',
      'crate_cabbage',
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
      'flowerbed_blue',
      'flowerbed_red',
      'flowerbed_violet',
      'lantern_post',
      'lantern_post_double',
      'village_stone_well_prop',
      'sign_shop',
      'sign_inn',
      'sign_smith',
      'signpost',
      'keep_market',
    ];
    for (const p of props) {
      this.load.image(p, `/assets/props/${p}.png`);
    }

    // 6. Interior Animated Strips
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

    // 7. Relic icons
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

  /**
   * Erzeugt aus dem 16x32 Charakter-Spritesheet eine unterscheidbare weibliche Spielfigur
   * (Steinzeit-Benchmark: türkis-blaues Gewand, längere Haare/Zöpfe und goldenes Stirnband).
   */
  private createFemaleCharacterSheet(): void {
    const src = this.textures.get('character').getSourceImage() as HTMLImageElement;
    const w = src.width;
    const h = src.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(src, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    // Rote Tunika-Pixel in ein warmes Renaissance-Türkis-Blau umfärben
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

    // Für die 4 Lauf-Reihen (down=0, right=1, up=2, left=3) je Frame lange Zöpfe & Stirnband ergänzen
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const fx = col * 16;
        const fy = row * 32;
        // Goldenes Stirnband / Kanzleihaarschmuck
        ctx.fillStyle = '#f2c94c';
        ctx.fillRect(fx + 5, fy + 9, 6, 1);
        // Kastanienbraune Zöpfe über die Schultern
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
  }

  private extractPreviewImages(): void {
    const toDataUrl = (texKey: string, sx = 0, sy = 6, sw = 16, sh = 26): string => {
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

    gameState.malePreviewUrl = toDataUrl('character', 0, 6, 16, 26);
    gameState.femalePreviewUrl = toDataUrl('character_female', 0, 6, 16, 26) || gameState.malePreviewUrl;
  }

  private createAnimations(): void {
    // ----------------------------------------------------
    // 1. Spielfigur 16x32 (Steinzeit-Benchmark: 17 Spalten x 8 Zeilen)
    // ----------------------------------------------------
    const dirs = ['down', 'right', 'up', 'left'];
    dirs.forEach((dir, row) => {
      const start = row * 17;

      // Male animations & default fallbacks
      this.anims.create({
        key: `walk-male-${dir}`,
        frames: this.anims.generateFrameNumbers('character', { start, end: start + 3 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `idle-male-${dir}`,
        frames: [{ key: 'character', frame: start }],
        frameRate: 1,
      });
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers('character', { start, end: start + 3 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `idle-${dir}`,
        frames: [{ key: 'character', frame: start }],
        frameRate: 1,
      });

      // Female animations
      if (this.textures.exists('character_female')) {
        this.anims.create({
          key: `walk-female-${dir}`,
          frames: this.anims.generateFrameNumbers('character_female', { start, end: start + 3 }),
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `idle-female-${dir}`,
          frames: [{ key: 'character_female', frame: start }],
          frameRate: 1,
        });
      }
    });

    // ----------------------------------------------------
    // 2. Mentoren & Historische Persönlichkeiten (16x32)
    // ----------------------------------------------------
    // 272x256 Sheets (17 Spalten pro Zeile)
    const wideNpcs = ['npc_luther', 'npc_junker_joerg'];
    wideNpcs.forEach((id) => {
      if (this.textures.exists(id)) {
        dirs.forEach((dir, row) => {
          const start = row * 17;
          this.anims.create({
            key: `${id}-walk-${dir}`,
            frames: this.anims.generateFrameNumbers(id, { start, end: start + 3 }),
            frameRate: 6,
            repeat: -1,
          });
          this.anims.create({
            key: `${id}-idle-${dir}`,
            frames: [{ key: id, frame: start }],
            frameRate: 1,
          });
        });
        this.anims.create({
          key: `${id}-idle`,
          frames: [{ key: id, frame: 0 }],
          frameRate: 1,
        });
      }
    });

    // 64x128 Sheets (4 Spalten x 4 Zeilen: 0=down, 4=right, 8=up, 12=left)
    const standardNpcs = ['npc_cranach', 'npc_cajetan', 'npc_karl_v', 'npc_katharina', 'npc_muentzer', 'npc_friedrich', 'npc_guard'];
    standardNpcs.forEach((id) => {
      if (this.textures.exists(id)) {
        dirs.forEach((dir, row) => {
          const start = row * 4;
          this.anims.create({
            key: `${id}-walk-${dir}`,
            frames: this.anims.generateFrameNumbers(id, { start, end: start + 3 }),
            frameRate: 6,
            repeat: -1,
          });
          this.anims.create({
            key: `${id}-idle-${dir}`,
            frames: [{ key: id, frame: start }],
            frameRate: 1,
          });
        });
        this.anims.create({
          key: `${id}-idle`,
          frames: [{ key: id, frame: 0 }],
          frameRate: 1,
        });
      }
    });

    // ----------------------------------------------------
    // 3. Fauna & Tier-Animationen
    // ----------------------------------------------------
    // Stadt-Tauben (Marktplatz Wittenberg: 16 Frames pro 208x11 Streifen à 13x11px)
    if (this.textures.exists('pigeon_peck')) {
      this.anims.create({
        key: 'pigeon-peck',
        frames: this.anims.generateFrameNumbers('pigeon_peck', { start: 0, end: 15 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (this.textures.exists('pigeon_white_peck')) {
      this.anims.create({
        key: 'pigeon-white-peck',
        frames: this.anims.generateFrameNumbers('pigeon_white_peck', { start: 0, end: 15 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Hofkatzen
    if (this.textures.exists('farm_cat_idle')) {
      this.anims.create({
        key: 'cat-idle',
        frames: this.anims.generateFrameNumbers('farm_cat_idle', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (this.textures.exists('farm_cat_walk')) {
      this.anims.create({
        key: 'cat-walk',
        frames: this.anims.generateFrameNumbers('farm_cat_walk', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Hofhund
    if (this.textures.exists('farm_dog_walk') && !this.anims.exists('dog-walk')) {
      this.anims.create({
        key: 'dog-walk',
        frames: this.anims.generateFrameNumbers('farm_dog_walk', { start: 0, end: 5 }),
        frameRate: 8,
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

    // Pferd
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

    // Kuh
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

    // Schaf
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

    // Schwein
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

    // Huhn
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

    // Ente
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

    // Frosch
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

    // Schmetterlinge
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
    if (this.textures.exists('farm_butterfly_pink') && !this.anims.exists('butterfly-pink-fly')) {
      this.anims.create({
        key: 'butterfly-pink-fly',
        frames: this.anims.generateFrameNumbers('farm_butterfly_pink', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    // ----------------------------------------------------
    // 4. Innenraum & Deko-Animationen
    // ----------------------------------------------------
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
