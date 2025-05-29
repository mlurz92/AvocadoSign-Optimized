# Lymphknoten T2 - Avocado Sign Analyse Tool v2.5.0

**Autoren:** Dr. med. Markus Lurz & A.O. Schäfer
**Letzte Aktualisierung:** Mai 2025
**GitHub Repository:** [AvocadoSign-Optimized](https://github.com/mlurz92/AvocadoSign-Optimized)

**Zitierweise (Primärstudie Avocado Sign):**
Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. doi:10.1007/s00330-025-11462-y

## Einleitung

Das "Lymphknoten T2 - Avocado Sign Analyse Tool" ist eine interaktive Frontend-Webanwendung, die für die detaillierte Analyse und den wissenschaftlichen Vergleich des "Avocado Signs" (AS) mit T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom entwickelt wurde. Diese Version (2.5.0) erweitert die Funktionalitäten erheblich, insbesondere im Bereich der Publikationserstellung, und dient als primäres Werkzeug für die weitere Auswertung und Veröffentlichung der Studienergebnisse im Kontext eines Vergleichs von AS mit etablierten und optimierten T2-Kriterien.

## Hauptfunktionen (Version 2.5.0)

Die Anwendung bietet eine Vielzahl von Funktionen zur Datenanalyse und Visualisierung:

1.  **Kollektivauswahl:**
    * Dynamische Auswahl und Filterung des Patientenkollektivs (Gesamt, Direkt Operierte, neoadjuvant Radiochemotherapeutisch Vorbehandelte [nRCT]).
    * Sofortige Aktualisierung aller Analysen und Visualisierungen basierend auf dem gewählten Kollektiv.

2.  **T2-Kriteriendefinition (Tab "Auswertung"):**
    * Flexible Definition von bis zu fünf morphologischen T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal).
    * Einstellung der logischen Verknüpfung (UND/ODER) für die als positiv zu wertenden Kriterien.
    * Sofortige Neubewertung des gesamten Datensatzes nach Anwendung der Kriterien.
    * Visuelle Indikation für nicht gespeicherte Änderungen.

3.  **Brute-Force-Optimierung (Tab "Auswertung"):**
    * Algorithmus zur datengetriebenen Identifikation der optimalen T2-Kriterienkombination.
    * Auswahl der Zielmetrik für die Optimierung (z.B. Balanced Accuracy, F1-Score).
    * Ausführung im Hintergrund mittels Web Worker zur Vermeidung von UI-Blockaden.
    * Detaillierte Ergebnisansicht (Top 10 Kombinationen) und Möglichkeit zur direkten Anwendung der besten gefundenen Kriterien.

4.  **Deskriptive Statistik (Tab "Statistik" & Dashboard im Tab "Auswertung"):**
    * Umfassende deskriptive Statistiken für das gewählte Kollektiv (Alter, Geschlecht, Therapietyp, N/AS/T2-Status, Lymphknotenzahlen).
    * Visualisierung als Tabellen und Diagramme (Histogramm, Tortendiagramm).

5.  **Diagnostische Güte (Tab "Statistik"):**
    * Berechnung und Darstellung aller gängigen Gütekriterien (Sensitivität, Spezifität, Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Positive Likelihood Ratio (LR+), Negative Likelihood Ratio (LR-), Accuracy, Balanced Accuracy/AUC, F1-Score) für:
        * Avocado Sign (AS) vs. N-Status.
        * Aktuell definierte/angewandte T2-Kriterien vs. N-Status.
    * Inklusive 95%-Konfidenzintervallen (berechnet mit Wilson Score oder Bootstrap-Verfahren).

6.  **Statistische Vergleiche (Tab "Statistik"):**
    * Direkter statistischer Vergleich (McNemar-Test für Accuracy, DeLong-Test für AUC) zwischen Avocado Sign und den aktuell angewandten T2-Kriterien für das gewählte Kollektiv.
    * Signifikanztests mit p-Wert-Angabe.

7.  **Assoziationsanalysen (Tab "Statistik"):**
    * Analyse des Zusammenhangs einzelner T2-Merkmale (basierend auf angewandten Kriterien) bzw. des AS-Status mit dem N-Status.
    * Berechnung von Odds Ratios (OR), Risk Differences (RD) und Phi-Koeffizienten (φ) inklusive 95%-Konfidenzintervallen und p-Werten (Fisher's Exact Test).
    * Vergleich der Lymphknotengrößenverteilung zwischen N+ und N- Patienten (Mann-Whitney-U-Test).

8.  **Kollektivvergleiche (Tab "Statistik"):**
    * Möglichkeit zum statistischen Vergleich der Performance (Accuracy, AUC) von AS und T2-Kriterien zwischen zwei unabhängigen Kollektiven (z.B. Direkt OP vs. nRCT).

9.  **Präsentationsmodus (Tab "Präsentation"):**
    * Aufbereitete, präsentationsfreundliche Darstellung der Performance des Avocado Signs.
    * Direkter Vergleich des Avocado Signs mit spezifischen, auswählbaren Literatur-Kriteriensets (Koh et al. 2008, Barbaro et al. 2024, ESGAR 2016/Rutegård et al. 2025) oder den aktuell angewandten T2-Kriterien.
    * Generierung von Vergleichstabellen und -diagrammen.

10. **Publikationsmodus (Tab "Publikation"):**
    * **Generiert einen umfassenden Erstentwurf einer wissenschaftlichen Publikation, fokussiert auf die Sektionen "Methoden" und "Ergebnisse", im Stil des Journals "Radiology".**
    * Die Abschnitte Abstract, Einleitung, Diskussion und Schlussfolgerung werden strukturell angelegt und mit kurzen Hinweisen/Platzhaltern versehen, die zur manuellen Ausarbeitung anleiten.
    * Dynamische Generierung von Texten basierend auf den aktuellen Analysedaten, dem gewählten Kollektiv und der für die Publikation ausgewählten Brute-Force-Optimierungsmetrik.
    * Automatische Referenzierung von im Text erwähnten Tabellen und Abbildungen.
    * **Dynamische Erstellung einer formatierten Referenzliste** basierend auf den im Text gemachten Zitationen (unterstützt durch `reference_manager.js`).
    * Umschaltmöglichkeit der Sprache (Deutsch/Englisch) für die generierten Texte.

11. **Datenexport (Tab "Export"):**
    * Export von Rohdaten (gefiltert nach Kollektiv), Auswertungstabellen, deskriptiven Statistiken, detaillierten Statistik-Ergebnissen und Brute-Force-Berichten.
    * Formate: CSV, Markdown (MD), TXT.
    * Export aller Diagramme und ausgewählter Tabellen als PNG, SVG und **TIFF (experimentell)**.
    * Export des **vollständigen Publikationsentwurfs als Markdown und HTML**.
    * Generierung eines umfassenden HTML-Analyseberichts.
    * Option zum Download von ZIP-Archiven, die thematisch gruppierte Dateien enthalten.

## Wissenschaftliche Grundlage & Patientendaten

Die Anwendung basiert auf den Ergebnissen der Studie "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025." und verwendet den dort beschriebenen, prospektiv erfassten und pseudonymisierten Patientendatensatz (N=106) vom Klinikum St. Georg, Leipzig. Dieser Datensatz ist statisch in die Anwendung integriert (`data/data.js`). Die aktuelle Version der Anwendung dient insbesondere der Vorbereitung einer Folgestudie, die das Avocado Sign mit verschiedenen T2-Kriteriensets (Literatur-basiert und optimiert) vergleicht.

## Technologie-Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Frameworks/Bibliotheken:**
    * Bootstrap 5.3 (UI-Framework)
    * D3.js v7 (Datenvisualisierung)
    * Tippy.js (Tooltips)
    * Popper.js (Core für Tippy.js)
    * PapaParse (CSV-Parsing, hier für Export)
    * JSZip (ZIP-Archiv-Generierung)
    * Font Awesome (Icons)
    * html2canvas (Tabellen-zu-PNG Export, experimentell)
* **Entwicklungsumgebung:** Visual Studio Code
* **Versionierung:** Git, GitHub

## Verzeichnisstruktur (v2.5.0)

Die Anwendung ist modular aufgebaut und folgt einer organisierten Verzeichnisstruktur:
