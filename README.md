# Lymphknoten T2 - Avocado Sign Analyse Tool (v2.3.0)

## 1. Übersicht

Dies ist eine interaktive **Frontend-Webanwendung (Version 2.3.0)**, die speziell für die **detaillierte Analyse und den wissenschaftlichen Vergleich** des "Avocado Signs" (AS) mit verschiedenen T2-gewichteten morphologischen Kriterien zur **Prädiktion des mesorektalen Lymphknotenstatus (N-Status)** bei Rektumkarzinompatienten entwickelt wurde. Sie basiert auf dem **Patientenkollektiv (N=106)** und den Erkenntnissen der Publikation *Lurz & Schäfer, European Radiology (2025)*.

Die Anwendung dient als spezialisiertes Werkzeug für Forschung und Analyse, um:
* Die diagnostische Leistung des AS gegenüber benutzerdefinierten und literatur-basierten T2-Kriterien zu evaluieren.
* Hypothesen durch flexible Kriteriendefinition und -kombination zu testen.
* Automatisierte Optimierungsverfahren (Brute-Force) zur Identifikation der besten T2-Kriterien für spezifische Metriken durchzuführen.
* Umfassende statistische Auswertungen zu generieren, inklusive Konfidenzintervallen mit Hinweisen auf Unsicherheiten bei kleinen Fallzahlen.
* Ergebnisse in **publikationsreifen** Formaten (Tabellen, Diagramme, Berichte und Textvorschläge) zu exportieren und zu generieren, inklusive präzisierter Referenzierung und erweiterter Methodentexte.

**Zielgruppe:** Primär die Autoren der Avocado-Sign Studie sowie Forschende im Bereich der radiologischen Diagnostik und Rektumkarzinom-Staging.

## 2. Datenbasis und Verarbeitung

* **Datenquelle:** Ein **statischer, integrierter JavaScript-Datensatz** (`data/data.js`) mit 106 anonymisierten Patienten aus der Avocado-Sign Studie (Lurz & Schäfer, 2025).
* **Patientenkollektiv:**
    * `Gesamt`: N=106
    * `Direkt OP`: N=29 (Patienten ohne neoadjuvante Therapie)
    * `nRCT`: N=77 (Patienten nach neoadjuvanter Radiochemotherapie)
* **Datenmodell (pro Patient):** Umfasst demographische Daten, Therapiegruppe, pathologischen N-Status (Referenzstandard: `n` ['+', '-'], `anzahl_patho_lk`, `anzahl_patho_n_plus_lk`), Avocado-Sign-Status (`as` ['+', '-'], `anzahl_as_lk`, `anzahl_as_plus_lk`) und ein Array (`lymphknoten_t2`) mit detaillierten morphologischen Beschreibungen jedes T2-sichtbaren Lymphknotens (`groesse`, `form`, `kontur`, `homogenitaet`, `signal`).
* **Datenverarbeitung (`js/core/data_processor.js`):** Validierung, Bereinigung, Berechnung des Alters, Filterung nach Kollektiv, Berechnung von Header-Statistiken.
* **Dynamische T2-Bewertung (`js/core/t2_criteria_manager.js`):** Fügt dem Patienten-Datenmodell bei Anwendung von T2-Kriterien dynamisch hinzu: `t2`-Status, `anzahl_t2_plus_lk`, `lymphknoten_t2_bewertet`.

## 3. Benutzeroberfläche und Bedienung

* **Header:** Permanente Anzeige des Titels, dynamische Schlüsselstatistiken, Buttons zur globalen Kollektiv-Auswahl und ein Button zur Anzeige der Kurzanleitung.
* **Tab-Navigation:** `Daten`, `Auswertung`, `Statistik`, `Präsentation`, `Publikation`, `Export`.
* **Allgemeine Interaktion:**
    * **Tooltips:** Detaillierte Erklärungen für UI-Elemente.
    * **Tabellen:** Sortierbar, aufklappbare Detailzeilen, erste Spalte fixiert für bessere Navigation.
    * **Kurzanleitung:** Wird beim ersten Start der Anwendung automatisch angezeigt und kann jederzeit manuell aufgerufen werden.
    * **Responsivität:** Anpassung an verschiedene Bildschirmgrößen.

## 4. Kernfunktionalitäten (Details pro Tab)

### 4.1. Tab: Daten
Anzeige der Patientendaten des gewählten Kollektivs. Detailzeilen visualisieren T2-Lymphknotenmerkmale.

### 4.2. Tab: Auswertung
Zentral für T2-Kriteriendefinition und -optimierung.
* **Dashboard:** Visuelle Übersicht des Kollektivs.
* **T2-Kriterien-Definition:** Interaktive Konfiguration von Merkmalen (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER). Änderungen müssen "Angewendet & Gespeichert" werden.
* **T2 Metrik-Übersicht:** Kompakte Darstellung der Güte der angewendeten T2-Kriterien.
* **Brute-Force-Optimierung:** Automatische Suche nach optimalen T2-Kriterien für eine gewählte Metrik. Anzeige von Fortschritt und besten Ergebnissen (Top-10 im Modal mit detaillierten Metriken).
* **Auswertungstabelle:** Patientenliste mit N/AS/T2-Status und LK-Zahlen. Detailzeilen zeigen Bewertung einzelner T2-LKs.

### 4.3. Tab: Statistik
Detaillierte statistische Analysen basierend auf angewendeten T2-Kriterien.
* **Ansichten:** `Einzelansicht` oder `Vergleich Aktiv` zweier Kollektive.
* **Analysen:** Deskriptive Statistik, Diagnostische Güte (AS vs. N; T2 vs. N) mit 95% CIs (inkl. Warnhinweisen bei kleinen Fallzahlen), Statistische Vergleiche (AS vs. T2; Kollektiv A vs. B), Assoziationsanalysen, Kriterienvergleichstabelle (AS, angewandt, Literatur-Sets).

### 4.4. Tab: Präsentation
Aufbereitete Ergebnisse für Vorträge.
* **Ansichten:** `Avocado Sign (Performance)` oder `AS vs. T2 (Vergleich)` mit Auswahl der T2-Basis (angewandt oder Literatur).
* Enthält Vergleichstabellen, statistische Tests und Diagramme.

### 4.5. Tab: Publikation
Unterstützt die Erstellung einer wissenschaftlichen Publikation.
* **Steuerung:** Sprachumschalter (Deutsch/Englisch), Auswahl der BF-Zielmetrik für Ergebnisdarstellung.
* **Inhalte:** Dynamisch generierte Textvorschläge für Methoden und Ergebnisse, präzise Referenzierung von Tabellen/Abbildungen, unterstützende Tabellen/Diagramme und eine rudimentäre Referenzliste.

### 4.6. Tab: Export
Zentrale Stelle für Daten- und Ergebnisdownload.
* **Formate:** CSV (mit präziseren p-Werten), MD, TXT, HTML, PNG, SVG.
* Umfasst Einzelexporte und thematische ZIP-Pakete.

## 5. Technologie und Architektur

* **Typ:** Frontend SPA.
* **Technologien:** HTML5, CSS3, JavaScript (ES6+).
* **Bibliotheken:** Bootstrap 5.3, D3.js v7, Tippy.js v6, PapaParse v5, JSZip v3.
* **Architektur:** Modular, mit spezifischen Event-Handler-Modulen in `js/ui/event_handlers/`.
* **Asynchronität:** Web Worker für Brute-Force.

## 6. Setup und Installation

1.  Sicherstellen, dass alle Dateien und Ordner vorhanden sind.
2.  Datei `index.html` im Webbrowser öffnen.

## 7. Verwendung (Kurzübersicht)

1.  **Kollektiv wählen** (Header).
2.  **Tabs navigieren**.
3.  **T2-Kriterien definieren** (Tab `Auswertung`) und **Anwenden & Speichern**.
4.  **Brute-Force ausführen** (Tab `Auswertung`, optional).
5.  **Ergebnisse analysieren** (Tabs `Daten`, `Auswertung`, `Statistik`, `Präsentation`).
6.  **Publikationstexte generieren** (Tab `Publikation`).
7.  **Exportieren** (Tab `Export`).

## 8. Statistische Methoden

Implementiert in `js/services/statistics_service.js`. Umfasst deskriptive Statistiken, diagnostische Gütemaße (Sens, Spez, PPV, NPV, Acc, BalAcc/AUC, F1) mit 95% CIs, diverse Vergleichstests (McNemar, DeLong, Fisher's Exact, Z-Test) und Assoziationsmaße (OR, RD, Phi, Mann-Whitney U). Das Signifikanzniveau (Standard p < 0.05) und die Symbole für die p-Wert-Darstellung sind in `js/config/app_config.js` konfiguriert.

## 9. Literatur-Referenzen (für T2-Vergleichssets)

* Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. *Eur Radiol*. 2025. (DOI: 10.1007/s00330-025-11462-y)
* Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. *Int J Radiat Oncol Biol Phys*. 2008;71(2):456-461.
* Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. *Radiother Oncol*. 2024;193:110124.
* Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. *Eur Radiol*. 2025. (DOI: 10.1007/s00330-025-11361-2)
* Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. *Eur Radiol*. 2018;28(4):1465-1475.


## 10. Konfiguration

Wichtige Anwendungseinstellungen sind in den Dateien unter `js/config/` zentral definiert (z.B. `app_config.js`, `text_config.js`, `publication_config.js`).

## 11. Limitationen

* Basiert auf einem **statischen Datensatz (N=106)**; kein Daten-Upload.
* Statistische Berechnungen sind spezifisch für die Implementierung; für definitive Aussagen ggf. mit Spezialsoftware validieren.
* Performance hängt von Client-System ab.
* Optimiert für moderne Browser.
