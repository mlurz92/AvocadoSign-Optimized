# Avocado Sign Analyse Tool 🥑

## Kurzbeschreibung

Das **Avocado Sign Analyse Tool** ist eine interaktive Webanwendung zur umfassenden Analyse und Validierung des "Avocado Signs", eines neuartigen MRT-basierten Bildgebungsmarkers für das Lymphknoten-Staging bei Rektumkarzinom-Patienten (basierend auf der Studie von Lurz & Schäfer, 2025). Die Anwendung ermöglicht den detaillierten Vergleich des Avocado Signs mit traditionellen T2-gewichteten morphologischen Kriterien.

Diese Version wurde signifikant erweitert, um Forscher und Radiologen optimal bei der **Vorbereitung einer wissenschaftlichen Publikation** zu unterstützen, mit einem besonderen Fokus auf die inhaltlichen und formalen Anforderungen des renommierten Fachjournals **"Radiology"**.

## Hauptfunktionen

* **Datenexploration:** Visualisierung und Filterung des zugrundeliegenden Patientendatensatzes (N=106).
* **Flexible T2-Kriteriendefinition:** Interaktive Definition und Anwendung von T2-gewichteten morphologischen Kriterien (Größe, Form, Kontur, Homogenität, Signal) inklusive logischer Verknüpfungen (UND/ODER).
* **Brute-Force-Optimierung:** Automatisierte Identifikation der T2-Kriterienkombination, die eine gewählte diagnostische Zielmetrik (z.B. Balanced Accuracy, F1-Score) maximiert.
* **Umfassende statistische Analysen:**
    * Deskriptive Statistiken.
    * Berechnung diagnostischer Gütemaße (Sensitivität, Spezifität, PPV, NPV, Accuracy, Balanced Accuracy/AUC, F1-Score) mit 95% Konfidenzintervallen (Wilson Score, Bootstrap Perzentil mit 5000 Replikationen).
    * Statistische Vergleiche zwischen dem Avocado Sign und verschiedenen T2-Kriteriensets (McNemar-Test, DeLong-Test).
    * Assoziationsanalysen und Vergleich unabhängiger Kohorten.
* **Präsentationsmodus:** Aufbereitete Darstellung von Vergleichsergebnissen für Vorträge.
* **Publikation-Tab (Stark erweitert & "Radiology"-fokussiert):**
    * Generierung von Textbausteinen für die Abschnitte "Methoden" und "Ergebnisse" in Deutsch und Englisch.
    * Erstellung "Radiology"-konformer Tabellen (Patientencharakteristika, MRT-Sequenzparameter, Performance-Metriken, etc.).
    * Einbettung von Platzhaltern und Generierung von Diagrammen (CONSORT-Flussdiagramm, ROC-Kurven, Performance-Vergleichsdiagramme).
    * Rudimentäres Referenzmanagement mit Formatierung im Vancouver-Stil.
* **Vielfältige Exportoptionen:**
    * Daten und Ergebnisse: CSV, **XLSX**, Markdown (MD).
    * Berichte: Umfassender HTML-Analysebericht.
    * Publikationstexte: **DOCX**.
    * Diagramme: PNG, SVG.
    * ZIP-Pakete für gebündelte Exporte.

## Technologie-Stack

* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
* **Styling:** Bootstrap 5.3
* **Diagramme:** D3.js v7
* **Tooltips:** Tippy.js v6
* **Datenparsing (intern für CSV-Export):** PapaParse v5.4
* **ZIP-Erstellung:** JSZip v3.10
* **XLSX-Export:** SheetJS (xlsx.full.min.js) v0.18.5
* **DOCX-Export:** html-to-docx v1.8.0 (via Markdown-Konvertierung mit Marked.js v4.3.0)
* **Tabellen-zu-PNG Export:** html2canvas v1.4.1
* **Hintergrundverarbeitung:** Web Worker für die Brute-Force-Optimierung.

Die Anwendung läuft vollständig clientseitig im Browser.

## Datengrundlage

Die Analysen basieren auf einem Kollektiv von 106 Patienten mit Rektumkarzinom, wie in der Studie von Lurz & Schäfer (Eur Radiol, 2025) beschrieben. Der Datensatz umfasst klinische Informationen, den pathologischen N-Status als Referenzstandard sowie detaillierte MRT-Befunde zum Avocado Sign (T1KM) und zu morphologischen T2-Kriterien.

## Schnellstart / Bedienung

1.  **Öffnen:** Laden Sie die `index.html`-Datei in einem modernen Webbrowser (Chrome, Firefox, Edge empfohlen).
2.  **Kollektivauswahl:** Wählen Sie im Header das globale Patientenkollektiv (`Gesamt`, `Direkt OP`, `nRCT`). Diese Auswahl beeinflusst alle Analysen.
3.  **Tabs erkunden:**
    * **Daten:** Zeigt die Patientendaten an. Reihen sind aufklappbar für T2-Lymphknotendetails.
    * **Auswertung:**
        * Definieren Sie T2-Malignitätskriterien und deren logische Verknüpfung. Klicken Sie "Anwenden & Speichern".
        * Starten Sie optional die Brute-Force-Optimierung, um datengetriebene Kriterien zu finden.
        * Die Tabelle zeigt die Auswertung pro Patient basierend auf den *angewendeten* Kriterien.
    * **Statistik:** Enthält detaillierte statistische Auswertungen (deskriptiv, diagnostische Güte, Vergleiche). Wählen Sie "Einzelansicht" oder "Vergleich Aktiv".
    * **Präsentation:** Zeigt aufbereitete Ergebnisse, ideal für schnelle Vergleiche von AS vs. T2-Methoden.
    * **Publikation:**
        * Wählen Sie Sprache (DE/EN) und den gewünschten Publikationsabschnitt (Methoden, Ergebnisse).
        * Die Anwendung generiert Textvorschläge, Tabellen und Platzhalter für Abbildungen.
        * Exportieren Sie den generierten Text als .docx.
    * **Export:** Laden Sie verschiedene Daten, Ergebnisse, Diagramme und Berichte herunter.
4.  **Kurzanleitung:** Klicken Sie auf den "Kurzanleitung"-Button im Header für weitere Bedienungshinweise direkt in der App.

## Publikation-Tab im Detail

Der Publikation-Tab wurde umfassend überarbeitet, um die Erstellung eines Manuskripts nach den Standards von "Radiology" zu unterstützen:
* **Strukturierte Inhalte:** Generiert Textvorschläge für die Abschnitte Methoden und Ergebnisse, inklusive aller relevanten Unterpunkte (Studiendesign, Ethik, Patientenkollektiv, MRT-Protokoll, Bildanalyse für AS und T2, Referenzstandard, statistische Methoden, Patientencharakteristika, Performance-Analysen, Vergleiche).
* **"Radiology"-konforme Tabellen:** Erstellt automatisch formatierte Tabellen für Patientencharakteristika, MRT-Sequenzparameter, Übersicht der Literatur-T2-Kriterien, diagnostische Güte des AS, der Literatur-T2-Sets und der optimierten T2-Sets sowie statistische Vergleiche.
* **Diagramme:** Enthält Platzhalter und Logik zur Einbettung relevanter Diagramme, wie ein CONSORT-ähnliches Flussdiagramm, ROC-Kurven und Performance-Vergleichsdiagramme.
* **Referenzmanagement:** Zitationen werden im Text als Keys (z.B. `[Lurz2025]`) eingefügt. Eine formatierte Literaturliste im Vancouver-Stil wird im Referenzen-Abschnitt generiert, wobei die Zitationen basierend auf ihrer Reihenfolge in der Konfiguration nummeriert werden (eine zukünftige Version könnte die Nummerierung dynamisch an die Reihenfolge des Erscheinens im Text anpassen).
* **Sprachunterstützung:** Alle generierten Inhalte sind auf Deutsch und Englisch verfügbar.
* **DOCX-Export:** Die generierten Textabschnitte können direkt als .docx-Datei für die Weiterverarbeitung exportiert werden.

## Detaillierte Dokumentation

Eine ausführlichere Beschreibung aller Funktionen, Datenstrukturen und statistischen Methoden finden Sie in der Datei `docs/Anwendungsbeschreibung.txt`.

## Limitationen

* Dies ist ein Forschungswerkzeug und nicht für die klinische Diagnostik validiert oder zugelassen.
* Die Ergebnisse und statistischen Berechnungen sollten für finale Publikationen kritisch überprüft und gegebenenfalls mit etablierter Statistiksoftware validiert werden.
* Die Brute-Force-Optimierung identifiziert ein Optimum basierend auf den vordefinierten Parametern und Schritten; es ist nicht garantiert, dass dies das globale Optimum aller denkbaren Kriterien darstellt.

## Lizenz

[Platzhalter für Lizenzinformationen, z.B. MIT License]

## Autoren / Kontakt

[Platzhalter für Autoreninformationen und Kontakt]
