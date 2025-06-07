# **Lymphknoten T2 \- Avocado Sign Analyse Tool (Version 2.3.0)**

## **1\. Übersicht**

Das **Lymphknoten T2 \- Avocado Sign Analyse Tool** ist eine webbasierte Anwendung, die speziell für die wissenschaftliche Forschung im Bereich der radiologischen Diagnostik des Rektumkarzinoms entwickelt wurde. Es dient der detaillierten Analyse und dem Vergleich der diagnostischen Leistung verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status). Im Fokus steht der Vergleich des neuartigen "Avocado Signs" (AS) mit etablierten Literatur-basierten sowie datengetriebenen, optimierten T2-gewichteten (T2w) morphologischen Kriterien.

Diese Anwendung ist als interaktives Forschungsinstrument konzipiert und **nicht für die klinische Diagnostik oder direkte Therapieentscheidungen vorgesehen.**

## **2\. Hauptfunktionen**

Das Tool bietet eine breite Palette an Funktionalitäten für die wissenschaftliche Analyse:

* **Interaktive Datenexploration:** Detaillierte Ansicht und Filterung von pseudonymisierten Patientendaten, inklusive klinischer Informationen und spezifischer Lymphknotenmerkmale.  
* **Dynamische T2-Kriterien-Definition:** Flexible Konfiguration und sofortige Anwendung von komplexen T2w-Kriteriensets (basierend auf Größe, Form, Kontur, Homogenität, Signal) mit UND/ODER-Logik.  
* **Brute-Force-Optimierung:** Ein integrierter Algorithmus zur automatisierten Identifikation der T2w-Kriterienkombination, die eine vom Nutzer gewählte diagnostische Zielmetrik (z.B. Balanced Accuracy, F1-Score) für das ausgewählte Patientenkollektiv maximiert.  
* **Umfassende statistische Auswertung:** Berechnung und Darstellung einer Vielzahl diagnostischer Gütekriterien (Sensitivität, Spezifität, Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Accuracy, Balanced Accuracy, Area Under the Curve (AUC)) inklusive 95%-Konfidenzintervallen und p-Werten. Vergleichende Statistiken zwischen verschiedenen Methoden und Kollektiven werden ebenfalls bereitgestellt.  
* **Publikationsunterstützung (*Radiology*\-Fokus):** Automatische Generierung von Textentwürfen, Tabellen und Abbildungen für wissenschaftliche Manuskripte, spezifisch ausgerichtet auf die formalen und stilistischen Anforderungen des Fachjournals *Radiology*.  
* **Präsentationserstellung:** Aufbereitung ausgewählter Ergebnisse in einem übersichtlichen Format, das direkt für wissenschaftliche Präsentationen verwendet werden kann.  
* **Vielseitiger Datenexport:** Export von Rohdaten, Analyseergebnissen, Tabellen und Grafiken in verschiedenen Formaten (CSV, XLSX, TXT, MD, PNG, SVG, HTML, ZIP).

## **3\. Datenbasis**

Die Analysen innerhalb dieser Anwendungsversion basieren auf einem fest integrierten, pseudonymisierten Datensatz von **106 Patientenfällen** mit histologisch gesichertem Rektumkarzinom. Dieser Datensatz umfasst:

* Klinische Basisinformationen (Alter, Geschlecht, Therapiegruppe).  
* Den durch Histopathologie bestätigten N-Status jedes Patienten (Referenzstandard).  
* Die Befundung des Avocado Signs für jeden relevanten Lymphknoten.  
* Detaillierte morphologische Eigenschaften für jeden im T2-gewichteten MRT beurteilten Lymphknoten (Kurzachsendurchmesser, Form, Kontur, Homogenität, Signalintensität).

## **4\. Verwendete Technologien**

Die Anwendung ist als reine Client-Side Webanwendung implementiert und nutzt folgende Kerntechnologien:

* **HTML5:** Für die strukturelle Basis der Webseite.  
* **CSS3:** Für das Styling und Layout.  
* **JavaScript (ES6+):** Für die gesamte Anwendungslogik, Datenverarbeitung, statistische Berechnungen und dynamische UI-Interaktionen.  
* **Bootstrap 5:** Als CSS-Framework für ein responsives Design und vorgefertigte UI-Komponenten.  
* **D3.js:** Zur Generierung dynamischer und interaktiver Diagramme und Visualisierungen.  
* **Tippy.js:** Für die Anzeige kontextsensitiver Tooltips.  
* **PapaParse:** Zur Verarbeitung von CSV-Daten (primär für potenzielle zukünftige Importfunktionen oder interne Datenaufbereitung).  
* **JSZip:** Zur Erstellung von ZIP-Archiven für die Exportfunktionalitäten.  
* **Web Workers:** Für rechenintensive Aufgaben im Hintergrund (z.B. Brute-Force-Optimierung), um die Reaktionsfähigkeit der Benutzeroberfläche zu gewährleisten.

## **5\. Anwendungsstruktur (Tab-Übersicht)**

Die Anwendung ist in mehrere thematische Module (Tabs) gegliedert:

### **5.1 Tab: Daten**

* **Funktion:** Anzeige und Exploration der detaillierten Patientendaten des aktuell ausgewählten globalen Kollektivs.  
* **Kerninhalte:** Sortierbare Tabelle mit Patienteninformationen (pseudonymisierte ID, Alter, Geschlecht, Therapie, N/AS/T2-Status, Bemerkungen). Aufklappbare Detailansicht für jeden Patienten, die die morphologischen Eigenschaften aller T2-gewichteten Lymphknoten visualisiert.

### **5.2 Tab: Auswertung**

* **Funktion:** Interaktive Definition von T2w-Kriterien, Durchführung der Brute-Force-Optimierung und detaillierte Auswertung der aktuell eingestellten Kriterien auf Patientenebene.  
* **Kerninhalte:**  
  * **Dashboard:** Schnellübersicht über das aktuelle Kollektiv (Alter, Geschlecht, Therapie, N/AS/T2-Status).  
  * **T2-Kriterien-Auswahl:** Interaktive Steuerelemente zur Definition von Schwellenwerten und Logik für die fünf T2-Merkmale. Buttons zum Anwenden, Speichern und Zurücksetzen der Kriterien.  
  * **T2 Gütekriterien (angewandt):** Anzeige der Performance (Sens, Spez, etc. mit 95%-KI) der aktuell definierten T2-Kriterien.  
  * **Brute-Force Optimierung:** Auswahl der Zielmetrik, Start/Abbruch der Optimierung, Fortschrittsanzeige, Ergebnisdarstellung (beste Kriterien, erreichte Metrik) und Option zur Übernahme der optimierten Kriterien.  
  * **Auswertungstabelle:** Patientenliste mit Status (N, AS, T2) und Lymphknotenzahlen. Detailansicht pro Patient zeigt die Bewertung einzelner T2-Lymphknoten gemäß aktueller Kriterien.

### **5.3 Tab: Statistik**

* **Funktion:** Umfassende statistische Auswertungen und Vergleiche der diagnostischen Leistung von AS und T2-Kriterien.  
* **Kerninhalte:**  
  * **Layout-Umschaltung:** Einzelansicht (für globales Kollektiv) oder Vergleichsansicht (für zwei spezifisch wählbare Kollektive).  
  * **Statistische Analysen:** Deskriptive Statistik, detaillierte diagnostische Gütekriterien für AS und T2 (mit Konfidenzintervallen und Konfusionsmatrizen), statistische Vergleichstests (McNemar, DeLong), Assoziationsanalysen (OR, RD, Phi), Kollektivvergleiche.  
  * **Kriterienvergleichstabelle:** Zusammenfassender Vergleich von AS, angewandten T2-Kriterien und Literatur-Sets.

### **5.4 Tab: Präsentation**

* **Funktion:** Aufbereitung ausgewählter Analyseergebnisse in einem präsentationsfreundlichen Format.  
* **Kerninhalte:**  
  * **Ansichtsauswahl:** Fokus auf "Avocado Sign Performance" oder "AS vs. T2 Vergleich".  
  * **T2-Vergleichsbasis-Auswahl:** Ermöglicht den Vergleich von AS mit aktuellen oder Literatur-T2-Kriterien.  
  * **Darstellung:** Info-Karten, Vergleichstabellen (Metriken, statistische Tests), Balkendiagramme.  
  * **Download-Optionen:** Export von Tabellen (CSV, MD) und Diagrammen (PNG, SVG).

### **5.5 Tab: Publikation**

* **Funktion:** Unterstützung bei der Erstellung eines wissenschaftlichen Manuskripts durch Generierung von Textvorschlägen, Tabellen und Abbildungen, **spezifisch ausgerichtet auf die Richtlinien des Fachjournals *Radiology***.  
* **Kerninhalte:**  
  * **Sprachauswahl:** Deutsch / Englisch.  
  * **Sektionsauswahl:** Navigation durch typische Manuskriptabschnitte (Abstract, Einleitung, Material und Methoden, Ergebnisse, Diskussion, Literaturverzeichnis), inklusive *Radiology*\-spezifischer Untergliederungen.  
  * **BF-Zielmetrik-Auswahl:** Bestimmt, welche Brute-Force-Ergebnisse in den Text einfließen.  
  * **Dynamisch generierte Inhalte:** Wissenschaftlich formulierte Textbausteine, die aktuelle Daten, Statistiken (p-Werte, CIs gemäß *Radiology*\-Vorgaben), Tabellen- und Abbildungsreferenzen integrieren und die formale Struktur und stilistischen Anforderungen von *Radiology* berücksichtigen.

### **5.6 Tab: Export**

* **Funktion:** Umfassende Exportmöglichkeiten für Daten, Analyseergebnisse und generierte Materialien.  
* **Kerninhalte:**  
  * **Exportoptionen:** Rohdaten (CSV, XLSX), Analyse-Tabellen (MD, XLSX), Statistikberichte (CSV, XLSX, MD), Brute-Force-Berichte (TXT), Diagramme (PNG, SVG als ZIP), Publikationstexte (MD als ZIP), umfassender HTML-Bericht.  
  * **Abhängigkeit:** Exporte basieren auf dem global gewählten Kollektiv und den aktuell angewendeten T2-Kriterien.

## **6\. Installation und Ausführung**

Das "Lymphknoten T2 \- Avocado Sign Analyse Tool" ist eine rein clientseitige Webanwendung. Zur Ausführung sind keine serverseitigen Komponenten oder eine spezielle Installation erforderlich.

1. **Voraussetzungen:** Ein moderner Webbrowser (z.B. aktuelle Versionen von Chrome, Firefox, Edge, Safari).  
2. **Ausführung:**  
   * Laden Sie das gesamte Projektverzeichnis herunter oder klonen Sie das Repository.  
   * Öffnen Sie die Datei index.html im Stammverzeichnis des Projekts mit einem kompatiblen Webbrowser.  
3. **Abhängigkeiten:** Alle externen Bibliotheken (Bootstrap, D3.js, Tippy.js, PapaParse, JSZip) werden über Content Delivery Networks (CDNs) geladen oder sind direkt im Projekt enthalten und erfordern keine separate Installation.

## **7\. Wissenschaftlicher Kontext**

Diese Anwendung wurde im Kontext der Forschung zum **Avocado Sign** entwickelt, einem neuartigen MRT-Marker für die Beurteilung des Lymphknotenstatus bei Rektumkarzinompatienten. Sie dient dazu, die diagnostische Leistung dieses Markers systematisch zu analysieren und ihn mit etablierten T2-gewichteten morphologischen Kriterien zu vergleichen. Die Ergebnisse, die mit diesem Tool generiert werden können, sollen zur wissenschaftlichen Diskussion über die Optimierung des präoperativen Stagings des Rektumkarzinoms beitragen.

## **8\. Wichtiger Hinweis (Disclaimer)**

Das **Lymphknoten T2 \- Avocado Sign Analyse Tool** ist ausschließlich für **Forschungs- und Evaluationszwecke** bestimmt. Es ist **nicht als Medizinprodukt zugelassen** und darf **unter keinen Umständen für direkte klinische Diagnosen, Therapieentscheidungen oder andere medizinische Anwendungen an Patienten verwendet werden.** Die Verantwortung für die Interpretation und Nutzung der mit diesem Tool generierten Ergebnisse liegt vollständig beim Anwender und muss im Kontext der jeweiligen Studienlimitationen und des aktuellen wissenschaftlichen Kenntnisstandes erfolgen.

## **9\. Autoren und Kontakt**

(Dieser Abschnitt kann von den Hauptentwicklern/Autoren der Studie mit ihren Namen und Kontaktinformationen ergänzt werden.)

* **Hauptentwickler/Studienautoren:** \[Namen und Affiliationen hier einfügen\]  
* **Kontakt für technische Fragen oder Feedback zur Anwendung:** \[E-Mail-Adresse oder Link hier einfügen\]

## **10\. Lizenz**

(Dieser Abschnitt sollte die Lizenzinformationen für die Software enthalten, z.B. MIT, GPL, etc. Falls keine spezifische Lizenz gewählt wurde, könnte hier "Alle Rechte vorbehalten" oder eine ähnliche Formulierung stehen.)

\[Hier Lizenzinformationen einfügen, falls zutreffend\]

Stand: 05\. Juni 2025
