# Avocado Sign Analyse Tool

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/tech-JS%20/%20HTML%20/%20CSS-lightgrey.svg)

Das **Avocado Sign Analyse Tool** ist eine interaktive Webanwendung zur wissenschaftlichen Auswertung und zum Performance-Vergleich von MRT-Kriterien für das Lymphknoten-Staging beim Rektumkarzinom. Es ermöglicht eine detaillierte Gegenüberstellung des "Avocado Signs" mit etablierten und benutzerdefinierten T2-gewichteten morphologischen Kriterien.

## ✨ Hauptfunktionen

* **Interaktive T2-Kriterien-Definition:** Definieren Sie flexible T2-Kriteriensets durch eine Kombination aus Größe, Form, Kontur, Homogenität und Signalverhalten mit UND/ODER-Logik.
* **Brute-Force-Optimierung:** Finden Sie automatisch das T2-Kriterienset, das eine gewählte statistische Metrik (z.B. Balanced Accuracy, F1-Score) für das aktuelle Datenkollektiv maximiert.
* **Detaillierte statistische Analyse:** Umfassende statistische Auswertungen, inklusive diagnostischer Gütekriterien (Sensitivität, Spezifität, AUC etc.) mit 95%-Konfidenzintervallen, Vergleichstests (McNemar, DeLong) und Assoziationstests.
* **Vergleichs-Modus:** Stellen Sie zwei beliebige Patientenkohorten (z.B. pRCT vs. nRCT) in einer übersichtlichen "Side-by-Side"-Ansicht gegenüber.
* **Publikations-Generator:** Erstellt einen strukturierten, formatierten und mit den aktuellen Analyseergebnissen befüllten Manuskriptentwurf, der den Richtlinien des Fachjournals *Radiology* folgt (Deutsch & Englisch).
* **Präsentations-Ansichten:** Generiert reduzierte, auf das Wesentliche fokussierte Ansichten, ideal für Vorträge und Präsentationen.
* **Umfassender Daten-Export:** Exportieren Sie alle Tabellen, Rohdaten, Statistiken und Diagramme in verschiedenen Formaten (CSV, MD, PNG, SVG, XLSX, ZIP).

## 🚀 Setup und Nutzung

Die Anwendung ist eine reine Client-Side-Anwendung und erfordert keine komplexe Installation.

1.  **Repository klonen oder herunterladen:**
    ```bash
    git clone [https://github.com/mlurz92/AvocadoSign-Optimized.git](https://github.com/mlurz92/AvocadoSign-Optimized.git)
    ```
2.  **Anwendung starten:**
    * **Empfohlene Methode:** Starten Sie einen lokalen Webserver im Projektverzeichnis. Dies verhindert mögliche Probleme mit Browser-Sicherheitsrichtlinien (CORS). Ein einfacher Python-Server genügt:
        ```bash
        # Python 3
        python -m http.server
        ```
        Öffnen Sie anschließend `http://localhost:8000` in Ihrem Browser.
    * **Alternative:** Öffnen Sie die Datei `index.html` direkt in einem modernen Webbrowser (Chrome, Firefox, Edge).

## 🛠️ Technologie-Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Visualisierung:** [D3.js](https://d3js.org/)
* **UI-Framework:** [Bootstrap 5](https://getbootstrap.com/)
* **UI-Helfer:** [Tippy.js](https://atomiks.github.io/tippyjs/) (für Tooltips)
* **Client-seitige Dateien:** [JSZip](https://stuk.github.io/jszip/), [FileSaver.js](https://github.com/eligrey/FileSaver.js)

## 📂 Projektstruktur

Die Anwendung folgt einer modularen, am MVC-Muster orientierten Architektur, um eine klare Trennung der Verantwortlichkeiten zu gewährleisten.
