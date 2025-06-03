# Avocado Sign Analyse

## Kurzbeschreibung
Die Webanwendung "Avocado Sign Analyse" ist ein spezialisiertes Werkzeug für medizinische Forscher und Radiologen zur Untersuchung und zum Vergleich bildbasierter Kriterien für das Lymphknotenstaging beim Rektumkarzinom. Der Schwerpunkt liegt auf der Analyse der diagnostischen Güte des "Avocado Signs" im Vergleich zu etablierten T2-gewichteten morphologischen MRT-Kriterien. Die Anwendung ermöglicht die interaktive Definition von T2-Kriteriensets, deren statistische Auswertung anhand eines integrierten Patientendatensatzes und die Generierung von Materialien für Präsentationen und wissenschaftliche Publikationen.

## Inhaltsverzeichnis
1.  [Einleitung und Hintergrund](#1-einleitung-und-hintergrund)
    1.1. [Wissenschaftlicher Kontext](#11-wissenschaftlicher-kontext)
    1.2. [Zielsetzung der Anwendung](#12-zielsetzung-der-anwendung)
2.  [Kernfunktionen im Überblick](#2-kernfunktionen-im-überblick)
3.  [Technologie-Stack](#3-technologie-stack)
4.  [Installation und Inbetriebnahme](#4-installation-und-inbetriebnahme)
5.  [Globale Benutzeroberfläche und Bedienkonzepte](#5-globale-benutzeroberfläche-und-bedienkonzepte)
    5.1. [Anwendungsheader](#51-anwendungsheader)
    5.2. [Hauptnavigation (Tabs)](#52-hauptnavigation-tabs)
    5.3. [Tooltips](#53-tooltips)
    5.4. [Benachrichtigungen](#54-benachrichtigungen)
6.  [Detaillierte Beschreibung der Module (Tabs)](#6-detaillierte-beschreibung-der-module-tabs)
    6.1. [Daten-Tab](#61-daten-tab)
    6.2. [Auswertungs-Tab](#62-auswertungs-tab)
    6.3. [Statistik-Tab](#63-statistik-tab)
    6.4. [Präsentations-Tab](#64-präsentations-tab)
    6.5. [Publikations-Tab](#65-publikations-tab)
    6.6. [Export-Tab](#66-export-tab)
7.  [Datenbasis](#7-datenbasis)
8.  [Einstellungen und Persistenz](#8-einstellungen-und-persistenz)
9.  [Zielgruppe](#9-zielgruppe)
10. [Wichtiger Hinweis (Disclaimer)](#10-wichtiger-hinweis-disclaimer)
11. [Lizenz](#11-lizenz)
12. [Mitwirkende und Kontakt](#12-mitwirkende-und-kontakt)

---

## 1. Einleitung und Hintergrund

### 1.1. Wissenschaftlicher Kontext
Das präoperative Staging von Lymphknotenmetastasen bei Rektumkarzinompatienten ist entscheidend für die Therapieplanung und Prognose. Die Magnetresonanztomographie (MRT) spielt hierbei eine zentrale Rolle. Während etablierte morphologische T2-gewichtete Kriterien existieren, wird kontinuierlich nach neuen, präziseren Markern gesucht. Das "Avocado Sign" wurde als ein solcher potenzieller neuer MRT-Marker identifiziert.

### 1.2. Zielsetzung der Anwendung
Diese Anwendung wurde entwickelt, um:
* Die diagnostische Güte des "Avocado Signs" zu evaluieren.
* Die Performance des "Avocado Signs" mit verschiedenen etablierten und benutzerdefinierten T2-Kriteriensets zu vergleichen.
* Die Optimierung von T2-Kriteriensets mittels Brute-Force-Methoden zu ermöglichen.
* Eine Plattform für detaillierte statistische Analysen und die Generierung von Ergebnissen für Forschung, Präsentation und Publikation bereitzustellen.

## 2. Kernfunktionen im Überblick
* **Interaktive Datenexploration:** Durchsuchen und Filtern eines klinischen Datensatzes von Rektumkarzinompatienten.
* **Flexible T2-Kriteriendefinition:** Benutzerdefinierte Erstellung und Anpassung von T2-basierten Malignitätskriterien für Lymphknoten.
* **Brute-Force-Optimierung:** Automatisierte Suche nach der optimalen Kriterienkombination zur Maximierung einer wählbaren diagnostischen Metrik.
* **Umfassende statistische Analysen:** Berechnung von deskriptiven Statistiken, diagnostischen Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, Balanced Accuracy, F1-Score, AUC) inklusive 95% Konfidenzintervallen, statistischen Vergleichstests und Assoziationsanalysen.
* **Vergleich von Kriteriensets:** Gegenüberstellung der Performance verschiedener Literaturkriterien, des Avocado Signs und benutzerdefinierter Kriterien.
* **Dynamische Visualisierungen:** Erstellung von Diagrammen zur Veranschaulichung von Datenverteilungen und Analyseergebnissen.
* **Publikationsunterstützung:** Generierung von Textbausteinen, Tabellen und Referenzen in Deutsch und Englisch.
* **Vielseitiger Datenexport:** Exportmöglichkeiten für Rohdaten, Analyseergebnisse, Tabellen und Grafiken in gängigen Formaten.

## 3. Technologie-Stack
* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **UI-Framework:** Bootstrap 5.3
* **Diagramme:** D3.js (für dynamische SVG-basierte Diagramme), Canvg (für SVG-zu-PNG Konvertierung)
* **Datenverarbeitung & Statistik:** Eigene JavaScript-Implementierungen.
* **Hilfsbibliotheken:** PapaParse (für CSV-Parsing, falls zukünftig benötigt), JSZip (für ZIP-Exporte), FileSaver.js (zum Speichern von Dateien).
* **Asynchrone Operationen:** Web Worker für die rechenintensive Brute-Force-Optimierung.

Die Anwendung ist eine reine Client-Side-Anwendung und erfordert keine serverseitige Infrastruktur.

## 4. Installation und Inbetriebnahme
Es ist keine Installation erforderlich. Die Anwendung kann direkt durch Öffnen der `index.html`-Datei in einem modernen Webbrowser gestartet werden. Alle notwendigen Bibliotheken werden über Content Delivery Networks (CDNs) geladen oder sind Teil des Pakets.

**Voraussetzungen:**
* Ein moderner Webbrowser (aktuelle Versionen von Chrome, Firefox, Edge, Safari empfohlen).
* Aktiviertes JavaScript.
* Für die volle Funktionalität der Brute-Force-Optimierung wird ein Browser benötigt, der Web Worker unterstützt.

## 5. Globale Benutzeroberfläche und Bedienkonzepte

### 5.1. Anwendungsheader
Der am oberen Bildschirmrand fixierte Header bietet:
* **Anwendungstitel.**
* **Dynamische Metadaten:** Anzeige von Informationen zum aktuell ausgewählten Kollektiv (Name, Patientenzahl, N-/AS-/T2-Status Verteilung).
* **Kollektiv-Auswahl:** Buttons ("Gesamt", "Direkt-OP", "nRCT") zur schnellen Filterung des Datensatzes. Die Patientenzahl (N) für jedes Kollektiv wird im Tooltip des jeweiligen Buttons angezeigt.
* **Hilfe-Button:** Öffnet ein Modal mit einer Kurzanleitung.
* **"Reset Einstellungen"-Button:** Setzt alle gespeicherten Benutzereinstellungen auf die Standardwerte zurück.
* **"Extras"-Dropdown:**
    * **Diagramm-Farbschema:** Auswahl verschiedener visueller Stile für Diagramme.
    * **Brute-Force Ergebnisse löschen:** Entfernt alle gespeicherten Ergebnisse von Brute-Force-Optimierungsläufen.

### 5.2. Hauptnavigation (Tabs)
Die Hauptfunktionalität ist in sechs Tabs unterteilt, die über eine Navigationsleiste unterhalb des Headers erreichbar sind:
* Daten
* Auswertung
* Statistik
* Präsentation
* Publikation
* Export

### 5.3. Tooltips
Zahlreiche UI-Elemente sind mit kontextsensitiven Tooltips versehen, die bei Überfahren mit der Maus erscheinen und zusätzliche Erklärungen oder Informationen liefern. Diese werden mittels Bootstrap Tooltips realisiert.

### 5.4. Benachrichtigungen
Die Anwendung nutzt Toast-Benachrichtigungen (kurze Einblendungen, meist am unteren rechten Bildschirmrand), um Feedback zu Nutzeraktionen zu geben (z.B. "Einstellungen gespeichert").

## 6. Detaillierte Beschreibung der Module (Tabs)

### 6.1. Daten-Tab
* **Zweck:** Anzeige und Exploration des detaillierten Patientendatensatzes.
* **Funktionen:**
    * Filterung nach global ausgewähltem Kollektiv.
    * Anzeige einer Tabelle mit Patienteninformationen: Nr., Name, Vorname, Geschlecht, Alter, Therapie, N/AS/T2-Status, Bemerkungen.
    * Sortierung der Tabelle durch Klick auf Spaltenüberschriften (inkl. Sub-Sortierung für N, AS, T2).
    * Aufklappbare Detailansicht pro Patient, die alle erfassten T2-Lymphknotenmerkmale (Größe, Form, Kontur, Homogenität, Signal) anzeigt.
    * Button zum gleichzeitigen Ein-/Ausklappen aller Detailansichten.

### 6.2. Auswertungs-Tab
* **Zweck:** Definition und Optimierung von T2-basierten Malignitätskriterien sowie detaillierte Analyse der Kriterienanwendung auf Patientenebene.
* **Bereich "T2 Malignitäts-Kriterien Definieren":**
    * Interaktive Auswahl und Einstellung der morphologischen Kriterien: Größe (Schwellenwert), Form, Kontur, Homogenität, Signal.
    * Wahl der logischen Verknüpfung (UND/ODER) der aktiven Kriterien.
    * Buttons zum Anwenden/Speichern der Kriterien (aktualisiert die gesamte Anwendung) und zum Zurücksetzen auf Standardwerte.
    * Textuelle Anzeige der aktuell angewandten Kriterien und Logik.
    * Visueller Hinweis bei ungespeicherten Änderungen an den Kriterien.
* **Bereich "Kriterien-Optimierung (Brute-Force)":**
    * Auswahl einer diagnostischen Zielmetrik (z.B. Balanced Accuracy, F1-Score).
    * Starten der Brute-Force-Optimierung für das aktuell ausgewählte Kollektiv.
    * Anzeige des Fortschritts und der besten bisher gefundenen Kriterienkombination.
    * Möglichkeit zum Abbrechen der Optimierung.
    * Nach Abschluss: Anzeige des besten Ergebnisses (Metrikwert, Logik, Kriterien, Dauer, Kollektivstatistiken).
    * Buttons zum Anwenden der besten gefundenen Kriterien und zum Anzeigen der Top-Ergebnisse in einem Modal-Fenster.
* **Auswertungstabelle:**
    * Zeigt Patienten des aktuellen Kollektivs mit ihrem N/AS/T2-Status (T2-Status basiert auf den aktuell im Panel *eingestellten*, nicht zwingend gespeicherten Kriterien).
    * Stellt die Anzahl positiver und gesamter Lymphknoten für N, AS und T2 dar.
    * Aufklappbare Detailansicht pro Patient zur detaillierten Nachverfolgung der Bewertung jedes einzelnen T2-Lymphknotens anhand der eingestellten Kriterien.

### 6.3. Statistik-Tab
* **Zweck:** Umfassende statistische Auswertung und Darstellung der Ergebnisse.
* **Funktionen:**
    * Umschaltbare Ansicht: "Einzelansicht" (detaillierte Statistiken für ein Kollektiv) oder "Vergleichsansicht" (Vergleich zweier Kollektive).
    * **Einzelansicht:**
        * **Deskriptive Statistik:** Demographie, Statusverteilungen, Lymphknotenanzahlen, Alters- und Geschlechterverteilungsdiagramme.
        * **Diagnostische Güte (AS vs. N):** Konfusionsmatrix und Gütekriterien (Sens, Spez, PPV, NPV, Acc, BalAcc, F1, AUC) mit 95% CI.
        * **Diagnostische Güte (T2 vs. N):** Analog für die aktuell angewendeten T2-Kriterien.
        * **Statistischer Vergleich (AS vs. T2):** McNemar-Test (Accuracy), DeLong-Test (AUC).
        * **Assoziationsanalyse:** Odds Ratio, Risk Difference, Phi-Koeffizient, p-Werte für die Assoziation von Merkmalen (AS, T2-Einzelkriterien) mit dem N-Status.
        * **Vergleich verschiedener Kriteriensätze:** Gegenüberstellung der Performance von AS, angewandten T2-Kriterien und Literatur-Kriteriensätzen.
    * **Vergleichsansicht:**
        * Statistischer Vergleich der Accuracy und AUC (für AS und T2) zwischen zwei wählbaren Kollektiven.
    * Alle Tabellen bieten Download-Optionen (MD, PNG).

### 6.4. Präsentations-Tab
* **Zweck:** Generierung von Diagrammen und Tabellen zur Ergebnispräsentation.
* **Funktionen:**
    * Umschaltbare Ansicht: "Avocado Sign (Performance)" oder "AS vs. T2 (Vergleich)".
    * **Ansicht "Avocado Sign (Performance)":**
        * Tabelle der AS-Performance (Sens, Spez, etc.) für alle drei Kollektive (Gesamt, direkt OP, nRCT).
        * Balkendiagramm der AS-Performance für das aktuell global ausgewählte Kollektiv.
    * **Ansicht "AS vs. T2 (Vergleich)":**
        * Auswahl einer T2-Vergleichsbasis (eingestellte Kriterien oder Literaturstudien).
        * Informationskarte mit Details zur gewählten T2-Basis.
        * Vergleichstabelle der Metriken für AS vs. ausgewählte T2-Basis.
        * Tabelle der statistischen Tests (McNemar, DeLong) für diesen Vergleich.
        * Vergleichs-Balkendiagramm (AS vs. T2).
    * Alle Tabellen und Diagramme bieten Download-Optionen (CSV, MD, PNG, SVG).

### 6.5. Publikations-Tab
* **Zweck:** Unterstützung bei der Erstellung wissenschaftlicher Publikationen.
* **Funktionen:**
    * Navigation durch typische Publikationsabschnitte (Einleitung, Methoden, Ergebnisse, Diskussion, Referenzen, Tabellen).
    * Auswahl der Sprache (Deutsch/Englisch).
    * Auswahl der Brute-Force-Metrik für die Ergebnisdarstellung optimierter T2-Kriterien.
    * Dynamische Generierung von Textbausteinen, formatierten Tabellen und Referenzlisten basierend auf den aktuellen Daten, Einstellungen und der gewählten Sprache.

### 6.6. Export-Tab
* **Zweck:** Zentraler Export von Daten, Ergebnissen und Berichten.
* **Funktionen:**
    * Anzeige verschiedener Exportoptionen, gruppiert nach Einzel-Exporten und ZIP-Paketen.
    * Exporte basieren auf dem aktuell global ausgewählten Kollektiv und den angewendeten T2-Kriterien.
    * Verfügbare Formate: CSV, MD, TXT, HTML, PNG, SVG, ZIP.
    * Exportierbare Inhalte: Statistik-Ergebnisse, Brute-Force-Bericht, deskriptive Statistik, Datenlisten, Auswertungstabellen, Diagramme (einzeln oder gebündelt), Publikationstexte.

## 7. Datenbasis
Die Anwendung verwendet einen fest integrierten, statischen Patientendatensatz, der in der Datei `data/data.js` definiert ist. Dieser enthält anonymisierte/kodierte Daten von Rektumkarzinompatienten, inklusive demographischer Informationen, Therapieangaben, pathologischem N-Status, Avocado Sign-Status und detaillierten morphologischen Merkmalen von T2-gewichteten Lymphknoten-MRT-Bildern.

Wichtige Felder umfassen `nr`, `name`, `vorname`, `geschlecht`, `alter`, `therapie`, `n` (Goldstandard N-Status), `anzahl_patho_lk`, `anzahl_patho_n_plus_lk`, `as` (Avocado Sign), `anzahl_as_lk`, `anzahl_as_plus_lk` sowie ein Array `lymphknoten_t2` mit Objekten für jeden T2-bewerteten Lymphknoten (inkl. `groesse`, `form`, `kontur`, `homogenitaet`, `signal`).

## 8. Einstellungen und Persistenz
Benutzerspezifische Einstellungen wie die aktuell definierten T2-Kriterien, die gewählte Logik, Sortierreihenfolgen, das aktive Kollektiv, UI-Zustände und Ergebnisse der Brute-Force-Optimierung werden im LocalStorage des Webbrowsers gespeichert. Dadurch bleiben diese Einstellungen auch nach dem Schließen und erneuten Öffnen der Anwendung erhalten. Über den "Reset Einstellungen"-Button im Header können alle Einstellungen auf die Standardwerte zurückgesetzt werden.

## 9. Zielgruppe
Die Anwendung richtet sich primär an medizinische Fachkreise, insbesondere Radiologen, Strahlentherapeuten, Onkologen und medizinische Forscher, die sich mit der Diagnostik und dem Staging des Rektumkarzinoms beschäftigen.

## 10. Wichtiger Hinweis (Disclaimer)
Diese Anwendung ist ein Werkzeug für Forschungs- und Analysezwecke. Die generierten Ergebnisse und Kriterien dienen der wissenschaftlichen Untersuchung und dürfen nicht direkt für klinische Entscheidungen bei einzelnen Patienten herangezogen werden, ohne eine sorgfältige, individuelle ärztliche Beurteilung und die Berücksichtigung etablierter medizinischer Leitlinien. Die Entwickler übernehmen keine Haftung für die Nutzung der Anwendung oder die Interpretation ihrer Ergebnisse im klinischen Kontext.

## 11. Lizenz
Das Projekt steht derzeit unter keiner expliziten Open-Source-Lizenz. Bitte kontaktieren Sie die Autoren für Informationen bezüglich der Nutzungsrechte. Es wird empfohlen, eine passende Lizenz (z.B. MIT, GPL) hinzuzufügen, falls das Projekt öffentlich geteilt werden soll.

## 12. Mitwirkende und Kontakt
Informationen zu den Mitwirkenden und Kontaktmöglichkeiten sind derzeit nicht Teil dieser README-Datei. Es wird empfohlen, diese Informationen bei Bedarf zu ergänzen.
