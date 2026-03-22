/**
 * Vokabel Master+ - Vokabeltrainer PWA
 * Mobile-First, Offline-First, Keine externen Abhängigkeiten
 */

// ============================================
// KONSTANTEN & KONFIGURATION
// ============================================

// PWA Install Prompt (moved to top so it's available everywhere)
let deferredPrompt = null;

// Shared utility functions
const Utils = {
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  escapeAttr(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/`/g, '\\`');
  }
};

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
  DAILY_GOAL: 50, // Number of correct answers to reach daily goal
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
        { "native": "die Sammlung", "foreign": "collection", "example": "Meine Sammlung ist gross.", "exampleDe": "Meine Sammlung ist gross." },
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
        { "native": "der Fluss", "foreign": "river", "example": "Der Fluss fliesst langsam.", "exampleDe": "Der Fluss fliesst langsam." },
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
    },
    {
      "name": "Essen & Trinken",
      "words": [
        { "native": "der Apfel", "foreign": "apple", "example": "The apple is red and sweet.", "exampleDe": "Der Apfel ist rot und süß." },
        { "native": "die Banane", "foreign": "banana", "example": "Monkeys like to eat banana.", "exampleDe": "Affen essen gerne Bananen." },
        { "native": "das Brot", "foreign": "bread", "example": "I buy fresh bread at the bakery.", "exampleDe": "Ich kaufe frisches Brot in der Bäckerei." },
        { "native": "die Butter", "foreign": "butter", "example": "Put some butter on the toast.", "exampleDe": "Streich etwas Butter auf den Toast." },
        { "native": "der Käse", "foreign": "cheese", "example": "I like cheese on my pizza.", "exampleDe": "Ich mag Käse auf meiner Pizza." },
        { "native": "die Milch", "foreign": "milk", "example": "I drink a glass of milk.", "exampleDe": "Ich trinke ein Glas Milch." },
        { "native": "das Wasser", "foreign": "water", "example": "Drink enough water every day.", "exampleDe": "Trink jeden Tag genug Wasser." },
        { "native": "der Kaffee", "foreign": "coffee", "example": "I need a coffee in the morning.", "exampleDe": "Ich brauche morgens einen Kaffee." },
        { "native": "der Tee", "foreign": "tea", "example": "Green tea is very healthy.", "exampleDe": "Grüner Tee ist sehr gesund." },
        { "native": "der Zucker", "foreign": "sugar", "example": "Do you want sugar in your tea?", "exampleDe": "Möchtest du Zucker in deinen Tee?" },
        { "native": "das Salz", "foreign": "salt", "example": "The soup needs more salt.", "exampleDe": "Die Suppe braucht mehr Salz." },
        { "native": "das Fleisch", "foreign": "meat", "example": "He doesn't eat meat.", "exampleDe": "Er isst kein Fleisch." },
        { "native": "der Fisch", "foreign": "fish", "example": "The fish is swimming in the sea.", "exampleDe": "Der Fisch schwimmt im Meer." },
        { "native": "das Ei", "foreign": "egg", "example": "I eat an egg for breakfast.", "exampleDe": "Ich esse ein Ei zum Frühstück." },
        { "native": "das Gemüse", "foreign": "vegetables", "example": "Vegetables are good for you.", "exampleDe": "Gemüse ist gut für dich." },
        { "native": "das Obst", "foreign": "fruit", "example": "Fruit contains many vitamins.", "exampleDe": "Obst enthält viele Vitamine." },
        { "native": "die Kartoffel", "foreign": "potato", "example": "I like mashed potato.", "exampleDe": "Ich mag Kartoffelpüree." },
        { "native": "der Reis", "foreign": "rice", "example": "Rice is a staple food.", "exampleDe": "Reis ist ein Grundnahrungsmittel." },
        { "native": "die Nudeln", "foreign": "pasta", "example": "I'm cooking pasta for dinner.", "exampleDe": "Ich koche heute Abend Nudeln." },
        { "native": "die Tomate", "foreign": "tomato", "example": "The tomato is ripe and red.", "exampleDe": "Die Tomate ist reif und rot." },
        { "native": "die Gurke", "foreign": "cucumber", "example": "A cucumber is mostly water.", "exampleDe": "Eine Gurke besteht fast nur aus Wasser." },
        { "native": "der Salat", "foreign": "salad", "example": "I'll have a small salad.", "exampleDe": "Ich nehme einen kleinen Salat." },
        { "native": "die Zwiebel", "foreign": "onion", "example": "Onions make me cry.", "exampleDe": "Zwiebeln bringen mich zum Weinen." },
        { "native": "der Knoblauch", "foreign": "garlic", "example": "Garlic smells very strong.", "exampleDe": "Knoblauch riecht sehr stark." },
        { "native": "das Öl", "foreign": "oil", "example": "Use olive oil for the salad.", "exampleDe": "Benutz Olivenöl für den Salat." },
        { "native": "der Essig", "foreign": "vinegar", "example": "Vinegar tastes very sour.", "exampleDe": "Essig schmeckt sehr sauer." },
        { "native": "der Pfeffer", "foreign": "pepper", "example": "Add a bit of pepper.", "exampleDe": "Füg etwas Pfeffer hinzu." },
        { "native": "das Mehl", "foreign": "flour", "example": "We need flour to bake a cake.", "exampleDe": "Wir brauchen Mehl, um einen Kuchen zu backen." },
        { "native": "der Honig", "foreign": "honey", "example": "Bees make honey.", "exampleDe": "Bienen machen Honig." },
        { "native": "die Marmelade", "foreign": "jam", "example": "I like strawberry jam.", "exampleDe": "Ich mag Erdbeermarmelade." },
        { "native": "der Joghurt", "foreign": "yogurt", "example": "Eat some yogurt with muesli.", "exampleDe": "Iss etwas Joghurt mit Müsli." },
        { "native": "die Sahne", "foreign": "cream", "example": "Shall I add cream to the coffee?", "exampleDe": "Soll ich Sahne in den Kaffee geben?" },
        { "native": "die Schokolade", "foreign": "chocolate", "example": "Dark chocolate is my favorite.", "exampleDe": "Zartbitterschokolade ist mein Favorit." },
        { "native": "der Keks", "foreign": "cookie", "example": "Have a cookie with your milk.", "exampleDe": "Nimm einen Keks zu deiner Milch." },
        { "native": "der Kuchen", "foreign": "cake", "example": "The birthday cake is delicious.", "exampleDe": "Der Geburtstagskuchen ist köstlich." },
        { "native": "das Eis", "foreign": "ice cream", "example": "I want two scoops of vanilla ice cream.", "exampleDe": "Ich möchte zwei Kugeln Vanilleeis." },
        { "native": "der Saft", "foreign": "juice", "example": "Orange juice has vitamin C.", "exampleDe": "Orangensaft hat Vitamin C." },
        { "native": "das Bier", "foreign": "beer", "example": "Germany is famous for its beer.", "exampleDe": "Deutschland ist berühmt für sein Bier." },
        { "native": "der Wein", "foreign": "wine", "example": "Red wine goes well with meat.", "exampleDe": "Rotwein passt gut zu Fleisch." },
        { "native": "die Suppe", "foreign": "soup", "example": "The soup is very hot.", "exampleDe": "Die Suppe ist sehr heiß." },
        { "native": "die Wurst", "foreign": "sausage", "example": "The sausage is a German specialty.", "exampleDe": "Die Wurst ist eine deutsche Spezialität." },
        { "native": "der Schinken", "foreign": "ham", "example": "He put ham on his sandwich.", "exampleDe": "Er legte Schinken auf sein Sandwich." },
        { "native": "das Hähnchen", "foreign": "chicken", "example": "Roast chicken for Sunday lunch.", "exampleDe": "Gebratenes Hähnchen zum Sonntagsessen." },
        { "native": "das Rindfleisch", "foreign": "beef", "example": "Beef is very protein-rich.", "exampleDe": "Rindfleisch ist sehr proteinreich." },
        { "native": "das Schweinefleisch", "foreign": "pork", "example": "Many people enjoy pork.", "exampleDe": "Viele Menschen genießen Schweinefleisch." },
        { "native": "die Erdbeere", "foreign": "strawberry", "example": "A strawberry is sweet and red.", "exampleDe": "Eine Erdbeere ist süß und rot." },
        { "native": "die Kirsche", "foreign": "cherry", "example": "Don't swallow the cherry pit.", "exampleDe": "Schluck den Kirschkern nicht runter." },
        { "native": "die Traube", "foreign": "grape", "example": "A grape is used to make wine.", "exampleDe": "Eine Traube wird zur Weinherstellung verwendet." },
        { "native": "die Zitrone", "foreign": "lemon", "example": "A lemon is very sour.", "exampleDe": "Eine Zitrone ist sehr sauer." },
        { "native": "die Orange", "foreign": "orange", "example": "Peel the orange carefully.", "exampleDe": "Schäl die Orange vorsichtig." },
        { "native": "der Pfirsich", "foreign": "peach", "example": "A peach is soft and fuzzy.", "exampleDe": "Ein Pfirsich ist weich und flauschig." },
        { "native": "die Birne", "foreign": "pear", "example": "The pear is very juicy.", "exampleDe": "Die Birne ist sehr saftig." },
        { "native": "die Pflaume", "foreign": "plum", "example": "Plums are blue or purple.", "exampleDe": "Pflaumen sind blau oder lila." },
        { "native": "die Karotte", "foreign": "carrot", "example": "Carrots are good for the eyes.", "exampleDe": "Karotten sind gut für die Augen." },
        { "native": "der Brokkoli", "foreign": "broccoli", "example": "Children often dislike broccoli.", "exampleDe": "Kinder mögen oft keinen Brokkoli." },
        { "native": "der Pilz", "foreign": "mushroom", "example": "Be careful with wild mushroom.", "exampleDe": "Sei vorsichtig mit wilden Pilzen." },
        { "native": "die Paprika", "foreign": "bell pepper", "example": "Red bell pepper is the sweetest.", "exampleDe": "Rote Paprika ist am süßesten." },
        { "native": "der Spinat", "foreign": "spinach", "example": "Spinach makes you strong.", "exampleDe": "Spinat macht dich stark." },
        { "native": "die Bohne", "foreign": "bean", "example": "Green bean are healthy.", "exampleDe": "Grüne Bohnen sind gesund." },
        { "native": "die Erbse", "foreign": "pea", "example": "A pea is small and round.", "exampleDe": "Eine Erbse ist klein und rund." },
        { "native": "der Mais", "foreign": "corn", "example": "Popcorn is made from corn.", "exampleDe": "Popcorn wird aus Mais gemacht." },
        { "native": "der Reis", "foreign": "rice", "example": "We eat rice with the curry.", "exampleDe": "Wir essen Reis zum Curry." },
        { "native": "die Pizza", "foreign": "pizza", "example": "Everyone loves a good pizza.", "exampleDe": "Jeder liebt eine gute Pizza." },
        { "native": "der Burger", "foreign": "burger", "example": "A burger with fries, please.", "exampleDe": "Ein Burger mit Pommes, bitte." },
        { "native": "die Pommes", "foreign": "fries", "example": "Fries are salty and crispy.", "exampleDe": "Pommes sind salzig und knusprig." },
        { "native": "das Sandwich", "foreign": "sandwich", "example": "Pack a sandwich for school.", "exampleDe": "Pack ein Sandwich für die Schule ein." },
        { "native": "das Frühstück", "foreign": "breakfast", "example": "Don't skip breakfast.", "exampleDe": "Lass das Frühstück nicht aus." },
        { "native": "das Mittagessen", "foreign": "lunch", "example": "What's for lunch today?", "exampleDe": "Was gibt es heute zu Mittag?" },
        { "native": "das Abendessen", "foreign": "dinner", "example": "Dinner is served at seven.", "exampleDe": "Das Abendessen wird um sieben serviert." },
        { "native": "der Snack", "foreign": "snack", "example": "I need a healthy snack.", "exampleDe": "Ich brauche einen gesunden Snack." },
        { "native": "der Durst", "foreign": "thirst", "example": "I'm dying of thirst.", "exampleDe": "Ich sterbe vor Durst." },
        { "native": "der Hunger", "foreign": "hunger", "example": "Hunger is the best cook.", "exampleDe": "Hunger ist der beste Koch." },
        { "native": "satt", "foreign": "full/satisfied", "example": "I'm full, thank you.", "exampleDe": "Ich bin satt, danke." },
        { "native": "lecker", "foreign": "delicious", "example": "The meal was delicious.", "exampleDe": "Das Essen war lecker." },
        { "native": "süß", "foreign": "sweet", "example": "Candy is very sweet.", "exampleDe": "Süßigkeiten sind sehr süß." },
        { "native": "sauer", "foreign": "sour", "example": "Vinegar is sour.", "exampleDe": "Essig ist sauer." },
        { "native": "salzig", "foreign": "salty", "example": "The popcorn is too salty.", "exampleDe": "Das Popcorn ist zu salzig." },
        { "native": "bitter", "foreign": "bitter", "example": "Black coffee is bitter.", "exampleDe": "Schwarzer Kaffee ist bitter." },
        { "native": "scharf", "foreign": "spicy/hot", "example": "Chili is very spicy.", "exampleDe": "Chili ist sehr scharf." },
        { "native": "heiß", "foreign": "hot", "example": "The soup is very hot.", "exampleDe": "Die Suppe ist sehr heiß." },
        { "native": "kalt", "foreign": "cold", "example": "I want a cold drink.", "exampleDe": "Ich möchte ein kaltes Getränk." },
        { "native": "frisch", "foreign": "fresh", "example": "The vegetables are fresh.", "exampleDe": "Das Gemüse ist frisch." },
        { "native": "gekocht", "foreign": "cooked", "example": "I like cooked vegetables.", "exampleDe": "Ich mag gekochtes Gemüse." },
        { "native": "gebraten", "foreign": "fried/roasted", "example": "The potatoes are fried.", "exampleDe": "Die Kartoffeln sind gebraten." },
        { "native": "gegrillt", "foreign": "grilled", "example": "We love grilled meat.", "exampleDe": "Wir lieben gegrilltes Fleisch." },
        { "native": "backen", "foreign": "to bake", "example": "I'm going to bake a cake.", "exampleDe": "Ich werde einen Kuchen backen." },
        { "native": "kochen", "foreign": "to cook", "example": "Learn to cook well.", "exampleDe": "Lern gut zu kochen." },
        { "native": "braten", "foreign": "to fry", "example": "Fry the onion in the pan.", "exampleDe": "Brate die Zwiebel in der Pfanne." },
        { "native": "schälen", "foreign": "to peel", "example": "I have to peel the potatoes.", "exampleDe": "Ich muss die Kartoffeln schälen." },
        { "native": "schneiden", "foreign": "to cut", "example": "Cut the bread into slices.", "exampleDe": "Schneid das Brot in Scheiben." },
        { "native": "trinken", "foreign": "to drink", "example": "He wants to drink water.", "exampleDe": "Er möchte Wasser trinken." },
        { "native": "essen", "foreign": "to eat", "example": "Time to eat dinner.", "exampleDe": "Zeit zum Abendessen." },
        { "native": "schmecken", "foreign": "to taste", "example": "How does it taste?", "exampleDe": "Wie schmeckt es?" },
        { "native": "bestellen", "foreign": "to order", "example": "Let's order pizza.", "exampleDe": "Lass uns Pizza bestellen." },
        { "native": "bezahlen", "foreign": "to pay", "example": "Can we pay, please?", "exampleDe": "Können wir bitte bezahlen?" },
        { "native": "kaufen", "foreign": "to buy", "example": "I need to buy groceries.", "exampleDe": "Ich muss Lebensmittel kaufen." },
        { "native": "verkaufen", "foreign": "to sell", "example": "They sell fresh fruit.", "exampleDe": "Sie verkaufen frisches Obst." },
        { "native": "die Flasche", "foreign": "bottle", "example": "A bottle of wine, please.", "exampleDe": "Eine Flasche Wein, bitte." },
        { "native": "das Glas", "foreign": "glass", "example": "Can I have a glass of water?", "exampleDe": "Kann ich ein Glas Wasser haben?" },
        { "native": "die Tasse", "foreign": "cup", "example": "A cup of coffee, please.", "exampleDe": "Eine Tasse Kaffee, bitte." }
      ]
    },
    {
      "name": "Beruf & Arbeit",
      "words": [
        { "native": "die Arbeit", "foreign": "work", "example": "I enjoy my work.", "exampleDe": "Ich genieße meine Arbeit." },
        { "native": "der Beruf", "foreign": "profession/job", "example": "What is your profession?", "exampleDe": "Was ist dein Beruf?" },
        { "native": "der Job", "foreign": "job", "example": "I'm looking for a new job.", "exampleDe": "Ich suche einen neuen Job." },
        { "native": "die Stelle", "foreign": "position", "example": "I applied for the position.", "exampleDe": "Ich habe mich auf die Stelle beworben." },
        { "native": "der Arbeitgeber", "foreign": "employer", "example": "The employer provides benefits.", "exampleDe": "Der Arbeitgeber bietet Zusatzleistungen an." },
        { "native": "der Arbeitnehmer", "foreign": "employee", "example": "The employee is very efficient.", "exampleDe": "Der Arbeitnehmer ist sehr effizient." },
        { "native": "der Chef", "foreign": "boss", "example": "My boss is a fair leader.", "exampleDe": "Mein Chef ist eine faire Führungskraft." },
        { "native": "der Kollege", "foreign": "colleague", "example": "My colleague is very helpful.", "exampleDe": "Mein Kollege ist sehr hilfreich." },
        { "native": "das Büro", "foreign": "office", "example": "The office is in the city center.", "exampleDe": "Das Büro ist in der Stadtmitte." },
        { "native": "die Firma", "foreign": "company", "example": "The company produces software.", "exampleDe": "Die Firma stellt Software her." },
        { "native": "das Unternehmen", "foreign": "enterprise", "example": "A large enterprise.", "exampleDe": "Ein großes Unternehmen." },
        { "native": "die Abteilung", "foreign": "department", "example": "Which department do you work in?", "exampleDe": "In welcher Abteilung arbeitest du?" },
        { "native": "das Gehalt", "foreign": "salary", "example": "The salary is paid monthly.", "exampleDe": "Das Gehalt wird monatlich gezahlt." },
        { "native": "der Lohn", "foreign": "wage", "example": "Hourly wage is increases.", "exampleDe": "Der Stundenlohn wird erhöht." },
        { "native": "der Urlaub", "foreign": "vacation", "example": "I'm going on vacation.", "exampleDe": "Ich gehe in den Urlaub." },
        { "native": "die Pause", "foreign": "break", "example": "Take a short break.", "exampleDe": "Mach eine kurze Pause." },
        { "native": "die Besprechung", "foreign": "meeting", "example": "The meeting starts at ten.", "exampleDe": "Die Besprechung beginnt um zehn." },
        { "native": "der Termin", "foreign": "appointment", "example": "I have an appointment today.", "exampleDe": "Ich habe heute einen Termin." },
        { "native": "die Überstunden", "foreign": "overtime", "example": "I worked much overtime this week.", "exampleDe": "Ich habe diese Woche viele Überstunden gemacht." },
        { "native": "der Vertrag", "foreign": "contract", "example": "Sign the employment contract.", "exampleDe": "Unterschreib den Arbeitsvertrag." },
        { "native": "die Kündigung", "foreign": "resignation/termination", "example": "Handed in my resignation.", "exampleDe": "Kündigung eingereicht." },
        { "native": "die Bewerbung", "foreign": "application", "example": "Send your application by email.", "exampleDe": "Sende deine Bewerbung per E-Mail." },
        { "native": "der Lebenslauf", "foreign": "CV/Resume", "example": "Attach your resume.", "exampleDe": "Füg deinen Lebenslauf bei." },
        { "native": "das Vorstellungsgespräch", "foreign": "job interview", "example": "I have a job interview tomorrow.", "exampleDe": "Ich habe morgen ein Vorstellungsgespräch." },
        { "native": "die Ausbildung", "foreign": "training/apprenticeship", "example": "I'm doing an apprenticeship.", "exampleDe": "Ich mache eine Ausbildung." },
        { "native": "das Praktikum", "foreign": "internship", "example": "Doing a summer internship.", "exampleDe": "Mache ein Sommerpraktikum." },
        { "native": "der Praktikant", "foreign": "intern", "example": "The intern is learning fast.", "exampleDe": "Der Praktikant lernt schnell." },
        { "native": "die Erfahrung", "foreign": "experience", "example": "Work experience is important.", "exampleDe": "Arbeitserfahrung ist wichtig." },
        { "native": "die Qualifikation", "foreign": "qualification", "example": "What are your qualification?", "exampleDe": "Was sind deine Qualifikationen?" },
        { "native": "die Karriere", "foreign": "career", "example": "A successful career.", "exampleDe": "Eine erfolgreiche Karriere." },
        { "native": "der Erfolg", "foreign": "success", "example": "Hard work leads to success.", "exampleDe": "Harte Arbeit führt zum Erfolg." },
        { "native": "die Herausforderung", "foreign": "challenge", "example": "Face the new challenge.", "exampleDe": "Stell dich der neuen Herausforderung." },
        { "native": "die Verantwortung", "foreign": "responsibility", "example": "Take responsibility for your team.", "exampleDe": "Übernimm Verantwortung für dein Team." },
        { "native": "das Team", "foreign": "team", "example": "We work as a team.", "exampleDe": "Wir arbeiten als Team." },
        { "native": "die Zusammenarbeit", "foreign": "collaboration", "example": "Collaboration is key.", "exampleDe": "Zusammenarbeit ist der Schlüssel." },
        { "native": "das Projekt", "foreign": "project", "example": "Managing a big project.", "exampleDe": "Leite ein großes Projekt." },
        { "native": "die Deadline", "foreign": "deadline", "example": "The deadline is on Friday.", "exampleDe": "Die Deadline ist am Freitag." },
        { "native": "das Ziel", "foreign": "goal", "example": "Set achievable goals.", "exampleDe": "Setz dir erreichbare Ziele." },
        { "native": "die Strategie", "foreign": "strategy", "example": "Define a clear strategy.", "exampleDe": "Definiere eine klare Strategie." },
        { "native": "das Marketing", "foreign": "marketing", "example": "The marketing plan is ready.", "exampleDe": "Der Marketingplan steht." },
        { "native": "der Vertrieb", "foreign": "sales/distribution", "example": "Working in sales.", "exampleDe": "Arbeite im Vertrieb." },
        { "native": "der Kundenservice", "foreign": "customer service", "example": "Contact customer service.", "exampleDe": "Kontaktiere den Kundenservice." },
        { "native": "die Buchhaltung", "foreign": "accounting", "example": "Accounting department handles invoices.", "exampleDe": "Die Buchhaltung kümmert sich um Rechnungen." },
        { "native": "die IT-Abteilung", "foreign": "IT department", "example": "Ask the IT department for help.", "exampleDe": "Frag die IT-Abteilung um Hilfe." },
        { "native": "der Computer", "foreign": "computer", "example": "Power on your computer.", "exampleDe": "Schalt deinen Computer ein." },
        { "native": "das Internet", "foreign": "internet", "example": "Fast internet connection.", "exampleDe": "Schnelle Internetverbindung." },
        { "native": "die E-Mail", "foreign": "email", "example": "Send an email.", "exampleDe": "Schick eine E-Mail." },
        { "native": "das Telefonat", "foreign": "phone call", "example": "A short phone call.", "exampleDe": "Ein kurzes Telefonat." },
        { "native": "die Präsentation", "foreign": "presentation", "example": "Prepare the presentation.", "exampleDe": "Bereite die Präsentation vor." },
        { "native": "der Bericht", "foreign": "report", "example": "Write the monthly report.", "exampleDe": "Schreib den Monatsbericht." },
        { "native": "die Unterlagen", "foreign": "documents", "example": "Organize your documents.", "exampleDe": "Ordne deine Unterlagen." },
        { "native": "der Aktenkoffer", "foreign": "briefcase", "example": "Carry your documents in a briefcase.", "exampleDe": "Trag deine Unterlagen in einem Aktenkoffer." },
        { "native": "der Schreibtisch", "foreign": "desk", "example": "A tidy desk.", "exampleDe": "Ein aufgeräumter Schreibtisch." },
        { "native": "der Bürostuhl", "foreign": "office chair", "example": "An ergonomic office chair.", "exampleDe": "Ein ergonomischer Bürostuhl." },
        { "native": "der Drucker", "foreign": "printer", "example": "The printer is out of ink.", "exampleDe": "Dem Drucker fehlt Tinte." },
        { "native": "das Kopiergerät", "foreign": "photocopier", "example": "Copy the document.", "exampleDe": "Kopier das Dokument." },
        { "native": "die Software", "foreign": "software", "example": "Install new software.", "exampleDe": "Installiere neue Software." },
        { "native": "die Hardware", "foreign": "hardware", "example": "Upgrade the hardware.", "exampleDe": "Rüste die Hardware auf." },
        { "native": "die Programmierung", "foreign": "programming", "example": "Learning web programming.", "exampleDe": "Web-Programmierung lernen." },
        { "native": "die Webseite", "foreign": "website", "example": "Design a new website.", "exampleDe": "Gestalte eine neue Webseite." },
        { "native": "die Sicherheit", "foreign": "security", "example": "Workplace security is vital.", "exampleDe": "Arbeitsplatzsicherheit ist lebenswichtig." },
        { "native": "der Schutz", "foreign": "protection", "example": "Wear data protection.", "exampleDe": "Trag Datenschutz." },
        { "native": "das Gesetz", "foreign": "law", "example": "Follow the law.", "exampleDe": "Befolg das Gesetz." },
        { "native": "die Regel", "foreign": "rule", "example": "Follow company rule.", "exampleDe": "Befolg die Firmenregeln." },
        { "native": "der Arzt", "foreign": "doctor", "example": "The doctor is in his practice.", "exampleDe": "Der Arzt ist in seiner Praxis." },
        { "native": "der Ingenieur", "foreign": "engineer", "example": "The engineer designs bridges.", "exampleDe": "Der Ingenieur entwirft Brücken." },
        { "native": "der Anwalt", "foreign": "lawyer", "example": "The lawyer represents the client.", "exampleDe": "Der Anwalt vertritt den Klienten." },
        { "native": "der Lehrer", "foreign": "teacher", "example": "The teacher explains the topic.", "exampleDe": "Der Lehrer erklärt das Thema." },
        { "native": "der Polizist", "foreign": "police officer", "example": "The police officer helps people.", "exampleDe": "Der Polizist hilft Menschen." },
        { "native": "der Koch", "foreign": "cook/chef", "example": "The cook prepares the meal.", "exampleDe": "Der Koch bereitet das Essen zu." },
        { "native": "der Kellner", "foreign": "waiter", "example": "The waiter serves drinks.", "exampleDe": "Der Kellner serviert Getränke." },
        { "native": "der Verkäufer", "foreign": "salesperson", "example": "The salesperson advises customers.", "exampleDe": "Der Verkäufer berät Kunden." },
        { "native": "der Handwerker", "foreign": "craftsman", "example": "The craftsman repairs the roof.", "exampleDe": "Der Handwerker repariert das Dach." },
        { "native": "der Bäcker", "foreign": "baker", "example": "The baker bakes bread.", "exampleDe": "Der Bäcker bäckt Brot." },
        { "native": "der Friseur", "foreign": "hairdresser", "example": "The hairdresser cuts hair.", "exampleDe": "Der Friseur schneidet Haare." },
        { "native": "der Bauer", "foreign": "farmer", "example": "The farmer works on the field.", "exampleDe": "Der Bauer arbeitet auf dem Feld." },
        { "native": "der Gärtner", "foreign": "gardener", "example": "The gardener plants trees.", "exampleDe": "Der Gärtner pflanzt Bäume." },
        { "native": "der Fahrer", "foreign": "driver", "example": "The bus driver is careful.", "exampleDe": "Der Busfahrer ist vorsichtig." },
        { "native": "der Pilot", "foreign": "pilot", "example": "The pilot flies the aircraft.", "exampleDe": "Der Pilot fliegt das Flugzeug." },
        { "native": "die Krankenschwester", "foreign": "nurse", "example": "The nurse cares for patients.", "exampleDe": "Die Krankenschwester pflegt Patienten." },
        { "native": "der Apotheker", "foreign": "pharmacist", "example": "The pharmacist sells medicine.", "exampleDe": "Der Apotheker verkauft Medizin." },
        { "native": "die Sekretärin", "foreign": "secretary", "example": "The secretary organizes documents.", "exampleDe": "Die Sekretärin ordnet Unterlagen." },
        { "native": "der Buchhalter", "foreign": "accountant", "example": "The accountant checks balance sheet.", "exampleDe": "Der Buchhalter prüft die Bilanz." },
        { "native": "der Programmierer", "foreign": "programmer", "example": "The programmer writes code.", "exampleDe": "Der Programmierer schreibt Code." },
        { "native": "der Designer", "foreign": "designer", "example": "The designer creates a logo.", "exampleDe": "Der Designer erstellt ein Logo." },
        { "native": "der Journalist", "foreign": "journalist", "example": "The journalist writes articles.", "exampleDe": "Der Journalist schreibt Artikel." },
        { "native": "der Künstler", "foreign": "artist", "example": "The artist paints a picture.", "exampleDe": "Der Künstler malt ein Bild." },
        { "native": "der Musiker", "foreign": "musician", "example": "The musician plays the piano.", "exampleDe": "Der Musiker spielt Klavier." },
        { "native": "der Schauspieler", "foreign": "actor", "example": "The actor plays in a movie.", "exampleDe": "Der Schauspieler spielt in einem Film." },
        { "native": "der Sportler", "foreign": "athlete", "example": "The athlete trains daily.", "exampleDe": "Der Sportler trainiert täglich." },
        { "native": "beantragen", "foreign": "to apply for", "example": "Apply for a visa.", "exampleDe": "Beantrage ein Visum." },
        { "native": "überprüfen", "foreign": "to check/verify", "example": "Verify the information.", "exampleDe": "Überprüfe die Informationen." },
        { "native": "bestätigen", "foreign": "to confirm", "example": "Confirm the appointment.", "exampleDe": "Bestätige den Termin." },
        { "native": "informieren", "foreign": "to inform", "example": "Inform the team.", "exampleDe": "Informiere das Team." },
        { "native": "entscheiden", "foreign": "to decide", "example": "Decide quickly.", "exampleDe": "Entscheide dich schnell." },
        { "native": "planen", "foreign": "to plan", "example": "Plan your week.", "exampleDe": "Plan deine Woche." },
        { "native": "organisieren", "foreign": "to organize", "example": "Organize a meeting.", "exampleDe": "Organisiere eine Besprechung." },
        { "native": "entwickeln", "foreign": "to develop", "example": "Develop a new product.", "exampleDe": "Entwickle ein neues Produkt." },
        { "native": "verbessern", "foreign": "to improve", "example": "Improve your skills.", "exampleDe": "Verbessere deine Fähigkeiten." },
        { "native": "beenden", "foreign": "to finish/end", "example": "Finish the task.", "exampleDe": "Beende die Aufgabe." }
      ]
    },
    {
      "name": "Haus & Wohnen",
      "words": [
        { "native": "das Haus", "foreign": "house", "example": "The house is big.", "exampleDe": "Das Haus ist groß." },
        { "native": "die Wohnung", "foreign": "apartment", "example": "The apartment is cozy.", "exampleDe": "Die Wohnung ist gemütlich." },
        { "native": "das Zimmer", "foreign": "room", "example": "My room is tidy.", "exampleDe": "Mein Zimmer ist aufgeräumt." },
        { "native": "die Miete", "foreign": "rent", "example": "The rent is expensive.", "exampleDe": "Die Miete ist teuer." },
        { "native": "der Umzug", "foreign": "move", "example": "The move was exhausting.", "exampleDe": "Der Umzug war anstrengend." },
        { "native": "die Nachbarn", "foreign": "neighbors", "example": "Our neighbors are friendly.", "exampleDe": "Unsere Nachbarn sind freundlich." },
        { "native": "die Küche", "foreign": "kitchen", "example": "The kitchen is modern.", "exampleDe": "Die Küche ist modern." },
        { "native": "das Badezimmer", "foreign": "bathroom", "example": "The bathroom is clean.", "exampleDe": "Das Badezimmer ist sauber." },
        { "native": "das Wohnzimmer", "foreign": "living room", "example": "The living room is bright.", "exampleDe": "Das Wohnzimmer ist hell." },
        { "native": "das Schlafzimmer", "foreign": "bedroom", "example": "The bedroom is quiet.", "exampleDe": "Das Schlafzimmer ist ruhig." },
        { "native": "der Flur", "foreign": "hallway", "example": "The hallway is narrow.", "exampleDe": "Der Flur ist schmal." },
        { "native": "der Keller", "foreign": "cellar/basement", "example": "The cellar is dark.", "exampleDe": "Der Keller ist dunkel." },
        { "native": "der Dachboden", "foreign": "attic", "example": "The attic is dusty.", "exampleDe": "Der Dachboden ist staubig." },
        { "native": "der Balkon", "foreign": "balcony", "example": "The balcony has flowers.", "exampleDe": "Der Balkon hat Blumen." },
        { "native": "die Terrasse", "foreign": "terrace", "example": "The terrace is large.", "exampleDe": "Die Terrasse ist groß." },
        { "native": "der Garten", "foreign": "garden", "example": "The garden is green.", "exampleDe": "Der Garten ist grün." },
        { "native": "die Garage", "foreign": "garage", "example": "The garage is full.", "exampleDe": "Die Garage ist voll." },
        { "native": "das Fenster", "foreign": "window", "example": "Open the window.", "exampleDe": "Öffne das Fenster." },
        { "native": "die Tür", "foreign": "door", "example": "Close the door.", "exampleDe": "Schließ die Tür." },
        { "native": "die Wand", "foreign": "wall", "example": "The wall is white.", "exampleDe": "Die Wand ist weiß." },
        { "native": "der Boden", "foreign": "floor", "example": "The floor is wooden.", "exampleDe": "Der Boden ist aus Holz." },
        { "native": "die Decke", "foreign": "ceiling", "example": "The ceiling is high.", "exampleDe": "Die Decke ist hoch." },
        { "native": "die Treppe", "foreign": "stairs", "example": "Walk up the stairs.", "exampleDe": "Geh die Treppe hoch." },
        { "native": "der Aufzug", "foreign": "elevator", "example": "Take the elevator.", "exampleDe": "Nimm den Aufzug." },
        { "native": "das Möbelstueck", "foreign": "piece of furniture", "example": "A new piece of furniture.", "exampleDe": "Ein neues Möbelstück." },
        { "native": "der Tisch", "foreign": "table", "example": "The table is round.", "exampleDe": "Der Tisch ist rund." },
        { "native": "der Stuhl", "foreign": "chair", "example": "The chair is comfortable.", "exampleDe": "Der Stuhl ist bequem." },
        { "native": "das Sofa", "foreign": "sofa/couch", "example": "The sofa is soft.", "exampleDe": "Das Sofa ist weich." },
        { "native": "der Sessel", "foreign": "armchair", "example": "Sit in the armchair.", "exampleDe": "Setz dich in den Sessel." },
        { "native": "das Bett", "foreign": "bed", "example": "The bed is cozy.", "exampleDe": "Das Bett ist gemütlich." },
        { "native": "der Schrank", "foreign": "closet/cupboard", "example": "The closet is full.", "exampleDe": "Der Schrank ist voll." },
        { "native": "das Regal", "foreign": "shelf", "example": "The shelf is wooden.", "exampleDe": "Das Regal ist aus Holz." },
        { "native": "die Kommode", "foreign": "dresser", "example": "The dresser is old.", "exampleDe": "Die Kommode ist alt." },
        { "native": "der Spiegel", "foreign": "mirror", "example": "Look in the mirror.", "exampleDe": "Schau in den Spiegel." },
        { "native": "die Lampe", "foreign": "lamp", "example": "The lamp is bright.", "exampleDe": "Die Lampe ist hell." },
        { "native": "das Licht", "foreign": "light", "example": "Turn on the light.", "exampleDe": "Schalt das Licht ein." },
        { "native": "der Vorhang", "foreign": "curtain", "example": "Close the curtain.", "exampleDe": "Zieh den Vorhang zu." },
        { "native": "der Teppich", "foreign": "carpet", "example": "The carpet is soft.", "exampleDe": "Der Teppich ist weich." },
        { "native": "das Bild", "foreign": "picture", "example": "Hang the picture.", "exampleDe": "Häng das Bild auf." },
        { "native": "die Uhr", "foreign": "clock", "example": "The clock is ticking.", "exampleDe": "Die Uhr tickt." },
        { "native": "das Kissen", "foreign": "pillow", "example": "The pillow is soft.", "exampleDe": "Das Kissen ist weich." },
        { "native": "die Decke", "foreign": "blanket", "example": "The blanket is warm.", "exampleDe": "Die Decke ist warm." },
        { "native": "die Bettwäsche", "foreign": "bedding", "example": "Change the bedding.", "exampleDe": "Wechsel die Bettwäsche." },
        { "native": "die Matratze", "foreign": "mattress", "example": "The mattress is hard.", "exampleDe": "Die Matratze ist hart." },
        { "native": "das Waschbecken", "foreign": "sink", "example": "Wash your hands in the sink.", "exampleDe": "Wasch deine Hände im Waschbecken." },
        { "native": "die Toilette", "foreign": "toilet", "example": "The toilet is clean.", "exampleDe": "Die Toilette ist sauber." },
        { "native": "die Dusche", "foreign": "shower", "example": "Take a shower.", "exampleDe": "Nimm eine Dusche." },
        { "native": "die Badewanne", "foreign": "bathtub", "example": "Relax in the bathtub.", "exampleDe": "Entspann dich in der Badewanne." },
        { "native": "der Wasserhahn", "foreign": "tap/faucet", "example": "Turn off the tap.", "exampleDe": "Dreh den Wasserhahn zu." },
        { "native": "der Kühlschrank", "foreign": "refrigerator", "example": "The refrigerator is empty.", "exampleDe": "Der Kühlschrank ist leer." },
        { "native": "der Gefrierschrank", "foreign": "freezer", "example": "Put the ice in the freezer.", "exampleDe": "Leg das Eis in den Gefrierschrank." },
        { "native": "der Herd", "foreign": "stove", "example": "The stove is hot.", "exampleDe": "Der Herd ist heiß." },
        { "native": "der Backofen", "foreign": "oven", "example": "Bake the pizza in the oven.", "exampleDe": "Back die Pizza im Ofen." },
        { "native": "die Mikrowelle", "foreign": "microwave", "example": "Heat the food in the microwave.", "exampleDe": "Erhitz das Essen in der Mikrowelle." },
        { "native": "die Spülmaschine", "foreign": "dishwasher", "example": "The dishwasher is running.", "exampleDe": "Die Spülmaschine läuft." },
        { "native": "die Waschmaschine", "foreign": "washing machine", "example": "The washing machine is full.", "exampleDe": "Die Waschmaschine ist voll." },
        { "native": "der Trockner", "foreign": "dryer", "example": "Put the laundry in the dryer.", "exampleDe": "Leg die Wäsche in den Trockner." },
        { "native": "der Staubsauger", "foreign": "vacuum cleaner", "example": "Use the vacuum cleaner.", "exampleDe": "Benutz den Staubsauger." },
        { "native": "der Besen", "foreign": "broom", "example": "Sweep the floor with a broom.", "exampleDe": "Fege den Boden mit einem Besen." },
        { "native": "das Bügeleisen", "foreign": "iron", "example": "The iron is hot.", "exampleDe": "Das Bügeleisen ist heiß." },
        { "native": "das Geschirr", "foreign": "dishes", "example": "Wash the dishes.", "exampleDe": "Wasch das Geschirr." },
        { "native": "das Besteck", "foreign": "cutlery", "example": "The cutlery is clean.", "exampleDe": "Das Besteck ist sauber." },
        { "native": "der Teller", "foreign": "plate", "example": "Put the food on the plate.", "exampleDe": "Leg das Essen auf den Teller." },
        { "native": "die Tasse", "foreign": "cup", "example": "A cup of tea.", "exampleDe": "Eine Tasse Tee." },
        { "native": "das Glas", "foreign": "glass", "example": "A glass of water.", "exampleDe": "Ein Glas Wasser." },
        { "native": "die Gabel", "foreign": "fork", "example": "Eat with a fork.", "exampleDe": "Iss mit einer Gabel." },
        { "native": "das Messer", "foreign": "knife", "example": "Cut with a knife.", "exampleDe": "Schneid mit einem Messer." },
        { "native": "der Löffel", "foreign": "spoon", "example": "Eat the soup with a spoon.", "exampleDe": "Iss die Suppe mit einem Löffel." },
        { "native": "die Schüssel", "foreign": "bowl", "example": "A bowl of cereal.", "exampleDe": "Eine Schüssel Müsli." },
        { "native": "die Pfanne", "foreign": "pan", "example": "Fry the egg in the pan.", "exampleDe": "Brate das Ei in der Pfanne." },
        { "native": "der Topf", "foreign": "pot", "example": "Cook the pasta in the pot.", "exampleDe": "Koch die Nudeln im Topf." },
        { "native": "der Müll", "foreign": "trash/garbage", "example": "Take out the trash.", "exampleDe": "Bring den Müll raus." },
        { "native": "die Heizung", "foreign": "heating", "example": "Turn on the heating.", "exampleDe": "Schalt die Heizung ein." },
        { "native": "die Klimaanlage", "foreign": "air conditioning", "example": "The air conditioning is cool.", "exampleDe": "Die Klimaanlage ist kühl." },
        { "native": "der Schlüssel", "foreign": "key", "example": "Where is the key?", "exampleDe": "Wo ist der Schlüssel?" },
        { "native": "das Schloss", "foreign": "lock", "example": "The lock is broken.", "exampleDe": "Das Schloss ist kaputt." },
        { "native": "die Klingel", "foreign": "doorbell", "example": "The doorbell rang.", "exampleDe": "Die Klingel hat geläutet." },
        { "native": "der Briefkasten", "foreign": "mailbox", "example": "Check the mailbox.", "exampleDe": "Schau in den Briefkasten." },
        { "native": "das Paket", "foreign": "package", "example": "Receive a package.", "exampleDe": "Erhalte ein Paket." },
        { "native": "der Strom", "foreign": "electricity", "example": "The electricity is out.", "exampleDe": "Der Strom ist weg." },
        { "native": "das Gas", "foreign": "gas", "example": "The stove uses gas.", "exampleDe": "Der Herd verbraucht Gas." },
        { "native": "die Heizkosten", "foreign": "heating costs", "example": "High heating costs.", "exampleDe": "Hohe Heizkosten." },
        { "native": "der Mietvertrag", "foreign": "rental agreement", "example": "Sign the rental agreement.", "exampleDe": "Unterschreib den Mietvertrag." },
        { "native": "die Kaution", "foreign": "deposit", "example": "Pay the deposit.", "exampleDe": "Zahl die Kaution." },
        { "native": "die Nebenkosten", "foreign": "additional costs", "example": "Check the additional costs.", "exampleDe": "Prüfe die Nebenkosten." },
        { "native": "der Vermieter", "foreign": "landlord", "example": "The landlord is nice.", "exampleDe": "Der Vermieter ist nett." },
        { "native": "der Mieter", "foreign": "tenant", "example": "The tenant pays on time.", "exampleDe": "Der Mieter zahlt pünktlich." },
        { "native": "einziehen", "foreign": "to move in", "example": "We move in tomorrow.", "exampleDe": "Wir ziehen morgen ein." },
        { "native": "ausziehen", "foreign": "to move out", "example": "They move out next week.", "exampleDe": "Sie ziehen nächste Woche aus." },
        { "native": "renovieren", "foreign": "to renovate", "example": "We need to renovate.", "exampleDe": "Wir müssen renovieren." },
        { "native": "putzen", "foreign": "to clean", "example": "I have to clean the house.", "exampleDe": "Ich muss das Haus putzen." },
        { "native": "aufräumen", "foreign": "to tidy up", "example": "Tidy up your room.", "exampleDe": "Räum dein Zimmer auf." },
        { "native": "waschen", "foreign": "to wash", "example": "Wash the clothes.", "exampleDe": "Wasch die Kleidung." },
        { "native": "bügeln", "foreign": "to iron", "example": "Iron your shirt.", "exampleDe": "Bügel dein Hemd." },
        { "native": "reparieren", "foreign": "to repair", "example": "Repair the bike.", "exampleDe": "Reparier das Fahrrad." },
        { "native": "öffnen", "foreign": "to open", "example": "Open the door.", "exampleDe": "Öffne die Tür." },
        { "native": "schließen", "foreign": "to close", "example": "Close the window.", "exampleDe": "Schließ das Fenster." },
        { "native": "wohnen", "foreign": "to live/dwell", "example": "Where do you live?", "exampleDe": "Wo wohnst du?" },
        { "native": "bauen", "foreign": "to build", "example": "Build a new house.", "exampleDe": "Bau ein neues Haus." }
      ]
    },
    {
      "name": "Körper & Gesundheit",
      "words": [
        { "native": "der Körper", "foreign": "body", "example": "Exercise is good for the body.", "exampleDe": "Sport ist gut für den Körper." },
        { "native": "der Kopf", "foreign": "head", "example": "My head hurts.", "exampleDe": "Mein Kopf tut weh." },
        { "native": "das Gesicht", "foreign": "face", "example": "Wash your face.", "exampleDe": "Wasch dein Gesicht." },
        { "native": "das Haar", "foreign": "hair", "example": "Brush your hair.", "exampleDe": "Bürste deine Haare." },
        { "native": "das Auge", "foreign": "eye", "example": "Close your eyes.", "exampleDe": "Schließ deine Augen." },
        { "native": "das Ohr", "foreign": "ear", "example": "Listen with your ears.", "exampleDe": "Hör mit deinen Ohren zu." },
        { "native": "die Nase", "foreign": "nose", "example": "Breathe through your nose.", "exampleDe": "Atme durch die Nase." },
        { "native": "der Mund", "foreign": "mouth", "example": "Open your mouth.", "exampleDe": "Öffne deinen Mund." },
        { "native": "die Lippe", "foreign": "lip", "example": "Dry lips.", "exampleDe": "Trockene Lippen." },
        { "native": "der Zahn", "foreign": "tooth", "example": "Brush your teeth.", "exampleDe": "Putz deine Zähne." },
        { "native": "die Zunge", "foreign": "tongue", "example": "Stick out your tongue.", "exampleDe": "Streck deine Zunge raus." },
        { "native": "der Hals", "foreign": "neck/throat", "example": "I have a sore throat.", "exampleDe": "Ich habe Halsschmerzen." },
        { "native": "die Schulter", "foreign": "shoulder", "example": "Shrug your shoulders.", "exampleDe": "Zucke mit den Schultern." },
        { "native": "der Arm", "foreign": "arm", "example": "Lift your arm.", "exampleDe": "Hebe deinen Arm." },
        { "native": "der Ellenbogen", "foreign": "elbow", "example": "Lean on your elbow.", "exampleDe": "Stütz dich auf deinen Ellenbogen." },
        { "native": "die Hand", "foreign": "hand", "example": "Shake hands.", "exampleDe": "Gib die Hand." },
        { "native": "der Finger", "foreign": "finger", "example": "Snap your fingers.", "exampleDe": "Schnippe mit den Fingern." },
        { "native": "der Daumen", "foreign": "thumb", "example": "Thumbs up.", "exampleDe": "Daumen hoch." },
        { "native": "die Brust", "foreign": "chest", "example": "Breathe deeply into your chest.", "exampleDe": "Atme tief in deine Brust." },
        { "native": "der Rücken", "foreign": "back", "example": "Straighten your back.", "exampleDe": "Mach deinen Rücken gerade." },
        { "native": "der Bauch", "foreign": "belly/stomach", "example": "Full belly.", "exampleDe": "Voller Bauch." },
        { "native": "das Bein", "foreign": "leg", "example": "Stretch your legs.", "exampleDe": "Streck deine Beine." },
        { "native": "das Knie", "foreign": "knee", "example": "Bend your knees.", "exampleDe": "Beuge deine Knie." },
        { "native": "der Fuß", "foreign": "foot", "example": "Walk on foot.", "exampleDe": "Geh zu Fuß." },
        { "native": "die Zehe", "foreign": "toe", "example": "Stand on your toes.", "exampleDe": "Steh auf den Zehenspitzen." },
        { "native": "die Haut", "foreign": "skin", "example": "Soft skin.", "exampleDe": "Weiche Haut." },
        { "native": "das Herz", "foreign": "heart", "example": "The heart beats.", "exampleDe": "Das Herz schlägt." },
        { "native": "die Lunge", "foreign": "lung", "example": "Lungs for breathing.", "exampleDe": "Lungen zum Atmen." },
        { "native": "der Magen", "foreign": "stomach", "example": "Empty stomach.", "exampleDe": "Leerer Magen." },
        { "native": "das Blut", "foreign": "blood", "example": "Blood is red.", "exampleDe": "Blut ist rot." },
        { "native": "der Knochen", "foreign": "bone", "example": "Strong bones.", "exampleDe": "Starke Knochen." },
        { "native": "der Muskel", "foreign": "muscle", "example": "Flex your muscle.", "exampleDe": "Spann deinen Muskel an." },
        { "native": "das Gehirn", "foreign": "brain", "example": "Use your brain.", "exampleDe": "Benutz dein Gehirn." },
        { "native": "die Gesundheit", "foreign": "health", "example": "Health is wealth.", "exampleDe": "Gesundheit ist Reichtum." },
        { "native": "gesund", "foreign": "healthy", "example": "Eat healthy food.", "exampleDe": "Iss gesundes Essen." },
        { "native": "krank", "foreign": "sick/ill", "example": "I feel sick.", "exampleDe": "Ich fühle mich krank." },
        { "native": "die Krankheit", "foreign": "disease/illness", "example": "A serious illness.", "exampleDe": "Eine schwere Krankheit." },
        { "native": "der Schmerz", "foreign": "pain", "example": "Chronic pain.", "exampleDe": "Chronischer Schmerz." },
        { "native": "die Verletzung", "foreign": "injury", "example": "A sports injury.", "exampleDe": "Eine Sportverletzung." },
        { "native": "der Unfall", "foreign": "accident", "example": "A car accident.", "exampleDe": "Ein Autounfall." },
        { "native": "das Fieber", "foreign": "fever", "example": "I have a high fever.", "exampleDe": "Ich habe hohes Fieber." },
        { "native": "der Schnupfen", "foreign": "cold/runny nose", "example": "I caught a cold.", "exampleDe": "Ich habe Schnupfen." },
        { "native": "der Husten", "foreign": "cough", "example": "Stop the cough.", "exampleDe": "Stopp den Husten." },
        { "native": "die Erkältung", "foreign": "common cold", "example": "Recover from a cold.", "exampleDe": "Erhole dich von einer Erkältung." },
        { "native": "die Grippe", "foreign": "flu", "example": "The flu is spreading.", "exampleDe": "Die Grippe breitet sich aus." },
        { "native": "die Allergie", "foreign": "allergy", "example": "Nut allergy.", "exampleDe": "Nussallergie." },
        { "native": "das Pflaster", "foreign": "band-aid/plaster", "example": "Put on a band-aid.", "exampleDe": "Klebe ein Pflaster auf." },
        { "native": "der Verband", "foreign": "bandage", "example": "Apply a bandage.", "exampleDe": "Lege einen Verband an." },
        { "native": "die Medizin", "foreign": "medicine", "example": "Take your medicine.", "exampleDe": "Nimm deine Medizin." },
        { "native": "die Tablette", "foreign": "pill/tablet", "example": "Swallow the pill.", "exampleDe": "Schluck die Tablette." },
        { "native": "das Medikament", "foreign": "medication", "example": "Effective medication.", "exampleDe": "Wirksames Medikament." },
        { "native": "das Rezept", "foreign": "prescription", "example": "Get a prescription.", "exampleDe": "Hol ein Rezept." },
        { "native": "die Apotheke", "foreign": "pharmacy", "example": "Go to the pharmacy.", "exampleDe": "Geh zur Apotheke." },
        { "native": "der Arzt", "foreign": "doctor", "example": "Call the doctor.", "exampleDe": "Ruf den Arzt." },
        { "native": "das Krankenhaus", "foreign": "hospital", "example": "Hospitals are busy.", "exampleDe": "Krankenhäuser sind beschäftigt." },
        { "native": "die Operation", "foreign": "surgery", "example": "Undergo surgery.", "exampleDe": "Unterziehe dich einer Operation." },
        { "native": "die Therapie", "foreign": "therapy", "example": "Physical therapy.", "exampleDe": "Physiotherapie." },
        { "native": "die Untersuchung", "foreign": "examination", "example": "General medical examination.", "exampleDe": "Allgemeine medizinische Untersuchung." },
        { "native": "der Blutdruck", "foreign": "blood pressure", "example": "Check your blood pressure.", "exampleDe": "Prüfe deinen Blutdruck." },
        { "native": "der Herzschlag", "foreign": "heartbeat", "example": "Rapid heartbeat.", "exampleDe": "Schneller Herzschlag." },
        { "native": "atmen", "foreign": "to breathe", "example": "Breathe in deeply.", "exampleDe": "Atme tief ein." },
        { "native": "schlafen", "foreign": "to sleep", "example": "Sleep well.", "exampleDe": "Schlaf gut." },
        { "native": "ruhen", "foreign": "to rest", "example": "Rest for a while.", "exampleDe": "Ruh dich eine Weile aus." },
        { "native": "entspannen", "foreign": "to relax", "example": "Relax your muscles.", "exampleDe": "Entspann deine Muskeln." },
        { "native": "bewegen", "foreign": "to move/exercise", "example": "Move your body.", "exampleDe": "Beweg deinen Körper." },
        { "native": "schwitzen", "foreign": "to sweat", "example": "Sweat during exercise.", "exampleDe": "Schwitz beim Sport." },
        { "native": "fühlen", "foreign": "to feel", "example": "How do you feel?", "exampleDe": "Wie fühlst du dich?" },
        { "native": "helfen", "foreign": "to help", "example": "Help the patient.", "exampleDe": "Hilf dem Patienten." },
        { "native": "heilen", "foreign": "to heal", "example": "The wound heals.", "exampleDe": "Die Wunde heilt." },
        { "native": "schützen", "foreign": "to protect", "example": "Protect your skin.", "exampleDe": "Schütz deine Haut." },
        { "native": "vermeiden", "foreign": "to avoid", "example": "Avoid stress.", "exampleDe": "Vermeide Stress." },
        { "native": "rauchen", "foreign": "to smoke", "example": "Stop smoking.", "exampleDe": "Hör auf zu rauchen." },
        { "native": "die Ernährung", "foreign": "nutrition", "example": "Balanced nutrition.", "exampleDe": "Ausgewogene Ernährung." },
        { "native": "die Vitamine", "foreign": "vitamins", "example": "Take vitamins.", "exampleDe": "Nimm Vitamine." },
        { "native": "das Gewicht", "foreign": "weight", "example": "Lose weight.", "exampleDe": "Nimm ab." },
        { "native": "die Diät", "foreign": "diet", "example": "Follow a diet.", "exampleDe": "Folge einer Diät." },
        { "native": "die Fitness", "foreign": "fitness", "example": "Improve your fitness.", "exampleDe": "Verbessere deine Fitness." },
        { "native": "das Training", "foreign": "training/workout", "example": "Hard workout.", "exampleDe": "Hartes Training." },
        { "native": "müde", "foreign": "tired", "example": "I'm very tired.", "exampleDe": "Ich bin sehr müde." },
        { "native": "wach", "foreign": "awake", "example": "I am wide awake.", "exampleDe": "Ich bin hellwach." },
        { "native": "stark", "foreign": "strong", "example": "You are strong.", "exampleDe": "Du bist stark." },
        { "native": "schwach", "foreign": "weak", "example": "Feeling weak.", "exampleDe": "Fühle mich schwach." },
        { "native": "fit", "foreign": "fit", "example": "I'm staying fit.", "exampleDe": "Ich bleibe fit." },
        { "native": "schlank", "foreign": "slim/thin", "example": "She is slim.", "exampleDe": "Sie ist schlank." },
        { "native": "dick", "foreign": "fat/thick", "example": "A thick book.", "exampleDe": "Ein dickes Buch." },
        { "native": "groß", "foreign": "tall/large", "example": "He is tall.", "exampleDe": "Er ist groß." },
        { "native": "klein", "foreign": "small/short", "example": "A small child.", "exampleDe": "Ein kleines Kind." },
        { "native": "jung", "foreign": "young", "example": "A young man.", "exampleDe": "Ein junger Mann." },
        { "native": "alt", "foreign": "old", "example": "An old woman.", "exampleDe": "Eine alte Frau." },
        { "native": "schön", "foreign": "beautiful", "example": "Beautiful face.", "exampleDe": "Schönes Gesicht." },
        { "native": "hässlich", "foreign": "ugly", "example": "Ugly wound.", "exampleDe": "Hässliche Wunde." },
        { "native": "sauber", "foreign": "clean", "example": "Clean hands.", "exampleDe": "Saubere Hände." },
        { "native": "schmutzig", "foreign": "dirty", "example": "Dirty feet.", "exampleDe": "Schmutzige Füße." }
      ]
    },
    {
      "name": "Technik & Internet",
      "words": [
        { "native": "die Technik", "foreign": "technology", "example": "Modern technology.", "exampleDe": "Moderne Technik." },
        { "native": "das Internet", "foreign": "internet", "example": "Surf the internet.", "exampleDe": "Surf im Internet." },
        { "native": "der Computer", "foreign": "computer", "example": "Use the computer.", "exampleDe": "Benutz den Computer." },
        { "native": "der Laptop", "foreign": "laptop", "example": "Close the laptop.", "exampleDe": "Schließ den Laptop." },
        { "native": "das Smartphone", "foreign": "smartphone", "example": "Check your smartphone.", "exampleDe": "Prüfe dein Smartphone." },
        { "native": "das Handy", "foreign": "cell phone", "example": "My cell phone is ringing.", "exampleDe": "Mein Handy klingelt." },
        { "native": "die Webseite", "foreign": "website", "example": "Visit the website.", "exampleDe": "Besuch die Webseite." },
        { "native": "die E-Mail", "foreign": "email", "example": "Write an email.", "exampleDe": "Schreib eine E-Mail." },
        { "native": "das Passwort", "foreign": "password", "example": "Use a strong password.", "exampleDe": "Benutz ein starkes Passwort." },
        { "native": "der Benutzername", "foreign": "username", "example": "Enter your username.", "exampleDe": "Gib deinen Benutzernamen ein." },
        { "native": "die App", "foreign": "app", "example": "Download the app.", "exampleDe": "Lad die App herunter." },
        { "native": "die Software", "foreign": "software", "example": "Update the software.", "exampleDe": "Aktualisiere die Software." },
        { "native": "die Hardware", "foreign": "hardware", "example": "Hardware components.", "exampleDe": "Hardware-Komponenten." },
        { "native": "das Netzwerk", "foreign": "network", "example": "Wireless network.", "exampleDe": "Drahtloses Netzwerk." },
        { "native": "das WLAN", "foreign": "Wi-Fi", "example": "Connect to Wi-Fi.", "exampleDe": "Verbinde mit dem WLAN." },
        { "native": "die Datei", "foreign": "file", "example": "Save the file.", "exampleDe": "Speicher die Datei." },
        { "native": "der Ordner", "foreign": "folder", "example": "Open the folder.", "exampleDe": "Öffne den Ordner." },
        { "native": "das Dokument", "foreign": "document", "example": "Read the document.", "exampleDe": "Lies das Dokument." },
        { "native": "das Bild", "foreign": "image/picture", "example": "Upload an image.", "exampleDe": "Lad ein Bild hoch." },
        { "native": "das Video", "foreign": "video", "example": "Watch a video.", "exampleDe": "Schau ein Video." },
        { "native": "die Nachricht", "foreign": "message", "example": "Send a message.", "exampleDe": "Schick eine Nachricht." },
        { "native": "der Chat", "foreign": "chat", "example": "Join the chat.", "exampleDe": "Tritt dem Chat bei." },
        { "native": "der Link", "foreign": "link", "example": "Click the link.", "exampleDe": "Klick auf den Link." },
        { "native": "die URL", "foreign": "URL", "example": "Enter the URL.", "exampleDe": "Gib die URL ein." },
        { "native": "der Browser", "foreign": "browser", "example": "Open the web browser.", "exampleDe": "Öffne den Webbrowser." },
        { "native": "die Suche", "foreign": "search", "example": "Start the search.", "exampleDe": "Starte die Suche." },
        { "native": "das Ergebnis", "foreign": "result", "example": "Search results.", "exampleDe": "Suchergebnisse." },
        { "native": "der Download", "foreign": "download", "example": "Download started.", "exampleDe": "Download gestartet." },
        { "native": "der Upload", "foreign": "upload", "example": "Upload complete.", "exampleDe": "Upload abgeschlossen." },
        { "native": "speichern", "foreign": "to save", "example": "Save your work.", "exampleDe": "Speicher deine Arbeit." },
        { "native": "löschen", "foreign": "to delete", "example": "Delete the file.", "exampleDe": "Lösch die Datei." },
        { "native": "kopieren", "foreign": "to copy", "example": "Copy the text.", "exampleDe": "Kopier den Text." },
        { "native": "einfügen", "foreign": "to paste", "example": "Paste the image.", "exampleDe": "Füg das Bild ein." },
        { "native": "drucken", "foreign": "to print", "example": "Print the report.", "exampleDe": "Druck den Bericht." },
        { "native": "teilen", "foreign": "to share", "example": "Share with friends.", "exampleDe": "Teil mit Freunden." },
        { "native": "anmelden", "foreign": "to log in", "example": "Log in to your account.", "exampleDe": "Meld dich in deinem Konto an." },
        { "native": "abmelden", "foreign": "to log out", "example": "Log out after use.", "exampleDe": "Meld dich nach Gebrauch ab." },
        { "native": "registrieren", "foreign": "to register", "example": "Register for free.", "exampleDe": "Registrier dich kostenlos." },
        { "native": "installieren", "foreign": "to install", "example": "Install the update.", "exampleDe": "Installiere das Update." },
        { "native": "deinstallieren", "foreign": "to uninstall", "example": "Uninstall the app.", "exampleDe": "Deinstalliere die App." },
        { "native": "der Bildschirm", "foreign": "screen/monitor", "example": "A flat screen.", "exampleDe": "Ein Flachbildschirm." },
        { "native": "die Tastatur", "foreign": "keyboard", "example": "Type on the keyboard.", "exampleDe": "Tippe auf der Tastatur." },
        { "native": "die Maus", "foreign": "mouse", "example": "Move the mouse.", "exampleDe": "Beweg die Maus." },
        { "native": "der Drucker", "foreign": "printer", "example": "The printer is working.", "exampleDe": "Der Drucker arbeitet." },
        { "native": "die Kamera", "foreign": "camera", "example": "Smile for the camera.", "exampleDe": "Lächle für die Kamera." },
        { "native": "das Mikrofon", "foreign": "microphone", "example": "Speak into the microphone.", "exampleDe": "Sprich ins Mikrofon." },
        { "native": "der Lautsprecher", "foreign": "speaker", "example": "Turn up the speaker.", "exampleDe": "Dreh den Lautsprecher auf." },
        { "native": "der Kopfhörer", "foreign": "headphones", "example": "Wear headphones.", "exampleDe": "Trag Kopfhörer." },
        { "native": "die Batterie", "foreign": "battery", "example": "The battery is low.", "exampleDe": "Die Batterie ist schwach." },
        { "native": "das Ladegerät", "foreign": "charger", "example": "Connect the charger.", "exampleDe": "Schließ das Ladegerät an." },
        { "native": "das Kabel", "foreign": "cable/wire", "example": "USB cable.", "exampleDe": "USB-Kabel." },
        { "native": "der Anschluss", "foreign": "connection/port", "example": "Charging port.", "exampleDe": "Ladeanschluss." },
        { "native": "die Daten", "foreign": "data", "example": "Digital data.", "exampleDe": "Digitale Daten." },
        { "native": "die Datenbank", "foreign": "database", "example": "Query the database.", "exampleDe": "Frag die Datenbank ab." },
        { "native": "der Server", "foreign": "server", "example": "The server is down.", "exampleDe": "Der Server ist ausgefallen." },
        { "native": "die Cloud", "foreign": "cloud", "example": "Save in the cloud.", "exampleDe": "Speicher in der Cloud." },
        { "native": "das Backup", "foreign": "backup", "example": "Create a backup.", "exampleDe": "Erstell ein Backup." },
        { "native": "der Virus", "foreign": "virus", "example": "Computer virus.", "exampleDe": "Computervirus." },
        { "native": "die Firewall", "foreign": "firewall", "example": "Firewall is active.", "exampleDe": "Die Firewall ist aktiv." },
        { "native": "das Update", "foreign": "update", "example": "New update available.", "exampleDe": "Neues Update verfügbar." },
        { "native": "der Bug", "foreign": "bug/error", "example": "Fix the software bug.", "exampleDe": "Beheb den Softwarefehler." },
        { "native": "die Programmierung", "foreign": "programming", "example": "Learn C++ programming.", "exampleDe": "Lern C++ Programmierung." },
        { "native": "der Code", "foreign": "code", "example": "Clean code.", "exampleDe": "Sauberer Code." },
        { "native": "die KI", "foreign": "AI", "example": "Artificial Intelligence is growing.", "exampleDe": "Künstliche Intelligenz wächst." },
        { "native": "der Roboter", "foreign": "robot", "example": "Autonomous robot.", "exampleDe": "Autonomer Roboter." },
        { "native": "die Automatisierung", "foreign": "automation", "example": "Process automation.", "exampleDe": "Prozessautomatisierung." },
        { "native": "die Digitalisierung", "foreign": "digitalization", "example": "Digitalization of schools.", "exampleDe": "Digitalisierung der Schulen." },
        { "native": "das Feature", "foreign": "feature", "example": "New app feature.", "exampleDe": "Neues App-Feature." },
        { "native": "das UI/UX", "foreign": "UI/UX", "example": "Good UI/UX design.", "exampleDe": "Gutes UI/UX Design." },
        { "native": "das Mockup", "foreign": "mockup", "example": "Design a mockup.", "exampleDe": "Entwirf ein Mockup." },
        { "native": "die Entwicklung", "foreign": "development", "example": "Software development.", "exampleDe": "Softwareentwicklung." },
        { "native": "der Test", "foreign": "test", "example": "Run a test.", "exampleDe": "Führ einen Test aus." },
        { "native": "der Release", "foreign": "release", "example": "Product release.", "exampleDe": "Produktveröffentlichung." },
        { "native": "die Plattform", "foreign": "platform", "example": "Learning platform.", "exampleDe": "Lernplattform." },
        { "native": "das soziale Netzwerk", "foreign": "social network", "example": "Facebook is a social network.", "exampleDe": "Facebook ist ein soziales Netzwerk." },
        { "native": "der Beitrag", "foreign": "post", "example": "Write a post.", "exampleDe": "Schreib einen Beitrag." },
        { "native": "der Kommentar", "foreign": "comment", "example": "Leave a comment.", "exampleDe": "Hinterlass einen Kommentar." },
        { "native": "teilen", "foreign": "to share", "example": "Share the post.", "exampleDe": "Teil den Beitrag." },
        { "native": "folgen", "foreign": "to follow", "example": "Follow me on Twitter.", "exampleDe": "Folg mir auf Twitter." },
        { "native": "der Abonnent", "foreign": "subscriber", "example": "A million subscribers.", "exampleDe": "Eine Million Abonnenten." },
        { "native": "das Profil", "foreign": "profile", "example": "Update your profile.", "exampleDe": "Aktualisiere dein Profil." },
        { "native": "das Foto", "foreign": "photo", "example": "Post a photo.", "exampleDe": "Poste ein Foto." },
        { "native": "der Stream", "foreign": "stream", "example": "Live stream started.", "exampleDe": "Livestream gestartet." },
        { "native": "online", "foreign": "online", "example": "I'm online now.", "exampleDe": "Ich bin jetzt online." },
        { "native": "offline", "foreign": "offline", "example": "The system is offline.", "exampleDe": "Das System ist offline." },
        { "native": "digital", "foreign": "digital", "example": "Digital world.", "exampleDe": "Digitale Welt." },
        { "native": "virtuell", "foreign": "virtual", "example": "Virtual reality.", "exampleDe": "Virtuelle Realität." },
        { "native": "smart", "foreign": "smart", "example": "Smart home devices.", "exampleDe": "Smart Home Geräte." },
        { "native": "kabellos", "foreign": "wireless", "example": "Wireless mouse.", "exampleDe": "Kabellose Maus." },
        { "native": "tragbar", "foreign": "portable", "example": "Portable speaker.", "exampleDe": "Tragbarer Lautsprecher." },
        { "native": "verbinden", "foreign": "to connect", "example": "Connect to the internet.", "exampleDe": "Verbinde mit dem Internet." },
        { "native": "trennen", "foreign": "to disconnect", "example": "Disconnect the device.", "exampleDe": "Trenn das Gerät." },
        { "native": "laden", "foreign": "to load/charge", "example": "The page is loading.", "exampleDe": "Die Seite lädt." },
        { "native": "senden", "foreign": "to send", "example": "Send the file.", "exampleDe": "Schick die Datei." },
        { "native": "empfangen", "foreign": "to receive", "example": "Receive an email.", "exampleDe": "Erhalte eine E-Mail." },
        { "native": "navigieren", "foreign": "to navigate", "example": "Navigate through the menu.", "exampleDe": "Navigiere durch das Menü." },
        { "native": "scattern", "foreign": "to scroll", "example": "Scroll down for more.", "exampleDe": "Scroll nach unten für mehr." },
        { "native": "klicken", "foreign": "to click", "example": "Click here.", "exampleDe": "Klick hier." },
        { "native": "tippen", "foreign": "to type/tap", "example": "Type on the screen.", "exampleDe": "Tippe auf den Bildschirm." }
      ]
    },
    {
      "name": "Natur & Umwelt",
      "words": [
        { "native": "die Umwelt", "foreign": "environment", "example": "Protect the environment.", "exampleDe": "Schütze die Umwelt." },
        { "native": "der Klimawandel", "foreign": "climate change", "example": "Climate change is a global issue.", "exampleDe": "Klimawandel ist ein globales Problem." },
        { "native": "der Wald", "foreign": "forest", "example": "The forest is green.", "exampleDe": "Der Wald ist grün." },
        { "native": "der Baum", "foreign": "tree", "example": "The tree is tall.", "exampleDe": "Der Baum ist hoch." },
        { "native": "die Blume", "foreign": "flower", "example": "Flowers are beautiful.", "exampleDe": "Blumen sind schön." },
        { "native": "der Ozean", "foreign": "ocean", "example": "The ocean is deep.", "exampleDe": "Der Ozean ist tief." },
        { "native": "das Meer", "foreign": "sea", "example": "I love the sea.", "exampleDe": "Ich liebe das Meer." },
        { "native": "der Fluss", "foreign": "river", "example": "The river flows fast.", "exampleDe": "Der Fluss fließt schnell." },
        { "native": "der See", "foreign": "lake", "example": "Swimming in the lake.", "exampleDe": "Schwimmen im See." },
        { "native": "der Berg", "foreign": "mountain", "example": "Let's climb the mountain.", "exampleDe": "Lass uns den Berg besteigen." },
        { "native": "das Tal", "foreign": "valley", "example": "The valley is green.", "exampleDe": "Das Tal ist grün." },
        { "native": "die Wüste", "foreign": "desert", "example": "The desert is dry.", "exampleDe": "Die Wüste ist trocken." },
        { "native": "die Insel", "foreign": "island", "example": "A tropical island.", "exampleDe": "Eine tropische Insel." },
        { "native": "der Strand", "foreign": "beach", "example": "Sand on the beach.", "exampleDe": "Sand am Strand." },
        { "native": "der Himmel", "foreign": "sky", "example": "Blue sky today.", "exampleDe": "Blauer Himmel heute." },
        { "native": "der Stern", "foreign": "star", "example": "Look at the stars.", "exampleDe": "Schau dir die Sterne an." },
        { "native": "der Mond", "foreign": "moon", "example": "The moon is full.", "exampleDe": "Der Mond ist voll." },
        { "native": "die Sonne", "foreign": "sun", "example": "The sun is hot.", "exampleDe": "Die Sonne ist heiß." },
        { "native": "der Wetterbericht", "foreign": "weather report", "example": "Check the weather report.", "exampleDe": "Prüfe den Wetterbericht." },
        { "native": "die Temperatur", "foreign": "temperature", "example": "The temperature drops.", "exampleDe": "Die Temperatur sinkt." },
        { "native": "der Regenbogen", "foreign": "rainbow", "example": "Look, a rainbow!", "exampleDe": "Schau, ein Regenbogen!" },
        { "native": "das Gewitter", "foreign": "thunderstorm", "example": "A loud thunderstorm.", "exampleDe": "Ein lautes Gewitter." },
        { "native": "der Blitz", "foreign": "lightning", "example": "Flash of lightning.", "exampleDe": "Ein Blitzstrahl." },
        { "native": "der Donner", "foreign": "thunder", "example": "Hear the thunder.", "exampleDe": "Hör den Donner." },
        { "native": "der Nebel", "foreign": "fog", "example": "Dense fog in the morning.", "exampleDe": "Dichter Nebel am Morgen." },
        { "native": "der Sturm", "foreign": "storm", "example": "A strong storm.", "exampleDe": "Ein starker Sturm." },
        { "native": "die Erde", "foreign": "earth/soil", "example": "Protect our Earth.", "exampleDe": "Schützt unsere Erde." },
        { "native": "der Kontinent", "foreign": "continent", "example": "Europe is a continent.", "exampleDe": "Europa ist ein Kontinent." },
        { "native": "das Land", "foreign": "country/land", "example": "Living in the country.", "exampleDe": "Auf dem Land leben." },
        { "native": "die Pflanze", "foreign": "plant", "example": "Water the plant.", "exampleDe": "Gieß die Pflanze." },
        { "native": "das Tier", "foreign": "animal", "example": "Wild animal.", "exampleDe": "Wildes Tier." },
        { "native": "das Säugetier", "foreign": "mammal", "example": "The whale is a mammal.", "exampleDe": "Der Wal ist ein Säugetier." },
        { "native": "der Vogel", "foreign": "bird", "example": "Bird is flying.", "exampleDe": "Vogel fliegt." },
        { "native": "der Fisch", "foreign": "fish", "example": "Fish are swimming.", "exampleDe": "Fische schwimmen." },
        { "native": "das Insekt", "foreign": "insect", "example": "A small insect.", "exampleDe": "Ein kleines Insekt." },
        { "native": "der Baumstamm", "foreign": "tree trunk", "example": "Strong tree trunk.", "exampleDe": "Starker Baumstamm." },
        { "native": "das Blatt", "foreign": "leaf", "example": "Autumn leaves.", "exampleDe": "Herbstblätter." },
        { "native": "die Wurzel", "foreign": "root", "example": "Deep roots.", "exampleDe": "Tiefe Wurzeln." },
        { "native": "die Landschaft", "foreign": "landscape", "example": "Beautiful landscape.", "exampleDe": "Schöne Landschaft." },
        { "native": "die Aussicht", "foreign": "view", "example": "Wonderful view.", "exampleDe": "Wunderbare Aussicht." },
        { "native": "die Verschmutzung", "foreign": "pollution", "example": "Air pollution.", "exampleDe": "Luftverschmutzung." },
        { "native": "das Recycling", "foreign": "recycling", "example": "Recycling is important.", "exampleDe": "Recycling ist wichtig." },
        { "native": "der Müll", "foreign": "garbage/waste", "example": "Pick up the garbage.", "exampleDe": "Heb den Müll auf." },
        { "native": "die Energie", "foreign": "energy", "example": "Solar energy.", "exampleDe": "Solarenergie." },
        { "native": "die Nachhaltigkeit", "foreign": "sustainability", "example": "Focus on sustainability.", "exampleDe": "Fokus auf Nachhaltigkeit." },
        { "native": "erneuerbar", "foreign": "renewable", "example": "Renewable energy.", "exampleDe": "Erneuerbare Energie." },
        { "native": "ökologisch", "foreign": "ecological", "example": "Ecological products.", "exampleDe": "Ökologische Produkte." },
        { "native": "bedroht", "foreign": "endangered", "example": "Endangered species.", "exampleDe": "Bedrohte Arten." },
        { "native": "aussterben", "foreign": "to become extinct", "example": "Dinosaurs are extinct.", "exampleDe": "Dinosaurier sind ausgestorben." },
        { "native": "retten", "foreign": "to save", "example": "Save the planet.", "exampleDe": "Rette den Planeten." }
      ]
    },
    {
      "name": "Gefühle & Charakter",
      "words": [
        { "native": "glücklich", "foreign": "happy", "example": "I am so happy.", "exampleDe": "Ich bin so glücklich." },
        { "native": "traurig", "foreign": "sad", "example": "Don't be sad.", "exampleDe": "Sei nicht traurig." },
        { "native": "wütend", "foreign": "angry", "example": "He is very angry.", "exampleDe": "Er ist sehr wütend." },
        { "native": "nervös", "foreign": "nervous", "example": "I'm nervous about the test.", "exampleDe": "Ich bin wegen des Tests nervös." },
        { "native": "entspannt", "foreign": "relaxed", "example": "Relaxed weekend.", "exampleDe": "Entspanntes Wochenende." },
        { "native": "müde", "foreign": "tired", "example": "I'm very tired.", "exampleDe": "Ich bin sehr müde." },
        { "native": "überrascht", "foreign": "surprised", "example": "A surprised face.", "exampleDe": "Ein überraschtes Gesicht." },
        { "native": "stolz", "foreign": "proud", "example": "I'm proud of you.", "exampleDe": "Ich bin stolz auf dich." },
        { "native": "ängstlich", "foreign": "scared/fearful", "example": "An anxious feeling.", "exampleDe": "Ein ängstliches Gefühl." },
        { "native": "einsam", "foreign": "lonely", "example": "Feeling lonely.", "exampleDe": "Sich einsam fühlen." },
        { "native": "gelangweilt", "foreign": "bored", "example": "Bored in class.", "exampleDe": "Gelangweilt im Unterricht." },
        { "native": "begeistert", "foreign": "enthusiastic", "example": "He is enthusiastic.", "exampleDe": "Er ist begeistert." },
        { "native": "verrückt", "foreign": "crazy", "example": "You are crazy!", "exampleDe": "Du bist verrückt!" },
        { "native": "ruhig", "foreign": "quiet/calm", "example": "Keep calm.", "exampleDe": "Bleib ruhig." },
        { "native": "lustig", "foreign": "funny", "example": "A funny joke.", "exampleDe": "Ein lustiger Witz." },
        { "native": "ernst", "foreign": "serious", "example": "A serious situation.", "exampleDe": "Eine ernste Situation." },
        { "native": "höflich", "foreign": "polite", "example": "Be polite to others.", "exampleDe": "Sei höflich zu anderen." },
        { "native": "unhöflich", "foreign": "rude", "example": "That was rude.", "exampleDe": "Das war unhöflich." },
        { "native": "ehrlich", "foreign": "honest", "example": "Honesty is important.", "exampleDe": "Ehrlichkeit ist wichtig." },
        { "native": "mutig", "foreign": "brave", "example": "A brave soldier.", "exampleDe": "Ein mutiger Soldat." },
        { "native": "geduldig", "foreign": "patient", "example": "Be patient with children.", "exampleDe": "Sei geduldig mit Kindern." },
        { "native": "großzügig", "foreign": "generous", "example": "A generous gift.", "exampleDe": "Ein großzügiges Geschenk." },
        { "native": "geizig", "foreign": "greedy/stingy", "example": "Don't be stingy.", "exampleDe": "Sei nicht geizig." },
        { "native": "intelligent", "foreign": "intelligent", "example": "Smart solution.", "exampleDe": "Intelligente Lösung." },
        { "native": "dumm", "foreign": "stupid", "example": "A stupid mistake.", "exampleDe": "Ein dummer Fehler." },
        { "native": "fleißig", "foreign": "diligent/hardworking", "example": "Diligently studying.", "exampleDe": "Fleißig lernen." },
        { "native": "faul", "foreign": "lazy", "example": "A lazy afternoon.", "exampleDe": "Ein fauler Nachmittag." },
        { "native": "freundlich", "foreign": "friendly", "example": "Friendly neighbor.", "exampleDe": "Freundlicher Nachbar." },
        { "native": "unfreundlich", "foreign": "unfriendly", "example": "Cold and unfriendly.", "exampleDe": "Kalt und unfreundlich." },
        { "native": "kreativ", "foreign": "creative", "example": "Creative spirit.", "exampleDe": "Kreativer Geist." },
        { "native": "zuverlässig", "foreign": "reliable", "example": "A reliable friend.", "exampleDe": "Ein zuverlässiger Freund." },
        { "native": "schüchtern", "foreign": "shy", "example": "A shy smile.", "exampleDe": "Ein schüchternes Lächeln." },
        { "native": "selbstbewusst", "foreign": "confident", "example": "Confident manner.", "exampleDe": "Selbstbewusstes Auftreten." },
        { "native": "bescheiden", "foreign": "humble", "example": "Stay humble.", "exampleDe": "Bleib bescheiden." },
        { "native": "arrogant", "foreign": "arrogant", "example": "Don't be arrogant.", "exampleDe": "Sei nicht arrogant." },
        { "native": "neidisch", "foreign": "envious", "example": "Don't be envious.", "exampleDe": "Sei nicht neidisch." },
        { "native": "eifersüchtig", "foreign": "jealous", "example": "Jealous boyfriend.", "exampleDe": "Eifersüchtiger Freund." },
        { "native": "tolerant", "foreign": "tolerant", "example": "Tolerant society.", "exampleDe": "Tolerante Gesellschaft." },
        { "native": "sensibel", "foreign": "sensitive", "example": "A sensitive topic.", "exampleDe": "Ein sensibles Thema." },
        { "native": "optimistisch", "foreign": "optimistic", "example": "Always stay optimistic.", "exampleDe": "Bleib immer optimistisch." },
        { "native": "pessimistisch", "foreign": "pessimistic", "example": "Pessimistic outlook.", "exampleDe": "Pessimistische Aussicht." },
        { "native": "lustlos", "foreign": "unmotivated", "example": "Feeling unmotivated.", "exampleDe": "Sich lustlos fühlen." },
        { "native": "einfühlsam", "foreign": "empathetic", "example": "Empathetic listener.", "exampleDe": "Einfühlsamer Zuhörer." },
        { "native": "chaotisch", "foreign": "chaotic", "example": "A chaotic room.", "exampleDe": "Ein chaotisches Zimmer." },
        { "native": "ordentlich", "foreign": "orderly/tidy", "example": "Keep it tidy.", "exampleDe": "Halt es ordentlich." },
        { "native": "entschlossen", "foreign": "determined", "example": "Determined to win.", "exampleDe": "Entschlossen zu gewinnen." },
        { "native": "verunsichert", "foreign": "insecure", "example": "Feeling insecure.", "exampleDe": "Sich verunsichert fühlen." },
        { "native": "gelassen", "foreign": "composed", "example": "Reacted calmly.", "exampleDe": "Gelassen reagiert." },
        { "native": "frustriert", "foreign": "frustrated", "example": "Frustrated with work.", "exampleDe": "Frustriert von der Arbeit." },
        { "native": "dankbar", "foreign": "grateful", "example": "Grateful for help.", "exampleDe": "Dankbar für Hilfe." }
      ]
    },
    {
      "name": "Einkaufen & Mode",
      "words": [
        { "native": "das Kaufhaus", "foreign": "department store", "example": "In the department store.", "exampleDe": "Im Kaufhaus." },
        { "native": "der Laden", "foreign": "shop", "example": "A small shop.", "exampleDe": "Ein kleiner Laden." },
        { "native": "das Einkaufszentrum", "foreign": "shopping mall", "example": "Let's go to the mall.", "exampleDe": "Lass uns ins Einkaufszentrum gehen." },
        { "native": "die Kasse", "foreign": "checkout/cashier", "example": "Pay at the checkout.", "exampleDe": "An der Kasse zahlen." },
        { "native": "der Kassenzettel", "foreign": "receipt", "example": "Keep the receipt.", "exampleDe": "Behalt den Kassenzettel." },
        { "native": "das Angebot", "foreign": "offer/sale", "example": "Special offer.", "exampleDe": "Besonderes Angebot." },
        { "native": "anprobieren", "foreign": "to try on", "example": "Try on the dress.", "exampleDe": "Probier das Kleid an." },
        { "native": "passen", "foreign": "to fit", "example": "The shoes fit.", "exampleDe": "Die Schuhe passen." },
        { "native": "stehen", "foreign": "to look good (on someone)", "example": "The hat looks good on you.", "exampleDe": "Der Hut steht dir gut." },
        { "native": "die Kleidung", "foreign": "clothing", "example": "Beautiful clothing.", "exampleDe": "Schöne Kleidung." },
        { "native": "das Hemd", "foreign": "shirt", "example": "A white shirt.", "exampleDe": "Ein weißes Hemd." },
        { "native": "die Hose", "foreign": "pants", "example": "Blue pants.", "exampleDe": "Blaue Hose." },
        { "native": "das Kleid", "foreign": "dress", "example": "Summer dress.", "exampleDe": "Sommerkleid." },
        { "native": "der Rock", "foreign": "skirt", "example": "Short skirt.", "exampleDe": "Kurzer Rock." },
        { "native": "der Pullover", "foreign": "sweater", "example": "Warm sweater.", "exampleDe": "Warmer Pullover." },
        { "native": "die Jacke", "foreign": "jacket", "example": "Leather jacket.", "exampleDe": "Lederjacke." },
        { "native": "der Mantel", "foreign": "coat", "example": "Winter coat.", "exampleDe": "Wintermantel." },
        { "native": "die Schuhe", "foreign": "shoes", "example": "Leather shoes.", "exampleDe": "Lederschuhe." },
        { "native": "die Stiefel", "foreign": "boots", "example": "Rain boots.", "exampleDe": "Gummistiefel." },
        { "native": "die Socken", "foreign": "socks", "example": "Cotton socks.", "exampleDe": "Baumwollsocken." },
        { "native": "die Mütze", "foreign": "beanie", "example": "Winter beanie.", "exampleDe": "Wintermütze." },
        { "native": "der Schal", "foreign": "scarf", "example": "Silk scarf.", "exampleDe": "Seidenschal." },
        { "native": "die Handschuhe", "foreign": "gloves", "example": "Warm gloves.", "exampleDe": "Warme Handschuhe." },
        { "native": "der Schmuck", "foreign": "jewelry", "example": "Gold jewelry.", "exampleDe": "Goldschmuck." },
        { "native": "der Ring", "foreign": "ring", "example": "A silver ring.", "exampleDe": "Ein Silberring." },
        { "native": "die Kette", "foreign": "necklace", "example": "Beautiful necklace.", "exampleDe": "Schöne Kette." },
        { "native": "die Ohrringe", "foreign": "earrings", "example": "Small earrings.", "exampleDe": "Kleine Ohrringe." },
        { "native": "die Uhr", "foreign": "watch", "example": "Wrist watch.", "exampleDe": "Armbanduhr." },
        { "native": "die Tasche", "foreign": "bag", "example": "Hand bag.", "exampleDe": "Handtasche." },
        { "native": "der Rucksack", "foreign": "backpack", "example": "Carry the backpack.", "exampleDe": "Trag den Rucksack." },
        { "native": "die Brille", "foreign": "glasses", "example": "Wear your glasses.", "exampleDe": "Trag deine Brille." },
        { "native": "die Sonnenbrille", "foreign": "sunglasses", "example": "Dark sunglasses.", "exampleDe": "Dunkle Sonnenbrille." },
        { "native": "der Gürtel", "foreign": "belt", "example": "Leather belt.", "exampleDe": "Ledergürtel." },
        { "native": "die Größe", "foreign": "size", "example": "What size?", "exampleDe": "Welche Größe?" },
        { "native": "die Farbe", "foreign": "color", "example": "Favorite color.", "exampleDe": "Lieblingsfarbe." },
        { "native": "das Muster", "foreign": "pattern", "example": "Checkered pattern.", "exampleDe": "Kariertes Muster." },
        { "native": "gestreift", "foreign": "striped", "example": "Striped shirt.", "exampleDe": "Gestreiftes Hemd." },
        { "native": "kariert", "foreign": "checkered", "example": "Checkered skirt.", "exampleDe": "Karierter Rock." },
        { "native": "einfarbig", "foreign": "plain/solid", "example": "Plain blue.", "exampleDe": "Einfarbig blau." },
        { "native": "der Stoff", "foreign": "fabric/material", "example": "Soft fabric.", "exampleDe": "Weicher Stoff." },
        { "native": "die Baumwolle", "foreign": "cotton", "example": "Pure cotton.", "exampleDe": "Reine Baumwolle." },
        { "native": "die Seide", "foreign": "silk", "example": "Fine silk.", "exampleDe": "Feine Seide." },
        { "native": "die Wolle", "foreign": "wool", "example": "Warm wool.", "exampleDe": "Warme Wolle." },
        { "native": "das Leder", "foreign": "leather", "example": "Real leather.", "exampleDe": "Echtes Leder." },
        { "native": "modern", "foreign": "modern", "example": "Modern style.", "exampleDe": "Moderner Stil." },
        { "native": "altmodisch", "foreign": "old-fashioned", "example": "Old-fashioned look.", "exampleDe": "Altmodischer Look." },
        { "native": "elegant", "foreign": "elegant", "example": "Very elegant.", "exampleDe": "Sehr elegant." },
        { "native": "lässig", "foreign": "casual", "example": "Casual clothes.", "exampleDe": "Lässige Kleidung." },
        { "native": "bequem", "foreign": "comfortable", "example": "Comfortable shoes.", "exampleDe": "Bequeme Schuhe." },
        { "native": "praktisch", "foreign": "practical", "example": "Practical bag.", "exampleDe": "Praktische Tasche." }
      ]
    },
    {
      "name": "Kommunikation & Medien",
      "words": [
        { "native": "die Kommunikation", "foreign": "communication", "example": "Effective communication.", "exampleDe": "Effektive Kommunikation." },
        { "native": "das Gespräch", "foreign": "conversation", "example": "An interesting conversation.", "exampleDe": "Ein interessantes Gespräch." },
        { "native": "die Nachricht", "foreign": "news/message", "example": "Good news.", "exampleDe": "Gute Nachrichten." },
        { "native": "die Information", "foreign": "information", "example": "Search for information.", "exampleDe": "Nach Informationen suchen." },
        { "native": "die Meinung", "foreign": "opinion", "example": "In my opinion.", "exampleDe": "Meiner Meinung nach." },
        { "native": "die Diskussion", "foreign": "discussion", "example": "Heated discussion.", "exampleDe": "Hitzige Diskussion." },
        { "native": "das Argument", "foreign": "argument", "example": "Strong argument.", "exampleDe": "Starkes Argument." },
        { "native": "die Erklärung", "foreign": "explanation", "example": "Simple explanation.", "exampleDe": "Einfache Erklärung." },
        { "native": "der Rat", "foreign": "advice", "example": "Give good advice.", "exampleDe": "Guten Rat geben." },
        { "native": "die Sprache", "foreign": "language", "example": "Native language.", "exampleDe": "Muttersprache." },
        { "native": "die Gebärdensprache", "foreign": "sign language", "example": "Learning sign language.", "exampleDe": "Gebärdensprache lernen." },
        { "native": "die Stimme", "foreign": "voice", "example": "Loud voice.", "exampleDe": "Laute Stimme." },
        { "native": "das Telefonat", "foreign": "phone call", "example": "I'll make a phone call.", "exampleDe": "Ich mache ein Telefonat." },
        { "native": "die SMS", "foreign": "text message", "example": "Send an SMS.", "exampleDe": "Schick eine SMS." },
        { "native": "die sozialen Medien", "foreign": "social media", "example": "Active on social media.", "exampleDe": "Aktiv in sozialen Medien." },
        { "native": "das Fernsehen", "foreign": "television", "example": "Watching television.", "exampleDe": "Fernsehen schauen." },
        { "native": "das Radio", "foreign": "radio", "example": "Listen to the radio.", "exampleDe": "Radio hören." },
        { "native": "die Zeitung", "foreign": "newspaper", "example": "Read the newspaper.", "exampleDe": "Zeitung lesen." },
        { "native": "die Zeitschrift", "foreign": "magazine", "example": "Fashion magazine.", "exampleDe": "Modezeitschrift." },
        { "native": "das Buch", "foreign": "book", "example": "Write a book.", "exampleDe": "Ein Buch schreiben." },
        { "native": "der Autor", "foreign": "author", "example": "Famous author.", "exampleDe": "Berühmter Autor." },
        { "native": "der Verlag", "foreign": "publisher", "example": "Big publishing house.", "exampleDe": "Großer Verlag." },
        { "native": "die Werbung", "foreign": "advertising", "example": "Annoying advertising.", "exampleDe": "Nervige Werbung." },
        { "native": "das Plakat", "foreign": "poster", "example": "Large poster.", "exampleDe": "Großes Plakat." },
        { "native": "das Internet", "foreign": "internet", "example": "Fast internet.", "exampleDe": "Schnelles Internet." },
        { "native": "die Webseite", "foreign": "website", "example": "Visit the website.", "exampleDe": "Besuch die Webseite." },
        { "native": "der Blog", "foreign": "blog", "example": "Read the blog.", "exampleDe": "Lies den Blog." },
        { "native": "der Artikel", "foreign": "article", "example": "Un interesting article.", "exampleDe": "Ein interessanter Artikel." },
        { "native": "die Schlagzeile", "foreign": "headline", "example": "Big headline.", "exampleDe": "Große Schlagzeile." },
        { "native": "die Presse", "foreign": "press", "example": "Freedom of the press.", "exampleDe": "Pressefreiheit." },
        { "native": "der Reporter", "foreign": "reporter", "example": "TV reporter.", "exampleDe": "Fernse reporter." },
        { "native": "das Interview", "foreign": "interview", "example": "Give an interview.", "exampleDe": "Ein Interview geben." },
        { "native": "die Quelle", "foreign": "source", "example": "Reliable source.", "exampleDe": "Zuverlässige Quelle." },
        { "native": "die Nachrichtensendung", "foreign": "news broadcast", "example": "Watch the news broadcast.", "exampleDe": "Die Nachrichtensendung schauen." },
        { "native": "die Dokumentation", "foreign": "documentary", "example": "Interesting documentary.", "exampleDe": "Interessante Dokumentation." },
        { "native": "der Spielfilm", "foreign": "feature film", "example": "Long feature film.", "exampleDe": "Langer Spielfilm." },
        { "native": "die Serie", "foreign": "series", "example": "Favorite series.", "exampleDe": "Lieblingsserie." },
        { "native": "die Folge", "foreign": "episode", "example": "Next episode.", "exampleDe": "Nächste Folge." },
        { "native": "der Zuschauer", "foreign": "spectator/viewer", "example": "Many viewers.", "exampleDe": "Viele Zuschauer." },
        { "native": "die Öffentlichkeit", "foreign": "public", "example": "Public interest.", "exampleDe": "Öffentliches Interesse." },
        { "native": "das Publikum", "foreign": "audience", "example": "Great audience.", "exampleDe": "Tolles Publikum." },
        { "native": "veröffentlichen", "foreign": "to publish", "example": "Publish a book.", "exampleDe": "Ein Buch veröffentlichen." },
        { "native": "berichten", "foreign": "to report", "example": "Report live.", "exampleDe": "Live berichten." },
        { "native": "diskutieren", "foreign": "to discuss", "example": "Discuss about politics.", "exampleDe": "Über Politik diskutieren." },
        { "native": "überzeugen", "foreign": "to convince", "example": "Convince the customer.", "exampleDe": "Den Kunden überzeugen." },
        { "native": "verstehen", "foreign": "to understand", "example": "I understand you.", "exampleDe": "Ich verstehe dich." },
        { "native": "behaupten", "foreign": "to claim/assert", "example": "He claims that.", "exampleDe": "Er behauptet das." },
        { "native": "bezweifeln", "foreign": "to doubt", "example": "I doubt it.", "exampleDe": "Ich bezweifle es." },
        { "native": "widersprechen", "foreign": "to contradict", "example": "Don't contradict.", "exampleDe": "Widersprich nicht." },
        { "native": "zustimmen", "foreign": "to agree", "example": "I agree with you.", "exampleDe": "Ich stimme dir zu." }
      ]
    },
    {
      "name": "Tierwelt",
      "words": [
        { "native": "der Hund", "foreign": "dog", "example": "The dog is man's best friend.", "exampleDe": "Der Hund ist der beste Freund des Menschen." },
        { "native": "die Katze", "foreign": "cat", "example": "The cat is sleeping on the sofa.", "exampleDe": "Die Katze schläft auf dem Sofa." },
        { "native": "das Pferd", "foreign": "horse", "example": "Riding a horse is fun.", "exampleDe": "Reiten macht Spaß." },
        { "native": "die Kuh", "foreign": "cow", "example": "The cow gives milk.", "exampleDe": "Die Kuh gibt Milch." },
        { "native": "das Schwein", "foreign": "pig", "example": "Pigs are very intelligent.", "exampleDe": "Schweine sind sehr intelligent." },
        { "native": "das Schaf", "foreign": "sheep", "example": "The sheep has thick wool.", "exampleDe": "Das Schaf hat dicke Wolle." },
        { "native": "die Ziege", "foreign": "goat", "example": "Goats can climb well.", "exampleDe": "Ziegen können gut klettern." },
        { "native": "das Huhn", "foreign": "chicken", "example": "The chicken lays an egg.", "exampleDe": "Das Huhn legt ein Ei." },
        { "native": "der Hahn", "foreign": "rooster", "example": "The rooster crows in the morning.", "exampleDe": "Der Hahn kräht am Morgen." },
        { "native": "die Ente", "foreign": "duck", "example": "The duck is swimming in the pond.", "exampleDe": "Die Ente schwimmt im Teich." },
        { "native": "die Gans", "foreign": "goose", "example": "Geese fly south in winter.", "exampleDe": "Gänse fliegen im Winter nach Süden." },
        { "native": "der Esel", "foreign": "donkey", "example": "The donkey is carrying a heavy load.", "exampleDe": "Der Esel trägt eine schwere Last." },
        { "native": "das Kaninchen", "foreign": "rabbit", "example": "The rabbit likes to eat carrots.", "exampleDe": "Das Kaninchen frisst gerne Karotten." },
        { "native": "der Hamster", "foreign": "hamster", "example": "The hamster is running in its wheel.", "exampleDe": "Der Hamster läuft in seinem Rad." },
        { "native": "das Meerschweinchen", "foreign": "guinea pig", "example": "Guinea pigs are popular pets.", "exampleDe": "Meerschweinchen sind beliebte Haustiere." },
        { "native": "der Löwe", "foreign": "lion", "example": "The lion is the king of animals.", "exampleDe": "Der Löwe ist der König der Tiere." },
        { "native": "der Tiger", "foreign": "tiger", "example": "The tiger has orange and black stripes.", "exampleDe": "Der Tiger hat orange-schwarze Streifen." },
        { "native": "der Elefant", "foreign": "elephant", "example": "The elephant has a long trunk.", "exampleDe": "Der Elefant hat einen langen Rüssel." },
        { "native": "die Giraffe", "foreign": "giraffe", "example": "The giraffe has a very long neck.", "exampleDe": "Die Giraffe hat einen sehr langen Hals." },
        { "native": "das Zebra", "foreign": "zebra", "example": "Zebras live in the savanna.", "exampleDe": "Zebras leben in der Savanne." },
        { "native": "der Bär", "foreign": "bear", "example": "The bear loves honey.", "exampleDe": "Der Bär liebt Honig." },
        { "native": "der Wolf", "foreign": "wolf", "example": "The wolf howls at the moon.", "exampleDe": "Der Wolf heult den Mond an." },
        { "native": "der Fuchs", "foreign": "fox", "example": "The fox is very cunning.", "exampleDe": "Der Fuchs ist sehr schlau." },
        { "native": "der Hirsch", "foreign": "deer", "example": "The deer lives in the forest.", "exampleDe": "Der Hirsch lebt im Wald." },
        { "native": "das Reh", "foreign": "roe deer", "example": "A shy roe deer in the field.", "exampleDe": "Ein scheues Reh auf dem Feld." },
        { "native": "der Affe", "foreign": "monkey", "example": "Monkeys climb on trees.", "exampleDe": "Affen klettern auf Bäume." },
        { "native": "das Känguru", "foreign": "kangaroo", "example": "Kangaroos live in Australia.", "exampleDe": "Kängurus leben in Australien." },
        { "native": "das Krokodil", "foreign": "crocodile", "example": "The crocodile has sharp teeth.", "exampleDe": "Das Krokodil hat scharfe Zähne." },
        { "native": "die Schlange", "foreign": "snake", "example": "Some snakes are poisonous.", "exampleDe": "Einige Schlangen sind giftig." },
        { "native": "die Schildkröte", "foreign": "turtle", "example": "The turtle is very slow.", "exampleDe": "Die Schildkröte ist sehr langsam." },
        { "native": "der Frosch", "foreign": "frog", "example": "The frog is green and hops.", "exampleDe": "Der Frosch ist grün und hüpft." },
        { "native": "der Wal", "foreign": "whale", "example": "The blue whale is the largest animal.", "exampleDe": "Der Blauwal ist das größte Tier." },
        { "native": "der Delfin", "foreign": "dolphin", "example": "Dolphins are very intelligent.", "exampleDe": "Delfine sind sehr intelligent." },
        { "native": "der Hai", "foreign": "shark", "example": "Sharks live in the ocean.", "exampleDe": "Haie leben im Ozean." },
        { "native": "der Pinguin", "foreign": "penguin", "example": "Penguins cannot fly.", "exampleDe": "Pinguine können nicht fliegen." },
        { "native": "der Adler", "foreign": "eagle", "example": "The eagle flies very high.", "exampleDe": "Der Adler fliegt sehr hoch." },
        { "native": "die Eule", "foreign": "owl", "example": "The owl is active at night.", "exampleDe": "Die Eule ist nachts aktiv." },
        { "native": "der Papagei", "foreign": "parrot", "example": "The parrot can talk.", "exampleDe": "Der Papagei kann sprechen." },
        { "native": "die Biene", "foreign": "bee", "example": "The bee collects nectar.", "exampleDe": "Die Biene sammelt Nektar." },
        { "native": "der Schmetterling", "foreign": "butterfly", "example": "The butterfly is colorful.", "exampleDe": "Der Schmetterling ist bunt." },
        { "native": "die Spinne", "foreign": "spider", "example": "The spider builds a web.", "exampleDe": "Die Spinne baut ein Netz." },
        { "native": "die Ameise", "foreign": "ant", "example": "Ants are very industrious.", "exampleDe": "Ameisen sind sehr fleißig." },
        { "native": "die Mücke", "foreign": "mosquito", "example": "The mosquito bite is itching.", "exampleDe": "Der Mückenstich juckt." },
        { "native": "die Fliege", "foreign": "fly", "example": "The fly is annoying.", "exampleDe": "Die Fliege nervt." },
        { "native": "der Käfer", "foreign": "beetle", "example": "A small black beetle.", "exampleDe": "Ein kleiner schwarzer Käfer." },
        { "native": "die Schnecke", "foreign": "snail", "example": "The snail carries its house.", "exampleDe": "Die Schnecke trägt ihr Haus." },
        { "native": "der Wurm", "foreign": "worm", "example": "The worm lives in the earth.", "exampleDe": "Der Wurm lebt in der Erde." },
        { "native": "die Maus", "foreign": "mouse", "example": "The mouse eats cheese.", "exampleDe": "Die Maus frisst Käse." },
        { "native": "die Ratte", "foreign": "rat", "example": "Rats are very smart.", "exampleDe": "Ratten sind sehr schlau." },
        { "native": "das Eichhörnchen", "foreign": "squirrel", "example": "The squirrel collects nuts.", "exampleDe": "Das Eichhörnchen sammelt Nüsse." },
        { "native": "der Igel", "foreign": "hedgehog", "example": "The hedgehog has many prickles.", "exampleDe": "Der Igel hat viele Stacheln." },
        { "native": "die Fledermaus", "foreign": "bat", "example": "Bats sleep during the day.", "exampleDe": "Fledermäuse schlafen am Tag." },
        { "native": "das Nilpferd", "foreign": "hippo", "example": "The hippo lives in the water.", "exampleDe": "Das Nilpferd lebt im Wasser." },
        { "native": "das Nashorn", "foreign": "rhino", "example": "The rhino has a big horn.", "exampleDe": "Das Nashorn hat ein großes Horn." },
        { "native": "das Kamel", "foreign": "camel", "example": "The camel lives in the desert.", "exampleDe": "Das Kamel lebt in der Wüste." },
        { "native": "der Pfaun", "foreign": "peacock", "example": "The peacock has beautiful feathers.", "exampleDe": "Der Pfau hat wunderschöne Federn." },
        { "native": "der Strauß", "foreign": "ostrich", "example": "The ostrich is a fast runner.", "exampleDe": "Der Strauß ist ein schneller Läufer." },
        { "native": "der Schwan", "foreign": "swan", "example": "The swan is very elegant.", "exampleDe": "Der Schwan ist sehr elegant." },
        { "native": "der Storch", "foreign": "stork", "example": "The stork builds its nest on the roof.", "exampleDe": "Der Storch baut sein Nest auf dem Dach." },
        { "native": "der Specht", "foreign": "woodpecker", "example": "The woodpecker knocks on the tree.", "exampleDe": "Der Specht klopft am Baum." },
        { "native": "die Krähe", "foreign": "crow", "example": "The crow is black.", "exampleDe": "Die Krähe ist schwarz." },
        { "native": "die Taube", "foreign": "pigeon", "example": "Pigeons live in the city.", "exampleDe": "Tauben leben in der Stadt." },
        { "native": "der Spatz", "foreign": "sparrow", "example": "The sparrow is a small bird.", "exampleDe": "Der Spatz ist ein kleiner Vogel." },
        { "native": "der Lachs", "foreign": "salmon", "example": "Salmon swim up the river.", "exampleDe": "Lachse schwimmen den Fluss hinauf." },
        { "native": "die Forelle", "foreign": "trout", "example": "The trout lives in clear water.", "exampleDe": "Die Forelle lebt in klarem Wasser." },
        { "native": "der Tintenfisch", "foreign": "octopus", "example": "The octopus has eight arms.", "exampleDe": "Der Tintenfisch hat acht Arme." },
        { "native": "die Qualle", "foreign": "jellyfish", "example": "The jellyfish is transparent.", "exampleDe": "Die Qualle ist durchsichtig." },
        { "native": "der Krebs", "foreign": "crab", "example": "The crab has claws.", "exampleDe": "Der Krebs hat Scheren." },
        { "native": "die Garnele", "foreign": "shrimp", "example": "Shrimps are delicious.", "exampleDe": "Garnelen sind lecker." },
        { "native": "die Muschel", "foreign": "shell/mussel", "example": "I found a shell at the beach.", "exampleDe": "Ich habe eine Muschel am Strand gefunden." },
        { "native": "der Seestern", "foreign": "starfish", "example": "The starfish lives on the seabed.", "exampleDe": "Der Seestern lebt am Meeresgrund." },
        { "native": "das Walross", "foreign": "walrus", "example": "The walrus has long tusks.", "exampleDe": "Das Walross hat lange Stoßzähne." },
        { "native": "der Seehund", "foreign": "seal", "example": "The seal is sunbathing.", "exampleDe": "Der Seehund sonnt sich." },
        { "native": "der Eisbär", "foreign": "polar bear", "example": "Polar bears live in the Arctic.", "exampleDe": "Eisbären leben in der Arktis." },
        { "native": "der Elch", "foreign": "moose", "example": "A moose has a large antler.", "exampleDe": "Ein Elch hat ein großes Geweih." },
        { "native": "das Rentier", "foreign": "reindeer", "example": "Reindeer live in the cold north.", "exampleDe": "Rentiere leben im kalten Norden." },
        { "native": "der Koala", "foreign": "koala", "example": "The koala eats eucalyptus.", "exampleDe": "Der Koala frisst Eukalyptus." },
        { "native": "das Faultier", "foreign": "sloth", "example": "The sloth is very slow.", "exampleDe": "Das Faultier ist sehr langsam." },
        { "native": "das Gürteltier", "foreign": "armadillo", "example": "The armadillo has a hard shell.", "exampleDe": "Das Gürteltier hat einen harten Panzer." },
        { "native": "der Waschbär", "foreign": "raccoon", "example": "Raccoons are active at night.", "exampleDe": "Waschbären sind nachts aktiv." },
        { "native": "das Stinktier", "foreign": "skunk", "example": "The skunk smells bad.", "exampleDe": "Das Stinktier riecht schlecht." },
        { "native": "der Dachs", "foreign": "badger", "example": "The badger lives in a burrow.", "exampleDe": "Der Dachs lebt in einem Bau." },
        { "native": "der Marder", "foreign": "marten", "example": "A marten bit the cable.", "exampleDe": "Ein Marder hat das Kabel durchgebissen." },
        { "native": "das Wiesel", "foreign": "weasel", "example": "The weasel is very fast.", "exampleDe": "Das Wiesel ist sehr schnell." },
        { "native": "der Bieber", "foreign": "beaver", "example": "The beaver builds a dam.", "exampleDe": "Der Biber baut einen Damm." },
        { "native": "der Otter", "foreign": "otter", "example": "The otter swims in the river.", "exampleDe": "Der Otter schwimmt im Fluss." },
        { "native": "die Eidechse", "foreign": "lizard", "example": "The lizard is sunning itself.", "exampleDe": "Die Eidechse sonnt sich." },
        { "native": "das Chamäleon", "foreign": "chameleon", "example": "The chameleon changes its color.", "exampleDe": "Das Chamäleon wechselt seine Farbe." },
        { "native": "der Salamander", "foreign": "salamander", "example": "The fire salamander is black and yellow.", "exampleDe": "Der Feuersalamander ist schwarz-gelb." },
        { "native": "der Skorpion", "foreign": "scorpion", "example": "The scorpion has a sting.", "exampleDe": "Der Skorpion hat einen Stachel." },
        { "native": "die Libelle", "foreign": "dragonfly", "example": "The dragonfly flies over the water.", "exampleDe": "Die Libelle fliegt über das Wasser." },
        { "native": "die Heuschrecke", "foreign": "grasshopper", "example": "The grasshopper chirps.", "exampleDe": "Die Heuschrecke zirpt." },
        { "native": "der Marienkäfer", "foreign": "ladybug", "example": "The ladybug is lucky.", "exampleDe": "Der Marienkäfer bringt Glück." },
        { "native": "die Hummel", "foreign": "bumblebee", "example": "The bumblebee is thick and furry.", "exampleDe": "Die Hummel ist dick und pelzig." },
        { "native": "die Wespe", "foreign": "wasp", "example": "The wasp can sting.", "exampleDe": "Die Wespe kann stechen." },
        { "native": "die Zecke", "foreign": "tick", "example": "Beware of ticks in the grass.", "exampleDe": "Vorsicht vor Zecken im Gras." },
        { "native": "der Floh", "foreign": "flea", "example": "The dog has fleas.", "exampleDe": "Der Hund hat Flöhe." },
        { "native": "die Laus", "foreign": "louse", "example": "Children sometimes have head lice.", "exampleDe": "Kinder haben manchmal Kopfläuse." },
        { "native": "die Raupe", "foreign": "caterpillar", "example": "The caterpillar becomes a butterfly.", "exampleDe": "Die Raupe wird ein Schmetterling." }
      ]
    },
    {
      "name": "Alltagshandlungen",
      "words": [
        { "native": "aufstehen", "foreign": "to get up", "example": "I get up at 7 o'clock.", "exampleDe": "Ich stehe um 7 Uhr auf." },
        { "native": "duschen", "foreign": "to shower", "example": "I shower every morning.", "exampleDe": "Ich dusche jeden Morgen." },
        { "native": "frühstücken", "foreign": "to eat breakfast", "example": "Let's eat breakfast together.", "exampleDe": "Lass uns zusammen frühstücken." },
        { "native": "arbeiten", "foreign": "to work", "example": "He works in an office.", "exampleDe": "Er arbeitet in einem Büro." },
        { "native": "kochen", "foreign": "to cook", "example": "I'm cooking pasta tonight.", "exampleDe": "Ich koche heute Abend Nudeln." },
        { "native": "einkaufen", "foreign": "to shop", "example": "We have to go shopping.", "exampleDe": "Wir müssen einkaufen gehen." },
        { "native": "putzen", "foreign": "to clean", "example": "Time to clean the windows.", "exampleDe": "Zeit, die Fenster zu putzen." },
        { "native": "aufräumen", "foreign": "to tidy up", "example": "Tidy up your room!", "exampleDe": "Räum dein Zimmer auf!" },
        { "native": "waschen", "foreign": "to wash", "example": "I wash the car.", "exampleDe": "Ich wasche das Auto." },
        { "native": "schlafen", "foreign": "to sleep", "example": "The baby is finally sleeping.", "exampleDe": "Das Baby schläft endlich." },
        { "native": "fernsehen", "foreign": "to watch TV", "example": "We watch TV in the evening.", "exampleDe": "Wir sehen abends fern." },
        { "native": "lesen", "foreign": "to read", "example": "I read a book every day.", "exampleDe": "Ich lese jeden Tag ein Buch." },
        { "native": "schreiben", "foreign": "to write", "example": "Write an email.", "exampleDe": "Schreib eine E-Mail." },
        { "native": "telefonieren", "foreign": "to talk on the phone", "example": "I'm talking on the phone with my mother.", "exampleDe": "Ich telefoniere mit meiner Mutter." },
        { "native": "spazieren", "foreign": "to walk", "example": "Let's go for a walk.", "exampleDe": "Lass uns spazieren gehen." },
        { "native": "fahren", "foreign": "to drive/ride", "example": "I drive to work by car.", "exampleDe": "Ich fahre mit dem Auto zur Arbeit." },
        { "native": "gehen", "foreign": "to go/walk", "example": "We go to the park.", "exampleDe": "Wir gehen in den Park." },
        { "native": "kommen", "foreign": "to come", "example": "When does the train come?", "exampleDe": "Wann kommt der Zug?" },
        { "native": "bleiben", "foreign": "to stay", "example": "I'm staying at home today.", "exampleDe": "Ich bleibe heute zu Hause." },
        { "native": "helfen", "foreign": "to help", "example": "Can you help me?", "exampleDe": "Kannst du mir helfen?" },
        { "native": "suchen", "foreign": "to search/look for", "example": "I'm looking for my keys.", "exampleDe": "Ich suche meine Schlüssel." },
        { "native": "finden", "foreign": "to find", "example": "I can't find the street.", "exampleDe": "Ich finde die Straße nicht." },
        { "native": "bringen", "foreign": "to bring", "example": "Bring me the newspaper.", "exampleDe": "Bring mir die Zeitung." },
        { "native": "geben", "foreign": "to give", "example": "Give me your hand.", "exampleDe": "Gib mir deine Hand." },
        { "native": "nehmen", "foreign": "to take", "example": "Take an umbrella.", "exampleDe": "Nimm einen Regenschirm." },
        { "native": "essen", "foreign": "to eat", "example": "Let's eat something.", "exampleDe": "Lass uns etwas essen." },
        { "native": "trinken", "foreign": "to drink", "example": "Drink enough water.", "exampleDe": "Trink genug Wasser." },
        { "native": "hören", "foreign": "to hear/listen", "example": "I hear music.", "exampleDe": "Ich höre Musik." },
        { "native": "sehen", "foreign": "to see", "example": "I see a bird.", "exampleDe": "Ich sehe einen Vogel." },
        { "native": "sprechen", "foreign": "to speak", "example": "Speak slowly, please.", "exampleDe": "Sprich bitte langsam." },
        { "native": "verstehen", "foreign": "to understand", "example": "Do you understand me?", "exampleDe": "Verstehst du mich?" },
        { "native": "lernen", "foreign": "to learn", "example": "I learn English.", "exampleDe": "Ich lerne Englisch." },
        { "native": "wissen", "foreign": "to know", "example": "I don't know.", "exampleDe": "Ich weiß es nicht." },
        { "native": "denken", "foreign": "to think", "example": "Think about it.", "exampleDe": "Denk darüber nach." },
        { "native": "glauben", "foreign": "to believe", "example": "I believe you.", "exampleDe": "Ich glaube dir." },
        { "native": "hoffen", "foreign": "to hope", "example": "I hope so.", "exampleDe": "Ich hoffe es." },
        { "native": "warten", "foreign": "to wait", "example": "Wait a minute.", "exampleDe": "Warte eine Minute." },
        { "native": "bezahlen", "foreign": "to pay", "example": "I'll pay cash.", "exampleDe": "Ich zahle bar." },
        { "native": "bestellen", "foreign": "to order", "example": "Let's order pizza.", "exampleDe": "Lass uns Pizza bestellen." },
        { "native": "besuchen", "foreign": "to visit", "example": "Visit your grandparents.", "exampleDe": "Besuch deine Großeltern." },
        { "native": "reisen", "foreign": "to travel", "example": "I like to travel.", "exampleDe": "Ich reise gerne." },
        { "native": "lachen", "foreign": "to laugh", "example": "Laughter is healthy.", "exampleDe": "Lachen ist gesund." },
        { "native": "weinen", "foreign": "to cry", "example": "Don't cry.", "exampleDe": "Wein nicht." },
        { "native": "singen", "foreign": "to sing", "example": "Sing a song.", "exampleDe": "Sing ein Lied." },
        { "native": "tanzen", "foreign": "to dance", "example": "Do you want to dance?", "exampleDe": "Möchtest du tanzen?" },
        { "native": "schwimmen", "foreign": "to swim", "example": "Swim in the pool.", "exampleDe": "Schwimm im Pool." },
        { "native": "laufen", "foreign": "to run/walk", "example": "Running is exhausting.", "exampleDe": "Laufen ist anstrengend." },
        { "native": "springen", "foreign": "to jump", "example": "The cat jumps over the fence.", "exampleDe": "Die Katze springt über den Zaun." },
        { "native": "sitzen", "foreign": "to sit", "example": "Sit down, please.", "exampleDe": "Setz dich bitte hin." },
        { "native": "stehen", "foreign": "to stand", "example": "Stand up.", "exampleDe": "Steh auf." }
      ]
    },
    {
      "name": "Merkmale & Eigenschaften",
      "words": [
        { "native": "groß", "foreign": "big/tall", "example": "A big house.", "exampleDe": "Ein großes Haus." },
        { "native": "klein", "foreign": "small/short", "example": "A small child.", "exampleDe": "Ein kleines Kind." },
        { "native": "alt", "foreign": "old", "example": "An old man.", "exampleDe": "Ein alter Mann." },
        { "native": "neu", "foreign": "new", "example": "A new car.", "exampleDe": "Ein neues Auto." },
        { "native": "jung", "foreign": "young", "example": "A young lady.", "exampleDe": "Eine junge Dame." },
        { "native": "schön", "foreign": "beautiful", "example": "A beautiful view.", "exampleDe": "Eine schöne Aussicht." },
        { "native": "hässlich", "foreign": "ugly", "example": "That's an ugly building.", "exampleDe": "Das ist ein hässliches Gebäude." },
        { "native": "stark", "foreign": "strong", "example": "A strong wind.", "exampleDe": "Ein starker Wind." },
        { "native": "schwach", "foreign": "weak", "example": "I feel weak.", "exampleDe": "Ich fühle mich schwach." },
        { "native": "schnell", "foreign": "fast", "example": "A fast car.", "exampleDe": "Ein schnelles Auto." },
        { "native": "langsam", "foreign": "slow", "example": "A slow snail.", "exampleDe": "Eine langsame Schnecke." },
        { "native": "teuer", "foreign": "expensive", "example": "Too expensive for me.", "exampleDe": "Zu teuer für mich." },
        { "native": "billig", "foreign": "cheap", "example": "Cheap prices.", "exampleDe": "Billige Preise." },
        { "native": "hoch", "foreign": "high", "example": "A high mountain.", "exampleDe": "Ein hoher Berg." },
        { "native": "tief", "foreign": "deep", "example": "Deep water.", "exampleDe": "Tiefes Wasser." },
        { "native": "breit", "foreign": "wide", "example": "A wide street.", "exampleDe": "Eine breite Straße." },
        { "native": "schmal", "foreign": "narrow", "example": "A narrow path.", "exampleDe": "Ein schmaler Pfad." },
        { "native": "dick", "foreign": "thick/fat", "example": "A thick book.", "exampleDe": "Ein dickes Buch." },
        { "native": "dünn", "foreign": "thin", "example": "A thin person.", "exampleDe": "Eine dünne Person." },
        { "native": "schwer", "foreign": "heavy/difficult", "example": "A heavy bag.", "exampleDe": "Eine schwere Tasche." },
        { "native": "leicht", "foreign": "light/easy", "example": "An easy question.", "exampleDe": "Eine leichte Frage." },
        { "native": "hart", "foreign": "hard", "example": "Hard work.", "exampleDe": "Harte Arbeit." },
        { "native": "weich", "foreign": "soft", "example": "A soft pillow.", "exampleDe": "Ein weiches Kissen." },
        { "native": "sauber", "foreign": "clean", "example": "Clean hands.", "exampleDe": "Saubere Hände." },
        { "native": "schmutzig", "foreign": "dirty", "example": "Dirty shoes.", "exampleDe": "Schmutzige Schuhe." },
        { "native": "hell", "foreign": "bright/light", "example": "A bright lamp.", "exampleDe": "Eine helle Lampe." },
        { "native": "dunkel", "foreign": "dark", "example": "A dark night.", "exampleDe": "Eine dunkle Nacht." },
        { "native": "heiß", "foreign": "hot", "example": "Hot tea.", "exampleDe": "Heißer Tee." },
        { "native": "kalt", "foreign": "cold", "example": "Cold water.", "exampleDe": "Kaltes Wasser." },
        { "native": "trocken", "foreign": "dry", "example": "Dry skin.", "exampleDe": "Trockene Haut." },
        { "native": "nass", "foreign": "wet", "example": "Wet ground.", "exampleDe": "Nasser Boden." },
        { "native": "reich", "foreign": "rich", "example": "A rich man.", "exampleDe": "Ein reicher Mann." },
        { "native": "arm", "foreign": "poor", "example": "A poor family.", "exampleDe": "Eine arme Familie." },
        { "native": "klug", "foreign": "smart/clever", "example": "A smart idea.", "exampleDe": "Eine kluge Idee." },
        { "native": "dumm", "foreign": "stupid", "example": "A stupid mistake.", "exampleDe": "Ein dummer Fehler." },
        { "native": "wichtig", "foreign": "important", "example": "An important rule.", "exampleDe": "Eine wichtige Regel." },
        { "native": "unwichtig", "foreign": "unimportant", "example": "Unimportant details.", "exampleDe": "Unwichtige Details." },
        { "native": "interessant", "foreign": "interesting", "example": "An interesting book.", "exampleDe": "Ein interessantes Buch." },
        { "native": "langweilig", "foreign": "boring", "example": "A boring movie.", "exampleDe": "Ein langweiliger Film." },
        { "native": "möglich", "foreign": "possible", "example": "It is possible.", "exampleDe": "Es ist möglich." },
        { "native": "unmöglich", "foreign": "impossible", "example": "That's impossible.", "exampleDe": "Das ist unmöglich." },
        { "native": "gleich", "foreign": "same/equal", "example": "We are the same age.", "exampleDe": "Wir sind gleich alt." },
        { "native": "verschieden", "foreign": "different", "example": "Different opinions.", "exampleDe": "Verschiedene Meinungen." },
        { "native": "richtig", "foreign": "right/correct", "example": "Correct answer.", "exampleDe": "Richtige Antwort." },
        { "native": "falsch", "foreign": "wrong", "example": "That's wrong.", "exampleDe": "Das ist falsch." },
        { "native": "ganz", "foreign": "whole/entire", "example": "The whole day.", "exampleDe": "Der ganze Tag." },
        { "native": "kaputt", "foreign": "broken", "example": "The car is broken.", "exampleDe": "Das Auto ist kaputt." },
        { "native": "offen", "foreign": "open", "example": "The door is open.", "exampleDe": "Die Tür ist offen." },
        { "native": "geschlossen", "foreign": "closed", "example": "The store is closed.", "exampleDe": "Der Laden ist geschlossen." },
        { "native": "leer", "foreign": "empty", "example": "The glass is empty.", "exampleDe": "Das Glas ist leer." }
      ]
    },
    {
      "name": "5. Klasse Gymnasium",
      "words": [
        { "native": "die Schule", "foreign": "school", "example": "I go to school every day.", "exampleDe": "Ich gehe jeden Tag zur Schule." },
        { "native": "der Schüler", "foreign": "pupil / student", "example": "The pupil is in class 5.", "exampleDe": "Der Schüler ist in der 5. Klasse." },
        { "native": "die Schülerin", "foreign": "female pupil / student", "example": "The student reads a book.", "exampleDe": "Die Schülerin liest ein Buch." },
        { "native": "der Lehrer", "foreign": "teacher (male)", "example": "The teacher explains the lesson.", "exampleDe": "Der Lehrer erklärt die Stunde." },
        { "native": "die Lehrerin", "foreign": "teacher (female)", "example": "The teacher is very nice.", "exampleDe": "Die Lehrerin ist sehr nett." },
        { "native": "das Klassenzimmer", "foreign": "classroom", "example": "The classroom is big.", "exampleDe": "Das Klassenzimmer ist groß." },
        { "native": "die Tafel", "foreign": "blackboard", "example": "Write on the blackboard.", "exampleDe": "Schreib an die Tafel." },
        { "native": "der Stundenplan", "foreign": "timetable", "example": "Look at the timetable.", "exampleDe": "Schau auf den Stundenplan." },
        { "native": "die Hausaufgabe", "foreign": "homework", "example": "I have to do my homework.", "exampleDe": "Ich muss meine Hausaufgaben machen." },
        { "native": "die Pause", "foreign": "break", "example": "The break is at 10 o'clock.", "exampleDe": "Die Pause ist um 10 Uhr." },
        { "native": "das Heft", "foreign": "exercise book / notebook", "example": "Write in your exercise book.", "exampleDe": "Schreib in dein Heft." },
        { "native": "der Bleistift", "foreign": "pencil", "example": "I need a pencil.", "exampleDe": "Ich brauche einen Bleistift." },
        { "native": "der Kugelschreiber", "foreign": "pen", "example": "May I borrow your pen?", "exampleDe": "Darf ich deinen Kugelschreiber leihen?" },
        { "native": "das Lineal", "foreign": "ruler", "example": "Use a ruler to draw a line.", "exampleDe": "Benutze ein Lineal, um eine Linie zu zeichnen." },
        { "native": "der Radiergummi", "foreign": "eraser / rubber", "example": "I need an eraser.", "exampleDe": "Ich brauche einen Radiergummi." },
        { "native": "die Schere", "foreign": "scissors", "example": "Cut the paper with scissors.", "exampleDe": "Schneide das Papier mit der Schere." },
        { "native": "der Kleber", "foreign": "glue", "example": "Stick it with glue.", "exampleDe": "Klebe es mit dem Kleber." },
        { "native": "der Ranzen", "foreign": "school bag", "example": "My school bag is heavy.", "exampleDe": "Mein Ranzen ist schwer." },
        { "native": "das Mäppchen", "foreign": "pencil case", "example": "The pencil case is blue.", "exampleDe": "Das Mäppchen ist blau." },
        { "native": "die Familie", "foreign": "family", "example": "My family is big.", "exampleDe": "Meine Familie ist groß." },
        { "native": "die Eltern", "foreign": "parents", "example": "My parents are at home.", "exampleDe": "Meine Eltern sind zu Hause." },
        { "native": "die Mutter", "foreign": "mother", "example": "My mother cooks dinner.", "exampleDe": "Meine Mutter kocht Abendessen." },
        { "native": "der Vater", "foreign": "father", "example": "My father reads the newspaper.", "exampleDe": "Mein Vater liest die Zeitung." },
        { "native": "der Bruder", "foreign": "brother", "example": "My brother is 12 years old.", "exampleDe": "Mein Bruder ist 12 Jahre alt." },
        { "native": "die Schwester", "foreign": "sister", "example": "My sister plays the piano.", "exampleDe": "Meine Schwester spielt Klavier." },
        { "native": "die Großeltern", "foreign": "grandparents", "example": "We visit our grandparents.", "exampleDe": "Wir besuchen unsere Großeltern." },
        { "native": "die Großmutter / Oma", "foreign": "grandmother / grandma", "example": "Grandma bakes a cake.", "exampleDe": "Oma backt einen Kuchen." },
        { "native": "der Großvater / Opa", "foreign": "grandfather / grandpa", "example": "Grandpa tells stories.", "exampleDe": "Opa erzählt Geschichten." },
        { "native": "das Haustier", "foreign": "pet", "example": "Do you have a pet?", "exampleDe": "Hast du ein Haustier?" },
        { "native": "der Hund", "foreign": "dog", "example": "The dog is playing in the garden.", "exampleDe": "Der Hund spielt im Garten." },
        { "native": "die Katze", "foreign": "cat", "example": "The cat sleeps on the sofa.", "exampleDe": "Die Katze schläft auf dem Sofa." },
        { "native": "der Freund", "foreign": "friend (male)", "example": "He is my best friend.", "exampleDe": "Er ist mein bester Freund." },
        { "native": "die Freundin", "foreign": "friend (female)", "example": "She is my best friend.", "exampleDe": "Sie ist meine beste Freundin." },
        { "native": "Hallo", "foreign": "hello", "example": "Hello, how are you?", "exampleDe": "Hallo, wie geht es dir?" },
        { "native": "Tschüss", "foreign": "bye", "example": "Bye, see you tomorrow!", "exampleDe": "Tschüss, bis morgen!" },
        { "native": "bitte", "foreign": "please", "example": "Can I have some water, please?", "exampleDe": "Kann ich bitte etwas Wasser haben?" },
        { "native": "danke", "foreign": "thank you / thanks", "example": "Thank you very much!", "exampleDe": "Vielen Dank!" },
        { "native": "Entschuldigung", "foreign": "excuse me / sorry", "example": "Excuse me, where is the library?", "exampleDe": "Entschuldigung, wo ist die Bibliothek?" },
        { "native": "ja", "foreign": "yes", "example": "Yes, I can help you.", "exampleDe": "Ja, ich kann dir helfen." },
        { "native": "nein", "foreign": "no", "example": "No, that is wrong.", "exampleDe": "Nein, das ist falsch." },
        { "native": "Wie geht es dir?", "foreign": "How are you?", "example": "How are you today?", "exampleDe": "Wie geht es dir heute?" },
        { "native": "Mir geht es gut.", "foreign": "I'm fine.", "example": "I'm fine, thank you.", "exampleDe": "Mir geht es gut, danke." },
        { "native": "Wie heißt du?", "foreign": "What is your name?", "example": "What is your name?", "exampleDe": "Wie heißt du?" },
        { "native": "Ich heiße...", "foreign": "My name is...", "example": "My name is Anna.", "exampleDe": "Ich heiße Anna." },
        { "native": "Wie alt bist du?", "foreign": "How old are you?", "example": "How old are you?", "exampleDe": "Wie alt bist du?" },
        { "native": "Ich bin ... Jahre alt.", "foreign": "I am ... years old.", "example": "I am 10 years old.", "exampleDe": "Ich bin 10 Jahre alt." },
        { "native": "Wo wohnst du?", "foreign": "Where do you live?", "example": "Where do you live?", "exampleDe": "Wo wohnst du?" },
        { "native": "Ich wohne in...", "foreign": "I live in...", "example": "I live in Berlin.", "exampleDe": "Ich wohne in Berlin." },
        { "native": "die Farbe", "foreign": "colour", "example": "What is your favourite colour?", "exampleDe": "Was ist deine Lieblingsfarbe?" },
        { "native": "rot", "foreign": "red", "example": "The apple is red.", "exampleDe": "Der Apfel ist rot." },
        { "native": "blau", "foreign": "blue", "example": "The sky is blue.", "exampleDe": "Der Himmel ist blau." },
        { "native": "grün", "foreign": "green", "example": "The grass is green.", "exampleDe": "Das Gras ist grün." },
        { "native": "gelb", "foreign": "yellow", "example": "The sun is yellow.", "exampleDe": "Die Sonne ist gelb." },
        { "native": "schwarz", "foreign": "black", "example": "The cat is black.", "exampleDe": "Die Katze ist schwarz." },
        { "native": "weiß", "foreign": "white", "example": "The snow is white.", "exampleDe": "Der Schnee ist weiß." },
        { "native": "die Zahl", "foreign": "number", "example": "Write the number on the board.", "exampleDe": "Schreib die Zahl an die Tafel." },
        { "native": "eins", "foreign": "one", "example": "I have one brother.", "exampleDe": "Ich habe einen Bruder." },
        { "native": "zwei", "foreign": "two", "example": "I have two cats.", "exampleDe": "Ich habe zwei Katzen." },
        { "native": "drei", "foreign": "three", "example": "There are three books.", "exampleDe": "Da sind drei Bücher." },
        { "native": "zehn", "foreign": "ten", "example": "I count to ten.", "exampleDe": "Ich zähle bis zehn." },
        { "native": "zwanzig", "foreign": "twenty", "example": "There are twenty pupils in the class.", "exampleDe": "Es sind zwanzig Schüler in der Klasse." },
        { "native": "hundert", "foreign": "hundred", "example": "A hundred is a big number.", "exampleDe": "Hundert ist eine große Zahl." },
        { "native": "der Montag", "foreign": "Monday", "example": "On Monday I have English.", "exampleDe": "Am Montag habe ich Englisch." },
        { "native": "der Dienstag", "foreign": "Tuesday", "example": "On Tuesday we have sports.", "exampleDe": "Am Dienstag haben wir Sport." },
        { "native": "der Mittwoch", "foreign": "Wednesday", "example": "Wednesday is in the middle of the week.", "exampleDe": "Mittwoch ist in der Mitte der Woche." },
        { "native": "der Donnerstag", "foreign": "Thursday", "example": "On Thursday I go swimming.", "exampleDe": "Am Donnerstag gehe ich schwimmen." },
        { "native": "der Freitag", "foreign": "Friday", "example": "Friday is the last school day.", "exampleDe": "Freitag ist der letzte Schultag." },
        { "native": "der Samstag", "foreign": "Saturday", "example": "On Saturday we go shopping.", "exampleDe": "Am Samstag gehen wir einkaufen." },
        { "native": "der Sonntag", "foreign": "Sunday", "example": "On Sunday we rest.", "exampleDe": "Am Sonntag ruhen wir uns aus." },
        { "native": "der Januar", "foreign": "January", "example": "January is the first month.", "exampleDe": "Januar ist der erste Monat." },
        { "native": "der Februar", "foreign": "February", "example": "February is short.", "exampleDe": "Februar ist kurz." },
        { "native": "der März", "foreign": "March", "example": "Spring starts in March.", "exampleDe": "Der Frühling beginnt im März." },
        { "native": "der Frühling", "foreign": "spring", "example": "In spring the flowers bloom.", "exampleDe": "Im Frühling blühen die Blumen." },
        { "native": "der Sommer", "foreign": "summer", "example": "In summer we go swimming.", "exampleDe": "Im Sommer gehen wir schwimmen." },
        { "native": "der Herbst", "foreign": "autumn / fall", "example": "In autumn the leaves fall.", "exampleDe": "Im Herbst fallen die Blätter." },
        { "native": "der Winter", "foreign": "winter", "example": "In winter it snows.", "exampleDe": "Im Winter schneit es." },
        { "native": "das Frühstück", "foreign": "breakfast", "example": "I eat breakfast at 7.", "exampleDe": "Ich frühstücke um 7 Uhr." },
        { "native": "das Mittagessen", "foreign": "lunch", "example": "Lunch is at 12 o'clock.", "exampleDe": "Das Mittagessen ist um 12 Uhr." },
        { "native": "das Abendessen", "foreign": "dinner / supper", "example": "We have dinner together.", "exampleDe": "Wir essen zusammen Abendessen." },
        { "native": "das Brot", "foreign": "bread", "example": "I eat bread for breakfast.", "exampleDe": "Ich esse Brot zum Frühstück." },
        { "native": "die Butter", "foreign": "butter", "example": "Put butter on the bread.", "exampleDe": "Tu Butter aufs Brot." },
        { "native": "der Käse", "foreign": "cheese", "example": "I like cheese.", "exampleDe": "Ich mag Käse." },
        { "native": "die Milch", "foreign": "milk", "example": "I drink milk every morning.", "exampleDe": "Ich trinke jeden Morgen Milch." },
        { "native": "der Saft", "foreign": "juice", "example": "Orange juice is healthy.", "exampleDe": "Orangensaft ist gesund." },
        { "native": "das Wasser", "foreign": "water", "example": "I drink water.", "exampleDe": "Ich trinke Wasser." },
        { "native": "der Apfel", "foreign": "apple", "example": "The apple is red and sweet.", "exampleDe": "Der Apfel ist rot und süß." },
        { "native": "die Banane", "foreign": "banana", "example": "A banana is yellow.", "exampleDe": "Eine Banane ist gelb." },
        { "native": "das Zimmer", "foreign": "room", "example": "My room is tidy.", "exampleDe": "Mein Zimmer ist ordentlich." },
        { "native": "die Küche", "foreign": "kitchen", "example": "We eat in the kitchen.", "exampleDe": "Wir essen in der Küche." },
        { "native": "das Badezimmer", "foreign": "bathroom", "example": "The bathroom is upstairs.", "exampleDe": "Das Badezimmer ist oben." },
        { "native": "das Wohnzimmer", "foreign": "living room", "example": "We watch TV in the living room.", "exampleDe": "Wir sehen im Wohnzimmer fern." },
        { "native": "der Garten", "foreign": "garden", "example": "We play in the garden.", "exampleDe": "Wir spielen im Garten." },
        { "native": "die Uhr", "foreign": "clock / watch", "example": "What time is it?", "exampleDe": "Wie viel Uhr ist es?" },
        { "native": "die Stunde", "foreign": "hour / lesson", "example": "The lesson is 45 minutes.", "exampleDe": "Die Stunde dauert 45 Minuten." },
        { "native": "die Minute", "foreign": "minute", "example": "Wait five minutes.", "exampleDe": "Warte fünf Minuten." },
        { "native": "heute", "foreign": "today", "example": "Today is Monday.", "exampleDe": "Heute ist Montag." },
        { "native": "morgen", "foreign": "tomorrow", "example": "Tomorrow we have a test.", "exampleDe": "Morgen haben wir einen Test." },
        { "native": "gestern", "foreign": "yesterday", "example": "Yesterday was Sunday.", "exampleDe": "Gestern war Sonntag." },
        { "native": "immer", "foreign": "always", "example": "I always do my homework.", "exampleDe": "Ich mache immer meine Hausaufgaben." },
        { "native": "manchmal", "foreign": "sometimes", "example": "Sometimes I play football.", "exampleDe": "Manchmal spiele ich Fußball." },
        { "native": "nie", "foreign": "never", "example": "I never lie.", "exampleDe": "Ich lüge nie." },
        { "native": "der Sport", "foreign": "sport / PE", "example": "I like sport.", "exampleDe": "Ich mag Sport." },
        { "native": "Englisch", "foreign": "English", "example": "I learn English at school.", "exampleDe": "Ich lerne Englisch in der Schule." },
        { "native": "Deutsch", "foreign": "German", "example": "German is my first language.", "exampleDe": "Deutsch ist meine Muttersprache." },
        { "native": "Mathematik / Mathe", "foreign": "mathematics / maths", "example": "Maths is my favourite subject.", "exampleDe": "Mathe ist mein Lieblingsfach." },
        { "native": "Musik", "foreign": "music", "example": "We sing in music class.", "exampleDe": "Wir singen im Musikunterricht." },
        { "native": "Kunst", "foreign": "art", "example": "In art class we paint pictures.", "exampleDe": "Im Kunstunterricht malen wir Bilder." },
        { "native": "können", "foreign": "can / to be able to", "example": "I can swim.", "exampleDe": "Ich kann schwimmen." },
        { "native": "müssen", "foreign": "must / to have to", "example": "I must go to school.", "exampleDe": "Ich muss in die Schule gehen." },
        { "native": "möchten", "foreign": "would like", "example": "I would like an ice cream.", "exampleDe": "Ich möchte ein Eis." },
        { "native": "dürfen", "foreign": "may / to be allowed to", "example": "May I go to the toilet?", "exampleDe": "Darf ich auf die Toilette gehen?" },
        { "native": "spielen", "foreign": "to play", "example": "The children play in the park.", "exampleDe": "Die Kinder spielen im Park." },
        { "native": "machen", "foreign": "to do / to make", "example": "What are you doing?", "exampleDe": "Was machst du?" },
        { "native": "haben", "foreign": "to have", "example": "I have a dog.", "exampleDe": "Ich habe einen Hund." },
        { "native": "sein", "foreign": "to be", "example": "I am happy.", "exampleDe": "Ich bin glücklich." },
        { "native": "gern / gerne", "foreign": "gladly / to like doing", "example": "I like reading.", "exampleDe": "Ich lese gerne." },
        { "native": "das Hobby", "foreign": "hobby", "example": "My hobby is swimming.", "exampleDe": "Mein Hobby ist Schwimmen." },
        { "native": "der Fußball", "foreign": "football / soccer", "example": "I play football after school.", "exampleDe": "Ich spiele nach der Schule Fußball." },
        { "native": "das Fahrrad", "foreign": "bicycle / bike", "example": "I ride my bike to school.", "exampleDe": "Ich fahre mit dem Fahrrad zur Schule." },
        { "native": "der Computer", "foreign": "computer", "example": "I use the computer for homework.", "exampleDe": "Ich benutze den Computer für Hausaufgaben." },
        { "native": "das Handy", "foreign": "mobile phone / cell phone", "example": "I got a new mobile phone.", "exampleDe": "Ich habe ein neues Handy bekommen." },
        { "native": "das Buch", "foreign": "book", "example": "I read a book.", "exampleDe": "Ich lese ein Buch." },
        { "native": "der Film", "foreign": "film / movie", "example": "The film was great!", "exampleDe": "Der Film war toll!" },
        { "native": "das Spiel", "foreign": "game", "example": "Let's play a game.", "exampleDe": "Lass uns ein Spiel spielen." },
        { "native": "der Geburtstag", "foreign": "birthday", "example": "Happy birthday!", "exampleDe": "Alles Gute zum Geburtstag!" },
        { "native": "das Geschenk", "foreign": "present / gift", "example": "Thank you for the present.", "exampleDe": "Danke für das Geschenk." },
        { "native": "die Party", "foreign": "party", "example": "I go to a party.", "exampleDe": "Ich gehe auf eine Party." },
        { "native": "toll", "foreign": "great / awesome", "example": "That's great!", "exampleDe": "Das ist toll!" },
        { "native": "super", "foreign": "super / great", "example": "That's super!", "exampleDe": "Das ist super!" },
        { "native": "lustig", "foreign": "funny", "example": "The clown is funny.", "exampleDe": "Der Clown ist lustig." },
        { "native": "traurig", "foreign": "sad", "example": "I am sad.", "exampleDe": "Ich bin traurig." },
        { "native": "müde", "foreign": "tired", "example": "I am very tired.", "exampleDe": "Ich bin sehr müde." },
        { "native": "hungrig", "foreign": "hungry", "example": "I am hungry.", "exampleDe": "Ich bin hungrig." },
        { "native": "durstig", "foreign": "thirsty", "example": "I am thirsty.", "exampleDe": "Ich bin durstig." },
        { "native": "glücklich", "foreign": "happy", "example": "I am happy.", "exampleDe": "Ich bin glücklich." },
        { "native": "krank", "foreign": "ill / sick", "example": "I am ill today.", "exampleDe": "Ich bin heute krank." },
        { "native": "gesund", "foreign": "healthy", "example": "Fruit is healthy.", "exampleDe": "Obst ist gesund." },
        { "native": "der Kopf", "foreign": "head", "example": "My head hurts.", "exampleDe": "Mein Kopf tut weh." },
        { "native": "die Hand", "foreign": "hand", "example": "Wash your hands.", "exampleDe": "Wasch dir die Hände." },
        { "native": "der Fuß", "foreign": "foot", "example": "My foot hurts.", "exampleDe": "Mein Fuß tut weh." },
        { "native": "das Auge", "foreign": "eye", "example": "She has blue eyes.", "exampleDe": "Sie hat blaue Augen." },
        { "native": "das Ohr", "foreign": "ear", "example": "I hear with my ears.", "exampleDe": "Ich höre mit meinen Ohren." },
        { "native": "die Nase", "foreign": "nose", "example": "My nose is cold.", "exampleDe": "Meine Nase ist kalt." },
        { "native": "der Mund", "foreign": "mouth", "example": "Open your mouth.", "exampleDe": "Öffne deinen Mund." },
        { "native": "links", "foreign": "left", "example": "Turn left.", "exampleDe": "Biege links ab." },
        { "native": "rechts", "foreign": "right", "example": "Turn right.", "exampleDe": "Biege rechts ab." },
        { "native": "geradeaus", "foreign": "straight ahead", "example": "Go straight ahead.", "exampleDe": "Geh geradeaus." },
        { "native": "neben", "foreign": "next to", "example": "The school is next to the park.", "exampleDe": "Die Schule ist neben dem Park." },
        { "native": "zwischen", "foreign": "between", "example": "I sit between my friends.", "exampleDe": "Ich sitze zwischen meinen Freunden." },
        { "native": "vor", "foreign": "in front of / before", "example": "The tree is in front of the house.", "exampleDe": "Der Baum ist vor dem Haus." },
        { "native": "hinter", "foreign": "behind", "example": "The garden is behind the house.", "exampleDe": "Der Garten ist hinter dem Haus." },
        { "native": "über", "foreign": "above / over", "example": "The lamp hangs over the table.", "exampleDe": "Die Lampe hängt über dem Tisch." },
        { "native": "unter", "foreign": "under / below", "example": "The cat is under the table.", "exampleDe": "Die Katze ist unter dem Tisch." },
        { "native": "Ich verstehe nicht.", "foreign": "I don't understand.", "example": "I don't understand the question.", "exampleDe": "Ich verstehe die Frage nicht." },
        { "native": "Können Sie das wiederholen?", "foreign": "Can you repeat that?", "example": "Can you repeat that, please?", "exampleDe": "Können Sie das bitte wiederholen?" },
        { "native": "Wie sagt man ... auf Englisch?", "foreign": "How do you say ... in English?", "example": "How do you say 'Hund' in English?", "exampleDe": "Wie sagt man 'Hund' auf Englisch?" },
        { "native": "das Wetter", "foreign": "weather", "example": "The weather is nice today.", "exampleDe": "Das Wetter ist heute schön." },
        { "native": "die Sonne", "foreign": "sun", "example": "The sun is shining.", "exampleDe": "Die Sonne scheint." },
        { "native": "der Regen", "foreign": "rain", "example": "It's raining.", "exampleDe": "Es regnet." },
        { "native": "der Schnee", "foreign": "snow", "example": "It's snowing!", "exampleDe": "Es schneit!" },
        { "native": "warm", "foreign": "warm", "example": "It is warm today.", "exampleDe": "Es ist heute warm." },

        { "native": "vier", "foreign": "four", "example": "I have four books.", "exampleDe": "Ich habe vier Bücher." },
        { "native": "fünf", "foreign": "five", "example": "There are five apples.", "exampleDe": "Da sind fünf Äpfel." },
        { "native": "sechs", "foreign": "six", "example": "Six plus four is ten.", "exampleDe": "Sechs plus vier ist zehn." },
        { "native": "sieben", "foreign": "seven", "example": "There are seven days in a week.", "exampleDe": "Eine Woche hat sieben Tage." },
        { "native": "acht", "foreign": "eight", "example": "School starts at eight.", "exampleDe": "Die Schule beginnt um acht." },
        { "native": "neun", "foreign": "nine", "example": "I have nine crayons.", "exampleDe": "Ich habe neun Buntstifte." },
        { "native": "elf", "foreign": "eleven", "example": "There are eleven players.", "exampleDe": "Es gibt elf Spieler." },
        { "native": "zwölf", "foreign": "twelve", "example": "There are twelve months.", "exampleDe": "Es gibt zwölf Monate." },
        { "native": "dreizehn", "foreign": "thirteen", "example": "She is thirteen years old.", "exampleDe": "Sie ist dreizehn Jahre alt." },
        { "native": "dreißig", "foreign": "thirty", "example": "There are thirty days in April.", "exampleDe": "Der April hat dreißig Tage." },
        { "native": "fünfzig", "foreign": "fifty", "example": "Fifty is half of a hundred.", "exampleDe": "Fünfzig ist die Hälfte von hundert." },
        { "native": "tausend", "foreign": "thousand", "example": "A thousand is a big number.", "exampleDe": "Tausend ist eine große Zahl." },
        { "native": "der erste", "foreign": "first", "example": "I am the first in line.", "exampleDe": "Ich bin der Erste in der Reihe." },
        { "native": "der zweite", "foreign": "second", "example": "The second lesson is maths.", "exampleDe": "Die zweite Stunde ist Mathe." },
        { "native": "der dritte", "foreign": "third", "example": "My classroom is on the third floor.", "exampleDe": "Mein Klassenzimmer ist im dritten Stock." },

        { "native": "der April", "foreign": "April", "example": "April has thirty days.", "exampleDe": "Der April hat dreißig Tage." },
        { "native": "der Mai", "foreign": "May", "example": "May is a beautiful month.", "exampleDe": "Der Mai ist ein schöner Monat." },
        { "native": "der Juni", "foreign": "June", "example": "Summer holidays start in June.", "exampleDe": "Die Sommerferien beginnen im Juni." },
        { "native": "der Juli", "foreign": "July", "example": "July is very hot.", "exampleDe": "Der Juli ist sehr heiß." },
        { "native": "der August", "foreign": "August", "example": "We go on holiday in August.", "exampleDe": "Wir fahren im August in den Urlaub." },
        { "native": "der September", "foreign": "September", "example": "School starts in September.", "exampleDe": "Die Schule beginnt im September." },
        { "native": "der Oktober", "foreign": "October", "example": "October is in autumn.", "exampleDe": "Der Oktober ist im Herbst." },
        { "native": "der November", "foreign": "November", "example": "November is foggy.", "exampleDe": "Der November ist neblig." },
        { "native": "der Dezember", "foreign": "December", "example": "Christmas is in December.", "exampleDe": "Weihnachten ist im Dezember." },

        { "native": "die Hose", "foreign": "trousers / pants", "example": "My trousers are blue.", "exampleDe": "Meine Hose ist blau." },
        { "native": "das T-Shirt", "foreign": "T-shirt", "example": "I wear a red T-shirt.", "exampleDe": "Ich trage ein rotes T-Shirt." },
        { "native": "der Pullover", "foreign": "pullover / jumper", "example": "Put on your jumper, it's cold.", "exampleDe": "Zieh deinen Pullover an, es ist kalt." },
        { "native": "die Jacke", "foreign": "jacket", "example": "Take your jacket.", "exampleDe": "Nimm deine Jacke mit." },
        { "native": "der Schuh", "foreign": "shoe", "example": "My shoes are new.", "exampleDe": "Meine Schuhe sind neu." },
        { "native": "die Socke", "foreign": "sock", "example": "I need clean socks.", "exampleDe": "Ich brauche saubere Socken." },
        { "native": "die Mütze", "foreign": "cap / hat", "example": "Wear a cap, it's cold.", "exampleDe": "Setz eine Mütze auf, es ist kalt." },
        { "native": "der Rock", "foreign": "skirt", "example": "The skirt is green.", "exampleDe": "Der Rock ist grün." },
        { "native": "das Kleid", "foreign": "dress", "example": "She wears a nice dress.", "exampleDe": "Sie trägt ein schönes Kleid." },
        { "native": "der Mantel", "foreign": "coat", "example": "Put on your coat.", "exampleDe": "Zieh deinen Mantel an." },
        { "native": "der Schal", "foreign": "scarf", "example": "The scarf is warm.", "exampleDe": "Der Schal ist warm." },
        { "native": "der Handschuh", "foreign": "glove", "example": "I forgot my gloves.", "exampleDe": "Ich habe meine Handschuhe vergessen." },
        { "native": "der Stiefel", "foreign": "boot", "example": "I wear boots in winter.", "exampleDe": "Ich trage im Winter Stiefel." },
        { "native": "das Hemd", "foreign": "shirt", "example": "He wears a white shirt.", "exampleDe": "Er trägt ein weißes Hemd." },
        { "native": "die Jeans", "foreign": "jeans", "example": "I like wearing jeans.", "exampleDe": "Ich trage gerne Jeans." },
        { "native": "tragen", "foreign": "to wear", "example": "What are you wearing today?", "exampleDe": "Was trägst du heute?" },
        { "native": "anziehen", "foreign": "to put on / to get dressed", "example": "Get dressed quickly!", "exampleDe": "Zieh dich schnell an!" },

        { "native": "die Tomate", "foreign": "tomato", "example": "Tomatoes are red.", "exampleDe": "Tomaten sind rot." },
        { "native": "die Kartoffel", "foreign": "potato", "example": "I like potatoes.", "exampleDe": "Ich mag Kartoffeln." },
        { "native": "die Orange", "foreign": "orange", "example": "The orange is sweet.", "exampleDe": "Die Orange ist süß." },
        { "native": "die Erdbeere", "foreign": "strawberry", "example": "Strawberries are my favourite fruit.", "exampleDe": "Erdbeeren sind mein Lieblingsobst." },
        { "native": "das Ei", "foreign": "egg", "example": "I eat an egg for breakfast.", "exampleDe": "Ich esse ein Ei zum Frühstück." },
        { "native": "das Fleisch", "foreign": "meat", "example": "I don't eat meat.", "exampleDe": "Ich esse kein Fleisch." },
        { "native": "der Fisch", "foreign": "fish", "example": "Fish is healthy.", "exampleDe": "Fisch ist gesund." },
        { "native": "die Schokolade", "foreign": "chocolate", "example": "I love chocolate.", "exampleDe": "Ich liebe Schokolade." },
        { "native": "der Kuchen", "foreign": "cake", "example": "Grandma bakes a cake.", "exampleDe": "Oma backt einen Kuchen." },
        { "native": "das Eis", "foreign": "ice cream", "example": "I would like an ice cream.", "exampleDe": "Ich möchte ein Eis." },
        { "native": "die Nudel", "foreign": "noodle / pasta", "example": "I like pasta.", "exampleDe": "Ich mag Nudeln." },
        { "native": "der Reis", "foreign": "rice", "example": "We eat rice with fish.", "exampleDe": "Wir essen Reis mit Fisch." },
        { "native": "die Suppe", "foreign": "soup", "example": "The soup is hot.", "exampleDe": "Die Suppe ist heiß." },
        { "native": "der Tee", "foreign": "tea", "example": "Would you like some tea?", "exampleDe": "Möchtest du Tee?" },
        { "native": "der Keks", "foreign": "biscuit / cookie", "example": "I eat a biscuit with my tea.", "exampleDe": "Ich esse einen Keks zum Tee." },
        { "native": "die Wurst", "foreign": "sausage", "example": "I have a sausage on my bread.", "exampleDe": "Ich habe eine Wurst auf dem Brot." },
        { "native": "das Obst", "foreign": "fruit", "example": "Fruit is healthy.", "exampleDe": "Obst ist gesund." },
        { "native": "das Gemüse", "foreign": "vegetables", "example": "Eat your vegetables!", "exampleDe": "Iss dein Gemüse!" },
        { "native": "der Teller", "foreign": "plate", "example": "Put the food on the plate.", "exampleDe": "Tu das Essen auf den Teller." },
        { "native": "die Tasse", "foreign": "cup", "example": "A cup of tea, please.", "exampleDe": "Eine Tasse Tee, bitte." },
        { "native": "das Glas", "foreign": "glass", "example": "A glass of water, please.", "exampleDe": "Ein Glas Wasser, bitte." },
        { "native": "das Messer", "foreign": "knife", "example": "Cut the bread with the knife.", "exampleDe": "Schneide das Brot mit dem Messer." },
        { "native": "die Gabel", "foreign": "fork", "example": "Eat with a fork.", "exampleDe": "Iss mit der Gabel." },
        { "native": "der Löffel", "foreign": "spoon", "example": "Eat soup with a spoon.", "exampleDe": "Iss Suppe mit dem Löffel." },
        { "native": "lecker", "foreign": "delicious / yummy", "example": "The cake is delicious.", "exampleDe": "Der Kuchen ist lecker." },
        { "native": "essen", "foreign": "to eat", "example": "I eat an apple.", "exampleDe": "Ich esse einen Apfel." },
        { "native": "trinken", "foreign": "to drink", "example": "I drink water.", "exampleDe": "Ich trinke Wasser." },
        { "native": "kochen", "foreign": "to cook", "example": "My mum cooks dinner.", "exampleDe": "Meine Mutter kocht Abendessen." },

        { "native": "der Hamster", "foreign": "hamster", "example": "My hamster is small.", "exampleDe": "Mein Hamster ist klein." },
        { "native": "das Meerschweinchen", "foreign": "guinea pig", "example": "Guinea pigs are cute.", "exampleDe": "Meerschweinchen sind süß." },
        { "native": "das Kaninchen", "foreign": "rabbit", "example": "The rabbit eats carrots.", "exampleDe": "Das Kaninchen frisst Karotten." },
        { "native": "der Vogel", "foreign": "bird", "example": "The bird sings.", "exampleDe": "Der Vogel singt." },
        { "native": "das Pferd", "foreign": "horse", "example": "I can ride a horse.", "exampleDe": "Ich kann reiten." },
        { "native": "die Kuh", "foreign": "cow", "example": "The cow gives milk.", "exampleDe": "Die Kuh gibt Milch." },
        { "native": "das Schwein", "foreign": "pig", "example": "The pig is pink.", "exampleDe": "Das Schwein ist rosa." },
        { "native": "das Schaf", "foreign": "sheep", "example": "The sheep has white wool.", "exampleDe": "Das Schaf hat weiße Wolle." },
        { "native": "die Maus", "foreign": "mouse", "example": "The mouse is small.", "exampleDe": "Die Maus ist klein." },
        { "native": "der Elefant", "foreign": "elephant", "example": "The elephant is big.", "exampleDe": "Der Elefant ist groß." },
        { "native": "der Löwe", "foreign": "lion", "example": "The lion is the king of the animals.", "exampleDe": "Der Löwe ist der König der Tiere." },
        { "native": "der Affe", "foreign": "monkey", "example": "The monkey climbs trees.", "exampleDe": "Der Affe klettert auf Bäume." },
        { "native": "der Bär", "foreign": "bear", "example": "The bear is strong.", "exampleDe": "Der Bär ist stark." },
        { "native": "die Schlange", "foreign": "snake", "example": "Snakes can be dangerous.", "exampleDe": "Schlangen können gefährlich sein." },
        { "native": "der Frosch", "foreign": "frog", "example": "The frog jumps into the water.", "exampleDe": "Der Frosch springt ins Wasser." },
        { "native": "der Fisch", "foreign": "fish (animal)", "example": "The fish swims in the water.", "exampleDe": "Der Fisch schwimmt im Wasser." },
        { "native": "die Spinne", "foreign": "spider", "example": "I am afraid of spiders.", "exampleDe": "Ich habe Angst vor Spinnen." },
        { "native": "der Schmetterling", "foreign": "butterfly", "example": "The butterfly is colourful.", "exampleDe": "Der Schmetterling ist bunt." },

        { "native": "der Bauch", "foreign": "stomach / belly", "example": "My stomach hurts.", "exampleDe": "Mein Bauch tut weh." },
        { "native": "der Arm", "foreign": "arm", "example": "I broke my arm.", "exampleDe": "Ich habe mir den Arm gebrochen." },
        { "native": "das Bein", "foreign": "leg", "example": "My leg hurts.", "exampleDe": "Mein Bein tut weh." },
        { "native": "der Finger", "foreign": "finger", "example": "I have ten fingers.", "exampleDe": "Ich habe zehn Finger." },
        { "native": "der Zahn", "foreign": "tooth", "example": "Brush your teeth.", "exampleDe": "Putz dir die Zähne." },
        { "native": "das Haar", "foreign": "hair", "example": "She has long hair.", "exampleDe": "Sie hat lange Haare." },
        { "native": "der Rücken", "foreign": "back", "example": "My back hurts.", "exampleDe": "Mein Rücken tut weh." },
        { "native": "das Knie", "foreign": "knee", "example": "I fell on my knee.", "exampleDe": "Ich bin auf mein Knie gefallen." },
        { "native": "die Schulter", "foreign": "shoulder", "example": "My shoulder hurts.", "exampleDe": "Meine Schulter tut weh." },
        { "native": "der Hals", "foreign": "neck / throat", "example": "I have a sore throat.", "exampleDe": "Ich habe Halsschmerzen." },

        { "native": "das Schlafzimmer", "foreign": "bedroom", "example": "My bedroom is upstairs.", "exampleDe": "Mein Schlafzimmer ist oben." },
        { "native": "die Tür", "foreign": "door", "example": "Close the door, please.", "exampleDe": "Schließ bitte die Tür." },
        { "native": "das Fenster", "foreign": "window", "example": "Open the window.", "exampleDe": "Öffne das Fenster." },
        { "native": "die Treppe", "foreign": "stairs", "example": "Go up the stairs.", "exampleDe": "Geh die Treppe hoch." },
        { "native": "der Tisch", "foreign": "table", "example": "The book is on the table.", "exampleDe": "Das Buch liegt auf dem Tisch." },
        { "native": "das Bett", "foreign": "bed", "example": "I go to bed at nine.", "exampleDe": "Ich gehe um neun ins Bett." },
        { "native": "der Schrank", "foreign": "cupboard / wardrobe", "example": "My clothes are in the wardrobe.", "exampleDe": "Meine Kleidung ist im Schrank." },
        { "native": "das Sofa", "foreign": "sofa / couch", "example": "I sit on the sofa.", "exampleDe": "Ich sitze auf dem Sofa." },
        { "native": "die Lampe", "foreign": "lamp", "example": "Turn on the lamp.", "exampleDe": "Mach die Lampe an." },
        { "native": "der Fernseher", "foreign": "television / TV", "example": "I watch TV in the evening.", "exampleDe": "Ich sehe abends fern." },
        { "native": "oben", "foreign": "upstairs / up", "example": "My room is upstairs.", "exampleDe": "Mein Zimmer ist oben." },
        { "native": "unten", "foreign": "downstairs / down", "example": "The kitchen is downstairs.", "exampleDe": "Die Küche ist unten." },

        { "native": "gehen", "foreign": "to go / to walk", "example": "I go to school.", "exampleDe": "Ich gehe in die Schule." },
        { "native": "kommen", "foreign": "to come", "example": "Come here, please.", "exampleDe": "Komm bitte her." },
        { "native": "laufen", "foreign": "to run", "example": "The children run in the park.", "exampleDe": "Die Kinder laufen im Park." },
        { "native": "sitzen", "foreign": "to sit", "example": "I sit at the desk.", "exampleDe": "Ich sitze am Schreibtisch." },
        { "native": "stehen", "foreign": "to stand", "example": "Stand up, please.", "exampleDe": "Steh bitte auf." },
        { "native": "schlafen", "foreign": "to sleep", "example": "I sleep eight hours.", "exampleDe": "Ich schlafe acht Stunden." },
        { "native": "aufstehen", "foreign": "to get up", "example": "I get up at seven.", "exampleDe": "Ich stehe um sieben auf." },
        { "native": "waschen", "foreign": "to wash", "example": "Wash your hands!", "exampleDe": "Wasch dir die Hände!" },
        { "native": "putzen", "foreign": "to clean / to brush", "example": "Brush your teeth!", "exampleDe": "Putz dir die Zähne!" },
        { "native": "helfen", "foreign": "to help", "example": "Can you help me?", "exampleDe": "Kannst du mir helfen?" },
        { "native": "bringen", "foreign": "to bring", "example": "Bring your book, please.", "exampleDe": "Bring bitte dein Buch mit." },
        { "native": "nehmen", "foreign": "to take", "example": "Take a pencil.", "exampleDe": "Nimm einen Bleistift." },
        { "native": "geben", "foreign": "to give", "example": "Give me the book, please.", "exampleDe": "Gib mir bitte das Buch." },
        { "native": "sagen", "foreign": "to say", "example": "What did you say?", "exampleDe": "Was hast du gesagt?" },
        { "native": "sprechen", "foreign": "to speak / to talk", "example": "I speak English.", "exampleDe": "Ich spreche Englisch." },
        { "native": "hören", "foreign": "to hear / to listen", "example": "Listen to the teacher.", "exampleDe": "Hör dem Lehrer zu." },
        { "native": "sehen", "foreign": "to see", "example": "I can see the mountains.", "exampleDe": "Ich kann die Berge sehen." },
        { "native": "öffnen", "foreign": "to open", "example": "Open your books.", "exampleDe": "Öffnet eure Bücher." },
        { "native": "schließen", "foreign": "to close", "example": "Close the window.", "exampleDe": "Schließ das Fenster." },
        { "native": "kaufen", "foreign": "to buy", "example": "I want to buy a present.", "exampleDe": "Ich möchte ein Geschenk kaufen." },
        { "native": "zeigen", "foreign": "to show", "example": "Show me your homework.", "exampleDe": "Zeig mir deine Hausaufgaben." },
        { "native": "warten", "foreign": "to wait", "example": "Wait for me!", "exampleDe": "Warte auf mich!" },
        { "native": "finden", "foreign": "to find", "example": "I can't find my pen.", "exampleDe": "Ich kann meinen Stift nicht finden." },
        { "native": "beginnen", "foreign": "to begin / to start", "example": "The lesson begins now.", "exampleDe": "Die Stunde beginnt jetzt." },
        { "native": "vergessen", "foreign": "to forget", "example": "Don't forget your homework.", "exampleDe": "Vergiss deine Hausaufgaben nicht." },
        { "native": "brauchen", "foreign": "to need", "example": "I need a rubber.", "exampleDe": "Ich brauche einen Radiergummi." },
        { "native": "wissen", "foreign": "to know (a fact)", "example": "I don't know the answer.", "exampleDe": "Ich weiß die Antwort nicht." },
        { "native": "kennen", "foreign": "to know (a person/place)", "example": "Do you know my friend?", "exampleDe": "Kennst du meinen Freund?" },
        { "native": "lieben", "foreign": "to love", "example": "I love my family.", "exampleDe": "Ich liebe meine Familie." },
        { "native": "mögen", "foreign": "to like", "example": "I like chocolate.", "exampleDe": "Ich mag Schokolade." },
        { "native": "singen", "foreign": "to sing", "example": "We sing a song.", "exampleDe": "Wir singen ein Lied." },
        { "native": "tanzen", "foreign": "to dance", "example": "I like to dance.", "exampleDe": "Ich tanze gerne." },
        { "native": "malen", "foreign": "to paint / to draw", "example": "I paint a picture.", "exampleDe": "Ich male ein Bild." },
        { "native": "schwimmen", "foreign": "to swim", "example": "I can swim.", "exampleDe": "Ich kann schwimmen." },
        { "native": "fahren", "foreign": "to drive / to ride / to go (by vehicle)", "example": "We drive to school.", "exampleDe": "Wir fahren zur Schule." },
        { "native": "fliegen", "foreign": "to fly", "example": "Birds can fly.", "exampleDe": "Vögel können fliegen." },

        { "native": "groß", "foreign": "big / tall", "example": "The house is big.", "exampleDe": "Das Haus ist groß." },
        { "native": "klein", "foreign": "small / little", "example": "The mouse is small.", "exampleDe": "Die Maus ist klein." },
        { "native": "neu", "foreign": "new", "example": "I have a new book.", "exampleDe": "Ich habe ein neues Buch." },
        { "native": "alt", "foreign": "old", "example": "The castle is old.", "exampleDe": "Die Burg ist alt." },
        { "native": "jung", "foreign": "young", "example": "She is very young.", "exampleDe": "Sie ist sehr jung." },
        { "native": "schnell", "foreign": "fast / quick", "example": "The car is fast.", "exampleDe": "Das Auto ist schnell." },
        { "native": "langsam", "foreign": "slow", "example": "The snail is slow.", "exampleDe": "Die Schnecke ist langsam." },
        { "native": "schön", "foreign": "beautiful / nice", "example": "The flower is beautiful.", "exampleDe": "Die Blume ist schön." },
        { "native": "hässlich", "foreign": "ugly", "example": "The monster is ugly.", "exampleDe": "Das Monster ist hässlich." },
        { "native": "lang", "foreign": "long", "example": "The river is long.", "exampleDe": "Der Fluss ist lang." },
        { "native": "kurz", "foreign": "short", "example": "The break is short.", "exampleDe": "Die Pause ist kurz." },
        { "native": "leise", "foreign": "quiet", "example": "Be quiet, please.", "exampleDe": "Sei bitte leise." },
        { "native": "laut", "foreign": "loud", "example": "The music is too loud.", "exampleDe": "Die Musik ist zu laut." },
        { "native": "stark", "foreign": "strong", "example": "The man is strong.", "exampleDe": "Der Mann ist stark." },
        { "native": "schwach", "foreign": "weak", "example": "I feel weak today.", "exampleDe": "Ich fühle mich heute schwach." },
        { "native": "hell", "foreign": "bright / light", "example": "The room is bright.", "exampleDe": "Das Zimmer ist hell." },
        { "native": "dunkel", "foreign": "dark", "example": "It is dark outside.", "exampleDe": "Es ist draußen dunkel." },
        { "native": "nass", "foreign": "wet", "example": "The grass is wet.", "exampleDe": "Das Gras ist nass." },
        { "native": "trocken", "foreign": "dry", "example": "The towel is dry.", "exampleDe": "Das Handtuch ist trocken." },
        { "native": "sauber", "foreign": "clean", "example": "The room is clean.", "exampleDe": "Das Zimmer ist sauber." },
        { "native": "schmutzig", "foreign": "dirty", "example": "My shoes are dirty.", "exampleDe": "Meine Schuhe sind schmutzig." },
        { "native": "richtig", "foreign": "right / correct", "example": "The answer is correct.", "exampleDe": "Die Antwort ist richtig." },
        { "native": "falsch", "foreign": "wrong / false", "example": "That is wrong.", "exampleDe": "Das ist falsch." },
        { "native": "schwer", "foreign": "heavy / difficult", "example": "The bag is heavy.", "exampleDe": "Die Tasche ist schwer." },
        { "native": "leicht", "foreign": "light / easy", "example": "The task is easy.", "exampleDe": "Die Aufgabe ist leicht." },
        { "native": "voll", "foreign": "full", "example": "The glass is full.", "exampleDe": "Das Glas ist voll." },
        { "native": "leer", "foreign": "empty", "example": "The box is empty.", "exampleDe": "Die Schachtel ist leer." },
        { "native": "billig", "foreign": "cheap", "example": "This is cheap.", "exampleDe": "Das ist billig." },
        { "native": "teuer", "foreign": "expensive", "example": "The bike is expensive.", "exampleDe": "Das Fahrrad ist teuer." },
        { "native": "bunt", "foreign": "colourful", "example": "The butterfly is colourful.", "exampleDe": "Der Schmetterling ist bunt." },
        { "native": "nett", "foreign": "nice / kind", "example": "She is very nice.", "exampleDe": "Sie ist sehr nett." },
        { "native": "böse", "foreign": "angry / mean", "example": "He is angry.", "exampleDe": "Er ist böse." },
        { "native": "lieb", "foreign": "dear / kind / sweet", "example": "The dog is very sweet.", "exampleDe": "Der Hund ist sehr lieb." },
        { "native": "gefährlich", "foreign": "dangerous", "example": "Crocodiles are dangerous.", "exampleDe": "Krokodile sind gefährlich." },

        { "native": "braun", "foreign": "brown", "example": "The dog is brown.", "exampleDe": "Der Hund ist braun." },
        { "native": "grau", "foreign": "grey", "example": "The sky is grey.", "exampleDe": "Der Himmel ist grau." },
        { "native": "orange", "foreign": "orange", "example": "The pumpkin is orange.", "exampleDe": "Der Kürbis ist orange." },
        { "native": "rosa / pink", "foreign": "pink", "example": "The flower is pink.", "exampleDe": "Die Blume ist rosa." },
        { "native": "lila", "foreign": "purple", "example": "My pencil case is purple.", "exampleDe": "Mein Mäppchen ist lila." },

        { "native": "der Onkel", "foreign": "uncle", "example": "My uncle lives in London.", "exampleDe": "Mein Onkel lebt in London." },
        { "native": "die Tante", "foreign": "aunt", "example": "My aunt has two children.", "exampleDe": "Meine Tante hat zwei Kinder." },
        { "native": "der Cousin", "foreign": "cousin (male)", "example": "My cousin is 11.", "exampleDe": "Mein Cousin ist 11." },
        { "native": "die Cousine", "foreign": "cousin (female)", "example": "My cousin plays tennis.", "exampleDe": "Meine Cousine spielt Tennis." },
        { "native": "das Baby", "foreign": "baby", "example": "The baby is sleeping.", "exampleDe": "Das Baby schläft." },
        { "native": "der Nachbar", "foreign": "neighbour", "example": "Our neighbour is friendly.", "exampleDe": "Unser Nachbar ist freundlich." },

        { "native": "der Baum", "foreign": "tree", "example": "The tree is tall.", "exampleDe": "Der Baum ist groß." },
        { "native": "die Blume", "foreign": "flower", "example": "The flower is beautiful.", "exampleDe": "Die Blume ist schön." },
        { "native": "die Wiese", "foreign": "meadow", "example": "We play on the meadow.", "exampleDe": "Wir spielen auf der Wiese." },
        { "native": "der See", "foreign": "lake", "example": "We swim in the lake.", "exampleDe": "Wir schwimmen im See." },
        { "native": "der Fluss", "foreign": "river", "example": "The river is long.", "exampleDe": "Der Fluss ist lang." },
        { "native": "der Berg", "foreign": "mountain", "example": "The mountain is high.", "exampleDe": "Der Berg ist hoch." },
        { "native": "der Wald", "foreign": "forest / wood", "example": "We walk in the forest.", "exampleDe": "Wir gehen im Wald spazieren." },
        { "native": "der Strand", "foreign": "beach", "example": "We go to the beach.", "exampleDe": "Wir gehen an den Strand." },
        { "native": "das Meer", "foreign": "sea", "example": "The sea is blue.", "exampleDe": "Das Meer ist blau." },
        { "native": "die Luft", "foreign": "air", "example": "The air is fresh.", "exampleDe": "Die Luft ist frisch." },
        { "native": "der Himmel", "foreign": "sky", "example": "The sky is blue.", "exampleDe": "Der Himmel ist blau." },
        { "native": "der Stern", "foreign": "star", "example": "I can see the stars.", "exampleDe": "Ich kann die Sterne sehen." },
        { "native": "der Mond", "foreign": "moon", "example": "The moon shines at night.", "exampleDe": "Der Mond scheint in der Nacht." },

        { "native": "der Park", "foreign": "park", "example": "We play in the park.", "exampleDe": "Wir spielen im Park." },
        { "native": "die Straße", "foreign": "street / road", "example": "Cross the street carefully.", "exampleDe": "Überquere die Straße vorsichtig." },
        { "native": "der Spielplatz", "foreign": "playground", "example": "The children are at the playground.", "exampleDe": "Die Kinder sind auf dem Spielplatz." },
        { "native": "das Schwimmbad", "foreign": "swimming pool", "example": "We go to the swimming pool.", "exampleDe": "Wir gehen ins Schwimmbad." },
        { "native": "die Kirche", "foreign": "church", "example": "The church is old.", "exampleDe": "Die Kirche ist alt." },
        { "native": "das Rathaus", "foreign": "town hall", "example": "The town hall is in the centre.", "exampleDe": "Das Rathaus ist im Zentrum." },
        { "native": "die Stadt", "foreign": "city / town", "example": "I live in a big city.", "exampleDe": "Ich wohne in einer großen Stadt." },
        { "native": "das Dorf", "foreign": "village", "example": "The village is small.", "exampleDe": "Das Dorf ist klein." },
        { "native": "das Land", "foreign": "country / countryside", "example": "We live in the countryside.", "exampleDe": "Wir wohnen auf dem Land." },
        { "native": "England", "foreign": "England", "example": "London is in England.", "exampleDe": "London ist in England." },
        { "native": "Deutschland", "foreign": "Germany", "example": "Germany is in Europe.", "exampleDe": "Deutschland ist in Europa." },
        { "native": "Österreich", "foreign": "Austria", "example": "Vienna is in Austria.", "exampleDe": "Wien ist in Österreich." },

        { "native": "die Ferien", "foreign": "holidays / vacation", "example": "The holidays start next week.", "exampleDe": "Die Ferien beginnen nächste Woche." },
        { "native": "Weihnachten", "foreign": "Christmas", "example": "We get presents at Christmas.", "exampleDe": "Wir bekommen Geschenke zu Weihnachten." },
        { "native": "Ostern", "foreign": "Easter", "example": "We paint eggs at Easter.", "exampleDe": "Wir bemalen Eier zu Ostern." },
        { "native": "das Lied", "foreign": "song", "example": "We sing a song.", "exampleDe": "Wir singen ein Lied." },
        { "native": "das Bild", "foreign": "picture", "example": "I draw a picture.", "exampleDe": "Ich male ein Bild." },
        { "native": "die Geschichte", "foreign": "story / history", "example": "Tell me a story.", "exampleDe": "Erzähl mir eine Geschichte." },
        { "native": "die Aufgabe", "foreign": "task / exercise", "example": "Do the exercise.", "exampleDe": "Mach die Aufgabe." },
        { "native": "die Antwort", "foreign": "answer", "example": "The answer is correct.", "exampleDe": "Die Antwort ist richtig." },
        { "native": "die Frage", "foreign": "question", "example": "I have a question.", "exampleDe": "Ich habe eine Frage." },
        { "native": "das Wort", "foreign": "word", "example": "Learn the new words.", "exampleDe": "Lern die neuen Wörter." },
        { "native": "der Satz", "foreign": "sentence", "example": "Write a sentence.", "exampleDe": "Schreib einen Satz." },
        { "native": "der Fehler", "foreign": "mistake / error", "example": "I made a mistake.", "exampleDe": "Ich habe einen Fehler gemacht." },

        { "native": "wer", "foreign": "who", "example": "Who is that?", "exampleDe": "Wer ist das?" },
        { "native": "was", "foreign": "what", "example": "What is that?", "exampleDe": "Was ist das?" },
        { "native": "wo", "foreign": "where", "example": "Where is the school?", "exampleDe": "Wo ist die Schule?" },
        { "native": "wann", "foreign": "when", "example": "When does the lesson start?", "exampleDe": "Wann beginnt der Unterricht?" },
        { "native": "warum", "foreign": "why", "example": "Why are you late?", "exampleDe": "Warum bist du zu spät?" },
        { "native": "wie", "foreign": "how", "example": "How do you spell that?", "exampleDe": "Wie buchstabiert man das?" },
        { "native": "wie viel", "foreign": "how much / how many", "example": "How much does it cost?", "exampleDe": "Wie viel kostet das?" },
        { "native": "welcher / welche / welches", "foreign": "which", "example": "Which colour do you like?", "exampleDe": "Welche Farbe magst du?" },

        { "native": "und", "foreign": "and", "example": "Tom and Anna are friends.", "exampleDe": "Tom und Anna sind Freunde." },
        { "native": "oder", "foreign": "or", "example": "Tea or coffee?", "exampleDe": "Tee oder Kaffee?" },
        { "native": "aber", "foreign": "but", "example": "I like cats, but I have a dog.", "exampleDe": "Ich mag Katzen, aber ich habe einen Hund." },
        { "native": "weil", "foreign": "because", "example": "I stay home because I am ill.", "exampleDe": "Ich bleibe zu Hause, weil ich krank bin." },
        { "native": "auch", "foreign": "also / too", "example": "I like that too.", "exampleDe": "Das mag ich auch." },
        { "native": "schon", "foreign": "already", "example": "I have already finished.", "exampleDe": "Ich bin schon fertig." },
        { "native": "noch", "foreign": "still / yet", "example": "Are you still here?", "exampleDe": "Bist du noch hier?" },
        { "native": "sehr", "foreign": "very", "example": "I am very happy.", "exampleDe": "Ich bin sehr glücklich." },
        { "native": "viel", "foreign": "much / a lot", "example": "I have a lot of homework.", "exampleDe": "Ich habe viele Hausaufgaben." },
        { "native": "wenig", "foreign": "little / few", "example": "I have little time.", "exampleDe": "Ich habe wenig Zeit." },
        { "native": "hier", "foreign": "here", "example": "Come here!", "exampleDe": "Komm her!" },
        { "native": "dort", "foreign": "there", "example": "The school is over there.", "exampleDe": "Die Schule ist dort drüben." },
        { "native": "dann", "foreign": "then", "example": "First homework, then play.", "exampleDe": "Erst Hausaufgaben, dann spielen." },
        { "native": "jetzt", "foreign": "now", "example": "Come now!", "exampleDe": "Komm jetzt!" },
        { "native": "zusammen", "foreign": "together", "example": "We play together.", "exampleDe": "Wir spielen zusammen." },
        { "native": "allein", "foreign": "alone", "example": "I do it alone.", "exampleDe": "Ich mache es allein." },
        { "native": "wieder", "foreign": "again", "example": "Say it again, please.", "exampleDe": "Sag es bitte nochmal." },

        { "native": "Setzen Sie sich / Setzt euch", "foreign": "Sit down", "example": "Sit down, please.", "exampleDe": "Setzt euch bitte." },
        { "native": "Steht auf", "foreign": "Stand up", "example": "Stand up, everyone.", "exampleDe": "Steht alle auf." },
        { "native": "Hört zu", "foreign": "Listen", "example": "Listen carefully.", "exampleDe": "Hört genau zu." },
        { "native": "Schaut an die Tafel", "foreign": "Look at the board", "example": "Look at the board, please.", "exampleDe": "Schaut bitte an die Tafel." },
        { "native": "Schlagt die Bücher auf", "foreign": "Open your books", "example": "Open your books on page 12.", "exampleDe": "Schlagt die Bücher auf Seite 12 auf." },
        { "native": "Ruhe bitte", "foreign": "Quiet please", "example": "Quiet please, the test starts.", "exampleDe": "Ruhe bitte, der Test beginnt." },
        { "native": "Arbeitet zu zweit", "foreign": "Work in pairs", "example": "Work in pairs on this task.", "exampleDe": "Arbeitet zu zweit an dieser Aufgabe." },
        { "native": "Darf ich auf die Toilette?", "foreign": "May I go to the toilet?", "example": "May I go to the toilet, please?", "exampleDe": "Darf ich bitte auf die Toilette?" },

        { "native": "der Fels / Felsen", "foreign": "rock", "example": "We sit on the rock.", "exampleDe": "Wir sitzen auf dem Felsen." },
        { "native": "eine SMS schicken", "foreign": "to text", "example": "I wake up, have breakfast, and then I text my friends.", "exampleDe": "Ich stehe auf, frühstücke und dann schicke ich meinen Freunden eine SMS." },
        { "native": "segeln gehen", "foreign": "to go sailing", "example": "Abby and Maya go sailing at the Sailing Club.", "exampleDe": "Abby und Maya gehen im Segelclub segeln." },
        { "native": "die Zeitung", "foreign": "paper / newspaper", "example": "Dad reads the paper every morning.", "exampleDe": "Papa liest jeden Morgen die Zeitung." },
        { "native": "am Wochenende", "foreign": "at the weekend", "example": "There's no school at weekends.", "exampleDe": "Am Wochenende ist keine Schule." },
        { "native": "nachts / in der Nacht", "foreign": "at night", "example": "Our cat always sleeps on the sofa at night.", "exampleDe": "Unsere Katze schläft nachts immer auf dem Sofa." },
        { "native": "am Morgen", "foreign": "in the morning", "example": "I get up early in the morning.", "exampleDe": "Ich stehe morgens früh auf." },
        { "native": "am Nachmittag", "foreign": "in the afternoon", "example": "I do my homework in the afternoon.", "exampleDe": "Ich mache am Nachmittag meine Hausaufgaben." },
        { "native": "am Abend", "foreign": "in the evening", "example": "We watch TV in the evening.", "exampleDe": "Wir sehen am Abend fern." },
        { "native": "füttern", "foreign": "to feed", "example": "Can I feed the rabbits?", "exampleDe": "Darf ich die Kaninchen füttern?" },
        { "native": "kein / keine", "foreign": "no / not any", "example": "There's no school at weekends.", "exampleDe": "Am Wochenende ist keine Schule." },
        { "native": "uns", "foreign": "us", "example": "We're here. Can you see us? Please help us.", "exampleDe": "Wir sind hier. Kannst du uns sehen? Bitte hilf uns." },
        { "native": "natürlich / selbstverständlich", "foreign": "of course", "example": "Of course I can help you.", "exampleDe": "Natürlich kann ich dir helfen." },
        { "native": "der Korb", "foreign": "basket", "example": "My dog Ben always sleeps in his basket.", "exampleDe": "Mein Hund Ben schläft immer in seinem Korb." },
        { "native": "der Fußboden", "foreign": "floor", "example": "My dog sleeps in his basket on the floor.", "exampleDe": "Mein Hund schläft in seinem Korb auf dem Fußboden." },
        { "native": "der Pokal / die Trophäe", "foreign": "trophy / trophies", "example": "He has many trophies.", "exampleDe": "Er hat viele Pokale." },
        { "native": "weg / fort", "foreign": "away", "example": "Go away!", "exampleDe": "Geh weg!" },
        { "native": "verrückt", "foreign": "mad", "example": "That's mad!", "exampleDe": "Das ist verrückt!" },
        { "native": "denken / glauben", "foreign": "to think", "example": "I think Silky is nice.", "exampleDe": "Ich finde Silky nett." },
        { "native": "so (cool/nett/...)", "foreign": "so (cool/nice/...)", "example": "That's so cool!", "exampleDe": "Das ist so cool!" },
        { "native": "spazieren gehen", "foreign": "to go for a walk", "example": "We go for a walk in the park.", "exampleDe": "Wir gehen im Park spazieren." },
        { "native": "die Aussprache", "foreign": "pronunciation", "example": "Your pronunciation is very good.", "exampleDe": "Deine Aussprache ist sehr gut." },
        { "native": "rennen", "foreign": "to run", "example": "Don't run in the corridor!", "exampleDe": "Renne nicht im Flur!" },
        { "native": "Sport treiben", "foreign": "to do sport", "example": "On Saturdays, I always do sport.", "exampleDe": "Samstags treibe ich immer Sport." },
        { "native": "die Sportart", "foreign": "sport (type of)", "example": "Football is a popular sport.", "exampleDe": "Fußball ist eine beliebte Sportart." },
        { "native": "in der Nähe", "foreign": "near here", "example": "Is there a sports shop near here?", "exampleDe": "Gibt es hier in der Nähe ein Sportgeschäft?" },
        { "native": "keine Zeit haben", "foreign": "to not have time", "example": "He doesn't have time.", "exampleDe": "Er hat keine Zeit." },
        { "native": "das Boot", "foreign": "boat", "example": "We go on a boat.", "exampleDe": "Wir fahren mit dem Boot." },
        { "native": "das Schwimmbecken", "foreign": "pool", "example": "The pool is big.", "exampleDe": "Das Schwimmbecken ist groß." },
        { "native": "sie (Objekt)", "foreign": "her", "example": "Look, there's Abby. Can you see her?", "exampleDe": "Schau, da ist Abby. Kannst du sie sehen?" },
        { "native": "aufwachen", "foreign": "to wake up", "example": "I wake up at seven.", "exampleDe": "Ich wache um sieben auf." },
        { "native": "hundertsechsundachtzig", "foreign": "one hundred and eighty-six", "example": "Page one hundred and eighty-six.", "exampleDe": "Seite hundertsechsundachtzig." }
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
    lastGoalDate: null,   // Date when the goal was last reached
    dailyStats: {},
    dailyCorrect: 0,      // Today's correct count toward daily goal
    goalReached: false,   // Whether today's goal is complete
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
      // Check for duplicates by native+foreign before creating new
      const duplicate = state.vocabulary.find(v =>
        v.native.toLowerCase().trim() === vocab.native.toLowerCase().trim() &&
        v.foreign.toLowerCase().trim() === vocab.foreign.toLowerCase().trim()
      );
      if (duplicate) {
        // Update existing instead of creating duplicate
        vocab.id = duplicate.id;
        vocab.createdAt = duplicate.createdAt;
      } else {
        vocab.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
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

    // New day detection
    if (state.stats.lastStudyDate !== today) {
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

        // Streak logic
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.stats.lastGoalDate === yesterdayStr) {
          state.stats.streak++;
        } else if (state.stats.lastGoalDate !== today) {
          state.stats.streak = 1;
        }

        state.stats.lastGoalDate = today;
        console.log('Daily goal reached! Streak:', state.stats.streak);
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

    // Reset daily counters for new day
    if (state.stats.lastStudyDate && state.stats.lastStudyDate !== today) {
      state.stats.dailyCorrect = 0;
      state.stats.goalReached = false;
    }

    // Reset streak if last goal reached was before yesterday
    if (state.stats.lastGoalDate &&
      state.stats.lastGoalDate !== today &&
      state.stats.lastGoalDate !== yesterdayStr) {
      state.stats.streak = 0;
    }

    // Prune dailyStats older than 90 days to prevent unbounded growth
    if (state.stats.dailyStats) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      for (const date of Object.keys(state.stats.dailyStats)) {
        if (date < cutoffStr) {
          delete state.stats.dailyStats[date];
        }
      }
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
      let newCount = 0;

      for (const category of vocabData.categories) {
        for (const word of category.words) {
          // Find existing word by native term AND category to avoid cross-category overwrites
          const existing = state.vocabulary.find(v => v.native === word.native && v.category === category.name)
            || state.vocabulary.find(v => v.native === word.native && v.foreign === word.foreign);

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
          } else {
            // WORT FEHLT -> NEU HINZUFÜGEN
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
            newCount++;
          }
        }
      }

      if (updateCount > 0 || newCount > 0) {
        console.log(`Updated ${updateCount} and added ${newCount} vocabulary definitions`);
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
  getDueCards(onlySelected = false) {
    const now = new Date();
    return state.vocabulary.filter(vocab => {
      if (onlySelected && !state.selectedWords.has(vocab.id)) return false;
      const progress = state.progress[vocab.id];
      if (!progress || !progress.nextReview) return false;
      return new Date(progress.nextReview) <= now;
    });
  },

  // Neue Karten (noch nie gelernt)
  getNewCards(onlySelected = false) {
    return state.vocabulary.filter(vocab => {
      if (onlySelected && !state.selectedWords.has(vocab.id)) return false;
      return !state.progress[vocab.id];
    });
  },

  // Fehlerkarten (letzte Antwort falsch oder niedriges Level)
  getErrorCards(onlySelected = false) {
    return state.vocabulary.filter(vocab => {
      if (onlySelected && !state.selectedWords.has(vocab.id)) return false;
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

  // Import aus CSV (Format: native;foreign;example;exampleDe;category;difficulty)
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
              let vocab;
              if (parts.length === 5) {
                // Old 5-column format: native;foreign;example;category;difficulty
                vocab = {
                  native: parts[0],
                  foreign: parts[1],
                  example: parts[2] || '',
                  exampleDe: '',
                  category: parts[3] || 'Eigene Wörter',
                  difficulty: parseInt(parts[4]) || 1,
                  note: ''
                };
              } else {
                // New 6-column format: native;foreign;example;exampleDe;category;difficulty
                vocab = {
                  native: parts[0],
                  foreign: parts[1],
                  example: parts[2] || '',
                  exampleDe: parts[3] || '',
                  category: parts[4] || 'Eigene Wörter',
                  difficulty: parseInt(parts[5]) || 1,
                  note: parts[6] || ''
                };
              }
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
  },

  // Download CSV Template
  downloadCSVTemplate() {
    const headers = 'native;foreign;example;exampleDe;category;difficulty';
    const example = 'Haus;house;The house is big.;Das Haus ist groß.;Eigene Wörter;1';
    const csvContent = `${headers}\n${example}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vokabel-template.csv';
    a.click();
    URL.revokeObjectURL(url);
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
        <h2 id="modal-title">${Utils.escapeHtml(title)}</h2>
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
    this.overlay.setAttribute('aria-hidden', 'false');

    // Focus trap
    const focusable = modal.querySelectorAll('button, input, select, textarea');
    if (focusable.length) focusable[0].focus();
  },

  close() {
    this.overlay.classList.remove('active');
    this.overlay.setAttribute('aria-hidden', 'true');
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

    const masteredCount = Object.values(state.progress).filter(p => p.level >= 5).length;
    const learningCount = Object.keys(state.progress).length;
    const dueCount = DataManager.getDueCards().length;
    const totalVocab = state.vocabulary.length;
    // Gesamtfortschritt: Summe aller Level / (Anzahl Vokabeln * Max-Level)
    const maxLevel = CONFIG.INTERVALS.length - 1;
    const totalLevelSum = Object.values(state.progress).reduce((sum, p) => sum + p.level, 0);
    const overallProgress = totalVocab > 0 ? Math.round((totalLevelSum / (totalVocab * maxLevel)) * 100) : 0;

    container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <div class="greeting">
            <h1 class="greeting-title">Hallo! 👋</h1>
            <p class="greeting-subtitle">Bereit für dein Training?</p>
          </div>
        </div>

        ${streak > 0 ? `
          <div class="home-streak-card">
            <div class="streak-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M5 12l5 5l10 -10"></path>
              </svg>
            </div>
            <div class="streak-info">
              <span class="streak-count">${streak}</span>
              <span class="streak-subtitle">Tage in Folge</span>
            </div>
          </div>
        ` : ''}

        <div class="dashboard-grid">
          <!-- Tagesziel Card -->
          <div class="db-card goal-card ${goalReached ? 'reached' : ''}">
            <div class="db-card-header">
              <span class="db-card-icon">🎯</span>
              <h3>Tagesziel</h3>
            </div>
            <div class="goal-progress-container">
              <svg class="goal-ring" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="45"></circle>
                <circle class="ring-fill" cx="50" cy="50" r="45" 
                        style="stroke-dasharray: ${282 * (progressPercent / 100)}, 282"></circle>
              </svg>
              <div class="goal-text">
                <span class="goal-current">${dailyCorrect}</span>
                <span class="goal-total">/ ${CONFIG.DAILY_GOAL}</span>
              </div>
            </div>
            <p class="db-card-footer">${goalReached ? 'Ziel erreicht! 🎉' : `Noch ${CONFIG.DAILY_GOAL - dailyCorrect} Wörter`}</p>
          </div>

          <!-- Fortschritt Card -->
          <div class="db-card progress-card">
            <div class="db-card-header">
              <span class="db-card-icon">📊</span>
              <h3>Fortschritt</h3>
            </div>
            <div class="stats-mini-grid">
              <div class="mini-stat-item">
                <span class="val">${dueCount}</span>
                <span class="lbl">Fällig</span>
              </div>
              <div class="mini-stat-item">
                <span class="val">${learningCount}</span>
                <span class="lbl">Gelernt</span>
              </div>
              <div class="mini-stat-item">
                <span class="val">${masteredCount}</span>
                <span class="lbl">Meister</span>
              </div>
            </div>
            <div class="mastery-bar-container">
               <div class="mastery-label">Fortschritt: ${overallProgress}%${masteredCount > 0 ? ` · ${masteredCount} gemeistert` : ''}</div>
               <div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${overallProgress}%"></div></div>
            </div>
          </div>
        </div>

        <!-- Continue Action removed -->

        <div class="main-actions">
          <button class="action-button primary" onclick="HomeView.quickStart()">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <path d="M13 3l0 10l8 0l-11 11l0 -10l-8 0z" />
              </svg>
            </span>
            <div class="text">
               <span class="title">Sitzung starten</span>
               <span class="desc">Quick-Start Modus</span>
            </div>
          </button>
          
          <button class="action-button secondary" onclick="Views.show('learn')">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" />
              </svg>
            </span>
             <div class="text">
               <span class="title">Lernmodus wählen</span>
               <span class="desc">Flashcards, MC, Tippen</span>
            </div>
          </button>
        </div>

        <div class="recent-stats card">
           <div class="card-header-simple">Deine Erfolge</div>
           <div class="quick-stats">
              <div class="qs-item">
                 <span class="qs-val">${state.stats.totalReviews || 0}</span>
                 <span class="qs-lbl">Antworten</span>
              </div>
              <div class="qs-item">
                 <span class="qs-val">${state.stats.correctAnswers || 0}</span>
                 <span class="qs-lbl">Richtig</span>
              </div>
              <div class="qs-item">
                 <span class="qs-val">${state.stats.totalReviews > 0 ? Math.round((state.stats.correctAnswers / state.stats.totalReviews) * 100) : 0}%</span>
                 <span class="qs-lbl">Genauigkeit</span>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 5l0 14" /><path d="M17 10l2 2l-2 2" /><path d="M7 10l-2 2l2 2" /><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
            </svg>
            <span class="mode-card-title">Karteikarten</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('mc')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3l8 -8" /><path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
            </svg>
            <span class="mode-card-title">Multiple Choice</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('typing')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 5h18v14h-18z" /><path d="M7 15h10" /><path d="M7 10h1" /><path d="M11 10h1" /><path d="M15 10h1" />
            </svg>
            <span class="mode-card-title">Tippen</span>
          </button>
          <button class="mode-card" onclick="LearnView.selectMode('dictation')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" />
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

    // If the cardSet is algorithmic (due, new, errors), we priorityze those over manual selection
    // if the manual selection is empty. If a selection exists, we still respect it unless it's empty.
    const respectSelection = (session.cardSet === 'all' || selectedCount > 0);

    switch (session.cardSet) {
      case 'due':
        cards = DataManager.getDueCards(!respectSelection ? false : true);
        break;
      case 'new':
        cards = DataManager.getNewCards(!respectSelection ? false : true);
        break;
      case 'errors':
        cards = DataManager.getErrorCards(!respectSelection ? false : true);
        break;
      case 'all':
      default:
        cards = state.vocabulary.filter(v => state.selectedWords.has(v.id));
    }

    if (cards.length === 0 && selectedCount === 0) {
      Toast.show('Keine Wörter verfügbar. Füge Vokabeln hinzu oder wähle sie aus.', 'info');
      return;
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
      <div class="flashcard-action-buttons" id="flashcard-actions" style="display: none;">
        <button class="btn btn-lg" style="flex: 1; background: var(--color-error); color: white; border: none; padding: 1rem; border-radius: var(--radius-lg); font-weight: 600; font-size: 1rem;" onclick="LearnView.answer(false)" aria-label="Nicht gewusst">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22" style="margin-right: 0.5rem; vertical-align: middle;">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Nicht gewusst
        </button>
        <button class="understood-btn" onclick="LearnView.answer(true)" aria-label="Gewusst" style="flex: 1;">
          <p class="understood-btn__text">
            <span style="--index: 0;">G</span>
            <span style="--index: 1;">E</span>
            <span style="--index: 2;">W</span>
            <span style="--index: 3;">U</span>
            <span style="--index: 4;">S</span>
            <span style="--index: 5;">S</span>
            <span style="--index: 6;">T</span>
            <span style="--index: 7;"> </span>
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
    const placeholder = isDeEn ? 'English translation...' : 'Deutsche Übersetzung...';

    container.innerHTML = `
      <div class="typing-question">
        <div class="text-muted mb-sm">Übersetze...</div>
        <div>${this.escapeHtml(qa.question)}</div>
      </div>
      <div class="typing-input-wrapper">
        <input type="text" class="form-input typing-input" id="typing-answer"
               placeholder="${placeholder}" autocomplete="off" autocapitalize="off" autofocus>
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="LearnView.checkTypingAnswer('${this.escapeAttr(qa.answer)}')">
        Prüfen
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
        <button class="speak-btn" onclick="LearnView.speakWithLang('${this.escapeAttr(qa.answer)}', '${this.escapeAttr(qa.answerLang)}')"
                ${!speechAvailable ? 'disabled title="Sprachausgabe nicht verfügbar"' : ''}
                aria-label="Wort anhören">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p class="text-muted">${speechAvailable ? 'Tippe zum Anhören' : 'Sprachausgabe nicht verfügbar'}</p>
      </div>
      <div class="typing-question">
        <div class="text-muted mb-sm">Schreibe das gehörte Wort</div>
        ${!speechAvailable ? `<div class="text-muted" style="font-size: 0.875rem;">Hinweis: ${this.escapeHtml(qa.question)}</div>` : ''}
      </div>
      <div class="typing-input-wrapper">
        <input type="text" class="form-input typing-input" id="dictation-answer"
               placeholder="Deine Antwort..." autocomplete="off" autocapitalize="off">
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="LearnView.checkDictationAnswer('${this.escapeAttr(qa.answer)}')">
        Prüfen
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
              <button class="btn btn-primary" onclick="LearnView.restartSession()">
                Nochmal
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  restartSession() {
    // Re-initialize session with same mode and card set for "Nochmal"
    if (!state.currentSession) {
      // Fallback: go back to learn menu
      this.init();
      return;
    }
    state.currentCardIndex = 0;
    state.sessionResults = [];
    // Re-shuffle cards
    state.currentSession.cards = this.shuffle(state.currentSession.cards);
    this.renderExercise();
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
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
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

    // Auswahl pro Kategorie berechnen
    const selectionByCategory = {};
    state.vocabulary.forEach(v => {
      const cat = v.category || 'Ohne Kategorie';
      if (!selectionByCategory[cat]) selectionByCategory[cat] = { total: 0, selected: 0 };
      selectionByCategory[cat].total++;
      if (state.selectedWords.has(v.id)) selectionByCategory[cat].selected++;
    });
    const totalSelected = state.vocabulary.filter(v => state.selectedWords.has(v.id)).length;
    const selectedCategories = Object.entries(selectionByCategory).filter(([, s]) => s.selected > 0);

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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" />
        </svg>
        <input type="text" class="form-input search-input" placeholder="Suchen..."
               value="${this.escapeHtml(this.filter)}" oninput="WordsView.setFilter(this.value)">
      </div>

      ${categories.length > 0 ? `
        <div class="filter-chips">
          <button class="filter-chip ${!this.category ? 'active' : ''}" onclick="WordsView.setCategory('')">Alle</button>
          ${categories.map(cat => {
            const s = selectionByCategory[cat] || { selected: 0, total: 0 };
            return `
            <button class="filter-chip ${this.category === cat ? 'active' : ''} ${s.selected > 0 ? 'has-selection' : ''}"
                    onclick="WordsView.setCategory('${this.escapeAttr(cat)}')">
              ${this.escapeHtml(cat)}${s.selected > 0 ? ` <span class="chip-count">${s.selected}</span>` : ''}
            </button>`;
          }).join('')}
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); gap: var(--space-xs); flex-wrap: wrap;">
        <span class="text-muted">${filtered.length} Vokabeln</span>
        <div style="display: flex; gap: var(--space-xs);">
          <button class="btn btn-primary" onclick="WordsView.showAddModal('Eigene Wörter')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5l0 14" /><path d="M5 12l14 0" />
            </svg>
            Eigenes Wort
          </button>
        </div>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" />
          </svg>
          <h3>Keine Vokabeln</h3>
          <p>${this.filter || this.category ? 'Keine Treffer für diese Filter.' : 'Füge deine ersten Vokabeln hinzu!'}</p>
        </div>
      ` : `
        <div class="vocab-list">
          ${filtered.map(vocab => this.renderVocabItem(vocab)).join('')}
        </div>
      `}

      ${totalSelected > 0 ? `
        <div class="selection-sticky-bar">
          <div class="selection-sticky-info">
            <span class="selection-sticky-count">${totalSelected}</span>
            <span class="selection-sticky-label">ausgewählt</span>
          </div>
          <div class="selection-sticky-chips">
            ${selectedCategories.map(([cat, s]) => `<span class="selection-sticky-chip">${this.escapeHtml(cat)} <strong>${s.selected}</strong></span>`).join('')}
          </div>
          <button class="btn btn-sm btn-ghost selection-sticky-clear" onclick="WordsView.deselectAll()" title="Alle abwählen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ` : ''}
    `;
  },

  renderVocabItem(vocab) {
    const progress = state.progress[vocab.id];
    const level = progress ? progress.level : -1;
    const isSelected = state.selectedWords.has(vocab.id);

    return `
      <div class="vocab-item ${isSelected ? 'vocab-item--selected' : ''}">
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" />
            </svg>
          </button>
          <button class="btn btn-ghost btn-icon" onclick="WordsView.deleteVocab('${vocab.id}')" aria-label="Löschen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
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

  showAddModal(defaultCategory = '') {
    Modal.open('Neue Vokabel', this.getVocabForm({}, defaultCategory), `
      <button class="btn btn-secondary" onclick="Modal.close()">Abbrechen</button>
      <button class="btn btn-primary" onclick="WordsView.saveVocab()">Speichern</button>
    `);

    document.getElementById('vocab-native').focus();
  },

  showEditModal(id) {
    const vocab = state.vocabulary.find(v => v.id === id);
    if (!vocab) return;

    Modal.open('Vokabel bearbeiten', this.getVocabForm(vocab, vocab.category), `
      <button class="btn btn-secondary" onclick="Modal.close()">Abbrechen</button>
      <button class="btn btn-primary" onclick="WordsView.saveVocab('${id}')">Speichern</button>
    `);
  },

  getVocabForm(vocab = {}, defaultCategory = '') {
    const categories = [...new Set(state.vocabulary.map(v => v.category).filter(Boolean))];
    // Ensure "Eigene Wörter" is always an option
    if (!categories.includes('Eigene Wörter')) {
      categories.unshift('Eigene Wörter');
    }
    const currentCategory = vocab.category || defaultCategory || 'Eigene Wörter';

    return `
      <form id="vocab-form" onsubmit="event.preventDefault(); WordsView.saveVocab('${vocab.id || ''}');">
        <div class="form-group">
          <label class="form-label" for="vocab-native">Deutsch *</label>
          <input type="text" class="form-input" id="vocab-native" required
                 value="${this.escapeHtml(vocab.native || '')}" placeholder="z.B. Hund">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-foreign">Englisch *</label>
          <input type="text" class="form-input" id="vocab-foreign" required
                 value="${this.escapeHtml(vocab.foreign || '')}" placeholder="z.B. dog">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-example">Beispielsatz Englisch (optional)</label>
          <textarea class="form-input" id="vocab-example" rows="2"
                    placeholder="z.B. The dog is running.">${this.escapeHtml(vocab.example || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-example-de">Beispielsatz Deutsch (optional)</label>
          <textarea class="form-input" id="vocab-example-de" rows="2"
                    placeholder="z.B. Der Hund rennt.">${this.escapeHtml(vocab.exampleDe || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-category">Kategorie</label>
          <select class="form-input" id="vocab-category-select" onchange="WordsView.onCategorySelectChange(this.value)">
            ${categories.map(cat => `
              <option value="${this.escapeHtml(cat)}" ${currentCategory === cat ? 'selected' : ''}>${this.escapeHtml(cat)}</option>
            `).join('')}
            <option value="__custom__">+ Neue Kategorie...</option>
          </select>
          <input type="text" class="form-input" id="vocab-category" style="display: none; margin-top: var(--space-xs);"
                 value="" placeholder="Neue Kategorie eingeben...">
        </div>
        <div class="form-group">
          <label class="form-label" for="vocab-difficulty">Schwierigkeit</label>
          <select class="form-input" id="vocab-difficulty">
            <option value="1" ${(vocab.difficulty || 1) === 1 ? 'selected' : ''}>Leicht</option>
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

  onCategorySelectChange(value) {
    const customInput = document.getElementById('vocab-category');
    if (value === '__custom__') {
      customInput.style.display = 'block';
      customInput.focus();
    } else {
      customInput.style.display = 'none';
      customInput.value = '';
    }
  },

  async saveVocab(id = '') {
    const native = document.getElementById('vocab-native').value.trim();
    const foreign = document.getElementById('vocab-foreign').value.trim();

    if (!native || !foreign) {
      Toast.show('Bitte fülle die Pflichtfelder aus', 'error');
      return;
    }

    // Determine category from select or custom input
    const categorySelect = document.getElementById('vocab-category-select');
    const categoryCustom = document.getElementById('vocab-category');
    let category = '';
    if (categorySelect) {
      category = categorySelect.value === '__custom__'
        ? (categoryCustom ? categoryCustom.value.trim() : '')
        : categorySelect.value;
    } else if (categoryCustom) {
      category = categoryCustom.value.trim();
    }

    const vocab = {
      id: id || undefined,
      native,
      foreign,
      example: document.getElementById('vocab-example').value.trim(),
      exampleDe: (document.getElementById('vocab-example-de') || {}).value ? document.getElementById('vocab-example-de').value.trim() : '',
      category: category || 'Eigene Wörter',
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
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
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
                <div class="vocab-item" style="border: none; padding: var(--space-sm) var(--space-md);">
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
              <span>Aktueller Streak</span>
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

    const btnPoints = `
      <span class="fold"></span>
      <div class="points_wrapper">
        <i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i>
        <i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i>
      </div>
    `;

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
            <div class="settings-item-label">Übungsrichtung</div>
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
          <button class="btn-uiverse" onclick="DataManager.exportData()">
            ${btnPoints}
            <span class="inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" />
              </svg>
              Export
            </span>
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
            <button class="btn-uiverse" onclick="document.getElementById('import-json').click()">
              ${btnPoints}
              <span class="inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />
                </svg>
                Import
              </span>
            </button>
          </div>
        </div>

        <div class="settings-item">
          <div>
            <div class="settings-item-label">CSV importieren</div>
            <div class="settings-item-desc">Format: native;foreign;example;category;difficulty</div>
          </div>
          <div class="file-input-wrapper" style="display: flex; gap: var(--space-xs);">
            <button class="btn btn-ghost btn-sm" onclick="DataManager.downloadCSVTemplate()" title="Vorlage herunterladen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />
              </svg>
            </button>
            <input type="file" class="file-input" id="import-csv" accept=".csv,.txt"
                   onchange="SettingsView.importCSV(this.files[0])">
            <button class="btn-uiverse" onclick="document.getElementById('import-csv').click()">
              ${btnPoints}
              <span class="inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 15h3l2 2l5 -5" />
                </svg>
                CSV
              </span>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />
            </svg>
            Installieren
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>Rechtliches</h3>
        <div class="settings-item">
          <div>
            <div class="settings-item-label">Impressum & Datenschutz</div>
            <div class="settings-item-desc">Gesetzliche Informationen</div>
          </div>
          <button class="btn-uiverse btn-uiverse-success" onclick="SettingsView.showLegalInfo()">
            ${btnPoints}
            <span class="inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              </svg>
              Ansehen
            </span>
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
          <button class="btn-uiverse btn-uiverse-error" onclick="SettingsView.clearAllData()">
            ${btnPoints}
            <span class="inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
              </svg>
              Löschen
            </span>
          </button>
        </div>
      </div>

      <div class="text-center text-muted mt-lg">
        <p>Vokabel Master+</p>
        <p style="font-size: 0.75rem;">Made with ❤️ for learners</p>
        <p style="font-size: 0.7rem; margin-top: var(--space-sm);"><a href="#" onclick="event.preventDefault(); SettingsView.showAGB()" style="color: var(--color-text-muted); text-decoration: underline;">AGB & Nutzungsbedingungen</a></p>
      </div>
    `;
  },

  async setTheme(theme) {
    await DataManager.saveSettings({ theme });
    // Also save to localStorage for FOUC prevention script in index.html
    localStorage.setItem('vokabel-theme', theme);
    applyTheme(theme);
  },

  showLegalInfo() {
    Modal.open('Impressum & Datenschutz', `
      <div class="legal-info" style="font-size: 0.875rem; line-height: 1.6;">
        <h4 class="mb-sm">Impressum</h4>
        <p><strong>Betreiber der Anwendung:</strong><br>
        Belkis Aslani<br>
        Vogelsangstr. 32<br>
        71691 Freiberg am Neckar</p>
        
        <p class="mt-md"><strong>Kontakt:</strong><br>
        Telefon: +49 176 81462526<br>
        E-Mail: belkis.aslani@gmail.com</p>

        <h4 class="mt-lg mb-sm">Datenschutzerklärung</h4>
        <p>Diese Anwendung ("Vokabel Master+") ist eine reine Offline-Anwendung (Progressive Web App). Alle Daten werden ausschließlich lokal in der Datenbank Ihres Webbrowsers (IndexedDB) gespeichert.</p>
        
        <p class="mt-md"><strong>Datenerhebung:</strong><br>
        Es werden keine personenbezogenen Daten an externe Server übertragen. Die von Ihnen eingegebenen Vokabeln und Lernfortschritte verbleiben auf Ihrem Gerät.</p>
        
        <p class="mt-md"><strong>Berechtigungen:</strong><br>
        Die Anwendung nutzt die Cache-Funktion Ihres Browsers (Service Worker), um offline-fähig zu sein. Hierfür werden keine persönlichen Profile erstellt.</p>
        
        <p class="mt-md"><strong>Ihre Rechte:</strong><br>
        Da alle Daten lokal gespeichert sind, können Sie diese jederzeit selbst löschen (über die App-Einstellungen unter "Daten löschen" oder durch Löschen des Browser-Caches).</p>
      </div>
    `, `
      <button class="btn btn-primary btn-block" onclick="Modal.close()">Schließen</button>
    `);
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
    await DB.clear(CONFIG.STORE_SELECTION);

    state.vocabulary = [];
    state.progress = {};
    state.selectedWords = new Set();
    state.stats = {
      totalReviews: 0,
      correctAnswers: 0,
      streak: 0,
      lastStudyDate: null,
      lastGoalDate: null,
      dailyStats: {},
      dailyCorrect: 0,
      goalReached: false,
      lastCategory: null
    };

    // Preset-Vokabeln neu laden
    await DataManager.seedPresetVocabulary();
    await DataManager.loadAll();

    Toast.show('Alle Daten gelöscht und Vokabeln neu geladen', 'info');
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
  },

  showAGB() {
    Modal.open('AGB & Nutzungsbedingungen', `
      <div class="agb-content">
        <h3>Allgemeine Geschäftsbedingungen</h3>
        <p><strong>Vokabel Master+</strong> — Vokabeltrainer-App</p>

        <h4>1. Geltungsbereich</h4>
        <p>Diese Nutzungsbedingungen gelten für die Nutzung der App "Vokabel Master+". Die App wird kostenlos und ohne Gewinnabsicht bereitgestellt.</p>

        <h4>2. Bereitstellung & Wartung</h4>
        <p>Die App wird vom Entwickler gepflegt und gewartet, solange die Kinder die App nutzen und Unterstützung benötigen. Sobald die Kinder in der Lage sind, die App eigenständig zu verwalten und weiterzuentwickeln, wird die Verantwortung an sie übergeben.</p>

        <h4>3. Kostenfreiheit</h4>
        <p>Die Nutzung der App ist vollständig kostenlos. Es fallen keine Gebühren, Abonnements oder In-App-Käufe an. Es werden keine Werbeanzeigen geschaltet.</p>

        <h4>4. Datenschutz</h4>
        <p>Alle Lern-Daten (Vokabeln, Fortschritt, Einstellungen) werden ausschließlich lokal auf dem Gerät des Nutzers gespeichert. Es werden keine persönlichen Daten an Server oder Dritte übermittelt. Die App funktioniert vollständig offline.</p>

        <h4>5. Haftung</h4>
        <p>Die App wird "wie besehen" bereitgestellt. Für die Richtigkeit der enthaltenen Vokabeln und Übersetzungen wird keine Garantie übernommen. Die App ersetzt keinen professionellen Sprachunterricht.</p>

        <h4>6. Urheberrecht</h4>
        <p>Die Vokabellisten basieren auf dem öffentlich zugänglichen Grundwortschatz des Lehrplans für Gymnasien. Die App selbst und ihr Quellcode sind Eigentum des Entwicklers.</p>

        <h4>7. Übergabe</h4>
        <p>Es ist ausdrücklich vorgesehen, dass diese App zu einem späteren Zeitpunkt an die Kinder übergeben wird, damit sie die Anwendung eigenständig weiterentwickeln und pflegen können. Dies ist Teil des Lernprozesses.</p>

        <h4>8. Änderungen</h4>
        <p>Diese Bedingungen können jederzeit angepasst werden. Bei wesentlichen Änderungen wird innerhalb der App darauf hingewiesen.</p>

        <p class="text-muted" style="margin-top: var(--space-lg); font-size: 0.75rem;">Stand: März 2026</p>
      </div>
    `, `
      <button class="btn btn-primary" onclick="Modal.close()">Verstanden</button>
    `);
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
    if (!seeded) {
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
        <p>${Utils.escapeHtml(error.message)}</p>
        <button onclick="location.reload()">Neu laden</button>
      </div>
    `;
  }
}

// App starten wenn DOM geladen
document.addEventListener('DOMContentLoaded', initApp);

// Double-tap zoom prevention handled via CSS touch-action: manipulation

// Keyboard shortcut for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    Modal.close();
  }
});
