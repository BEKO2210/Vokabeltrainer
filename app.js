/**
 * Vokabel Master+ - Vokabeltrainer PWA
 * Mobile-First, Offline-First, Keine externen Abhängigkeiten
 */

// ============================================
// KONSTANTEN & KONFIGURATION
// ============================================

const CONFIG = {
  // Spaced Repetition Intervalle (in Tagen)
  INTERVALS: [1, 3, 7, 14, 30, 60],
  // IndexedDB Konfiguration
  DB_NAME: 'vokabel-master-db',
  DB_VERSION: 2,
  // Stores
  STORE_VOCAB: 'vocabulary',
  STORE_PROGRESS: 'progress',
  STORE_SETTINGS: 'settings',
  STORE_STATS: 'stats',
  STORE_SELECTION: 'selection',
  // Daily Goal
  DAILY_GOAL: 20, // Number of correct answers to reach daily goal
  // Default Einstellungen
  DEFAULT_SETTINGS: {
    theme: 'system',
    tolerantMode: true, // Groß-/Kleinschreibung ignorieren
    showHints: true,
    speechEnabled: true,
    speechLang: 'en-US',
    nativeLang: 'de-DE',
    cardsPerSession: 20,
    soundEnabled: false, // Sound effects for correct/incorrect answers (default off)
    practiceDirection: 'de-en' // 'de-en' = show German, answer English; 'en-de' = opposite
  },
  // Quiz Optionen
  MC_OPTIONS_COUNT: 4
};

// ============================================
// PRESET VOCABULARY DATA (embedded for file:// compatibility)
// ============================================

const PRESET_VOCABULARY = {
  "categories": [
    {
      "name": "Alltag & Reisen",
      "words": [
        { "native": "der Flughafen", "foreign": "airport", "example": "Wir fahren zum Flughafen." },
        { "native": "das Flugzeug", "foreign": "airplane", "example": "Das Flugzeug landet um 14 Uhr." },
        { "native": "der Bahnhof", "foreign": "train station", "example": "Der Bahnhof ist in der Stadtmitte." },
        { "native": "der Zug", "foreign": "train", "example": "Der Zug kommt in zehn Minuten." },
        { "native": "die U-Bahn", "foreign": "subway", "example": "Wir nehmen die U-Bahn." },
        { "native": "der Bus", "foreign": "bus", "example": "Der Bus faehrt alle 15 Minuten." },
        { "native": "das Taxi", "foreign": "taxi", "example": "Ich rufe ein Taxi." },
        { "native": "das Auto", "foreign": "car", "example": "Mein Auto ist blau." },
        { "native": "das Fahrrad", "foreign": "bicycle", "example": "Ich fahre mit dem Fahrrad zur Arbeit." },
        { "native": "die Fahrkarte", "foreign": "ticket", "example": "Ich kaufe eine Fahrkarte." },
        { "native": "der Koffer", "foreign": "suitcase", "example": "Mein Koffer ist schwer." },
        { "native": "der Rucksack", "foreign": "backpack", "example": "Ich packe meinen Rucksack." },
        { "native": "der Pass", "foreign": "passport", "example": "Vergiss deinen Pass nicht!" },
        { "native": "das Visum", "foreign": "visa", "example": "Brauche ich ein Visum?" },
        { "native": "die Grenze", "foreign": "border", "example": "Wir ueberqueren die Grenze." },
        { "native": "das Hotel", "foreign": "hotel", "example": "Das Hotel hat fuenf Sterne." },
        { "native": "das Zimmer", "foreign": "room", "example": "Ich moechte ein Zimmer reservieren." },
        { "native": "die Rezeption", "foreign": "reception", "example": "Die Rezeption ist im Erdgeschoss." },
        { "native": "der Schluessel", "foreign": "key", "example": "Hier ist Ihr Schluessel." },
        { "native": "das Fruehstueck", "foreign": "breakfast", "example": "Das Fruehstueck ist inklusive." },
        { "native": "das Restaurant", "foreign": "restaurant", "example": "Wir essen im Restaurant." },
        { "native": "das Cafe", "foreign": "cafe", "example": "Treffen wir uns im Cafe?" },
        { "native": "die Speisekarte", "foreign": "menu", "example": "Kann ich die Speisekarte haben?" },
        { "native": "die Rechnung", "foreign": "bill", "example": "Die Rechnung, bitte." },
        { "native": "das Trinkgeld", "foreign": "tip", "example": "Wir geben zehn Prozent Trinkgeld." },
        { "native": "der Kellner", "foreign": "waiter", "example": "Der Kellner ist sehr freundlich." },
        { "native": "die Kellnerin", "foreign": "waitress", "example": "Die Kellnerin bringt das Essen." },
        { "native": "die Strasse", "foreign": "street", "example": "Die Strasse ist sehr lang." },
        { "native": "die Kreuzung", "foreign": "intersection", "example": "Biegen Sie an der Kreuzung rechts ab." },
        { "native": "die Ampel", "foreign": "traffic light", "example": "Warten Sie an der Ampel." },
        { "native": "geradeaus", "foreign": "straight ahead", "example": "Gehen Sie geradeaus." },
        { "native": "links", "foreign": "left", "example": "Biegen Sie links ab." },
        { "native": "rechts", "foreign": "right", "example": "Das Museum ist rechts." },
        { "native": "die Ecke", "foreign": "corner", "example": "Das Geschaeft ist an der Ecke." },
        { "native": "die Bruecke", "foreign": "bridge", "example": "Gehen Sie ueber die Bruecke." },
        { "native": "der Platz", "foreign": "square", "example": "Der Marktplatz ist schoen." },
        { "native": "das Geschaeft", "foreign": "shop", "example": "Das Geschaeft oeffnet um neun." },
        { "native": "der Supermarkt", "foreign": "supermarket", "example": "Ich kaufe im Supermarkt ein." },
        { "native": "die Baeckerei", "foreign": "bakery", "example": "Die Baeckerei hat frisches Brot." },
        { "native": "die Apotheke", "foreign": "pharmacy", "example": "Die Apotheke ist gegenueber." },
        { "native": "die Bank", "foreign": "bank", "example": "Ich muss zur Bank gehen." },
        { "native": "das Geld", "foreign": "money", "example": "Ich brauche mehr Geld." },
        { "native": "der Geldautomat", "foreign": "ATM", "example": "Wo ist der naechste Geldautomat?" },
        { "native": "die Kreditkarte", "foreign": "credit card", "example": "Kann ich mit Kreditkarte zahlen?" },
        { "native": "bar", "foreign": "cash", "example": "Ich zahle bar." },
        { "native": "teuer", "foreign": "expensive", "example": "Das ist zu teuer." },
        { "native": "billig", "foreign": "cheap", "example": "Diese Jacke ist billig." },
        { "native": "der Preis", "foreign": "price", "example": "Was ist der Preis?" },
        { "native": "der Rabatt", "foreign": "discount", "example": "Gibt es einen Rabatt?" },
        { "native": "das Wetter", "foreign": "weather", "example": "Wie ist das Wetter heute?" },
        { "native": "die Sonne", "foreign": "sun", "example": "Die Sonne scheint." },
        { "native": "der Regen", "foreign": "rain", "example": "Es gibt Regen." },
        { "native": "der Schnee", "foreign": "snow", "example": "Im Winter faellt Schnee." },
        { "native": "der Wind", "foreign": "wind", "example": "Der Wind ist stark heute." },
        { "native": "die Wolke", "foreign": "cloud", "example": "Viele Wolken am Himmel." },
        { "native": "warm", "foreign": "warm", "example": "Es ist warm draussen." },
        { "native": "kalt", "foreign": "cold", "example": "Der Winter ist kalt." },
        { "native": "heiss", "foreign": "hot", "example": "Der Sommer ist heiss." },
        { "native": "kuehl", "foreign": "cool", "example": "Die Abende sind kuehl." },
        { "native": "die Uhr", "foreign": "clock/watch", "example": "Wie spaet ist es auf der Uhr?" },
        { "native": "die Stunde", "foreign": "hour", "example": "Wir warten eine Stunde." },
        { "native": "die Minute", "foreign": "minute", "example": "Fuenf Minuten noch." },
        { "native": "heute", "foreign": "today", "example": "Heute gehe ich einkaufen." },
        { "native": "morgen", "foreign": "tomorrow", "example": "Morgen fahren wir ab." },
        { "native": "gestern", "foreign": "yesterday", "example": "Gestern war ich muede." },
        { "native": "jetzt", "foreign": "now", "example": "Ich muss jetzt gehen." },
        { "native": "spaeter", "foreign": "later", "example": "Wir sehen uns spaeter." },
        { "native": "frueher", "foreign": "earlier", "example": "Ich bin frueher gekommen." },
        { "native": "die Woche", "foreign": "week", "example": "Naechste Woche habe ich Urlaub." },
        { "native": "der Monat", "foreign": "month", "example": "Dieser Monat ist kurz." },
        { "native": "das Jahr", "foreign": "year", "example": "Das neue Jahr beginnt." },
        { "native": "Guten Morgen", "foreign": "good morning", "example": "Guten Morgen, wie geht es Ihnen?" },
        { "native": "Guten Tag", "foreign": "good day", "example": "Guten Tag, kann ich Ihnen helfen?" },
        { "native": "Guten Abend", "foreign": "good evening", "example": "Guten Abend, willkommen." },
        { "native": "Gute Nacht", "foreign": "good night", "example": "Gute Nacht, schlaf gut." },
        { "native": "Auf Wiedersehen", "foreign": "goodbye", "example": "Auf Wiedersehen, bis bald!" },
        { "native": "Tschuess", "foreign": "bye", "example": "Tschuess, bis morgen!" },
        { "native": "Bitte", "foreign": "please/you're welcome", "example": "Bitte, kommen Sie herein." },
        { "native": "Danke", "foreign": "thank you", "example": "Danke fuer Ihre Hilfe." },
        { "native": "Entschuldigung", "foreign": "excuse me/sorry", "example": "Entschuldigung, wo ist die Toilette?" },
        { "native": "ja", "foreign": "yes", "example": "Ja, das ist richtig." },
        { "native": "nein", "foreign": "no", "example": "Nein, das stimmt nicht." },
        { "native": "vielleicht", "foreign": "maybe", "example": "Vielleicht komme ich spaeter." },
        { "native": "Ich verstehe", "foreign": "I understand", "example": "Ich verstehe, danke." },
        { "native": "Ich verstehe nicht", "foreign": "I don't understand", "example": "Ich verstehe nicht, bitte wiederholen." },
        { "native": "Sprechen Sie Englisch?", "foreign": "Do you speak English?", "example": "Entschuldigung, sprechen Sie Englisch?" },
        { "native": "Wie bitte?", "foreign": "Pardon?", "example": "Wie bitte? Ich habe nicht gehoert." },
        { "native": "Hilfe", "foreign": "help", "example": "Ich brauche Hilfe!" },
        { "native": "der Notfall", "foreign": "emergency", "example": "Das ist ein Notfall." },
        { "native": "die Polizei", "foreign": "police", "example": "Rufen Sie die Polizei." },
        { "native": "der Arzt", "foreign": "doctor", "example": "Ich brauche einen Arzt." },
        { "native": "das Krankenhaus", "foreign": "hospital", "example": "Wo ist das naechste Krankenhaus?" },
        { "native": "die Toilette", "foreign": "toilet/restroom", "example": "Wo ist die Toilette bitte?" },
        { "native": "der Ausgang", "foreign": "exit", "example": "Der Ausgang ist dort." },
        { "native": "der Eingang", "foreign": "entrance", "example": "Der Eingang ist auf der anderen Seite." },
        { "native": "geoeffnet", "foreign": "open", "example": "Das Museum ist geoeffnet." },
        { "native": "geschlossen", "foreign": "closed", "example": "Das Geschaeft ist geschlossen." },
        { "native": "frei", "foreign": "free/available", "example": "Ist dieser Platz frei?" },
        { "native": "besetzt", "foreign": "occupied", "example": "Dieser Tisch ist besetzt." },
        { "native": "das Handgepaeck", "foreign": "carry-on luggage", "example": "Mein Handgepaeck ist leicht." }
      ]
    },
    {
      "name": "Schule & Bildung",
      "words": [
        { "native": "die Schule", "foreign": "school", "example": "Die Schule beginnt um acht Uhr." },
        { "native": "die Universitaet", "foreign": "university", "example": "Ich studiere an der Universitaet." },
        { "native": "der Lehrer", "foreign": "teacher (male)", "example": "Der Lehrer erklaert die Aufgabe." },
        { "native": "die Lehrerin", "foreign": "teacher (female)", "example": "Die Lehrerin ist sehr nett." },
        { "native": "der Schueler", "foreign": "student (male)", "example": "Der Schueler macht Hausaufgaben." },
        { "native": "die Schuelerin", "foreign": "student (female)", "example": "Die Schuelerin lernt fleissig." },
        { "native": "der Student", "foreign": "university student (male)", "example": "Der Student besucht Vorlesungen." },
        { "native": "die Studentin", "foreign": "university student (female)", "example": "Die Studentin schreibt ihre Arbeit." },
        { "native": "das Klassenzimmer", "foreign": "classroom", "example": "Das Klassenzimmer ist gross." },
        { "native": "die Tafel", "foreign": "blackboard", "example": "Der Lehrer schreibt an die Tafel." },
        { "native": "der Schreibtisch", "foreign": "desk", "example": "Mein Schreibtisch ist ordentlich." },
        { "native": "der Stuhl", "foreign": "chair", "example": "Bitte setzen Sie sich auf den Stuhl." },
        { "native": "das Buch", "foreign": "book", "example": "Ich lese ein Buch." },
        { "native": "das Heft", "foreign": "notebook", "example": "Ich schreibe in mein Heft." },
        { "native": "der Bleistift", "foreign": "pencil", "example": "Ich brauche einen Bleistift." },
        { "native": "der Kugelschreiber", "foreign": "pen", "example": "Hast du einen Kugelschreiber?" },
        { "native": "der Radiergummi", "foreign": "eraser", "example": "Ich habe meinen Radiergummi vergessen." },
        { "native": "das Lineal", "foreign": "ruler", "example": "Zeichne mit dem Lineal eine Linie." },
        { "native": "die Schere", "foreign": "scissors", "example": "Ich schneide mit der Schere." },
        { "native": "der Taschenrechner", "foreign": "calculator", "example": "Du darfst den Taschenrechner benutzen." },
        { "native": "der Computer", "foreign": "computer", "example": "Wir arbeiten am Computer." },
        { "native": "das Woerterbuch", "foreign": "dictionary", "example": "Schlag das Wort im Woerterbuch nach." },
        { "native": "die Bibliothek", "foreign": "library", "example": "Ich lerne in der Bibliothek." },
        { "native": "die Hausaufgabe", "foreign": "homework", "example": "Ich mache meine Hausaufgaben." },
        { "native": "die Pruefung", "foreign": "exam", "example": "Morgen habe ich eine Pruefung." },
        { "native": "der Test", "foreign": "test", "example": "Der Test war schwer." },
        { "native": "die Note", "foreign": "grade", "example": "Ich habe eine gute Note bekommen." },
        { "native": "das Zeugnis", "foreign": "report card", "example": "Mein Zeugnis ist sehr gut." },
        { "native": "bestehen", "foreign": "to pass", "example": "Ich habe die Pruefung bestanden." },
        { "native": "durchfallen", "foreign": "to fail", "example": "Er ist leider durchgefallen." },
        { "native": "lernen", "foreign": "to learn", "example": "Ich lerne jeden Tag." },
        { "native": "studieren", "foreign": "to study", "example": "Sie studiert Medizin." },
        { "native": "lesen", "foreign": "to read", "example": "Ich lese gern Buecher." },
        { "native": "schreiben", "foreign": "to write", "example": "Schreib deinen Namen." },
        { "native": "rechnen", "foreign": "to calculate", "example": "Kinder lernen rechnen." },
        { "native": "verstehen", "foreign": "to understand", "example": "Ich verstehe die Frage nicht." },
        { "native": "erklaeren", "foreign": "to explain", "example": "Kannst du das erklaeren?" },
        { "native": "fragen", "foreign": "to ask", "example": "Darf ich Sie etwas fragen?" },
        { "native": "antworten", "foreign": "to answer", "example": "Bitte antworte auf die Frage." },
        { "native": "ueben", "foreign": "to practice", "example": "Ich muss mehr ueben." },
        { "native": "wiederholen", "foreign": "to repeat", "example": "Bitte wiederholen Sie das." },
        { "native": "uebersetzen", "foreign": "to translate", "example": "Uebersetze den Satz ins Englische." },
        { "native": "die Mathematik", "foreign": "mathematics", "example": "Mathematik ist mein Lieblingsfach." },
        { "native": "die Physik", "foreign": "physics", "example": "Physik ist interessant." },
        { "native": "die Chemie", "foreign": "chemistry", "example": "In Chemie machen wir Experimente." },
        { "native": "die Biologie", "foreign": "biology", "example": "Biologie handelt von Lebewesen." },
        { "native": "die Geschichte", "foreign": "history", "example": "Ich mag Geschichte." },
        { "native": "die Geographie", "foreign": "geography", "example": "Wir lernen Laender in Geographie." },
        { "native": "die Kunst", "foreign": "art", "example": "In Kunst malen wir Bilder." },
        { "native": "die Musik", "foreign": "music", "example": "Wir singen im Musikunterricht." },
        { "native": "der Sport", "foreign": "sports/PE", "example": "Sport macht mir Spass." },
        { "native": "die Sprache", "foreign": "language", "example": "Ich lerne eine neue Sprache." },
        { "native": "das Deutsch", "foreign": "German (subject)", "example": "Deutsch ist nicht schwer." },
        { "native": "das Englisch", "foreign": "English (subject)", "example": "Mein Englisch wird besser." },
        { "native": "das Franzoesisch", "foreign": "French (subject)", "example": "Franzoesisch klingt schoen." },
        { "native": "die Informatik", "foreign": "computer science", "example": "In Informatik programmieren wir." },
        { "native": "die Philosophie", "foreign": "philosophy", "example": "Philosophie regt zum Denken an." },
        { "native": "die Literatur", "foreign": "literature", "example": "Wir lesen klassische Literatur." },
        { "native": "das Fach", "foreign": "subject", "example": "Welches Fach magst du am meisten?" },
        { "native": "der Stundenplan", "foreign": "schedule/timetable", "example": "Mein Stundenplan ist voll." },
        { "native": "die Stunde", "foreign": "lesson/period", "example": "Die Stunde dauert 45 Minuten." },
        { "native": "die Pause", "foreign": "break", "example": "In der Pause essen wir." },
        { "native": "der Unterricht", "foreign": "class/instruction", "example": "Der Unterricht beginnt um 8 Uhr." },
        { "native": "die Vorlesung", "foreign": "lecture", "example": "Die Vorlesung war interessant." },
        { "native": "das Seminar", "foreign": "seminar", "example": "Im Seminar diskutieren wir." },
        { "native": "der Kurs", "foreign": "course", "example": "Ich besuche einen Deutschkurs." },
        { "native": "das Projekt", "foreign": "project", "example": "Wir arbeiten an einem Projekt." },
        { "native": "die Praesentation", "foreign": "presentation", "example": "Morgen halte ich eine Praesentation." },
        { "native": "das Referat", "foreign": "report/presentation", "example": "Mein Referat ist fertig." },
        { "native": "die Aufgabe", "foreign": "task/exercise", "example": "Diese Aufgabe ist schwierig." },
        { "native": "die Loesung", "foreign": "solution", "example": "Ich habe die Loesung gefunden." },
        { "native": "das Ergebnis", "foreign": "result", "example": "Das Ergebnis ist richtig." },
        { "native": "der Fehler", "foreign": "mistake", "example": "Ich habe einen Fehler gemacht." },
        { "native": "richtig", "foreign": "correct", "example": "Die Antwort ist richtig." },
        { "native": "falsch", "foreign": "wrong", "example": "Das ist leider falsch." },
        { "native": "schwer", "foreign": "difficult", "example": "Die Pruefung war schwer." },
        { "native": "leicht", "foreign": "easy", "example": "Die Aufgabe war leicht." },
        { "native": "fleissig", "foreign": "hardworking", "example": "Sie ist eine fleissige Schuelerin." },
        { "native": "faul", "foreign": "lazy", "example": "Sei nicht so faul!" },
        { "native": "intelligent", "foreign": "intelligent", "example": "Er ist sehr intelligent." },
        { "native": "kreativ", "foreign": "creative", "example": "Kuenstler sind kreativ." },
        { "native": "neugierig", "foreign": "curious", "example": "Kinder sind neugierig." },
        { "native": "aufmerksam", "foreign": "attentive", "example": "Sei aufmerksam im Unterricht." },
        { "native": "das Wissen", "foreign": "knowledge", "example": "Wissen ist Macht." },
        { "native": "die Bildung", "foreign": "education", "example": "Bildung ist wichtig." },
        { "native": "das Lernen", "foreign": "learning", "example": "Lernen macht Spass." },
        { "native": "die Forschung", "foreign": "research", "example": "Die Forschung ist wichtig." },
        { "native": "das Experiment", "foreign": "experiment", "example": "Wir fuehren ein Experiment durch." },
        { "native": "die Theorie", "foreign": "theory", "example": "Die Theorie ist komplex." },
        { "native": "die Praxis", "foreign": "practice", "example": "Theorie und Praxis gehoeren zusammen." },
        { "native": "der Erfolg", "foreign": "success", "example": "Ich wuensche dir viel Erfolg!" },
        { "native": "der Abschluss", "foreign": "graduation/degree", "example": "Nach dem Abschluss suche ich Arbeit." },
        { "native": "das Diplom", "foreign": "diploma", "example": "Ich habe mein Diplom erhalten." },
        { "native": "der Bachelor", "foreign": "bachelor's degree", "example": "Ich mache meinen Bachelor." },
        { "native": "der Master", "foreign": "master's degree", "example": "Danach folgt der Master." },
        { "native": "die Doktorarbeit", "foreign": "doctoral thesis", "example": "Sie schreibt ihre Doktorarbeit." },
        { "native": "das Stipendium", "foreign": "scholarship", "example": "Ich habe ein Stipendium bekommen." },
        { "native": "die Nachhilfe", "foreign": "tutoring", "example": "Ich gebe Nachhilfe in Mathe." },
        { "native": "der Austausch", "foreign": "exchange", "example": "Ich mache einen Austausch nach Deutschland." },
        { "native": "die Pruefungsangst", "foreign": "exam anxiety", "example": "Pruefungsangst ist normal." }
      ]
    },
    {
      "name": "Freizeit & Hobbys",
      "words": [
        { "native": "die Freizeit", "foreign": "free time", "example": "Was machst du in deiner Freizeit?" },
        { "native": "das Hobby", "foreign": "hobby", "example": "Mein Hobby ist Lesen." },
        { "native": "spielen", "foreign": "to play", "example": "Kinder spielen gern." },
        { "native": "der Fussball", "foreign": "soccer/football", "example": "Ich spiele gern Fussball." },
        { "native": "der Basketball", "foreign": "basketball", "example": "Basketball ist aufregend." },
        { "native": "der Tennis", "foreign": "tennis", "example": "Spielst du Tennis?" },
        { "native": "das Schwimmen", "foreign": "swimming", "example": "Schwimmen ist gesund." },
        { "native": "das Schwimmbad", "foreign": "swimming pool", "example": "Wir gehen ins Schwimmbad." },
        { "native": "das Laufen", "foreign": "running", "example": "Ich gehe jeden Morgen laufen." },
        { "native": "das Wandern", "foreign": "hiking", "example": "Wandern in den Bergen ist toll." },
        { "native": "das Radfahren", "foreign": "cycling", "example": "Radfahren ist mein Lieblingssport." },
        { "native": "der Ski", "foreign": "ski", "example": "Im Winter fahre ich Ski." },
        { "native": "der Snowboard", "foreign": "snowboard", "example": "Snowboard macht Spass." },
        { "native": "das Fitnessstudio", "foreign": "gym", "example": "Ich gehe ins Fitnessstudio." },
        { "native": "das Training", "foreign": "training", "example": "Mein Training ist hart." },
        { "native": "der Sport", "foreign": "sport", "example": "Sport haelt fit." },
        { "native": "das Team", "foreign": "team", "example": "Unser Team hat gewonnen." },
        { "native": "das Spiel", "foreign": "game", "example": "Das Spiel war spannend." },
        { "native": "gewinnen", "foreign": "to win", "example": "Wir wollen gewinnen!" },
        { "native": "verlieren", "foreign": "to lose", "example": "Niemand verliert gern." },
        { "native": "die Musik", "foreign": "music", "example": "Ich hoere gern Musik." },
        { "native": "das Lied", "foreign": "song", "example": "Das ist mein Lieblingslied." },
        { "native": "singen", "foreign": "to sing", "example": "Sie singt sehr schoen." },
        { "native": "tanzen", "foreign": "to dance", "example": "Wir tanzen die ganze Nacht." },
        { "native": "die Gitarre", "foreign": "guitar", "example": "Ich spiele Gitarre." },
        { "native": "das Klavier", "foreign": "piano", "example": "Sie uebt Klavier." },
        { "native": "die Violine", "foreign": "violin", "example": "Die Violine klingt wunderschoen." },
        { "native": "die Trompete", "foreign": "trumpet", "example": "Er spielt Trompete im Orchester." },
        { "native": "das Schlagzeug", "foreign": "drums", "example": "Schlagzeug ist laut aber cool." },
        { "native": "das Konzert", "foreign": "concert", "example": "Wir gehen heute Abend zum Konzert." },
        { "native": "das Kino", "foreign": "cinema", "example": "Gehen wir ins Kino?" },
        { "native": "der Film", "foreign": "film/movie", "example": "Der Film war gut." },
        { "native": "das Theater", "foreign": "theater", "example": "Im Theater laeuft ein neues Stueck." },
        { "native": "das Museum", "foreign": "museum", "example": "Das Museum hat interessante Ausstellungen." },
        { "native": "die Galerie", "foreign": "gallery", "example": "Die Galerie zeigt moderne Kunst." },
        { "native": "die Ausstellung", "foreign": "exhibition", "example": "Die Ausstellung ist kostenlos." },
        { "native": "malen", "foreign": "to paint", "example": "Ich male gern Landschaften." },
        { "native": "zeichnen", "foreign": "to draw", "example": "Kannst du ein Haus zeichnen?" },
        { "native": "das Bild", "foreign": "picture/painting", "example": "Das Bild ist sehr schoen." },
        { "native": "fotografieren", "foreign": "to photograph", "example": "Ich fotografiere gern." },
        { "native": "die Kamera", "foreign": "camera", "example": "Meine Kamera ist neu." },
        { "native": "das Foto", "foreign": "photo", "example": "Kannst du ein Foto machen?" },
        { "native": "das Video", "foreign": "video", "example": "Ich schaue Videos online." },
        { "native": "kochen", "foreign": "to cook", "example": "Am Wochenende koche ich gern." },
        { "native": "backen", "foreign": "to bake", "example": "Ich backe einen Kuchen." },
        { "native": "das Rezept", "foreign": "recipe", "example": "Hast du ein gutes Rezept?" },
        { "native": "lesen", "foreign": "to read", "example": "Ich lese jeden Abend." },
        { "native": "das Buch", "foreign": "book", "example": "Dieses Buch ist spannend." },
        { "native": "der Roman", "foreign": "novel", "example": "Ich lese gerade einen Roman." },
        { "native": "die Zeitschrift", "foreign": "magazine", "example": "Ich lese eine Modezeitschrift." },
        { "native": "die Zeitung", "foreign": "newspaper", "example": "Ich lese die Zeitung am Morgen." },
        { "native": "schreiben", "foreign": "to write", "example": "Ich schreibe gern Geschichten." },
        { "native": "das Gedicht", "foreign": "poem", "example": "Er schreibt schoene Gedichte." },
        { "native": "die Geschichte", "foreign": "story", "example": "Diese Geschichte ist interessant." },
        { "native": "das Videospiel", "foreign": "video game", "example": "Spielst du Videospiele?" },
        { "native": "das Brettspiel", "foreign": "board game", "example": "Lass uns ein Brettspiel spielen!" },
        { "native": "das Kartenspiel", "foreign": "card game", "example": "Poker ist ein Kartenspiel." },
        { "native": "das Raetsel", "foreign": "puzzle", "example": "Ich loese gern Raetsel." },
        { "native": "das Schach", "foreign": "chess", "example": "Schach erfordert Strategie." },
        { "native": "sammeln", "foreign": "to collect", "example": "Ich sammle Briefmarken." },
        { "native": "die Sammlung", "foreign": "collection", "example": "Meine Sammlung ist gross." },
        { "native": "der Garten", "foreign": "garden", "example": "Ich arbeite gern im Garten." },
        { "native": "die Pflanze", "foreign": "plant", "example": "Ich giesse meine Pflanzen." },
        { "native": "die Blume", "foreign": "flower", "example": "Die Blumen sind schoen." },
        { "native": "der Baum", "foreign": "tree", "example": "Der Baum ist sehr alt." },
        { "native": "die Natur", "foreign": "nature", "example": "Ich liebe die Natur." },
        { "native": "der Wald", "foreign": "forest", "example": "Wir spazieren im Wald." },
        { "native": "der Berg", "foreign": "mountain", "example": "Die Berge sind wunderschoen." },
        { "native": "das Meer", "foreign": "sea/ocean", "example": "Im Sommer fahren wir ans Meer." },
        { "native": "der Strand", "foreign": "beach", "example": "Der Strand ist sauber." },
        { "native": "der See", "foreign": "lake", "example": "Wir schwimmen im See." },
        { "native": "der Fluss", "foreign": "river", "example": "Der Fluss fliesst langsam." },
        { "native": "der Park", "foreign": "park", "example": "Wir treffen uns im Park." },
        { "native": "spazieren gehen", "foreign": "to go for a walk", "example": "Am Sonntag gehen wir spazieren." },
        { "native": "picknicken", "foreign": "to have a picnic", "example": "Lass uns im Park picknicken." },
        { "native": "campen", "foreign": "to camp", "example": "Wir campen am Wochenende." },
        { "native": "das Zelt", "foreign": "tent", "example": "Wir schlafen im Zelt." },
        { "native": "angeln", "foreign": "to fish", "example": "Mein Vater geht gern angeln." },
        { "native": "das Tier", "foreign": "animal", "example": "Ich mag Tiere sehr." },
        { "native": "der Hund", "foreign": "dog", "example": "Mein Hund heisst Max." },
        { "native": "die Katze", "foreign": "cat", "example": "Die Katze schlaeft viel." },
        { "native": "der Vogel", "foreign": "bird", "example": "Der Vogel singt am Morgen." },
        { "native": "das Haustier", "foreign": "pet", "example": "Hast du ein Haustier?" },
        { "native": "die Party", "foreign": "party", "example": "Am Samstag gibt es eine Party." },
        { "native": "feiern", "foreign": "to celebrate", "example": "Wir feiern seinen Geburtstag." },
        { "native": "der Geburtstag", "foreign": "birthday", "example": "Alles Gute zum Geburtstag!" },
        { "native": "das Geschenk", "foreign": "gift/present", "example": "Ich habe ein Geschenk fuer dich." },
        { "native": "der Freund", "foreign": "friend (male)", "example": "Er ist mein bester Freund." },
        { "native": "die Freundin", "foreign": "friend (female)", "example": "Sie ist meine beste Freundin." },
        { "native": "treffen", "foreign": "to meet", "example": "Wir treffen uns um acht." },
        { "native": "unterhalten", "foreign": "to chat/converse", "example": "Wir unterhalten uns stundenlang." },
        { "native": "die Unterhaltung", "foreign": "entertainment/conversation", "example": "Das war eine gute Unterhaltung." },
        { "native": "entspannen", "foreign": "to relax", "example": "Am Wochenende entspanne ich." },
        { "native": "schlafen", "foreign": "to sleep", "example": "Ich schlafe mindestens acht Stunden." },
        { "native": "traeumen", "foreign": "to dream", "example": "Ich traeume von einer Reise." },
        { "native": "geniessen", "foreign": "to enjoy", "example": "Geniess den Tag!" },
        { "native": "Spass haben", "foreign": "to have fun", "example": "Wir haben viel Spass zusammen." },
        { "native": "langweilig", "foreign": "boring", "example": "Das Spiel war langweilig." },
        { "native": "interessant", "foreign": "interesting", "example": "Das Buch ist sehr interessant." },
        { "native": "spannend", "foreign": "exciting", "example": "Der Film war spannend." }
      ]
    }
  ]
};

// ============================================
// GLOBALER STATE
// ============================================

const state = {
  db: null,
  vocabulary: [],
  selectedWords: new Set(),  // Set of vocab IDs that are selected for practice
  progress: {},
  settings: { ...CONFIG.DEFAULT_SETTINGS },
  stats: {
    totalReviews: 0,
    correctAnswers: 0,
    streak: 0,
    lastStudyDate: null,
    dailyStats: {},
    dailyCorrect: 0,      // Today's correct count toward daily goal
    goalReached: false,   // Whether today's goal (20 correct) is complete
    lastCategory: null    // Last practiced category for "continue" feature
  },
  currentView: 'learn',
  currentSession: null,
  currentCardIndex: 0,
  sessionResults: []
};

// ============================================
// INDEXEDDB WRAPPER
// ============================================

const DB = {
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        state.db = request.result;
        resolve(state.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Vocabulary Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_VOCAB)) {
          const vocabStore = db.createObjectStore(CONFIG.STORE_VOCAB, { keyPath: 'id' });
          vocabStore.createIndex('category', 'category', { unique: false });
          vocabStore.createIndex('difficulty', 'difficulty', { unique: false });
        }

        // Progress Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_PROGRESS)) {
          db.createObjectStore(CONFIG.STORE_PROGRESS, { keyPath: 'vocabId' });
        }

        // Settings Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_SETTINGS)) {
          db.createObjectStore(CONFIG.STORE_SETTINGS, { keyPath: 'key' });
        }

        // Stats Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_STATS)) {
          db.createObjectStore(CONFIG.STORE_STATS, { keyPath: 'key' });
        }

        // Selection Store
        if (!db.objectStoreNames.contains(CONFIG.STORE_SELECTION)) {
          db.createObjectStore(CONFIG.STORE_SELECTION, { keyPath: 'vocabId' });
        }
      };
    });
  },

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
};

// ============================================
// DATEN MANAGEMENT
// ============================================

const DataManager = {
  async loadAll() {
    try {
      // Vokabeln laden
      state.vocabulary = await DB.getAll(CONFIG.STORE_VOCAB);

      // Progress laden
      const progressData = await DB.getAll(CONFIG.STORE_PROGRESS);
      state.progress = {};
      progressData.forEach(p => {
        state.progress[p.vocabId] = p;
      });

      // Settings laden
      const settingsData = await DB.get(CONFIG.STORE_SETTINGS, 'userSettings');
      if (settingsData) {
        state.settings = { ...CONFIG.DEFAULT_SETTINGS, ...settingsData.value };
      }

      // Stats laden
      const statsData = await DB.get(CONFIG.STORE_STATS, 'userStats');
      if (statsData) {
        state.stats = { ...state.stats, ...statsData.value };
      }

      // Selection laden
      await this.loadSelection();

      // Streak prüfen
      this.checkStreak();

    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      Toast.show('Fehler beim Laden der Daten', 'error');
    }
  },

  async loadSelection() {
    const data = await DB.getAll(CONFIG.STORE_SELECTION);
    state.selectedWords = new Set(data.map(d => d.vocabId));
  },

  async toggleWordSelection(vocabId) {
    if (state.selectedWords.has(vocabId)) {
      state.selectedWords.delete(vocabId);
      await DB.delete(CONFIG.STORE_SELECTION, vocabId);
    } else {
      state.selectedWords.add(vocabId);
      await DB.put(CONFIG.STORE_SELECTION, { vocabId });
    }
  },

  async selectAllInCategory(category) {
    const words = state.vocabulary.filter(v => !category || v.category === category);
    for (const word of words) {
      if (!state.selectedWords.has(word.id)) {
        state.selectedWords.add(word.id);
        await DB.put(CONFIG.STORE_SELECTION, { vocabId: word.id });
      }
    }
  },

  async deselectAllInCategory(category) {
    const words = state.vocabulary.filter(v => !category || v.category === category);
    for (const word of words) {
      if (state.selectedWords.has(word.id)) {
        state.selectedWords.delete(word.id);
        await DB.delete(CONFIG.STORE_SELECTION, word.id);
      }
    }
  },

  async saveVocab(vocab) {
    const isNew = !vocab.id;
    if (!vocab.id) {
      vocab.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    vocab.createdAt = vocab.createdAt || new Date().toISOString();
    vocab.updatedAt = new Date().toISOString();

    await DB.put(CONFIG.STORE_VOCAB, vocab);

    // State aktualisieren
    const index = state.vocabulary.findIndex(v => v.id === vocab.id);
    if (index >= 0) {
      state.vocabulary[index] = vocab;
    } else {
      state.vocabulary.push(vocab);
    }

    // Auto-select new vocabulary for practice
    if (isNew && !state.selectedWords.has(vocab.id)) {
      state.selectedWords.add(vocab.id);
      await DB.put(CONFIG.STORE_SELECTION, { vocabId: vocab.id });
    }

    return vocab;
  },

  async deleteVocab(id) {
    await DB.delete(CONFIG.STORE_VOCAB, id);
    await DB.delete(CONFIG.STORE_PROGRESS, id);
    await DB.delete(CONFIG.STORE_SELECTION, id);

    state.vocabulary = state.vocabulary.filter(v => v.id !== id);
    delete state.progress[id];
    state.selectedWords.delete(id);
  },

  async saveProgress(vocabId, isCorrect) {
    const now = new Date();
    const progress = state.progress[vocabId] || {
      vocabId,
      level: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReview: null,
      nextReview: null
    };

    if (isCorrect) {
      progress.correctCount++;
      progress.level = Math.min(progress.level + 1, CONFIG.INTERVALS.length - 1);
    } else {
      progress.incorrectCount++;
      progress.level = Math.max(0, progress.level - 1);
    }

    progress.lastReview = now.toISOString();

    // Nächste Wiederholung berechnen
    const intervalDays = CONFIG.INTERVALS[progress.level];
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    progress.nextReview = nextDate.toISOString();

    await DB.put(CONFIG.STORE_PROGRESS, progress);
    state.progress[vocabId] = progress;

    // Stats aktualisieren
    await this.updateStats(isCorrect);
  },

  async updateStats(isCorrect) {
    const today = new Date().toISOString().split('T')[0];

    state.stats.totalReviews++;
    if (isCorrect) {
      state.stats.correctAnswers++;
    }

    // New day detection - handle reset and streak logic
    if (state.stats.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if yesterday's goal was reached for streak calculation
      const yesterdayStats = state.stats.dailyStats[yesterdayStr];
      const yesterdayGoalReached = yesterdayStats ? yesterdayStats.goalReached : false;

      // Streak logic: only increment if yesterday's goal was REACHED
      if (state.stats.lastStudyDate === yesterdayStr && yesterdayGoalReached) {
        state.stats.streak++;
      } else if (state.stats.lastStudyDate !== yesterdayStr) {
        // Streak broken - didn't study or reach goal yesterday
        state.stats.streak = 1;
      }

      // Reset daily counters for new day
      state.stats.dailyCorrect = 0;
      state.stats.goalReached = false;
      state.stats.lastStudyDate = today;
    }

    // Initialize today's daily stats if needed
    if (!state.stats.dailyStats[today]) {
      state.stats.dailyStats[today] = { reviews: 0, correct: 0, goalReached: false };
    }
    state.stats.dailyStats[today].reviews++;

    if (isCorrect) {
      state.stats.dailyStats[today].correct++;
      state.stats.dailyCorrect++;

      // Check if daily goal is reached
      if (state.stats.dailyCorrect >= CONFIG.DAILY_GOAL && !state.stats.goalReached) {
        state.stats.goalReached = true;
        state.stats.dailyStats[today].goalReached = true;
        console.log('Daily goal reached! Correct today:', state.stats.dailyCorrect);
        // Show celebration animation
        showGoalCelebration();
      }
    }

    console.log('Stats updated - dailyCorrect:', state.stats.dailyCorrect, 'goalReached:', state.stats.goalReached);

    await DB.put(CONFIG.STORE_STATS, { key: 'userStats', value: state.stats });
  },

  checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Reset streak if last study was before yesterday
    if (state.stats.lastStudyDate &&
        state.stats.lastStudyDate !== today &&
        state.stats.lastStudyDate !== yesterdayStr) {
      state.stats.streak = 0;
    }

    // If it's a new day, reset daily counters
    if (state.stats.lastStudyDate && state.stats.lastStudyDate !== today) {
      state.stats.dailyCorrect = 0;
      state.stats.goalReached = false;
    }
  },

  // Seed preset vocabulary on first launch
  async seedPresetVocabulary() {
    // Only seed if vocabulary is empty (first launch)
    if (state.vocabulary.length > 0) return false;

    try {
      let vocabData = null;

      // Try loading from local data folder first
      try {
        const localResponse = await fetch('./data/preset-vocabulary.json');
        if (localResponse.ok) {
          vocabData = await localResponse.json();
          console.log('Loaded vocabulary from local data folder');
        }
      } catch (localError) {
        console.log('Local data not available, trying GitHub...');
      }

      // Try loading from GitHub raw URL if local failed
      if (!vocabData) {
        try {
          const githubResponse = await fetch('https://raw.githubusercontent.com/BEKO2210/Vokabeltrainer/main/data/preset-vocabulary.json');
          if (githubResponse.ok) {
            vocabData = await githubResponse.json();
            console.log('Loaded vocabulary from GitHub');
          }
        } catch (githubError) {
          console.log('GitHub data not available, using embedded data');
        }
      }

      // Fall back to embedded PRESET_VOCABULARY
      if (!vocabData) {
        vocabData = PRESET_VOCABULARY;
        console.log('Using embedded vocabulary data');
      }

      // Save vocabulary to IndexedDB
      for (const category of vocabData.categories) {
        for (const word of category.words) {
          const vocab = {
            native: word.native,
            foreign: word.foreign,
            example: word.example || '',
            category: category.name,
            difficulty: 1,
            note: ''
          };
          await this.saveVocab(vocab);
        }
      }
      return true;
    } catch (error) {
      console.error('Error seeding preset vocabulary:', error);
      return false;
    }
  },

  async saveSettings(settings) {
    state.settings = { ...state.settings, ...settings };
    await DB.put(CONFIG.STORE_SETTINGS, { key: 'userSettings', value: state.settings });
  },

  // Fällige Karten ermitteln (nur ausgewählte)
  getDueCards() {
    const now = new Date();
    return state.vocabulary.filter(vocab => {
      // First check if word is selected
      if (!state.selectedWords.has(vocab.id)) return false;
      const progress = state.progress[vocab.id];
      if (!progress || !progress.nextReview) return false;
      return new Date(progress.nextReview) <= now;
    });
  },

  // Neue Karten (noch nie gelernt, nur ausgewählte)
  getNewCards() {
    return state.vocabulary.filter(vocab => {
      if (!state.selectedWords.has(vocab.id)) return false;
      return !state.progress[vocab.id];
    });
  },

  // Fehlerkarten (letzte Antwort falsch oder niedriges Level, nur ausgewählte)
  getErrorCards() {
    return state.vocabulary.filter(vocab => {
      if (!state.selectedWords.has(vocab.id)) return false;
      const progress = state.progress[vocab.id];
      if (!progress) return false;
      return progress.level === 0 || progress.incorrectCount > progress.correctCount;
    });
  },

  // Export als JSON
  exportData() {
    const data = {
      vocabulary: state.vocabulary,
      progress: Object.values(state.progress),
      settings: state.settings,
      stats: state.stats,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vokabel-master-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import aus JSON
  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // Vokabeln importieren
          if (data.vocabulary && Array.isArray(data.vocabulary)) {
            for (const vocab of data.vocabulary) {
              await this.saveVocab(vocab);
            }
          }

          // Progress importieren
          if (data.progress && Array.isArray(data.progress)) {
            for (const prog of data.progress) {
              await DB.put(CONFIG.STORE_PROGRESS, prog);
              state.progress[prog.vocabId] = prog;
            }
          }

          resolve(data.vocabulary?.length || 0);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  // Import aus CSV (Format: native;foreign;example;category;difficulty)
  async importCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const lines = e.target.result.split('\n').filter(l => l.trim());
          let count = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || (i === 0 && line.toLowerCase().includes('native'))) continue;

            const parts = line.split(';').map(p => p.trim());
            if (parts.length >= 2) {
              const vocab = {
                native: parts[0],
                foreign: parts[1],
                example: parts[2] || '',
                category: parts[3] || '',
                difficulty: parseInt(parts[4]) || 1,
                note: parts[5] || ''
              };
              await this.saveVocab(vocab);
              count++;
            }
          }

          resolve(count);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
};

// ============================================
// UI KOMPONENTEN
// ============================================

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

const Modal = {
  overlay: null,

  init() {
    this.overlay = document.getElementById('modal-overlay');
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  },

  open(title, content, footer = '') {
    const modal = this.overlay.querySelector('.modal');
    modal.innerHTML = `
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="btn btn-ghost btn-icon" onclick="Modal.close()" aria-label="Schließen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;
    this.overlay.classList.add('active');

    // Focus trap
    const focusable = modal.querySelectorAll('button, input, select, textarea');
    if (focusable.length) focusable[0].focus();
  },

  close() {
    this.overlay.classList.remove('active');
  }
};

// ============================================
// GOAL CELEBRATION
// ============================================

function showGoalCelebration() {
  const streak = state.stats.streak || 0;

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-emoji">🎉</div>
      <div class="celebration-title">Tagesziel erreicht!</div>
      <div class="celebration-subtitle">Du hast heute ${CONFIG.DAILY_GOAL} Wörter gelernt</div>
      ${streak > 0 ? `
        <div class="celebration-streak">
          <span class="streak-fire">🔥</span>
          <span>${streak} Tage Streak!</span>
        </div>
      ` : ''}
      <button class="celebration-btn" onclick="this.closest('.celebration-overlay').remove()">
        Weiter
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
  }, 5000);
}

// ============================================
// VIEWS
// ============================================

const Views = {
  current: 'home',

  init() {
    // Navigation Events
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) this.show(view);
      });
    });
  },

  show(viewName) {
    // Aktive View wechseln
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const viewEl = document.getElementById(`view-${viewName}`);
    const navEl = document.querySelector(`[data-view="${viewName}"]`);

    if (viewEl) viewEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    this.current = viewName;
    state.currentView = viewName;

    // View-spezifische Initialisierung
    switch (viewName) {
      case 'home':
        HomeView.init();
        break;
      case 'learn':
        LearnView.init();
        break;
      case 'words':
        WordsView.init();
        break;
      case 'stats':
        StatsView.init();
        break;
      case 'settings':
        SettingsView.init();
        break;
    }
  }
};

// ============================================
// HOME VIEW
// ============================================

const HomeView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-home');
    const today = new Date().toISOString().split('T')[0];
    const dailyCorrect = state.stats.dailyCorrect || 0;
    const goalReached = state.stats.goalReached || false;
    const streak = state.stats.streak || 0;
    const progressPercent = Math.min((dailyCorrect / CONFIG.DAILY_GOAL) * 100, 100);

    container.innerHTML = `
      <div class="home-header">
        <h1 class="home-title">Vokabeltrainer</h1>
        ${streak > 0 ? `
          <div class="home-streak">
            <span class="streak-fire">🔥</span>
            <span class="streak-value">${streak}</span>
            <span class="streak-label">Tage</span>
          </div>
        ` : ''}
      </div>

      <div class="card home-progress-card">
        <div class="card-body">
          <div class="progress-label">
            <span>Tagesziel</span>
            <span class="progress-count">${dailyCorrect}/${CONFIG.DAILY_GOAL}</span>
          </div>
          <div class="daily-progress">
            <div class="daily-progress-fill ${goalReached ? 'complete' : ''}"
                 style="width: ${progressPercent}%"></div>
          </div>
          ${goalReached ? `
            <div class="goal-complete-message">
              <span>✓</span> Tagesziel erreicht!
            </div>
          ` : `
            <div class="goal-remaining">
              Noch ${CONFIG.DAILY_GOAL - dailyCorrect} Wörter
            </div>
          `}
        </div>
      </div>

      ${state.stats.lastCategory ? `
        <div class="home-continue card">
          <div class="card-body">
            <div class="continue-label">Weitermachen</div>
            <div class="continue-category">${this.escapeHtml(state.stats.lastCategory)}</div>
            <button class="btn btn-secondary" onclick="HomeView.continueLastCategory()">
              Fortsetzen
            </button>
          </div>
        </div>
      ` : ''}

      <div class="home-actions">
        <button class="btn btn-primary btn-large" onclick="HomeView.quickStart()">
          ${goalReached ? 'Weiter üben' : 'Jetzt lernen'}
        </button>
      </div>

      <div class="home-stats card">
        <div class="card-body">
          <div class="mini-stats">
            <div class="mini-stat">
              <div class="mini-stat-value">${state.stats.totalReviews || 0}</div>
              <div class="mini-stat-label">Gesamt</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-value">${state.stats.correctAnswers || 0}</div>
              <div class="mini-stat-label">Richtig</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-value">${streak}</div>
              <div class="mini-stat-label">Streak</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  quickStart() {
    // Check if we have cards to practice
    const dueCards = DataManager.getDueCards();
    const newCards = DataManager.getNewCards();
    const allCards = state.vocabulary.filter(v => state.selectedWords.has(v.id));

    if (allCards.length === 0) {
      Toast.show('Keine Wörter ausgewählt', 'info');
      return;
    }

    // Navigate to learn view
    Views.show('learn');

    // Auto-start session after small delay for DOM update
    setTimeout(() => {
      // Set default session type and begin
      state.currentSession = {
        mode: 'flashcard',
        cardSet: dueCards.length > 0 ? 'due' : (newCards.length > 0 ? 'new' : 'all')
      };
      LearnView.beginSession();
    }, 50);
  },

  continueLastCategory() {
    const category = state.stats.lastCategory;
    if (!category) {
      Toast.show('Keine Kategorie gespeichert', 'info');
      return;
    }

    // Check if there are cards in this category
    const categoryCards = state.vocabulary.filter(v =>
      v.category === category && state.selectedWords.has(v.id)
    );

    if (categoryCards.length === 0) {
      Toast.show('Keine Karten in dieser Kategorie ausgewählt', 'info');
      return;
    }

    // Navigate to learn view
    Views.show('learn');

    // Start session with category filter
    setTimeout(() => {
      state.currentSession = {
        mode: 'flashcard',
        cardSet: 'all',
        categoryFilter: category
      };
      LearnView.beginSession();
    }, 50);
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ============================================
// LEARN VIEW
// ============================================

const LearnView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-learn');
    const dueCards = DataManager.getDueCards();
    const newCards = DataManager.getNewCards();
    const errorCards = DataManager.getErrorCards();
    const selectedCount = state.vocabulary.filter(v => state.selectedWords.has(v.id)).length;

    container.innerHTML = `
      ${state.vocabulary.length > 0 && selectedCount === 0 ? `
        <div class="empty-state" style="margin-bottom: var(--space-lg);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <h3>Keine Wörter ausgewählt</h3>
          <p>Wähle Wörter in der Wortliste aus, um sie zu üben.</p>
          <button class="btn btn-primary mt-md" onclick="Views.show('words')">
            Zur Wortliste
          </button>
        </div>
      ` : ''}

      ${state.stats.streak > 0 ? `
        <div class="streak-display">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <div class="streak-value">${state.stats.streak}</div>
            <div class="streak-label">Tage in Folge</div>
          </div>
        </div>
      ` : ''}

      <h2 class="mb-md">Lernmodus wählen</h2>

      <div class="mode-selector">
        <button class="mode-card" onclick="LearnView.startSession('flashcard')" aria-label="Karteikarten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <path d="M3 10h18"/>
          </svg>
          <span class="mode-card-title">Karteikarten</span>
          <span class="mode-card-desc">Umdrehen & Merken</span>
        </button>

        <button class="mode-card" onclick="LearnView.startSession('mc')" aria-label="Multiple Choice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span class="mode-card-title">Multiple Choice</span>
          <span class="mode-card-desc">4 Optionen wählen</span>
        </button>

        <button class="mode-card" onclick="LearnView.startSession('typing')" aria-label="Tippen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
          </svg>
          <span class="mode-card-title">Tippen</span>
          <span class="mode-card-desc">Antwort eingeben</span>
        </button>

        <button class="mode-card" onclick="LearnView.startSession('dictation')" aria-label="Diktat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <span class="mode-card-title">Diktat</span>
          <span class="mode-card-desc">Anhören & Schreiben</span>
        </button>
      </div>

      <h2 class="mb-md">Sitzung starten</h2>

      <div class="session-modes">
        <button class="session-mode-btn" onclick="LearnView.startSessionWithCards('due')" ${dueCards.length === 0 ? 'disabled' : ''}>
          <div class="session-mode-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <div>
              <div class="session-mode-title">Heute lernen</div>
              <div class="session-mode-count">${dueCards.length} Karten fällig</div>
            </div>
          </div>
          <span class="badge">${dueCards.length}</span>
        </button>

        <button class="session-mode-btn" onclick="LearnView.startSessionWithCards('new')" ${newCards.length === 0 ? 'disabled' : ''}>
          <div class="session-mode-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <div>
              <div class="session-mode-title">Neue Karten</div>
              <div class="session-mode-count">${newCards.length} ungeübt</div>
            </div>
          </div>
          <span class="badge">${newCards.length}</span>
        </button>

        <button class="session-mode-btn" onclick="LearnView.startSessionWithCards('errors')" ${errorCards.length === 0 ? 'disabled' : ''}>
          <div class="session-mode-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            <div>
              <div class="session-mode-title">Fehler wiederholen</div>
              <div class="session-mode-count">${errorCards.length} Problemkarten</div>
            </div>
          </div>
          <span class="badge badge-error">${errorCards.length}</span>
        </button>
      </div>

      ${state.vocabulary.length === 0 ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3>Keine Vokabeln</h3>
          <p>Füge zuerst Vokabeln hinzu, um mit dem Lernen zu beginnen.</p>
          <button class="btn btn-primary mt-md" onclick="Views.show('words')">
            Vokabeln hinzufügen
          </button>
        </div>
      ` : ''}
    `;
  },

  startSession(mode) {
    state.currentSession = {
      mode,
      cardSet: 'all'
    };
    this.showModeSelection();
  },

  startSessionWithCards(cardSet) {
    state.currentSession = {
      mode: null,
      cardSet
    };
    this.showModeSelection();
  },

  showModeSelection() {
    const session = state.currentSession;

    if (session.mode && !session.cardSet) {
      session.cardSet = 'all';
    }

    if (!session.mode) {
      // Modus-Auswahl zeigen
      Modal.open('Übungsart wählen', `
        <div class="mode-selector">
          <button class="mode-card" onclick="LearnView.selectMode('flashcard')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            <span class="mode-card-title">Karteikarten</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('mc')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span class="mode-card-title">Multiple Choice</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('typing')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
            </svg>
            <span class="mode-card-title">Tippen</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('dictation')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
            <span class="mode-card-title">Diktat</span>
          </button>
        </div>
      `);
      return;
    }

    this.beginSession();
  },

  selectMode(mode) {
    state.currentSession.mode = mode;
    Modal.close();
    this.beginSession();
  },

  beginSession() {
    const session = state.currentSession;
    let cards = [];

    // Check if any words are selected
    const selectedCount = state.vocabulary.filter(v => state.selectedWords.has(v.id)).length;
    if (selectedCount === 0) {
      Toast.show('Keine Wörter ausgewählt. Wähle Wörter in der Wortliste aus.', 'info');
      return;
    }

    switch (session.cardSet) {
      case 'due':
        cards = DataManager.getDueCards();
        break;
      case 'new':
        cards = DataManager.getNewCards();
        break;
      case 'errors':
        cards = DataManager.getErrorCards();
        break;
      case 'all':
      default:
        cards = state.vocabulary.filter(v => state.selectedWords.has(v.id));
    }

    // Apply category filter if set (for "continue last category" feature)
    if (session.categoryFilter) {
      cards = cards.filter(c => c.category === session.categoryFilter);
      // Clear categoryFilter after use
      delete session.categoryFilter;
    }

    // Mischen und limitieren
    cards = this.shuffle(cards).slice(0, state.settings.cardsPerSession);

    if (cards.length === 0) {
      Toast.show('Keine Karten verfügbar', 'info');
      return;
    }

    session.cards = cards;
    state.currentCardIndex = 0;
    state.sessionResults = [];

    // Track last category from first card for "continue" feature
    if (cards.length > 0 && cards[0].category) {
      state.stats.lastCategory = cards[0].category;
      // Persist to IndexedDB
      DB.put(CONFIG.STORE_STATS, { key: 'userStats', value: state.stats });
    }

    this.renderExercise();
  },

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  renderExercise() {
    const session = state.currentSession;
    const card = session.cards[state.currentCardIndex];
    const progress = (state.currentCardIndex / session.cards.length) * 100;

    const container = document.getElementById('view-learn');

    container.innerHTML = `
      <div class="session-info">
        <span>Karte ${state.currentCardIndex + 1} von ${session.cards.length}</span>
        <button class="btn btn-ghost btn-icon" onclick="LearnView.endSession()" aria-label="Beenden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div id="exercise-content"></div>
    `;

    const content = document.getElementById('exercise-content');

    switch (session.mode) {
      case 'flashcard':
        this.renderFlashcard(content, card);
        break;
      case 'mc':
        this.renderMultipleChoice(content, card);
        break;
      case 'typing':
        this.renderTyping(content, card);
        break;
      case 'dictation':
        this.renderDictation(content, card);
        break;
    }
  },

  // Get question and answer based on practice direction setting
  getQuestionAnswer(card) {
    const isDeEn = state.settings.practiceDirection === 'de-en';
    return {
      question: isDeEn ? card.native : card.foreign,
      answer: isDeEn ? card.foreign : card.native,
      questionLang: isDeEn ? state.settings.nativeLang : state.settings.speechLang,
      answerLang: isDeEn ? state.settings.speechLang : state.settings.nativeLang
    };
  },

  renderFlashcard(container, card) {
    const qa = this.getQuestionAnswer(card);
    container.innerHTML = `
      <div class="flashcard-container">
        <div class="flashcard" id="flashcard" onclick="LearnView.flipCard()" role="button" tabindex="0" aria-label="Karte umdrehen">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-word">${this.escapeHtml(qa.question)}</div>
            ${state.settings.showHints && card.category ? `<div class="flashcard-hint">${this.escapeHtml(card.category)}</div>` : ''}
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-word">${this.escapeHtml(qa.answer)}</div>
            ${card.example ? `<div class="flashcard-example">${this.escapeHtml(card.example)}</div>` : ''}
          </div>
        </div>
      </div>
      <p class="text-center text-muted mb-md">Tippe auf die Karte zum Umdrehen</p>
      <div class="action-row" id="flashcard-actions" style="display: none;">
        <button class="btn btn-error btn-lg" onclick="LearnView.answer(false)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Falsch
        </button>
        <button class="btn btn-success btn-lg" onclick="LearnView.answer(true)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Richtig
        </button>
      </div>
    `;

    // Keyboard support
    document.getElementById('flashcard').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.flipCard();
      }
    });
  },

  flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');

    // Aktionen anzeigen nach erstem Flip
    document.getElementById('flashcard-actions').style.display = 'flex';
  },

  renderMultipleChoice(container, card) {
    const qa = this.getQuestionAnswer(card);
    const isDeEn = state.settings.practiceDirection === 'de-en';

    // Get the correct answer (normalized for comparison)
    const correctAnswerLower = qa.answer.toLowerCase().trim();

    // Collect ALL unique wrong answers from the entire vocabulary
    const wrongAnswersMap = new Map(); // lowercase -> original

    for (const v of state.vocabulary) {
      // Skip the current card
      if (v.id === card.id) continue;

      const answer = isDeEn ? v.foreign : v.native;
      const answerLower = answer.toLowerCase().trim();

      // Skip if it matches the correct answer
      if (answerLower === correctAnswerLower) continue;

      // Only add if we haven't seen this answer before (case-insensitive)
      if (!wrongAnswersMap.has(answerLower)) {
        wrongAnswersMap.set(answerLower, answer);
      }
    }

    // Convert to array and shuffle
    const allWrongAnswers = Array.from(wrongAnswersMap.values());
    const shuffledWrong = this.shuffle(allWrongAnswers);

    // Take only what we need (3 wrong answers for 4 total options)
    const wrongOptions = shuffledWrong.slice(0, CONFIG.MC_OPTIONS_COUNT - 1);

    // Combine correct + wrong and shuffle
    const options = this.shuffle([qa.answer, ...wrongOptions]);

    // Debug: log to console
    console.log('Multiple Choice:', {
      question: qa.question,
      correct: qa.answer,
      wrong: wrongOptions,
      allOptions: options
    });

    container.innerHTML = `
      <div class="typing-question">
        <div class="text-muted mb-sm">Was heißt...</div>
        <div>${this.escapeHtml(qa.question)}</div>
      </div>
      <div class="mc-options">
        ${options.map((opt, i) => `
          <button class="mc-option" data-answer="${this.escapeHtml(opt)}" onclick="LearnView.checkMCAnswer(this, '${this.escapeAttr(qa.answer)}')">
            <span style="font-weight: 600; color: var(--color-primary);">${String.fromCharCode(65 + i)}</span>
            <span>${this.escapeHtml(opt)}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  checkMCAnswer(button, correct) {
    const selected = button.dataset.answer;
    const isCorrect = this.compareAnswers(selected, correct);

    // Alle Buttons deaktivieren
    document.querySelectorAll('.mc-option').forEach(btn => {
      btn.disabled = true;
      if (this.compareAnswers(btn.dataset.answer, correct)) {
        btn.classList.add('correct');
      } else if (btn === button && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    setTimeout(() => this.answer(isCorrect), 1000);
  },

  renderTyping(container, card) {
    const qa = this.getQuestionAnswer(card);
    const isDeEn = state.settings.practiceDirection === 'de-en';
    const placeholder = isDeEn ? 'English translation...' : 'Deutsche Ubersetzung...';

    container.innerHTML = `
      <div class="typing-question">
        <div class="text-muted mb-sm">Ubersetze...</div>
        <div>${this.escapeHtml(qa.question)}</div>
      </div>
      <div class="typing-input-wrapper">
        <input type="text" class="form-input typing-input" id="typing-answer"
               placeholder="${placeholder}" autocomplete="off" autocapitalize="off" autofocus>
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="LearnView.checkTypingAnswer('${this.escapeAttr(qa.answer)}')">
        Prufen
      </button>
      <div id="typing-feedback"></div>
    `;

    // Enter-Taste zum Absenden
    document.getElementById('typing-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkTypingAnswer(qa.answer);
      }
    });
  },

  checkTypingAnswer(correct) {
    const input = document.getElementById('typing-answer');
    const answer = input.value.trim();
    const isCorrect = this.compareAnswers(answer, correct);

    const feedback = document.getElementById('typing-feedback');

    if (isCorrect) {
      feedback.innerHTML = `<div class="typing-feedback correct">Richtig!</div>`;
    } else {
      feedback.innerHTML = `
        <div class="typing-feedback incorrect">
          Falsch. Richtig wäre: <strong>${this.escapeHtml(correct)}</strong>
        </div>
      `;
    }

    input.disabled = true;

    setTimeout(() => this.answer(isCorrect), 1500);
  },

  renderDictation(container, card) {
    const qa = this.getQuestionAnswer(card);
    const speechAvailable = 'speechSynthesis' in window && state.settings.speechEnabled;

    container.innerHTML = `
      <div class="dictation-controls">
        <button class="speak-btn" onclick="LearnView.speakWithLang('${this.escapeAttr(qa.answer)}', '${qa.answerLang}')"
                ${!speechAvailable ? 'disabled title="Sprachausgabe nicht verfugbar"' : ''}
                aria-label="Wort anhoren">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p class="text-muted">${speechAvailable ? 'Tippe zum Anhoren' : 'Sprachausgabe nicht verfugbar'}</p>
      </div>
      <div class="typing-question">
        <div class="text-muted mb-sm">Schreibe das gehorte Wort</div>
        ${!speechAvailable ? `<div class="text-muted" style="font-size: 0.875rem;">Hinweis: ${this.escapeHtml(qa.question)}</div>` : ''}
      </div>
      <div class="typing-input-wrapper">
        <input type="text" class="form-input typing-input" id="dictation-answer"
               placeholder="Deine Antwort..." autocomplete="off" autocapitalize="off">
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="LearnView.checkDictationAnswer('${this.escapeAttr(qa.answer)}')">
        Prufen
      </button>
      <div id="dictation-feedback"></div>
    `;

    // Automatisch abspielen
    if (speechAvailable) {
      setTimeout(() => this.speakWithLang(qa.answer, qa.answerLang), 500);
    }

    // Enter-Taste
    document.getElementById('dictation-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkDictationAnswer(qa.answer);
      }
    });
  },

  speak(text) {
    if ('speechSynthesis' in window) {
      // Wait for voices to load before speaking
      const doSpeak = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = state.settings.speechLang;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      };

      // Check if voices are already loaded
      if (speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        // Wait for voices to load
        speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
      }
    }
  },

  // Speak with a specific language (for bidirectional practice)
  speakWithLang(text, lang) {
    if ('speechSynthesis' in window) {
      const doSpeak = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      };

      if (speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
      }
    }
  },

  checkDictationAnswer(correct) {
    const input = document.getElementById('dictation-answer');
    const answer = input.value.trim();
    const isCorrect = this.compareAnswers(answer, correct);

    const feedback = document.getElementById('dictation-feedback');

    if (isCorrect) {
      feedback.innerHTML = `<div class="typing-feedback correct">Richtig!</div>`;
    } else {
      feedback.innerHTML = `
        <div class="typing-feedback incorrect">
          Falsch. Richtig wäre: <strong>${this.escapeHtml(correct)}</strong>
        </div>
      `;
    }

    input.disabled = true;

    setTimeout(() => this.answer(isCorrect), 1500);
  },

  compareAnswers(given, correct) {
    if (!given || !correct) return false;

    let a = given.trim();
    let b = correct.trim();

    if (state.settings.tolerantMode) {
      a = a.toLowerCase();
      b = b.toLowerCase();

      // Umlaute normalisieren
      const normalize = (s) => s
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '');

      return normalize(a) === normalize(b) || a === b.toLowerCase();
    }

    return a === b;
  },

  async answer(isCorrect) {
    const card = state.currentSession.cards[state.currentCardIndex];

    state.sessionResults.push({
      vocabId: card.id,
      correct: isCorrect
    });

    await DataManager.saveProgress(card.id, isCorrect);

    state.currentCardIndex++;

    if (state.currentCardIndex >= state.currentSession.cards.length) {
      this.showResults();
    } else {
      this.renderExercise();
    }
  },

  showResults() {
    const correct = state.sessionResults.filter(r => r.correct).length;
    const total = state.sessionResults.length;
    const percentage = Math.round((correct / total) * 100);

    let message = '';
    if (percentage === 100) message = 'Perfekt! Alle richtig!';
    else if (percentage >= 80) message = 'Sehr gut gemacht!';
    else if (percentage >= 60) message = 'Gut, weiter so!';
    else if (percentage >= 40) message = 'Weiter üben!';
    else message = 'Nicht aufgeben!';

    const container = document.getElementById('view-learn');

    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="results-summary">
            <div class="results-score">${percentage}%</div>
            <div class="results-message">${message}</div>
            <div class="results-details">
              <div class="results-detail">
                <div class="results-detail-value text-success">${correct}</div>
                <div class="results-detail-label">Richtig</div>
              </div>
              <div class="results-detail">
                <div class="results-detail-value text-error">${total - correct}</div>
                <div class="results-detail-label">Falsch</div>
              </div>
            </div>
            <div class="action-row">
              <button class="btn btn-secondary" onclick="LearnView.init()">
                Zurück
              </button>
              <button class="btn btn-primary" onclick="LearnView.beginSession()">
                Nochmal
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Session zurücksetzen
    state.currentSession = null;
  },

  endSession() {
    if (state.sessionResults.length > 0) {
      if (confirm('Sitzung wirklich beenden?')) {
        state.currentSession = null;
        this.init();
      }
    } else {
      state.currentSession = null;
      this.init();
    }
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeAttr(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
};

// ============================================
// WORDS VIEW
// ============================================

const WordsView = {
  filter: '',
  category: '',

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-words');

    // Kategorien sammeln
    const categories = [...new Set(state.vocabulary.map(v => v.category).filter(Boolean))];

    // Filtern
    let filtered = state.vocabulary;
    if (this.filter) {
      const f = this.filter.toLowerCase();
      filtered = filtered.filter(v =>
        v.native.toLowerCase().includes(f) ||
        v.foreign.toLowerCase().includes(f)
      );
    }
    if (this.category) {
      filtered = filtered.filter(v => v.category === this.category);
    }

    container.innerHTML = `
      <div class="search-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="form-input search-input" placeholder="Suchen..."
               value="${this.escapeHtml(this.filter)}" oninput="WordsView.setFilter(this.value)">
      </div>

      ${categories.length > 0 ? `
        <div class="filter-chips">
          <button class="filter-chip ${!this.category ? 'active' : ''}" onclick="WordsView.setCategory('')">Alle</button>
          ${categories.map(cat => `
            <button class="filter-chip ${this.category === cat ? 'active' : ''}"
                    onclick="WordsView.setCategory('${this.escapeAttr(cat)}')">${this.escapeHtml(cat)}</button>
          `).join('')}
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
        <span class="text-muted">${filtered.length} Vokabeln</span>
        <button class="btn btn-primary" onclick="WordsView.showAddModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Hinzufügen
        </button>
      </div>

      ${filtered.length > 0 ? `
        <div class="selection-controls">
          <span id="selection-count">${filtered.filter(v => state.selectedWords.has(v.id)).length}/${filtered.length} ausgewählt</span>
          <div class="selection-buttons">
            <button class="btn btn-sm" onclick="WordsView.selectAll()">Alle auswählen</button>
            <button class="btn btn-sm btn-secondary" onclick="WordsView.deselectAll()">Keine</button>
          </div>
        </div>
      ` : ''}

      ${filtered.length === 0 ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3>Keine Vokabeln</h3>
          <p>${this.filter || this.category ? 'Keine Treffer für diese Filter.' : 'Füge deine ersten Vokabeln hinzu!'}</p>
        </div>
      ` : `
        <div class="vocab-list">
          ${filtered.map(vocab => this.renderVocabItem(vocab)).join('')}
        </div>
      `}
    `;
  },

  renderVocabItem(vocab) {
    const progress = state.progress[vocab.id];
    const level = progress ? progress.level : -1;
    const isSelected = state.selectedWords.has(vocab.id);

    return `
      <div class="vocab-item">
        <label class="vocab-checkbox">
          <input type="checkbox"
                 ${isSelected ? 'checked' : ''}
                 onchange="WordsView.toggleSelection('${vocab.id}')"
                 onclick="event.stopPropagation()">
        </label>
        <div class="vocab-item-content">
          <div class="vocab-item-native">${this.escapeHtml(vocab.native)}</div>
          <div class="vocab-item-foreign">${this.escapeHtml(vocab.foreign)}</div>
          <div class="vocab-item-meta">
            ${vocab.category ? `<span class="badge">${this.escapeHtml(vocab.category)}</span> ` : ''}
            ${this.renderDifficulty(vocab.difficulty || 1)}
            ${level >= 0 ? ` · Level ${level + 1}` : ' · Neu'}
          </div>
        </div>
        <div class="vocab-item-actions">
          <button class="btn btn-ghost btn-icon" onclick="WordsView.showEditModal('${vocab.id}')" aria-label="Bearbeiten">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-ghost btn-icon" onclick="WordsView.deleteVocab('${vocab.id}')" aria-label="Löschen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  renderDifficulty(level) {
    return `
      <span class="difficulty">
        ${[1, 2, 3].map(i => `<span class="difficulty-dot ${i <= level ? 'filled' : ''}"></span>`).join('')}
      </span>
    `;
  },

  setFilter(value) {
    this.filter = value;
    this.render();
  },

  setCategory(cat) {
    this.category = cat;
    this.render();
  },

  showAddModal() {
    Modal.open('Neue Vokabel', this.getVocabForm(), `
      <button class="btn btn-secondary" onclick="Modal.close()">Abbrechen</button>
      <button class="btn btn-primary" onclick="WordsView.saveVocab()">Speichern</button>
    `);

    document.getElementById('vocab-native').focus();
  },

  showEditModal(id) {
    const vocab = state.vocabulary.find(v => v.id === id);
    if (!vocab) return;

    Modal.open('Vokabel bearbeiten', this.getVocabForm(vocab), `
      <button class="btn btn-secondary" onclick="Modal.close()">Abbrechen</button>
      <button class="btn btn-primary" onclick="WordsView.saveVocab('${id}')">Speichern</button>
    `);
  },

  getVocabForm(vocab = {}) {
    return `
      <form id="vocab-form" onsubmit="event.preventDefault(); WordsView.saveVocab('${vocab.id || ''}');">
        <div class="form-group">
          <label class="form-label" for="vocab-native">Muttersprache (z.B. Deutsch) *</label>
          <input type="text" class="form-input" id="vocab-native" required
                 value="${this.escapeHtml(vocab.native || '')}" placeholder="z.B. Hund">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-foreign">Fremdsprache (z.B. Englisch) *</label>
          <input type="text" class="form-input" id="vocab-foreign" required
                 value="${this.escapeHtml(vocab.foreign || '')}" placeholder="z.B. dog">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-example">Beispielsatz (optional)</label>
          <textarea class="form-input" id="vocab-example" rows="2"
                    placeholder="z.B. The dog is running.">${this.escapeHtml(vocab.example || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-category">Kategorie/Unit (optional)</label>
          <input type="text" class="form-input" id="vocab-category"
                 value="${this.escapeHtml(vocab.category || '')}" placeholder="z.B. Unit 1, Tiere">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-difficulty">Schwierigkeit</label>
          <select class="form-input" id="vocab-difficulty">
            <option value="1" ${vocab.difficulty === 1 ? 'selected' : ''}>Leicht</option>
            <option value="2" ${vocab.difficulty === 2 ? 'selected' : ''}>Mittel</option>
            <option value="3" ${vocab.difficulty === 3 ? 'selected' : ''}>Schwer</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-note">Notiz (optional)</label>
          <textarea class="form-input" id="vocab-note" rows="2"
                    placeholder="z.B. Merkhilfe...">${this.escapeHtml(vocab.note || '')}</textarea>
        </div>
      </form>
    `;
  },

  async saveVocab(id = '') {
    const native = document.getElementById('vocab-native').value.trim();
    const foreign = document.getElementById('vocab-foreign').value.trim();

    if (!native || !foreign) {
      Toast.show('Bitte fülle die Pflichtfelder aus', 'error');
      return;
    }

    const vocab = {
      id: id || undefined,
      native,
      foreign,
      example: document.getElementById('vocab-example').value.trim(),
      category: document.getElementById('vocab-category').value.trim(),
      difficulty: parseInt(document.getElementById('vocab-difficulty').value),
      note: document.getElementById('vocab-note').value.trim()
    };

    if (id) {
      const existing = state.vocabulary.find(v => v.id === id);
      if (existing) {
        vocab.createdAt = existing.createdAt;
      }
    }

    await DataManager.saveVocab(vocab);
    Modal.close();
    Toast.show(id ? 'Vokabel aktualisiert' : 'Vokabel hinzugefügt', 'success');
    this.render();
  },

  async deleteVocab(id) {
    if (!confirm('Vokabel wirklich löschen?')) return;

    await DataManager.deleteVocab(id);
    Toast.show('Vokabel gelöscht', 'info');
    this.render();
  },

  getFilteredVocab() {
    let filtered = state.vocabulary;
    if (this.filter) {
      const f = this.filter.toLowerCase();
      filtered = filtered.filter(v =>
        v.native.toLowerCase().includes(f) ||
        v.foreign.toLowerCase().includes(f)
      );
    }
    if (this.category) {
      filtered = filtered.filter(v => v.category === this.category);
    }
    return filtered;
  },

  async toggleSelection(id) {
    await DataManager.toggleWordSelection(id);
    this.updateSelectionCount();
  },

  updateSelectionCount() {
    const countEl = document.getElementById('selection-count');
    if (countEl) {
      const filtered = this.getFilteredVocab();
      const selectedInView = filtered.filter(v => state.selectedWords.has(v.id)).length;
      countEl.textContent = `${selectedInView}/${filtered.length} ausgewählt`;
    }
  },

  async selectAll() {
    await DataManager.selectAllInCategory(this.category);
    this.render();
  },

  async deselectAll() {
    await DataManager.deselectAllInCategory(this.category);
    this.render();
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeAttr(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
};

// ============================================
// STATS VIEW
// ============================================

const StatsView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-stats');

    const totalVocab = state.vocabulary.length;
    const learnedVocab = Object.keys(state.progress).length;
    const masteredVocab = Object.values(state.progress).filter(p => p.level >= 3).length;
    const accuracy = state.stats.totalReviews > 0
      ? Math.round((state.stats.correctAnswers / state.stats.totalReviews) * 100)
      : 0;

    // Top Fehlerwörter
    const errorWords = state.vocabulary
      .filter(v => state.progress[v.id])
      .map(v => {
        const progress = state.progress[v.id];
        const total = progress.correctCount + progress.incorrectCount;
        const errorRate = total > 0 ? (progress.incorrectCount / total) : 0;
        return { ...v, errorRate };
      })
      .filter(v => v.errorRate > 0.3)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);

    // Heute
    const today = new Date().toISOString().split('T')[0];
    const todayStats = state.stats.dailyStats[today] || { reviews: 0, correct: 0 };

    container.innerHTML = `
      ${state.stats.streak > 0 ? `
        <div class="streak-display">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <div class="streak-value">${state.stats.streak}</div>
            <div class="streak-label">Tage Streak</div>
          </div>
        </div>
      ` : ''}

      <h2 class="mb-md">Übersicht</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${totalVocab}</div>
          <div class="stat-label">Vokabeln gesamt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${learnedVocab}</div>
          <div class="stat-label">Gelernt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${masteredVocab}</div>
          <div class="stat-label">Gemeistert</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">Genauigkeit</div>
        </div>
      </div>

      <h2 class="mb-md">Heute</h2>

      <div class="card mb-lg">
        <div class="card-body">
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${todayStats.reviews}</div>
              <div class="text-muted">Wiederholungen</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${todayStats.correct}</div>
              <div class="text-muted">Richtig</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-error);">${todayStats.reviews - todayStats.correct}</div>
              <div class="text-muted">Falsch</div>
            </div>
          </div>
        </div>
      </div>

      ${errorWords.length > 0 ? `
        <h2 class="mb-md">Problemwörter</h2>
        <div class="card">
          <div class="card-body">
            <div class="vocab-list">
              ${errorWords.map(word => `
                <div class="vocab-item" style="border: none; padding: var(--space-sm) 0;">
                  <div class="vocab-item-content">
                    <div class="vocab-item-native">${this.escapeHtml(word.native)}</div>
                    <div class="vocab-item-foreign">${this.escapeHtml(word.foreign)}</div>
                  </div>
                  <span class="badge badge-error">${Math.round(word.errorRate * 100)}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <h2 class="mb-md mt-lg">Statistiken</h2>
      <div class="card">
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <div style="display: flex; justify-content: space-between;">
              <span>Gesamte Wiederholungen</span>
              <strong>${state.stats.totalReviews}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Davon richtig</span>
              <strong>${state.stats.correctAnswers}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Längster Streak</span>
              <strong>${state.stats.streak} Tage</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ============================================
// SETTINGS VIEW
// ============================================

const SettingsView = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-settings');

    container.innerHTML = `
      <div class="settings-section">
        <h3>Darstellung</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Design</div>
            <div class="settings-item-desc">Hell, Dunkel oder System</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setTheme(this.value)">
            <option value="system" ${state.settings.theme === 'system' ? 'selected' : ''}>System</option>
            <option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>Hell</option>
            <option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>Dunkel</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Lernen</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Toleranter Modus</div>
            <div class="settings-item-desc">Groß-/Kleinschreibung ignorieren</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.tolerantMode ? 'checked' : ''}
                   onchange="SettingsView.setSetting('tolerantMode', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Hinweise anzeigen</div>
            <div class="settings-item-desc">Kategorie bei Karteikarten</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.showHints ? 'checked' : ''}
                   onchange="SettingsView.setSetting('showHints', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Karten pro Sitzung</div>
            <div class="settings-item-desc">Maximale Anzahl</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setSetting('cardsPerSession', parseInt(this.value))">
            ${[5, 10, 15, 20, 30, 50].map(n => `
              <option value="${n}" ${state.settings.cardsPerSession === n ? 'selected' : ''}>${n}</option>
            `).join('')}
          </select>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Ubungsrichtung</div>
            <div class="settings-item-desc">Welche Sprache wird gezeigt, welche gefragt</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setSetting('practiceDirection', this.value)">
            <option value="de-en" ${state.settings.practiceDirection === 'de-en' ? 'selected' : ''}>Deutsch - Englisch</option>
            <option value="en-de" ${state.settings.practiceDirection === 'en-de' ? 'selected' : ''}>Englisch - Deutsch</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Sprache & Audio</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Sprachausgabe</div>
            <div class="settings-item-desc">Für Diktat-Modus</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.speechEnabled ? 'checked' : ''}
                   onchange="SettingsView.setSetting('speechEnabled', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Sound-Effekte</div>
            <div class="settings-item-desc">Bei richtig/falsch</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${state.settings.soundEnabled ? 'checked' : ''}
                   onchange="SettingsView.setSetting('soundEnabled', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Fremdsprache</div>
            <div class="settings-item-desc">Für Aussprache</div>
          </div>
          <select class="form-input" style="width: auto;" onchange="SettingsView.setSetting('speechLang', this.value)">
            <option value="en-US" ${state.settings.speechLang === 'en-US' ? 'selected' : ''}>Englisch (US)</option>
            <option value="en-GB" ${state.settings.speechLang === 'en-GB' ? 'selected' : ''}>Englisch (UK)</option>
            <option value="fr-FR" ${state.settings.speechLang === 'fr-FR' ? 'selected' : ''}>Französisch</option>
            <option value="es-ES" ${state.settings.speechLang === 'es-ES' ? 'selected' : ''}>Spanisch</option>
            <option value="it-IT" ${state.settings.speechLang === 'it-IT' ? 'selected' : ''}>Italienisch</option>
            <option value="de-DE" ${state.settings.speechLang === 'de-DE' ? 'selected' : ''}>Deutsch</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Daten</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">Daten exportieren</div>
            <div class="settings-item-desc">Als JSON-Backup</div>
          </div>
          <button class="btn btn-secondary" onclick="DataManager.exportData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">JSON importieren</div>
            <div class="settings-item-desc">Backup wiederherstellen</div>
          </div>
          <div class="file-input-wrapper">
            <input type="file" class="file-input" id="import-json" accept=".json"
                   onchange="SettingsView.importJSON(this.files[0])">
            <button class="btn btn-secondary" onclick="document.getElementById('import-json').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import
            </button>
          </div>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">CSV importieren</div>
            <div class="settings-item-desc">Format: native;foreign;example;category;difficulty</div>
          </div>
          <div class="file-input-wrapper">
            <input type="file" class="file-input" id="import-csv" accept=".csv,.txt"
                   onchange="SettingsView.importCSV(this.files[0])">
            <button class="btn btn-secondary" onclick="document.getElementById('import-csv').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              CSV
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>Gefahrenzone</h3>

        <div class="settings-item" style="border-color: var(--color-error);">
          <div>
            <div class="settings-item-label">Alle Daten löschen</div>
            <div class="settings-item-desc">Unwiderruflich!</div>
          </div>
          <button class="btn btn-error" onclick="SettingsView.clearAllData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Löschen
          </button>
        </div>
      </div>

      <div class="text-center text-muted mt-lg">
        <p>Vokabel Master+ v1.0</p>
        <p style="font-size: 0.75rem;">Made with ❤️ for learners</p>
      </div>
    `;
  },

  async setTheme(theme) {
    await DataManager.saveSettings({ theme });
    // Also save to localStorage for FOUC prevention script in index.html
    localStorage.setItem('vokabel-theme', theme);
    applyTheme(theme);
  },

  async setSetting(key, value) {
    await DataManager.saveSettings({ [key]: value });
  },

  async importJSON(file) {
    if (!file) return;
    try {
      const count = await DataManager.importJSON(file);
      Toast.show(`${count} Vokabeln importiert`, 'success');
      await DataManager.loadAll();
      this.render();
    } catch (error) {
      Toast.show('Fehler beim Import', 'error');
      console.error(error);
    }
  },

  async importCSV(file) {
    if (!file) return;
    try {
      const count = await DataManager.importCSV(file);
      Toast.show(`${count} Vokabeln importiert`, 'success');
      await DataManager.loadAll();
      this.render();
    } catch (error) {
      Toast.show('Fehler beim Import', 'error');
      console.error(error);
    }
  },

  async clearAllData() {
    if (!confirm('Wirklich ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden!')) return;
    if (!confirm('Bist du sicher? Alle Vokabeln und Fortschritte gehen verloren!')) return;

    await DB.clear(CONFIG.STORE_VOCAB);
    await DB.clear(CONFIG.STORE_PROGRESS);
    await DB.clear(CONFIG.STORE_STATS);

    state.vocabulary = [];
    state.progress = {};
    state.stats = {
      totalReviews: 0,
      correctAnswers: 0,
      streak: 0,
      lastStudyDate: null,
      dailyStats: {}
    };

    Toast.show('Alle Daten gelöscht', 'info');
    Views.show('home');
  }
};

// ============================================
// THEME HANDLING
// ============================================

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

// System theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.settings.theme === 'system') {
    applyTheme('system');
  }
});

// ============================================
// PWA INSTALL PROMPT
// ============================================

let deferredPrompt = null;

function setupInstallPrompt() {
  const installButton = document.getElementById('install-button');
  if (!installButton) return;

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.classList.add('show');
  });

  // Handle install button click
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      Toast.show('App wird installiert!', 'success');
    }

    deferredPrompt = null;
    installButton.classList.remove('show');
  });

  // Hide button if app is already installed
  window.addEventListener('appinstalled', () => {
    installButton.classList.remove('show');
    deferredPrompt = null;
    Toast.show('App erfolgreich installiert!', 'success');
  });

  // Check if running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    installButton.classList.remove('show');
  }
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

async function registerServiceWorker() {
  // Service Worker nur bei https:// oder localhost registrieren (nicht bei file://)
  const isValidProtocol = location.protocol === 'https:' ||
                          location.hostname === 'localhost' ||
                          location.hostname === '127.0.0.1';

  if (!isValidProtocol) {
    console.log('Service Worker übersprungen (file:// Protokoll)');
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registriert:', registration.scope);
    } catch (error) {
      console.error('Service Worker Fehler:', error);
    }
  }
}

// ============================================
// APP INITIALIZATION
// ============================================

async function initApp() {
  try {
    // Service Worker registrieren
    await registerServiceWorker();

    // PWA Install Prompt einrichten
    setupInstallPrompt();

    // Datenbank öffnen
    await DB.open();

    // Daten laden
    await DataManager.loadAll();

    // Seed preset vocabulary on first launch
    const seeded = await DataManager.seedPresetVocabulary();
    if (seeded) {
      Toast.show('300 Vokabeln geladen!', 'success');
    }

    // Theme anwenden
    applyTheme(state.settings.theme);

    // UI Komponenten initialisieren
    Toast.init();
    Modal.init();
    Views.init();

    // Start-View anzeigen
    Views.show('home');

    console.log('Vokabel Master+ initialisiert');

  } catch (error) {
    console.error('Initialisierung fehlgeschlagen:', error);
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Fehler</h1>
        <p>Die App konnte nicht geladen werden.</p>
        <p>${error.message}</p>
        <button onclick="location.reload()">Neu laden</button>
      </div>
    `;
  }
}

// App starten wenn DOM geladen
document.addEventListener('DOMContentLoaded', initApp);

// Prevent zoom on double-tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Keyboard shortcut for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    Modal.close();
  }
});
