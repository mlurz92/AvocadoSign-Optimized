# Lymphknoten T2 - Avocado Sign Analyse Tool (v2.1.0)

## 1. Übersicht

Dies ist eine interaktive **Frontend-Webanwendung**, die speziell für die **detaillierte Analyse und den Vergleich** des "Avocado Signs" (AS) mit verschiedenen T2-gewichteten morphologischen Kriterien zur **Prädiktion des mesorektalen Lymphknotenstatus (N-Status)** bei Rektumkarzinompatienten entwickelt wurde. Sie basiert auf dem **Patientenkollektiv (N=106)** und den Erkenntnissen der Publikation *Lurz & Schäfer, European Radiology (2025)*.

Die Anwendung dient als spezialisiertes Werkzeug für Forschung und Analyse, um:
* Die diagnostische Leistung des AS gegenüber benutzerdefinierten und literatur-basierten T2-Kriterien zu evaluieren.
* Hypothesen durch flexible Kriteriendefinition und -kombination zu testen.
* Automatisierte Optimierungsverfahren (Brute-Force) zur Identifikation der besten T2-Kriterien für spezifische Metriken durchzuführen.
* Umfassende statistische Auswertungen zu generieren.
* Ergebnisse in **publikationsreifen** Formaten (Tabellen, Diagramme, Berichte) zu exportieren.

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
    * `Patienten`: Übersicht aller Patienten.
    * `Auswertung`: Dashboard, T2-Kriterien-Definition, Brute-Force, Auswertungstabelle.
    * `Statistik`: Detaillierte statistische Analysen.
    * `Präsentation`: Aufbereitete Vergleichsergebnisse.
    * `Export`: Download-Optionen.
    * `Methoden`: Beschreibung der Anwendungsmethodik.
* **Allgemeine Interaktion:**
    * **Tooltips:** Detaillierte Erklärungen für fast alle UI-Elemente.
    * **Tabellen:** Sortierbar durch Klick auf Spaltenköpfe (teilweise mit Sub-Sortierung für N/AS/T2), aufklappbare Detailzeilen.
    * **Formulare/Controls:** Interaktive Elemente zur Definition von T2-Kriterien und Steuerung von Analysen.
    * **Feedback:** Toast-Benachrichtigungen für Nutzeraktionen und Fehler.
    * **Responsivität:** Anpassung an verschiedene Bildschirmgrößen.

## 4. Kernfunktionalitäten (Details pro Tab)

### 4.1. Tab: Patienten

* Zeigt eine Tabelle mit Basisdaten und dem N/AS/T2-Status für jeden Patienten des ausgewählten Kollektivs.
* Sortierung nach allen Spalten möglich.
* **Aufklappbare Detailzeilen:** Visualisieren detailliert die T2-Lymphknotenmerkmale (Größe, Form, Kontur, Homogenität, Signal) mittels SVG-Icons.
* Ein Button erlaubt das gleichzeitige Ein-/Ausklappen aller Detailzeilen.

### 4.2. Tab: Auswertung

* **Dashboard:** Bietet eine schnelle Übersicht über das aktuelle Kollektiv mittels Kennzahlen und kleinen Diagrammen (Alter, Geschlecht, Therapie, Status N/AS/T2). Diagramme sind als PNG/SVG exportierbar.
* **T2-Kriterien-Definition (`js/core/t2_criteria_manager.js`):**
    * **Interaktive Karte:** Ermöglicht die flexible Definition von T2-Malignitätskriterien.
    * **Merkmale:** Einzeln aktivierbar/deaktivierbar:
        * `Größe`: Schwellenwert für Kurzachse (≥) via Slider/Input (Bereich: 0.1-25.0 mm).
        * `Form`: Auswahl 'rund' oder 'oval'.
        * `Kontur`: Auswahl 'scharf' oder 'irregulär'.
        * `Homogenität`: Auswahl 'homogen' oder 'heterogen'.
        * `Signal`: Auswahl 'signalarm', 'intermediär' oder 'signalreich'.
    * **Logik:** Wahl zwischen `UND` / `ODER` Verknüpfung der aktiven Kriterien.
    * **Aktionen:**
        * `Anwenden & Speichern`: Applikatiert die aktuellen Einstellungen auf den Datensatz, aktualisiert alle abhängigen Ansichten (Header-Statistiken, T2-Spalten, Statistik-Tab etc.) und speichert die Konfiguration im Local Storage.
        * `Zurücksetzen`: Setzt die Einstellungen auf den Default-Wert zurück (ohne Anwendung).
    * **Statusanzeige:** Eine visuelle Markierung der Karte zeigt ungespeicherte Änderungen an.
* **T2 Metrik-Übersicht:** Eine Karte zeigt die wichtigsten diagnostischen Gütekennzahlen (Sens, Spez, PPV, NPV, Acc, BalAcc, F1, AUC mit CIs) für die **aktuell angewendeten** T2-Kriterien im Vergleich zu N. Tooltips geben detaillierte Interpretationen.
* **Brute-Force-Optimierung (`js/workers/brute_force_worker.js`):**
    * **Ziel:** Findet die T2-Kriterienkombination, die eine gewählte Metrik (Accuracy, Balanced Accuracy, F1, PPV, NPV) maximiert.
    * **Steuerung:** Auswahl der Zielmetrik, Start-/Stop-Button.
    * **Anzeige:** Fortschrittsanzeige (%), aktueller bester Wert und Kriterien während der Laufzeit.
    * **Ergebnis:** Anzeige der besten Kombination nach Abschluss; Möglichkeit, diese direkt anzuwenden oder die Top-10-Ergebnisse im Detail (Modal) zu betrachten und als TXT zu exportieren.
    * **Technik:** Läuft in einem separaten Web Worker, um die UI nicht zu blockieren.
* **Auswertungstabelle:** Liste der Patienten mit Fokus auf N/AS/T2-Status und zugehörigen Lymphknotenzahlen (N+/N gesamt, AS+/AS gesamt, T2+/T2 gesamt). Sortierbar.
    * **Aufklappbare Detailzeilen:** Zeigen detailliert, welche Kriterien für jeden T2-Lymphknoten erfüllt wurden und ob der LK gemäß den **angewendeten** Regeln als positiv (+) oder negativ (-) bewertet wurde. Erfüllte Kriterien werden hervorgehoben.

### 4.3. Tab: Statistik

* Bietet umfassende statistische Analysen, basierend auf dem gewählten Kollektiv und den **angewendeten** T2-Kriterien (`js/services/statistics_service.js`).
* **Ansichten:**
    * `Einzelansicht`: Detaillierte Analyse für das global ausgewählte Kollektiv.
    * `Vergleich Aktiv`: Ermöglicht Auswahl zweier Kollektive für eine vergleichende Analyse nebeneinander.
* **Analysen:**
    * **Deskriptive Statistik:** Detaillierte Tabellen und Diagramme.
    * **Diagnostische Güte:** Tabellen für AS vs. N und T2 vs. N mit Sens, Spez, PPV, NPV, Acc, BalAcc, F1, AUC (inkl. 95% CIs und Methoden). Konfusionsmatrizen.
    * **Statistischer Vergleich (AS vs. T2, gepaart):** Ergebnisse für McNemar-Test (Accuracy) und DeLong-Test (AUC).
    * **Assoziationsanalyse (Merkmal vs. N):** OR, RD, Phi für AS und jedes T2-Merkmal (unabhängig von Aktivierung) in Bezug zum N-Status. p-Werte aus Fisher's Exact Test bzw. Mann-Whitney-U-Test (für Größe).
    * **Statistischer Vergleich (Kollektive, ungepaart):** Nur in Vergleichsansicht. Vergleich von Accuracy (Fisher) und AUC (Z-Test) für AS und T2 zwischen den beiden Kollektiven.
    * **Kriterienvergleich:** Tabelle mit diagnostischer Güte (Sens, Spez, etc.) für AS, angewandte T2-Kriterien und die implementierten Literatur-Kriteriensets.
* Alle Tabellen und Diagramme sind einzeln als PNG exportierbar.

### 4.4. Tab: Präsentation

* Stellt Ergebnisse in einem für Präsentationen optimierten Format dar (`js/ui/ui_view_logic.js`, `js/ui/renderers/chart_renderer.js`).
* **Ansichtswahl:**
    * `Avocado Sign (Daten)`: Fokussiert auf AS. Zeigt Performance-Tabelle für alle Kollektive und ein Performance-Chart für das global gewählte Kollektiv.
    * `AS vs. T2 (Vergleich)`:
        * **Auswahl T2-Basis:** Dropdown zur Auswahl der zu vergleichenden T2-Kriterien (Angewandte Kriterien, Koh 2008, Barbaro 2024, Rutegård 2025). Das globale Kollektiv wird ggf. automatisch angepasst.
        * **Info-Karte:** Zeigt Details zur ausgewählten T2-Basis (Referenz, Kriterienzusammenfassung).
        * **Vergleichs-Metrik-Tabelle (NEU):** Numerische Gegenüberstellung der Gütekriterien (Sens, Spez, etc. mit CIs) für AS und die gewählte T2-Basis.
        * **Statistische Tests:** Tabelle mit McNemar- und DeLong-Testergebnissen für den Vergleich AS vs. T2-Basis.
        * **Vergleichs-Chart:** Gruppiertes Balkendiagramm zum visuellen Vergleich der Metriken.
* Spezifische Download-Optionen für die angezeigten Tabellen (CSV, MD, PNG) und Charts (PNG, SVG).

### 4.5. Tab: Export

* Zentrale Anlaufstelle für alle Exportvorgänge (`js/services/export_service.js`).
* **Formate:** CSV (Semikolon-getrennt), Markdown (MD), Text (TXT), HTML, PNG, SVG.
* **Möglichkeiten:**
    * **Einzel-Exporte:** Detaillierte Statistik-Ergebnisse (CSV), Brute-Force Bericht (TXT), Deskriptive Tabelle (MD), Patientenliste (MD), Auswertungstabelle (MD), Gefilterte Rohdaten (CSV), Umfassender HTML-Report, Alle sichtbaren Diagramme/Tabellen (PNG-ZIP), Alle sichtbaren Diagramme (SVG-ZIP).
    * **Paket-Exporte (ZIP):** Gesamtpaket, Nur CSVs, Nur MDs.
* Alle Exporte beziehen sich auf das **global gewählte Kollektiv** und die **zuletzt angewendeten** T2-Kriterien.

### 4.6. Tab: Methoden

* Enthält eine **detaillierte Beschreibung der Methodik** der Anwendung, ähnlich einem "Material und Methoden"-Abschnitt einer wissenschaftlichen Publikation (`js/ui/core/ui_components.js`).
    * Softwarebeschreibung, Datenbasis, Kriterienbewertung (AS & T2), Literaturkriterien, Brute-Force, Statistische Analyse, Technologie.
* **Sprachumschalter (NEU):** Ermöglicht den Wechsel der Beschreibung zwischen Deutsch (`de`) und Englisch (`en`). Die Auswahl wird gespeichert (`js/app/state.js`, `js/ui/view_renderer.js`).

## 5. Technologie und Architektur

* **Typ:** Frontend Single-Page Application (SPA).
* **Technologien:** HTML5, CSS3, JavaScript (ES6+).
* **Bibliotheken:** Bootstrap 5.3, D3.js v7, Tippy.js v6, PapaParse v5, JSZip v3.
* **Architektur:** Modular aufgebaut nach Funktionalität (`app`, `config`, `core`, `services`, `ui`, `utils`, `workers`).
* **State Management:** Zentralisiert in `js/app/state.js`, nutzt Local Storage zur Persistierung ausgewählter Zustände.
* **Asynchronität:** Web Worker für Brute-Force-Optimierung, `setTimeout` zur Entkopplung von UI-Updates nach Rendering.
* **Code-Stil:** Effizient, kompakt, gut strukturiert, kommentarlos (gemäß Anforderung).

## 6. Setup und Installation

Die Anwendung erfordert keine Installation oder serverseitige Komponenten.

1.  Stellen Sie sicher, dass alle Dateien und Ordner (`index.html`, `css/`, `js/`, `data/`, `workers/`, `docs/`) vorhanden sind.
2.  Öffnen Sie die Datei `index.html` in einem modernen Webbrowser (z.B. Chrome, Firefox, Edge).

## 7. Verwendung

1.  **Kollektiv wählen:** Nutzen Sie die Buttons im Header, um das gewünschte Patientenkollektiv (`Gesamt`, `Direkt OP`, `nRCT`) auszuwählen. Die Statistiken im Header und der Inhalt der Tabs passen sich entsprechend an.
2.  **Tabs navigieren:** Klicken Sie auf die Reiter (`Patienten`, `Auswertung`, etc.), um die verschiedenen Funktionsbereiche anzuzeigen.
3.  **(Optional) T2-Kriterien definieren:** Gehen Sie zum Tab `Auswertung`. Nutzen Sie die interaktive Karte, um T2-Kriterien zu aktivieren/deaktivieren, Werte auszuwählen und die Logik (`UND`/`ODER`) einzustellen. Klicken Sie auf `Anwenden & Speichern`, um die Änderungen zu übernehmen und für Analysen sowie Exporte zu nutzen.
4.  **(Optional) Brute-Force ausführen:** Im Tab `Auswertung` die gewünschte Zielmetrik wählen und die Optimierung starten. Nach Abschluss können die besten Ergebnisse eingesehen und angewendet werden.
5.  **Ergebnisse analysieren:** Untersuchen Sie die Tabellen und Diagramme in den Tabs `Patienten`, `Auswertung`, `Statistik` und `Präsentation`. Nutzen Sie Tooltips für Detailinformationen.
6.  **(Optional) Literaturvergleich:** Im Tab `Präsentation` die Ansicht `AS vs. T2` wählen und eine Literatur-Basis aus dem Dropdown selektieren, um Vergleiche zu sehen.
7.  **Exportieren:** Im Tab `Export` die gewünschten Daten, Tabellen oder Berichte im passenden Format herunterladen. Einzelne Diagramme/Tabellen können auch direkt aus den anderen Tabs via Buttons im Karten-Header exportiert werden.
8.  **(Optional) Sprache ändern:** Im Tab `Methoden` den Schalter oben rechts nutzen, um zwischen deutscher und englischer Beschreibung zu wechseln.

## 8. Statistische Methoden (Zusammenfassung)

Die Anwendung verwendet etablierte statistische Verfahren, implementiert in `js/services/statistics_service.js`:

* Deskriptive Statistiken
* Berechnung diagnostischer Gütemaße (Sens, Spez, PPV, NPV, Acc, BalAcc/AUC, F1)
* Konfidenzintervalle (Wilson Score, Bootstrap Percentile, Woolf Logit, Wald)
* Vergleichstests (McNemar, DeLong, Fisher's Exact, Z-Test)
* Assoziationsmaße und -tests (OR, RD, Phi, Mann-Whitney U)
* Signifikanzniveau: p < 0.05

## 9. Literatur-Referenzen (für Vergleichssets)

* Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. *Eur Radiol*. 2025. (DOI: 10.1007/s00330-025-11462-y) - *Basisdatensatz & Avocado Sign Definition*
* Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. *Int J Radiat Oncol Biol Phys*. 2008;71(2):456-461.
* Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. *Radiother Oncol*. 2024;193:110124.
* Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. *Eur Radiol*. 2025. (DOI: 10.1007/s00330-025-11361-2) - *Evaluiert ESGAR 2016 Kriterien*
* Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. *Eur Radiol*. 2018;28(4):1465-1475. - *Ursprung der komplexen T2-Kriterien*

## 10. Konfiguration (`js/config/config.js`)

Wichtige Anwendungseinstellungen, Standardwerte, Speicher-Schlüssel, Pfade, Performance-Parameter, statistische Konstanten, T2-Kriterien-Bereiche und -Werte, UI-Einstellungen und Exportkonfigurationen sind zentral in dieser Datei definiert.

## 11. Limitationen

* Die Anwendung basiert auf einem **statischen, fest integrierten Datensatz (N=106)** und erlaubt keinen Upload eigener Daten.
* Die statistischen Berechnungen sind spezifisch für die Implementierung in JavaScript; komplexe Modellierungen sind nicht enthalten.
* Die Performance, insbesondere bei Chart-Rendering und Brute-Force, hängt von der Leistungsfähigkeit des Client-Browsers ab.
* Die Darstellung und Funktionalität ist für moderne Browser optimiert; Kompatibilität mit sehr alten Browsern ist nicht gewährleistet.

---
