export interface ReformationRelic {
  id: string;
  name: string;
  epoch: string;
  year: string;
  location: string;
  x: number;
  y: number;
  icon: string;
  foundName: string;
  description: string;
  historicalSignificance: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export const REFORMATION_RELICS: ReformationRelic[] = [
  {
    id: 'thesen_95',
    name: 'Die 95 Thesen gegen den Ablass',
    epoch: 'Frühe Reformation',
    year: '1517',
    location: 'Schlosskirche zu Wittenberg',
    x: 18 * 16,
    y: 14 * 16,
    icon: '/assets/icons/relic_codex.png',
    foundName: 'Handschrift der 95 Thesen',
    description: 'Martin Luthers lateinischer Disputationsentwurf gegen den Missbrauch des kirchlichen Ablasses.',
    historicalSignificance: 'Luther kritisierte, dass man Gottes Gnade nicht mit Geld kaufen kann. Der Legende nach schlug er die Thesen am 31. Oktober 1517 an das Portal der Schlosskirche.',
    question: 'Welche zentrale Kritik äußerte Martin Luther in seinen Thesen über den Ablass?',
    options: [
      'Gott verlange Gold und Silber zur Erbauung prachtvoller Paläste.',
      'Sünde könne nur durch Reue und Gottes Gnade vergeben werden, nicht durch Geldzahlung.',
      'Nur der Papst in Rom dürfe persönliche Gebete an Gott richten.',
      'Alle Klöster sollten unverzüglich geschlossen und abgebrannt werden.',
    ],
    correctOption: 1,
    explanation: 'Luther argumentierte: Wahre Reue führt zur Vergebung durch Christus allein („Sola Gratia“). Geldbriefe wiegen den Sünder in falscher Sicherheit.',
  },
  {
    id: 'druckerplatte_cranach',
    name: 'Cranach-Druckstock & Holzschnitt',
    epoch: 'Medienrevolution',
    year: '1518',
    location: 'Werkstatt Lucas Cranach, Wittenberg',
    x: 42 * 16,
    y: 20 * 16,
    icon: '/assets/icons/schmiede_hammer.png',
    foundName: 'Geschnitzte Birnbaum-Druckplatte',
    description: 'Ein filigran geschnitzter Holzstock für den Flugblattdruck mit Bildern zur Gegenüberstellung von Papsttum und Christus.',
    historicalSignificance: 'Da viele einfache Menschen damals weder Latein noch fließend Deutsch lesen konnten, waren Cranachs Holzschnitte und Illustrationen entscheidend für die massenhafte Verbreitung reformatorischer Gedanken.',
    question: 'Warum spielten Holzschnitte und Flugblätter für den Erfolg der Reformation eine so gewaltige Rolle?',
    options: [
      'Weil sie von reitenden Boten und Händlern rasch im ganzen Reich verteilt wurden und auch Ungebildeten die Botschaft bildhaft erklärten.',
      'Weil der Kaiser das Malen von Bildern strenger bestrafte als das Schreiben von Büchern.',
      'Weil Druckerpressen damals ausschließlich mit königlichem Erlass betrieben werden durften.',
      'Weil die Kirche keine eigenen Bücher drucken konnte.',
    ],
    correctOption: 0,
    explanation: 'Der Buchdruck mit beweglichen Lettern und Holzschnitten war das erste Massenmedium. Flugblätter verbreiteten sich wie ein Lauffeuer über Sprach- und Reichsgrenzen hinweg.',
  },
  {
    id: 'ablasskasten_tetzel',
    name: 'Johann Tetzels Ablasskasten',
    epoch: 'Vorabend der Reformation',
    year: '1517',
    location: 'Markt vor den Toren Wittenbergs (Jüterbog)',
    x: 70 * 16,
    y: 36 * 16,
    icon: '/assets/icons/relic_silberdenar.png',
    foundName: 'Eisenbeschlagene Ablass-Truhe',
    description: 'Eine schwere Eichentruhe mit drei Schlössern und Einwurfschlitz für Tetzels Ablassgelder.',
    historicalSignificance: 'Johann Tetzel verkaufte im Auftrag von Erzbischof Albrecht von Brandenburg und Papst Leo X. Ablässe. Die Einnahmen dienten teils dem Neubau des Petersdoms in Rom, teils zur Tilgung von Schulden bei den Fuggern.',
    question: 'Mit welchem berühmten Werbespruch pries Tetzel den Ablass an?',
    options: [
      '„Ora et labora – Bete und arbeite, so wirst du selig!“',
      '„Wenn das Geld im Kasten klingt, die Seele in den Himmel springt!“',
      '„Ein jeglicher trage des andern Last auf Erden!“',
      '„Hier stehe ich, ich kann nicht anders!“',
    ],
    correctOption: 1,
    explanation: 'Tetzels suggestiver Reim spielte geschickt mit der Furcht der Menschen vor den Qualen des Fegefeuers für sich und verstorbene Verwandte.',
  },
  {
    id: 'septembertestament',
    name: 'Das Septembertestament (Wartburg-Bibel)',
    epoch: 'Sprachschöpfung & Bibelübersetzung',
    year: '1522',
    location: 'Schreibstube auf der Wartburg',
    x: 24 * 16,
    y: 72 * 16,
    icon: '/assets/icons/pergament_codex.png',
    foundName: 'Erstdruck des Neuen Testaments auf Deutsch',
    description: 'Das Neue Testament, in nur elf Wochen auf der Wartburg von Martin Luther aus dem griechischen Urtext ins Deutsche übertragen.',
    historicalSignificance: 'Luther schuf mit seiner kraftvollen, bildhaften Sprache ein allgemeines Deutsch, das über regionale Dialektgrenzen hinweg verstanden wurde und das Fundament der neuhochdeutschen Schriftsprache legte.',
    question: 'Welches didaktische Prinzip verfolgte Luther bei seiner Übersetzung ins Deutsche?',
    options: [
      'Möglichst jedes lateinische Fremdwort unverändert zu übernehmen.',
      '„Dem Volk aufs Maul schauen“ – eine verständliche, lebendige Sprache verwenden.',
      'Den Text in Geheimsprache verfassen, damit nur Adelige ihn verstehen.',
      'Ausschließlich Reime und lateinische Verse zu dichten.',
    ],
    correctOption: 1,
    explanation: 'Luther forderte, die Mutter im Haus, die Kinder auf der Gasse und den gemeinen Mann auf dem Markt zu fragen und danach zu dolmetschen.',
  },
  {
    id: 'religionsfriede_1555',
    name: 'Der Augsburger Religionsfrieden',
    epoch: 'Konfessionelles Zeitalter',
    year: '1555',
    location: 'Rathaus zu Augsburg',
    x: 82 * 16,
    y: 84 * 16,
    icon: '/assets/icons/relic_lehnsurkunde.png',
    foundName: 'Reichsabschied mit Kaiserlichem Siegel',
    description: 'Der feierliche Vertrag des Reichstags zu Augsburg, der das lutherische Bekenntnis reichsrechtlich der katholischen Konfession gleichstellte.',
    historicalSignificance: 'Mit der Formel „Cuius regio, eius religio“ (Wer das Land regiert, bestimmt die Konfession) endeten vorerst die Bürger- und Religionskriege im Reich, wenngleich Untertanen anderer Konfession auswandern mussten.',
    question: 'Was bedeutete der Grundsatz „Cuius regio, eius religio“ für die Bevölkerung?',
    options: [
      'Jeder Bauer durfte seine Religion alle drei Jahre frei wählen.',
      'Der jeweilige Landesherr bestimmte die Religion für das gesamte Fürstentum.',
      'Der Papst ernannte alle Stadträte und Bürgermeister persönlich.',
      'Religion wurde im ganzen Reich verboten.',
    ],
    correctOption: 1,
    explanation: 'Die Landesherren entschieden über die Konfession ihrer Territorien. Untertanen, die dem neuen Glauben nicht folgen wollten, erhielten das Recht auszuwandern (Ius emigrandi).',
  },
];
