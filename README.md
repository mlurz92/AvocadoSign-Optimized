# **Lymphknoten T2 - Avocado Sign Analyse Tool (Version 2.3.0)**

## **1. Übersicht**

Das **Lymphknoten T2 - Avocado Sign Analyse Tool** (Version 2.3.0) ist eine webbasierte Anwendung, die speziell für die wissenschaftliche Forschung im Bereich der radiologischen Diagnostik des Rektumkarzinoms entwickelt wurde. Es dient der detaillierten Analyse und dem Vergleich der diagnostischen Leistung verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status). Im Fokus steht der Vergleich des neuartigen "Avocado Signs" (AS) mit etablierten Literatur-basierten sowie datengetriebenen, optimierten T2-gewichteten (T2w) morphologischen Kriterien.

Diese Anwendung wurde im Kontext der Forschung zum **Avocado Sign** entwickelt. Sie dient dazu, die diagnostische Leistung dieses Markers systematisch zu analysieren und ihn mit etablierten T2-gewichteten morphologischen Kriterien zu vergleichen. Die Ergebnisse, die mit diesem Tool generiert werden können, sollen zur wissenschaftlichen Diskussion über die Optimierung des präoperativen Stagings des Rektumkarzinoms beitragen.

**Wichtiger Hinweis:** Diese Anwendung ist als interaktives Forschungsinstrument konzipiert und **nicht für die klinische Diagnostik oder direkte Therapieentscheidungen vorgesehen.** Die Verantwortung für die Interpretation und Nutzung der mit diesem Tool generierten Ergebnisse liegt vollständig beim Anwender.

## **2. Hauptfunktionen**

Das Tool bietet eine breite Palette an Funktionalitäten für die wissenschaftliche Analyse:

* **Interaktive Datenexploration:** Detaillierte Ansicht und Filterung von pseudonymisierten Patientendaten, inklusive klinischer Informationen und spezifischer Lymphknotenmerkmale.
* **Dynamische T2-Kriterien-Definition:** Flexible Konfiguration und sofortige Anwendung von komplexen T2w-Kriteriensets (basierend auf Größe, Form, Kontur, Homogenität, Signal) mit UND/ODER-Logik.
* **Brute-Force-Optimierung:** Ein integrierter Algorithmus zur automatisierten Identifikation der T2w-Kriterienkombination, die eine vom Nutzer gewählte diagnostische Zielmetrik (z.B. Balanced Accuracy, F1-Score) für das ausgewählte Patientenkollektiv maximiert.
* **Umfassende statistische Auswertung:** Berechnung und Darstellung einer Vielzahl diagnostischer Gütekriterien (Sensitivität, Spezifität, Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Accuracy, Balanced Accuracy, Area Under the Curve (AUC)) inklusive 95%-Konfidenzintervallen und p-Werten. Vergleichende Statistiken zwischen verschiedenen Methoden und Kollektiven werden ebenfalls bereitgestellt.
* **Publikationsunterstützung (*Radiology*-Fokus):** Automatische Generierung von Textentwürfen, Tabellen und Abbildungen für wissenschaftliche Manuskripte, spezifisch ausgerichtet auf die formalen und stilistischen Anforderungen des Fachjournals *Radiology*.
* **Präsentationserstellung:** Aufbereitung ausgewählter Ergebnisse in einem übersichtlichen Format, das direkt für wissenschaftliche Präsentationen verwendet werden kann.
* **Vielseitiger Datenexport:** Export von Rohdaten, Analyseergebnissen, Tabellen und Grafiken in verschiedenen Formaten (CSV, XLSX, TXT, MD, PNG, SVG, HTML, ZIP).

## **3. Datenbasis**

Die Analysen innerhalb dieser Anwendungsversion basieren auf einem fest integrierten, pseudonymisierten Datensatz von **106 Patientenfällen** mit histologisch gesichertem Rektumkarzinom. Dieser Datensatz umfasst:

* Klinische Basisinformationen (Alter, Geschlecht, Therapiegruppe).
* Den durch Histopathologie bestätigten N-Status jedes Patienten (Referenzstandard).
* Die Befundung des Avocado Signs für jeden relevanten Lymphknoten.
* Detaillierte morphologische Eigenschaften für jeden im T2-gewichteten MRT beurteilten Lymphknoten (Kurzachsendurchmesser, Form, Kontur, Homogenität, Signalintensität).

## **4. Verwendete Technologien**

Die Anwendung ist als reine Client-Side Webanwendung implementiert und nutzt folgende Kerntechnologien:

* **HTML5:** Für die strukturelle Basis der Webseite.
* **CSS3:** Für das Styling und Layout.
* **JavaScript (ES6+):** Für die gesamte Anwendungslogik, Datenverarbeitung, statistische Berechnungen und dynamische UI-Interaktionen.
* **Bootstrap 5:** Als CSS-Framework für ein responsives Design und vorgefertigte UI-Komponenten.
* **D3.js:** Zur Generierung dynamischer und interaktiver Diagramme und Visualisierungen.
* **Tippy.js:** Für die Anzeige kontextsensitiver Tooltips.
* **PapaParse:** Zur Verarbeitung von CSV-Daten (primär für potenzielle zukünftige Importfunktionen oder interne Datenaufbereitung).
* **JSZip:** Zur Erstellung von ZIP-Archiven für die Exportfunktionalitäten.
* **Web Workers:** Für rechenintensive Aufgaben im Hintergrund (z.B. Brute-Force-Optimierung), um die Reaktionsfähigkeit der Benutzeroberfläche zu gewährleisten.
* **ExcelJS:** Für den Export von Daten im XLSX-Format.
* **FileSaver.js:** Für die clientseitige Speicherung von generierten Dateien.
* **html2canvas:** Für den Export von HTML-Elementen als PNG-Bilder.
* **Lucide Icons:** Für die Darstellung von Icons in der Benutzeroberfläche.

## **5. Installation und Ausführung**

Das "Lymphknoten T2 - Avocado Sign Analyse Tool" ist eine rein clientseitige Webanwendung. Zur Ausführung sind keine serverseitigen Komponenten oder eine spezielle Installation erforderlich.

1.  **Voraussetzungen:** Ein moderner Webbrowser (z.B. aktuelle Versionen von Chrome, Firefox, Edge, Safari).
2.  **Ausführung:**
    * Laden Sie das gesamte Projektverzeichnis herunter oder klonen Sie das Repository.
    * Öffnen Sie die Datei `index.html` im Stammverzeichnis des Projekts mit einem kompatiblen Webbrowser.
3.  **Abhängigkeiten:** Alle externen Bibliotheken werden über Content Delivery Networks (CDNs) geladen oder sind direkt im Projekt enthalten und erfordern keine separate Installation.

## **6. Globale UI-Elemente und Bedienkonzepte**

### **6.1 Header-Bereich**

Der Header-Bereich ist stets sichtbar und enthält:
* **Logo und Anwendungstitel:** Zeigt den Namen "Avocado Sign Analyse Tool" und ein Icon.
* **Globale Kollektiv-Auswahl (`#kollektiv-selector-container`):** Eine Button-Gruppe ermöglicht die Auswahl des Patientenkollektivs ("Gesamt", "Direkt OP", "nRCT"), das für alle Analysen und Darstellungen in der Anwendung verwendet wird. Die aktive Auswahl ist visuell hervorgehoben.
* **Dynamische Meta-Statistiken (`#header-stats-container`):** Eine Leiste zeigt Schlüsselkennzahlen für das aktuell ausgewählte Kollektiv an: Name des Kollektivs, Gesamtzahl der Patienten, prozentualer Anteil N-positiver Patienten (N+), Avocado Sign-positiver Patienten (AS+) und T2-positiver Patienten (T2+).
* **Info-Button (`#app-info-button`):** Öffnet ein modales Fenster mit einer Kurzanleitung und wichtigen Nutzungshinweisen.

### **6.2 Hauptnavigation (Tab-Leiste)**

Eine horizontale Leiste mit Reitern (`#main-nav`) unterhalb des Headers ermöglicht den Wechsel zwischen den Hauptfunktionsmodulen:
* **Daten:** Tabellarische Ansicht der Patientendaten.
* **Auswertung:** Definition von T2-Kriterien und Brute-Force-Optimierung.
* **Statistik:** Umfassende statistische Analysen.
* **Präsentation:** Aufbereitung von Ergebnissen für Präsentationen.
* **Publikation:** Unterstützung bei der Manuskripterstellung.
* **Export:** Exportfunktionen für Daten und Ergebnisse.

### **6.3 Auswahl des Patientenkollektivs**

Die Auswahl des Patientenkollektivs über die Buttons im Header ("Gesamt", "Direkt OP", "nRCT") ist ein fundamentales Konzept. Diese Auswahl beeinflusst global alle Berechnungen, Statistiken, Tabellen, Diagramme und Textgenerierungen in sämtlichen Tabs.

### **6.4 Interaktive Tooltips**

Zahlreiche UI-Elemente sind mit dynamischen Tooltips (via Tippy.js) versehen, die bei Mausüberfahrung Erklärungen zur Funktion, Definitionen von Metriken oder Interpretationshilfen anzeigen.

### **6.5 Dynamische Aktualisierung und Ladeindikatoren**

Änderungen der globalen Kollektivauswahl oder der T2-Kriteriendefinition führen zu einer Neuberechnung und Aktualisierung abhängiger Inhalte. Während rechenintensiver Operationen (z.B. Brute-Force-Optimierung) wird ein Ladeindikator (`#loading-overlay`) angezeigt, um die UI-Reaktionsfähigkeit zu gewährleisten.

## **7. Detaillierte Beschreibung der Anwendungsmodule (Tabs)**

### **7.1 Tab: Daten (`#daten-tab-pane`)**

* **Zweck:** Anzeige und Exploration der detaillierten Patientendaten des aktuell ausgewählten globalen Kollektivs.
* **Kerninhalte:**
    * **Button "Alle Details Anzeigen/Ausblenden":** Oberhalb der Tabelle, zum globalen Ein-/Ausklappen der Lymphknoten-Detailansichten.
    * **Patiententabelle:**
        * **Spalten:** `Nr.`, `Name`, `Vorname`, `Geschl.`, `Alter`, `Therapie`, `N/AS/T2` (Status Pathologie N, Avocado Sign AS, aktuelle T2-Kriterien), `Bemerkung`.
        * **Sortierung:** Alle Spalten sind durch Klick auf die Überschrift sortierbar. "N/AS/T2" erlaubt Sub-Sortierung nach N, AS oder T2.
        * **Detailansicht T2-Lymphknoten:** Pro Patient aufklappbar, zeigt morphologische Eigenschaften (Kurzachse, Form, Kontur, Homogenität, Signalintensität) jedes T2-Lymphknotens.

### **7.2 Tab: Auswertung (`#auswertung-tab-pane`)**

* **Zweck:** Interaktive Definition von T2w-Kriterien, Durchführung der Brute-Force-Optimierung und detaillierte Auswertung.
* **Kerninhalte:**
    * **Dashboard:** Schnellübersicht (Karten mit Diagrammen) über das aktuelle Kollektiv (Alter, Geschlecht, Therapie, N/AS/T2-Status).
    * **T2-Kriterien-Definition (`#t2-criteria-card`):**
        * **Logische Verknüpfung:** Switch (`#t2-logic-switch`) für UND/ODER.
        * **Einzelkriterien:**
            * Checkbox (`.criteria-checkbox`) zur Aktivierung/Deaktivierung.
            * **Größe:** Schieberegler (`#range-size`) und Eingabefeld (`#input-size`) für Schwellenwert.
            * **Form, Kontur, Homogenität, Signal:** Options-Buttons (`.t2-criteria-button`) mit Icons.
        * **Aktions-Buttons:** "Zurücksetzen (Standard)" (`#btn-reset-criteria`), "Anwenden & Speichern" (`#btn-apply-criteria`). Letzterer speichert im Browser.
    * **Performance T2 (angewandt) (`#t2-metrics-overview`):** Anzeige der Gütekriterien (Sens, Spez, etc. mit 95%-KI) des aktuellen T2-Sets.
    * **Kriterien-Optimierung (Brute-Force):**
        * **Zielmetrik-Auswahl:** Dropdown (`#brute-force-metric`).
        * **Start/Abbruch:** Button (`#btn-start-brute-force`, `#btn-cancel-brute-force`).
        * **Fortschrittsanzeige:** Balken (`#bf-progress-bar`), Text (`#bf-status-text`, `#bf-best-criteria`).
        * **Ergebnisdarstellung (`#brute-force-result-container`):** Beste Kriterien, erreichter Metrikwert, Dauer.
            * **Button "Details anzeigen (Top 10)":** Öffnet Modal mit Top 10 Ergebnissen.
            * **Button "Anwenden":** Übernimmt optimierte Kriterien.
    * **Auswertungstabelle (Patientenübersicht):**
        * Patientenliste mit Status (N, AS, T2) und Lymphknotenzahlen (positiv/gesamt).
        * Detailansicht pro Patient: Bewertung einzelner T2-Lymphknoten gemäß aktueller Kriterien, mit Hervorhebung erfüllter Merkmale.

### **7.3 Tab: Statistik (`#statistik-tab-pane`)**

* **Zweck:** Umfassende statistische Auswertungen und Vergleiche der diagnostischen Leistung von AS und T2-Kriterien.
* **Kerninhalte:**
    * **Layout-Umschaltung:** Button (`#statistik-layout-toggle`) für Einzelansicht (globales Kollektiv) oder Vergleichsansicht (zwei wählbare Kollektive via `#statistik-kollektiv-select-1`, `#statistik-kollektiv-select-2`).
    * **Statistische Analysen (in Kartenform):**
        * **Deskriptive Statistik:** Demographie, Basisraten, Diagramme (Alter, Geschlecht).
        * **Diagnostische Güte AS vs. N:** Detaillierte Metriken (Sens, Spez, etc.) mit 95%-KI, Konfusionsmatrix.
        * **Diagnostische Güte T2 vs. N:** Analog für aktuelle T2-Kriterien.
        * **Statistischer Vergleich AS vs. T2:** McNemar-Test (Accuracy), DeLong-Test (AUCs), p-Werte.
        * **Assoziationsanalysen:** OR, RD, Phi-Koeffizient für AS/T2-Merkmale vs. N-Status, mit 95%-KI und p-Werten.
        * **Kollektivvergleich (im Vergleichsmodus):** Vergleich von Accuracy/AUC zwischen zwei Kollektiven, p-Werte.
    * **Kriterienvergleichstabelle (`#criteria-comparison-container`):** Zusammenfassender Vergleich von AS, angewandten T2-Kriterien und Literatur-Sets (Koh et al., Barbaro et al., ESGAR) für das global gewählte Kollektiv.

### **7.4 Tab: Präsentation (`#praesentation-tab-pane`)**

* **Zweck:** Aufbereitung ausgewählter Ergebnisse für wissenschaftliche Präsentationen.
* **Kerninhalte:**
    * **Ansichtsauswahl (Radiobuttons `name="praesentationAnsicht"`):**
        * "Avocado Sign (Performance)": Fokus auf AS-Leistung.
        * "AS vs. T2 (Vergleich)": AS im Vergleich zu einer T2-Basis.
    * **T2-Vergleichsbasis-Auswahl (Dropdown `#praes-study-select`):** Wählt T2-Set (aktuelle Kriterien oder Literatur-Sets) für den Vergleich. Bei Literatur-Sets erfolgt ggf. eine automatische Anpassung des globalen Kollektivs.
    * **Darstellung:**
        * **Informationskarten (`#praes-t2-basis-info-card`):** Details zur gewählten T2-Basis (Referenz, Zielkollektiv, Kriterien).
        * **Vergleichstabellen:** Metriken (mit 95%-KI) und statistische Tests (McNemar, DeLong) für AS vs. T2-Basis.
        * **Balkendiagramme (`#praes-comp-chart-container`, `#praes-as-pur-perf-chart`):** Visueller Vergleich der Metriken.
    * **Download-Optionen:** Tabellen (CSV, MD, PNG), Diagramme (PNG, SVG).

### **7.5 Tab: Publikation (`#publikation-tab-pane`)**

* **Zweck:** Unterstützung bei der Erstellung eines wissenschaftlichen Manuskripts, ausgerichtet auf die Richtlinien des Fachjournals *Radiology*.
* **Kerninhalte:**
    * **Struktur:** Zweispaltig mit Navigationsleiste links und Inhaltsbereich rechts.
    * **Sprachauswahl (Switch `#publikation-sprache-switch`):** Deutsch / Englisch für alle generierten Inhalte.
    * **Sektionsauswahl (`#publikation-section-nav`):** Navigation durch typische Manuskriptabschnitte (Abstract, Einleitung, Material und Methoden, Ergebnisse, Diskussion, Literaturverzeichnis) mit *Radiology*-spezifischen Untergliederungen.
    * **BF-Zielmetrik-Auswahl (`#publikation-brute-force-metric-select`):** Bestimmt, welche Brute-Force-Ergebnisse (für optimierte T2-Kriterien) in den Text einfließen.
    * **Dynamisch generierte Inhalte (`#publikation-content-area`):**
        * Wissenschaftlich formulierte Textbausteine.
        * Integration aktueller Daten und Statistiken (p-Werte, CIs gemäß *Radiology*-Vorgaben).
        * Referenzen zu automatisch generierten Tabellen und Abbildungen.
        * Berücksichtigung formaler Struktur und stilistischer Anforderungen von *Radiology* (z.B. Abkürzungsmanagement, Darstellung statistischer Werte).
        * Spezifische Inhalte für Abstract (inkl. Key Results, Summary Statement), Einleitung, Material und Methoden (detailliert zu Studiendesign, Ethik, Patientenkohorte, MRT-Protokoll, Bildanalyse AS/T2, Referenzstandard, statistische Analyse), Ergebnisse (inkl. Patientencharakteristika), Diskussion (mit Limitationen) und Literaturverzeichnis.

### **7.6 Tab: Export (`#export-tab-pane`)**

* **Zweck:** Umfassende Exportmöglichkeiten für Daten, Analyseergebnisse und generierte Materialien.
* **Kerninhalte:**
    * **Exportoptionen (Buttons mit Tooltips):**
        * **Rohdaten:** CSV, XLSX (gefilterte aktuelle Kollektivdaten).
        * **Analysetabellen:** MD, XLSX (Daten-Tab, Auswertungs-Tab).
        * **Statistikberichte:** CSV, XLSX (vollständige Statistikübersicht), MD (deskriptive Statistik).
        * **Brute-Force-Berichte:** TXT (detaillierter Bericht der letzten Optimierung, Top 10).
        * **Diagramme:** ZIP-Archiv mit PNG und SVG (alle aktuell in der App sichtbaren Diagramme).
        * **Publikationstexte:** ZIP-Archiv mit MD-Dateien der einzelnen Publikationsabschnitte.
        * **Umfassender HTML-Bericht:** Zusammenfassung von Statistiken, Konfigurationen, eingebetteten Diagrammen; druckbar.
        * **Paket-Exporte:** ZIP-Archive für "Alle Excel-Tabellen", "Alle Markdown-Dateien", etc.
    * **Abhängigkeit:** Exporte basieren auf dem global gewählten Kollektiv und den aktuell angewendeten T2-Kriterien.

## **8. Wichtiger Hinweis (Disclaimer)**

Das **Lymphknoten T2 - Avocado Sign Analyse Tool** ist ausschließlich für **Forschungs- und Evaluationszwecke** bestimmt. Es ist **nicht als Medizinprodukt zugelassen** und darf **unter keinen Umständen für direkte klinische Diagnosen, Therapieentscheidungen oder andere medizinische Anwendungen an Patienten verwendet werden.** Die Verantwortung für die Interpretation und Nutzung der mit diesem Tool generierten Ergebnisse liegt vollständig beim Anwender und muss im Kontext der jeweiligen Studienlimitationen und des aktuellen wissenschaftlichen Kenntnisstandes erfolgen.

## **9. Autoren und Kontakt**

(Dieser Abschnitt kann von den Hauptentwicklern/Autoren der Studie mit ihren Namen und Kontaktinformationen ergänzt werden.)

* **Hauptentwickler/Studienautoren:** \[Namen und Affiliationen hier einfügen\]
* **Kontakt für technische Fragen oder Feedback zur Anwendung:** \[E-Mail-Adresse oder Link hier einfügen\]

## **10. Lizenz**

(Dieser Abschnitt sollte die Lizenzinformationen für die Software enthalten, z.B. MIT, GPL, etc. Falls keine spezifische Lizenz gewählt wurde, könnte hier "Alle Rechte vorbehalten" oder eine ähnliche Formulierung stehen.)

\[Hier Lizenzinformationen einfügen, falls zutreffend\]

---
Stand: 05. Juni 2025
