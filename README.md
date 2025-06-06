# **Lymphknoten T2 – Avocado Sign Analyse Tool**

## **1\. Überblick**

Das **Lymphknoten T2 – Avocado Sign Analyse Tool** ist eine hochentwickelte, webbasierte Anwendung, die speziell für die wissenschaftliche Forschung und Analyse im Bereich der radiologischen Diagnostik des Rektumkarzinoms entwickelt wurde. Es ermöglicht die detaillierte Untersuchung und den Vergleich der diagnostischen Leistung des neuartigen "Avocado Signs" (AS) mit etablierten und datengetriebenen T2-gewichteten (T2w) morphologischen Kriterien zur Bestimmung des mesorektalen Lymphknotenstatus (N-Status).

Als interaktives Forschungsinstrument unterstützt dieses Tool umfassende Datenexploration, statistische Auswertungen, die Generierung wissenschaftlicher Publikationstexte und Präsentationen sowie vielseitige Exportoptionen.

**Wichtiger Hinweis**: Diese Anwendung ist ein **reines Forschungsinstrument** und **nicht für die klinische Diagnostik, Therapieentscheidungen oder andere direkte medizinische Anwendungen** am Patienten vorgesehen.

## **2\. Hauptfunktionen**

Das Tool bietet eine breite Palette an Funktionen, gegliedert in intuitive Tabs:

* **Interaktive Datenexploration**: Detaillierte Ansicht und Filterung von pseudonymisierten Patientendaten mit umfassenden Sortier- und Detailansichten.  
* **Dynamische T2-Kriterien-Definition**: Flexible Konfiguration und sofortige Anwendung von komplexen T2w-Kriteriensets (basierend auf Größe, Form, Kontur, Homogenität, Signal) mit UND/ODER-Logik.  
* **Brute-Force-Optimierung**: Ein integrierter Algorithmus identifiziert automatisiert die T2w-Kriterienkombination, die eine vom Nutzer gewählte diagnostische Zielmetrik (z.B. Balanced Accuracy, F1-Score) maximiert. Der Prozess läuft im Hintergrund, um die UI-Reaktionsfähigkeit zu gewährleisten.  
* **Umfassende statistische Auswertung**: Berechnung und Darstellung einer Vielzahl diagnostischer Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, Balanced Accuracy, AUC) inklusive 95%-Konfidenzintervallen und p-Werten. Vergleichende Statistiken zwischen verschiedenen Methoden und Kollektiven werden bereitgestellt.  
* **Publikationsunterstützung (Radiology-Fokus)**: Automatische Generierung von Textentwürfen, Tabellen und Abbildungen für wissenschaftliche Manuskripte, spezifisch ausgerichtet auf die formalen und stilistischen Anforderungen des Fachjournals *Radiology*.  
* **Präsentationserstellung**: Aufbereitung ausgewählter Ergebnisse in einem übersichtlichen, visuell ansprechenden Format, das direkt für wissenschaftliche Präsentationen verwendet werden kann.  
* **Vielseitiger Datenexport**: Export von Rohdaten, Analyseergebnissen, Tabellen und Grafiken in verschiedenen Formaten (CSV, TXT, MD, HTML, PNG, SVG, ZIP).

## **3\. Datenbasis**

Die Analysen innerhalb dieser Anwendung basieren auf einem fest integrierten, pseudonymisierten Datensatz von **106 Patientenfällen** mit histologisch gesichertem Rektumkarzinom. Dieser Datensatz umfasst:

* Klinische Basisinformationen (Alter, Geschlecht, Therapiegruppe).  
* Den durch Histopathologie bestätigten N-Status jedes Patienten (Referenzstandard).  
* Die Befundung des Avocado Signs für jeden relevanten Lymphknoten.  
* Detaillierte morphologische Eigenschaften für jeden im T2-gewichteten MRT beurteilten Lymphknoten (Kurzachsendurchmesser, Form, Kontur, Homogenität, Signalintensität).

## **4\. Verwendete Technologien**

Die Anwendung ist als reine Client-Side Webanwendung implementiert und nutzt folgende Kerntechnologien:

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)  
* **Frameworks/Bibliotheken**:  
  * [**Bootstrap 5**](https://getbootstrap.com/): Für responsives Design und UI-Komponenten.  
  * [**D3.js**](https://d3js.org/): Zur Generierung dynamischer und interaktiver Diagramme und Visualisierungen.  
  * [**Tippy.js**](https://atomiks.github.io/tippyjs/): Für kontextsensitive Tooltips.  
  * [**PapaParse**](https://www.papaparse.com/): Zur Verarbeitung von CSV-Daten.  
  * [**JSZip**](https://stuk.github.io/jszip/): Zur Erstellung von ZIP-Archiven.  
* **Web Workers**: Für rechenintensive Aufgaben (z.B. Brute-Force-Optimierung) im Hintergrund, um die UI-Reaktionsfähigkeit zu gewährleisten.

## **5\. Installation**

Das Tool ist eine rein clientseitige Webanwendung. Zur Ausführung sind keine serverseitigen Komponenten oder eine spezielle Installation erforderlich.

1. **Voraussetzungen**: Ein moderner Webbrowser (z.B. aktuelle Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari).  
2. **Ausführung**:  
   * Laden Sie das gesamte Projektverzeichnis herunter oder klonen Sie das Repository.  
   * Öffnen Sie die Datei index.html im Stammverzeichnis des Projekts mit einem kompatiblen Webbrowser.

Alle externen Bibliotheken werden über Content Delivery Networks (CDNs) geladen oder sind direkt im Projekt enthalten und erfordern keine separate Installation.

## **6\. Nutzung der Anwendung**

Die Anwendung ist in mehrere thematische Module (Tabs) gegliedert.

### **6.1 Globale UI-Konzepte**

* Kollektiv-Auswahl (Header):  
  Wählen Sie über die Buttons (Gesamt, Direkt OP, nRCT) das Patientenkollektiv aus, das für alle Analysen und Darstellungen in der Anwendung verwendet wird. Die aktive Auswahl ist visuell hervorgehoben.  
* Dynamische Meta-Statistiken (Header):  
  Eine Leiste rechts im Header zeigt Schlüsselkennzahlen für das aktuell ausgewählte Kollektiv an: Name des Kollektivs, Gesamtzahl der Patienten, prozentualer Anteil von Patienten mit pathologisch positivem N-Status (N+), positivem Avocado Sign (AS+) und positivem T2-Status (T2+, basierend auf den aktuell definierten Kriterien).  
* Kurzanleitung (Header-Button):  
  Ein dedizierter Button (oft mit einem Informationssymbol gekennzeichnet) öffnet ein modales Fenster mit einer detaillierten Kurzanleitung zur Bedienung und wichtigen Nutzungshinweisen.  
* Tab-Navigation:  
  Wechseln Sie über die Reiter (Daten, Auswertung, Statistik, Präsentation, Publikation, Export) zwischen den Hauptfunktionsmodulen der Anwendung.  
* Interaktive Tooltips:  
  Zahlreiche UI-Elemente und statistische Kennzahlen sind mit dynamischen Tooltips ausgestattet. Beim Mausüberfahren werden kurze Erklärungen, Definitionen oder Interpretationshilfen angezeigt.  
* Sortierfunktionen in Tabellen:  
  In vielen Tabellen kann jede Spalte durch Klick auf die Spaltenüberschrift auf- oder absteigend sortiert werden. Ein Pfeilsymbol neben dem Spaltennamen indiziert die aktive Sortierspalte und \-richtung. Für Spalten mit mehreren Kategorien (z.B. "N/AS/T2") ist eine Sub-Sortierung nach den Einzelkomponenten möglich.

### **6.2 Tab-spezifische Funktionen**

#### **6.2.1 Tab: Daten**

Zeigt die detaillierten Patientendaten des aktuell ausgewählten Kollektivs und erlaubt deren Exploration.

* **Patiententabelle**: Listet jeden Patienten mit pseudonymisierten ID, Name, Alter, Geschlecht, Therapie, N/AS/T2-Status und Bemerkungen. Positive Status sind farblich hervorgehoben.  
* **Detailansicht T2-Lymphknoten**: Für Patienten mit T2-Lymphknotendaten kann durch Klick auf die Patientenreihe eine Detailansicht aufgeklappt werden. Diese visualisiert die morphologischen Eigenschaften (Größe, Form, Kontur, Homogenität, Signalintensität) jedes einzelnen im T2-MRT beurteilten Lymphknotens.  
* **"Alle Details Anzeigen/Ausblenden" Button**: Steuert das globale Ein- oder Ausklappen aller T2-Lymphknoten-Detailansichten in der Tabelle.

#### **6.2.2 Tab: Auswertung**

Das interaktive Zentrum für die Definition und Optimierung von T2-Kriterien sowie die detaillierte Patientenauswertung.

* **Dashboard (Karten oben)**: Grafische Schnellübersicht des aktuellen Kollektivs, visualisiert Verteilungen von Alter, Geschlecht, Therapiegruppen und N/AS/T2-Status.  
* **Karte "T2-Kriterien Definition"**:  
  * **Logische Verknüpfung (Switch)**: Wählen Sie zwischen UND (alle aktiven Kriterien müssen erfüllt sein) und ODER (mindestens ein aktives Kriterium genügt).  
  * **Einzelkriterien-Steuerung**: Für jedes der fünf morphologischen T2-Merkmale (Größe, Form, Kontur, Homogenität, Signal):  
    * **Checkbox**: Aktivierung/Deaktivierung des Merkmals.  
    * **Größe (Kurzachse)**: Schieberegler und numerisches Eingabefeld für den Schwellenwert (in mm).  
    * **Form, Kontur, Homogenität, Signal**: Options-Buttons zur Auswahl der als suspekt zu wertenden Ausprägung.  
  * **Aktions-Buttons**: Zurücksetzen (setzt Kriterien auf Standard) und Anwenden & Speichern (übernimmt Einstellungen global, aktualisiert alle Berechnungen und speichert die Konfiguration). Ein visueller Indikator zeigt ungespeicherte Änderungen an.  
* **Karte "T2 Metrik-Übersicht (Angewandte Kriterien)"**: Zeigt wichtige diagnostische Gütekennzahlen (Sens, Spez, PPV, NPV, Acc, BalAcc, F1-Score, AUC) für die aktuell angewendeten T2-Kriterien im Vergleich zum histopathologischen N-Status, inklusive 95%-Konfidenzintervallen (95%-KI).  
* **Karte "Brute-Force Optimierung T2-Kriterien"**:  
  * **Zielmetrik-Auswahl**: Wählen Sie die diagnostische Metrik (z.B. Balanced Accuracy, Accuracy, F1-Score, PPV, NPV), die der Algorithmus maximieren soll.  
  * **"Optimierung starten" Button**: Initiiert den Brute-Force-Algorithmus zur Suche nach der optimalen Kriterienkombination.  
  * **Status- und Fortschrittsanzeige**: Zeigt den Fortschritt und das aktuell beste Ergebnis während der Laufzeit an.  
  * **"Optimierung abbrechen" Button**: Stoppt den Algorithmus vorzeitig.  
  * **Ergebnisdarstellung nach Abschluss**: Präsentiert die beste Kriterienkombination (Merkmale, Schwellenwerte, Logik), den erreichten Metrikwert und die Dauer der Optimierung.  
  * **"Details (Top 10)" Button**: Öffnet ein modales Fenster mit einer Liste der Top 10 Ergebnisse und Exportoptionen für diesen Bericht.  
  * **"Beste Kriterien anwenden" Button**: Übernimmt die als optimal identifizierten Kriterien direkt in die "T2-Kriterien Definition"-Karte und wendet sie global an.  
* **Auswertungstabelle (untere Tabelle)**: Listet alle Patienten des global ausgewählten Kollektivs mit N-, AS- und (gemäß aktuell angewendeten Kriterien) T2-Status sowie Lymphknotenzahlen auf. Eine aufklappbare Detailansicht zeigt die Bewertung jedes T2-Lymphknotens anhand der aktuellen Kriteriendefinition, wobei erfüllte Merkmale hervorgehoben werden.  
* **"Alle Details Anzeigen/Ausblenden" Button**: Steuert das globale Ein- oder Ausklappen aller Detailansichten in der Auswertungstabelle.

#### **6.2.3 Tab: Statistik**

Bietet umfassende statistische Auswertungen und Vergleiche der diagnostischen Leistung von AS und T2-Kriterien, basierend auf den aktuell angewendeten T2-Kriterien.

* **Layout-Umschaltung ("Ansicht: Einzel / Vergleich")**:  
  * **"Einzelansicht Aktiv"**: Zeigt Statistiken für das global gewählte Kollektiv.  
  * **"Vergleich Aktiv"**: Blendet Dropdown-Menüs zur Auswahl von zwei spezifischen Kollektiven ein und vergleicht deren Performance-Metriken.  
* **Dargestellte statistische Analysen**:  
  * **Deskriptive Statistik**: Tabelle und Diagramme (Histogramm für Alter, Tortendiagramm für Geschlecht) fassen demographische Daten und Basisraten zusammen.  
  * **Diagnostische Güte (Avocado Sign vs. N-Status)**: Detaillierte Tabelle mit Sensitivität, Spezifität, PPV, NPV, Accuracy, Balanced Accuracy, F1-Score und AUC für AS, inklusive 95%-KI und Konfusionsmatrix.  
  * **Diagnostische Güte (Angewandte T2-Kriterien vs. N-Status)**: Analoge Darstellung für die aktuell angewendeten T2-Kriterien.  
  * **Statistischer Vergleich (AS vs. Angewandte T2-Kriterien)**: Ergebnisse des McNemar-Tests (für Accuracy) und des DeLong-Tests (für AUC-Werte) für den paarweisen Vergleich.  
  * **Assoziationsanalysen (explorativ)**: Tabelle zeigt Assoziation von AS-Status und einzelnen T2-Merkmalen mit dem pathologischen N-Status (Odds Ratios, Risk Differences, Phi-Koeffizient, p-Werte).  
  * **Kollektivvergleich (nur im "Vergleich Aktiv"-Layout)**: Vergleicht Accuracy und AUC von AS und T2-Kriterien zwischen zwei unabhängigen Gruppen mittels ungepaarter statistischer Tests.  
* **Kriterienvergleichstabelle (am Ende des Tabs)**: Zusammenfassender Vergleich von AS, angewendeten T2-Kriterien und vordefinierten Literatur-Kriteriensets (z.B. Koh et al., Barbaro et al., ESGAR-Konsensus).

#### **6.2.4 Tab: Präsentation**

Bereitet ausgewählte Analyseergebnisse in einem präsentationsfreundlichen Format auf, fokussiert auf klare, visuelle Vergleiche.

* **Ansichtsauswahl**: Zwei Hauptansichten: Avocado Sign (Performance) oder AS vs. T2 (Vergleich).  
* **Auswahl der T2-Vergleichsbasis (Dropdown-Menü)**: Im "AS vs. T2"-Ansichtsmodus kann eine T2-Basis gewählt werden (aktuell eingestellte Kriterien oder publizierte Literatur-Sets). Bei Auswahl eines Literatur-Sets wird das global gewählte Kollektiv ggf. automatisch an das Zielkollektiv der Studie angepasst.  
* **Dargestellte Elemente**: Informationskarten mit Details zur T2-Vergleichsbasis, Vergleichstabellen (numerische Gegenüberstellung der Gütekriterien), Tabellen mit statistischen Tests und Balkendiagramme zum visuellen Vergleich der Schlüsselmetriken.  
* **Download-Funktionen**: Spezifische Buttons ermöglichen den Download angezeigter Tabellen (CSV, Markdown) und Diagramme (PNG, SVG).

#### **6.2.5 Tab: Publikation**

Unterstützt die Erstellung eines wissenschaftlichen Manuskripts durch Generierung von Textvorschlägen, Tabellen und Abbildungen, angepasst an die Anforderungen des Fachjournals *Radiology*.

* **Sprachauswahl**: Ein Switch ermöglicht das Umschalten aller generierten Inhalte zwischen Deutsch und Englisch.  
* **Sektionsauswahl**: Eine vertikale Navigationsleiste listet die typischen Abschnitte eines wissenschaftlichen Originalartikels gemäß *Radiology*\-Struktur auf (Abstract, Einleitung, Methoden, Ergebnisse, Diskussion, Referenzen).  
* **Auswahl der Brute-Force-Zielmetrik für Ergebnisdarstellung**: Ein Dropdown ermöglicht die Auswahl der Zielmetrik der Brute-Force-Optimierung, deren Ergebnisse im generierten Text und in den Tabellen verwendet werden sollen.  
* **Generierte Inhalte**:  
  * **Textvorschläge**: Wissenschaftlich präzise formulierte Textbausteine integrieren automatisch aktuelle Daten, statistische Ergebnisse (inklusive p-Werten und Konfidenzintervallen, formatiert nach *Radiology*\-Vorgaben) und relevante Referenzen zu Tabellen und Abbildungen.  
  * **Eingebettete Tabellen und Abbildungen**: Relevante, bereits im System definierte Tabellen und Abbildungen werden direkt im Publikationslayout angezeigt.  
  * **Formatierung und Stil**: Texte berücksichtigen formale Anforderungen und die spezifische Darstellung statistischer Werte gemäß *Radiology*\-Richtlinien.

#### **6.2.6 Tab: Export**

Bietet umfassende Exportmöglichkeiten für Daten, Analyseergebnisse und generierte Materialien.

* **Export-Kategorien**: Optionen sind thematisch gruppiert (z.B. Einzelexporte, Export-Pakete (.zip)).  
* **Abhängigkeit von globalen Einstellungen**: Alle Exporte basieren auf dem aktuell ausgewählten Kollektiv und den zuletzt angewendeten T2-Kriterien. Brute-Force-Ergebnisse werden entsprechend der gewählten Zielmetrik verwendet.  
* **Verfügbare Exportoptionen und Dateiformate**:  
  * **Datenlisten und Rohdaten**: Gefilterte Rohdaten (CSV, XLSX), Datenliste (MD, XLSX), Auswertungstabelle (MD, XLSX).  
  * **Statistische Ergebnisse**: Umfassende Tabelle aller berechneten statistischen Metriken (CSV, XLSX, MD).  
  * **Brute-Force-Optimierungsergebnisse**: Detaillierter Bericht der letzten Brute-Force-Optimierung (TXT).  
  * **Diagramme und Abbildungen**: Alle aktuell sichtbaren Diagramme und ausgewählte Tabellen als einzelne Bilddateien (PNG, SVG als ZIP-Archiv).  
  * **Publikationstexte**: Generierte Texte der Publikationsabschnitte (Markdown als ZIP-Archiv).  
  * **Gesamtberichte und Pakete**: Umfassender Analysebericht (HTML), thematisch gebündelte ZIP-Archive (z.B. Alle Excel-Tabellen, Alle Markdown-Dateien, Alle Diagramme (PNG), oder ein Gesamtpaket aller verfügbaren Einzeldateien).  
* **Export-Buttons**: Buttons für nicht sinnvoll durchführbare Exporte sind deaktiviert.

## **7\. Projektstruktur**

.  
├── css/  
│   └── style.css            \# Haupt-CSS-Datei für Styling  
├── data/  
│   └── patient\_data.js      \# Pseudonymisierter Rohdatensatz der Patienten  
├── docs/  
│   ├── Anwendungsbeschreibung.txt  
│   ├── Radiology\_Style\_Guide.md  
│   └── wissenschaftliche\_artikel/ \# Wissenschaftliche Artikel (PDFs)  
├── js/  
│   ├── app/  
│   │   ├── main.js          \# Hauptanwendungslogik, Initialisierung, Event-Management  
│   │   └── state\_manager.js \# Zustandsverwaltung der Anwendung  
│   ├── config/  
│   │   ├── app\_config.js    \# Globale Anwendungskonfigurationen und Pfade  
│   │   ├── publication\_config.js \# Konfiguration für den Publikationstab  
│   │   └── text\_config.js   \# Texte und Tooltips für die Benutzeroberfläche  
│   ├── core/  
│   │   ├── data\_processor.js     \# Datenbereinigung und Vorverarbeitung  
│   │   ├── study\_criteria\_manager.js \# Verwaltung der T2-Kriteriensets aus Studien  
│   │   └── t2\_criteria\_manager.js  \# Verwaltung der aktuell angewendeten T2-Kriterien  
│   ├── services/  
│   │   ├── brute\_force\_manager.js \# Verwaltung des Brute-Force Web Workers  
│   │   ├── export\_service.js      \# Exportfunktionen  
│   │   └── statistics\_service.js  \# Statistische Berechnungen  
│   ├── ui/  
│   │   ├── core/  
│   │   │   ├── ui\_components.js \# UI-Komponenten (Buttons, Slider etc.)  
│   │   │   └── ui\_helpers.js    \# Allgemeine UI-Hilfsfunktionen (Toasts, Tooltips)  
│   │   ├── event\_handlers/      \# Event-Handler für UI-Interaktionen  
│   │   │   ├── auswertung\_event\_handlers.js  
│   │   │   ├── general\_event\_handlers.js  
│   │   │   ├── praesentation\_event\_handlers.js  
│   │   │   ├── publikation\_event\_handlers.js  
│   │   │   └── statistik\_event\_handlers.js  
│   │   ├── publication/         \# Logik und Renderer für den Publikationstab  
│   │   │   ├── publication\_content\_generator.js  
│   │   │   ├── publication\_controller.js  
│   │   │   ├── publication\_figure\_generator\_radiology.js  
│   │   │   ├── publication\_table\_generator\_radiology.js  
│   │   │   ├── publication\_text\_generator\_radiology.js  
│   │   │   └── publication\_view\_renderer.js  
│   │   ├── renderers/           \# Renderer für spezifische Tabs  
│   │   │   ├── auswertung\_tab\_renderer.js  
│   │   │   ├── chart\_renderer.js  
│   │   │   ├── data\_tab\_renderer.js  
│   │   │   ├── export\_tab\_renderer.js  
│   │   │   ├── praesentation\_tab\_renderer.js  
│   │   │   ├── statistik\_tab\_renderer.js  
│   │   │   └── table\_renderer.js  
│   │   ├── view\_logic/          \# Logik für die einzelnen Tabs  
│   │   │   ├── auswertung\_tab\_logic.js  
│   │   │   ├── data\_tab\_logic.js  
│   │   │   ├── praesentation\_tab\_logic.js  
│   │   │   ├── publikation\_tab\_logic.js  
│   │   │   └── statistik\_tab\_logic.js  
│   │   └── view\_renderer.js     \# Allgemeine Renderer-Funktionen  
│   └── utils/  
│       └── utils.js             \# Allgemeine Hilfsfunktionen (Formatierung, Deep Clone)  
├── workers/  
│   └── brute\_force\_worker.js    \# Web Worker für die Brute-Force-Optimierung  
└── index.html               \# Haupt-HTML-Datei der Anwendung

## **8\. Wissenschaftlicher Kontext**

Diese Anwendung wurde im Kontext der Forschung zum **Avocado Sign** entwickelt, einem neuartigen MRT-Marker für die Beurteilung des Lymphknotenstatus bei Rektumkarzinompatienten. Sie dient dazu, die diagnostische Leistung dieses Markers systematisch zu analysieren und ihn mit etablierten T2-gewichteten morphologischen Kriterien zu vergleichen. Die mit diesem Tool generierten Ergebnisse tragen zur wissenschaftlichen Diskussion über die Optimierung des präoperativen Stagings des Rektumkarzinoms bei.

## **9\. Glossar wichtiger Begriffe und Abkürzungen**

* **ACC**: Accuracy (Genauigkeit)  
* **AS**: Avocado Sign (ein MRT-Marker)  
* **AUC**: Area Under the Curve (Fläche unter der ROC-Kurve)  
* **BF**: Brute-Force (Optimierungsmethode)  
* **CI / KI**: Confidence Interval / Konfidenzintervall (üblicherweise 95%)  
* **CSV**: Comma-Separated Values (Dateiformat)  
* **DWI**: Diffusion-Weighted Imaging (Diffusionsgewichtete Bildgebung)  
* **ESGAR**: European Society of Gastrointestinal and Abdominal Radiology  
* **FOV**: Field of View (Sichtfeld in der MRT)  
* **HTML**: HyperText Markup Language  
* **IQR**: Interquartile Range (Interquartilsabstand)  
* **KM**: Kontrastmittel  
* **MD**: Markdown (Dateiformat)  
* **MRT**: Magnetresonanztomographie  
* **N-Status**: Nodalstatus (Lymphknotenstatus; N0 \= negativ, N+ \= positiv)  
* **nCRT**: Neoadjuvante Radiochemotherapie  
* **NPV**: Negativer Prädiktiver Wert  
* **OR**: Odds Ratio  
* **PACS**: Picture Archiving and Communication System  
* **PNG**: Portable Network Graphics (Bildformat)  
* **PPV**: Positiver Prädiktiver Wert  
* **RD**: Risk Difference  
* **ROC**: Receiver Operating Characteristic  
* **SVG**: Scalable Vector Graphics (Bildformat)  
* **T1w**: T1-gewichtet (MRT-Sequenzen)  
* **T2w**: T2-gewichtet (MRT-Sequenzen)  
* **TE**: Echo Time / Echozeit (MRT-Sequenzparameter)  
* **TNT**: Totale Neoadjuvante Therapie  
* **TR**: Repetition Time / Repetitionszeit (MRT-Sequenzparameter)  
* **TXT**: Textdatei  
* **UI**: User Interface (Benutzeroberfläche)  
* **UX**: User Experience (Nutzererfahrung)  
* **VIBE**: Volumetric Interpolated Breath-Hold Examination (MRT-Sequenz)  
* **XLSX**: Microsoft Excel Open XML Spreadsheet (Dateiformat)  
* **ZIP**: Archivdateiformat

## **10\. Disclaimer**

Das **Lymphknoten T2 – Avocado Sign Analyse Tool** ist ausschließlich für **Forschungs- und Evaluationszwecke** bestimmt. Es ist **nicht als Medizinprodukt zugelassen** und darf **unter keinen Umständen für direkte klinische Diagnosen, Therapieentscheidungen oder andere medizinische Anwendungen an Patienten verwendet werden.** Die Verantwortung für die Interpretation und Nutzung der mit diesem Tool generierten Ergebnisse liegt vollständig beim Anwender und muss im Kontext der jeweiligen Studienlimitationen und des aktuellen wissenschaftlichen Kenntnisstandes erfolgen.

## **11\. Autoren und Kontakt**

* **Hauptentwickler/Studienautoren**: \[Namen und Affiliationen hier einfügen\]  
* **Kontakt für technische Fragen oder Feedback zur Anwendung**: \[E-Mail-Adresse oder Link hier einfügen\]

## **12\. Lizenz**

\[Hier Lizenzinformationen einfügen, falls zutreffend, z.B. MIT-Lizenz\]
