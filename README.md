# Avocado Sign Analyse & Publikations-Tool v3.0

![Status](https://img.shields.io/badge/status-stable-success.svg)
![Lizenz](https://img.shields.io/badge/license-MIT-blue.svg)
![Architektur](https://img.shields.io/badge/architektur-MVC--like-blueviolet.svg)
![Technologie](https://img.shields.io/badge/tech-Vanilla%20JS%20|%20D3.js%20|%20Bootstrap-lightgrey.svg)

---

## 1. Übersicht und Vision

Das **Avocado Sign Analyse & Publikations-Tool** ist eine hochspezialisierte, interaktive Single-Page-Webanwendung (SPA), die für die medizinisch-wissenschaftliche Forschung konzipiert wurde. Ihr Kernzweck ist die datengestützte Analyse und der statistische Performance-Vergleich von MRT-Kriterien zur Beurteilung des Lymphknotenstatus beim Rektumkarzinom.

Die Anwendung wurde entwickelt, um den gesamten wissenschaftlichen Workflow zu unterstützen: von der explorativen Datenanalyse über die rigorose, interaktive Hypothesenprüfung bis hin zur automatisierten Erstellung eines einreichungsfertigen Manuskriptentwurfs, der speziell auf die hohen Standards des Fachjournals **Radiology** zugeschnitten ist.

---

## 2. Technologie-Stack & Architektur

Die Anwendung ist als reine Client-Side-Anwendung ohne serverseitige Abhängigkeiten konzipiert.

* **Kerntechnologien:**
    * **JavaScript (ES6+):** Modulare Anwendungslogik, keine Framework-Abhängigkeiten.
    * **HTML5 & CSS3:** Struktur und benutzerdefiniertes Styling.
* **Hauptbibliotheken:**
    * **D3.js (v7):** Für alle dynamischen und interaktiven Datenvisualisierungen.
    * **Bootstrap (v5.3):** Als responsives UI-Framework für Layout und grundlegende Komponenten.
    * **Tippy.js (v6):** Für kontextsensitive, reichhaltige Tooltips zur Verbesserung der User Experience.
    * **PapaParse:** Für clientseitiges CSV-Parsing.
    * **JSZip & FileSaver.js:** Zur clientseitigen Generierung von ZIP-Archiven und zum Auslösen von Datei-Downloads.
    * **SheetJS (XLSX):** Zur Erstellung von Excel-Arbeitsmappen.
    * **html2canvas:** Zum Erstellen von PNG-Abbildungen aus HTML-Tabellen.

### Architektur-Konzept

Die Anwendung folgt einem modernen, MVC-ähnlichen Architekturmuster, das auf strikter **Separation of Concerns (SoC)** und einem **unidirektionalen Datenfluss** basiert:

* **Model (Daten & Logik):**
    * **`core`:** Kapselt die primäre Datenverarbeitungslogik (z.B. `data_processor.js`, `t2_criteria_manager.js`).
    * **`services`:** Bietet wiederverwendbare Geschäftslogik (z.B. `statistics_service.js`, `export_service.js`, `brute_force_manager.js`).
* **View (Darstellung):**
    * **`renderers`:** Eine Schicht von "dummen" Modulen, die ausschließlich dafür verantwortlich sind, Daten in HTML-Strukturen umzuwandeln. Sie enthalten keinerlei Anwendungslogik.
* **Controller (Steuerung):**
    * **`controllers`:** Das Bindeglied zwischen Model und View. Sie fangen Benutzerinteraktionen ab, veranlassen Berechnungen im Model und weisen die View an, sich mit den neuen Daten zu aktualisieren.
    * **`main.js`:** Der zentrale Orchestrator, der den Render-Zyklus steuert und die Interaktion der Module koordiniert.

---

## 3. Projektstruktur

Die Verzeichnisstruktur ist klar nach Verantwortlichkeiten getrennt, um maximale Wartbarkeit zu gewährleisten.

```
/
├── data/
│   └── patient_data.js         # Anonymisierter Rohdatensatz der Studienkohorte.
├── docs/
│   ├── ...                     # Wissenschaftliche Artikel und Style Guides.
├── css/
│   └── style.css               # Benutzerdefinierte Stylesheets.
├── js/
│   ├── app/
│   │   ├── main.js             # Orchestriert die gesamte Anwendung, steuert den Render-Zyklus.
│   │   └── state_manager.js    # Verwaltet den UI-Zustand (aktiver Tab, Sortierung etc.) persistent.
│   ├── config/
│   │   ├── app_config.js       # Globale Anwendungskonstanten (Version, Pfade, Settings).
│   │   ├── publication_config.js # Texte und Struktur für den Publikations-Generator.
│   │   └── text_config.js        # UI-Texte, Tooltips, Labels.
│   ├── core/
│   │   ├── data_processor.js   # Filtert und prozessiert den rohen Patientendatensatz.
│   │   ├── study_criteria_manager.js # Verwaltet feste T2-Kriteriensets aus publizierten Studien.
│   │   └── t2_criteria_manager.js  # Verwaltet die interaktiv definierten T2-Kriterien.
│   ├── services/
│   │   ├── brute_force_manager.js # Steuert den Web Worker für die Brute-Force-Optimierung.
│   │   ├── export_service.js   # Kapselt die gesamte Logik zur Dateierstellung und zum Download.
│   │   ├── publication_generator_service.js # Generiert den wissenschaftlichen Text für den Publikation-Tab.
│   │   └── statistics_service.js # Führt alle statistischen Berechnungen durch.
│   ├── ui/
│   │   ├── controllers/        # Steuern die Interaktionen der jeweiligen Tabs.
│   │   ├── renderers/          # Erzeugen das HTML-Markup für die jeweiligen UI-Teile.
│   │   ├── components.js       # Generatoren für wiederverwendbare UI-Elemente.
│   │   └── helpers.js          # Allgemeine UI-Hilfsfunktionen (Toasts, Tooltips).
│   └── utils/
│       └── utils.js            # Globale, nicht-UI-bezogene Hilfsfunktionen (Formatierung, IDs).
├── workers/
│   └── brute_force_worker.js # Rechenintensiver Code für die Brute-Force-Optimierung.
└── index.html                # Einziger HTML-Einstiegspunkt der Anwendung.
```

---

## 4. Inbetriebnahme

1.  **Repository beziehen:** Klonen Sie das Repository.
    ```bash
    git clone [https://github.com/mlurz92/AvocadoSign-Optimized.git](https://github.com/mlurz92/AvocadoSign-Optimized.git)
    ```
2.  **Anwendung starten (dringend empfohlen):**
    * Navigieren Sie im Terminal in das Projektverzeichnis.
    * Starten Sie einen lokalen Webserver, z.B. mit Python 3:
        ```bash
        python -m http.server
        ```
    * Öffnen Sie die angezeigte URL (meist `http://localhost:8000`) in Ihrem Browser.

---

## 5. Funktionsumfang im Detail

### Globale Funktionen
* **Kollektiv-Auswahl:** Wählen Sie die globale Studienkohorte (`Gesamt`, `Direkt OP`, `nRCT`). Alle Analysen und Visualisierungen in der gesamten Anwendung passen sich dynamisch an.
* **Statusleiste:** Zeigt Live-Kennzahlen (Patientenanzahl, N/AS/T2-Status) für das gewählte Kollektiv.
* **Persistenz:** Benutzereinstellungen wie Kriterien, Layouts und Sortierungen bleiben über Sitzungen hinweg erhalten.

### Kernmodule (Tabs)

#### **Daten**
* **Zweck:** Transparente Darstellung und Exploration der Rohdaten.
* **Features:** Sortierbare Patiententabelle, aufklappbare Detailansicht mit morphologischen Daten für jeden einzelnen T2-Lymphknoten.

#### **Auswertung**
* **Zweck:** Die interaktive Werkbank zur Definition, Analyse und Optimierung von diagnostischen Kriterien.
* **Features:**
    * **Live-Dashboard** zur visuellen Einordnung der Kohorte.
    * **Interaktiver Kriterien-Editor** zur Definition von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und deren logischer Verknüpfung (UND/ODER).
    * **Brute-Force-Optimierung** zur datengestützten Ermittlung der besten Kriterienkombination für eine wählbare Zielmetrik.
    * **Detail-Tabelle** zur fallbasierten Analyse der Kriterien-Auswirkungen, inklusive Hervorhebung der entscheidenden Merkmale.

#### **Statistik**
* **Zweck:** Rigorose statistische Auswertung zur Validierung der Ergebnisse für eine Publikation.
* **Features:**
    * Umschaltbare Einzel- und Vergleichsansichten für verschiedene Kollektive.
    * Berechnung aller relevanten diagnostischen Gütekriterien **inklusive 95%-Konfidenzintervallen**.
    * Durchführung von **McNemar- und DeLong-Tests** zum direkten Vergleich der diagnostischen Methoden.
    * Detaillierte Assoziationsanalysen zwischen Einzelmerkmalen und dem N-Status.
    * Interaktive Tooltips mit Definitionen und kontextbezogenen Interpretationen für jede statistische Kennzahl.

#### **Präsentation**
* **Zweck:** Erstellung von aufbereiteten, publikationsreifen Abbildungen und Tabellen.
* **Features:**
    * Fokussierte Ansichten, die das Avocado Sign allein oder im Vergleich zu Literatur-Kriterien darstellen.
    * Direkter Download aller Grafiken als hochauflösendes **PNG** oder skalierbare **SVG**-Vektorgrafik.

#### **Publikation**
* **Zweck:** Das Kernstück des Tools – die Generierung eines Manuskript-Entwurfs nach höchsten wissenschaftlichen Standards.
* **Features:**
    * **Struktur nach *Radiology*-Vorgabe:** Generiert alle Sektionen eines Originalartikels (Abstract, Introduction, etc.).
    * **Dynamische Texterstellung:** Integriert automatisch alle aktuellen Analyseergebnisse (z.B. `AUC, 0.87; 95% CI: 0.79, 0.94; P < .001`) korrekt formatiert in den Fließtext.
    * **Einhaltung von Regularien:** Überwacht und zeigt Wortgrenzen für Sektionen wie den Abstract (max. 300 Wörter) an.
    * **Mehrsprachigkeit:** Generiert den Entwurf wahlweise auf Deutsch oder Englisch.

#### **Export**
* **Zweck:** Umfassende Exportmöglichkeiten für Daten, Ergebnisse und Grafiken zur Archivierung, Kollaboration und Einreichung.
* **Features:**
    * Exporte als CSV, TXT, PNG, SVG.
    * Generierung einer vollumfänglichen **Excel-Arbeitsmappe (.xlsx)** mit getrennten Blättern für Konfiguration, Rohdaten, Auswertung und Statistiken.
    * Zusammengefasste **ZIP-Pakete** für eine einfache Weitergabe des kompletten Analyse-Stands.

---

## 6. Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert.
