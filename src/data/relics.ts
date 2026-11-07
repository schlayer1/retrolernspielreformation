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
  // 360° Archäologie- & Primärquellen-Inspektor Felder (Avers & Revers)
  aversTitle: string;
  aversDetails: string;
  reversTitle: string;
  reversDetails: string;
  didacticSummary: string;
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
    aversTitle: 'Vorderseite (Avers): Lateinischer Disputationstext',
    aversDetails: 'Gedruckt auf feinem Hadernpapier in lateinischer Frakturschrift mit handkoloriertem Wittenberger Universitätssiegel. Oben die Widmung an Erzbischof Albrecht von Brandenburg.',
    reversTitle: 'Rückseite (Revers): Handschriftliche Randglossen & Thesen 1, 21, 62',
    reversDetails: 'Handschriftliche Notizen Luthers: „Dominus et magister noster Iesus Christus dicendo: Poenitentiam agite...“ – Da unser Herr Jesus Christus spricht: Tut Buße, wollte er, dass das ganze Leben der Gläubigen Buße sei.',
    didacticSummary: 'Luthers 95 Thesen griffen nicht den Papst an, sondern forderten eine Umkehr von der käuflichen Bezahlung zur echten inneren Reue.',
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
    aversTitle: 'Vorderseite (Avers): Relief-Reliefschnitt der Druckplatte',
    aversDetails: 'Spiegelverkehrt geschnittenes Birnbaumholz mit tiefer Kerbung. Dargestellt ist Christus, der den Jüngern die Füße wäscht – im Kontrast zum Papst, der sich von Königen die Füße küssen lässt.',
    reversTitle: 'Rückseite (Revers): Werkstatt-Brandstempel Cranachs',
    reversDetails: 'Der geflügelte Schlangenkopf mit Ring im Maul – das berühmte Wappen- und Meistersiegel der Cranach-Werkstatt, datiert auf das Jahr 1518.',
    didacticSummary: 'Cranachs aufrüttelnde Holzschnitte machten theologische Kritik durch drastische Bildgegensätze für jedermann sofort verständlich.',
    question: 'Warum spielten Holzschnitte und Flugblätter für den Erfolg der Reformation eine so gewaltige Rolle?',
    options: [
      'Weil sie von reitenden Boten und Händlern rasch im ganzen Reich verteilt wurden und auch Ungebildeten die Botschaft bildhaft erklärten.',
      'Weil der Kaiser das Malen von Bildern strenger bestrafte als das Schreiben von Büchern.',
      'Weil Druckerpressen damals ausschließlich mit königlichem Erlass betrieben werden durften.',
      'Weil die Kirche keine eigenen Bücher drucken konnte.',
    ],
    correctOption: 0,
    explanation: 'Durch die Kombination von Holzschnitten und Druckpressen entstand die erste echte Massenmedienkampagne der Weltgeschichte.',
  },
  {
    id: 'ablasskasten_tetzel',
    name: 'Johann Tetzels Ablasskasten',
    epoch: 'Kaufmanns-Kirche',
    year: '1517',
    location: 'Marktplatz zu Jüterbog',
    x: 72 * 16,
    y: 36 * 16,
    icon: '/assets/icons/relic_silberdenar.png',
    foundName: 'Eisenbeschlagene Ablass-Truhe',
    description: 'Schwere eichene Geldkiste mit drei Vorhängeschlössern zur Verwahrung der Ablassgelder des Dominikaners Johann Tetzel.',
    historicalSignificance: 'Die drei Schlüssel waren aufgeteilt: einen besaß Tetzel, einen der Fugger-Bankier und einen der Vertreter des Erzbischofs Albrecht. Erst wenn alle drei anwesend waren, konnte der Kasten geöffnet werden.',
    aversTitle: 'Vorderseite (Avers): Münzeinwurf & Eisengeschläg',
    aversDetails: 'Schmiedeeiserne Bänder über massiven Eichenbohlen mit schmalem Schlitz für rheinische Goldgulden und meißnische Groschen.',
    reversTitle: 'Rückseite (Revers): Drei Sicherheitsschlösser & Fugger-Siegel',
    reversDetails: 'Drei wuchtige Riegelschlösser des Fugger-Bankhauses Augsburg zur exakten Teilung der Einnahmen zwischen Rom und Erzbischofsschulden.',
    didacticSummary: 'Die Dreischloss-Truhe Tetzels belegt die enge Verflechtung von kirchlichem Seelenheil und frühkapitalistischem Bankenwesen.',
    question: 'Welchem Zweck diente die Aufteilung des Kastens auf drei verschiedene Schlüssel?',
    options: [
      'Damit kein Einzelner die Einnahmen veruntreuen konnte und die Fugger-Bank direkt ihren Anteil an den Erzbischofsschulden einzog.',
      'Damit Luther die Kiste vor dem Schlossportal nicht aufbrechen konnte.',
      'Weil der Kaiser das Geld für den Krieg gegen die Wikinger benötigte.',
      'Damit die Bauern den Kasten als Altar verwenden konnten.',
    ],
    correctOption: 0,
    explanation: 'Ein Teil floss an Papst Leo X. für den Bau des Petersdoms, die andere Hälfte ging direkt an das Augsburger Bankhaus Fugger zur Schuldentilgung.',
  },
  {
    id: 'septembertestament',
    name: 'Das Septembertestament (Wartburg-Bibel)',
    epoch: 'Bibelübersetzung',
    year: '1522',
    location: 'Wartburg bei Eisenach',
    x: 28 * 16,
    y: 72 * 16,
    icon: '/assets/icons/relic_lehnsurkunde.png',
    foundName: 'Erstdruck des Neuen Testaments auf Deutsch',
    description: 'Martin Luthers deutsche Übersetzung des Neuen Testaments nach dem griechischen Urtext des Erasmus von Rotterdam.',
    historicalSignificance: 'Auf der Wartburg übersetzte Luther das Neue Testament in nur elf Wochen. Es wurde das wirkungsmächtigste Buch der deutschen Sprachgeschichte.',
    aversTitle: 'Vorderseite (Avers): Schmucktitelblatt des Erstdrucks 1522',
    aversDetails: '„Das Newe Testament Deutzsch. Vuittemberg.“ Holzschnitt-Titelbordüre von Lucas Cranach mit Evangelistensymbolen und sächsischem Wappen.',
    reversTitle: 'Rückseite (Revers): Johannesprolog & Luthers Sprachkunst',
    reversDetails: '„Im Anfang war das Wort, und das Wort war bei Gott...“ – Luther übersetzte nicht Wort für Wort starr, sondern schuf bildhafte, volksnahe deutsche Wendungen.',
    didacticSummary: 'Luthers Bibelübersetzung schuf die neuhochdeutsche Schriftsprache und machte das Evangelium erstmals allen Schichten verständlich.',
    question: 'Welches Ziel verfolgte Martin Luther mit seiner Übersetzungsmethode „Dem Volk aufs Maul schauen“?',
    options: [
      'Er wollte eine lebendige, bildhafte deutsche Sprache nutzen, die von Bauern, Müttern und Marktleuten sofort verstanden wurde.',
      'Er wollte alle lateinischen Wörter wortwörtlich in derselben Satzstellung ins Deutsche kopieren.',
      'Er wollte die Bibel nur für die sächsischen Fürsten lesbar machen.',
      'Er wollte den Buchdruckern das Setzen der Lettern erleichtern.',
    ],
    correctOption: 0,
    explanation: 'Luther schuf viele bis heute gebräuchliche Sprichwörter wie „Ein Herz und eine Seele“, „Perlen vor die Säue werfen“ oder „Ein Buch mit sieben Siegeln“.',
  },
  {
    id: 'religionsfriede_1555',
    name: 'Der Augsburger Religionsfrieden',
    epoch: 'Reichsfrieden',
    year: '1555',
    location: 'Rathaus zu Augsburg',
    x: 82 * 16,
    y: 76 * 16,
    icon: '/assets/icons/relic_codex.png',
    foundName: 'Besiegelte Reichs-Friedensurkunde',
    description: 'Das Reichsgesetz von 1555, das die lutherische Konfession neben der katholischen reichsrechtlich voll anerkannte.',
    historicalSignificance: 'Beendete die jahrzehntelangen Glaubenskriege im Heiligen Römischen Reich und verankerte das Prinzip „Cuius regio, eius religio“ (Wessen das Land, dessen der Glaube).',
    aversTitle: 'Vorderseite (Avers): Urkundentext auf Großfolio-Pergament',
    aversDetails: 'Kaiserliches Edikt in deutscher Reichskanzleischrift mit goldenen Initialen, besiegelt von König Ferdinand I. und den Reichsständen.',
    reversTitle: 'Rückseite (Revers): Siegelbänder & Auswanderungsrecht (Ius emigrandi)',
    reversDetails: 'Elf herabhängende Wachssiegel in Holzkapseln und der berühmte Artikel zum Schutz von Andersgläubigen: Freies Abzugsrecht unter Mitnahme aller Güter.',
    didacticSummary: 'Der Augsburger Religionsfriede von 1555 sicherte das friedliche Nebeneinander zweier Konfessionen und begründete ein frühes Auswanderungsrecht.',
    question: 'Welche Auswirkung hatte die Regelung „Cuius regio, eius religio“ auf die einfache Bevölkerung?',
    options: [
      'Der Landesherr bestimmte die Religion; wer ihr nicht folgen wollte, durfte unter Mitnahme seines Vermögens auswandern.',
      'Jeder Bauer durfte jeden Sonntag frei wählen, in welche Kirche er ging.',
      'Alle katholischen Kirchen im Reich mussten sofort abgerissen werden.',
      'Die Untertanen durften fortan ihren Landesherrn in freien Wahlen bestimmen.',
    ],
    correctOption: 0,
    explanation: 'Das Ius emigrandi (Auswanderungsrecht) war ein wichtiger erster historischer Schritt auf dem langen Weg zur individuellen Religions- und Gewissensfreiheit.',
  },
];
