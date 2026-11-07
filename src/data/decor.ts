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
  // --- AUSSENWELT (Wittenberg & Heiliges Römisches Reich: 0..96 * 16) ---
  // 1. Wittenberg Schlossplatz & Markt (Nordwesten: x: 8..52, y: 12..30)
  { id: 'schlosskirche_portal', name: 'Schlosskirche Allerheiligen', x: 20 * 16, y: 18 * 16, spriteKey: 'chapel', scale: 1.0, isObstacle: true },
  { id: 'cranach_atelier', name: 'Lucas Cranachs Hofatelier & Druckerei', x: 36 * 16, y: 18 * 16, spriteKey: 'house_tall_slate', scale: 1.0, isObstacle: true },
  { id: 'wittenberg_haus_ost', name: 'Wittenberger Patrizierhaus', x: 48 * 16, y: 20 * 16, spriteKey: 'house_gable_tile', scale: 1.0, isObstacle: true },
  { id: 'wittenberg_haus_west', name: 'Kaufmannshaus am Schlossplatz', x: 10 * 16, y: 20 * 16, spriteKey: 'house_gable_slate', scale: 1.0, isObstacle: true },
  { id: 'wittenberg_brunnen', name: 'Marktbrunnen Wittenberg', x: 26 * 16, y: 24 * 16, spriteKey: 'well', scale: 0.9, isObstacle: true },
  { id: 'wittenberg_bank', name: 'Sitzbank am Markt', x: 16 * 16, y: 24 * 16, spriteKey: 'bench', scale: 0.9, isObstacle: true },
  { id: 'cranach_fass_lager', name: 'Firnis- und Druckfarben-Fässer', x: 44 * 16, y: 20 * 16, spriteKey: 'barrel', scale: 0.85, isObstacle: true },
  { id: 'markt_stand_tuch', name: 'Tuchhändler-Stand', x: 14 * 16, y: 28 * 16, spriteKey: 'stall_blue', scale: 0.95, isObstacle: true },
  { id: 'markt_stand_kraeuter', name: 'Kräuter- & Gewürzstand', x: 22 * 16, y: 29 * 16, spriteKey: 'stall_green', scale: 0.95, isObstacle: true },
  { id: 'wittenberg_blumen_1', name: 'Goldenes Zierbeet', x: 10 * 16, y: 23 * 16, spriteKey: 'flowerbed_gold', scale: 0.85, isObstacle: false },
  { id: 'wittenberg_blumen_2', name: 'Veilchenbeet am Markt', x: 34 * 16, y: 21 * 16, spriteKey: 'flowerbed_violet', scale: 0.85, isObstacle: false },
  { id: 'wittenberg_laterne_1', name: 'Kandelaber am Schlossplatz', x: 14 * 16, y: 24 * 16, spriteKey: 'lantern_post', scale: 0.9, isObstacle: true },
  { id: 'wittenberg_laterne_2', name: 'Markt-Laterne', x: 28 * 16, y: 21 * 16, spriteKey: 'lantern_post', scale: 0.9, isObstacle: true },
  { id: 'cranach_kiste', name: 'Hadernpapier-Kiste', x: 38 * 16, y: 21 * 16, spriteKey: 'crate_big', scale: 0.85, isObstacle: true },
  { id: 'markt_apfelfass', name: 'Apfelfass des Obstbauern', x: 25 * 16, y: 27 * 16, spriteKey: 'barrel_apples', scale: 0.85, isObstacle: true },

  // 2. Tetzel Markt vor den Toren Wittenbergs (Mitte-Nord: x: 20..36, y: 32..42)
  { id: 'tetzel_stand', name: 'Tetzels Ablass-Kanzel & Stand', x: 26 * 16, y: 34 * 16, spriteKey: 'stall_red', scale: 1.0, isObstacle: true },
  { id: 'tetzel_fass', name: 'Ablassgelder Fässer', x: 26 * 16, y: 38 * 16, spriteKey: 'barrel', scale: 0.85, isObstacle: true },

  // 3. Augsburg & Fuggerpalais (Nordost: x: 54..68, y: 14..28)
  { id: 'fuggerpalais', name: 'Fuggerpalais Residenz & Audienzsaal', x: 62 * 16, y: 18 * 16, spriteKey: 'house_gable_tile', scale: 1.0, isObstacle: true },
  { id: 'fugger_statue', name: 'Kaiser-Denkmal am Fuggerplatz', x: 68 * 16, y: 22 * 16, spriteKey: 'statue_king', scale: 0.9, isObstacle: true },
  { id: 'fugger_blumen', name: 'Renaissance-Zierbeet', x: 56 * 16, y: 22 * 16, spriteKey: 'flowerbed_gold', scale: 0.85, isObstacle: false },

  // 4. Worms Kaiserpfalz & Reichstag (Ost: x: 70..90, y: 14..30)
  { id: 'kaiserpfalz_worms', name: 'Kaiserliche Pfalz zu Worms (Reichstag)', x: 80 * 16, y: 18 * 16, spriteKey: 'gatehouse', scale: 1.0, isObstacle: true },
  { id: 'worms_zinnen_links', name: 'Kaiserliche Wehrmauer Links', x: 70 * 16, y: 18 * 16, spriteKey: 'fortress_battlement', scale: 1.0, isObstacle: true },
  { id: 'worms_zinnen_rechts', name: 'Kaiserliche Wehrmauer Rechts', x: 90 * 16, y: 18 * 16, spriteKey: 'fortress_battlement', scale: 1.0, isObstacle: true },

  // 5. Schwarzes Kloster & Katharina von Bora (West-Mitte: x: 30..48, y: 44..56)
  { id: 'lutherhaus_gebaeude', name: 'Schwarzes Kloster Konventshaus', x: 36 * 16, y: 46 * 16, spriteKey: 'cottage_stone', scale: 1.0, isObstacle: true },
  { id: 'kraeutergarten_beet', name: 'Katharinas Heilkräuterbeet', x: 44 * 16, y: 48 * 16, spriteKey: 'monastery_herbal_planter', scale: 1.0, isObstacle: false },
  { id: 'kloster_brunnen', name: 'Klosterhof-Ziehbrunnen', x: 30 * 16, y: 50 * 16, spriteKey: 'village_stone_well_prop', scale: 0.9, isObstacle: true },

  // 6. Veste Wartburg & Junker Jörg (Südwest: x: 14..32, y: 66..84)
  { id: 'wartburg_burgturm', name: 'Veste Wartburg Palas & Bergfried', x: 22 * 16, y: 70 * 16, spriteKey: 'keep', scale: 1.0, isObstacle: true },
  { id: 'wartburg_turm_links', name: 'Wartburg Flankierungsturm', x: 12 * 16, y: 72 * 16, spriteKey: 'tower_round', scale: 0.95, isObstacle: true },

  // 7. Bauernkrieg Frankenhausen (Süd-Mitte: x: 48..66, y: 68..84)
  { id: 'bauern_huette', name: 'Bauernkate Frankenhausen', x: 56 * 16, y: 72 * 16, spriteKey: 'peasant_thatched_cottage', scale: 1.0, isObstacle: true },
  { id: 'bauern_huette_2', name: 'Fachwerk-Scheune', x: 64 * 16, y: 72 * 16, spriteKey: 'cottage_thatch', scale: 0.9, isObstacle: true },
  { id: 'bauern_heuwagen', name: 'Heuwagen & Pflug', x: 50 * 16, y: 76 * 16, spriteKey: 'cart_hay', scale: 0.9, isObstacle: true },

  // 8. Augsburg Friedenssaal 1555 (Südost: x: 74..88, y: 68..84)
  { id: 'augsburg_rathaus', name: 'Rathaussaal des Augsburger Religionsfriedens', x: 80 * 16, y: 72 * 16, spriteKey: 'fortress_gatehouse', scale: 1.0, isObstacle: true },

  // --- INNENRÄUME (Historische Interieur-Akzente auf den 16-Bit Raum-Backdrops) ---
  // Raum 1: Cranach-Hofwerkstatt (x: 118 * 16, y: 12 * 16)
  { id: 'cranach_in_books', name: 'Stapel geschöpftes Hadernpapier', x: 121 * 16, y: 22 * 16, spriteKey: 'book_pile', scale: 1.0, isObstacle: true },

  // Raum 3: Fuggerpalais Audienzsaal (x: 117 * 16, y: 47 * 16)
  { id: 'fugger_in_lectern', name: 'Päpstliche Bannandrohungsbulle', x: 123 * 16, y: 56 * 16, spriteKey: 'monastery_book_lectern', scale: 0.9, isObstacle: true },

  // Raum 4: Wartburg Luthers Schreibstube (x: 158 * 16, y: 47 * 16)
  { id: 'wartburg_in_lectern', name: 'Griechisches Neues Testament (Erasmus)', x: 163 * 16, y: 56 * 16, spriteKey: 'monastery_book_lectern', scale: 0.9, isObstacle: true },

  // Raum 5: Schwarzes Kloster Refektorium & Hauswirtschaft (x: 138 * 16, y: 70 * 16)
  { id: 'kloster_in_herbs', name: 'Katharinas Arzneikräuter-Trog', x: 157 * 16, y: 78 * 16, spriteKey: 'monastery_herbal_planter', scale: 0.9, isObstacle: true },
];

export const RESOURCE_NODES: ResourceNode[] = [
  {
    id: 'node_pergament',
    name: 'Pergamentrollen-Kiste',
    x: 32 * 16,
    y: 24 * 16,
    spriteKey: 'crates',
    lootItem: 'pergament',
    lootCount: 1,
    respawnSeconds: 20,
    description: 'Frisches Hadernpergament aus der Kanzlei für Handschriften und Entwürfe.',
  },
  {
    id: 'node_lettern',
    name: 'Lettern-Gusskasten',
    x: 42 * 16,
    y: 25 * 16,
    spriteKey: 'crates',
    lootItem: 'bleilettern',
    lootCount: 2,
    respawnSeconds: 15,
    description: 'Neugegossene Bleitypen aus Cranachs Gießerei.',
  },
  {
    id: 'node_kraeuter',
    name: 'Katharinas Heilkräuterbeet',
    x: 44 * 16,
    y: 53 * 16,
    spriteKey: 'dirt_hoed',
    lootItem: 'heilkräuter',
    lootCount: 3,
    respawnSeconds: 25,
    description: 'Duftende Kräuter für Arznei und die Hausapotheke des Klosters.',
  },
  {
    id: 'node_holz',
    name: 'Holzscheit-Stapel',
    x: 30 * 16,
    y: 78 * 16,
    spriteKey: 'crates',
    lootItem: 'holz',
    lootCount: 2,
    respawnSeconds: 15,
    description: 'Trockenes Buchenholz für den Ofen der Wartburg-Stube.',
  },
];
