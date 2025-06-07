# Lymphknoten T2 - Avocado Sign Analyse Tool

---

## 1. Übersicht

Das **Lymphknoten T2 - Avocado Sign Analyse Tool** (Version 2.3.0) ist eine hochspezialisierte, webbasierte Anwendung, die für die **wissenschaftliche Forschung im Bereich der radiologischen Diagnostik des Rektumkarzinoms** entwickelt wurde. Es dient der detaillierten Analyse und dem systematischen Vergleich der diagnostischen Leistung von MRT-basierten Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status). Ein zentraler Fokus liegt auf der Evaluierung des neuartigen "Avocado Signs" (AS) im Vergleich zu etablierten Literatur-basierten sowie datengetriebenen, optimierten T2-gewichteten (T2w) morphologischen Kriterien.

**Wichtiger Hinweis:** Diese Anwendung ist ausschließlich als **Forschungsinstrument** für explorative Datenanalysen und zur Unterstützung wissenschaftlicher Untersuchungen gedacht. Die von der Anwendung generierten Ergebnisse, Statistiken, Texte und Visualisierungen sind **nicht für die klinische Diagnostik im Einzelfall, zur direkten Therapieentscheidung bei Patienten oder für andere unmittelbare medizinische Anwendungen vorgesehen.** Jede Interpretation der Ergebnisse muss stets im Kontext der zugrundeliegenden Studiendaten und deren Limitationen (z.B. retrospektives Design, monozentrische Datenbasis der inkludierten 106 Fälle) erfolgen. Die Verantwortung für die korrekte wissenschaftliche Einordnung und Nutzung der Ergebnisse liegt beim Anwender.

---

## 2. Hauptfunktionen und Publikationsrelevanz

Das Tool bietet eine breite Palette an Funktionalitäten, die auf die Anforderungen wissenschaftlicher Publikationen, insbesondere des Fachjournals *Radiology*, zugeschnitten sind:

* **Interaktive Datenexploration:** Detaillierte Ansicht und Filterung von pseudonymisierten Patientendaten, inklusive klinischer Informationen und spezifischer Lymphknotenmerkmale. Die sortierbaren Tabellen mit aufklappbaren Detailansichten pro Lymphknoten ermöglichen eine transparente Nachvollziehbarkeit der Datenbasis.
* **Dynamische T2-Kriterien-Definition:** Flexible Konfiguration und unmittelbare Anwendung von komplexen T2w-Kriteriensets (basierend auf Größe, Form, Kontur, Homogenität, Signal) mit UND/ODER-Logik. Änderungen werden visuell angezeigt und können angewendet und gespeichert werden, was die Reproduzierbarkeit von Analysen fördert.
* **Brute-Force-Optimierung:** Ein integrierter Algorithmus zur automatisierten Identifikation der T2w-Kriterienkombination, die eine vom Nutzer gewählte diagnostische Zielmetrik (z.B. Balanced Accuracy, F1-Score) für das ausgewählte Patientenkollektiv maximiert. Dieser rechenintensive Prozess läuft im Hintergrund mittels Web Workers, um die Benutzeroberfläche reaktionsfähig zu halten, und liefert detaillierte Berichte der Top-Ergebnisse.
* **Umfassende statistische Auswertung:** Berechnung und Darstellung einer Vielzahl diagnostischer Gütekriterien (Sensitivität, Spezifität, Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Accuracy, Balanced Accuracy, Area Under the Curve (AUC)) inklusive 95%-Konfidenzintervallen und p-Werten. Vergleichende Statistiken zwischen verschiedenen Methoden und Kollektiven (mittels McNemar- und DeLong-Tests für gepaarte Daten oder Fisher's Exact Test/Z-Test für ungepaarte Daten) werden ebenfalls bereitgestellt. Die Formatierung der p-Werte und Konfidenzintervalle folgt den spezifischen Anforderungen des *Radiology*-Journals (z.B. `.04`, `.005`, `<.001`).
* **Publikationsunterstützung (*Radiology*-Fokus):** Dies ist eine Kernfunktion der Anwendung. Der "Publikation"-Tab generiert automatisch **textuelle Vorschläge, Tabellen und Abbildungen für wissenschaftliche Manuskripte**, die **spezifisch auf die formalen und stilistischen Anforderungen des Fachjournals *Radiology*** (gemäß "Radiology_Style_Guide.md") ausgerichtet sind. Dies beinhaltet:
    * **Strukturierte Textgenerierung:** Für Abschnitte wie Abstract (inkl. Hintergrund, Ziel, Material und Methoden, Ergebnisse, Fazit, Key Results), Einleitung, Material und Methoden (detaillierte Unterpunkte zu Studiendesign, Patienten, MRT-Protokoll, Bildanalyse AS und T2, Referenzstandard, statistische Analyse), Ergebnisse (Patientencharakteristika, Performance AS, Performance Literatur-T2, Performance optimierte T2, Vergleiche) und Diskussion. Alle numerischen Ergebnisse (P-Werte, CIs, Prozente) werden **gemäß *Radiology*-Formatierungsstandards** ausgegeben.
    * **Automatisierte Referenzierung:** Einbindung relevanter Literaturzitate an den passenden Stellen im Text, basierend auf einer hinterlegten Referenzdatenbank.
    * **Eingebettete Tabellen und Abbildungen:** Publikationsreife Tabellen und Diagramme werden direkt in den Text integriert, mit korrekten Beschriftungen und Verweisen, die dem Layout von *Radiology* entsprechen.
    * **Sprachauswahl:** Umschaltung aller generierten Inhalte (Texte, Tabellen, Abbildungsbeschriftungen) zwischen Deutsch und Englisch.
* **Präsentationserstellung:** Aufbereitung ausgewählter Ergebnisse in einem übersichtlichen Format, das direkt für wissenschaftliche Präsentationen verwendet werden kann, inklusive Info-Karten, Vergleichstabellen und Balkendiagrammen.
* **Vielseitiger Datenexport:** Export von Rohdaten, Analyseergebnissen, Tabellen und Grafiken in verschiedenen Formaten (CSV, Markdown (MD), Text (TXT), HTML, PNG, SVG, ZIP). Exporte können für einzelne Elemente oder als thematische ZIP-Archive erfolgen.

---

## 3. Datenbasis

Die Analysen innerhalb dieser Anwendungsversion basieren auf einem fest integrierten, pseudonymisierten Datensatz von **106 Patientenfällen** mit histologisch gesichertem Rektumkarzinom. Dieser Datensatz umfasst:

* Klinische Basisinformationen (Alter, Geschlecht, Therapiegruppe: "direkt OP", "nRCT").
* Den durch Histopathologie bestätigten N-Status jedes Patienten (Referenzstandard).
* Die Befundung des Avocado Signs für jeden relevanten Lymphknoten.
* Detaillierte morphologische Eigenschaften für jeden im T2-gewichteten MRT beurteilten Lymphknoten (Kurzachsendurchmesser, Form, Kontur, Homogenität, Signalintensität).

---

## 4. Anwendungsstruktur und verwendete Technologien

Die Anwendung ist als reine Client-Side Webanwendung implementiert und folgt einer modularen JavaScript-Struktur für bessere Wartbarkeit und Skalierbarkeit.

### 4.1 Verzeichnisstruktur

```
.
├── css/
│   └── style.css                     # Überarbeitetes CSS für konsistentes, publikationsreifes Design
├── data/
│   └── data.js                       # Rohdaten der Patientenfälle
├── docs/                             # Dokumentation und Referenzmaterial (z.B. Radiology Style Guide, Studien-PDFs)
│   ├── Radiology_Style_Guide.md
│   ├── Lurz_Schaefer_AvocadoSign_2025.pdf
│   └── ... (weitere PDF-Dokumente)
├── js/
│   ├── app/
│   │   ├── main.js                   # Hauptanwendungslogik und Initialisierung
│   │   └── state.js                  # Globaler Anwendungszustand
│   ├── config/
│   │   └── app_config.js             # ZENTRALE Konfigurationsdatei:
│   │                                 # Enthält ALLE App-Einstellungen, Konstanten, Pfade,
│   │                                 # ALLE UI-Texte, Publikations-spezifische Konfigurationen,
│   │                                 # Metrik-Definitionen, Referenzen, etc.
│   ├── core/
│   │   ├── data_processor.js         # Datenverarbeitung und Filterung
│   │   ├── t2_criteria_manager.js    # Logik zur Verwaltung und Anwendung der T2-Kriterien
│   │   └── study_criteria_manager.js # Verwaltung der vordefinierten Studienkriterien (Literatur)
│   ├── services/
│   │   ├── statistics_service.js     # Statistische Berechnungen
│   │   ├── brute_force_manager.js    # Verwaltung des Brute-Force Workers
│   │   └── export_service.js         # Logik für alle Exportfunktionen
│   ├── ui/
│   │   ├── components/
│   │   │   └── ui_components.js      # Erstellung wiederverwendbarer UI-Elemente (HTML-Fragmente)
│   │   ├── handlers/
│   │   │   ├── general_event_handlers.js      # Allgemeine Event-Handler (Tab-Navigation, Kollektiv-Buttons)
│   │   │   ├── auswertung_event_handlers.js   # (Leere Datei, Event-Handler in Logic-Datei)
│   │   │   ├── statistik_event_handlers.js    # (Leere Datei, Event-Handler in Logic-Datei)
│   │   │   ├── praesentation_event_handlers.js # (Leere Datei, Event-Handler in Logic-Datei)
│   │   │   └── publikation_event_handlers.js  # (Leere Datei, Event-Handler in Logic-Datei)
│   │   ├── helpers/
│   │   │   └── ui_helpers.js         # Allgemeine UI-Hilfsfunktionen und DOM-Manipulation (Tooltips, Updates)
│   │   ├── renderers/
│   │   │   ├── chart_renderer.js     # Rendering von Diagrammen (D3.js)
│   │   │   ├── table_renderer.js     # Rendering von Datentabellen
│   │   │   ├── publication/          # Spezifische Renderer für den Publikations-Tab
│   │   │   │   ├── publication_text_generator.js # Generiert Publikationstexte
│   │   │   │   ├── publication_tables.js     # Generiert Publikationstabellen
│   │   │   │   ├── publication_figures.js    # Generiert Publikationsdiagramme
│   │   │   │   └── publication_renderer.js   # Koordiniert Rendering im Publikations-Tab
│   │   │   └── view_renderer.js      # Koordiniert das Rendering der Haupt-Tabs
│   │   └── views/                    # Spezifische Logik zur Datenaufbereitung und HTML-Generierung pro Tab
│   │       ├── data_tab_logic.js
│   │       ├── auswertung_tab_logic.js
│   │       ├── statistik_tab_logic.js
│   │       ├── praesentation_tab_logic.js
│   │       └── publikation_tab_logic.js
│   └── utils/
│       └── utils.js                  # Allgemeine Dienstprogramme (Formatierung, Local Storage)
├── workers/
│   └── brute_force_worker.js         # Web Worker für die Brute-Force-Optimierung
└── index.html                        # Haupt-HTML-Datei
```

### 4.2 Verwendete Technologien

* **HTML5:** Strukturelle Basis der Webseite.
* **CSS3:** Styling und Layout (mit Fokus auf *Radiology*-konformes Design).
* **JavaScript (ES6+):** Gesamte Anwendungslogik, Datenverarbeitung, statistische Berechnungen und dynamische UI-Interaktionen.
* **Bootstrap 5:** CSS-Framework für responsives Design und UI-Komponenten (eingebunden via CDN).
* **D3.js:** Zur Generierung dynamischer und interaktiver Diagramme und Visualisierungen (eingebunden via CDN).
* **Tippy.js:** Für die Anzeige kontextsensitiver Tooltips (eingebunden via CDN).
* **PapaParse:** Zur Verarbeitung von CSV-Daten (eingebunden via CDN).
* **JSZip:** Zur Erstellung von ZIP-Archiven für die Exportfunktionalitäten (eingebunden via CDN).
* **html2canvas:** Zum Rendern von HTML-Elementen und SVGs als Canvas für PNG-Exporte (eingebunden via CDN).
* **Web Workers:** Für rechenintensive Aufgaben im Hintergrund (z.B. Brute-Force-Optimierung), um die Reaktionsfähigkeit der Benutzeroberfläche zu gewährleisten.

---

## 5. Wissenschaftlicher Kontext und Ausblick

Diese Anwendung wurde im Kontext der Forschung zum **Avocado Sign** entwickelt, einem neuartigen MRT-Marker für die Beurteilung des Lymphknotenstatus bei Rektumkarzinompatienten. Sie dient dazu, die diagnostische Leistung dieses Markers systematisch zu analysieren und ihn mit etablierten T2-gewichteten morphologischen Kriterien zu vergleichen. Die mit diesem Tool generierbaren Ergebnisse sind darauf ausgelegt, die wissenschaftliche Diskussion über die Optimierung des präoperativen Stagings des Rektumkarzinoms voranzutreiben und die **Anforderungen von hochrangigen Fachjournalen wie *Radiology*** zu erfüllen.

Zukünftige Entwicklungen könnten die Erweiterung der Datenbasis, die Implementierung weiterer statistischer Modelle oder die Integration neuer Bildgebungsmarker umfassen, um die klinische Relevanz und den Nutzen des Tools weiter zu steigern.

---

## 6. Autoren und Kontakt

* **Hauptentwickler & Studienautoren:** Markus Lurz
* **Kontakt für technische Fragen oder Feedback zur Anwendung:** mlurz92[at]googlemail.com

## 7. Lizenz

Dieses Projekt ist unter keiner spezifischen Lizenz veröffentlicht. Alle Rechte an der Software und den Inhalten bleiben vorbehalten. Eine Nutzung für kommerzielle Zwecke oder eine Weiterverteilung ohne ausdrückliche Genehmigung der Autoren ist nicht gestattet. Für Forschungs- und nicht-kommerzielle Bildungsprojekte kann eine Nutzung nach Absprache erfolgen.

**Stand:** 07. Juni 2025
