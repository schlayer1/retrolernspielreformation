import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { REFORMATION_CHAPTERS, ChapterData } from '../data/chapters';
import { REFORMATION_ITEMS, ReformationItemId } from '../data/items';
import { REFORMATION_RELICS, ReformationRelic } from '../data/relics';
import { REFORMATION_DECOR, RESOURCE_NODES, DecorObject, ResourceNode } from '../data/decor';
import { gameState } from '../systems/GameState';
import { WildlifeManager } from '../world/Wildlife';
import { LivingWorldManager } from '../world/LivingWorldManager';
import { ChapterBanner } from '../ui/ChapterBanner';
import { CompanionManager } from '../world/Companion';

export interface InteractiveTarget {
  id: string;
  kind: 'mentor' | 'resource' | 'relic' | 'station' | 'companion';
  name: string;
  sub: string;
  x: number;
  y: number;
  minChapter: number;
  itemId?: ReformationItemId;
  relic?: ReformationRelic;
  stationId?: string;
  questChapter?: number;
  questObjectiveIndex?: number;
  questMessage?: string;
  actionTip?: string;
  discovered?: boolean;
  nodeDef?: ResourceNode;
}

export class WorldScene extends Phaser.Scene {
  public mapW = 100;
  public mapH = 80;
  public player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  private targets: InteractiveTarget[] = [];
  private activeTarget: InteractiveTarget | null = null;
  private labelDiv: HTMLElement | null = null;

  public wildlifeManager!: WildlifeManager;
  public livingWorldManager!: LivingWorldManager;
  public chapterBanner!: ChapterBanner;
  public companionManager!: CompanionManager;

  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private lastBannerChapter = -1;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    // 1. Bake Per-Pixel Multi-Biome Ground with 4x4 Bayer Dithering
    this.bakeReformationTerrainTexture();
    this.add.image(0, 0, 'reformation_baked_ground').setOrigin(0, 0).setDepth(0);

    // 2. Initialize Subsystems
    this.wildlifeManager = new WildlifeManager(this);
    this.livingWorldManager = new LivingWorldManager(this);
    this.chapterBanner = new ChapterBanner();
    this.companionManager = new CompanionManager(this);

    // 3. Dense Ground Flora Scattering
    this.scatterGroundFlora();

    // 4. Place Static Decor & Architecture
    this.placeWorldDecor();

    // 5. Place Resource Hotspots
    this.placeResourceNodes();

    // 6. Setup Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    // 7. Spawn Player
    this.player = this.add.sprite(gameState.playerX, gameState.playerY, 'character', 0);
    this.player.setOrigin(0.5, 0.9);
    this.player.setScale(1.0);
    this.player.setDepth(this.player.y);

    // 8. Setup Camera
    this.cameras.main.setBounds(0, 0, this.mapW * 16, this.mapH * 16);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.2);

    // 9. Companion Unlock (Luthers Hund Tölpel)
    this.companionManager.unlock(this.player.x - 20, this.player.y);

    // 10. Setup Interactive Targets & Mentors
    this.setupTargets();
    this.initInteractionLabel();

    // Expose interaction trigger globally for DOM label click & UI scene
    (window as any).__triggerInteraction = () => this.triggerInteraction();

    // 11. Init Wildlife & Living World
    this.wildlifeManager.init();
    this.livingWorldManager.initWaterEffects(48 * 16, 52 * 16, 4 * 16, 76 * 16);

    // 12. Fire & Smoke
    this.livingWorldManager.registerFireSource(48 * 16, 24 * 16, true, 28, 0xffa533); // Cranach Presse
    this.livingWorldManager.registerFireSource(26 * 16, 68 * 16, true, 32, 0xff7722); // Wartburg Kamin
    this.livingWorldManager.registerFireSource(72 * 16, 42 * 16, false, 20, 0xffaa44); // Tetzel Kanzel

    // 13. First Chapter Banner
    this.lastBannerChapter = gameState.chapter;
    const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
    if (curCh) {
      this.chapterBanner.show({
        chapterNumber: curCh.number,
        title: curCh.title,
        subtitle: `${curCh.year} · ${curCh.location}`,
      });
    }

    // 14. Start BGM
    sound.startBGM(gameState.chapter);
  }

  private bakeReformationTerrainTexture(): void {
    const W = this.mapW * 16;
    const H = this.mapH * 16;

    const canvasTex = this.textures.createCanvas('reformation_baked_ground', W, H);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();
    const imgData = ctx.createImageData(W, H);
    const dst = imgData.data;

    // 1. Source Image Data from ground_med_a2 or ground_a2
    const groundKey = this.textures.exists('ground_med_a2') ? 'ground_med_a2' : 'ground_a2';
    const srcTex = this.textures.get(groundKey).getSourceImage() as HTMLImageElement;
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = srcTex.width;
    srcCanvas.height = srcTex.height;
    const sctx = srcCanvas.getContext('2d')!;
    sctx.drawImage(srcTex, 0, 0);
    const srcData = sctx.getImageData(0, 0, srcTex.width, srcTex.height).data;
    const sw = srcTex.width;

    // 2. Source Image Data from Overworld (Classic 16-Bit SNES Water tile at 48,48)
    const owTex = this.textures.get('Overworld').getSourceImage() as HTMLImageElement;
    const owCanvas = document.createElement('canvas');
    owCanvas.width = owTex.width;
    owCanvas.height = owTex.height;
    const owctx = owCanvas.getContext('2d')!;
    owctx.drawImage(owTex, 0, 0);
    const owData = owctx.getImageData(0, 0, owTex.width, owTex.height).data;
    const oww = owTex.width;

    // In RPG Maker MV A2 (768x576, 8x4 Blöcke à 96x144) liegt die 100% nahtlose
    // 48x48-Innenkachel jedes Blocks exakt bei (bx*96 + 24, by*144 + 72).
    const sampleBlock = (bx: number, by: number, x: number, y: number): [number, number, number] => {
      const u = ((x % 48) + 48) % 48;
      const v = ((y % 48) + 48) % 48;
      const sx = bx * 96 + 24 + u;
      const sy = by * 144 + 72 + v;
      const idx = (sy * sw + sx) * 4;
      return [srcData[idx], srcData[idx + 1], srcData[idx + 2]];
    };

    const sampleWater = (x: number, y: number): [number, number, number] => {
      const u = ((x % 16) + 16) % 16;
      const v = ((y % 16) + 16) % 16;
      const sx = 48 + u;
      const sy = 48 + v;
      const idx = (sy * oww + sx) * 4;
      return [owData[idx], owData[idx + 1], owData[idx + 2]];
    };

    const bayer4x4 = [
      [0 / 16, 8 / 16, 2 / 16, 10 / 16],
      [12 / 16, 4 / 16, 14 / 16, 6 / 16],
      [3 / 16, 11 / 16, 1 / 16, 9 / 16],
      [15 / 16, 7 / 16, 13 / 16, 5 / 16],
    ];

    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        const tx = x / 16;
        const ty = y / 16;
        const dither = bayer4x4[Math.floor(y / 2) % 4][Math.floor(x / 2) % 4] - 0.5;

        // River Elbe curve: tx around 50 + sin wave
        const riverCenter = 50 + Math.sin(ty * 0.08) * 3.5;
        const distRiver = Math.abs(tx - riverCenter);

        // Bridges: Marktbrücke at y: 22..25, Südsteg at y: 56..59
        const isBridge = distRiver < 2.8 && ((ty >= 22 && ty <= 25) || (ty >= 56 && ty <= 59));

        // Roads
        const dWittenbergRoad = this.distToSegment(tx, ty, 22, 24, 50, 24);
        const dAugsburgRoad = this.distToSegment(tx, ty, 50, 24, 76, 24);
        const dWartburgRoad = this.distToSegment(tx, ty, 22, 24, 26, 72);
        const dPeasantRoad = this.distToSegment(tx, ty, 26, 72, 60, 74);
        const minRoadDist = Math.min(dWittenbergRoad, dAugsburgRoad, dWartburgRoad, dPeasantRoad);

        // Cobblestone plazas: Wittenberg market & Augsburg hall
        const inWittenbergPlaza = tx >= 16 && tx <= 32 && ty >= 14 && ty <= 30;
        const inAugsburgPlaza = tx >= 68 && tx <= 84 && ty >= 14 && ty <= 28;
        const inWartburgCourt = tx >= 20 && tx <= 32 && ty >= 68 && ty <= 82;

        let bx = 1;
        let by = 1;
        let isWater = false;
        let isBridgePlank = false;

        if (isBridge) {
          isBridgePlank = true;
        } else if (distRiver < 1.8) {
          isWater = true;
        } else if (distRiver < 2.8 + dither * 0.6) {
          bx = 2; // Sandbank
          by = 1;
        } else if (inWittenbergPlaza || inAugsburgPlaza || inWartburgCourt) {
          bx = 1; // Pflasterstein
          by = 2;
        } else if (minRoadDist < 1.5 + dither * 0.4) {
          bx = 1; // Feldweg
          by = 0;
        } else {
          // Thüringer Wald & sächsische Auen
          const wave = Math.sin(x * 0.02 + y * 0.02) * 0.5 + Math.cos(x * 0.015 - y * 0.02) * 0.5;
          if (wave + dither * 0.5 > 0.3) {
            bx = 0; // Waldgras
            by = 1;
          } else {
            bx = 1; // Sommerwiese
            by = 1;
          }
        }

        for (let py = y; py < y + 2 && py < H; py++) {
          for (let px = x; px < x + 2 && px < W; px++) {
            let r: number, g: number, b: number;
            if (isBridgePlank) {
              const plankPattern = (px + (py % 4 === 0 ? 1 : 0)) % 6 === 0 ? 112 : 144;
              r = plankPattern;
              g = Math.round(plankPattern * 0.72);
              b = Math.round(plankPattern * 0.44);
            } else if (isWater) {
              [r, g, b] = sampleWater(px, py);
            } else {
              [r, g, b] = sampleBlock(bx, by, px, py);
            }

            const oi = (py * W + px) * 4;
            dst[oi] = r;
            dst[oi + 1] = g;
            dst[oi + 2] = b;
            dst[oi + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvasTex.refresh();
  }

  private distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  public scatterGroundFlora(): void {
    const atlas = this.textures.get('world_atlas');
    const floraFrames = ['flower_red', 'flower_blue', 'flower_yellow', 'mushroom_brown', 'grass_tuft', 'pebble_small'];
    const validFrames = floraFrames.filter((f) => this.textures.get('world_atlas')?.has(f));

    const count = 140;
    for (let i = 0; i < count; i++) {
      const tx = Phaser.Math.Between(4, this.mapW - 5);
      const ty = Phaser.Math.Between(4, this.mapH - 5);
      const frameKey = validFrames.length > 0 ? Phaser.Math.RND.pick(validFrames) : undefined;

      if (frameKey && this.textures.get('world_atlas')?.has(frameKey)) {
        const flora = this.add.image(tx * 16, ty * 16, 'world_atlas', frameKey).setOrigin(0.5, 0.8).setDepth(ty * 16 - 2);
        this.livingWorldManager.registerFlora(flora);
      }
    }
  }

  private placeWorldDecor(): void {
    for (const d of REFORMATION_DECOR) {
      if (this.textures.exists(d.spriteKey)) {
        const sp = this.add.image(d.x, d.y, d.spriteKey).setOrigin(0.5, 0.9).setScale(d.scale || 1.0).setDepth(d.y);
      }
    }
  }

  private placeResourceNodes(): void {
    for (const n of RESOURCE_NODES) {
      if (this.textures.exists(n.spriteKey)) {
        const sp = this.add.image(n.x, n.y, n.spriteKey).setOrigin(0.5, 0.85).setScale(0.85).setDepth(n.y);
        this.livingWorldManager.registerResourceHotspot(n.x, n.y);
      }
    }
  }

  private setupTargets(): void {
    this.targets = [];

    // 1. Mentors aus chapters.ts
    for (const ch of REFORMATION_CHAPTERS) {
      const m = ch.mentor;
      if (this.textures.exists(m.spriteKey)) {
        const sp = this.add.sprite(m.x, m.y, m.spriteKey, 0).setOrigin(0.5, 0.9).setDepth(m.y);
        this.targets.push({
          id: `mentor_${ch.id}`,
          kind: 'mentor',
          name: m.name,
          sub: m.role,
          x: m.x,
          y: m.y,
          minChapter: ch.id,
          actionTip: '[E] Sprechen',
        });
      }
    }

    // 2. Relikte / Leitfunde
    for (const r of REFORMATION_RELICS) {
      const glow = this.add.image(r.x, r.y, 'relic_marker_glow').setOrigin(0.5, 0.5).setDepth(r.y).setScale(0.8);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.4, to: 0.9 },
        scale: { from: 0.75, to: 0.9 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });

      this.targets.push({
        id: `relic_${r.id}`,
        kind: 'relic',
        name: r.name,
        sub: `${r.year} · ${r.epoch}`,
        x: r.x,
        y: r.y,
        minChapter: 1,
        relic: r,
        actionTip: '[E] Bergen & Prüfen',
      });
    }

    // 3. Rohstoff-Knoten
    for (const n of RESOURCE_NODES) {
      this.targets.push({
        id: `node_${n.id}`,
        kind: 'resource',
        name: n.name,
        sub: n.description,
        x: n.x,
        y: n.y,
        minChapter: 1,
        nodeDef: n,
        actionTip: '[E] Sammeln',
      });
    }
  }

  private initInteractionLabel(): void {
    if (this.labelDiv) return;
    this.labelDiv = document.createElement('div');
    this.labelDiv.id = 'world-dom-label';
    this.labelDiv.className = 'world-dom-label';
    this.labelDiv.style.display = 'none';
    this.labelDiv.addEventListener('click', () => this.triggerInteraction());
    document.body.appendChild(this.labelDiv);
  }

  update(time: number, delta: number): void {
    // 1. Movement Handling
    let vx = 0;
    let vy = 0;
    const speed = 110;

    const tc = (window as any).__touchControls;
    if (tc && (tc.dx !== 0 || tc.dy !== 0)) {
      vx = tc.dx * speed;
      vy = tc.dy * speed;
    } else if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= speed;
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx += speed;
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= speed;
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy += speed;
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    const nextX = Phaser.Math.Clamp(this.player.x + (vx * delta) / 1000, 24, this.mapW * 16 - 24);
    const nextY = Phaser.Math.Clamp(this.player.y + (vy * delta) / 1000, 24, this.mapH * 16 - 24);

    if (vx !== 0 || vy !== 0) {
      this.player.x = nextX;
      this.player.y = nextY;
      this.player.setDepth(this.player.y);

      gameState.playerX = this.player.x;
      gameState.playerY = this.player.y;
      gameState.walkedDistanceMeters += Math.hypot(vx, vy) * (delta / 1000) * 0.05;

      // Surface detection for footsteps
      let surface: 'stone' | 'dirt' | 'grass' | 'wood' = 'grass';
      const tx = this.player.x / 16;
      const ty = this.player.y / 16;
      if ((tx >= 16 && tx <= 32 && ty >= 14 && ty <= 30) || (tx >= 68 && tx <= 84 && ty >= 14 && ty <= 28)) {
        surface = 'stone';
      } else if (tx >= 20 && tx <= 32 && ty >= 68 && ty <= 82) {
        surface = 'wood';
      }
      sound.footstep(surface);

      // Facing
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
        this.player.setFlipX(vx < 0);
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
    }

    // 2. Proximity Check (< 44px)
    this.updateProximityLabel();

    // 3. Subsystem Updates
    this.wildlifeManager.update(delta, this.player.x, this.player.y);
    this.livingWorldManager.update(delta);
    this.companionManager.update(this.player, this.targets, delta);

    // 4. Chapter Change Banner
    if (gameState.chapter !== this.lastBannerChapter) {
      this.lastBannerChapter = gameState.chapter;
      const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
      if (curCh) {
        this.chapterBanner.show({
          chapterNumber: curCh.number,
          title: curCh.title,
          subtitle: `${curCh.year} · ${curCh.location}`,
        });
        sound.startBGM(curCh.number);
      }
    }

    // 5. Input Check for [E] / Space
    const justPressedE =
      (this.wasd?.E && Phaser.Input.Keyboard.JustDown(this.wasd.E)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
      tc?.actionPressed;

    if (justPressedE && this.activeTarget) {
      if (tc) tc.actionPressed = false;
      this.triggerInteraction();
    }
  }

  private updateProximityLabel(): void {
    if (!this.labelDiv) return;

    let closest: InteractiveTarget | null = null;
    let minDist = 44; // Strikte Single-Proximity Grenze (< 44px)

    for (const t of this.targets) {
      if (t.minChapter > gameState.chapter) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    }

    this.activeTarget = closest;

    if (closest) {
      const cam = this.cameras.main;
      const screenX = (closest.x - cam.scrollX) * cam.zoom + cam.width / 2;
      const screenY = (closest.y - cam.scrollY) * cam.zoom + cam.height / 2 - 28;

      this.labelDiv.innerHTML = `<strong>${closest.name}</strong><br/><span style="font-size:10px; color:#fbbf24;">${closest.actionTip || '[E] Interagieren'}</span>`;
      this.labelDiv.style.left = `${screenX}px`;
      this.labelDiv.style.top = `${screenY}px`;
      this.labelDiv.style.display = 'block';
    } else {
      this.labelDiv.style.display = 'none';
    }
  }

  private triggerInteraction(): void {
    if (!this.activeTarget) return;
    const t = this.activeTarget;
    sound.click();

    const uiScene = this.scene.get('UIScene') as any;
    if (!uiScene) return;

    if (t.kind === 'mentor') {
      const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
      if (curCh) {
        uiScene.openMentorDialog(curCh.mentor);
        gameState.completeObjective(curCh.number, 0);
      }
    } else if (t.kind === 'relic' && t.relic) {
      uiScene.openRelicModal(t.relic);
    } else if (t.kind === 'resource' && t.nodeDef) {
      gameState.addItem(t.nodeDef.lootItem as ReformationItemId, t.nodeDef.lootCount);
      uiScene.showToast(`+${t.nodeDef.lootCount} ${t.nodeDef.name} gesammelt!`);
      sound.questStep();
    }
  }
}
