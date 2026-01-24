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
        { "native": "der Flughafen", "foreign": "airport", "example": "We're going to the airport.", "exampleDe": "Wir fahren zum Flughafen." },
        { "native": "das Flugzeug", "foreign": "airplane", "example": "The airplane lands at 2 PM.", "exampleDe": "Das Flugzeug landet um 14 Uhr." },
        { "native": "der Bahnhof", "foreign": "train station", "example": "The train station is in the city center.", "exampleDe": "Der Bahnhof ist in der Stadtmitte." },
        { "native": "der Zug", "foreign": "train", "example": "The train arrives in ten minutes.", "exampleDe": "Der Zug kommt in zehn Minuten." },
        { "native": "die U-Bahn", "foreign": "subway", "example": "We take the subway.", "exampleDe": "Wir nehmen die U-Bahn." },
        { "native": "der Bus", "foreign": "bus", "example": "The bus runs every 15 minutes.", "exampleDe": "Der Bus faehrt alle 15 Minuten." },
        { "native": "das Taxi", "foreign": "taxi", "example": "I'm calling a taxi.", "exampleDe": "Ich rufe ein Taxi." },
        { "native": "das Auto", "foreign": "car", "example": "My car is blue.", "exampleDe": "Mein Auto ist blau." },
        { "native": "das Fahrrad", "foreign": "bicycle", "example": "I ride my bicycle to work.", "exampleDe": "Ich fahre mit dem Fahrrad zur Arbeit." },
        { "native": "die Fahrkarte", "foreign": "ticket", "example": "I'm buying a ticket.", "exampleDe": "Ich kaufe eine Fahrkarte." },
        { "native": "der Koffer", "foreign": "suitcase", "example": "My suitcase is heavy.", "exampleDe": "Mein Koffer ist schwer." },
        { "native": "der Rucksack", "foreign": "backpack", "example": "I'm packing my backpack.", "exampleDe": "Ich packe meinen Rucksack." },
        { "native": "der Pass", "foreign": "passport", "example": "Don't forget your passport!", "exampleDe": "Vergiss deinen Pass nicht!" },
        { "native": "das Visum", "foreign": "visa", "example": "Do I need a visa?", "exampleDe": "Brauche ich ein Visum?" },
        { "native": "die Grenze", "foreign": "border", "example": "We're crossing the border.", "exampleDe": "Wir ueberqueren die Grenze." },
        { "native": "das Hotel", "foreign": "hotel", "example": "The hotel has five stars.", "exampleDe": "Das Hotel hat fuenf Sterne." },
        { "native": "das Zimmer", "foreign": "room", "example": "I'd like to book a room.", "exampleDe": "Ich moechte ein Zimmer reservieren." },
        { "native": "die Rezeption", "foreign": "reception", "example": "The reception is on the ground floor.", "exampleDe": "Die Rezeption ist im Erdgeschoss." },
        { "native": "der Schluessel", "foreign": "key", "example": "Here is your key.", "exampleDe": "Hier ist Ihr Schluessel." },
        { "native": "das Fruehstueck", "foreign": "breakfast", "example": "Breakfast is included.", "exampleDe": "Das Fruehstueck ist inklusive." },
        { "native": "das Restaurant", "foreign": "restaurant", "example": "We're eating at the restaurant.", "exampleDe": "Wir essen im Restaurant." },
        { "native": "das Cafe", "foreign": "cafe", "example": "Shall we meet at the cafe?", "exampleDe": "Treffen wir uns im Cafe?" },
        { "native": "die Speisekarte", "foreign": "menu", "example": "Can I have the menu?", "exampleDe": "Kann ich die Speisekarte haben?" },
        { "native": "die Rechnung", "foreign": "bill", "example": "The bill, please.", "exampleDe": "Die Rechnung, bitte." },
        { "native": "das Trinkgeld", "foreign": "tip", "example": "We give ten percent tip.", "exampleDe": "Wir geben zehn Prozent Trinkgeld." },
        { "native": "der Kellner", "foreign": "waiter", "example": "The waiter is very friendly.", "exampleDe": "Der Kellner ist sehr freundlich." },
        { "native": "die Kellnerin", "foreign": "waitress", "example": "The waitress brings the food.", "exampleDe": "Die Kellnerin bringt das Essen." },
        { "native": "die Strasse", "foreign": "street", "example": "The street is very long.", "exampleDe": "Die Strasse ist sehr lang." },
        { "native": "die Kreuzung", "foreign": "intersection", "example": "Turn right at the intersection.", "exampleDe": "Biegen Sie an der Kreuzung rechts ab." },
        { "native": "die Ampel", "foreign": "traffic light", "example": "Wait at the traffic light.", "exampleDe": "Warten Sie an der Ampel." },
        { "native": "geradeaus", "foreign": "straight ahead", "example": "Go straight ahead.", "exampleDe": "Gehen Sie geradeaus." },
        { "native": "links", "foreign": "left", "example": "Turn left.", "exampleDe": "Biegen Sie links ab." },
        { "native": "rechts", "foreign": "right", "example": "The museum is on the right.", "exampleDe": "Das Museum ist rechts." },
        { "native": "die Ecke", "foreign": "corner", "example": "The shop is on the corner.", "exampleDe": "Das Geschaeft ist an der Ecke." },
        { "native": "die Bruecke", "foreign": "bridge", "example": "Go over the bridge.", "exampleDe": "Gehen Sie ueber die Bruecke." },
        { "native": "der Platz", "foreign": "square", "example": "The market square is beautiful.", "exampleDe": "Der Marktplatz ist schoen." },
        { "native": "das Geschaeft", "foreign": "shop", "example": "The shop opens at nine.", "exampleDe": "Das Geschaeft oeffnet um neun." },
        { "native": "der Supermarkt", "foreign": "supermarket", "example": "I shop at the supermarket.", "exampleDe": "Ich kaufe im Supermarkt ein." },
        { "native": "die Baeckerei", "foreign": "bakery", "example": "The bakery has fresh bread.", "exampleDe": "Die Baeckerei hat frisches Brot." },
        { "native": "die Apotheke", "foreign": "pharmacy", "example": "The pharmacy is across the street.", "exampleDe": "Die Apotheke ist gegenueber." },
        { "native": "die Bank", "foreign": "bank", "example": "I need to go to the bank.", "exampleDe": "Ich muss zur Bank gehen." },
        { "native": "das Geld", "foreign": "money", "example": "I need more money.", "exampleDe": "Ich brauche mehr Geld." },
        { "native": "der Geldautomat", "foreign": "ATM", "example": "Where is the nearest ATM?", "exampleDe": "Wo ist der naechste Geldautomat?" },
        { "native": "die Kreditkarte", "foreign": "credit card", "example": "Can I pay by credit card?", "exampleDe": "Kann ich mit Kreditkarte zahlen?" },
        { "native": "bar", "foreign": "cash", "example": "I'm paying cash.", "exampleDe": "Ich zahle bar." },
        { "native": "teuer", "foreign": "expensive", "example": "That's too expensive.", "exampleDe": "Das ist zu teuer." },
        { "native": "billig", "foreign": "cheap", "example": "This jacket is cheap.", "exampleDe": "Diese Jacke ist billig." },
        { "native": "der Preis", "foreign": "price", "example": "What is the price?", "exampleDe": "Was ist der Preis?" },
        { "native": "der Rabatt", "foreign": "discount", "example": "Is there a discount?", "exampleDe": "Gibt es einen Rabatt?" },
        { "native": "das Wetter", "foreign": "weather", "example": "How is the weather today?", "exampleDe": "Wie ist das Wetter heute?" },
        { "native": "die Sonne", "foreign": "sun", "example": "The sun is shining.", "exampleDe": "Die Sonne scheint." },
        { "native": "der Regen", "foreign": "rain", "example": "There is rain.", "exampleDe": "Es gibt Regen." },
        { "native": "der Schnee", "foreign": "snow", "example": "Snow falls in winter.", "exampleDe": "Im Winter faellt Schnee." },
        { "native": "der Wind", "foreign": "wind", "example": "The wind is strong today.", "exampleDe": "Der Wind ist stark heute." },
        { "native": "die Wolke", "foreign": "cloud", "example": "Many clouds in the sky.", "exampleDe": "Viele Wolken am Himmel." },
        { "native": "warm", "foreign": "warm", "example": "It's warm outside.", "exampleDe": "Es ist warm draussen." },
        { "native": "kalt", "foreign": "cold", "example": "Winter is cold.", "exampleDe": "Der Winter ist kalt." },
        { "native": "heiss", "foreign": "hot", "example": "Summer is hot.", "exampleDe": "Der Sommer ist heiss." },
        { "native": "kuehl", "foreign": "cool", "example": "The evenings are cool.", "exampleDe": "Die Abende sind kuehl." },
        { "native": "die Uhr", "foreign": "clock/watch", "example": "What time is it on the clock?", "exampleDe": "Wie spaet ist es auf der Uhr?" },
        { "native": "die Stunde", "foreign": "hour", "example": "We wait one hour.", "exampleDe": "Wir warten eine Stunde." },
        { "native": "die Minute", "foreign": "minute", "example": "Five minutes left.", "exampleDe": "Fuenf Minuten noch." },
        { "native": "heute", "foreign": "today", "example": "Today I'm going shopping.", "exampleDe": "Heute gehe ich einkaufen." },
        { "native": "morgen", "foreign": "tomorrow", "example": "Tomorrow we leave.", "exampleDe": "Morgen fahren wir ab." },
        { "native": "gestern", "foreign": "yesterday", "example": "Yesterday I was tired.", "exampleDe": "Gestern war ich muede." },
        { "native": "jetzt", "foreign": "now", "example": "I have to go now.", "exampleDe": "Ich muss jetzt gehen." },
        { "native": "spaeter", "foreign": "later", "example": "See you later.", "exampleDe": "Wir sehen uns spaeter." },
        { "native": "frueher", "foreign": "earlier", "example": "I came earlier.", "exampleDe": "Ich bin frueher gekommen." },
        { "native": "die Woche", "foreign": "week", "example": "Next week I have vacation.", "exampleDe": "Naechste Woche habe ich Urlaub." },
        { "native": "der Monat", "foreign": "month", "example": "This month is short.", "exampleDe": "Dieser Monat ist kurz." },
        { "native": "das Jahr", "foreign": "year", "example": "The new year begins.", "exampleDe": "Das neue Jahr beginnt." },
        { "native": "Guten Morgen", "foreign": "good morning", "example": "Good morning, how are you?", "exampleDe": "Guten Morgen, wie geht es Ihnen?" },
        { "native": "Guten Tag", "foreign": "good day", "example": "Good day, can I help you?", "exampleDe": "Guten Tag, kann ich Ihnen helfen?" },
        { "native": "Guten Abend", "foreign": "good evening", "example": "Good evening, welcome.", "exampleDe": "Guten Abend, willkommen." },
        { "native": "Gute Nacht", "foreign": "good night", "example": "Good night, sleep well.", "exampleDe": "Gute Nacht, schlaf gut." },
        { "native": "Auf Wiedersehen", "foreign": "goodbye", "example": "Goodbye, see you soon!", "exampleDe": "Auf Wiedersehen, bis bald!" },
        { "native": "Tschuess", "foreign": "bye", "example": "Bye, see you tomorrow!", "exampleDe": "Tschuess, bis morgen!" },
        { "native": "Bitte", "foreign": "please/you're welcome", "example": "Please, come in.", "exampleDe": "Bitte, kommen Sie herein." },
        { "native": "Danke", "foreign": "thank you", "example": "Thank you for your help.", "exampleDe": "Danke fuer Ihre Hilfe." },
        { "native": "Entschuldigung", "foreign": "excuse me/sorry", "example": "Excuse me, where is the restroom?", "exampleDe": "Entschuldigung, wo ist die Toilette?" },
        { "native": "ja", "foreign": "yes", "example": "Yes, that's correct.", "exampleDe": "Ja, das ist richtig." },
        { "native": "nein", "foreign": "no", "example": "No, that's not right.", "exampleDe": "Nein, das stimmt nicht." },
        { "native": "vielleicht", "foreign": "maybe", "example": "Maybe I'll come later.", "exampleDe": "Vielleicht komme ich spaeter." },
        { "native": "Ich verstehe", "foreign": "I understand", "example": "I understand, thank you.", "exampleDe": "Ich verstehe, danke." },
        { "native": "Ich verstehe nicht", "foreign": "I don't understand", "example": "I don't understand, please repeat.", "exampleDe": "Ich verstehe nicht, bitte wiederholen." },
        { "native": "Sprechen Sie Englisch?", "foreign": "Do you speak English?", "example": "Excuse me, do you speak English?", "exampleDe": "Entschuldigung, sprechen Sie Englisch?" },
        { "native": "Wie bitte?", "foreign": "Pardon?", "example": "Pardon? I didn't hear.", "exampleDe": "Wie bitte? Ich habe nicht gehoert." },
        { "native": "Hilfe", "foreign": "help", "example": "I need help!", "exampleDe": "Ich brauche Hilfe!" },
        { "native": "der Notfall", "foreign": "emergency", "example": "This is an emergency.", "exampleDe": "Das ist ein Notfall." },
        { "native": "die Polizei", "foreign": "police", "example": "Call the police.", "exampleDe": "Rufen Sie die Polizei." },
        { "native": "der Arzt", "foreign": "doctor", "example": "I need a doctor.", "exampleDe": "Ich brauche einen Arzt." },
        { "native": "das Krankenhaus", "foreign": "hospital", "example": "Where is the nearest hospital?", "exampleDe": "Wo ist das naechste Krankenhaus?" },
        { "native": "die Toilette", "foreign": "toilet/restroom", "example": "Where is the restroom please?", "exampleDe": "Wo ist die Toilette bitte?" },
        { "native": "der Ausgang", "foreign": "exit", "example": "The exit is over there.", "exampleDe": "Der Ausgang ist dort." },
        { "native": "der Eingang", "foreign": "entrance", "example": "The entrance is on the other side.", "exampleDe": "Der Eingang ist auf der anderen Seite." },
        { "native": "geoeffnet", "foreign": "open", "example": "The museum is open.", "exampleDe": "Das Museum ist geoeffnet." },
        { "native": "geschlossen", "foreign": "closed", "example": "The shop is closed.", "exampleDe": "Das Geschaeft ist geschlossen." },
        { "native": "frei", "foreign": "free/available", "example": "Is this seat free?", "exampleDe": "Ist dieser Platz frei?" },
        { "native": "besetzt", "foreign": "occupied", "example": "This table is occupied.", "exampleDe": "Dieser Tisch ist besetzt." },
        { "native": "das Handgepaeck", "foreign": "carry-on luggage", "example": "My carry-on luggage is light.", "exampleDe": "Mein Handgepaeck ist leicht." }
      ]
    },
    {
      "name": "Schule & Bildung",
      "words": [
        { "native": "die Schule", "foreign": "school", "example": "School starts at eight o'clock.", "exampleDe": "Die Schule beginnt um acht Uhr." },
        { "native": "die Universitaet", "foreign": "university", "example": "I study at the university.", "exampleDe": "Ich studiere an der Universitaet." },
        { "native": "der Lehrer", "foreign": "teacher (male)", "example": "The teacher explains the task.", "exampleDe": "Der Lehrer erklaert die Aufgabe." },
        { "native": "die Lehrerin", "foreign": "teacher (female)", "example": "The teacher is very nice.", "exampleDe": "Die Lehrerin ist sehr nett." },
        { "native": "der Schueler", "foreign": "student (male)", "example": "The student does homework.", "exampleDe": "Der Schueler macht Hausaufgaben." },
        { "native": "die Schuelerin", "foreign": "student (female)", "example": "The student studies diligently.", "exampleDe": "Die Schuelerin lernt fleissig." },
        { "native": "der Student", "foreign": "university student (male)", "example": "The student attends lectures.", "exampleDe": "Der Student besucht Vorlesungen." },
        { "native": "die Studentin", "foreign": "university student (female)", "example": "The student writes her thesis.", "exampleDe": "Die Studentin schreibt ihre Arbeit." },
        { "native": "das Klassenzimmer", "foreign": "classroom", "example": "The classroom is large.", "exampleDe": "Das Klassenzimmer ist gross." },
        { "native": "die Tafel", "foreign": "blackboard", "example": "The teacher writes on the blackboard.", "exampleDe": "Der Lehrer schreibt an die Tafel." },
        { "native": "der Schreibtisch", "foreign": "desk", "example": "My desk is tidy.", "exampleDe": "Mein Schreibtisch ist ordentlich." },
        { "native": "der Stuhl", "foreign": "chair", "example": "Please sit on the chair.", "exampleDe": "Bitte setzen Sie sich auf den Stuhl." },
        { "native": "das Buch", "foreign": "book", "example": "I'm reading a book.", "exampleDe": "Ich lese ein Buch." },
        { "native": "das Heft", "foreign": "notebook", "example": "I write in my notebook.", "exampleDe": "Ich schreibe in mein Heft." },
        { "native": "der Bleistift", "foreign": "pencil", "example": "I need a pencil.", "exampleDe": "Ich brauche einen Bleistift." },
        { "native": "der Kugelschreiber", "foreign": "pen", "example": "Do you have a pen?", "exampleDe": "Hast du einen Kugelschreiber?" },
        { "native": "der Radiergummi", "foreign": "eraser", "example": "I forgot my eraser.", "exampleDe": "Ich habe meinen Radiergummi vergessen." },
        { "native": "das Lineal", "foreign": "ruler", "example": "Draw a line with the ruler.", "exampleDe": "Zeichne mit dem Lineal eine Linie." },
        { "native": "die Schere", "foreign": "scissors", "example": "I cut with the scissors.", "exampleDe": "Ich schneide mit der Schere." },
        { "native": "der Taschenrechner", "foreign": "calculator", "example": "You may use the calculator.", "exampleDe": "Du darfst den Taschenrechner benutzen." },
        { "native": "der Computer", "foreign": "computer", "example": "We work on the computer.", "exampleDe": "Wir arbeiten am Computer." },
        { "native": "das Woerterbuch", "foreign": "dictionary", "example": "Look up the word in the dictionary.", "exampleDe": "Schlag das Wort im Woerterbuch nach." },
        { "native": "die Bibliothek", "foreign": "library", "example": "I study in the library.", "exampleDe": "Ich lerne in der Bibliothek." },
        { "native": "die Hausaufgabe", "foreign": "homework", "example": "I'm doing my homework.", "exampleDe": "Ich mache meine Hausaufgaben." },
        { "native": "die Pruefung", "foreign": "exam", "example": "Tomorrow I have an exam.", "exampleDe": "Morgen habe ich eine Pruefung." },
        { "native": "der Test", "foreign": "test", "example": "The test was difficult.", "exampleDe": "Der Test war schwer." },
        { "native": "die Note", "foreign": "grade", "example": "I got a good grade.", "exampleDe": "Ich habe eine gute Note bekommen." },
        { "native": "das Zeugnis", "foreign": "report card", "example": "My report card is very good.", "exampleDe": "Mein Zeugnis ist sehr gut." },
        { "native": "bestehen", "foreign": "to pass", "example": "I passed the exam.", "exampleDe": "Ich habe die Pruefung bestanden." },
        { "native": "durchfallen", "foreign": "to fail", "example": "Unfortunately he failed.", "exampleDe": "Er ist leider durchgefallen." },
        { "native": "lernen", "foreign": "to learn", "example": "I learn every day.", "exampleDe": "Ich lerne jeden Tag." },
        { "native": "studieren", "foreign": "to study", "example": "She studies medicine.", "exampleDe": "Sie studiert Medizin." },
        { "native": "lesen", "foreign": "to read", "example": "I like to read books.", "exampleDe": "Ich lese gern Buecher." },
        { "native": "schreiben", "foreign": "to write", "example": "Write your name.", "exampleDe": "Schreib deinen Namen." },
        { "native": "rechnen", "foreign": "to calculate", "example": "Children learn to calculate.", "exampleDe": "Kinder lernen rechnen." },
        { "native": "verstehen", "foreign": "to understand", "example": "I don't understand the question.", "exampleDe": "Ich verstehe die Frage nicht." },
        { "native": "erklaeren", "foreign": "to explain", "example": "Can you explain that?", "exampleDe": "Kannst du das erklaeren?" },
        { "native": "fragen", "foreign": "to ask", "example": "May I ask you something?", "exampleDe": "Darf ich Sie etwas fragen?" },
        { "native": "antworten", "foreign": "to answer", "example": "Please answer the question.", "exampleDe": "Bitte antworte auf die Frage." },
        { "native": "ueben", "foreign": "to practice", "example": "I need to practice more.", "exampleDe": "Ich muss mehr ueben." },
        { "native": "wiederholen", "foreign": "to repeat", "example": "Please repeat that.", "exampleDe": "Bitte wiederholen Sie das." },
        { "native": "uebersetzen", "foreign": "to translate", "example": "Translate the sentence into English.", "exampleDe": "Uebersetze den Satz ins Englische." },
        { "native": "die Mathematik", "foreign": "mathematics", "example": "Mathematics is my favorite subject.", "exampleDe": "Mathematik ist mein Lieblingsfach." },
        { "native": "die Physik", "foreign": "physics", "example": "Physics is interesting.", "exampleDe": "Physik ist interessant." },
        { "native": "die Chemie", "foreign": "chemistry", "example": "In chemistry we do experiments.", "exampleDe": "In Chemie machen wir Experimente." },
        { "native": "die Biologie", "foreign": "biology", "example": "Biology is about living things.", "exampleDe": "Biologie handelt von Lebewesen." },
        { "native": "die Geschichte", "foreign": "history", "example": "I like history.", "exampleDe": "Ich mag Geschichte." },
        { "native": "die Geographie", "foreign": "geography", "example": "We learn countries in geography.", "exampleDe": "Wir lernen Laender in Geographie." },
        { "native": "die Kunst", "foreign": "art", "example": "In art we paint pictures.", "exampleDe": "In Kunst malen wir Bilder." },
        { "native": "die Musik", "foreign": "music", "example": "We sing in music class.", "exampleDe": "Wir singen im Musikunterricht." },
        { "native": "der Sport", "foreign": "sports/PE", "example": "Sports is fun for me.", "exampleDe": "Sport macht mir Spass." },
        { "native": "die Sprache", "foreign": "language", "example": "I'm learning a new language.", "exampleDe": "Ich lerne eine neue Sprache." },
        { "native": "das Deutsch", "foreign": "German (subject)", "example": "German is not difficult.", "exampleDe": "Deutsch ist nicht schwer." },
        { "native": "das Englisch", "foreign": "English (subject)", "example": "My English is getting better.", "exampleDe": "Mein Englisch wird besser." },
        { "native": "das Franzoesisch", "foreign": "French (subject)", "example": "French sounds beautiful.", "exampleDe": "Franzoesisch klingt schoen." },
        { "native": "die Informatik", "foreign": "computer science", "example": "In computer science we program.", "exampleDe": "In Informatik programmieren wir." },
        { "native": "die Philosophie", "foreign": "philosophy", "example": "Philosophy encourages thinking.", "exampleDe": "Philosophie regt zum Denken an." },
        { "native": "die Literatur", "foreign": "literature", "example": "We read classic literature.", "exampleDe": "Wir lesen klassische Literatur." },
        { "native": "das Fach", "foreign": "subject", "example": "Which subject do you like most?", "exampleDe": "Welches Fach magst du am meisten?" },
        { "native": "der Stundenplan", "foreign": "schedule/timetable", "example": "My schedule is full.", "exampleDe": "Mein Stundenplan ist voll." },
        { "native": "die Stunde", "foreign": "lesson/period", "example": "The lesson lasts 45 minutes.", "exampleDe": "Die Stunde dauert 45 Minuten." },
        { "native": "die Pause", "foreign": "break", "example": "During the break we eat.", "exampleDe": "In der Pause essen wir." },
        { "native": "der Unterricht", "foreign": "class/instruction", "example": "Class starts at 8 o'clock.", "exampleDe": "Der Unterricht beginnt um 8 Uhr." },
        { "native": "die Vorlesung", "foreign": "lecture", "example": "The lecture was interesting.", "exampleDe": "Die Vorlesung war interessant." },
        { "native": "das Seminar", "foreign": "seminar", "example": "In the seminar we discuss.", "exampleDe": "Im Seminar diskutieren wir." },
        { "native": "der Kurs", "foreign": "course", "example": "I'm taking a German course.", "exampleDe": "Ich besuche einen Deutschkurs." },
        { "native": "das Projekt", "foreign": "project", "example": "We're working on a project.", "exampleDe": "Wir arbeiten an einem Projekt." },
        { "native": "die Praesentation", "foreign": "presentation", "example": "Tomorrow I'm giving a presentation.", "exampleDe": "Morgen halte ich eine Praesentation." },
        { "native": "das Referat", "foreign": "report/presentation", "example": "My report is finished.", "exampleDe": "Mein Referat ist fertig." },
        { "native": "die Aufgabe", "foreign": "task/exercise", "example": "This task is difficult.", "exampleDe": "Diese Aufgabe ist schwierig." },
        { "native": "die Loesung", "foreign": "solution", "example": "I found the solution.", "exampleDe": "Ich habe die Loesung gefunden." },
        { "native": "das Ergebnis", "foreign": "result", "example": "The result is correct.", "exampleDe": "Das Ergebnis ist richtig." },
        { "native": "der Fehler", "foreign": "mistake", "example": "I made a mistake.", "exampleDe": "Ich habe einen Fehler gemacht." },
        { "native": "richtig", "foreign": "correct", "example": "The answer is correct.", "exampleDe": "Die Antwort ist richtig." },
        { "native": "falsch", "foreign": "wrong", "example": "That's unfortunately wrong.", "exampleDe": "Das ist leider falsch." },
        { "native": "schwer", "foreign": "difficult", "example": "The exam was difficult.", "exampleDe": "Die Pruefung war schwer." },
        { "native": "leicht", "foreign": "easy", "example": "The task was easy.", "exampleDe": "Die Aufgabe war leicht." },
        { "native": "fleissig", "foreign": "hardworking", "example": "She is a hardworking student.", "exampleDe": "Sie ist eine fleissige Schuelerin." },
        { "native": "faul", "foreign": "lazy", "example": "Don't be so lazy!", "exampleDe": "Sei nicht so faul!" },
        { "native": "intelligent", "foreign": "intelligent", "example": "He is very intelligent.", "exampleDe": "Er ist sehr intelligent." },
        { "native": "kreativ", "foreign": "creative", "example": "Artists are creative.", "exampleDe": "Kuenstler sind kreativ." },
        { "native": "neugierig", "foreign": "curious", "example": "Children are curious.", "exampleDe": "Kinder sind neugierig." },
        { "native": "aufmerksam", "foreign": "attentive", "example": "Be attentive in class.", "exampleDe": "Sei aufmerksam im Unterricht." },
        { "native": "das Wissen", "foreign": "knowledge", "example": "Knowledge is power.", "exampleDe": "Wissen ist Macht." },
        { "native": "die Bildung", "foreign": "education", "example": "Education is important.", "exampleDe": "Bildung ist wichtig." },
        { "native": "das Lernen", "foreign": "learning", "example": "Learning is fun.", "exampleDe": "Lernen macht Spass." },
        { "native": "die Forschung", "foreign": "research", "example": "Research is important.", "exampleDe": "Die Forschung ist wichtig." },
        { "native": "das Experiment", "foreign": "experiment", "example": "We're conducting an experiment.", "exampleDe": "Wir fuehren ein Experiment durch." },
        { "native": "die Theorie", "foreign": "theory", "example": "The theory is complex.", "exampleDe": "Die Theorie ist komplex." },
        { "native": "die Praxis", "foreign": "practice", "example": "Theory and practice go together.", "exampleDe": "Theorie und Praxis gehoeren zusammen." },
        { "native": "der Erfolg", "foreign": "success", "example": "I wish you much success!", "exampleDe": "Ich wuensche dir viel Erfolg!" },
        { "native": "der Abschluss", "foreign": "graduation/degree", "example": "After graduation I'll look for work.", "exampleDe": "Nach dem Abschluss suche ich Arbeit." },
        { "native": "das Diplom", "foreign": "diploma", "example": "I received my diploma.", "exampleDe": "Ich habe mein Diplom erhalten." },
        { "native": "der Bachelor", "foreign": "bachelor's degree", "example": "I'm doing my bachelor's.", "exampleDe": "Ich mache meinen Bachelor." },
        { "native": "der Master", "foreign": "master's degree", "example": "After that comes the master's.", "exampleDe": "Danach folgt der Master." },
        { "native": "die Doktorarbeit", "foreign": "doctoral thesis", "example": "She's writing her doctoral thesis.", "exampleDe": "Sie schreibt ihre Doktorarbeit." },
        { "native": "das Stipendium", "foreign": "scholarship", "example": "I got a scholarship.", "exampleDe": "Ich habe ein Stipendium bekommen." },
        { "native": "die Nachhilfe", "foreign": "tutoring", "example": "I tutor in math.", "exampleDe": "Ich gebe Nachhilfe in Mathe." },
        { "native": "der Austausch", "foreign": "exchange", "example": "I'm doing an exchange to Germany.", "exampleDe": "Ich mache einen Austausch nach Deutschland." },
        { "native": "die Pruefungsangst", "foreign": "exam anxiety", "example": "Exam anxiety is normal.", "exampleDe": "Pruefungsangst ist normal." }
      ]
    },
    {
      "name": "Freizeit & Hobbys",
      "words": [
        { "native": "die Freizeit", "foreign": "free time", "example": "What do you do in your free time?", "exampleDe": "Was machst du in deiner Freizeit?" },
        { "native": "das Hobby", "foreign": "hobby", "example": "My hobby is reading.", "exampleDe": "Mein Hobby ist Lesen." },
        { "native": "spielen", "foreign": "to play", "example": "Children like to play.", "exampleDe": "Kinder spielen gern." },
        { "native": "der Fussball", "foreign": "soccer/football", "example": "I like playing soccer.", "exampleDe": "Ich spiele gern Fussball." },
        { "native": "der Basketball", "foreign": "basketball", "example": "Basketball is exciting.", "exampleDe": "Basketball ist aufregend." },
        { "native": "der Tennis", "foreign": "tennis", "example": "Do you play tennis?", "exampleDe": "Spielst du Tennis?" },
        { "native": "das Schwimmen", "foreign": "swimming", "example": "Swimming is healthy.", "exampleDe": "Schwimmen ist gesund." },
        { "native": "das Schwimmbad", "foreign": "swimming pool", "example": "We go to the swimming pool.", "exampleDe": "Wir gehen ins Schwimmbad." },
        { "native": "das Laufen", "foreign": "running", "example": "I go running every morning.", "exampleDe": "Ich gehe jeden Morgen laufen." },
        { "native": "das Wandern", "foreign": "hiking", "example": "Hiking in the mountains is great.", "exampleDe": "Wandern in den Bergen ist toll." },
        { "native": "das Radfahren", "foreign": "cycling", "example": "Cycling is my favorite sport.", "exampleDe": "Radfahren ist mein Lieblingssport." },
        { "native": "der Ski", "foreign": "ski", "example": "In winter I ski.", "exampleDe": "Im Winter fahre ich Ski." },
        { "native": "der Snowboard", "foreign": "snowboard", "example": "Snowboarding is fun.", "exampleDe": "Snowboard macht Spass." },
        { "native": "das Fitnessstudio", "foreign": "gym", "example": "I go to the gym.", "exampleDe": "Ich gehe ins Fitnessstudio." },
        { "native": "das Training", "foreign": "training", "example": "My training is hard.", "exampleDe": "Mein Training ist hart." },
        { "native": "der Sport", "foreign": "sport", "example": "Sport keeps you fit.", "exampleDe": "Sport haelt fit." },
        { "native": "das Team", "foreign": "team", "example": "Our team won.", "exampleDe": "Unser Team hat gewonnen." },
        { "native": "das Spiel", "foreign": "game", "example": "The game was exciting.", "exampleDe": "Das Spiel war spannend." },
        { "native": "gewinnen", "foreign": "to win", "example": "We want to win!", "exampleDe": "Wir wollen gewinnen!" },
        { "native": "verlieren", "foreign": "to lose", "example": "No one likes to lose.", "exampleDe": "Niemand verliert gern." },
        { "native": "die Musik", "foreign": "music", "example": "I like listening to music.", "exampleDe": "Ich hoere gern Musik." },
        { "native": "das Lied", "foreign": "song", "example": "This is my favorite song.", "exampleDe": "Das ist mein Lieblingslied." },
        { "native": "singen", "foreign": "to sing", "example": "She sings very beautifully.", "exampleDe": "Sie singt sehr schoen." },
        { "native": "tanzen", "foreign": "to dance", "example": "We dance all night.", "exampleDe": "Wir tanzen die ganze Nacht." },
        { "native": "die Gitarre", "foreign": "guitar", "example": "I play guitar.", "exampleDe": "Ich spiele Gitarre." },
        { "native": "das Klavier", "foreign": "piano", "example": "She practices piano.", "exampleDe": "Sie uebt Klavier." },
        { "native": "die Violine", "foreign": "violin", "example": "The violin sounds beautiful.", "exampleDe": "Die Violine klingt wunderschoen." },
        { "native": "die Trompete", "foreign": "trumpet", "example": "He plays trumpet in the orchestra.", "exampleDe": "Er spielt Trompete im Orchester." },
        { "native": "das Schlagzeug", "foreign": "drums", "example": "Drums are loud but cool.", "exampleDe": "Schlagzeug ist laut aber cool." },
        { "native": "das Konzert", "foreign": "concert", "example": "We are going to a concert tonight.", "exampleDe": "Wir gehen heute Abend zum Konzert." },
        { "native": "das Kino", "foreign": "cinema", "example": "Shall we go to the cinema?", "exampleDe": "Gehen wir ins Kino?" },
        { "native": "der Film", "foreign": "film/movie", "example": "The film was good.", "exampleDe": "Der Film war gut." },
        { "native": "das Theater", "foreign": "theater", "example": "A new play is running at the theater.", "exampleDe": "Im Theater laeuft ein neues Stueck." },
        { "native": "das Museum", "foreign": "museum", "example": "The museum has interesting exhibitions.", "exampleDe": "Das Museum hat interessante Ausstellungen." },
        { "native": "die Galerie", "foreign": "gallery", "example": "The gallery displays modern art.", "exampleDe": "Die Galerie zeigt moderne Kunst." },
        { "native": "die Ausstellung", "foreign": "exhibition", "example": "The exhibition is free.", "exampleDe": "Die Ausstellung ist kostenlos." },
        { "native": "malen", "foreign": "to paint", "example": "I like painting landscapes.", "exampleDe": "Ich male gern Landschaften." },
        { "native": "zeichnen", "foreign": "to draw", "example": "Can you draw a house?", "exampleDe": "Kannst du ein Haus zeichnen?" },
        { "native": "das Bild", "foreign": "picture/painting", "example": "The picture is very beautiful.", "exampleDe": "Das Bild ist sehr schoen." },
        { "native": "fotografieren", "foreign": "to photograph", "example": "I like taking photos.", "exampleDe": "Ich fotografiere gern." },
        { "native": "die Kamera", "foreign": "camera", "example": "My camera is new.", "exampleDe": "Meine Kamera ist neu." },
        { "native": "das Foto", "foreign": "photo", "example": "Can you take a photo?", "exampleDe": "Kannst du ein Foto machen?" },
        { "native": "das Video", "foreign": "video", "example": "I watch videos online.", "exampleDe": "Ich schaue Videos online." },
        { "native": "kochen", "foreign": "to cook", "example": "I like cooking on weekends.", "exampleDe": "Am Wochenende koche ich gern." },
        { "native": "backen", "foreign": "to bake", "example": "I'm baking a cake.", "exampleDe": "Ich backe einen Kuchen." },
        { "native": "das Rezept", "foreign": "recipe", "example": "Do you have a good recipe?", "exampleDe": "Hast du ein gutes Rezept?" },
        { "native": "lesen", "foreign": "to read", "example": "I read every evening.", "exampleDe": "Ich lese jeden Abend." },
        { "native": "das Buch", "foreign": "book", "example": "This book is exciting.", "exampleDe": "Dieses Buch ist spannend." },
        { "native": "der Roman", "foreign": "novel", "example": "I am currently reading a novel.", "exampleDe": "Ich lese gerade einen Roman." },
        { "native": "die Zeitschrift", "foreign": "magazine", "example": "I'm reading a fashion magazine.", "exampleDe": "Ich lese eine Modezeitschrift." },
        { "native": "die Zeitung", "foreign": "newspaper", "example": "I read the newspaper in the morning.", "exampleDe": "Ich lese die Zeitung am Morgen." },
        { "native": "schreiben", "foreign": "to write", "example": "I like writing stories.", "exampleDe": "Ich schreibe gern Geschichten." },
        { "native": "das Gedicht", "foreign": "poem", "example": "He writes beautiful poems.", "exampleDe": "Er schreibt schoene Gedichte." },
        { "native": "die Geschichte", "foreign": "story", "example": "This story is interesting.", "exampleDe": "Diese Geschichte ist interessant." },
        { "native": "das Videospiel", "foreign": "video game", "example": "Do you play video games?", "exampleDe": "Spielst du Videospiele?" },
        { "native": "das Brettspiel", "foreign": "board game", "example": "Let's play a board game!", "exampleDe": "Lass uns ein Brettspiel spielen!" },
        { "native": "das Kartenspiel", "foreign": "card game", "example": "Poker is a card game.", "exampleDe": "Poker ist ein Kartenspiel." },
        { "native": "das Raetsel", "foreign": "puzzle", "example": "I like solving puzzles.", "exampleDe": "Ich loese gern Raetsel." },
        { "native": "das Schach", "foreign": "chess", "example": "Chess requires strategy.", "exampleDe": "Schach erfordert Strategie." },
        { "native": "sammeln", "foreign": "to collect", "example": "I collect stamps.", "exampleDe": "Ich sammle Briefmarken." },
        { "native": "die Sammlung", "foreign": "collection", "example": "My collection is large.", "exampleDe": "Meine Sammlung ist gross." },
        { "native": "der Garten", "foreign": "garden", "example": "I enjoy gardening.", "exampleDe": "Ich arbeite gern im Garten." },
        { "native": "die Pflanze", "foreign": "plant", "example": "I water my plants.", "exampleDe": "Ich giesse meine Pflanzen." },
        { "native": "die Blume", "foreign": "flower", "example": "The flowers are beautiful.", "exampleDe": "Die Blumen sind schoen." },
        { "native": "der Baum", "foreign": "tree", "example": "The tree is very old.", "exampleDe": "Der Baum ist sehr alt." },
        { "native": "die Natur", "foreign": "nature", "example": "I love nature.", "exampleDe": "Ich liebe die Natur." },
        { "native": "der Wald", "foreign": "forest", "example": "We walk in the forest.", "exampleDe": "Wir spazieren im Wald." },
        { "native": "der Berg", "foreign": "mountain", "example": "The mountains are beautiful.", "exampleDe": "Die Berge sind wunderschoen." },
        { "native": "das Meer", "foreign": "sea/ocean", "example": "In summer we drive to the sea.", "exampleDe": "Im Sommer fahren wir ans Meer." },
        { "native": "der Strand", "foreign": "beach", "example": "The beach is clean.", "exampleDe": "Der Strand ist sauber." },
        { "native": "der See", "foreign": "lake", "example": "We swim in the lake.", "exampleDe": "Wir schwimmen im See." },
        { "native": "der Fluss", "foreign": "river", "example": "The river flows slowly.", "exampleDe": "Der Fluss fliesst langsam." },
        { "native": "der Park", "foreign": "park", "example": "We meet in the park.", "exampleDe": "Wir treffen uns im Park." },
        { "native": "spazieren gehen", "foreign": "to go for a walk", "example": "On Sunday we go for a walk.", "exampleDe": "Am Sonntag gehen wir spazieren." },
        { "native": "picknicken", "foreign": "to have a picnic", "example": "Let's have a picnic in the park.", "exampleDe": "Lass uns im Park picknicken." },
        { "native": "campen", "foreign": "to camp", "example": "We camp on the weekend.", "exampleDe": "Wir campen am Wochenende." },
        { "native": "das Zelt", "foreign": "tent", "example": "We sleep in the tent.", "exampleDe": "Wir schlafen im Zelt." },
        { "native": "angeln", "foreign": "to fish", "example": "My father likes to fish.", "exampleDe": "Mein Vater geht gern angeln." },
        { "native": "das Tier", "foreign": "animal", "example": "I like animals very much.", "exampleDe": "Ich mag Tiere sehr." },
        { "native": "der Hund", "foreign": "dog", "example": "My dog is named Max.", "exampleDe": "Mein Hund heisst Max." },
        { "native": "die Katze", "foreign": "cat", "example": "The cat sleeps a lot.", "exampleDe": "Die Katze schlaeft viel." },
        { "native": "der Vogel", "foreign": "bird", "example": "The bird sings in the morning.", "exampleDe": "Der Vogel singt am Morgen." },
        { "native": "das Haustier", "foreign": "pet", "example": "Do you have a pet?", "exampleDe": "Hast du ein Haustier?" },
        { "native": "die Party", "foreign": "party", "example": "There is a party on Saturday.", "exampleDe": "Am Samstag gibt es eine Party." },
        { "native": "feiern", "foreign": "to celebrate", "example": "We celebrate his birthday.", "exampleDe": "Wir feiern seinen Geburtstag." },
        { "native": "der Geburtstag", "foreign": "birthday", "example": "Happy birthday!", "exampleDe": "Alles Gute zum Geburtstag!" },
        { "native": "das Geschenk", "foreign": "gift/present", "example": "I have a gift for you.", "exampleDe": "Ich habe ein Geschenk fuer dich." },
        { "native": "der Freund", "foreign": "friend (male)", "example": "He is my best friend.", "exampleDe": "Er ist mein bester Freund." },
        { "native": "die Freundin", "foreign": "friend (female)", "example": "She is my best friend.", "exampleDe": "Sie ist meine beste Freundin." },
        { "native": "treffen", "foreign": "to meet", "example": "We meet at eight.", "exampleDe": "Wir treffen uns um acht." },
        { "native": "unterhalten", "foreign": "to chat/converse", "example": "We chat for hours.", "exampleDe": "Wir unterhalten uns stundenlang." },
        { "native": "die Unterhaltung", "foreign": "entertainment/conversation", "example": "That was a good conversation.", "exampleDe": "Das war eine gute Unterhaltung." },
        { "native": "entspannen", "foreign": "to relax", "example": "I relax on the weekend.", "exampleDe": "Am Wochenende entspanne ich." },
        { "native": "schlafen", "foreign": "to sleep", "example": "I sleep at least eight hours.", "exampleDe": "Ich schlafe mindestens acht Stunden." },
        { "native": "traeumen", "foreign": "to dream", "example": "I dream of a trip.", "exampleDe": "Ich traeume von einer Reise." },
        { "native": "geniessen", "foreign": "to enjoy", "example": "Enjoy the day!", "exampleDe": "Geniess den Tag!" },
        { "native": "Spass haben", "foreign": "to have fun", "example": "We have a lot of fun together.", "exampleDe": "Wir haben viel Spass zusammen." },
        { "native": "langweilig", "foreign": "boring", "example": "The game was boring.", "exampleDe": "Das Spiel war langweilig." },
        { "native": "interessant", "foreign": "interesting", "example": "The book is very interesting.", "exampleDe": "Das Buch ist sehr interessant." },
        { "native": "spannend", "foreign": "exciting", "example": "The film was exciting.", "exampleDe": "Der Film war spannend." }
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
      // Use embedded PRESET_VOCABULARY directly to avoid fetch issues/delays
      // and ensure we use the updated English examples
      const vocabData = PRESET_VOCABULARY;
      console.log('Using embedded vocabulary data for seeding');

      // Save vocabulary to IndexedDB
      for (const category of vocabData.categories) {
        for (const word of category.words) {
          const vocab = {
            native: word.native,
            foreign: word.foreign,
            example: word.example || '',
            exampleDe: word.exampleDe || '',
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

  // Update existing vocabulary definitions (e.g. new examples) without losing progress
  async forceUpdateVocabulary() {
    try {
      console.log('Checking for vocabulary updates...');
      const vocabData = PRESET_VOCABULARY;
      let updateCount = 0;

      for (const category of vocabData.categories) {
        for (const word of category.words) {
          // Find existing word by native term
          const existing = state.vocabulary.find(v => v.native === word.native);

          if (existing) {
            // Check if needs update (example or exampleDe changed)
            if (existing.example !== word.example || existing.exampleDe !== word.exampleDe) {
              existing.example = word.example || '';
              existing.exampleDe = word.exampleDe || '';
              // Also update foreign if changed, just in case
              existing.foreign = word.foreign;

              await DataManager.saveVocab(existing);
              updateCount++;
            }
          }
        }
      }

      if (updateCount > 0) {
        console.log(`Updated ${updateCount} vocabulary definitions`);
        Toast.show(`${updateCount} Vokabeln aktualisiert`, 'success');
      }
    } catch (error) {
      console.error('Error updating vocabulary:', error);
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
    const isDeEn = state.settings.practiceDirection === 'de-en';

    // Determine which example to show based on the ANSWER language
    // If answering in English (isDeEn=true), show English example
    // If answering in German (isDeEn=false), show German example
    const mainExample = isDeEn ? card.example : card.exampleDe;
    const translationExample = isDeEn ? card.exampleDe : card.example;

    const highlightWord = (text, word) => {
      if (!text || !word) return this.escapeHtml(text || '');
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
      const regex = new RegExp(`(${escapedWord})`, 'gi');
      return this.escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
    };

    const mainExampleHtml = mainExample ? highlightWord(mainExample, qa.answer) : '';
    const translationExampleHtml = translationExample ? highlightWord(translationExample, qa.question) : '';

    const exampleHtml = mainExample ? `
      <div class="flashcard-example-label">Beispiel</div>
      <div class="flashcard-example">${mainExampleHtml}</div>
      ${translationExample ? `<div class="flashcard-example-translation">${translationExampleHtml}</div>` : ''}
    ` : '';

    // Fallback: If no dedicated example exists for the target language but another one exists, show that instead
    const finalExampleHtml = !mainExample && translationExample ? `
       <div class="flashcard-example-label">Beispiel</div>
       <div class="flashcard-example">${translationExampleHtml}</div>
    ` : exampleHtml;

    container.innerHTML = `
      <div class="flashcard-container">
        <div class="flashcard" id="flashcard" onclick="LearnView.flipCard()" role="button" tabindex="0" aria-label="Karte umdrehen">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-word">${this.escapeHtml(qa.question)}</div>
            ${state.settings.showHints && card.category ? `<div class="flashcard-hint">${this.escapeHtml(card.category)}</div>` : ''}
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-answer-label">Antwort</div>
            <div class="flashcard-word">${this.escapeHtml(qa.answer)}</div>
            ${finalExampleHtml}
          </div>
        </div>
      </div>
      <p class="text-center text-muted mb-md">Tippe auf die Karte zum Umdrehen</p>
      <div class="understood-btn-wrapper" id="flashcard-actions" style="display: none;">
        <button class="understood-btn" onclick="LearnView.answer(true)" aria-label="Verstanden">
          <p class="understood-btn__text">
            <span style="--index: 0;">V</span>
            <span style="--index: 1;">E</span>
            <span style="--index: 2;">R</span>
            <span style="--index: 3;">S</span>
            <span style="--index: 4;">T</span>
            <span style="--index: 5;">A</span>
            <span style="--index: 6;">N</span>
            <span style="--index: 7;">D</span>
            <span style="--index: 8;">E</span>
            <span style="--index: 9;">N</span>
            <span style="--index: 10;"> </span>
            <span style="--index: 11;">•</span>
            <span style="--index: 12;"> </span>
            <span style="--index: 13;">W</span>
            <span style="--index: 14;">E</span>
            <span style="--index: 15;">I</span>
            <span style="--index: 16;">T</span>
            <span style="--index: 17;">E</span>
            <span style="--index: 18;">R</span>
            <span style="--index: 19;"> </span>
          </p>
          <div class="understood-btn__circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20" class="understood-btn__icon">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20" class="understood-btn__icon understood-btn__icon--copy">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
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

      <div class="settings-section" id="settings-install-section" style="${deferredPrompt ? '' : 'display: none;'}">
        <h3>App</h3>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">App installieren</div>
            <div class="settings-item-desc">Auf dem Startbildschirm hinzufügen</div>
          </div>
          <button class="btn btn-primary" onclick="SettingsView.triggerInstall()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Installieren
          </button>
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
  },

  async triggerInstall() {
    if (!deferredPrompt) {
      Toast.show('Installation nicht verfügbar', 'error');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      Toast.show('App wird installiert!', 'success');
    }

    deferredPrompt = null;
    const section = document.getElementById('settings-install-section');
    if (section) section.style.display = 'none';
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
    // Also show settings install section if visible
    const settingsSection = document.getElementById('settings-install-section');
    if (settingsSection) settingsSection.style.display = '';
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
    // Also hide settings install section
    const settingsSection = document.getElementById('settings-install-section');
    if (settingsSection) settingsSection.style.display = 'none';
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
    console.warn('Service Worker übersprungen (file:// Protokoll)');
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
    // UI Komponenten initialisieren
    Toast.init();
    Modal.init();
    Views.init();

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
    } else {
      // If not seeded (already exists), check for updates to definitions
      await DataManager.forceUpdateVocabulary();
    }

    // Theme anwenden
    applyTheme(state.settings.theme);

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
