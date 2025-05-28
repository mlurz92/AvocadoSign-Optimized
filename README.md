# Lymphknoten T2 - Avocado Sign Analyse-Tool v2.5.0

Ein webbasiertes Analysewerkzeug zur Untersuchung der diagnostischen Güte des Avocado Signs im Vergleich zu verschiedenen morphologischen T2-Kriterien bei der Lymphknotenbeurteilung des Rektumkarzinoms mittels MRT.

## Übersicht

Diese Anwendung ermöglicht es Forschern und Medizinern, einen anonymisierten Patientendatensatz interaktiv zu analysieren, T2-gewichtete MRT-Kriterien flexibel zu definieren und deren diagnostische Performance im Vergleich zum Avocado Sign zu bewerten. Das Tool bietet detaillierte statistische Auswertungen, Visualisierungen und unterstützt die Erstellung von Publikationen durch automatisch generierte Textentwürfe.

**Version:** 2.5.0 (Optimierte Version)

## Hauptfunktionen

* **Interaktive Datentabellen:** Anzeige und Sortierung von Patientendaten und Auswertungsergebnissen.
* **Flexible T2-Kriteriendefinition:**
    * Anpassung von Kriterien wie Größe (Kurzachse), Form, Kontur, Homogenität und Signalintensität.
    * Wahl der logischen Verknüpfung (UND/ODER).
    * Visuell klare Darstellung aktiver/inaktiver Kriterien und der resultierenden kumulativen Logik.
    * Möglichkeit zum Laden und Anwenden vordefinierter T2-Kriteriensets aus der Literatur.
* **Brute-Force-Optimierung:**
    * Automatisierte Suche nach der T2-Kriterienkombination, die eine ausgewählte Zielmetrik (z.B. Balanced Accuracy, Accuracy, F1-Score) maximiert.
    * Detaillierte Anzeige der Top-Ergebnisse inklusive 4-Felder-Tafel (RP, FP, FN, RN) und abgeleiteter Metriken (Sens, Spez, PPV, NPV) pro Kombination.
    * Exportmöglichkeit der vollständigen Brute-Force Rohdaten (alle getesteten Kombinationen).
* **Umfassende Statistische Analysen:**
    * Berechnung und Darstellung von Sensitivität, Spezifität, PPV, NPV, Accuracy, Balanced Accuracy, F1-Score und AUC für das Avocado Sign und die definierten T2-Kriterien.
    * **Integration von Positivem und Negativem Likelihood Ratio (LR+, LR-)** mit Konfidenzintervallen.
    * **Erweiterte statistische Vergleiche** zwischen Avocado Sign und T2-Kriterien (McNemar-Test für Accuracy, DeLong-Test für AUC).
    * Vergleich von Metriken (Accuracy, AUC, Sensitivität, Spezifität) zwischen verschiedenen Patientenkollektiven.
    * Assoziationsanalysen (Odds Ratios, Risk Differences, Phi-Koeffizient) einzelner Merkmale mit dem N-Status.
    * **Explorative Analyse auf Lymphknoten-Ebene** (deskriptive Statistiken für Lymphknoten, stratifiziert nach Pathologie).
    * Vergleichstabelle der Performance von Avocado Sign, angewandten T2-Kriterien und wichtigen Literatur-Kriteriensets.
* **Dynamische Diagramme und Visualisierungen:**
    * Histogramme, Balken- und Tortendiagramme für deskriptive Daten.
    * **Interaktive ROC-Kurven** mit Anzeige des optimalen Cut-offs (falls anwendbar) und AUC mit 95%-CI.
    * **Generierung von Forest-Plots** für Odds Ratios / Risk Differences.
* **Verbesserte Exportoptionen:**
    * Export von Tabellen und Analyseergebnissen als CSV und Markdown.
    * Export von Diagrammen als **SVG (vektorbasiert) und PNG (mit wählbarer Auflösung - DPI)**.
    * **"One-Click" Publikations-Chart-Paket:** Gesammelter Download aller relevanten Diagramme für eine Publikation als ZIP.
    * Export eines umfassenden HTML-Analyseberichts.
* **Publikationsunterstützung (stark erweitert):**
    * Dynamische Generierung von Textentwürfen (Deutsch/Englisch) für Methoden- und Ergebnisteile einer wissenschaftlichen Publikation.
    * Inhalte orientieren sich stark an Struktur und Detaillierungsgrad relevanter Originalarbeiten zum Thema.
    * Fokus auf den Vergleich von Avocado Sign mit Literatur-basierten und Brute-Force optimierten T2-Kriterien.
    * Automatische Integration von relevanten statistischen Werten, Tabellen- und Abbildungsplatzhaltern.
* **Patientenkollektive:** Analyse für Gesamtkohorte, Direkt-OP-Gruppe und nRCT-Gruppe.
* **Benutzerfreundliche Oberfläche:** Intuitive Bedienung mit Tooltips und einer Kurzanleitung.
* **Technische Optimierungen:**
    * Erweiterte Modularisierung des JavaScript-Codes für bessere Wartbarkeit.
    * Refactoring des CSS für klarere Struktur und Konsistenz.
    * Verfeinertes State Management.
    * **Dynamisches Laden von JavaScript-Modulen** zur Verbesserung der initialen Ladezeit.
    * Performance-Optimierungen für UI-Updates.

## Technologien

* HTML5
* CSS3 (mit CSS Variablen für Theming)
* JavaScript (ES6+)
* Bootstrap 5.3 (UI Framework)
* D3.js v7 (Datenvisualisierung)
* Tippy.js (Tooltips)
* PapaParse (CSV Parsing für potenziellen Datenimport - nicht aktiv genutzt)
* JSZip (ZIP-Datei Erstellung für Exporte)

## Datenbasis

Die Anwendung verwendet einen anonymisierten Datensatz von Patienten mit Rektumkarzinom. Der histopathologische Befund der operativ entfernten Lymphknoten dient als Referenzstandard. Die genauen Details zur Studienpopulation und Datenerhebung sind der assoziierten Primärpublikation zum Avocado Sign zu entnehmen (Lurz & Schäfer, 2025).

## Zielgruppe

Dieses Tool richtet sich an Forscher, Radiologen, Chirurgen, Onkologen und andere medizinische Fachkräfte, die sich mit der Diagnostik und dem Staging des Rektumkarzinoms beschäftigen und die Performance verschiedener MRT-basierter Kriterien untersuchen möchten.

## Nutzung

1.  Laden Sie das Repository herunter oder klonen Sie es.
2.  Öffnen Sie die Datei `index.html` in einem modernen Webbrowser (z.B. Chrome, Firefox, Edge, Safari).
3.  Es ist keine serverseitige Komponente oder Installation notwendig. Alle Berechnungen erfolgen clientseitig.

## Wichtige Hinweise

* Diese Anwendung ist ein **Forschungswerkzeug** und **nicht für die primäre klinische Diagnostik oder Behandlungsentscheidungen** vorgesehen.
* Die Ergebnisse basieren auf dem integrierten Datensatz. Interpretationen sollten im Kontext der Studienpopulation und der Methodik der Datenerhebung erfolgen.
* Die Brute-Force-Optimierung kann je nach Umfang der Daten und Komplexität der Kriterien rechenintensiv sein und einige Zeit in Anspruch nehmen. Sie läuft in einem Web Worker, um die UI nicht zu blockieren.

## Autoren

Maximilian Lurz (Konzept, Daten, ursprüngliche Implementierung)
KI-Coding Agent (Überarbeitung und Optimierung v2.5.0)

## Lizenz

Details zur Lizenz sind der Datei `LICENSE` (falls vorhanden) zu entnehmen oder beim Autor zu erfragen.
