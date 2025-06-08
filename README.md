# Avocado Sign vs. T2 Kriterien Analyse v2.5.0

---

![Version](https://img.shields.io/badge/Version-2.5.0-blue.svg)
![Status](https://img.shields.io/badge/Status-Optimiert-brightgreen.svg)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-lightgrey.svg)

<p align="center">
  <img src="img/avocado_sign_logo.png" alt="Anwendungslogo" width="150"/>
</p>

## Inhaltsverzeichnis

1.  [Über das Projekt](#1-über-das-projekt)
2.  [Kernfunktionen](#2-kernfunktionen)
3.  [Technischer Überblick](#3-technischer-überblick)
4.  [Erste Schritte](#4-erste-schritte)
5.  [Modulübersicht (Tabs)](#5-modulübersicht-tabs)
6.  [Dateistruktur](#6-dateistruktur)
7.  [Lizenz](#7-lizenz)
8.  [Kontakt](#8-kontakt)

---

## 1. Über das Projekt

**Avocado Sign vs. T2 Kriterien Analyse** ist ein hochspezialisiertes, rein clientseitiges Analyse- und Visualisierungswerkzeug für die medizinisch-radiologische Forschung. Es wurde entwickelt, um eine umfassende, datengestützte Untersuchung und den direkten Vergleich der diagnostischen Güte des **"Avocado Signs"** gegenüber etablierten **morphologischen T2-Kriterien** für das MRT-basierte Lymphknoten-Staging beim Rektumkarzinom durchzuführen.

Die Anwendung dient als interaktive Forschungsplattform, die es Radiologen und Wissenschaftlern ermöglicht, komplexe Kriteriensets zu definieren, deren Auswirkungen in Echtzeit zu evaluieren und die Ergebnisse in publikationsreifen Formaten zu exportieren, inklusive eines Assistenten zur Erstellung eines Manuskriptentwurfs nach den Vorgaben des Fachjournals *Radiology*.

---

## 2. Kernfunktionen

* **Interaktive Kriteriendefinition**: Vollständige Kontrolle über die Definition von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) mit sofortiger Neuberechnung der diagnostischen Gütekriterien.
* **Logik-Steuerung**: Flexible Kombination der Kriterien mittels **UND/ODER-Logik**.
* **Brute-Force-Optimierung**: Ein Web-Worker-basierter Hintergrundprozess findet automatisiert das Kriterienset mit der höchsten diagnostischen Güte für eine auswählbare Zielmetrik (z.B. Balanced Accuracy, F1-Score).
* **Umfassende Statistik**:
    * Berechnung aller relevanter Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, AUC) inklusive robuster **95% Konfidenzintervalle** (Wilson-Score und Bootstrap-Verfahren).
    * Direkter statistischer Vergleich zweier diagnostischer Methoden mittels **DeLong-Test (für AUC)** und **McNemar-Test (für Accuracy)**.
* **Dynamische Visualisierungen**:
    * Interaktive **ROC-Kurven** mit Anzeige von Schwellenwerten bei Mausberührung.
    * Klare, visuelle **Konfusionsmatrizen**.
    * **Forest Plots** zum Vergleich der Performance verschiedener Methoden.
    * Dashboard-Diagramme zur schnellen Übersicht über die Kohorten-Charakteristika.
* **Publikations-Assistent**:
    * Ein dedizierter Tab generiert ein vollständiges **Manuskript (Abstract, Einleitung, Methoden, Ergebnisse, Diskussion)**.
    * Alle Texte, Tabellen und Abbildungslegenden werden dynamisch basierend auf den Analyseergebnissen erstellt.
    * Die Formatierung (z.B. P-Wert-Darstellung) folgt strikt den **Stilvorgaben des Journals *Radiology***.
* **Zentralisierter Export**: Download von gefilterten Daten, Tabellen und Diagrammen in verschiedenen Formaten (**CSV, Markdown, PNG, SVG**).

---

## 3. Technischer Überblick

* **Frontend**: Reines HTML5, CSS3, und modernes JavaScript (ES6+), vollständig clientseitig.
* **UI-Framework**: **Bootstrap 5.3** für Layout, Komponenten und Responsivität.
* **Datenvisualisierung**: **D3.js (v7)** für alle statistischen Diagramme und Visualisierungen.
* **Asynchrone Berechnungen**: **Web Worker** für die rechenintensive Brute-Force-Optimierung, um die UI reaktionsfähig zu halten.
* **UI-Erweiterungen**:
    * **Tippy.js** für kontextsensitive Tooltips.
    * **Font Awesome** für die Icon-Bibliothek.
* **Daten-Handling**: **PapaParse** für CSV-Operationen im Export-Modul.
* **Export-Technologien**:
    * **JSZip** zur Erstellung von .zip-Archiven für gebündelte Downloads.
    * **html2canvas** zur Konvertierung von HTML-Tabellen in PNG-Bilder.
* **Architektur**: Die Anwendung folgt einem modernen, modularen JavaScript-Muster (IIFE-Module), um den globalen Namespace sauber zu halten und eine klare Trennung der Verantwortlichkeiten zu gewährleisten (`state`, `core logic`, `services`, `ui components`).

---

## 4. Erste Schritte

Es ist **keine Installation** auf einem Server notwendig.

1.  Klonen oder laden Sie dieses Repository herunter.
2.  Stellen Sie sicher, dass alle Dateien ihre Verzeichnisstruktur beibehalten.
3.  Öffnen Sie die Datei `index.html` in einem modernen Webbrowser (Chrome, Firefox, Edge empfohlen).

Die Anwendung ist nun betriebsbereit.

---

## 5. Modulübersicht (Tabs)

1.  **Daten**: Zeigt die gefilterten Rohdaten des ausgewählten Kollektivs in einer sortierbaren Tabelle. Detailansichten pro Patient zeigen die zugrundeliegenden Lymphknoten-Eigenschaften.
2.  **Auswertung**: Das interaktive Herzstück der Anwendung. Hier definieren Sie T2-Kriterien, sehen deren Performance in Echtzeit und können die Brute-Force-Optimierung starten.
3.  **Statistik**: Bietet detaillierte statistische Auswertungen und Vergleiche zwischen dem Avocado Sign und den von Ihnen definierten T2-Kriterien, inklusive ROC-Kurven und Konfusionsmatrizen.
4.  **Präsentation**: Erstellt kompakte, übersichtliche Tabellen und Grafiken, die sich ideal für Vorträge eignen. Hier können Sie das Avocado Sign gegen verschiedene Literatur-Kriterien oder Ihre selbst definierten Kriterien vergleichen.
5.  **Publikation**: Der Manuskript-Generator. Navigieren Sie durch die Sektionen eines wissenschaftlichen Artikels und sehen Sie dynamisch generierte Texte und Tabellen, die für eine Einreichung bei *Radiology* formatiert sind.
6.  **Export**: Die zentrale Anlaufstelle, um alle generierten Daten, Tabellen, Abbildungen und Berichte in verschiedenen Formaten herunterzuladen.

---

## 6. Dateistruktur

Die optimierte Projektstruktur ist wie folgt aufgebaut:

```
/
├── index.html
├── README.md
├── css/
│   └── style.css
├── data/
│   └── patient_data.js
├── img/
│   └── avocado_sign_logo.png
├── js/
│   ├── app.js
│   ├── config/
│   ├── core/
│   ├── services/
│   ├── state/
│   ├── ui/
│   │   ├── components/
│   │   ├── tabs/
│   │   └── event_handlers/
│   └── utils/
└── workers/
└── brute_force_worker.js
```

---

## 7. Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen finden Sie in der `LICENSE`-Datei (falls vorhanden).

---

## 8. Kontakt

Projekt-Autor: M. Lurz - [GitHub-Profil](https://github.com/mlurz92)

