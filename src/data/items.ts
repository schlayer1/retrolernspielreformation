export type ReformationItemId =
  | 'pergament'
  | 'bleilettern'
  | 'druckerschwaerze'
  | 'holzschnitt_platte'
  | 'flugschrift'
  | 'ablassbrief'
  | 'tinte_feder'
  | 'brot_fladen'
  | 'bier_krug'
  | 'heilkräuter'
  | 'apfel'
  | 'holz'
  | 'papierbogen'
  | 'flugblatt_sola_fide';

export interface ReformationItem {
  id: ReformationItemId;
  name: string;
  category: 'Rohstoff' | 'Druckerei & Schrift' | 'Nahrung & Arznei' | 'Urkunde';
  description: string;
  icon: string;
  value: number;
}

export const REFORMATION_ITEMS: Record<ReformationItemId, ReformationItem> = {
  pergament: {
    id: 'pergament',
    name: 'Echtes Tier-Pergament',
    category: 'Rohstoff',
    description: 'Fein geschabte Kalbshaut für wertvolle Kanzleidokumente und Thesenanschläge.',
    icon: '/assets/icons/relic_lehnsurkunde.png',
    value: 12,
  },
  bleilettern: {
    id: 'bleilettern',
    name: 'Gegossene Bleilettern',
    category: 'Druckerei & Schrift',
    description: 'Präzise gegossene Buchstabentypen aus Blei, Zinn und Antimon für den Setzkasten.',
    icon: '/assets/icons/relic_silberdenar.png',
    value: 20,
  },
  druckerschwaerze: {
    id: 'druckerschwaerze',
    name: 'Cranachs Druckerschwärze',
    category: 'Druckerei & Schrift',
    description: 'Zähflüssige Ölfarbe aus gekochtem Leinöl und feinstem Kienruß.',
    icon: '/assets/icons/oellampe.png',
    value: 8,
  },
  holzschnitt_platte: {
    id: 'holzschnitt_platte',
    name: 'Birnbaum-Druckstock',
    category: 'Druckerei & Schrift',
    description: 'Geschnitzter Holzschnitt mit Bildmotiven für aufrüttelnde Flugblätter.',
    icon: '/assets/icons/holz.png',
    value: 15,
  },
  flugschrift: {
    id: 'flugschrift',
    name: 'Gedruckte Flugschrift',
    category: 'Druckerei & Schrift',
    description: 'Frisch gedrucktes Flugblatt mit Luthers Thesen zur Verbreitung im Reich.',
    icon: '/assets/icons/relic_codex.png',
    value: 10,
  },
  ablassbrief: {
    id: 'ablassbrief',
    name: 'Tetzels Ablassbrief',
    category: 'Urkunde',
    description: 'Gedrucktes Formular mit Siegel des Erzbischofs zur Vergebung zeitlicher Sündenstrafen.',
    icon: '/assets/icons/relic_zwoelftafel.png',
    value: 50,
  },
  tinte_feder: {
    id: 'tinte_feder',
    name: 'Gänsekiel & Gallustinte',
    category: 'Druckerei & Schrift',
    description: 'Werkzeuge des Chronisten zur Handschrift und Übersetzung auf der Wartburg.',
    icon: '/assets/icons/pergament_codex.png',
    value: 6,
  },
  brot_fladen: {
    id: 'brot_fladen',
    name: 'Roggenlaib aus dem Klosterofen',
    category: 'Nahrung & Arznei',
    description: 'Nahrhaftes Bauern- und Klosterbrot, gebacken nach alter Tradition.',
    icon: '/assets/icons/panis_brot.png',
    value: 3,
  },
  bier_krug: {
    id: 'bier_krug',
    name: 'Katharinas Klosterbier',
    category: 'Nahrung & Arznei',
    description: 'Süffiges, sauberes Dünnbier aus Katharina von Boras Hausbrauerei im Schwarzen Kloster.',
    icon: '/assets/icons/wasser.png',
    value: 4,
  },
  heilkräuter: {
    id: 'heilkräuter',
    name: 'Wittenberger Klosterkräuter',
    category: 'Nahrung & Arznei',
    description: 'Salbei, Kamille und Johanniskraut zur Wundversorgung und Linderung von Leiden.',
    icon: '/assets/icons/samen.png',
    value: 5,
  },
  apfel: {
    id: 'apfel',
    name: 'Frischer Streuobst-Apfel',
    category: 'Nahrung & Arznei',
    description: 'Knackiger Apfel aus den Obstgärten des Kurfürsten.',
    icon: '/assets/icons/weintrauben.png',
    value: 2,
  },
  holz: {
    id: 'holz',
    name: 'Buchenholz-Scheite',
    category: 'Rohstoff',
    description: 'Trockenes Holz für den Werkstattofen und den Kamin der Lutherstube.',
    icon: '/assets/icons/holz.png',
    value: 2,
  },
  papierbogen: {
    id: 'papierbogen',
    name: 'Hadernpapier aus der Papiermühle',
    category: 'Rohstoff',
    description: 'Feines, festes Schöpfpapier aus Leinenhadern für den Buchdruck.',
    icon: '/assets/icons/pergament_codex.png',
    value: 5,
  },
  flugblatt_sola_fide: {
    id: 'flugblatt_sola_fide',
    name: 'Flugblatt „SOLA FIDE“ (1517)',
    category: 'Druckerei & Schrift',
    description: 'Eigenhändig an der Gutenberg-Presse gesetztes und gedrucktes Meisterstück: Luthers Lehre „Allein durch den Glauben“.',
    icon: '/assets/icons/relic_codex.png',
    value: 40,
  },
};

export interface ReformationRecipe {
  id: string;
  name: string;
  outputItem: ReformationItemId;
  outputCount: number;
  ingredients: { item: ReformationItemId; count: number }[];
  description: string;
}

export const REFORMATION_RECIPES: ReformationRecipe[] = [
  {
    id: 'recipe_flugschrift',
    name: 'Flugblatt drucken',
    outputItem: 'flugschrift',
    outputCount: 3,
    ingredients: [
      { item: 'papierbogen', count: 2 },
      { item: 'druckerschwaerze', count: 1 },
    ],
    description: 'Drucke reformatorische Flugschriften an Meister Cranachs Presse.',
  },
  {
    id: 'recipe_schwaerze',
    name: 'Druckerschwärze anrühren',
    outputItem: 'druckerschwaerze',
    outputCount: 2,
    ingredients: [
      { item: 'holz', count: 1 },
    ],
    description: 'Koche Leinöl mit feinem Kienruß zu tiefschwarzer Druckerfarbe.',
  },
  {
    id: 'recipe_arznei',
    name: 'Klostersalbe mischen',
    outputItem: 'heilkräuter',
    outputCount: 2,
    ingredients: [
      { item: 'heilkräuter', count: 1 },
    ],
    description: 'Mörsere Kräuter mit Wachs zu einer lindernden Wundsalbe.',
  },
];
