# Avocado Sign vs. T2 Kriterien Analyse - Anwendungsbeschreibung v2.5.0

## 1. Einleitung

**Anwendungsname:** Avocado Sign vs. T2 Kriterien Analyse
**Version:** 2.5.0

### 1.1 Zweck und Hauptnutzen

Diese Webanwendung dient der detaillierten Analyse und dem wissenschaftlichen Vergleich der diagnostischen Güte des "Avocado Signs" (AS) – eines neuartigen MRT-Markers – mit verschiedenen morphologischen T2-gewichteten (T2w) Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom.

Die Anwendung ermöglicht es Forschern:
* Patientendaten und zugehörige Bildbefunde (AS-Status, T2w-Lymphknotenmerkmale) zu visualisieren und zu explorieren.
* Flexible T2w-Malignitätskriterien interaktiv zu definieren und auf den Datensatz anzuwenden.
* Die Performance dieser benutzerdefinierten T2w-Kriterien umfassend statistisch zu bewerten.
* Eine automatisierte Brute-Force-Optimierung durchzuführen, um datengetriebene T2w-Kriteriensets zu identifizieren, die spezifische diagnostische Metriken maximieren.
* Die diagnostische Leistung des Avocado Signs direkt mit benutzerdefinierten, Literatur-basierten und optimierten T2w-Kriterien zu vergleichen.
* Ergebnisse in präsentationsfreundlichen Formaten aufzubereiten.
* Umfassende Textentwürfe, Tabellen und Diagramm-Platzhalter für wissenschaftliche Publikationen zu generieren.
* Diverse Daten- und Ergebnissätze für externe Weiterverarbeitung zu exportieren.

### 1.2 Zielgruppe

Die Anwendung richtet sich primär an medizinische Forscher, Radiologen, Onkologen und Statistiker, die im Bereich der Diagnostik des Rektumkarzinoms tätig sind und die Leistungsfähigkeit verschiedener Staging-Methoden evaluieren und vergleichen möchten.

### 1.3 Wichtiger Hinweis

Diese Anwendung ist ein **Forschungswerkzeug** und **nicht für die klinische Diagnostik oder Therapieentscheidungen** vorgesehen. Alle Ergebnisse müssen im Kontext der jeweiligen Studie und unter Berücksichtigung klinischer Expertise interpretiert werden.

## 2. Systemanforderungen und Einrichtung

### 2.1 Unterstützte Browser

Die Anwendung ist für moderne Webbrowser optimiert. Empfohlen werden die neuesten Versionen von:
* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Safari

Die Nutzung veralteter Browser kann zu Funktionseinschränkungen oder Darstellungsfehlern führen. JavaScript muss aktiviert sein.

### 2.2 Abhängigkeiten

Die Anwendung nutzt verschiedene externe JavaScript-Bibliotheken zur Gewährleistung ihrer Funktionalität, darunter Bootstrap 5.3 (UI-Framework), D3.js v7 (Diagrammerstellung), Tippy.js (Tooltips), PapaParse (CSV-Verarbeitung) und JSZip (ZIP-Archiv-Erstellung). Diese werden über CDNs (Content Delivery Networks) geladen und erfordern eine aktive Internetverbindung für die erstmalige Nutzung bzw. bis sie im Browser-Cache gespeichert sind.

### 2.3 Datenbasis

Die Anwendung arbeitet mit einem fest integrierten, pseudonymisierten Patientendatensatz, der in der Datei `data/data.js` hinterlegt ist. Dieser Datensatz umfasst 106 Patienten mit Rektumkarzinom und enthält demographische Informationen, Therapiedaten, den pathologischen N-Status, den Avocado-Sign-Status sowie detaillierte morphologische Merkmale für T2-gewichtete Lymphknoten.

### 2.4 Einrichtung

Es ist **keine Installation** erforderlich. Die Anwendung ist eine reine Frontend-Webanwendung und kann direkt durch Öffnen der `index.html`-Datei in einem kompatiblen Webbrowser gestartet werden. Für die volle Funktionalität (insbesondere Laden externer Bibliotheken) wird eine Internetverbindung empfohlen.

## 3. Globale UI-Konzepte und Bedienung

Die Benutzeroberfläche der Anwendung ist darauf ausgelegt, eine intuitive und effiziente Analyse zu ermöglichen.

### 3.1 Allgemeines Layout

Die Anwendung ist in drei Hauptbereiche unterteilt:

* **Header-Bereich (oben, fixiert):**
    * **Anwendungstitel:** Zeigt den Namen der Anwendung "Lymphknoten T2 - Avocado Sign".
    * **Meta-Statistiken:** Eine dynamische Anzeige der wichtigsten Kennzahlen für das aktuell ausgewählte Patientenkollektiv:
        * **Kollektiv:** Name des ausgewählten Kollektivs (z.B. Gesamt, Direkt OP, nRCT).
        * **Pat.:** Gesamtzahl der Patienten im Kollektiv.
        * **N:** Anteil N-positiver vs. N-negativer Patienten (basierend auf Pathologie).
        * **AS:** Anteil AS-positiver vs. AS-negativer Patienten (basierend auf Avocado Sign).
        * **T2:** Anteil T2-positiver vs. T2-negativer Patienten (basierend auf aktuell im Auswertungstab angewendeten T2-Kriterien).
    * **Kurzanleitung-Button:** Ein Button mit einem Fragezeichen-Icon (<i class="fas fa-question-circle"></i>), der ein modales Fenster mit einer Einführung und wichtigen Hinweisen zur Anwendung öffnet.
    * **Kollektiv-Auswahl:** Eine Button-Gruppe ("Gesamt", "Direkt OP", "nRCT"), mit der der Nutzer das globale Patientenkollektiv für alle Analysen auswählen kann. Der aktive Button ist hervorgehoben.
* **Tab-Navigation (unter dem Header, fixiert):**
    * Eine horizontale Leiste mit Navigations-Tabs, die den Zugriff auf die verschiedenen Funktionsbereiche der Anwendung ermöglichen: "Daten", "Auswertung", "Statistik", "Präsentation", "Publikation" und "Export". Der aktive Tab ist visuell hervorgehoben.
* **Hauptinhaltsbereich (darunter):**
    * Hier wird der Inhalt des aktuell ausgewählten Tabs angezeigt. Dieser Bereich ist dynamisch und passt sich der jeweiligen Funktion an.
* **Toast-Benachrichtigungen:**
    * Kurze, nicht-blockierende Nachrichten erscheinen am unteren rechten Bildschirmrand, um über erfolgreiche Aktionen, Warnungen oder Fehler zu informieren (z.B. "Kriterien gespeichert", "Optimierung gestartet").

### 3.2 Interaktive Elemente

* **Tooltips:** Viele UI-Elemente (Buttons, Spaltenüberschriften, Eingabefelder, Diagrammelemente) verfügen über Tooltips. Wenn der Mauszeiger über ein solches Element bewegt wird, erscheint eine kurze Beschreibung oder Erläuterung seiner Funktion bzw. des angezeigten Wertes. Dies dient der besseren Verständlichkeit und Nutzerführung. Die Tooltips sind so gestaltet, dass sie auch komplexe statistische Metriken oder Testergebnisse interpretieren helfen.
* **Kontextsensitive Hilfe-Icons:** Kleine Fragezeichen-Icons (<i class="fas fa-question-circle text-muted ms-1 small context-help-icon"></i>) sind neben einigen komplexeren Einstellungen oder Optionen platziert. Ein Klick oder Hover über diese Icons blendet spezifische Erklärungen oder Anleitungen ein.
* **Buttons:** Standard-Aktionsbuttons (z.B. "Anwenden & Speichern", "Exportieren") lösen spezifische Funktionen aus. Ihr Zustand (aktiv/inaktiv) ändert sich dynamisch basierend auf dem Anwendungskontext.
* **Dropdown-Menüs (Selects):** Werden zur Auswahl von Optionen verwendet (z.B. Zielmetrik für Brute-Force, Studienauswahl im Präsentation-Tab).
* **Schalter (Switches):** Werden für binäre Einstellungen verwendet (z.B. T2-Logik UND/ODER, Sprachauswahl im Publikation-Tab).
* **Modale Fenster:**
    * **Kurzanleitung:** Stellt eine Einführung und wichtige Hinweise zur Bedienung der Anwendung bereit. Wird beim ersten Start automatisch angezeigt.
    * **Brute-Force-Details:** Zeigt die Top-Ergebnisse und weitere Details einer abgeschlossenen Brute-Force-Optimierung an.

### 3.3 Datenpersistenz

Bestimmte Nutzereinstellungen, wie das zuletzt ausgewählte Kollektiv oder die Einstellungen für den Publikation-Tab (Sprache, Sektion, ausgewählte Brute-Force-Metrik), werden im LocalStorage des Browsers gespeichert. Dadurch bleiben diese Einstellungen auch nach dem Schließen und erneuten Öffnen der Anwendung im selben Browser erhalten. Die im "Auswertung"-Tab definierten und gespeicherten T2-Kriterien werden ebenfalls persistiert.

## 4. Hauptfunktionen und Module (Tabs)

Die Anwendung ist in sechs Haupt-Tabs unterteilt, die jeweils spezifische Funktionen für die Datenanalyse und -aufbereitung bieten.

### 4.1 Daten-Tab

* **Zweck:** Anzeige der zugrundeliegenden Patientendaten und deren Basis-Merkmalen.
* **UI-Elemente und Funktionen:**
    * **Datentabelle:** Eine scrollbare Tabelle zeigt alle Patienten des aktuell ausgewählten globalen Kollektivs.
        * **Spalten:**
            * **Nr.:** Fortlaufende, eindeutige Identifikationsnummer des Patienten.
            * **Name, Vorname:** Pseudonymisierte Patientenidentifikatoren.
            * **Geschl.:** Geschlecht des Patienten ('m' für männlich, 'w' für weiblich).
            * **Alter:** Alter des Patienten zum Zeitpunkt der Untersuchung.
            * **Therapie:** Art der Vorbehandlung ('direkt OP' oder 'nRCT').
            * **N:** Pathologischer N-Status ('+' für positiv, '-' für negativ).
            * **AS:** Avocado-Sign-Status ('+' für positiv, '-' für negativ).
            * **T2:** T2-Status basierend auf den aktuell angewendeten Kriterien ('+' für positiv, '-' für negativ).
            * **Bemerkung:** Zusätzliche klinische Anmerkungen (falls vorhanden).
        * **Sortierfunktion:** Ein Klick auf eine Spaltenüberschrift sortiert die Tabelle nach dieser Spalte (aufsteigend/absteigend). Die Spalte "N/AS/T2" erlaubt eine Sub-Sortierung nach N, AS oder T2, wenn auf die entsprechenden Buchstaben im Header geklickt wird. Aktive Sortierung wird durch Pfeil-Icons und farbliche Hervorhebung signalisiert.
        * **Detailansicht für Lymphknotenmerkmale:** Jede Patientenreihe kann durch Klick auf den Pfeil-Button (<i class="fas fa-chevron-down"></i>) oder die Zeile selbst aufgeklappt werden, um detaillierte morphologische Merkmale (Größe, Form, Kontur, Homogenität, Signal) der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen.
    * **"Alle Details Ein-/Ausblenden"-Button:** Am oberen rechten Rand der Tabelle ermöglicht dieser Button das gleichzeitige Auf- oder Zuklappen der Detailansichten für alle Patienten.
* **Typischer Workflow:**
    1.  Globales Kollektiv im Header auswählen.
    2.  Daten in der Tabelle sichten.
    3.  Bei Bedarf nach spezifischen Spalten sortieren (z.B. um alle N+ Patienten zu sehen).
    4.  Für einzelne Patienten die T2-Lymphknotendetails aufklappen.

### 4.2 Auswertung-Tab

* **Zweck:** Interaktive Definition von T2-Malignitätskriterien, Durchführung einer Brute-Force-Optimierung zur Findung optimaler Kriterienkombinationen und detaillierte Anzeige der Auswertungsergebnisse pro Patient basierend auf den angewendeten Kriterien.
* **UI-Elemente und Funktionen:**

    * **Dashboard (obere Reihe):**
        * **Zweck:** Bietet eine schnelle visuelle Übersicht über die demographische Zusammensetzung und die Statusverteilungen (N, AS, T2) des aktuell ausgewählten globalen Kollektivs.
        * **Elemente:** Sechs Dashboard-Karten zeigen:
            * **Altersverteilung:** Histogramm der Altersdaten.
            * **Geschlecht:** Tortendiagramm der Geschlechterverteilung.
            * **Therapie:** Tortendiagramm der Therapiegruppen (Direkt OP, nRCT).
            * **N-Status (Patho):** Tortendiagramm der Verteilung von N+ und N- Patienten.
            * **AS-Status:** Tortendiagramm der Verteilung von AS+ und AS- Patienten.
            * **T2-Status (angewandt):** Tortendiagramm der Verteilung von T2+ und T2- Patienten basierend auf den aktuell im Tab definierten und angewendeten Kriterien.
            * Jede Karte enthält eine textuelle Zusammenfassung der dargestellten Werte. Diagramme können als PNG oder SVG heruntergeladen werden (Buttons im Header der Karte).

    * **T2-Malignitätskriterien Definieren (mittlere Karte, links):**
        * **Zweck:** Ermöglicht dem Nutzer die interaktive Definition eines eigenen T2-Kriteriensets.
        * **UI-Elemente:**
            * **Logik-Schalter:** Ein Schalter oben rechts in der Kartenüberschrift erlaubt die Wahl zwischen "UND"- und "ODER"-Verknüpfung der aktivierten Kriterien.
            * **Kriteriengruppen:** Für jedes der fünf T2-Merkmale (Größe, Form, Kontur, Homogenität, Signal) gibt es eine Gruppe:
                * **Checkbox:** Aktiviert/deaktiviert das jeweilige Kriterium.
                * **Optionsauswahl:**
                    * **Größe:** Ein Schieberegler und ein numerisches Eingabefeld erlauben die Definition eines Schwellenwerts für den Kurzachsendurchmesser (Standard: $\ge X$ mm).
                    * **Form, Kontur, Homogenität, Signal:** Buttons mit Icons repräsentieren die möglichen qualitativen Ausprägungen (z.B. "rund", "irregulär"). Durch Klick wird die als suspekt geltende Ausprägung ausgewählt.
                * Jede Kriteriengruppe verfügt über ein Kontext-Hilfe-Icon (<i class="fas fa-question-circle text-muted ms-1 small context-help-icon"></i>) für detaillierte Erklärungen.
            * **Aktionsbuttons (unten):**
                * **"Zurücksetzen (Standard)":** Setzt alle Kriterien und die Logik auf vordefinierte Standardwerte zurück. Die Änderungen sind danach noch nicht angewendet.
                * **"Anwenden & Speichern":** Wendet die aktuell eingestellten Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert den T2-Status aller Patienten in der Anwendung, die T2-bezogenen Statistiken und Diagramme. Die Einstellungen werden im LocalStorage gespeichert.
            * **Indikator für ungespeicherte Änderungen:** Die Karte "T2-Malignitätskriterien Definieren" erhält eine auffällige, pulsierende Umrandung (`.criteria-unsaved-indicator-enhanced`), sobald Änderungen an den Kriterien oder der Logik vorgenommen, aber noch nicht mit "Anwenden & Speichern" bestätigt wurden. Ein Tooltip weist zusätzlich darauf hin.
        * **Workflow:**
            1.  Gewünschte T2-Merkmale über die Checkboxen aktivieren.
            2.  Für aktive Merkmale die suspekten Ausprägungen definieren (Größenschwelle, Form etc.).
            3.  Die logische Verknüpfung (UND/ODER) wählen.
            4.  Auf "Anwenden & Speichern" klicken. Die Ergebnisse in der gesamten Anwendung werden aktualisiert.

    * **Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien) (mittlere Karte, rechts):**
        * **Zweck:** Zeigt eine kompakte Übersicht der Performance der aktuell im Tab definierten und **angewendeten** T2-Kriterien im Vergleich zum pathologischen N-Status für das global ausgewählte Kollektiv.
        * **Elemente:** Eine Reihe von Textfeldern zeigt:
            * Sensitivität (Sens)
            * Spezifität (Spez)
            * Positiver Prädiktiver Wert (PPV)
            * Negativer Prädiktiver Wert (NPV)
            * Accuracy (Acc)
            * Balanced Accuracy (BalAcc)
            * F1-Score (F1)
            * Area Under Curve (AUC) – hier äquivalent zu BalAcc
            * Positive Likelihood Ratio (LR+)
            * Negative Likelihood Ratio (LR-)
            * Alle Werte werden mit ihren 95%-Konfidenzintervallen (CI) angezeigt. Tooltips liefern detaillierte Beschreibungen und Interpretationen jeder Metrik.
        * Die Anzeige aktualisiert sich, sobald neue T2-Kriterien angewendet werden.

    * **Kriterien-Optimierung (Brute-Force) (untere Karte):**
        * **Zweck:** Findet automatisch die Kombination von T2-Kriterien und Logik, die eine vom Nutzer gewählte Zielmetrik (z.B. Balanced Accuracy, F1-Score) für das aktuell ausgewählte globale Kollektiv maximiert.
        * **UI-Elemente:**
            * **Zielmetrik-Auswahl:** Ein Dropdown-Menü zur Auswahl der Metrik, die optimiert werden soll (Accuracy, Balanced Accuracy, F1-Score, PPV, NPV).
            * **"Optimierung starten"-Button:** Startet den Brute-Force-Algorithmus. Dieser läuft in einem separaten Web Worker, um die UI nicht zu blockieren. Der Button ist während der Berechnung deaktiviert.
            * **Statusanzeige:** Informiert über den aktuellen Zustand (Bereit, Initialisiere, Läuft, Abgebrochen, Fertig, Fehler) und das analysierte Kollektiv.
            * **Fortschrittsanzeige (während der Berechnung sichtbar):**
                * Ein Fortschrittsbalken visualisiert den Abarbeitungsstand.
                * Textanzeige für getestete vs. Gesamtanzahl an Kombinationen und Prozentwert.
                * Anzeige der bisher besten gefundenen Metrik (Wert und Name) und der zugehörigen Kriterienkombination/Logik.
            * **"Abbrechen"-Button (während der Berechnung sichtbar):** Stoppt die laufende Optimierung.
            * **Ergebnisbereich (nach Abschluss sichtbar):**
                * Zeigt die beste gefundene Kombination (Logik, Kriterien), den erreichten Wert der Zielmetrik, die Dauer der Optimierung und die Anzahl der getesteten Kombinationen.
                * Zeigt Basisstatistiken (N gesamt, N+, N-) des für die Optimierung verwendeten Kollektivs.
                * **"Anwenden"-Button:** Übernimmt die beste gefundene Kriterienkombination und Logik in den Bereich "T2-Malignitätskriterien Definieren" und wendet sie direkt an (analog zu "Anwenden & Speichern").
                * **"Top 10"-Button:** Öffnet ein modales Fenster, das eine detaillierte Tabelle der besten 10 (und ggf. mehr bei identischen Werten der Zielmetrik) gefundenen Kriterienkombinationen anzeigt, inklusive ihrer Performance für Sens, Spez, PPV, NPV, Acc, BalAcc und F1. Dieser Bericht kann aus dem Modal als TXT-Datei exportiert werden.
        * **Workflow:**
            1.  Globales Kollektiv im Header auswählen.
            2.  Zielmetrik für die Optimierung auswählen.
            3.  Auf "Optimierung starten" klicken.
            4.  Fortschritt beobachten.
            5.  Nach Abschluss die Ergebnisse prüfen. Bei Bedarf die "Top 10" Details ansehen.
            6.  Optional die beste gefundene Kombination mit "Anwenden" übernehmen.

    * **Auswertungstabelle (unterste Karte auf der Seite):**
        * **Zweck:** Zeigt eine detaillierte Auflistung aller Patienten des aktuell ausgewählten globalen Kollektivs mit ihren Statuswerten und Lymphknoten-Anzahlen, basierend auf den aktuell **angewendeten** T2-Kriterien.
        * **UI-Elemente:**
            * **Tabelle:**
                * **Spalten:** Nr., Name, Therapie, N-Status, AS-Status, T2-Status (angewandt), N+/N ges. (Anzahl pathologisch positiver / gesamt untersuchter LK), AS+/AS ges. (Anzahl AS-positiver / gesamt im T1KM-MRT sichtbarer LK), T2+/T2 ges. (Anzahl T2-positiver gemäß angewandter Kriterien / gesamt im T2-MRT sichtbarer LK).
                * **Sortierfunktion:** Analog zur Datentabelle.
                * **Detailansicht:** Aufklappbare Zeilen zeigen für jeden Patienten eine detaillierte Bewertung seiner einzelnen T2-gewichteten Lymphknoten gemäß der aktuell angewendeten Kriterien. Erfüllte Positiv-Kriterien für einen Lymphknoten werden hervorgehoben.
            * **"Alle Details Ein-/Ausblenden"-Button:** Analog zur Datentabelle.
        * **Workflow:** Nach Anwendung von T2-Kriterien (manuell oder via Brute-Force-Ergebnis) können hier die Auswirkungen auf Patientenlevel detailliert nachvollzogen werden.

### 4.3 Statistik-Tab

* **Zweck:** Bietet umfassende statistische Auswertungen zur diagnostischen Güte des Avocado Signs und der aktuell im "Auswertung"-Tab angewendeten T2-Kriterien. Ermöglicht Vergleiche zwischen Methoden und Kollektiven.
* **Globale Steuerelemente:**
    * **Layout-Umschalter:** Ein Button ("Einzelansicht Aktiv" / "Vergleich Aktiv") wechselt zwischen zwei Modi:
        * **Einzelansicht:** Analysen werden für das global im Header ausgewählte Kollektiv durchgeführt.
        * **Vergleich Aktiv:** Zwei Dropdown-Menüs erscheinen, um zwei spezifische Kollektive (Kollektiv 1, Kollektiv 2) für einen direkten Vergleich auszuwählen. Die Analysen werden dann für beide Kollektive getrennt sowie vergleichend dargestellt.
* **Statistikkarten:** Abhängig vom gewählten Layout und Kollektiv werden eine oder mehrere der folgenden Karten angezeigt, die jeweils spezifische statistische Informationen enthalten:
    * **Deskriptive Statistik:**
        * **Inhalt:** Tabelle mit demographischen Daten (Alter, Geschlecht, Therapieverteilung) und Basis-Statusverteilungen (N, AS, T2) sowie Lymphknotenanzahlen (Median, Min-Max, Mittelwert ± SD für gesamt und positive LK für N, AS, T2).
        * **Diagramme:** Histogramm der Altersverteilung und Tortendiagramm der Geschlechterverteilung für das dargestellte Kollektiv.
    * **Diagnostische Güte - Avocado Sign (vs. N):**
        * **Inhalt:** Konfusionsmatrix (AS vs. N) und Tabelle mit Sens, Spez, PPV, NPV, Acc, BalAcc/AUC, F1-Score, LR+, LR- (jeweils mit 95% CI und Angabe der CI-Methode) für das Avocado Sign.
    * **Diagnostische Güte - T2 (angewandt vs. N):**
        * **Inhalt:** Analog zur AS-Gütekarte, jedoch für die aktuell im "Auswertung"-Tab definierten und angewendeten T2-Kriterien.
    * **Statistischer Vergleich - AS vs. T2 (angewandt):**
        * **Inhalt:** Tabelle mit Ergebnissen gepaarter Tests zum Vergleich von AS und den angewendeten T2-Kriterien:
            * McNemar-Test für die Accuracy (Statistikwert, p-Wert).
            * DeLong-Test für die AUCs (Z-Wert, p-Wert, Differenz der AUCs mit 95% CI).
            * Differenz der Sensitivitäten (AS - T2) mit 95% CI.
            * Differenz der Spezifitäten (AS - T2) mit 95% CI.
    * **Assoziation Einzelkriterien vs. N-Status:**
        * **Inhalt:** Tabelle, die die Assoziation des AS-Status sowie einzelner T2-Merkmale (basierend auf den aktuell angewendeten Kriterien) mit dem pathologischen N-Status quantifiziert.
            * Für jedes Merkmal: Odds Ratio (OR) mit 95% CI, Risk Difference (RD) mit 95% CI, Phi-Koeffizient ($\phi$).
            * P-Wert aus Fisher's Exact Test für den Zusammenhang.
            * Zusätzlich: Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test (p-Wert).
    * **Vergleich zwischen zwei Kollektiven (nur bei Layout "Vergleich Aktiv"):**
        * **Inhalt:** Tabelle mit Ergebnissen ungepaarter Tests zum Vergleich der Performance von AS bzw. T2 (angewandt) zwischen den beiden ausgewählten Kollektiven:
            * Vergleich der Accuracy (AS und T2 getrennt) mittels Fisher's Exact Test (p-Wert).
            * Vergleich der AUCs (AS und T2 getrennt) mittels Z-Test (p-Wert, Differenz der AUCs mit 95% CI).
            * Differenz der Sensitivitäten (AS und T2 getrennt) zwischen den Kollektiven mit 95% CI.
            * Differenz der Spezifitäten (AS und T2 getrennt) zwischen den Kollektiven mit 95% CI.
* **Kriterienvergleichstabelle (wird immer für das global gewählte Kollektiv angezeigt):**
    * **Zweck:** Ermöglicht einen direkten tabellarischen Vergleich der diagnostischen Performance verschiedener Methoden auf einen Blick.
    * **Inhalt:** Zeigt für das **global im Header ausgewählte Kollektiv** die Metriken Sens, Spez, PPV, NPV, Acc, AUC/BalAcc, LR+ und LR- für:
        * Avocado Sign.
        * Die aktuell im "Auswertung"-Tab angewendeten T2-Kriterien.
        * Mehrere vordefinierte T2-Kriteriensets aus der Literatur (ESGAR 2016, Koh et al. 2008, Barbaro et al. 2024). Bei Literatur-Sets wird angegeben, falls die Evaluation auf einem abweichenden (dem Original-Zielkollektiv entsprechenden) Datensubset erfolgte.
* **Allgemein:** Alle Statistikkarten verfügen über Download-Buttons im Header, um die angezeigte Tabelle als PNG zu exportieren. Diagramme können als PNG oder SVG heruntergeladen werden. Tooltips liefern detaillierte Beschreibungen und Interpretationen für alle angezeigten Metriken und Testergebnisse.

### 4.4 Präsentation-Tab

* **Zweck:** Stellt Analyseergebnisse in einem aufbereiteten, vereinfachten Format dar, das sich gut für Präsentationen und Vorträge eignet. Fokus liegt auf dem Vergleich des Avocado Signs mit T2-basierten Ansätzen.
* **UI-Elemente und Funktionen:**
    * **Ansicht-Auswahl (Radio-Buttons):**
        * **"Avocado Sign (Performance)":** Zeigt eine Übersicht der Performance-Metriken des Avocado Signs für die Kollektive Gesamt, Direkt OP und nRCT. Enthält auch eine Tabelle mit demographischen Basisdaten für das aktuell global gewählte Kollektiv.
        * **"AS vs. T2 (Vergleich)":** Ermöglicht den direkten Vergleich des Avocado Signs mit einer auswählbaren T2-Kriterienbasis.
    * **Studienauswahl für T2-Vergleichsbasis (Dropdown, nur bei Ansicht "AS vs. T2"):**
        * Ermöglicht die Auswahl der T2-Kriterien, die mit AS verglichen werden sollen.
        * Optionen: "Aktuell angewandte Kriterien" (aus dem Auswertungstab) oder vordefinierte Literatur-Kriteriensets (ESGAR 2016, Koh et al. 2008, Barbaro et al. 2024).
        * **Wichtig:** Bei Auswahl eines Literatur-Sets wird das **globale Kollektiv der Anwendung automatisch** auf das Zielkollektiv der ausgewählten Studie gesetzt (z.B. 'nRCT' für Barbaro et al.). Eine Toast-Benachrichtigung und eine Hervorhebung der globalen Kollektiv-Buttons signalisieren diese automatische Anpassung.
    * **Informationskarte zur T2-Vergleichsbasis (nur bei Ansicht "AS vs. T2"):**
        * Zeigt Details zum ausgewählten T2-Set: Referenz, ursprüngliche Studienkohorte, Untersuchungsart, Fokus und eine Zusammenfassung der Schlüsselkriterien.
    * **Ergebnistabellen und Diagramme (dynamisch je nach Ansicht):**
        * **Ansicht "Avocado Sign (Performance)":**
            * Tabelle: Performance-Metriken (Sens, Spez, PPV, NPV, Acc, AUC, LR+, LR-) des AS für Gesamt, Direkt OP und nRCT.
            * Tabelle: Demographische Basisdaten des aktuell global gewählten Kollektivs.
            * Balkendiagramm: Visualisiert die AS-Performance-Metriken für das aktuell global gewählte Kollektiv.
        * **Ansicht "AS vs. T2 (Vergleich)":**
            * Tabelle: Gegenüberstellung der Performance-Metriken (Sens, Spez, etc. mit CIs) von AS und der ausgewählten T2-Basis für das aktuelle Vergleichskollektiv.
            * Tabelle: Ergebnisse statistischer Tests (McNemar für Accuracy, DeLong für AUC, Differenzen von Sens/Spez mit CIs) zum Vergleich von AS mit der T2-Basis.
            * Balkendiagramm: Vergleicht Schlüsselmetriken (Sens, Spez, PPV, NPV, Acc, AUC) visuell zwischen AS und der T2-Basis.
    * **Download-Buttons:** Für die angezeigten Tabellen (als CSV und Markdown) und Diagramme (als PNG und SVG) sind entsprechende Download-Buttons verfügbar.
* **Typischer Workflow:**
    1.  Gewünschte Ansicht auswählen.
    2.  Falls "AS vs. T2 (Vergleich)" gewählt: T2-Kriterienbasis aus dem Dropdown auswählen. Das globale Kollektiv passt sich ggf. an.
    3.  Die aufbereiteten Tabellen und Diagramme sichten.
    4.  Relevante Materialien über die Download-Buttons exportieren.

### 4.5 Publikation-Tab

* **Zweck:** Hauptfunktion zur Unterstützung bei der Erstellung einer wissenschaftlichen Publikation. Generiert strukturierte Textentwürfe für verschiedene Manuskriptabschnitte, die dynamisch mit statistischen Ergebnissen, Tabellen und Diagrammverweisen aus der Anwendung befüllt werden.
* **UI-Elemente und Funktionen:**
    * **Layout:** Zweispaltig. Links eine Navigationsleiste für die Manuskriptabschnitte, rechts der Inhaltsbereich. Der obere Teil der rechten Spalte enthält Steuerelemente.
    * **Sektionsnavigation (linke Spalte, fixiert bei Scrollen des Inhalts):**
        * Eine vertikale Navigationsleiste listet die Hauptabschnitte eines wissenschaftlichen Manuskripts auf:
            * Abstract
            * Einleitung
            * Methoden (mit Unterpunkten: Studiendesign & Ethik, Patientenkollektiv, MRT-Protokoll, Definition AS, Definition T2-Kriterien, Referenzstandard, Statistische Analyse)
            * Ergebnisse (mit Unterpunkten: Patientencharakteristika, Performance AS, Performance Literatur-T2, Performance Optimierte T2, Vergleich AS vs. T2)
            * Diskussion
            * Referenzen
        * Ein Klick auf einen Abschnitt lädt dessen Inhalt in den rechten Bereich. Der aktive Abschnitt ist hervorgehoben.
    * **Steuerelemente (rechte Spalte, oben):**
        * **Sprachumschalter:** Ein Schalter ("Deutsch" / "English") ermöglicht das Wechseln der Sprache für die generierten Texte und einige Beschriftungen im Tab.
        * **Auswahl der Brute-Force-Optimierungsmetrik:** Ein Dropdown-Menü erlaubt die Auswahl der Zielmetrik (z.B. Balanced Accuracy, F1-Score), deren Brute-Force-Optimierungsergebnisse im Ergebnisteil des generierten Textes referenziert und diskutiert werden sollen.
    * **Inhaltsbereich (rechte Spalte, Hauptbereich):**
        * Zeigt den für die ausgewählte Sektion und Sprache generierten Text an.
        * Der Text enthält dynamisch eingefügte statistische Ergebnisse (Werte, CIs, p-Werte) aus den Analysen der Anwendung.
        * Referenzen zu Tabellen (z.B. "[Tabelle 1]") und Abbildungen (z.B. "[Abbildung 2a]") werden im Text als klickbare Links eingefügt.
        * Unterhalb des Fließtextes werden die im Text referenzierten Tabellen und Diagramm-Platzhalter direkt eingebettet.
            * **Tabellen:** Werden als HTML-Tabellen gerendert (z.B. Tabelle 1: Patientencharakteristika; Tabelle 2: Übersicht Literatur-T2-Kriterien; Tabellen 3-5: Performance-Metriken für AS, Literatur-T2, Optimierte-T2; Tabellen 6a-c: Statistische Vergleiche).
            * **Diagramm-Platzhalter:** Für referenzierte Abbildungen (z.B. Abb. 1a/b: Alter/Geschlecht; Abb. 2a-c: Vergleichs-Balkendiagramme; Abb. 3a-c: Vergleichs-ROC-Kurven) werden Container mit Titeln und Abbildungsnummern erstellt. Die eigentlichen Diagramme werden dynamisch in diese Container gerendert.
* **Typischer Workflow:**
    1.  Gewünschte Sprache für den Manuskriptentwurf auswählen.
    2.  Die Brute-Force-Metrik auswählen, deren Ergebnisse im Text hervorgehoben werden sollen.
    3.  Durch die Sektionsnavigation klicken, um die Inhalte für Abstract, Einleitung, Methoden, Ergebnisse, Diskussion und Referenzen zu generieren und zu prüfen.
    4.  Die generierten Texte können als Basis für das eigene Manuskript verwendet werden. Die Inhalte (Texte als Markdown, referenzierte Tabellen als CSV, referenzierte Diagramme als SVG/PNG) können über den "Export"-Tab als "Publikations-Paket" heruntergeladen werden.

### 4.6 Export-Tab

* **Zweck:** Umfassender Export von Daten, Ergebnissen, Diagrammen und Konfigurationen.
* **UI-Elemente und Funktionen:** Der Tab ist in drei Hauptbereiche unterteilt:
    * **Einzelexporte:** Buttons für den direkten Download spezifischer Daten/Ergebnisse:
        * **Berichte & Statistiken:**
            * Statistik Ergebnisse (.csv): Detaillierte Tabelle aller berechneten statistischen Metriken.
            * Brute-Force Bericht (.txt): Detaillierter Bericht der letzten Brute-Force-Optimierung.
            * Deskriptive Statistik (.md): Tabelle der deskriptiven Statistik.
            * Umfassender Bericht (.html): Kombinierter Bericht mit Konfiguration, Statistiken und Diagrammen.
        * **Tabellen & Rohdaten:**
            * Datenliste (.md): Aktuelle Datenliste.
            * Auswertungstabelle (.md): Aktuelle Auswertungstabelle.
            * Gefilterte Rohdaten (.csv): Rohdaten des aktuell ausgewählten Kollektivs.
        * **Analyse Konfiguration:**
            * Aktuelle Konfiguration (.json): Speichert die aktuellen Analyse-Einstellungen (Kollektiv, T2-Kriterien, BF-Einstellungen und -Ergebnisse).
        * **Diagramme & Tabellen (als Bilder):**
            * Diagramme & Tabellen (PNG) (.zip): ZIP-Archiv aller aktuell im Statistik- oder Auswertungs-Dashboard sichtbaren Diagramme und Tabellen als PNG.
            * Diagramme (SVG) (.zip): ZIP-Archiv aller aktuell sichtbaren Diagramme als SVG.
    * **Export-Pakete (.zip):** Buttons zum Download gebündelter Dateien:
        * **Gesamtpaket (Alle Dateien):** ZIP-Archiv mit allen verfügbaren Einzeldateien.
        * **Publikations-Paket:** ZIP-Archiv mit allen generierten Texten der Publikationssektionen (als .md). Die im Text referenzierten Tabellen und Diagramme müssen über die anderen Exportfunktionen oder Einzeldownloads separat exportiert werden.
        * **Nur CSVs:** Alle verfügbaren CSV-Dateien.
        * **Nur Markdown:** Alle verfügbaren Markdown-Dateien.
        * **Nur Diagramm/Tabellen-PNGs:** Identisch zum Einzel-Export.
        * **Nur Diagramm-SVGs:** Identisch zum Einzel-Export.
    * **Hinweise zum Export:** Eine Liste mit Erklärungen zu den Dateiformaten und dem Verhalten der Exportfunktionen.
* **Allgemein:** Alle Exporte basieren auf dem aktuell global ausgewählten Kollektiv und den zuletzt angewendeten T2-Kriterien. Die Dateinamen werden automatisch generiert und enthalten Informationen zum Typ, Kollektiv und Datum. Die Verfügbarkeit einzelner Export-Buttons (z.B. Brute-Force-Bericht) hängt davon ab, ob die entsprechenden Analysen durchgeführt wurden.

## 5. Datenmanagement und -grundlage

### 5.1 Basisdatensatz

Die Anwendung verwendet einen festen, integrierten Datensatz, der in der Datei `data/data.js` definiert ist. Dieser Datensatz enthält pseudonymisierte Informationen von 106 Patienten mit Rektumkarzinom. Für jeden Patienten sind folgende Hauptinformationen verfügbar:
* **Identifikation:** Eindeutige Nummer (`nr`), pseudonymisierter Name und Vorname.
* **Demographie:** Geburtsdatum, Geschlecht, Alter zum Untersuchungszeitpunkt.
* **Klinische Daten:** Art der Therapie vor Operation (`therapie`: 'direkt OP' oder 'nRCT'), Untersuchungsdatum.
* **Pathologischer N-Status (`n`):** Goldstandard-Information ('+' oder '-').
* **Anzahl pathologischer Lymphknoten:** Gesamtzahl untersuchter Lymphknoten (`anzahl_patho_lk`) und Anzahl positiver Lymphknoten (`anzahl_patho_n_plus_lk`).
* **Avocado-Sign-Status (`as`):** Bewertung des Avocado Signs ('+' oder '-').
* **Anzahl AS-Lymphknoten:** Gesamtzahl sichtbarer Lymphknoten im T1KM-MRT (`anzahl_as_lk`) und Anzahl AS-positiver Lymphknoten (`anzahl_as_plus_lk`).
* **T2-Lymphknotenmerkmale (`lymphknoten_t2`):** Ein Array von Objekten, wobei jedes Objekt einen im T2w-MRT sichtbaren Lymphknoten repräsentiert und dessen morphologische Merkmale enthält:
    * `groesse`: Kurzachsendurchmesser in mm.
    * `form`: 'rund' oder 'oval'.
    * `kontur`: 'scharf' oder 'irregulär'.
    * `homogenitaet`: 'homogen' oder 'heterogen'.
    * `signal`: 'signalarm', 'intermediär' oder 'signalreich'.
* **Bemerkung:** Freitextfeld für zusätzliche Anmerkungen.

Der T2-Status pro Patient (`t2`) und die Lymphknotenanzahlen bezogen auf T2 (`anzahl_t2_lk`, `anzahl_t2_plus_lk`) werden dynamisch basierend auf den angewendeten Kriterien berechnet.

### 5.2 Datenverarbeitung

Die Rohdaten werden beim Start der Anwendung prozessiert:
* Fehlende oder ungültige Werte werden standardisiert.
* Das Alter wird aus dem Geburtsdatum und Untersuchungsdatum berechnet.
* Die Daten werden für die interne Verwendung strukturiert.

Die Anwendung erlaubt **keinen direkten Import oder Upload neuer Datensätze** durch den Nutzer. Alle Analysen basieren auf dem vordefinierten internen Datensatz.

## 6. Statistische Methoden im Detail

Die Anwendung implementiert eine Reihe von statistischen Methoden zur Bewertung und zum Vergleich der diagnostischen Tests.

* **Diagnostische Gütemaße:**
    * Sensitivität (Sens), Spezifität (Spez), Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Accuracy (Acc), Balanced Accuracy (BalAcc), F1-Score, Area Under Curve (AUC) – hier äquivalent zu BalAcc, Positive Likelihood Ratio (LR+), Negative Likelihood Ratio (LR-).
* **Konfidenzintervalle (CI):** Standardmäßig 95%-Konfidenzintervalle.
    * Für Proportionen (Sens, Spez, PPV, NPV, Acc): **Wilson Score Intervall**.
    * Für BalAcc (AUC), F1-Score, LR+, LR- und Differenzen von Raten: **Bootstrap-Perzentil-Methode** (standardmäßig 1000 Replikationen).
* **Vergleichstests:**
    * **McNemar-Test:** Für gepaarte Accuracies.
    * **DeLong-Test:** Für gepaarte AUCs.
    * **Fisher's Exact Test:** Für Raten (z.B. Accuracy) zwischen unabhängigen Kollektiven.
    * **Z-Test für unabhängige AUCs:** Basierend auf deren Standardfehlern.
* **Assoziationsmaße:**
    * **Odds Ratio (OR) mit 95% CI.**
    * **Risk Difference (RD) mit 95% CI.**
    * **Phi-Koeffizient ($\phi$).**
    * **Mann-Whitney-U-Test:** Für kontinuierliche Variablen (z.B. Lymphknotengröße) zwischen zwei Gruppen.
* **Signifikanzniveau:** Ein p-Wert < 0.05 wird standardmäßig als statistisch signifikant interpretiert. Markierung mit Sternchen (* p < 0.05, ** p < 0.01, *** p < 0.001).

## 7. Besondere Merkmale und Technologien

* **Brute-Force-Optimierung:** Ein Algorithmus testet systematisch Kombinationen der T2-Merkmale (Größe, Form, Kontur, Homogenität, Signal) und logischen Verknüpfungen (UND/ODER), um Kriterien zu finden, die eine gewählte Zielmetrik für das aktuelle Kollektiv maximieren. Dieser Prozess läuft in einem Web Worker.
* **Interaktive Diagramme:** Nutzung der D3.js-Bibliothek für dynamische und interaktive Diagramme (Histogramme, Tortendiagramme, Balkendiagramme, ROC-Kurven).
* **Responsive Design:** Die Benutzeroberfläche passt sich verschiedenen Bildschirmgrößen an.
* **Reine Frontend-Anwendung:** Alle Berechnungen und Darstellungen erfolgen clientseitig im Browser.

## 8. Referenzen (für Literatur-T2-Kriterien)

Die Anwendung implementiert und vergleicht u.a. folgende T2-Kriteriensets aus der Literatur:

* **ESGAR 2016 / Rutegård et al. (2025):** Basierend auf den ESGAR Konsensus-Richtlinien (Beets-Tan et al., Eur Radiol, 2018), evaluiert durch Rutegård et al. (Eur Radiol, 2025). Diese Kriterien verwenden eine größenabhängige Kombination morphologischer Merkmale (rund, irregulär, heterogen). Primär für das Staging vor Therapie.
* **Koh et al. (2008):** Definiert Malignität bei Vorliegen einer irregulären Kontur ODER eines heterogenen Binnensignals (Koh DM, et al. Int J Radiat Oncol Biol Phys. 2008). Ursprünglich für die Bewertung nach nCRT.
* **Barbaro et al. (2024):** Ein reines Größenkriterium (Kurzachsendurchmesser $\ge 2.3$ mm) für das Restaging nach nCRT (Barbaro B, et al. Radiother Oncol. 2024).

Detaillierte Beschreibungen dieser Kriteriensets sind im "Publikation"-Tab und in der Kriterienvergleichstabelle im "Statistik"-Tab zu finden. Die Originalpublikation zum Avocado Sign ist: Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11462-y.

## 9. Versionshinweis

Diese Beschreibung bezieht sich auf die **Version 2.5.0** der Anwendung "Avocado Sign vs. T2 Kriterien Analyse".
Stand: Mai 2025
