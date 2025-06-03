const PUBLICATION_CONTENT_TEMPLATES = (() => {
    const templates = {
        de: {
            methoden_studienanlage: {
                title: "Studiendesign und Ethik",
                content: (commonData, allKollektivStats, options) => `
                    <p>Die vorliegende Analyse wurde als retrospektive Auswertung eines prospektiv geführten, monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert und durchgeführt. Das primäre Studienkollektiv sowie die zugrundeliegenden Bilddatensätze für die initiale Bewertung des Avocado Signs (AS) sind identisch mit jenen der Originalpublikation zum Avocado Sign (Lurz & Schäfer, <a href="${commonData.references?.lurzSchaefer2025?.doi || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>). Ziel dieser erweiterten Untersuchung ist der detaillierte Vergleich der diagnostischen Güte des AS mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                    <p>Alle hier präsentierten Analysen und Kriterienevaluationen wurden mittels einer interaktiven Webanwendung (AvocadoSign Analyse Tool v${commonData.appVersion || APP_CONFIG.APP_VERSION}, ${commonData.appName || APP_CONFIG.APP_NAME}) durchgeführt, die eigens für diese und nachfolgende Studien entwickelt und erweitert wurde. Dieses Tool ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der zuständigen lokalen Ethikkommission genehmigt (${commonData.references?.lurzSchaefer2025?.ethicsVote || "Ethikvotum Nr. XYZ, Ethikkommission Musterstadt"}). Aufgrund des retrospektiven Charakters der Analyse auf pseudonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische erweiterte Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag.</p>
                `
            },
            methoden_patientenkollektiv: {
                title: "Patientenkollektiv",
                content: (commonData, allKollektivStats, options) => `
                    <p>Das Studienkollektiv umfasste ${commonData.nGesamt || 'N/A'} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${commonData.references?.lurzSchaefer2025?.studyPeriod || "Januar JJJJ und Dezember JJJJ"} am ${commonData.references?.lurzSchaefer2025?.institution || "Universitätsklinikum Musterstadt"} behandelt und in die initiale Avocado-Sign-Studie eingeschlossen wurden. Von diesen erhielten ${commonData.nNRCT || 'N/A'} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${commonData.nDirektOP || 'N/A'} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${commonData.fCI(allKollektivStats?.Gesamt?.deskriptiv?.alter?.median, 1, false)} Jahre (Range: ${commonData.fCI(allKollektivStats?.Gesamt?.deskriptiv?.alter?.min, 0, false)}–${commonData.fCI(allKollektivStats?.Gesamt?.deskriptiv?.alter?.max, 0, false)} Jahre). Männer stellten ${commonData.formatPercent((allKollektivStats?.Gesamt?.deskriptiv?.geschlecht?.m || 0) / (allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 1), 1)} (${allKollektivStats?.Gesamt?.deskriptiv?.geschlecht?.m || 0}/${allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A'}) des Kollektivs dar. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in <a href="${commonData.getSafeLink('ergebnisse.patientenCharakteristikaTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.patientenCharakteristikaTabelle', 'table')}</a> dargestellt.</p>
                    <p>Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Adenokarzinom des Rektums. Ausschlusskriterien umfassten das Vorliegen von Fernmetastasen zum Zeitpunkt der initialen Diagnosestellung (M1-Status), nicht-resektable Tumoren (cT4b mit Infiltration benachbarter Organe, die eine R0-Resektion ausschließen), vorangegangene Operationen oder Strahlentherapie im Beckenbereich sowie allgemeine Kontraindikationen für eine MRT-Untersuchung (z.B. nicht-MRT-taugliche Implantate, schwere Klaustrophobie). Für die vorliegende erweiterte Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T1KM- und T2-Lymphknotenmerkmale sowie des histopathologischen N-Status vorlagen.</p>
                `
            },
            methoden_mrt_protokoll: {
                title: "MRT-Protokoll und Bildakquisition",
                content: (commonData, allKollektivStats, options) => `
                    <p>Alle MRT-Untersuchungen wurden an einem ${commonData.references?.lurzSchaefer2025?.mriSystem || "3.0-Tesla MRT-System (z.B. MAGNETOM Prisma; Siemens Healthineers, Erlangen, Deutschland)"} unter Verwendung einer externen Körper-Phased-Array-Spule durchgeführt. Vor der Untersuchung erhielten die Patienten standardmäßig Butylscopolaminbromid (20 mg intravenös), sofern keine Kontraindikationen bestanden, um Darmperistaltik-Artefakte zu reduzieren. Das standardisierte Bildgebungsprotokoll für das Rektumkarzinom-Staging umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${commonData.references?.lurzSchaefer2025?.t2SliceThickness || "3 mm"}, kein Slice Gap, Field of View [FOV] ca. 200-240 mm, Matrix ca. 320x320 bis 384x384). Zusätzlich wurde routinemäßig eine axiale diffusionsgewichtete Sequenz (DWI) mit mindestens zwei b-Werten (z.B. b=0 und b=800-1000 s/mm²) und korrespondierenden ADC-Maps (Apparent Diffusion Coefficient) akquiriert.</p>
                    <p>Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) oder eine vergleichbare 3D-Gradientenecho-Sequenz mit Fettsättigung (z.B. Dixon-Technik) akquiriert. Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${commonData.references?.lurzSchaefer2025?.contrastAgent || "z.B. Gadoteridol (ProHance; Bracco Imaging)"}) wurde gewichtsadaptiert (Standarddosis 0,1 mmol/kg Körpergewicht) intravenös als Bolus verabreicht, gefolgt von einer Kochsalzspülung. Die kontrastmittelverstärkten Aufnahmen erfolgten in einer portalvenösen oder späten arteriellen Phase (ca. 60-90 Sekunden nach Kontrastmittelgabe). Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe, typischerweise 6-8 Wochen nach Abschluss der nRCT) identisch.</p>
                `
            },
            methoden_as_definition: {
                title: "Definition und Bewertung des Avocado Signs",
                content: (commonData, allKollektivStats, options) => `
                    <p>Das Avocado Sign (AS) wurde, wie in der Originalstudie (Lurz & Schäfer, <a href="${commonData.references?.lurzSchaefer2025?.doi || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, signalarmer (hypointenser) Kern innerhalb eines ansonsten homogen signalreichen (hyperintensen), kontrastmittelaufnehmenden Lymphknotens, unabhängig von dessen Größe oder Form (siehe Abbildung 2 in Lurz & Schäfer, <a href="${commonData.references?.lurzSchaefer2025?.doi || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>). Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) für den N-Status eingestuft, wenn mindestens ein mesorektaler Lymphknoten dieses Zeichen aufwies.</p>
                    <p>Die Bildanalyse wurde von zwei Radiologen (Radiologe 1: ${commonData.references?.lurzSchaefer2025?.radiologistExperience?.[0] || "XX"} Jahre Erfahrung; Radiologe 2: ${commonData.references?.lurzSchaefer2025?.radiologistExperience?.[1] || "YY"} Jahre Erfahrung in der abdominellen MRT), die bereits die Primärstudie durchgeführt hatten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen in der AS-Bewertung wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen (Radiologe 3: ${commonData.references?.lurzSchaefer2025?.radiologistExperience?.[2] || "ZZ"} Jahre Erfahrung) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern.</p>
                `
            },
            methoden_t2_definition: {
                title: "Definition und Bewertung der T2-Kriterien",
                content: (commonData, allKollektivStats, options) => {
                    const appliedCriteria = options?.appliedCriteria || (typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria());
                    const appliedLogic = options?.appliedLogic || (typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC);
                    const formattedAppliedCriteria = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false) : 'N/A';
                    const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                    const table2Id = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;

                    const formatBFDefinition = (kollektivId) => {
                        const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
                        const displayName = commonData.getKollektivDisplayName(kollektivId) || kollektivId;
                        if (bfDef && bfDef.criteria && isFinite(bfDef.metricValue)) {
                            let metricValueStr = commonData.formatNumber(bfDef.metricValue, 4, 'N/A', 'en');
                            const metricNameDisplay = bfDef.metricName || bfZielMetric;
                            const formattedCriteria = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false) : 'N/A';
                            return `<li><strong>${displayName}:</strong> ${formattedCriteria} (Zielmetrik: ${metricNameDisplay}, Wert: ${metricValueStr})</li>`;
                        }
                        return `<li><strong>${displayName}:</strong> Keine Optimierungsergebnisse für Zielmetrik '${bfZielMetric}' verfügbar oder nicht berechnet.</li>`;
                    };

                    let bfCriteriaText = '<ul>';
                    bfCriteriaText += formatBFDefinition('Gesamt');
                    bfCriteriaText += formatBFDefinition('direkt OP');
                    bfCriteriaText += formatBFDefinition('nRCT');
                    bfCriteriaText += '</ul>';

                    const kohRefShort = commonData.references?.koh2008?.short || "Koh et al. (2008)";
                    const kohRefFull = commonData.references?.koh2008?.fullCitation || kohRefShort;
                    const kohDOI = commonData.references?.koh2008?.doi;
                    const kohDesc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.studyInfo?.keyCriteriaSummary || "Irreguläre Kontur ODER heterogenes Signal" : "Irreguläre Kontur ODER heterogenes Signal";

                    const barbaroRefShort = commonData.references?.barbaro2024?.short || "Barbaro et al. (2024)";
                    const barbaroRefFull = commonData.references?.barbaro2024?.fullCitation || barbaroRefShort;
                    const barbaroDOI = commonData.references?.barbaro2024?.doi;
                    const barbaroDesc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.studyInfo?.keyCriteriaSummary || "Kurzachse ≥ 2,3mm" : "Kurzachse ≥ 2,3mm";
                    
                    const esgarRefShort = commonData.references?.beetsTan2018ESGAR?.short || "Beets-Tan et al. (2018)";
                    const esgarRefFull = commonData.references?.beetsTan2018ESGAR?.fullCitation || esgarRefShort;
                    const esgarDOI = commonData.references?.beetsTan2018ESGAR?.doi;
                    const rutegardRefShort = commonData.references?.rutegard2025?.short || "Rutegård et al. (2025)";
                    const rutegardRefFull = commonData.references?.rutegard2025?.fullCitation || rutegardRefShort;
                    const rutegardDOI = commonData.references?.rutegard2025?.doi;
                    const esgarDesc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.studyInfo?.keyCriteriaSummary || "Größe ≥9mm ODER (5-8mm UND ≥2 Kriterien) ODER (<5mm UND 3 Kriterien)" : "Größe ≥9mm ODER (5-8mm UND ≥2 Kriterien) ODER (<5mm UND 3 Kriterien)";

                    return `
                        <p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachsendurchmesser in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität des Binnensignals ['homogen', 'heterogen'] und Signalintensität relativ zum umgebenden Fettgewebe ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status. Für Patienten der nRCT-Gruppe wurden diese Merkmale auf den Restaging-MRT-Bildern beurteilt.</p>
                        <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                        <ol>
                            <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe <a href="${commonData.getSafeLink('methoden.literaturT2KriterienTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('methoden.literaturT2KriterienTabelle', 'table')}</a>):
                                <ul>
                                    <li>Kriterien nach ${kohRefShort} (<a href="${kohDOI || '#'}" target="_blank" rel="noopener noreferrer"><i>Int J Radiat Oncol Biol Phys</i> 2008</a>): Definiert als "${kohDesc}". Dieses Set wurde in unserer Analyse sowohl auf das Gesamtkollektiv als auch auf die Direkt-OP- und nRCT-Subgruppen angewendet, um die Generalisierbarkeit zu prüfen.</li>
                                    <li>Kriterien nach ${barbaroRefShort} (<a href="${barbaroDOI || '#'}" target="_blank" rel="noopener noreferrer"><i>Radiother Oncol</i> 2024</a>): Definiert als "${barbaroDesc}". Dieses Set wurde spezifisch für das Kollektiv der Patienten nach nRCT (Restaging) evaluiert.</li>
                                    <li>ESGAR Konsensus Kriterien (<a href="${esgarDOI || '#'}" target="_blank" rel="noopener noreferrer">${esgarRefShort}</a>), validiert durch ${rutegardRefShort} (<a href="${rutegardDOI || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>): Definiert als "${esgarDesc}". Dieses Set wurde primär auf das Kollektiv der Patienten vor Therapie (Direkt-OP-Gruppe, Primärstaging) angewendet.</li>
                                </ul>
                            </li>
                            <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>${bfZielMetric}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                                ${bfCriteriaText}
                            </li>
                             <li><strong>Im Analyse-Tool aktuell definierte T2-Kriterien:</strong> Für explorative Zwecke und zur Demonstration der Anwendungsflexibilität können benutzerdefinierte Kriterien konfiguriert werden. Die zum Zeitpunkt der finalen Datenanalyse und Reporterstellung im Tool als "angewandt" konfigurierten Kriterien waren: ${formattedAppliedCriteria}. Diese dienen als dynamische Referenz innerhalb der Anwendung. Für die hier präsentierte Publikation sind die unter Punkt 1 und 2 genannten Kriteriensets maßgeblich für die vergleichende Analyse.</li>
                        </ol>
                        <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv für den N-Status, wenn mindestens ein mesorektaler Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
                    `;
                }
            },
            methoden_referenzstandard: {
                title: "Referenzstandard (Histopathologie)",
                content: (commonData, allKollektivStats, options) => `
                    <p>Die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME) diente als Referenzstandard für den Lymphknotenstatus (N-Status). Alle mesorektalen Lymphknoten wurden von erfahrenen Pathologen gemäß den etablierten Standardprotokollen (z.B. Färbung mit Hämatoxylin-Eosin) aufgearbeitet und mikroskopisch auf das Vorhandensein von Tumorzellen untersucht. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0).</p>
                `
            },
            methoden_statistische_analyse: {
                title: "Statistische Analyse",
                content: (commonData, allKollektivStats, options) => {
                    const alphaLevel = commonData.significanceLevel || 0.05;
                    const alphaText = commonData.formatNumber(alphaLevel, 2, '0.05', 'en');
                    const bootstrapN = commonData.bootstrapReplications || 1000;
                    const appNameAndVersion = `${commonData.appName || APP_CONFIG.APP_NAME} v${commonData.appVersion || APP_CONFIG.APP_VERSION}`;
                    const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
                    const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";

                    return `
                        <p>Die deskriptive Statistik umfasste die Berechnung von Medianen und Interquartilsabständen (IQR) oder Minima und Maxima für kontinuierliche Variablen sowie absolute und relative Häufigkeiten für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) zur Vorhersage des pathologischen N-Status wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProportion}-Methode verwendet. Für BalAcc (AUC) und den F1-Score wurde die ${ciMethodEffectSize}-Methode mit ${bootstrapN} Replikationen angewendet.</p>
                        <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests (mit Kontinuitätskorrektur) für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI (Logit-Methode für OR-CI, Wald-Methode für RD-CI). Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${appNameAndVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen in JavaScript basiert.</p>
                    `;
                }
            },
            ergebnisse_patientencharakteristika: {
                title: "Patientencharakteristika",
                content: (commonData, allKollektivStats, options) => {
                    const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
                    const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
                    const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
                    const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
                    const anteilNplusGesamt = commonData.formatPercent((pCharGesamt?.nStatus?.plus || 0) / (pCharGesamt?.anzahlPatienten || 1), 1);
                    const studyReferenceASShort = commonData.references?.lurzSchaefer2025?.short || "Lurz & Schäfer (2025)";
                    const studyReferenceASDOI = commonData.references?.lurzSchaefer2025?.doi;

                    return `
                        <p>Die Charakteristika der ${anzahlGesamt} in die Studie eingeschlossenen Patienten sind in <a href="${commonData.getSafeLink('ergebnisse.patientenCharakteristikaTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.patientenCharakteristikaTabelle', 'table')}</a> zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie (<a href="${studyReferenceASDOI || '#'}" target="_blank" rel="noopener noreferrer">${studyReferenceASShort}</a>). Das Gesamtkollektiv bestand aus ${anzahlDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${anzahlNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${commonData.fCI(pCharGesamt?.alter?.median, 1, false)} Jahre (Range ${commonData.fCI(pCharGesamt?.alter?.min, 0, false)}–${commonData.fCI(pCharGesamt?.alter?.max, 0, false)}), und ${commonData.formatPercent((pCharGesamt?.geschlecht?.m || 0) / (pCharGesamt?.anzahlPatienten || 1),0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${anzahlGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in <a href="${commonData.getSafeLink('ergebnisse.alterVerteilungChart')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.alterVerteilungChart', 'figure')}</a> und <a href="${commonData.getSafeLink('ergebnisse.geschlechtVerteilungChart')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.geschlechtVerteilungChart', 'figure')}</a> dargestellt.</p>
                    `;
                }
            },
            ergebnisse_as_performance: {
                title: "Diagnostische Güte des Avocado Signs",
                content: (commonData, allKollektivStats, options) => {
                    const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
                    const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
                    const asNRCT = allKollektivStats?.nRCT?.gueteAS;
                    const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';

                    return `
                        <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in <a href="${commonData.getSafeLink('ergebnisse.diagnostischeGueteASTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.diagnostischeGueteASTabelle', 'table')}</a> detailliert aufgeführt. Im Gesamtkollektiv (N=${nGesamt}) erreichte das AS eine Sensitivität von ${commonData.fCI(asGesamt?.sens, 1, true)}, eine Spezifität von ${commonData.fCI(asGesamt?.spez, 1, true)}, einen positiven prädiktiven Wert (PPV) von ${commonData.fCI(asGesamt?.ppv, 1, true)}, einen negativen prädiktiven Wert (NPV) von ${commonData.fCI(asGesamt?.npv, 1, true)} und eine Accuracy von ${commonData.fCI(asGesamt?.acc, 1, true)}. Die AUC (Balanced Accuracy) betrug ${commonData.fCI(asGesamt?.auc, 3, false)}. Diese Werte stimmen mit den in der Originalpublikation zum Avocado Sign berichteten überein.</p>
                        <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, N=${nDirektOP}) zeigte das AS eine Sensitivität von ${commonData.fCI(asDirektOP?.sens, 1, true)} und eine Spezifität von ${commonData.fCI(asDirektOP?.spez, 1, true)} (AUC: ${commonData.fCI(asDirektOP?.auc, 3, false)}). Bei Patienten nach nRCT (nRCT-Gruppe, N=${nNRCT}) betrug die Sensitivität ${commonData.fCI(asNRCT?.sens, 1, true)} und die Spezifität ${commonData.fCI(asNRCT?.spez, 1, true)} (AUC: ${commonData.fCI(asNRCT?.auc, 3, false)}).</p>
                    `;
                }
            },
            ergebnisse_literatur_t2_performance: {
                title: "Diagnostische Güte der Literatur-basierten T2-Kriterien",
                 content: (commonData, allKollektivStats, options) => {
                    const kohRefShort = commonData.references?.koh2008?.short || "Koh et al. (2008)";
                    const barbaroRefShort = commonData.references?.barbaro2024?.short || "Barbaro et al. (2024)";
                    const esgarRefShort = commonData.references?.beetsTan2018ESGAR?.short || "ESGAR 2016";
                    const rutegardRefShort = commonData.references?.rutegard2025?.short || "Rutegård et al. (2025)";
                    const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';

                    const kohData = allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
                    const barbaroData = allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
                    const esgarData = allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];
                    
                    let text = `<p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in <a href="${commonData.getSafeLink('ergebnisse.diagnostischeGueteLiteraturT2Tabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.diagnostischeGueteLiteraturT2Tabelle', 'table')}</a> zusammengefasst. `;
                    text += `Für das Kriterienset nach ${kohRefShort}, angewendet auf das Gesamtkollektiv (N=${nGesamt}), ergab sich eine Sensitivität von ${commonData.fCI(kohData?.sens, 1, true)} und eine Spezifität von ${commonData.fCI(kohData?.spez, 1, true)} (AUC ${commonData.fCI(kohData?.auc, 3, false)}). `;
                    text += `Die Kriterien nach ${barbaroRefShort}, spezifisch für das nRCT-Kollektiv (N=${nNRCT}), zeigten eine Sensitivität von ${commonData.fCI(barbaroData?.sens, 1, true)} und eine Spezifität von ${commonData.fCI(barbaroData?.spez, 1, true)} (AUC ${commonData.fCI(barbaroData?.auc, 3, false)}). `;
                    text += `Die ${esgarRefShort}-Kriterien (evaluiert durch ${rutegardRefShort}), angewendet auf das Direkt-OP-Kollektiv (N=${nDirektOP}), erreichten eine Sensitivität von ${commonData.fCI(esgarData?.sens, 1, true)} und eine Spezifität von ${commonData.fCI(esgarData?.spez, 1, true)} (AUC ${commonData.fCI(esgarData?.auc, 3, false)}).</p>`;
                    return text;
                }
            },
            ergebnisse_optimierte_t2_performance: {
                title: "Diagnostische Güte der optimierten T2-Kriterien (Brute-Force)",
                content: (commonData, allKollektivStats, options) => {
                    const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                    let text = `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die ${bfZielMetric} maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (siehe <a href="${commonData.getSafeLink('methoden.literaturT2KriterienTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('methoden.literaturT2KriterienTabelle','table')}</a>) aufgeführt. Die diagnostische Güte dieser optimierten Sets ist in <a href="${commonData.getSafeLink('ergebnisse.diagnostischeGueteOptimierteT2Tabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.diagnostischeGueteOptimierteT2Tabelle','table')}</a> dargestellt.</p><ul>`;
                    const kollektive = [
                        { id: 'Gesamt', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
                        { id: 'direkt OP', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
                        { id: 'nRCT', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
                    ];
                    kollektive.forEach(k => {
                        const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
                        const name = commonData.getKollektivDisplayName(k.id);
                        const nPat = k.n || 'N/A';
                        if (bfStats && bfStats.matrix_components) {
                            text += `<li>Für das ${name} (N=${nPat}) erreichten die optimierten Kriterien eine Sensitivität von ${commonData.fCI(bfStats?.sens, 1, true)}, eine Spezifität von ${commonData.fCI(bfStats?.spez, 1, true)} und eine AUC von ${commonData.fCI(bfStats?.auc, 3, false)}.</li>`;
                        } else {
                            text += `<li>Für das ${name} (N=${nPat}) konnten keine validen optimierten Kriterien für die Zielmetrik ${bfZielMetric} ermittelt oder deren Performance berechnet werden.</li>`;
                        }
                    });
                    text += `</ul>`;
                    return text;
                }
            },
            ergebnisse_vergleich_performance: {
                title: "Vergleich der diagnostischen Güte: Avocado Sign versus T2-Kriterien",
                content: (commonData, allKollektivStats, options) => {
                    let text = `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) ist in <a href="${commonData.getSafeLink('ergebnisse.statistischerVergleichAST2Tabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.statistischerVergleichAST2Tabelle', 'table')}</a> zusammengefasst. <a href="${commonData.getSafeLink('ergebnisse.vergleichPerformanceChartGesamt')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.vergleichPerformanceChartGesamt', 'figure')}</a> bis <a href="${commonData.getSafeLink('ergebnisse.vergleichPerformanceChartNRCT')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.vergleichPerformanceChartNRCT', 'figure')}</a> visualisieren die Schlüsselmetriken vergleichend für die drei Kollektive.</p>`;
                     const kollektive = [
                        { id: 'Gesamt', litSetId: 'koh_2008_morphology', litSetName: commonData.references?.koh2008?.short || 'Koh et al.' },
                        { id: 'direkt OP', litSetId: 'rutegard_et_al_esgar', litSetName: `${commonData.references?.beetsTan2018ESGAR?.short || 'ESGAR 2016'} (eval. ${commonData.references?.rutegard2025?.short || 'Rutegård et al.'})` },
                        { id: 'nRCT', litSetId: 'barbaro_2024_restaging', litSetName: commonData.references?.barbaro2024?.short || 'Barbaro et al.' }
                    ];
                    kollektive.forEach(k => {
                        const name = commonData.getKollektivDisplayName(k.id);
                        const statsAS = allKollektivStats?.[k.id]?.gueteAS;
                        const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
                        const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
                        const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
                        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                        const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
                        const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;
                        
                        text += `<h4>Vergleich im ${name}</h4>`;
                        if (statsAS && statsLit && vergleichASvsLit) {
                             text += `<p>Im Vergleich des AS (AUC ${commonData.fCI(statsAS.auc, 3, false)}) mit den Kriterien nach ${k.litSetName} (AUC ${commonData.fCI(statsLit.auc, 3, false)}) zeigte sich für die Accuracy ein p-Wert von ${commonData.getPValueText(vergleichASvsLit.mcnemar?.pValue)} (McNemar; ${vergleichASvsLit.mcnemar?.testStat || 'N/A'}) und für die AUC ein p-Wert von ${commonData.getPValueText(vergleichASvsLit.delong?.pValue)} (DeLong; Z=${commonData.formatNumber(vergleichASvsLit.delong?.zStat,2,'N/A','en')}). Der Unterschied in der AUC betrug ${commonData.formatNumber(vergleichASvsLit.delong?.diffAUC, 3, 'N/A', 'en')}.</p>`;
                        } else { text += `<p>Ein Vergleich zwischen AS und den Kriterien nach ${k.litSetName} konnte nicht vollständig durchgeführt werden.</p>`; }
                        if (statsAS && statsBF && vergleichASvsBF && bfDef && isFinite(bfDef.metricValue)) {
                             text += `<p>Gegenüber den für die ${bfDef.metricName || bfZielMetric} optimierten T2-Kriterien (AUC ${commonData.fCI(statsBF.auc, 3, false)}) ergab sich für die Accuracy ein p-Wert von ${commonData.getPValueText(vergleichASvsBF.mcnemar?.pValue)} (McNemar; ${vergleichASvsBF.mcnemar?.testStat || 'N/A'}) und für die AUC ein p-Wert von ${commonData.getPValueText(vergleichASvsBF.delong?.pValue)} (DeLong; Z=${commonData.formatNumber(vergleichASvsBF.delong?.zStat,2,'N/A','en')}). Der Unterschied in der AUC betrug ${commonData.formatNumber(vergleichASvsBF.delong?.diffAUC, 3, 'N/A', 'en')}.</p>`;
                        } else { text += `<p>Ein Vergleich zwischen AS und den Brute-Force-optimierten Kriterien (Ziel: ${bfZielMetric}) konnte nicht vollständig durchgeführt werden.</p>`; }
                    });
                    return text;
                }
            },
            referenzen_liste: { // Geändert von 'referenzen' zu 'referenzen_liste' um Kollision zu vermeiden
                title: "Referenzen", // Angepasst für Konsistenz
                content: (commonData, allKollektivStats, options) => {
                    const refs = commonData.references || {};
                    let text = `<ol class="small">`;
                     const referenceOrder = [
                        'lurzSchaefer2025', 'koh2008', 'barbaro2024', 'rutegard2025', 'beetsTan2018ESGAR',
                        'brown2003', 'horvat2019', 'kaur2012', 'lahaye2009', 'vliegen2005BeetsTan', 'barbaro2010'
                    ];
                    const displayedRefs = new Set();
                    referenceOrder.forEach(key => { 
                        if (refs[key] && refs[key].fullCitation && !displayedRefs.has(refs[key].fullCitation)) { 
                            text += `<li>${refs[key].fullCitation} ${refs[key].doi ? `DOI: <a href="https://doi.org/${refs[key].doi}" target="_blank" rel="noopener noreferrer">${refs[key].doi}</a>` : ''}</li>`; 
                            displayedRefs.add(refs[key].fullCitation); 
                        } 
                    });
                    if (displayedRefs.size === 0) { text += `<li>Keine Referenzen definiert.</li>`}
                    text += `</ol>`;
                    return text;
                }
            }
        },
        en: { // Englische Templates folgen dem gleichen Muster, hier gekürzt zur Veranschaulichung
            methoden_studienanlage: {
                title: "Study Design and Ethics",
                content: (commonData, allKollektivStats, options) => `
                    <p>This study was designed and conducted as a retrospective analysis of a prospectively maintained, single-center patient cohort with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging datasets for the initial assessment of the Avocado Sign (AS) are identical to those of the original Avocado Sign publication (Lurz & Schäfer, <a href="${commonData.references?.lurzSchaefer2025?.doi || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>). The objective of this extended investigation is a detailed comparison of the diagnostic performance of the AS with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).</p>
                    <p>All analyses and criteria evaluations presented herein were performed using an interactive web application (AvocadoSign Analysis Tool v${commonData.appVersion || APP_CONFIG.APP_VERSION}, ${commonData.appName || APP_CONFIG.APP_NAME}), specifically developed and enhanced for this and subsequent studies. This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the responsible local ethics committee (${commonData.references?.lurzSchaefer2025?.ethicsVote || "Ethics Vote No. XYZ, Ethics Committee Cityname"}). Given the retrospective nature of this analysis on pseudonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific extended evaluation, as general consent for scientific evaluation was provided as part of the primary study.</p>
                `
            },
            methoden_patientenkollektiv: {
                title: "Patient Cohort",
                content: (commonData, allKollektivStats, options) => `
                    <p>The study cohort comprised ${commonData.nGesamt || 'N/A'} consecutive patients with histologically confirmed rectal cancer who were treated at ${commonData.references?.lurzSchaefer2025?.institution || "University Hospital Cityname"} between ${commonData.references?.lurzSchaefer2025?.studyPeriod || "January YYYY and December YYYY"} and included in the initial Avocado Sign study. Of these, ${commonData.nNRCT || 'N/A'} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${commonData.nDirektOP || 'N/A'} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${commonData.fCI(allKollektivStats?.Gesamt?.deskriptiv?.alter?.median, 1, false, 'en')} years (range: ${commonData.fCI(allKollektivStats?.Gesamt?.deskriptiv?.alter?.min, 0, false, 'en')}–${commonData.fCI(allKollektivStats?.Gesamt?.deskriptiv?.alter?.max, 0, false, 'en')} years). Males constituted ${commonData.formatPercent((allKollektivStats?.Gesamt?.deskriptiv?.geschlecht?.m || 0) / (allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 1), 1, 'en')} (${allKollektivStats?.Gesamt?.deskriptiv?.geschlecht?.m || 0}/${allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A'}) of the cohort. Detailed patient characteristics, stratified by treatment group, are presented in <a href="${commonData.getSafeLink('ergebnisse.patientenCharakteristikaTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.patientenCharakteristikaTabelle', 'table', 'en')}</a>.</p>
                    <p>Inclusion criteria for the primary study were age of at least 18 years and histologically confirmed adenocarcinoma of the rectum. Exclusion criteria included the presence of distant metastases at initial diagnosis (M1 status), unresectable tumors (cT4b with infiltration of adjacent organs precluding R0 resection), prior pelvic surgery or radiotherapy, and general contraindications to MRI (e.g., non-MRI-compatible implants, severe claustrophobia). For the present extended analysis, all patients from the primary study with complete datasets regarding T1-weighted contrast-enhanced and T2-weighted lymph node characteristics, as well as histopathological N-status, were included.</p>
                `
            },
             methoden_mrt_protokoll: {
                title: "MRI Protocol and Image Acquisition",
                content: (commonData, allKollektivStats, options) => `
                    <p>All MRI examinations were performed on a ${commonData.references?.lurzSchaefer2025?.mriSystem || "3.0-Tesla MRI system (e.g., MAGNETOM Prisma; Siemens Healthineers, Erlangen, Germany)"} using an external body phased-array coil. Prior to the examination, patients routinely received butylscopolamine bromide (20 mg intravenously), unless contraindicated, to reduce artifacts from bowel peristalsis. The standardized rectal cancer staging imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness ${commonData.references?.lurzSchaefer2025?.t2SliceThickness || "3 mm"}, no slice gap, field of view [FOV] approx. 200-240 mm, matrix approx. 320x320 to 384x384). Additionally, axial diffusion-weighted imaging (DWI) with at least two b-values (e.g., b=0 and b=800-1000 s/mm²) and corresponding apparent diffusion coefficient (ADC) maps was routinely acquired.</p>
                    <p>For the assessment of the Avocado Sign, as described in the primary study, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) or a comparable 3D gradient-echo sequence with fat suppression (e.g., Dixon technique) was acquired. A macrocyclic gadolinium-based contrast agent (${commonData.references?.lurzSchaefer2025?.contrastAgent || "e.g., Gadoteridol (ProHance; Bracco Imaging)"}) was administered intravenously as a bolus at a weight-based dose (standard dose 0.1 mmol/kg body weight), followed by a saline flush. Contrast-enhanced images were acquired in a portal venous or late arterial phase (approx. 60-90 seconds post-contrast). The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group, typically 6-8 weeks after completion of nRCT).</p>
                `
            },
            methoden_as_definition: {
                title: "Definition and Assessment of the Avocado Sign",
                 content: (commonData, allKollektivStats, options) => `
                    <p>The Avocado Sign (AS), as defined in the original study (Lurz & Schäfer, <a href="${commonData.references?.lurzSchaefer2025?.doi || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense, contrast-enhancing lymph node, irrespective of node size or shape (see Figure 2 in Lurz & Schäfer, <a href="${commonData.references?.lurzSchaefer2025?.doi || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>). Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) for N-status if at least one mesorectal lymph node exhibited this sign.</p>
                    <p>Image analysis was performed by two radiologists (Radiologist 1: ${commonData.references?.lurzSchaefer2025?.radiologistExperience?.[0] || "XX"} years of experience; Radiologist 2: ${commonData.references?.lurzSchaefer2025?.radiologistExperience?.[1] || "YY"} years of experience in abdominal MRI), who also conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies in AS assessment were resolved by consensus with a third, similarly experienced radiologist (Radiologist 3: ${commonData.references?.lurzSchaefer2025?.radiologistExperience?.[2] || "ZZ"} years of experience). For patients in the nRCT group, AS assessment was performed on restaging MRI images.</p>
                `
            },
            methoden_t2_definition: {
                title: "Definition and Assessment of T2-weighted Criteria",
                content: (commonData, allKollektivStats, options) => {
                    const appliedCriteria = options?.appliedCriteria || (typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria());
                    const appliedLogic = options?.appliedLogic || (typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC);
                    const formattedAppliedCriteria = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false) : 'N/A';
                    const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                    const table2Id = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;

                    const formatBFDefinition = (kollektivId) => {
                        const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
                        const displayName = commonData.getKollektivDisplayName(kollektivId) || kollektivId;
                        if (bfDef && bfDef.criteria && isFinite(bfDef.metricValue)) {
                            let metricValueStr = commonData.formatNumber(bfDef.metricValue, 4, 'N/A', 'en');
                            const metricNameDisplay = bfDef.metricName || bfZielMetric;
                            const formattedCriteria = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false) : 'N/A';
                            return `<li><strong>${displayName}:</strong> ${formattedCriteria} (target metric: ${metricNameDisplay}, value: ${metricValueStr})</li>`;
                        }
                        return `<li><strong>${displayName}:</strong> No optimization results available or not calculated for target metric '${bfZielMetric}'.</li>`;
                    };

                    let bfCriteriaText = '<ul>';
                    bfCriteriaText += formatBFDefinition('Gesamt');
                    bfCriteriaText += formatBFDefinition('direkt OP');
                    bfCriteriaText += formatBFDefinition('nRCT');
                    bfCriteriaText += '</ul>';
                    
                    const kohRefShort = commonData.references?.koh2008?.short || "Koh et al. (2008)";
                    const kohDOI = commonData.references?.koh2008?.doi;
                    const kohDesc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.studyInfo?.keyCriteriaSummary || "Irregular border OR heterogeneous signal" : "Irregular border OR heterogeneous signal";

                    const barbaroRefShort = commonData.references?.barbaro2024?.short || "Barbaro et al. (2024)";
                    const barbaroDOI = commonData.references?.barbaro2024?.doi;
                    const barbaroDesc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.studyInfo?.keyCriteriaSummary || "Short-axis diameter ≥ 2.3mm" : "Short-axis diameter ≥ 2.3mm";
                    
                    const esgarRefShort = commonData.references?.beetsTan2018ESGAR?.short || "Beets-Tan et al. (2018)";
                    const esgarDOI = commonData.references?.beetsTan2018ESGAR?.doi;
                    const rutegardRefShort = commonData.references?.rutegard2025?.short || "Rutegård et al. (2025)";
                    const rutegardDOI = commonData.references?.rutegard2025?.doi;
                    const esgarDesc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.studyInfo?.keyCriteriaSummary || "Size ≥9mm OR (5-8mm AND ≥2 criteria) OR (<5mm AND 3 criteria)" : "Size ≥9mm OR (5-8mm AND ≥2 criteria) OR (<5mm AND 3 criteria)";


                    return `
                        <p>The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], internal signal homogeneity ['homogeneous', 'heterogeneous'], and signal intensity relative to surrounding fat ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists who evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status. For patients in the nRCT group, these features were assessed on restaging MRI images.</p>
                        <p>For the comparison of diagnostic performance, the following T2 criteria sets were utilized:</p>
                        <ol>
                            <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see <a href="${commonData.getSafeLink('methoden.literaturT2KriterienTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('methoden.literaturT2KriterienTabelle', 'table', 'en')}</a>):
                                <ul>
                                    <li>Criteria by ${kohRefShort} (<a href="${kohDOI || '#'}" target="_blank" rel="noopener noreferrer"><i>Int J Radiat Oncol Biol Phys</i> 2008</a>): Defined as "${kohDesc}". In our analysis, this set was applied to the overall cohort as well as the upfront surgery and nRCT subgroups to assess generalizability.</li>
                                    <li>Criteria by ${barbaroRefShort} (<a href="${barbaroDOI || '#'}" target="_blank" rel="noopener noreferrer"><i>Radiother Oncol</i> 2024</a>): Defined as "${barbaroDesc}". This set was specifically evaluated for the nRCT cohort (restaging).</li>
                                    <li>ESGAR Consensus Criteria (<a href="${esgarDOI || '#'}" target="_blank" rel="noopener noreferrer">${esgarRefShort}</a>), as evaluated by ${rutegardRefShort} (<a href="${rutegardDOI || '#'}" target="_blank" rel="noopener noreferrer"><i>Eur Radiol</i> 2025</a>): Defined as "${esgarDesc}". This set was primarily applied to the cohort of patients before therapy (upfront surgery group, primary staging).</li>
                                </ul>
                            </li>
                            <li><strong>Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>${bfZielMetric}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting cohort-specific optimized criteria sets were:
                                ${bfCriteriaText}
                            </li>
                            <li><strong>Currently defined T2 criteria in the analysis tool:</strong> For exploratory purposes and to demonstrate the application's flexibility, user-defined criteria can be configured. The criteria applied in the tool at the time of final data analysis and report generation were: ${formattedAppliedCriteria}. These serve as a dynamic reference within the application. For the present publication, the criteria sets mentioned under points 1 and 2 are authoritative for the comparative analysis.</li>
                        </ol>
                        <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive for N-status if at least one mesorectal lymph node was rated positive according to the respective criteria set.</p>
                    `;
                }
            },
            methoden_referenzstandard: {
                title: "Reference Standard (Histopathology)",
                content: (commonData, allKollektivStats, options) => `
                    <p>Histopathological examination of surgical specimens after total mesorectal excision (TME) served as the reference standard for lymph node status (N-status). All mesorectal lymph nodes were processed and microscopically evaluated by experienced pathologists according to established standard protocols (e.g., hematoxylin-eosin staining). A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0).</p>
                `
            },
            methoden_statistische_analyse: {
                title: "Statistical Analysis",
                content: (commonData, allKollektivStats, options) => {
                    const alphaLevel = commonData.significanceLevel || 0.05;
                    const alphaText = commonData.formatNumber(alphaLevel, 2, '0.05', 'en');
                    const bootstrapN = commonData.bootstrapReplications || 1000;
                    const appNameAndVersion = `${commonData.appName || APP_CONFIG.APP_NAME} v${commonData.appVersion || APP_CONFIG.APP_VERSION}`;
                    const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
                    const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";

                    return `
                        <p>Descriptive statistics included the calculation of medians and interquartile ranges (IQR) or minima and maxima for continuous variables, and absolute and relative frequencies for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) for predicting pathological N-status was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the receiver operating characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the ${ciMethodEffectSize} method with ${bootstrapN} replications was applied.</p>
                        <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test (with continuity correction) for paired nominal data and DeLong's test for AUC comparison. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs (logit method for OR CI, Wald method for RD CI). The Phi coefficient (φ) was used as a measure of the strength of association between binary features. A P-value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${appNameAndVersion}), which is based on standard libraries for statistical computations in JavaScript.</p>
                    `;
                }
            },
            ergebnisse_patientencharakteristika: {
                title: "Patient Characteristics",
                content: (commonData, allKollektivStats, options) => {
                    const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
                    const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
                    const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
                    const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
                    const anteilNplusGesamt = commonData.formatPercent((pCharGesamt?.nStatus?.plus || 0) / (pCharGesamt?.anzahlPatienten || 1), 1, 'en');
                    const studyReferenceASShort = commonData.references?.lurzSchaefer2025?.short || "Lurz & Schäfer (2025)";
                    const studyReferenceASDOI = commonData.references?.lurzSchaefer2025?.doi;

                    return `
                        <p>The characteristics of the ${anzahlGesamt} patients included in the study are summarized in <a href="${commonData.getSafeLink('ergebnisse.patientenCharakteristikaTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.patientenCharakteristikaTabelle', 'table', 'en')}</a> and correspond to the data from the initial Avocado Sign study (<a href="${studyReferenceASDOI || '#'}" target="_blank" rel="noopener noreferrer">${studyReferenceASShort}</a>). The overall cohort consisted of ${anzahlDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${anzahlNRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${commonData.fCI(pCharGesamt?.alter?.median, 1, false, 'en')} years (range ${commonData.fCI(pCharGesamt?.alter?.min, 0, false, 'en')}–${commonData.fCI(pCharGesamt?.alter?.max, 0, false, 'en')}), and ${commonData.formatPercent((pCharGesamt?.geschlecht?.m || 0) / (pCharGesamt?.anzahlPatienten || 1),0, 'en')} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${anzahlGesamt} patients (${anteilNplusGesamt}) in the overall cohort. The age and gender distribution in the overall cohort is shown in <a href="${commonData.getSafeLink('ergebnisse.alterVerteilungChart')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.alterVerteilungChart', 'figure', 'en')}</a> and <a href="${commonData.getSafeLink('ergebnisse.geschlechtVerteilungChart')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.geschlechtVerteilungChart', 'figure', 'en')}</a>.</p>
                    `;
                }
            },
            ergebnisse_as_performance: {
                title: "Diagnostic Performance of the Avocado Sign",
                content: (commonData, allKollektivStats, options) => {
                    const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
                    const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
                    const asNRCT = allKollektivStats?.nRCT?.gueteAS;
                    const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';

                    return `
                        <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${commonData.getSafeLink('ergebnisse.diagnostischeGueteASTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.diagnostischeGueteASTabelle', 'table', 'en')}</a> for the overall cohort and subgroups. In the overall cohort (N=${nGesamt}), the AS achieved a sensitivity of ${commonData.fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${commonData.fCI(asGesamt?.spez, 1, true, 'en')}, a positive predictive value (PPV) of ${commonData.fCI(asGesamt?.ppv, 1, true, 'en')}, a negative predictive value (NPV) of ${commonData.fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${commonData.fCI(asGesamt?.acc, 1, true, 'en')}. The AUC (Balanced Accuracy) was ${commonData.fCI(asGesamt?.auc, 3, false, 'en')}. These values are consistent with those reported in the original Avocado Sign publication.</p>
                        <p>In the subgroup of patients undergoing upfront surgery (upfront surgery group, N=${nDirektOP}), the AS showed a sensitivity of ${commonData.fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${commonData.fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${commonData.fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after nRCT (nRCT group, N=${nNRCT}), the sensitivity was ${commonData.fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${commonData.fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${commonData.fCI(asNRCT?.auc, 3, false, 'en')}).</p>
                    `;
                }
            },
            ergebnisse_literatur_t2_performance: {
                title: "Diagnostic Performance of Literature-Based T2 Criteria",
                content: (commonData, allKollektivStats, options) => {
                    const kohRefShort = commonData.references?.koh2008?.short || "Koh et al. (2008)";
                    const barbaroRefShort = commonData.references?.barbaro2024?.short || "Barbaro et al. (2024)";
                    const esgarRefShort = commonData.references?.beetsTan2018ESGAR?.short || "ESGAR 2016";
                    const rutegardRefShort = commonData.references?.rutegard2025?.short || "Rutegård et al. (2025)";
                    const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
                    const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
                    
                    const kohData = allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
                    const barbaroData = allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
                    const esgarData = allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];

                    let text = `<p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in <a href="${commonData.getSafeLink('ergebnisse.diagnostischeGueteLiteraturT2Tabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.diagnostischeGueteLiteraturT2Tabelle', 'table', 'en')}</a>. `;
                    text += `For the criteria set according to ${kohRefShort}, applied to the overall cohort (N=${nGesamt}), a sensitivity of ${commonData.fCI(kohData?.sens, 1, true, 'en')} and a specificity of ${commonData.fCI(kohData?.spez, 1, true, 'en')} (AUC ${commonData.fCI(kohData?.auc, 3, false, 'en')}) were observed. `;
                    text += `The criteria by ${barbaroRefShort}, specific for the nRCT cohort (N=${nNRCT}), showed a sensitivity of ${commonData.fCI(barbaroData?.sens, 1, true, 'en')} and a specificity of ${commonData.fCI(barbaroData?.spez, 1, true, 'en')} (AUC ${commonData.fCI(barbaroData?.auc, 3, false, 'en')}). `;
                    text += `The ${esgarRefShort} criteria (evaluated by ${rutegardRefShort}), applied to the upfront surgery cohort (N=${nDirektOP}), achieved a sensitivity of ${commonData.fCI(esgarData?.sens, 1, true, 'en')} and a specificity of ${commonData.fCI(esgarData?.spez, 1, true, 'en')} (AUC ${commonData.fCI(esgarData?.auc, 3, false, 'en')}).</p>`;
                    return text;
                }
            },
            ergebnisse_optimierte_t2_performance: {
                title: "Diagnostic Performance of Optimized T2 Criteria (Brute-Force)",
                 content: (commonData, allKollektivStats, options) => {
                    const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                    let text = `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing ${bfZielMetric} were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (see <a href="${commonData.getSafeLink('methoden.literaturT2KriterienTabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('methoden.literaturT2KriterienTabelle','table','en')}</a>). The diagnostic performance of these optimized sets is presented in <a href="${commonData.getSafeLink('ergebnisse.diagnostischeGueteOptimierteT2Tabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.diagnostischeGueteOptimierteT2Tabelle','table','en')}</a>.</p><ul>`;
                    const kollektive = [
                        { id: 'Gesamt', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
                        { id: 'direkt OP', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
                        { id: 'nRCT', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
                    ];
                    kollektive.forEach(k => {
                        const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
                        const name = commonData.getKollektivDisplayName(k.id);
                        const nPat = k.n || 'N/A';
                        if (bfStats && bfStats.matrix_components) {
                            text += `<li>For the ${name} (N=${nPat}), the optimized criteria achieved a sensitivity of ${commonData.fCI(bfStats?.sens, 1, true, 'en')}, a specificity of ${commonData.fCI(bfStats?.spez, 1, true, 'en')}, and an AUC of ${commonData.fCI(bfStats?.auc, 3, false, 'en')}.</li>`;
                        } else {
                            text += `<li>For the ${name} (N=${nPat}), no valid optimized criteria could be determined or their performance calculated for the target metric ${bfZielMetric}.</li>`;
                        }
                    });
                    text += `</ul>`;
                    return text;
                }
            },
            ergebnisse_vergleich_performance: {
                title: "Comparative Diagnostic Performance: Avocado Sign versus T2 Criteria",
                 content: (commonData, allKollektivStats, options) => {
                    let text = `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized) is summarized in <a href="${commonData.getSafeLink('ergebnisse.statistischerVergleichAST2Tabelle')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.statistischerVergleichAST2Tabelle', 'table', 'en')}</a>. <a href="${commonData.getSafeLink('ergebnisse.vergleichPerformanceChartGesamt')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.vergleichPerformanceChartGesamt', 'figure', 'en')}</a> to <a href="${commonData.getSafeLink('ergebnisse.vergleichPerformanceChartNRCT')}" class="internal-link">${commonData.getPubElementReferenceLabel('ergebnisse.vergleichPerformanceChartNRCT', 'figure', 'en')}</a> provide a comparative visualization of key metrics across the three cohorts.</p>`;
                     const kollektive = [
                        { id: 'Gesamt', litSetId: 'koh_2008_morphology', litSetName: commonData.references?.koh2008?.short || 'Koh et al.' },
                        { id: 'direkt OP', litSetId: 'rutegard_et_al_esgar', litSetName: `${commonData.references?.beetsTan2018ESGAR?.short || 'ESGAR 2016'} (eval. ${commonData.references?.rutegard2025?.short || 'Rutegård et al.'})` },
                        { id: 'nRCT', litSetId: 'barbaro_2024_restaging', litSetName: commonData.references?.barbaro2024?.short || 'Barbaro et al.' }
                    ];
                    kollektive.forEach(k => {
                        const name = commonData.getKollektivDisplayName(k.id);
                        const statsAS = allKollektivStats?.[k.id]?.gueteAS;
                        const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
                        const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
                        const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
                        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                        const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
                        const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;
                        
                        text += `<h4>Comparison in the ${name}</h4>`;
                        if (statsAS && statsLit && vergleichASvsLit) {
                             text += `<p>Comparing AS (AUC ${commonData.fCI(statsAS.auc, 3, false, 'en')}) with the criteria by ${k.litSetName} (AUC ${commonData.fCI(statsLit.auc, 3, false, 'en')}), the P-value for accuracy was ${commonData.getPValueText(vergleichASvsLit.mcnemar?.pValue, 'en')} (McNemar; ${vergleichASvsLit.mcnemar?.testStat || 'N/A'}) and for AUC was ${commonData.getPValueText(vergleichASvsLit.delong?.pValue, 'en')} (DeLong; Z=${commonData.formatNumber(vergleichASvsLit.delong?.zStat,2,'N/A','en')}). The difference in AUC was ${commonData.formatNumber(vergleichASvsLit.delong?.diffAUC, 3, 'N/A', 'en')}.</p>`;
                        } else { text += `<p>A full comparison between AS and the criteria by ${k.litSetName} could not be performed.</p>`; }
                        if (statsAS && statsBF && vergleichASvsBF && bfDef && isFinite(bfDef.metricValue)) {
                            text += `<p>Compared to the T2 criteria optimized for ${bfDef.metricName || bfZielMetric} (AUC ${commonData.fCI(statsBF.auc, 3, false, 'en')}), the P-value for accuracy was ${commonData.getPValueText(vergleichASvsBF.mcnemar?.pValue, 'en')} (McNemar; ${vergleichASvsBF.mcnemar?.testStat || 'N/A'}) and for AUC was ${commonData.getPValueText(vergleichASvsBF.delong?.pValue, 'en')} (DeLong; Z=${commonData.formatNumber(vergleichASvsBF.delong?.zStat,2,'N/A','en')}). The difference in AUC was ${commonData.formatNumber(vergleichASvsBF.delong?.diffAUC, 3, 'N/A', 'en')}.</p>`;
                        } else { text += `<p>A full comparison between AS and the brute-force optimized criteria (target: ${bfZielMetric}) could not be performed.</p>`; }
                    });
                    return text;
                }
            },
            referenzen_liste: {
                title: "References",
                content: (commonData, allKollektivStats, options) => {
                    const refs = commonData.references || {};
                    let text = `<ol class="small">`;
                     const referenceOrder = [
                        'lurzSchaefer2025', 'koh2008', 'barbaro2024', 'rutegard2025', 'beetsTan2018ESGAR',
                        'brown2003', 'horvat2019', 'kaur2012', 'lahaye2009', 'vliegen2005BeetsTan', 'barbaro2010'
                    ];
                    const displayedRefs = new Set();
                    referenceOrder.forEach(key => { 
                        if (refs[key] && refs[key].fullCitation && !displayedRefs.has(refs[key].fullCitation)) { 
                            text += `<li>${refs[key].fullCitation} ${refs[key].doi ? `DOI: <a href="https://doi.org/${refs[key].doi}" target="_blank" rel="noopener noreferrer">${refs[key].doi}</a>` : ''}</li>`; 
                            displayedRefs.add(refs[key].fullCitation); 
                        } 
                    });
                    if (displayedRefs.size === 0) { text += `<li>No references defined.</li>`}
                    text += `</ol>`;
                    return text;
                }
            }
        }
    };

    return Object.freeze({
        getTemplate: (lang, sectionId) => {
            return templates[lang]?.[sectionId]?.content || null;
        },
         getTemplateTitle: (lang, sectionId) => {
            return templates[lang]?.[sectionId]?.title || sectionId.replace(/_/g, ' ');
        },
        getAllTemplatesForLang: (lang) => {
            return templates[lang] || {};
        }
    });
})();
