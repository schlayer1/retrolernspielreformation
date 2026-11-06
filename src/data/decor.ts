export interface DecorObject {
  id: string;
  name: string;
  x: number;
  y: number;
  spriteKey: string;
  scale?: number;
  isObstacle?: boolean;
}

export interface ResourceNode {
  id: string;
  name: string;
  x: number;
  y: number;
  spriteKey: string;
  lootItem: string;
  lootCount: number;
  respawnSeconds: number;
  description: string;
}

export const REFORMATION_DECOR: DecorObject[] = [
  // Wittenberg Kirche & Marktplatz (Nordwesten: x: 10..30, y: 10..35)
  { id: 'schlosskirche_portal', name: 'Schlosskirche Wittenberg', x: 18 * 16, y: 10 * 16, spriteKey: 'chapel', scale: 1.0, isObstacle: true },
  { id: 'wittenberg_brunnen', name: 'Marktbrunnen Wittenberg', x: 26 * 16, y: 26 * 16, spriteKey: 'well', scale: 0.9, isObstacle: true },
  { id: 'wittenberg_bank', name: 'Sitzbank am Markt', x: 20 * 16, y: 26 * 16, spriteKey: 'bench', scale: 0.9, isObstacle: true },

  // Cranach-Werkstatt & Hof (Nord-Mitte: x: 38..52, y: 10..30)
  { id: 'cranach_atelier', name: 'Cranach Hofatelier', x: 44 * 16, y: 12 * 16, spriteKey: 'cottage_stone', scale: 1.0, isObstacle: true },
  { id: 'cranach_presse_tisch', name: 'Setzertisch & Pult', x: 48 * 16, y: 24 * 16, spriteKey: 'monastery_scriptorium_desk', scale: 0.9, isObstacle: true },
  { id: 'cranach_buchpult', name: 'Lesepult & Vorlagen', x: 38 * 16, y: 24 * 16, spriteKey: 'monastery_book_lectern', scale: 0.85, isObstacle: true },

  // Augsburg & Cajetan (Nordost: x: 58..70, y: 10..30)
  { id: 'fuggerpalais', name: 'Fuggerpalais Tor', x: 62 * 16, y: 10 * 16, spriteKey: 'fortress_gatehouse', scale: 1.0, isObstacle: true },
  { id: 'cajetan_thron', name: 'Kardinalsitz', x: 62 * 16, y: 22 * 16, spriteKey: 'royal_throne_gold', scale: 0.85, isObstacle: true },

  // Worms Kaiserpfalz (Ost: x: 72..86, y: 10..32)
  { id: 'kaiserthron_podest', name: 'Kaiserthron Karl V.', x: 74 * 16, y: 14 * 16, spriteKey: 'royal_throne_gold', scale: 1.1, isObstacle: true },
  { id: 'worms_zinnen', name: 'Bürgersaal Wehrmauer', x: 80 * 16, y: 12 * 16, spriteKey: 'fortress_battlement', scale: 1.0, isObstacle: true },

  // Tetzel Markt vor den Toren (Mitte-Ost: x: 68..80, y: 34..46)
  { id: 'tetzel_stand', name: 'Tetzels Ablass-Stand', x: 72 * 16, y: 42 * 16, spriteKey: 'stall_red', scale: 1.0, isObstacle: true },
  { id: 'tetzel_fass', name: 'Ablassgelder Fässer', x: 66 * 16, y: 40 * 16, spriteKey: 'barrel', scale: 0.85, isObstacle: true },

  // Schwarzes Kloster & Katharina von Bora (Südwest: x: 30..48, y: 48..65)
  { id: 'lutherhaus_gebaeude', name: 'Schwarzes Kloster Konvent', x: 38 * 16, y: 48 * 16, spriteKey: 'cottage_stone', scale: 1.0, isObstacle: true },
  { id: 'kraeutergarten_beet', name: 'Katharinas Heilkräuterbeet', x: 44 * 16, y: 58 * 16, spriteKey: 'monastery_herbal_planter', scale: 1.0, isObstacle: false },

  // Wartburg & Junker Jörg (Süd-West: x: 14..32, y: 68..88)
  { id: 'wartburg_burgturm', name: 'Wartburg Bergfried & Palas', x: 20 * 16, y: 70 * 16, spriteKey: 'keep', scale: 1.1, isObstacle: true },
  { id: 'wartburg_schreibpult', name: 'Luthers Schreibpult', x: 26 * 16, y: 68 * 16, spriteKey: 'monastery_scriptorium_desk', scale: 0.9, isObstacle: true },

  // Bauernkrieg Frankenhausen (Süd-Mitte: x: 50..66, y: 66..88)
  { id: 'bauern_huette', name: 'Bauernkate Frankenhausen', x: 54 * 16, y: 70 * 16, spriteKey: 'peasant_thatched_cottage', scale: 1.0, isObstacle: true },
  { id: 'bauern_heuwagen', name: 'Heuwagen & Pflug', x: 52 * 16, y: 80 * 16, spriteKey: 'cart_hay', scale: 0.9, isObstacle: true },

  // Augsburg Friedenssaal 1555 (Südost: x: 70..88, y: 70..90)
  { id: 'augsburg_rathaus', name: 'Rathaussaal Augsburg 1555', x: 80 * 16, y: 72 * 16, spriteKey: 'fortress_gatehouse', scale: 1.0, isObstacle: true },
];

export const RESOURCE_NODES: ResourceNode[] = [
  {
    id: 'node_pergament',
    name: 'Pergamentrollen-Kiste',
    x: 40 * 16,
    y: 18 * 16,
    spriteKey: 'keep_guard',
    lootItem: 'pergament',
    lootCount: 1,
    respawnSeconds: 20,
    description: 'Frisches Pergament aus der Kanzlei für Handschriften und Entwürfe.',
  },
  {
    id: 'node_lettern',
    name: 'Lettern-Gusskasten',
    x: 48 * 16,
    y: 18 * 16,
    spriteKey: 'keep_guard',
    lootItem: 'bleilettern',
    lootCount: 2,
    respawnSeconds: 15,
    description: 'Neugegossene Bleitypen aus Cranachs Gießerei.',
  },
  {
    id: 'node_kraeuter',
    name: 'Katharinas Heilkräuterbeet',
    x: 44 * 16,
    y: 62 * 16,
    spriteKey: 'dirt_hoed',
    lootItem: 'heilkräuter',
    lootCount: 3,
    respawnSeconds: 25,
    description: 'Duftende Kräuter für Arznei und Hausapotheke.',
  },
  {
    id: 'node_holz',
    name: 'Holzscheit-Stapel',
    x: 30 * 16,
    y: 80 * 16,
    spriteKey: 'keep_noble',
    lootItem: 'holz',
    lootCount: 2,
    respawnSeconds: 15,
    description: 'Trockenes Buchenholz für den Ofen der Lutherstube.',
  },
];
