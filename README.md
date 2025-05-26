# Lymphknoten T2 - Avocado Sign Analyse Tool (v2.2.0)

## 1. Übersicht

Dies ist eine interaktive **Frontend-Webanwendung**, die speziell für die **detaillierte Analyse und den Vergleich** des "Avocado Signs" (AS) mit verschiedenen T2-gewichteten morphologischen Kriterien zur **Prädiktion des mesorektalen Lymphknotenstatus (N-Status)** bei Rektumkarzinompatienten entwickelt wurde. Sie basiert auf dem **Patientenkollektiv (N=106)** und den Erkenntnissen der Publikation *Lurz & Schäfer, European Radiology (2025)*.

Die Anwendung dient als spezialisiertes Werkzeug für Forschung und Analyse, um:
* Die diagnostische Leistung des AS gegenüber benutzerdefinierten und literatur-basierten T2-Kriterien zu evaluieren.
* Hypothesen durch flexible Kriteriendefinition und -kombination zu testen.
* Automatisierte Optimierungsverfahren (Brute-Force) zur Identifikation der besten T2-Kriterien für spezifische Metriken durchzuführen.
* Umfassende statistische Auswertungen zu generieren.
* Ergebnisse in **publikationsreifen** Formaten (Tabellen, Diagramme, Berichte und Textvorschläge) zu exportieren und zu generieren.

**Zielgruppe:** Primär die Autoren der Avocado-Sign Studie sowie Forschende im Bereich der radiologischen Diagnostik und Rektumkarzinom-Staging.

## 2. Datenbasis und Verarbeitung

* **Datenquelle:** Ein **statischer, integrierter JavaScript-Datensatz** (`data/data.js`) mit 106 anonymisierten Patienten aus der Avocado-Sign Studie (Lurz & Schäfer, 2025).
* **Patientenkollektiv:**
    * `Gesamt`: N=106
    * `Direkt OP`: N=29 (Patienten ohne neoadjuvante Therapie)
    * `nRCT`: N=77 (Patienten nach neoadjuvanter Radiochemotherapie)
* **Datenmodell (pro Patient):** Umfasst demographische Daten, Therapiegruppe, pathologischen N-Status (Referenzstandard: `n` ['+', '-'], `anzahl_patho_lk`, `anzahl_patho_n_plus_lk`), Avocado-Sign-Status (`as` ['+', '-'], `anzahl_as_lk`, `anzahl_as_plus_lk`) und ein Array (`lymphknoten_t2`) mit detaillierten morphologischen Beschreibungen jedes T2-sichtbaren Lymphknotens (`groesse`, `form`, `kontur`, `homogenitaet`, `signal`).
* **Datenverarbeitung (`js/core/data_processor.js`):**
    * Validierung und Bereinigung der Rohdaten beim Start.
    * Berechnung des Patientenalters.
    * Standardisierung fehlender/ungültiger Werte.
    * Filterung der Daten basierend auf dem global ausgewählten Kollektiv.
    * Berechnung von Header-Statistiken.
* **Dynamische T2-Bewertung (`js/core/t2_criteria_manager.js`):** Fügt dem Patienten-Datenmodell bei Anwendung von T2-Kriterien dynamisch hinzu:
    * `t2`: Gesamt-T2-Status des Patienten ('+' oder '-').
    * `anzahl_t2_plus_lk`: Anzahl positiver T2-LK.
    * `lymphknoten_t2_bewertet`: Detaillierte Bewertung jedes T2-LK.

## 3. Benutzeroberfläche und Bedienung

Die Anwendung wird über eine intuitive, tab-basierte Oberfläche gesteuert.

* **Header:**
    * Permanente Anzeige des Anwendungstitels.
    * Dynamische Anzeige von Schlüsselstatistiken (Patientenzahl, N+/AS+/T2+-Raten) für das aktuelle Kollektiv.
    * Buttons zur Auswahl des globalen **Patientenkollektivs** (`Gesamt`, `Direkt OP`, `nRCT`).
* **Tab-Navigation:**
    * `Daten`: Übersicht aller Patienten.
    * `Auswertung`: Dashboard, T2-Kriterien-Definition, Brute-Force, Auswertungstabelle.
    * `Statistik`: Detaillierte statistische Analysen.
    * `Präsentation`: Aufbereitete Vergleichsergebnisse.
    * `Publikation`: Generierung von Texten, Tabellen und Diagrammen für eine wissenschaftliche Publikation.
    * `Export`: Download-Optionen.
* **Allgemeine Interaktion:**
    * **Tooltips:** Detaillierte Erklärungen für fast alle UI-Elemente.
    * **Tabellen:** Sortierbar durch Klick auf Spaltenköpfe (teilweise mit Sub-Sortierung für N/AS/T2), aufklappbare Detailzeilen.
    * **Formulare/Controls:** Interaktive Elemente zur Definition von T2-Kriterien und Steuerung von Analysen.
    * **Feedback:** Toast-Benachrichtigungen für Nutzeraktionen und Fehler.
    * **Responsivität:** Anpassung an verschiedene Bildschirmgrößen.

## 4. Kernfunktionalitäten (Details pro Tab)

### 4.1. Tab: Daten

* Zeigt eine Tabelle mit Basisdaten und dem N/AS/T2-Status für jeden Patienten des ausgewählten Kollektivs.
* Sortierung nach allen Spalten möglich.
* **Aufklappbare Detailzeilen:** Visualisieren detailliert die T2-Lymphknotenmerkmale (Größe, Form, Kontur, Homogenität, Signal) mittels SVG-Icons.
* Ein Button erlaubt das gleichzeitige Ein-/Ausklappen aller Detailzeilen.

### 4.2. Tab: Auswertung

* **Dashboard:** Bietet eine schnelle Übersicht über das aktuelle Kollektiv mittels Kennzahlen und kleinen Diagrammen (Alter, Geschlecht, Therapie, Status N/AS/T2). Diagramme sind als PNG/SVG exportierbar.
* **T2-Kriterien-Definition (`js/core/t2_criteria_manager.js`):**
    * **Interaktive Karte:** Ermöglicht die flexible Definition von T2-Malignitätskriterien.
    * **Merkmale:** Einzeln aktivierbar/deaktivierbar: Größe (Schwellenwert via Slider/Input), Form, Kontur, Homogenität, Signal.
    * **Logik:** Wahl zwischen `UND` / `ODER` Verknüpfung.
    * **Aktionen:** `Anwenden & Speichern`, `Zurücksetzen`.
    * **Statusanzeige:** Visuelle Markierung bei ungespeicherten Änderungen.
* **T2 Metrik-Übersicht:** Kompakte Darstellung der Gütekriterien für angewandte T2-Kriterien vs. N.
* **Brute-Force-Optimierung (`workers/brute_force_worker.js`):**
    * Findet optimale T2-Kriterienkombination für gewählte Metrik (Accuracy, Balanced Accuracy, F1, PPV, NPV).
    * Anzeige von Fortschritt und bestem Ergebnis; Möglichkeit zum Anwenden oder Anzeigen der Top-10 (Modal mit Export).
* **Auswertungstabelle:** Liste der Patienten mit N/AS/T2-Status und LK-Zahlen. Detailzeilen zeigen Bewertung einzelner T2-LKs.

### 4.3. Tab: Statistik

* Umfassende Analysen basierend auf angewendeten T2-Kriterien (`js/services/statistics_service.js`).
* **Ansichten:** `Einzelansicht` (globales Kollektiv) oder `Vergleich Aktiv` (zwei wählbare Kollektive).
* **Analysen:** Deskriptive Statistik, Diagnostische Güte (AS vs. N; T2 vs. N), Statistische Vergleiche (gepaart: AS vs. T2; ungepaart: Kollektiv A vs. B), Assoziationsanalysen, Kriterienvergleichstabelle (AS, angewandte T2, Literatur-Sets).
* Koh et al. (2008) Kriterien werden im Kriterienvergleich auf das Gesamtkollektiv angewendet.

### 4.4. Tab: Präsentation

* Ergebnisse in präsentationsfreundlichem Format.
* **Ansichten:**
    * `Avocado Sign (Daten)`: AS-Performance-Tabelle (alle Kollektive) und Chart (globales Kollektiv).
    * `AS vs. T2 (Vergleich)`: Auswahl der T2-Vergleichsbasis (angewandt oder Literatur), Info-Karte zur T2-Basis, Vergleichs-Metrik-Tabelle, statistische Tests (McNemar, DeLong), Vergleichs-Chart.
* Download-Optionen für Tabellen und Charts.

### 4.5. Tab: Publikation

* Unterstützt die Erstellung einer wissenschaftlichen Publikation zum Vergleich von AS mit T2-Kriterien.
* **Steuerung:** Sprachumschalter (Deutsch/Englisch), Auswahl der Brute-Force Zielmetrik für Ergebnisdarstellung.
* **Layout:** Seitliche Navigation für Publikationsabschnitte (Methoden, Ergebnisse mit Unterpunkten), Hauptinhaltsbereich mit scrollbarem Inhalt.
* **Inhalte:** Dynamisch generierte Textvorschläge (basierend auf App-Daten, Sprache und Literatur), unterstützende Tabellen und Diagramme für jeden Abschnitt.

### 4.6. Tab: Export

* Zentrale Stelle für Daten- und Ergebnisdownload (`js/services/export_service.js`).
* **Formate:** CSV, Markdown (MD), Text (TXT), HTML, PNG, SVG.
* **Möglichkeiten:** Einzel-Exporte (Statistik, Brute-Force, Deskriptiv-MD, Daten-MD, Auswertung-MD, Rohdaten-CSV, HTML-Report, Diagramm-ZIPs) und Paket-Exporte (Gesamt, CSVs, MDs).

## 5. Technologie und Architektur

* **Typ:** Frontend Single-Page Application (SPA).
* **Technologien:** HTML5, CSS3, JavaScript (ES6+).
* **Bibliotheken:** Bootstrap 5.3, D3.js v7, Tippy.js v6, PapaParse v5, JSZip v3.
* **Architektur:** Modular (`app`, `config`, `core`, `services`, `ui`, `utils`, `workers`).
* **State Management:** `js/app/state.js`, nutzt Local Storage.
* **Asynchronität:** Web Worker für Brute-Force, `setTimeout` für UI-Entkopplung.

## 6. Setup und Installation

1.  Stellen Sie sicher, dass alle Dateien und Ordner (`index.html`, `css/`, `js/`, `data/`, `workers/`, `docs/`) vorhanden sind.
2.  Öffnen Sie die Datei `index.html` in einem modernen Webbrowser.

## 7. Verwendung

1.  **Kollektiv wählen:** Buttons im Header.
2.  **Tabs navigieren:** Reiter anklicken.
3.  **(Optional) T2-Kriterien definieren:** Tab `Auswertung`, Änderungen `Anwenden & Speichern`.
4.  **(Optional) Brute-Force ausführen:** Tab `Auswertung`.
5.  **Ergebnisse analysieren:** Tabs `Daten`, `Auswertung`, `Statistik`, `Präsentation`.
6.  **(Optional) Literaturvergleich:** Tab `Präsentation`, Ansicht `AS vs. T2`.
7.  **Publikationstexte generieren:** Tab `Publikation`, Sprache und ggf. BF-Metrik wählen, durch Abschnitte navigieren.
8.  **Exportieren:** Tab `Export`.

## 8. Statistische Methoden (Zusammenfassung)

Implementiert in `js/services/statistics_service.js`: Deskriptive Statistiken, diagnostische Gütemaße (Sens, Spez, PPV, NPV, Acc, BalAcc/AUC, F1) mit 95% CIs (Wilson Score, Bootstrap, Woolf Logit, Wald), Vergleichstests (McNemar, DeLong, Fisher's Exact, Z-Test), Assoziationsmaße (OR, RD, Phi, Mann-Whitney U). Signifikanzniveau p < 0.05.

## 9. Literatur-Referenzen (für Vergleichssets)

* Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. *Eur Radiol*. 2025. (DOI: 10.1007/s00330-025-11462-y)
* Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. *Int J Radiat Oncol Biol Phys*. 2008;71(2):456-461.
* Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. *Radiother Oncol*. 2024;193:110124.
* Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. *Eur Radiol*. 2025. (DOI: 10.1007/s00330-025-11361-2)
* Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. *Eur Radiol*. 2018;28(4):1465-1475.

## 10. Konfiguration (`js/config/config.js`, `js/config/publication_config.js`)

Wichtige Anwendungseinstellungen sind hier zentral definiert.

## 11. Limitationen

* Basiert auf einem **statischen Datensatz (N=106)**; kein Daten-Upload.
* Statistische Berechnungen sind spezifisch für die Implementierung.
* Performance hängt von Client-Browser/Computer ab.
* Optimiert für moderne Browser.
