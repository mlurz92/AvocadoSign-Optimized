# AvocadoSign Analyse Tool v2.5.0 🥑

Das **AvocadoSign Analyse Tool v2.5.0** ist eine interaktive Webanwendung für die medizinisch-wissenschaftliche Forschung, speziell entwickelt zur Analyse der diagnostischen Güte des "Avocado Signs" im Vergleich zu etablierten T2-gewichteten MRT-Kriterien bei der Vorhersage des Lymphknotenstatus von Patienten mit Rektumkarzinom.

Diese Anwendung richtet sich an Forscher, Radiologen und Datenanalysten und bietet eine umfassende Plattform für Datenexploration, Kriteriendefinition, statistische Auswertung und die Vorbereitung wissenschaftlicher Publikationen.

## Hauptfunktionen

* **Interaktive Datenexploration:** Visualisierung und Filterung von Patientendaten und detaillierten Lymphknotenmerkmalen.
* **Flexible T2-Kriterien-Definition:** Ermöglicht die dynamische Definition und Anwendung von morphologischen T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) inklusive logischer Verknüpfungen (UND/ODER).
* **Brute-Force-Optimierung:** Findet datengetrieben die optimale T2-Kriterienkombination zur Maximierung einer wählbaren diagnostischen Zielmetrik. Die Top-Ergebnisse werden detailliert mit allen relevanten Performance-Metriken angezeigt.
* **Umfassende statistische Analysen:**
    * Berechnung von Sensitivität, Spezifität, PPV, NPV, Accuracy, Balanced Accuracy/AUC (mit 95% Konfidenzintervallen und Angabe der CI-Methode).
    * Statistische Vergleiche zwischen dem Avocado Sign und verschiedenen T2-Kriteriensets (Literatur-basiert, benutzerdefiniert, Brute-Force-optimiert) mittels McNemar- und DeLong-Tests.
    * Assoziationsanalysen zwischen Bildgebungsmerkmalen und dem pathologischen N-Status.
    * Vergleichsanalysen zwischen verschiedenen Patientenkollektiven.
* **Vergleich mit Literatur-Kriterien:** Integrierte Referenz-Kriteriensets aus publizierten Studien (Koh et al. 2008, Barbaro et al. 2024, ESGAR 2016 Konsensus) zum direkten Vergleich.
* **Dedizierter Publikation-Tab:**
    * Automatische Generierung von detaillierten Textentwürfen (Markdown) für die Methoden- und Ergebnisabschnitte einer wissenschaftlichen Publikation.
    * Sprachauswahl (Deutsch/Englisch) für generierte Texte.
    * Dynamische Einbindung statistischer Ergebnisse, Tabellen- und Abbildungsreferenzen.
    * Berücksichtigung der für die Publikation gewählten Brute-Force-Optimierungsmetrik.
* **Präsentationsmodus:** Aufbereitete Ansichten von Schlüssel Ergebnissen und Vergleichen, ideal für Vorträge.
* **Vielseitiger Datenexport:**
    * Export von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen.
    * Formate: CSV, Markdown (MD), TXT, PNG, SVG, HTML-Bericht.
    * Diagrammexporte optimiert für Publikationen (Englisch, Journal-Stil, hochauflösend).

## Technologie-Stack

* Vanilla JavaScript (ES6+)
* HTML5
* CSS3
* Bootstrap 5 (UI Framework)
* D3.js (Diagrammerstellung)
* Tippy.js (Tooltips)
* FileSaver.js & JSZip (Dateiexporte)
* SheetJS (XLSX-Exporte)
* html2canvas (Bildexport von Tabellen)
* Web Worker (für rechenintensive Brute-Force-Optimierung)

## Status und Version

* **Aktuelle Version:** 2.5.0
* **Status:** Forschungswerkzeug. **Nicht für den direkten klinischen Einsatz oder diagnostische Entscheidungen vorgesehen.**

## Nutzung

Dies ist eine Webanwendung und erfordert keine Installation. Sie kann direkt durch Öffnen der `index.html`-Datei in einem modernen Webbrowser gestartet werden.

* **Empfohlene Browser:** Aktuelle Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge oder Safari.
* **Internetverbindung:** Für das Laden externer Bibliotheken (via CDN) beim ersten Start erforderlich.

## Kurzanleitung zur Bedienung

Eine detaillierte **Kurzanleitung** ist direkt in der Anwendung verfügbar (Klick auf das <i class="fas fa-info-circle"></i> Icon im Header).

**Typischer Workflow:**

1.  **Kollektiv auswählen:** Wählen Sie im Header das gewünschte Patientenkollektiv (Gesamt, Direkt OP, nRCT).
2.  **Daten explorieren (Daten-Tab):** Machen Sie sich mit den Patientendaten vertraut.
3.  **T2-Kriterien definieren (Auswertung-Tab):**
    * Stellen Sie interaktiv die morphologischen T2-Kriterien und die Verknüpfungslogik ein.
    * Klicken Sie "Anwenden & Speichern", um Ihre Definition global zu aktivieren.
    * Der Status der Kriterien (angewandt vs. ungespeichert) wird im Header der Definitionskarte angezeigt.
4.  **(Optional) Brute-Force-Optimierung (Auswertung-Tab):**
    * Wählen Sie eine Zielmetrik.
    * Starten Sie die Optimierung, um die datengetrieben besten T2-Kriterien zu finden.
    * Übernehmen Sie ggf. die besten gefundenen Kriterien.
5.  **Ergebnisse analysieren (Statistik-, Präsentation-, Publikation-Tab):**
    * Betrachten Sie detaillierte statistische Auswertungen.
    * Nutzen Sie den Präsentation-Tab für aufbereitete Übersichten.
    * Generieren Sie Textentwürfe und Materialien für Ihre Publikation im Publikation-Tab (wählen Sie Sprache und BF-Zielmetrik).
6.  **Exportieren (Export-Tab):** Laden Sie benötigte Daten, Tabellen oder Diagramme herunter.

## Datenbasis

Die Anwendung verwendet einen fest integrierten, anonymisierten Datensatz von Patienten mit Rektumkarzinom (N=106). Dieser umfasst demographische Daten, Therapieinformationen, den pathologischen N-Status sowie detaillierte Bewertungen des Avocado Signs und morphologischer T2-Merkmale von Lymphknoten.

## Fokus: Publikationsunterstützung

Version 2.5.0 legt einen besonderen Schwerpunkt auf die Unterstützung bei der Erstellung wissenschaftlicher Publikationen. Der "Publikation"-Tab generiert umfassende Textentwürfe für Methoden- und Ergebnisabschnitte, die dynamisch die Resultate der Analysen (inklusive Vergleiche AS vs. Literatur-T2 vs. Brute-Force optimierte T2-Kriterien) einbinden. Diagramme können in einem publikationsfreundlichen Stil (Englisch, Journal-Vorgaben entsprechend) exportiert werden.

## Referenz

Diese Anwendung wurde im Kontext der Forschung zum "Avocado Sign" entwickelt, einem neuartigen Bildgebungsmarker für das Lymphknoten-Staging beim Rektumkarzinom.
Primärreferenz: Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025; https://doi.org/10.1007/s00330-025-11462-y (Hypothetisches Zitat für die Studie)

---
Diese `README.md` dient als Übersicht. Für eine vollständige und detaillierte Beschreibung aller Funktionen und Bedienaspekte konsultieren Sie bitte die umfassende Anwendungsbeschreibung (`docs/Anwendungsbeschreibung.txt` - basierend auf der aktuellen Version 2.5.0).
