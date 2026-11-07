export interface LexiconEntry {
  id: string;
  term: string;
  category: 'Glaube & Theologie' | 'Medien & Handwerk' | 'Politik & Reich' | 'Persönlichkeiten' | 'Gesellschaft & Aufruhr';
  definition: string;
  historicalContext: string;
  merksatz: string;
  unlockHint: string;
  minChapter: number;
  unlockRelicId?: string;
  unlockCraftId?: string;
}

export const REFORMATION_LEXICON: LexiconEntry[] = [
  // 1
  {
    id: 'ablasshandel',
    term: 'Ablasshandel',
    category: 'Glaube & Theologie',
    definition: 'Der Erlass zeitlicher Sündenstrafen gegen den Erwerb eines päpstlichen Ablassbriefes durch Geldspenden.',
    historicalContext: 'Im Spätmittelalter entwickelte sich der Ablass zu einem lukrativen Finanzgeschäft der Kirche, mit dem der Neubau des Petersdoms in Rom und Schulden von Fürstbischöfen finanziert wurden.',
    merksatz: 'Der Ablasshandel wandelte das biblische Bußverständnis in ein käufliches Geldgeschäft um und entfachte Luthers Protest.',
    unlockHint: 'Schließe die Rechenprüfung an Tetzels Ablass-Station in Kapitel 1 ab.',
    minChapter: 1,
  },
  // 2
  {
    id: 'thesen_95',
    term: '95 Thesen',
    category: 'Glaube & Theologie',
    definition: 'Akademische Streitsätze Martin Luthers, in denen er den Ablasshandel scharf anprangerte und zu einer Disputation aufrief.',
    historicalContext: 'Am 31. Oktober 1517 sandte Luther die Thesen an Erzbischof Albrecht von Brandenburg und schlug sie der Überlieferung nach an das Portal der Schlosskirche zu Wittenberg.',
    merksatz: 'Die 95 Thesen gelten als Ausgangspunkt und zündender Funke der gesamten europäischen Reformation.',
    unlockHint: 'Hebe die Handschrift der 95 Thesen am Schlosskirchenportal auf (Kapitel 1).',
    minChapter: 1,
    unlockRelicId: 'thesen_95',
  },
  // 3
  {
    id: 'fegefeuer',
    term: 'Fegefeuer (Purgatorium)',
    category: 'Glaube & Theologie',
    definition: 'Der nach mittelalterlicher Theologie angenommene Ort der Läuterung für Seelen vor dem Eintritt in den Himmel.',
    historicalContext: 'Die tief sitzende Furcht der Menschen vor den Qualen des Fegefeuers wurde von Ablasspredigern gezielt für Geldwerbung ausgenutzt („Wenn das Geld im Kasten klingt...“).',
    merksatz: 'Die Angst vor den Peinen des Fegefeuers war die wichtigste Triebfeder des spätmittelalterlichen Ablasshandels.',
    unlockHint: 'Sprich in Kapitel 1 mit Martin Luther im Augustinerkloster.',
    minChapter: 1,
  },
  // 4
  {
    id: 'priestertum_aller',
    term: 'Priestertum aller Gläubigen',
    category: 'Glaube & Theologie',
    definition: 'Reformatorische Lehre, dass jeder getaufte Christ einen unmittelbaren Zugang zu Gott besitzt und keinen Klerus als Heilsmittler braucht.',
    historicalContext: 'Luther formulierte diesen Grundsatz 1520 in seiner Schrift „An den christlichen Adel deutscher Nation“. Er entmachtete damit das sakrale Monopol der Priesterkaste.',
    merksatz: 'Das Priestertum aller Gläubigen begründete die Gleichheit aller Getauften vor Gott und stärkte das individuelle Gewissen.',
    unlockHint: 'Schließe das erste Kapitel in Wittenberg erfolgreich ab.',
    minChapter: 1,
  },
  // 5
  {
    id: 'buchdruck',
    term: 'Buchdruck mit beweglichen Lettern',
    category: 'Medien & Handwerk',
    definition: 'Um 1450 von Johannes Gutenberg in Mainz entwickelte mechanische Drucktechnik mit gegossenen Metalltypen.',
    historicalContext: 'Der Buchdruck war die technische Grundvoraussetzung für den Erfolg der Reformation. Luthers Schriften konnten binnen Tagen in Tausenden Exemplaren im Reich verbreitet werden.',
    merksatz: 'Erst durch den Buchdruck mit beweglichen Lettern wurde aus einem regionalen Mönchsstreit eine weltweite Medienrevolution.',
    unlockHint: 'Setze Lettern im Gutenberg-Simulator der Werkstatt Cranach (Kapitel 2).',
    minChapter: 2,
  },
  // 6
  {
    id: 'flugschrift',
    term: 'Flugschrift & Flugblatt',
    category: 'Medien & Handwerk',
    definition: 'Kurze, preiswerte Druckschriften mit Text und bildkräftigen Holzschnitten zur schnellen Information und Meinungsbildung.',
    historicalContext: 'Flugschriften fungierten als die „sozialen Medien“ des 16. Jahrhunderts. Wandernde Kolporteure und Händler trugen sie bis in die entlegensten Dörfer.',
    merksatz: 'Flugschriften und illustrierte Flugblätter machten theologische Debatten erstmals für das breite Volk begreifbar.',
    unlockHint: 'Drucke dein erstes Flugblatt „SOLA FIDE“ in Meister Cranachs Offizin.',
    minChapter: 2,
    unlockCraftId: 'flugblatt_sola_fide',
  },
  // 7
  {
    id: 'cranach_der_aeltere',
    term: 'Lucas Cranach der Ältere (1472–1553)',
    category: 'Persönlichkeiten',
    definition: 'Bedeutender deutscher Maler, Kupferstecher, Buchdrucker, Ratsherr und Wittenberger Bürgermeister.',
    historicalContext: 'Als enger Freund Luthers schuf Cranach die prägenden Bildnisse der Reformatoren und illustrierte deren Schriften und Bibelausgaben mit aufrüttelnden Holzschnitten.',
    merksatz: 'Lucas Cranach der Ältere war der mediale Bildgestalter der Reformation und prägte das Bildgedächtnis einer Epoche.',
    unlockHint: 'Tritt in Kapitel 2 in Cranachs Hofatelier & Druckerei ein.',
    minChapter: 2,
  },
  // 8
  {
    id: 'sola_scriptura',
    term: 'Sola Scriptura (Allein die Schrift)',
    category: 'Glaube & Theologie',
    definition: 'Das Prinzip, dass allein die Bibel Maßstab und Richtschnur des Glaubens sein darf, nicht päpstliche Dekrete oder Tradition.',
    historicalContext: 'Luther berief sich beim Verhör in Augsburg (1518) und in Worms (1521) darauf, dass sein Gewissen an die Heilige Schrift gebunden sei.',
    merksatz: '„Sola Scriptura“ erhob die biblische Botschaft über alle kirchlichen Hierarchien und Konzilien.',
    unlockHint: 'Bestehe das theologische Streitgespräch vor Kardinal Cajetan in Kapitel 3.',
    minChapter: 3,
  },
  // 9
  {
    id: 'sola_fide',
    term: 'Sola Fide (Allein durch Glauben)',
    category: 'Glaube & Theologie',
    definition: 'Der Mensch wird vor Gott allein durch sein unerschütterliches Vertrauen auf Gottes Verheißung gerechtfertigt, nicht durch gute Werke.',
    historicalContext: 'Luther entdeckte diesen Gedanken beim sogenannten „Turmerlebnis“ beim Studium des Römerbriefs (Röm 1,17).',
    merksatz: '„Sola Fide“ befreite die Gläubigen von der ständigen Seelenangst, sich das Himmelreich durch Bezahlung erkaufen zu müssen.',
    unlockHint: 'Verteidige das Rechtfertigungsprinzip im Fuggerpalais zu Augsburg.',
    minChapter: 3,
  },
  // 10
  {
    id: 'sola_gratia',
    term: 'Sola Gratia (Allein durch Gnade)',
    category: 'Glaube & Theologie',
    definition: 'Die Erlösung des sündigen Menschen ist ein reines, unverdientes Gnadengeschenk Gottes.',
    historicalContext: 'Widersprach der kirchlichen Leistungsgerechtigkeit, nach der sich Gläubige durch Wallfahrten, Stiftungen und Ablässe Verdienste erwerben sollten.',
    merksatz: '„Sola Gratia“ betont, dass Gottes rettende Zuwendung unbezahlbar und unverdient ist.',
    unlockHint: 'Schließe das Verhör zu Augsburg in Kapitel 3 ab.',
    minChapter: 3,
  },
  // 11
  {
    id: 'solus_christus',
    term: 'Solus Christus (Allein Christus)',
    category: 'Glaube & Theologie',
    definition: 'Allein das stellvertretende Werk Jesu Christi am Kreuz versöhnt den Menschen mit Gott, keine Heiligen oder Geistlichen.',
    historicalContext: 'Zusammen mit Sola Scriptura, Sola Fide und Sola Gratia bildet Solus Christus die vier reformatorischen „Soli“ (Grundpfeiler).',
    merksatz: 'Die vier „Soli“ formulieren das theologische Fundament der evangelischen Bewegung in vier knappen Lehrsätzen.',
    unlockHint: 'Finde die Botschaft an Kurfürst Friedrich in Kapitel 3.',
    minChapter: 3,
  },
  // 12
  {
    id: 'bannbulle_exsurge',
    term: 'Bannbulle (Exsurge Domine 1520)',
    category: 'Politik & Reich',
    definition: 'Päpstliches Dekret Papst Leos X., das 41 Sätze Luthers als ketzerisch verdammte und ihm den Bann androhte.',
    historicalContext: 'Luther verbrannte die Bulle am 10. Dezember 1520 vor dem Elstertor in Wittenberg. Daraufhin schloss Rom ihn mit „Decet Romanum Pontificem“ endgültig aus der Kirche aus.',
    merksatz: 'Die Verbrennung der päpstlichen Bannbulle 1520 besiegelte den unwiderruflichen Bruch zwischen Luther und dem römischen Papsttum.',
    unlockHint: 'Berge das päpstliche Siegel im Augsburger Fuggerpalais.',
    minChapter: 3,
    unlockRelicId: 'lehnsurkunde',
  },
  // 13
  {
    id: 'reichstag_worms',
    term: 'Reichstag zu Worms (1521)',
    category: 'Politik & Reich',
    definition: 'Versammlung der Reichsstände unter Vorsitz des neu gekrönten jungen Kaisers Karl V.',
    historicalContext: 'Luther sollte vor Kaiser und Kurfürsten seine Schriften widerrufen. Seine berühmte Weigerung markiert den Durchbruch der Gewissensfreiheit.',
    merksatz: 'Auf dem Reichstag zu Worms 1521 verteidigte Luther mutig seine Überzeugung vor der mächtigsten Versammlung der Christenheit.',
    unlockHint: 'Tritt vor Kaiser Karl V. im Bürgersaal zu Worms (Kapitel 4).',
    minChapter: 4,
  },
  // 14
  {
    id: 'karl_v',
    term: 'Kaiser Karl V. (1500–1558)',
    category: 'Persönlichkeiten',
    definition: 'Habsburger Herrscher eines Weltreiches, in dem „die Sonne niemals unterging“.',
    historicalContext: 'Sah sich als weltlicher Beschützer der katholischen Universalkirche, musste aber im Ringen mit Frankreich und dem Osmanischen Reich oft politische Zugeständnisse machen.',
    merksatz: 'Kaiser Karl V. verteidigte die Reichseinheit der alten Kirche, scheiterte jedoch an der Entschlossenheit der protestantischen Stände.',
    unlockHint: 'Betrete den Kaiserlichen Reichstagssaal zu Worms in Kapitel 4.',
    minChapter: 4,
  },
  // 15
  {
    id: 'reichsacht',
    term: 'Reichsacht (Wormser Edikt 1521)',
    category: 'Politik & Reich',
    definition: 'Die kaiserliche Ächtung, die den Verurteilten rechtlos stellte („vogelfrei“) und Luthers Schriften verbot.',
    historicalContext: 'Niemand durfte Luther mehr beherbergen oder verpflegen. Kurfürst Friedrich der Weise ließ ihn zum Schutz heimlich entführen.',
    merksatz: 'Das Wormser Edikt machte Luther vogelfrei, konnte die Ausbreitung seiner Lehre im Volk aber nicht mehr stoppen.',
    unlockHint: 'Schließe das vierte Kapitel (Standhaftigkeit vor Karl V.) ab.',
    minChapter: 4,
  },
  // 16
  {
    id: 'wartburg',
    term: 'Wartburg bei Eisenach',
    category: 'Politik & Reich',
    definition: 'Thüringer Höhenburg der Landgrafen, auf der Martin Luther von Mai 1521 bis März 1522 im Verborgenen lebte.',
    historicalContext: 'Als „Junker Jörg“ mit Bart und Schwert getarnt, vollbrachte Luther hier in nur zehn Wochen die epochale Übersetzung des Neuen Testaments ins Deutsche.',
    merksatz: 'Die Wartburg bot Luther Zuflucht und wurde zur Wiege der neuhochdeutschen Schriftsprache.',
    unlockHint: 'Betrete die Schreibstube auf der Wartburg in Kapitel 5.',
    minChapter: 5,
  },
  // 17
  {
    id: 'humanismus_erasmus',
    term: 'Humanismus & Erasmus von Rotterdam',
    category: 'Persönlichkeiten',
    definition: 'Gelehrtenbewegung der Renaissance, die das Studium der antiken Originalquellen einforderte („Ad fontes – Zu den Quellen“).',
    historicalContext: 'Erasmus von Rotterdam edierte 1516 das griechische Ur-Neue Testament (Novum Instrumentum), das Luther als wissenschaftliche Grundlage seiner Übersetzung diente.',
    merksatz: 'Der Humanismus lieferte mit dem Ruf „Ad fontes“ das sprachliche Werkzeug für die reformatorische Schriftauslegung.',
    unlockHint: 'Untersuche das griechische Erasmus-Testament auf Luthers Lesepult in der Wartburg-Stube.',
    minChapter: 5,
  },
  // 18
  {
    id: 'septembertestament',
    term: 'Septembertestament (1522)',
    category: 'Medien & Handwerk',
    definition: 'Die erste Auflage von Martin Luthers deutscher Übersetzung des Neuen Testaments, gedruckt in Wittenberg im September 1522.',
    historicalContext: 'Mit 3.000 Exemplaren erschien das Buch in rekordverdächtiger Auflage. Luther schuf damit das Fundament der modernen deutschen Gemeinsprache („Dem Volk aufs Maul schauen“).',
    merksatz: 'Das Septembertestament ermöglichte Laien das eigene Lesen der Bibel und einte die deutschen Dialekte zu einer gemeinsamen Schriftsprache.',
    unlockHint: 'Berge das gedruckte Septembertestament in Kapitel 5.',
    minChapter: 5,
    unlockRelicId: 'septembertestament',
  },
  // 19
  {
    id: 'friedrich_der_weise',
    term: 'Kurfürst Friedrich der Weise (1463–1525)',
    category: 'Persönlichkeiten',
    definition: 'Kurfürst von Sachsen und Gründer der Universität Wittenberg (1502).',
    historicalContext: 'Schützte Luther aus landesherrlicher Klugheit vor päpstlichem Zugriff und verweigerte seine Auslieferung nach Rom, ohne sich selbst früh öffentlich als Lutheraner zu bekennen.',
    merksatz: 'Ohne den politischen Schutzschirm Friedrichs des Weisen wäre Martin Luther auf dem Scheiterhaufen geendet.',
    unlockHint: 'Reiche Friedrichs Schutzbrief am Hofe ein.',
    minChapter: 5,
  },
  // 20
  {
    id: 'katharina_von_bora',
    term: 'Katharina von Bora (1499–1552)',
    category: 'Persönlichkeiten',
    definition: 'Ehemalige Zisterziensernonne, die aus dem Kloster Nimbschen floh und 1525 Martin Luther heiratete („Die Lutherin“).',
    historicalContext: 'Als kluge Wirtschafterin leitete sie das Schwarze Kloster, versorgte Familie, Studenten und Gäste, betrieb eine Brauerei, Fischteiche und eine Klosterapotheke.',
    merksatz: 'Katharina von Bora schuf mit Luther das Vorbild des evangelischen Pfarrhauses und bewies herausragendes unternehmerisches Geschick.',
    unlockHint: 'Sprich mit Katharina von Bora im Refektorium des Schwarzen Klosters (Kapitel 6).',
    minChapter: 6,
  },
  // 21
  {
    id: 'philipp_melanchthon',
    term: 'Philipp Melanchthon (1497–1560)',
    category: 'Persönlichkeiten',
    definition: 'Universalgelehrter, Professor für Griechisch in Wittenberg und „Lehrer Deutschlands“ (Praeceptor Germaniae).',
    historicalContext: 'Systematisierte die lutherische Theologie, verfasste die Confessio Augustana (1530) und reformierte das gesamte Schul- und Universitätswesen.',
    merksatz: 'Philipp Melanchthon verband reformatorischen Glauben mit humanistischer Bildung und formte das deutsche Schulwesen.',
    unlockHint: 'Löse die historische Quellenprüfung an Melanchthons Pult.',
    minChapter: 6,
  },
  // 22
  {
    id: 'bauernkrieg',
    term: 'Der Deutsche Bauernkrieg (1524–1525)',
    category: 'Gesellschaft & Aufruhr',
    definition: 'Aufstand der Bauern und Stadtbürger gegen feudale Abgabenlasten, Leibeigenschaft und Rechtswillkür.',
    historicalContext: 'Die Bauern beriefen sich auf das Evangelium und Luthers Freiheitsbegriff. Luther distanzierte sich jedoch scharf von jeglicher gewaltsamer Rebellion.',
    merksatz: 'Der Bauernkrieg zeigte die tiefe soziale Spaltung des Reiches und scheiterte an der militärischen Übermacht der Landesfürsten.',
    unlockHint: 'Erreiche das Bauernlager bei Frankenhausen in Kapitel 7.',
    minChapter: 7,
  },
  // 23
  {
    id: 'zwoelf_artikel',
    term: 'Die Zwölf Artikel (1525)',
    category: 'Gesellschaft & Aufruhr',
    definition: 'Die berühmteste Flugschrift der aufständischen Bauernschaft, verfasst in Memmingen im März 1525.',
    historicalContext: 'Forderte u. a. freie Pfarrerwahl, Abschaffung des Kleinzehnten, Freigabe von Holz-, Jagd- und Fischrechten sowie die Aufhebung der Leibeigenschaft.',
    merksatz: 'Die Zwölf Artikel gelten als eine der frühesten schriftlichen Formulierungen von Menschen- und Freiheitsrechten in Europa.',
    unlockHint: 'Löse die Stationsprüfung zur Beschwerdeschrift der Bauernschaft.',
    minChapter: 7,
  },
  // 24
  {
    id: 'thomas_muentzer',
    term: 'Thomas Müntzer (1489–1525)',
    category: 'Persönlichkeiten',
    definition: 'Priester, radikaler Theologe und geistlicher Anführer der thüringischen Bauern bei Frankenhausen.',
    historicalContext: 'Predigte den Sturz der gottlosen Obrigkeit und die Gütergemeinschaft („Omnia sunt communia“). Nach der Niederlage bei Frankenhausen wurde er hingerichtet.',
    merksatz: 'Thomas Müntzer forderte die radikale Verwirklichung des Reiches Gottes auf Erden zur Befreiung der Armen und Unterdrückten.',
    unlockHint: 'Führe das Streitgespräch vor Müntzers Regenbogenfahne (Kapitel 7).',
    minChapter: 7,
  },
  // 25
  {
    id: 'confessio_augustana',
    term: 'Confessio Augustana (1530)',
    category: 'Glaube & Theologie',
    definition: 'Das Augsburger Bekenntnis – das grundlegende Lehrbekenntnis der lutherischen Reichsstände.',
    historicalContext: 'Verfasst von Philipp Melanchthon und Kaiser Karl V. auf dem Reichstag zu Augsburg 1530 in lateinischer und deutscher Fassung überreicht.',
    merksatz: 'Die Confessio Augustana von 1530 ist bis heute das maßgebliche theologische Bekenntnisdokument der weltweiten lutherischen Kirchen.',
    unlockHint: 'Berge die Urkunde des Augsburger Bekenntnisses in Kapitel 8.',
    minChapter: 8,
    unlockRelicId: 'confessio',
  },
  // 26
  {
    id: 'augsburger_religionsfrieden',
    term: 'Augsburger Religionsfrieden (1555)',
    category: 'Politik & Reich',
    definition: 'Reichsgesetzlicher Friedensvertrag zwischen König Ferdinand I. und den Reichsständen zur Beendigung der Religionskriege.',
    historicalContext: 'Erkannte das lutherische Bekenntnis reichsrechtlich als gleichberechtigt an und brachte dem Heiligen Römischen Reich über sechs Jahrzehnte inneren Frieden.',
    merksatz: 'Der Augsburger Religionsfrieden von 1555 beendete das Zeitalter der Reformationswirren durch einen völkerrechtlichen Kompromiss.',
    unlockHint: 'Siegele den Friedensvertrag am Augsburger Rathaussaal.',
    minChapter: 8,
    unlockRelicId: 'religionsfriede_1555',
  },
  // 27
  {
    id: 'cuius_regio',
    term: 'Cuius regio, eius religio',
    category: 'Politik & Reich',
    definition: 'Rechtsgrundsatz des Friedens von 1555: „Wessen das Land, dessen der Glaube“ – der Landesherr bestimmt die Konfession.',
    historicalContext: 'Untertanen durften nicht gezwungen werden, gegen ihr Gewissen zu handeln, sondern erhielten das Recht, unter Mitnahme ihres Eigentums auszuwandern (ius emigrandi).',
    merksatz: 'Das Prinzip „Cuius regio, eius religio“ schuf Frieden zwischen Staaten, unterwarf die Religion der Untertanen jedoch der fürstlichen Landeshoheit.',
    unlockHint: 'Schließe das finale Kapitel 8 und die gesamte Reformations-Chronik ab.',
    minChapter: 8,
  },
];

export const LEXICON = REFORMATION_LEXICON;
