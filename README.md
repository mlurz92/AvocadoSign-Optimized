# Avocado Sign Analyse Tool - Technische Dokumentation

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Architektur](https://img.shields.io/badge/architektur-MVC--like-blueviolet.svg)
![Tech Stack](https://img.shields.io/badge/tech-JS%20/%20HTML%20/%20CSS-lightgrey.svg)

---

## 1. Übersicht und Zielsetzung

Das **Avocado Sign Analyse Tool** ist eine hochspezialisierte, interaktive Single-Page-Webanwendung (SPA) für die medizinisch-wissenschaftliche Forschung. Ihr Kernzweck ist die detaillierte, datengestützte Analyse und der statistische Performance-Vergleich von MRT-Kriterien zur Beurteilung des Lymphknotenstatus beim Rektumkarzinom. Die Anwendung wurde entwickelt, um eine systematische, reproduzierbare und effiziente Auswertung zu ermöglichen, die von der interaktiven Kriterienfindung bis zur automatisierten Erstellung eines publikationsreifen Manuskriptentwurfs reicht.

---

## 2. Technologischer Stack & Systemanforderungen

Die Anwendung ist als reine Client-Side-Anwendung konzipiert, die keine serverseitige Logik oder Datenbank benötigt.

* **Kerntechnologien:**
    * **JavaScript (ES6+):** Für die gesamte Anwendungslogik und Interaktivität.
    * **HTML5 & CSS3:** Für die Struktur und das benutzerdefinierte Styling der Benutzeroberfläche.
* **Hauptbibliotheken:**
    * **D3.js (v7):** Zur Erstellung aller dynamischen und interaktiven Datenvisualisierungen und Diagramme.
    * **Bootstrap (v5.3):** Als responsives UI-Framework für das grundlegende Layout, die Komponenten (Buttons, Karten, Tabs) und das Grid-System.
    * **Tippy.js (v6):** Zur Implementierung der kontextsensitiven, reichhaltigen Tooltips, die ein wesentlicher Bestandteil der User Experience sind.
    * **Font Awesome (v6.5):** Für die Icon-Darstellung in der gesamten Anwendung.
    * **JSZip & FileSaver.js:** Zur clientseitigen Generierung von ZIP-Archiven und zum Auslösen von Datei-Downloads für die Exportfunktionen.
* **Systemanforderungen:**
    * Ein moderner, immergrüner Webbrowser (z.B. Google Chrome, Mozilla Firefox, Microsoft Edge) mit aktiviertem JavaScript.
    * Für eine optimale Performance, insbesondere bei der Brute-Force-Optimierung, wird ein System mit einer zeitgemäßen CPU empfohlen.

---

## 3. Setup & Inbetriebnahme

Die Inbetriebnahme ist unkompliziert und erfordert keine Build-Prozesse.

1.  **Repository beziehen:** Klonen oder laden Sie das Repository auf Ihr lokales System.
    ```bash
    git clone [https://github.com/mlurz92/AvocadoSign-Optimized.git](https://github.com/mlurz92/AvocadoSign-Optimized.git)
    ```
2.  **Anwendung starten:**
    * **Empfohlene Methode (Lokaler Webserver):** Um potenzielle Browser-Sicherheitsbeschränkungen (CORS bei direkten Datei-Zugriffen) zu umgehen, wird der Betrieb über einen lokalen Webserver dringend empfohlen.
        * Navigieren Sie im Terminal in das Projektverzeichnis.
        * Starten Sie einen einfachen Server, z.B. mit Python 3:
            ```bash
            python -m http.server
            ```
        * Öffnen Sie die angezeigte URL (meist `http://localhost:8000`) in Ihrem Browser.
    * **Alternative Methode:** Öffnen Sie die Datei `index.html` direkt im Browser. Diese Methode kann bei einigen Browsern zu Problemen beim Laden von Modulen führen.

---

## 4. Architektur-Konzept

Die Anwendung wurde nach modernen Software-Architektur-Prinzipien grundlegend neugestaltet, um maximale Wartbarkeit, Skalierbarkeit und logische Klarheit zu erreichen.

### 4.1. Design-Philosophie

* **Modularität:** Jede Funktionseinheit ist in einem eigenen, gekapselten Modul untergebracht. Dies reduziert Abhängigkeiten und erleichtert Tests und Erweiterungen.
* **Separation of Concerns (SoC):** Es besteht eine strikte Trennung zwischen Datenverarbeitung (Core/Services), Anwendungssteuerung (Controller) und Darstellung (Renderer). Kein Modul greift in die Verantwortlichkeiten eines anderen ein.
* **Single Source of Truth:** Der Anwendungszustand (z.B. aktiver Tab, Sortierreihenfolge, ausgewählte Kriterien) wird zentral im `stateManager` verwaltet. Module lesen aus diesem Zustand, ändern ihn aber nicht direkt, sondern über definierte Schnittstellen.

### 4.2. Das MVC-ähnliche Muster

Die Struktur orientiert sich an einem klassischen Model-View-Controller-Muster:

* **Model:** Die `core`- und `services`-Schichten. Sie repräsentieren die Geschäftslogik.
    * `core`: Hält die Kernregeln der Datenauswertung (z.B. wie T2-Kriterien angewendet werden).
    * `services`: Bietet wiederverwendbare Funktionalitäten wie statistische Berechnungen, Export-Logik oder die Kommunikation mit dem Web Worker.
* **View:** Die `renderers`-Schicht. Diese Module sind "dumm" und ausschließlich dafür verantwortlich, Daten in HTML umzuwandeln. Sie enthalten keinerlei Anwendungslogik.
* **Controller:** Die `controllers`-Schicht. Sie sind das Bindeglied. Sie lauschen auf UI-Events (z.B. Klicks), delegieren Rechen- und Datenaufgaben an das **Model** (Services/Core) und weisen anschließend die **View** (Renderer) an, sich mit den neuen Daten zu aktualisieren.

### 4.3. Unidirektionaler Datenfluss & Render-Zyklus

Die Anwendung folgt einem klaren, unidirektionalen Datenfluss, der vom zentralen `main.js`-Modul gesteuert wird:

1.  **Aktion:** Ein Benutzer interagiert mit der UI (z.B. Klick auf einen Button).
2.  **Controller:** Der zuständige Controller fängt das Event ab.
3.  **Zustandsänderung:** Der Controller aktualisiert den Anwendungszustand über den `stateManager` (z.B. `stateManager.setCurrentKollektiv(...)`).
4.  **Render-Anstoß:** Der Controller ruft die zentrale `mainApp.updateAndRender()`-Funktion auf.
5.  **Datenverarbeitung:** `updateAndRender()` holt den neuen Zustand vom `stateManager` und die aufbereiteten Daten vom `dataProcessor`.
6.  **Rendering:** `updateAndRender()` ruft den zuständigen Renderer (z.B. `dataRenderer.render(...)`) mit den neuen Daten auf, um den HTML-Code zu erzeugen.
7.  **DOM-Update:** Der erzeugte HTML-Code wird in die Seite eingefügt.
8.  **Post-Render-Updates:** Notwendige Nacharbeiten werden ausgeführt (z.B. Initialisierung von Tooltips, Aufruf von Controller-Update-Funktionen).

---

## 5. Detaillierte Projektstruktur & Modul-Beschreibung

Jede Datei und jedes Verzeichnis hat eine klar definierte Aufgabe.

```
/
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
│   │   ├── study_criteria_manager.js # Verwaltet die festen T2-Kriteriensets aus publizierten Studien.
│   │   └── t2_criteria_manager.js  # Verwaltet die interaktiv definierten T2-Kriterien.
│   ├── services/
│   │   ├── brute_force_manager.js # Steuert den Web Worker für die Brute-Force-Optimierung.
│   │   ├── export_service.js   # Kapselt die gesamte Logik zur Dateierstellung und zum Download.
│   │   ├── publication_generator_service.js # Generiert den wissenschaftlichen Text für den Publikation-Tab.
│   │   └── statistics_service.js # Führt alle statistischen Berechnungen durch.
│   ├── ui/
│   │   ├── controllers/
│   │   │   ├── auswertung_controller.js # Steuert alle Interaktionen auf dem Auswertung-Tab.
│   │   │   ├── data_controller.js       # Steuert alle Interaktionen auf dem Daten-Tab.
│   │   │   ├── export_controller.js     # Steuert alle Interaktionen auf dem Export-Tab.
│   │   │   ├── praesentation_controller.js # Steuert alle Interaktionen auf dem Präsentation-Tab.
│   │   │   ├── publikation_controller.js   # Steuert alle Interaktionen auf dem Publikation-Tab.
│   │   │   └── statistik_controller.js    # Steuert alle Interaktionen auf dem Statistik-Tab.
│   │   ├── renderers/
│   │   │   ├── auswertung_renderer.js   # Erzeugt das HTML für den Auswertung-Tab.
│   │   │   ├── chart_renderer.js        # Erzeugt alle D3.js-Diagramme.
│   │   │   ├── data_renderer.js         # Erzeugt das HTML für den Daten-Tab.
│   │   │   ├── export_renderer.js       # Erzeugt das HTML für den Export-Tab.
│   │   │   ├── praesentation_renderer.js  # Erzeugt das HTML für den Präsentation-Tab.
│   │   │   ├── publication_renderer.js    # Erzeugt das HTML für den Publikation-Tab.
│   │   │   ├── statistik_renderer.js      # Erzeugt das HTML für den Statistik-Tab.
│   │   │   └── table_renderer.js        # Zentraler Generator für Tabellenköpfe und -zeilen.
│   │   ├── components.js       # Generatoren für kleine, wiederverwendbare UI-Elemente (z.B. Icons, Buttons).
│   │   └── helpers.js          # Allgemeine UI-Hilfsfunktionen (Toasts, Tooltips, DOM-Manipulation).
│   └── utils/
│       └── utils.js            # Globale, nicht-UI-bezogene Hilfsfunktionen (Formatierung, IDs).
├── workers/
│   └── brute_force_worker.js # Rechenintensiver Code für die Brute-Force-Optimierung.
└── index.html                # Einziger HTML-Einstiegspunkt.
```

---

## 6. Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert. Dies bedeutet, Sie können den Code frei verwenden, modifizieren und verbreiten, solange der ursprüngliche Copyright-Hinweis beibehalten wird.
