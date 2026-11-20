import Phaser from 'phaser';
import { gameState } from '../systems/GameState';
import { sound } from '../audio/sound';
import { REFORMATION_CHAPTERS } from '../data/chapters';

export type InteriorRoomId =
  | 'lutherstube_wittenberg'
  | 'cranach_werkstatt_druckerei'
  | 'fuggerpalais_augsburg'
  | 'reichstagssaal_worms'
  | 'wartburg_stube'
  | 'schlosskirche_portal'
  | 'bauernrat_stube'
  | 'rathaus_friedenssaal';

export interface InteriorInitData {
  buildingId?: InteriorRoomId;
  roomId?: InteriorRoomId;
  buildingName?: string;
  title?: string;
  subtitle?: string;
  returnX?: number;
  returnY?: number;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  tip: string;
  action: () => void;
}

interface RoomTheme {
  title: string;
  subtitle: string;
  chapterId: number;
  wallCols: [number, number, number]; // 3 rows tall (top, mid, baseboard)
  hasWindows: boolean;
  floorBlock: [[number, number], [number, number]];
  carpetRunner: boolean;
  ambientTint: number;
  props: {
    key: string;
    dx: number;
    dy: number;
    scale?: number;
    solid?: boolean;
    anim?: string;
    glow?: boolean;
  }[];
  extras: {
    kind: 'station' | 'relic' | 'lexicon' | 'craft' | 'dilemma';
    dx: number;
    dy: number;
    label: string;
    tip: string;
    targetId?: string;
  }[];
}

const ROOM_THEMES: Record<InteriorRoomId, RoomTheme> = {
  schlosskirche_portal: {
    title: 'Schlosskirche Allerheiligen',
    subtitle: 'Wittenberg 1517 · Altarraum & Thesen-Archiv',
    chapterId: 1,
    wallCols: [11, 27, 43],
    hasWindows: true,
    floorBlock: [
      [540, 541],
      [556, 557],
    ],
    carpetRunner: true,
    ambientTint: 0xffd27a,
    props: [
      { key: 'table', dx: 176, dy: 66, scale: 0.95, solid: true },
      { key: 'book_open', dx: 176, dy: 56, scale: 1.0, glow: true },
      { key: 'bookcase_narrow', dx: 48, dy: 64, scale: 0.95, solid: true },
      { key: 'bookcase_narrow', dx: 304, dy: 64, scale: 0.95, solid: true },
      { key: 'banner_stand', dx: 120, dy: 68, scale: 0.95, solid: false },
      { key: 'banner_stand', dx: 232, dy: 68, scale: 0.95, solid: false },
      { key: 'monastery_book_lectern', dx: 266, dy: 112, scale: 0.95, solid: true },
      { key: 'bench', dx: 88, dy: 128, scale: 0.9, solid: true },
      { key: 'bench', dx: 264, dy: 148, scale: 0.9, solid: true },
      { key: 'candle_lit', dx: 162, dy: 52, anim: 'candle-lit-anim', glow: true },
      { key: 'candle_lit', dx: 190, dy: 52, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'relic', dx: 266, dy: 120, label: 'Handschrift: Die 95 Thesen', tip: '[E] Quelle prüfen', targetId: 'thesen_95' },
      { kind: 'lexicon', dx: 48, dy: 72, label: 'Kirchenbibliothek', tip: '[E] Lexikon öffnen' },
    ],
  },
  cranach_werkstatt_druckerei: {
    title: 'Lucas Cranachs Hofatelier & Druckerei',
    subtitle: 'Wittenberg 1518 · Offizin, Setzkasten & Presse',
    chapterId: 2,
    wallCols: [10, 26, 42],
    hasWindows: true,
    floorBlock: [
      [442, 443],
      [458, 459],
    ],
    carpetRunner: false,
    ambientTint: 0xffa84c,
    props: [
      { key: 'hearth_fire', dx: 72, dy: 56, anim: 'hearth-fire', glow: true, solid: true },
      { key: 'bookcase', dx: 296, dy: 64, scale: 0.95, solid: true },
      { key: 'monastery_scriptorium_desk', dx: 244, dy: 108, scale: 1.0, solid: true },
      { key: 'table', dx: 108, dy: 122, scale: 1.0, solid: true },
      { key: 'anvil', dx: 54, dy: 118, scale: 0.95, solid: true },
      { key: 'crate_big', dx: 298, dy: 124, scale: 0.9, solid: true },
      { key: 'barrel', dx: 316, dy: 156, scale: 0.9, solid: true },
      { key: 'book_pile', dx: 112, dy: 112, scale: 0.95 },
      { key: 'candle_lit', dx: 244, dy: 96, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'station', dx: 244, dy: 118, label: 'Cranachs Buchdruckerpresse', tip: '[E] Station starten', targetId: 'station_druckerei' },
      { kind: 'relic', dx: 108, dy: 132, label: 'Birnbaum-Druckstock (1518)', tip: '[E] Quelle inspizieren', targetId: 'druckerplatte_cranach' },
      { kind: 'craft', dx: 54, dy: 128, label: 'Werkbank & Schwärze', tip: '[E] Herstellen' },
    ],
  },
  fuggerpalais_augsburg: {
    title: 'Audienzsaal des Fuggerpalais',
    subtitle: 'Augsburg 1518 · Vor Kardinal Cajetan',
    chapterId: 3,
    wallCols: [384, 400, 416],
    hasWindows: true,
    floorBlock: [
      [498, 499],
      [514, 515],
    ],
    carpetRunner: true,
    ambientTint: 0xffd066,
    props: [
      { key: 'armchair_green', dx: 176, dy: 64, scale: 1.05, solid: true },
      { key: 'banner_wall', dx: 136, dy: 44, scale: 0.95 },
      { key: 'banner_wall', dx: 216, dy: 44, scale: 0.95 },
      { key: 'bookcase', dx: 48, dy: 64, scale: 0.95, solid: true },
      { key: 'bookcase', dx: 304, dy: 64, scale: 0.95, solid: true },
      { key: 'monastery_book_lectern', dx: 256, dy: 116, scale: 0.95, solid: true },
      { key: 'castle_chest_wood', dx: 70, dy: 142, scale: 0.9, solid: true },
      { key: 'coin_sparkle', dx: 70, dy: 128, anim: 'coin-sparkle-anim' },
      { key: 'armchair_green', dx: 116, dy: 108, scale: 0.95, solid: true },
      { key: 'candle_lit', dx: 150, dy: 56, anim: 'candle-lit-anim', glow: true },
      { key: 'candle_lit', dx: 202, dy: 56, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'station', dx: 256, dy: 126, label: 'Cajetans Disputationstafel', tip: '[E] Streitgespräch', targetId: 'station_verhoer' },
      { kind: 'dilemma', dx: 116, dy: 120, label: 'Gewissen vs. Autorität', tip: '[E] Dilemma öffnen' },
    ],
  },
  reichstagssaal_worms: {
    title: 'Kaiserlicher Reichstagssaal zu Worms',
    subtitle: 'Worms 1521 · Vor Kaiser Karl V. und den Reichsständen',
    chapterId: 4,
    wallCols: [384, 400, 416],
    hasWindows: true,
    floorBlock: [
      [468, 469],
      [484, 485],
    ],
    carpetRunner: true,
    ambientTint: 0xffc864,
    props: [
      { key: 'armchair_green', dx: 176, dy: 64, scale: 1.08, solid: true },
      { key: 'armor_stand', dx: 132, dy: 66, scale: 0.95, solid: true },
      { key: 'armor_stand', dx: 220, dy: 66, scale: 0.95, solid: true },
      { key: 'banner_stand', dx: 52, dy: 72, scale: 0.95 },
      { key: 'banner_stand', dx: 300, dy: 72, scale: 0.95 },
      { key: 'table_map', dx: 266, dy: 124, scale: 0.95, solid: true },
      { key: 'monastery_book_lectern', dx: 86, dy: 120, scale: 0.95, solid: true },
      { key: 'candle_lit', dx: 152, dy: 54, anim: 'candle-lit-anim', glow: true },
      { key: 'candle_lit', dx: 200, dy: 54, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'dilemma', dx: 266, dy: 134, label: 'Wormser Edikt & Reichsacht', tip: '[E] Dilemma abwägen' },
      { kind: 'lexicon', dx: 86, dy: 128, label: 'Reichstags-Protokoll', tip: '[E] Lexikon öffnen' },
    ],
  },
  wartburg_stube: {
    title: 'Luthers Schreibstube auf der Wartburg',
    subtitle: 'Eisenach 1521/22 · Das Septembertestament entsteht',
    chapterId: 5,
    wallCols: [386, 402, 418],
    hasWindows: true,
    floorBlock: [
      [564, 565],
      [580, 581],
    ],
    carpetRunner: false,
    ambientTint: 0xff9a44,
    props: [
      { key: 'hearth_fire', dx: 76, dy: 56, anim: 'hearth-fire', glow: true, solid: true },
      { key: 'dog_sleeping', dx: 76, dy: 92, anim: 'dog-sleeping-anim' },
      { key: 'monastery_scriptorium_desk', dx: 256, dy: 108, scale: 1.0, solid: true },
      { key: 'monastery_book_lectern', dx: 112, dy: 124, scale: 0.95, solid: true },
      { key: 'bookcase', dx: 298, dy: 64, scale: 0.95, solid: true },
      { key: 'bedroll_red', dx: 54, dy: 150, scale: 0.95, solid: true },
      { key: 'book_open', dx: 254, dy: 96, scale: 0.95 },
      { key: 'candle_lit', dx: 262, dy: 92, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'station', dx: 256, dy: 118, label: 'Sprachlabor „Volk aufs Maul schauen“', tip: '[E] Übersetzen', targetId: 'station_schreibstube' },
      { kind: 'relic', dx: 112, dy: 134, label: 'Septembertestament (1522)', tip: '[E] Quelle prüfen', targetId: 'septembertestament' },
      { kind: 'lexicon', dx: 298, dy: 76, label: 'Studier-Regal', tip: '[E] Lexikon öffnen' },
    ],
  },
  lutherstube_wittenberg: {
    title: 'Schwarzes Kloster · Lutherstube & Brauküche',
    subtitle: 'Wittenberg 1525 · Hauswirtschaft Katharina von Boras',
    chapterId: 6,
    wallCols: [386, 402, 418],
    hasWindows: true,
    floorBlock: [
      [434, 435],
      [450, 451],
    ],
    carpetRunner: false,
    ambientTint: 0xffb860,
    props: [
      { key: 'hearth_fire', dx: 74, dy: 56, anim: 'hearth-fire', glow: true, solid: true },
      { key: 'cauldron', dx: 116, dy: 88, anim: 'cauldron-anim', solid: true },
      { key: 'bookcase', dx: 298, dy: 64, scale: 0.95, solid: true },
      { key: 'table_food', dx: 248, dy: 118, scale: 0.95, solid: true },
      { key: 'monastery_herbal_planter', dx: 54, dy: 136, scale: 0.95, solid: true },
      { key: 'armchair_green', dx: 176, dy: 72, scale: 0.95, solid: true },
      { key: 'barrel', dx: 308, dy: 146, scale: 0.9, solid: true },
      { key: 'candle_lit', dx: 248, dy: 106, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'craft', dx: 116, dy: 98, label: 'Katharinas Brau- & Arzneikessel', tip: '[E] Brauen / Craften' },
      { kind: 'lexicon', dx: 298, dy: 78, label: 'Tischreden-Regal', tip: '[E] Lexikon öffnen' },
    ],
  },
  bauernrat_stube: {
    title: 'Bauernrat zu Frankenhausen',
    subtitle: 'Thüringen 1525 · Beratungsstube zu den Zwölf Artikeln',
    chapterId: 7,
    wallCols: [10, 26, 42],
    hasWindows: true,
    floorBlock: [
      [442, 443],
      [458, 459],
    ],
    carpetRunner: false,
    ambientTint: 0xffaa55,
    props: [
      { key: 'hearth_fire', dx: 74, dy: 56, anim: 'hearth-fire', glow: true, solid: true },
      { key: 'table_food', dx: 122, dy: 118, scale: 0.95, solid: true },
      { key: 'table_map', dx: 248, dy: 118, scale: 0.95, solid: true },
      { key: 'bench', dx: 122, dy: 146, scale: 0.9, solid: true },
      { key: 'barrel', dx: 306, dy: 76, scale: 0.9, solid: true },
      { key: 'crate_big', dx: 304, dy: 152, scale: 0.9, solid: true },
      { key: 'candle_lit', dx: 248, dy: 106, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'dilemma', dx: 248, dy: 128, label: 'Ratstisch: Die Zwölf Artikel', tip: '[E] Entscheidung treffen' },
      { kind: 'lexicon', dx: 122, dy: 128, label: 'Beschwerdebuch', tip: '[E] Lexikon öffnen' },
    ],
  },
  rathaus_friedenssaal: {
    title: 'Rathaussaal des Augsburger Religionsfriedens',
    subtitle: 'Augsburg 1555 · „Cuius regio, eius religio“',
    chapterId: 8,
    wallCols: [384, 400, 416],
    hasWindows: true,
    floorBlock: [
      [498, 499],
      [514, 515],
    ],
    carpetRunner: true,
    ambientTint: 0xffe082,
    props: [
      { key: 'armchair_green', dx: 176, dy: 64, scale: 1.05, solid: true },
      { key: 'banner_stand', dx: 52, dy: 72, scale: 0.95 },
      { key: 'banner_stand', dx: 300, dy: 72, scale: 0.95 },
      { key: 'banner_wall', dx: 136, dy: 44, scale: 0.95 },
      { key: 'banner_wall', dx: 216, dy: 44, scale: 0.95 },
      { key: 'table_map', dx: 256, dy: 116, scale: 0.95, solid: true },
      { key: 'monastery_book_lectern', dx: 96, dy: 118, scale: 0.95, solid: true },
      { key: 'bookcase', dx: 304, dy: 64, scale: 0.95, solid: true },
      { key: 'candle_lit', dx: 150, dy: 56, anim: 'candle-lit-anim', glow: true },
      { key: 'candle_lit', dx: 202, dy: 56, anim: 'candle-lit-anim', glow: true },
    ],
    extras: [
      { kind: 'station', dx: 256, dy: 126, label: '360° Primärquellen-Inspektor', tip: '[E] Abschluss-Station', targetId: 'station_quelleninspektor' },
      { kind: 'relic', dx: 96, dy: 128, label: 'Urkunde: Augsburger Religionsfrieden', tip: '[E] Quelle prüfen', targetId: 'religionsfriede_1555' },
    ],
  },
};

export class InteriorScene extends Phaser.Scene {
  private initData!: InteriorInitData;
  private roomId: InteriorRoomId = 'lutherstube_wittenberg';
  private theme!: RoomTheme;

  private player!: Phaser.Physics.Arcade.Sprite;
  private solidColliders!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    ESC: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;

  private hotspots: Hotspot[] = [];
  private activeHotspot: Hotspot | null = null;
  private labelDiv: HTMLElement | null = null;
  private headerEl?: HTMLDivElement;
  private mentorSprite?: Phaser.GameObjects.Sprite;
  private mentorNameplateEl?: HTMLDivElement;
  private exitBadgeEl?: HTMLDivElement;
  private exitMat!: { x: number; y: number; w: number; h: number };
  private isExiting = false;
  private stepCooldown = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';

  private readonly ROOM_W = 352;
  private readonly ROOM_H = 192;
  private readonly LEFT = 64;
  private readonly TOP = 42;

  constructor() {
    super({ key: 'InteriorScene' });
  }

  public init(data: InteriorInitData): void {
    const rawId = data?.roomId || data?.buildingId || 'lutherstube_wittenberg';
    this.roomId = (ROOM_THEMES[rawId] ? rawId : 'lutherstube_wittenberg') as InteriorRoomId;
    this.theme = ROOM_THEMES[this.roomId];
    this.initData = {
      roomId: this.roomId,
      title: data?.title || this.theme.title,
      subtitle: data?.subtitle || this.theme.subtitle,
      returnX: data?.returnX ?? 23 * 16,
      returnY: data?.returnY ?? 25 * 16,
    };
    this.hotspots = [];
    this.activeHotspot = null;
    this.isExiting = false;
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#120c08');
    sound.setIndoorAcoustics(true);

    const worldNps = document.getElementById('floating-nameplates-layer');
    if (worldNps) worldNps.style.display = 'none';
    const compBub = document.getElementById('companion-bubble');
    if (compBub) compBub.style.display = 'none';
    const ambBub = document.getElementById('ambient-speech-layer');
    if (ambBub) ambBub.style.display = 'none';

    // 1. Tile-based Interior Architecture (ZERO fillRect rooms!)
    this.buildTiledRoomTexture();

    // 2. Perimeter Physics Walls + Interior Props + Warm ADD Lighting
    this.solidColliders = this.physics.add.staticGroup();
    this.buildPerimeterColliders();
    this.placeRoomPropsAndLighting();

    // 3. Historical Mentor Sprite (Strict 16x32 Sprite, zero scaleY morph)
    const chData =
      REFORMATION_CHAPTERS.find((c) => c.number === this.theme.chapterId) || REFORMATION_CHAPTERS[0];
    const mentorX = this.LEFT + 176;
    const mentorY = this.TOP + 88;
    const mKey = this.textures.exists(chData.mentor.spriteKey) ? chData.mentor.spriteKey : 'npc_luther';
    const mentorSprite = this.add.sprite(mentorX, mentorY, mKey, 0).setOrigin(0.5, 0.9).setDepth(mentorY);
    if (this.anims.exists(`${mKey}-idle-down`)) {
      mentorSprite.play(`${mKey}-idle-down`);
    }
    this.mentorSprite = mentorSprite;

    document.getElementById('interior-mentor-nameplate')?.remove();
    const np = document.createElement('div');
    np.id = 'interior-mentor-nameplate';
    np.className = 'floating-nameplate';
    np.innerHTML = `<span class="fp-name">${chData.mentor.name}</span><span class="fp-role">${chData.mentor.role}</span>`;
    document.body.appendChild(np);
    this.mentorNameplateEl = np;

    this.hotspots.push({
      id: `interior_mentor_${chData.number}`,
      x: mentorX,
      y: mentorY,
      label: chData.mentor.name,
      tip: '[E] Sprechen',
      action: () => {
        sound.click();
        gameState.completeObjective(chData.number, 0);
        if ((window as any).__openMentorDialog) {
          (window as any).__openMentorDialog(chData.number);
        }
      },
    });

    // 4. Room-specific Interactive Extras (Stations, Relics, Lexicon, Crafting, Dilemma)
    for (const ex of this.theme.extras) {
      const hx = this.LEFT + ex.dx;
      const hy = this.TOP + ex.dy;
      this.hotspots.push({
        id: `extra_${ex.kind}_${ex.dx}`,
        x: hx,
        y: hy,
        label: ex.label,
        tip: ex.tip,
        action: () => {
          sound.click();
          if (ex.kind === 'station' && ex.targetId) {
            (window as any).__openStation?.(ex.targetId);
          } else if (ex.kind === 'relic' && ex.targetId) {
            (window as any).__openArtifactInspector?.(ex.targetId);
          } else if (ex.kind === 'lexicon') {
            (window as any).__toggleModal?.('l');
          } else if (ex.kind === 'craft') {
            (window as any).__toggleModal?.('c');
          } else if (ex.kind === 'dilemma') {
            (window as any).__toggleModal?.('h');
          }
        },
      });
    }

    // 5. Exit Doormat & Portal
    this.exitMat = {
      x: this.LEFT + 176,
      y: this.TOP + this.ROOM_H - 8,
      w: 56,
      h: 22,
    };
    const exitGlow = this.add
      .ellipse(this.exitMat.x, this.exitMat.y - 4, 48, 12, 0xfbbf24, 0.28)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(4);
    this.tweens.add({
      targets: exitGlow,
      alpha: { from: 0.16, to: 0.36 },
      duration: 950,
      yoyo: true,
      repeat: -1,
    });
    document.getElementById('interior-exit-badge')?.remove();
    const exitBadge = document.createElement('div');
    exitBadge.id = 'interior-exit-badge';
    exitBadge.className = 'interior-exit-badge';
    exitBadge.textContent = '▼ Ausgang';
    document.body.appendChild(exitBadge);
    this.exitBadgeEl = exitBadge;

    this.hotspots.push({
      id: 'interior_exit',
      x: this.exitMat.x,
      y: this.exitMat.y + 4,
      label: 'Ausgang nach draußen',
      tip: '[E] Verlassen',
      action: () => this.exitInterior(),
    });

    // 6. Arcade Physics Player Spawn inside Entrance (clear of exit label radius)
    const texKey =
      gameState.gender === 'female' && this.textures.exists('character_female')
        ? 'character_female'
        : 'character';
    this.player = this.physics.add
      .sprite(this.exitMat.x, this.exitMat.y - 54, texKey, 0)
      .setOrigin(0.5, 0.85)
      .setDepth(this.exitMat.y - 54);
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    pBody.setSize(10, 8);
    pBody.setOffset(3, 21);
    this.physics.add.collider(this.player, this.solidColliders);

    if (this.anims.exists(`idle-${gameState.gender}-up`)) {
      this.facing = 'up';
      this.player.play(`idle-${gameState.gender}-up`, true);
    }

    // 7. DOM Header & Proximity Label
    this.renderRoomHeader();
    this.labelDiv = document.getElementById('world-dom-label');
    if (this.labelDiv) this.labelDiv.style.display = 'none';

    // 8. Keyboard Controls & Global Bridge for UIScene / Touch [E]
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        ESC: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      };
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    (window as any).__activeInterior = {
      roomId: this.roomId,
      trigger: () => this.triggerInteraction(),
      exit: () => this.exitInterior(),
    };

    this.syncInteriorBadges(false);
    this.events.once('shutdown', () => this.cleanupDom());
    this.events.once('destroy', () => this.cleanupDom());
  }

  private buildTiledRoomTexture(): void {
    const rt = this.add.renderTexture(0, 0, 480, 270).setOrigin(0, 0).setDepth(0);
    const cols = 22; // 22 * 16 = 352px
    const rows = 12; // 12 * 16 = 192px

    rt.beginDraw();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = this.LEFT + c * 16;
        const py = this.TOP + r * 16;

        if (r < 3) {
          // 48px high North Wall from walls_and_floors
          const isWinCol = this.theme.hasWindows && (c === 5 || c === 16);
          const frame = isWinCol ? [388, 404, 420][r] : this.theme.wallCols[r];
          rt.batchDrawFrame('walls_and_floors', frame, px, py);
        } else {
          // Authentic 32x32 repeating 16-bit Floor Tiles (2x2 block)
          const useRunner = this.theme.carpetRunner && c >= 9 && c <= 12 && r >= 4;
          const block = useRunner
            ? [
                [560, 561],
                [576, 577],
              ]
            : this.theme.floorBlock;
          const frame = block[r % 2][c % 2];
          rt.batchDrawFrame('walls_and_floors', frame, px, py);
        }
      }
    }
    rt.endDraw();

    // Crisp SNES Wooden / Stone Room Trim Border (leaves doorway cols 9..12 open at south)
    const trim = this.add.graphics().setDepth(1);
    trim.lineStyle(3, 0x4a2e16, 1);
    trim.lineBetween(this.LEFT - 1.5, this.TOP - 1.5, this.LEFT + this.ROOM_W + 1.5, this.TOP - 1.5);
    trim.lineBetween(this.LEFT - 1.5, this.TOP - 1.5, this.LEFT - 1.5, this.TOP + this.ROOM_H + 1.5);
    trim.lineBetween(this.LEFT + this.ROOM_W + 1.5, this.TOP - 1.5, this.LEFT + this.ROOM_W + 1.5, this.TOP + this.ROOM_H + 1.5);
    trim.lineBetween(this.LEFT - 1.5, this.TOP + this.ROOM_H + 1.5, this.LEFT + 9 * 16, this.TOP + this.ROOM_H + 1.5);
    trim.lineBetween(this.LEFT + 13 * 16, this.TOP + this.ROOM_H + 1.5, this.LEFT + this.ROOM_W + 1.5, this.TOP + this.ROOM_H + 1.5);
  }

  private addStaticCollider(cx: number, cy: number, w: number, h: number): void {
    const z = this.add.zone(cx, cy, w, h);
    this.physics.add.existing(z, true);
    (z.body as Phaser.Physics.Arcade.StaticBody).setSize(w, h);
    this.solidColliders.add(z);
  }

  private buildPerimeterColliders(): void {
    // North wall bottom threshold
    this.addStaticCollider(this.LEFT + this.ROOM_W / 2, this.TOP + 28, this.ROOM_W, 56);
    // West & East walls
    this.addStaticCollider(this.LEFT + 4, this.TOP + this.ROOM_H / 2, 8, this.ROOM_H);
    this.addStaticCollider(this.LEFT + this.ROOM_W - 4, this.TOP + this.ROOM_H / 2, 8, this.ROOM_H);
    // South wall (leaving open central doorway x: 144..208)
    this.addStaticCollider(this.LEFT + 72, this.TOP + this.ROOM_H + 2, 144, 12);
    this.addStaticCollider(this.LEFT + 280, this.TOP + this.ROOM_H + 2, 144, 12);
  }

  private placeRoomPropsAndLighting(): void {
    for (const p of this.theme.props) {
      const px = this.LEFT + p.dx;
      const py = this.TOP + p.dy;

      let obj: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null = null;
      if (p.anim && this.textures.exists(p.key)) {
        const spr = this.add.sprite(px, py, p.key).setOrigin(0.5, 0.85).setScale(p.scale || 1.0).setDepth(py);
        if (this.anims.exists(p.anim)) spr.play(p.anim);
        obj = spr;
      } else if (this.textures.exists(p.key)) {
        obj = this.add.image(px, py, p.key, 0).setOrigin(0.5, 0.85).setScale(p.scale || 1.0).setDepth(py);
      }

      if (p.solid && obj) {
        const w = Math.min(44, Math.max(14, obj.width * (p.scale || 1.0) * 0.72));
        const h = Math.min(20, Math.max(10, obj.height * (p.scale || 1.0) * 0.36));
        this.addStaticCollider(px, py - h * 0.4, w, h);
      }

      if (p.glow) {
        const glow = this.add
          .circle(px, py - 8, 34, this.theme.ambientTint, 0.20)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setDepth(py + 2);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.14, to: 0.26 },
          scale: { from: 0.94, to: 1.06 },
          duration: 180 + Math.random() * 120,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }

  private renderRoomHeader(): void {
    document.getElementById('interior-room-banner')?.remove();
    const banner = document.createElement('div');
    banner.id = 'interior-room-banner';
    banner.className = 'interior-room-banner';
    banner.innerHTML = `<span class="irb-title">${this.theme.title}</span><span class="irb-sub">${this.theme.subtitle} · Zurück: Ausgang oder [ESC]</span>`;
    document.body.appendChild(banner);
    this.headerEl = banner;
  }

  private syncInteriorBadges(isModalOpen: boolean): void {
    const rect = this.game.canvas.getBoundingClientRect();
    const cam = this.cameras.main;
    const vw = Math.max(1, cam.worldView.width);
    const vh = Math.max(1, cam.worldView.height);

    if (this.mentorNameplateEl && this.mentorSprite) {
      const hideNp = isModalOpen || Boolean(this.activeHotspot?.id.startsWith('interior_mentor_'));
      if (hideNp) {
        this.mentorNameplateEl.style.display = 'none';
      } else {
        const sx = rect.left + ((this.mentorSprite.x - cam.worldView.x) / vw) * rect.width;
        const sy = rect.top + ((this.mentorSprite.y - 32 - cam.worldView.y) / vh) * rect.height;
        this.mentorNameplateEl.style.display = 'flex';
        this.mentorNameplateEl.style.left = `${Math.round(sx)}px`;
        this.mentorNameplateEl.style.top = `${Math.round(sy)}px`;
      }
    }

    if (this.exitBadgeEl && this.exitMat) {
      const hideExit = isModalOpen || this.activeHotspot?.id === 'interior_exit';
      if (hideExit) {
        this.exitBadgeEl.style.display = 'none';
      } else {
        const sx = rect.left + ((this.exitMat.x - cam.worldView.x) / vw) * rect.width;
        const sy = rect.top + ((this.exitMat.y - 6 - cam.worldView.y) / vh) * rect.height;
        this.exitBadgeEl.style.display = 'block';
        this.exitBadgeEl.style.left = `${Math.round(sx)}px`;
        this.exitBadgeEl.style.top = `${Math.round(sy)}px`;
      }
    }
  }

  private cleanupDom(): void {
    if ((window as any).__activeInterior?.roomId === this.roomId) {
      delete (window as any).__activeInterior;
    }
    this.headerEl?.remove();
    document.getElementById('interior-room-banner')?.remove();
    this.mentorNameplateEl?.remove();
    document.getElementById('interior-mentor-nameplate')?.remove();
    this.exitBadgeEl?.remove();
    document.getElementById('interior-exit-badge')?.remove();
    const ambBub = document.getElementById('ambient-speech-layer');
    if (ambBub) ambBub.style.display = 'block';
    if (this.labelDiv) this.labelDiv.style.display = 'none';
    sound.setIndoorAcoustics(false);
  }

  public update(_time: number, delta: number): void {
    if (this.isExiting || !this.player) return;

    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    const isModalOpen = Boolean((window as any).__isModalOpen?.());
    if (isModalOpen) {
      pBody.setVelocity(0, 0);
      if (this.labelDiv) this.labelDiv.style.display = 'none';
      this.syncInteriorBadges(true);
      return;
    }

    gameState.playTimeSeconds += delta / 1000;

    if (this.wasd?.ESC && Phaser.Input.Keyboard.JustDown(this.wasd.ESC)) {
      this.exitInterior();
      return;
    }

    let vx = 0;
    let vy = 0;
    const speed = 104;

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
    pBody.setVelocity(vx, vy);
    this.player.setDepth(this.player.y);

    const g = gameState.gender;
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
      const wKey = this.anims.exists(`walk-${g}-${this.facing}`) ? `walk-${g}-${this.facing}` : `walk-${this.facing}`;
      this.player.play(wKey, true);

      this.stepCooldown -= delta;
      if (this.stepCooldown <= 0) {
        sound.footstep('wood');
        this.stepCooldown = 270;
      }
    } else {
      const iKey = this.anims.exists(`idle-${g}-${this.facing}`) ? `idle-${g}-${this.facing}` : `idle-${this.facing}`;
      if (this.anims.exists(iKey)) this.player.play(iKey, true);
    }

    // Closest Hotspot Projection
    let closest: Hotspot | null = null;
    let minD = 42;
    for (const h of this.hotspots) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, h.x, h.y);
      if (d < minD) {
        minD = d;
        closest = h;
      }
    }
    this.activeHotspot = closest;

    if (this.labelDiv) {
      if (closest) {
        const rect = this.game.canvas.getBoundingClientRect();
        const cam = this.cameras.main;
        const sx = rect.left + ((closest.x - cam.worldView.x) / Math.max(1, cam.worldView.width)) * rect.width;
        const sy = rect.top + ((closest.y - 24 - cam.worldView.y) / Math.max(1, cam.worldView.height)) * rect.height;
        this.labelDiv.innerHTML = `<strong>${closest.label}</strong><span class="wdl-tip">${closest.tip}</span>`;
        this.labelDiv.style.left = `${Math.round(Math.max(rect.left + 76, Math.min(rect.right - 76, sx)))}px`;
        this.labelDiv.style.top = `${Math.round(Math.max(rect.top + 52, Math.min(rect.bottom - 26, sy)))}px`;
        this.labelDiv.style.display = 'flex';
      } else {
        this.labelDiv.style.display = 'none';
      }
    }
    this.syncInteriorBadges(false);

    const pressedE =
      (this.wasd?.E && Phaser.Input.Keyboard.JustDown(this.wasd.E)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
      tc?.actionPressed;

    if (pressedE) {
      if (tc) tc.actionPressed = false;
      this.triggerInteraction();
      return;
    }

    // Auto-exit when walking directly onto threshold doormat south
    if (
      Math.abs(this.player.x - this.exitMat.x) < 20 &&
      this.player.y >= this.exitMat.y - 2
    ) {
      this.exitInterior();
    }
  }

  public triggerInteraction(): void {
    if ((window as any).__isModalOpen?.()) return;
    if (this.activeHotspot) {
      this.activeHotspot.action();
    }
  }

  public exitInterior(): void {
    if (this.isExiting) return;
    this.isExiting = true;
    sound.door();
    if (this.player?.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
    this.input.keyboard?.resetKeys();
    this.cleanupDom();
    this.scene.resume('WorldScene');
    this.scene.stop('InteriorScene');
  }
}
