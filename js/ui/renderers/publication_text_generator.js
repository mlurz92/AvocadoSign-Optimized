const publicationTextGenerator = (() => {
    let _data;
    let _lang;
    let _uiTexts;
    let _statTexts;
    let _tooltipContent;
    let _bfMetric;
    let _config;
    let _appConfig;

    function _fVal(value, digits = 1, isPercent = false, na = '--') {
        const num = parseFloat(value);
        if (value === null || value === undefined || isNaN(num) || !isFinite(num)) return na;
        const opts = { minimumFractionDigits: digits, maximumFractionDigits: digits };
        const locale = _lang === 'en' ? 'en-US' : 'de-DE';
        let formatted = num.toLocaleString(locale, opts);
        if (isPercent) formatted += '%';
        return formatted;
    }

    function _fCI(metricObj, digits = 1, isPercent = false, na = '--') {
        if (!metricObj || metricObj.value === null || metricObj.value === undefined || isNaN(metricObj.value)) return na;
        const valStr = _fVal(metricObj.value, digits, isPercent, na);
        if (!metricObj.ci || metricObj.ci.lower === null || metricObj.ci.lower === undefined || isNaN(metricObj.ci.lower) || metricObj.ci.upper === null || metricObj.ci.upper === undefined || isNaN(metricObj.ci.upper)) {
            return valStr;
        }
        const lowerStr = _fVal(metricObj.ci.lower, digits, isPercent, na);
        const upperStr = _fVal(metricObj.ci.upper, digits, isPercent, na);
        const ciText = _lang === 'en' ? '95% CI' : '95%-KI';
        return `${valStr} (${ciText}: ${lowerStr} – ${upperStr})`;
    }

    function _fPVal(pValue, includeSymbol = true, na = '--') {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return na;
        let pStr;
        if (pValue < 0.001) pStr = _lang === 'en' ? '<.001' : '<0,001';
        else pStr = _fVal(pValue, 3, false, na);
        return includeSymbol ? `${pStr}${getStatisticalSignificanceSymbol(pValue)}` : pStr;
    }

    function _getKollektivText(kollektivId, includeN = true) {
        const displayName = _uiTexts.kollektivDisplayNames[kollektivId] || kollektivId;
        if (includeN && _data.allKollektivStats && _data.allKollektivStats[kollektivId]?.deskriptiv) {
            const n = _data.allKollektivStats[kollektivId].deskriptiv.anzahlPatienten;
            return `${displayName} (N=${_fVal(n, 0)})`;
        }
        return displayName;
    }

    function _fRef(refKey, full = false) {
        const refEntry = _appConfig.REFERENCES_FOR_PUBLICATION[refKey];
        if (!refEntry) return `[${refKey} not found]`;
        if (full) return refEntry;

        const match = refEntry.match(/^([^\.]+?\s\([0-9]{4}\))/); // Author(s) (Year)
        if (match && match[1]) return `(${match[1]})`;
        
        const shortMatch = refEntry.match(/^([^,]+?et al\.\s\([0-9]{4}\))/); // Author et al. (Year)
        if (shortMatch && shortMatch[1]) return `(${shortMatch[1]})`;

        const esgarMatch = refEntry.match(/^(ESGAR Konsensus Kriterien.*?\(Beets-Tan et al\.\s[0-9]{4}\))/);
        if(esgarMatch && esgarMatch[1]) return `(${esgarMatch[1]})`;

        return `(${refKey.replace(/([A-Z])/g, ' $1').trim()})`; // Fallback
    }

    function _fTab(tableId, section = _data.currentSectionId) {
        const element = _config.publicationElements[section]?.[tableId];
        if (!element) return `[Tabelle ${tableId} nicht konfiguriert]`;
        return `**${element.referenceLabel || 'Tabelle X'}**`;
    }

    function _fFig(figId, section = _data.currentSectionId) {
        const element = _config.publicationElements[section]?.[figId];
        if (!element) return `[Abbildung ${figId} nicht konfiguriert]`;
        return `**${element.referenceLabel || 'Abbildung Y'}**`;
    }
    
    function _getMetricName(metricKey) {
        return _tooltipContent.statMetrics[metricKey]?.name?.[_lang] || _tooltipContent.statMetrics[metricKey]?.name?.['de'] || metricKey;
    }
    
    function _formatBFDefinition(bfDef, lang) {
        if (!bfDef || !bfDef.criteria) return lang === 'en' ? "N/A" : "N/V";
        return studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, lang) || (lang === 'en' ? "N/A" : "N/V");
    }

    function _generateMethodenStudienanlageText() {
        const appVersion = _appConfig.APP_VERSION;
        const ethicsVote = _appConfig.REFERENCES_FOR_PUBLICATION.ethicsVote;
        const studyPeriod = _appConfig.REFERENCES_FOR_PUBLICATION.lurzSchaefer2025StudyPeriod;
        if (_lang === 'de') {
            return `### Studiendesign und Ethikfreigabe
Diese Studie wurde als retrospektive Analyse prospektiv akquirierter Daten einer monozentrischen Kohorte konzipiert. Die Durchführung erfolgte in Übereinstimmung mit der Deklaration von Helsinki und wurde von der zuständigen Ethikkommission genehmigt (${ethicsVote}). Alle Patienten gaben ihr schriftliches Einverständnis zur Verwendung ihrer anonymisierten Daten für Forschungszwecke. Die Datenerhebung und -analyse erfolgte im Zeitraum zwischen ${studyPeriod}. Für die statistische Auswertung und die Erstellung von Teilen dieses Manuskripts wurde die Web-Applikation "${_appConfig.APP_NAME}" Version ${appVersion} verwendet.
`;
        } else {
            return `### Study Design and Ethical Approval
This study was designed as a retrospective analysis of prospectively acquired data from a single-center cohort. The study was conducted in accordance with the Declaration of Helsinki and was approved by the responsible ethics committee (${ethicsVote}). All patients provided written informed consent for the use of their anonymized data for research purposes. Data collection and analysis were performed between ${studyPeriod}. The web application "${_appConfig.APP_NAME}" version ${appVersion} was used for statistical analysis and the generation of parts of this manuscript.
`;
        }
    }

    function _generateMethodenPatientenkollektivText() {
        const gesamtN = _data.allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const direktOP_N = _data.allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nRCT_N = _data.allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0;

        if (_lang === 'de') {
            return `### Patientenkollektiv
In diese Studie wurden konsekutiv ${gesamtN} Patienten mit histologisch gesichertem Rektumkarzinom eingeschlossen, die an unserem Zentrum eine Staging-MRT der Beckenregion erhielten. Das Kollektiv unterteilte sich in ${direktOP_N} Patienten, die einer primären Operation zugeführt wurden (Direkt-OP-Gruppe), und ${nRCT_N} Patienten, die eine neoadjuvante Radiochemotherapie (nRCT) erhielten (nRCT-Gruppe). Einschlusskriterien waren das Vorliegen eines primären Rektumkarzinoms und die Durchführung einer kurativ intendierten Operation mit standardisierter pathologischer Aufarbeitung des Resektats. Ausschlusskriterien umfassten palliative Behandlungssituationen, fehlende oder qualitativ unzureichende MRT-Untersuchungen sowie Patienten ohne definitive histopathologische Untersuchung der Lymphknoten. Detaillierte Patientencharakteristika sind in ${_fTab('patientenCharakteristikaTabelle', 'ergebnisse')} dargestellt.
`;
        } else {
            return `### Patient Cohort
This study consecutively included ${gesamtN} patients with histologically confirmed rectal cancer who underwent pelvic staging MRI at our center. The cohort was divided into ${direktOP_N} patients who underwent primary surgery (upfront surgery group) and ${nRCT_N} patients who received neoadjuvant chemoradiotherapy (nCRT) (nCRT group). Inclusion criteria were the presence of primary rectal cancer and curative-intent surgery with standardized pathological examination of the resected specimen. Exclusion criteria comprised palliative treatment situations, missing or qualitatively inadequate MRI examinations, and patients without definitive histopathological lymph node assessment. Detailed patient characteristics are presented in ${_fTab('patientenCharakteristikaTabelle', 'ergebnisse')}.
`;
        }
    }

    function _generateMethodenMRTProtokollText() {
        const mrtSystem = _appConfig.REFERENCES_FOR_PUBLICATION.lurzSchaefer2025MRISystem;
        const kontrastmittel = _appConfig.REFERENCES_FOR_PUBLICATION.lurzSchaefer2025ContrastAgent;
        const schichtdicke = _appConfig.REFERENCES_FOR_PUBLICATION.lurzSchaefer2025T2SliceThickness;

        if (_lang === 'de') {
            return `### MRT-Protokoll und Bildakquisition
Alle MRT-Untersuchungen wurden auf einem ${mrtSystem} durchgeführt. Das Standardprotokoll umfasste hochauflösende T2-gewichtete Sequenzen (T2w) in sagittaler, axialer und koronarer Orientierung zur Beurteilung des Primärtumors und der mesorektalen Lymphknoten. Die Schichtdicke der T2w-Sequenzen betrug typischerweise ${schichtdicke}. Zusätzlich wurden axiale diffusionsgewichtete Sequenzen (DWI) akquiriert. Nach intravenöser Gabe von ${kontrastmittel} (0,1 mmol/kg Körpergewicht) erfolgte eine dynamische T1-gewichtete fettgesättigte Sequenz (z.B. VIBE/DIXON) in axialer Orientierung. Eine beispielhafte Darstellung wichtiger Sequenzen findet sich in ${_fFig('abbildungMRTProtokollBeispiel', 'methoden')}.
`;
        } else {
            return `### MRI Protocol and Image Acquisition
All MRI examinations were performed on a ${mrtSystem}. The standard protocol included high-resolution T2-weighted sequences (T2w) in sagittal, axial, and coronal orientations for the assessment of the primary tumor and mesorectal lymph nodes. The slice thickness of the T2w sequences was typically ${schichtdicke}. Additionally, axial diffusion-weighted imaging (DWI) sequences were acquired. After intravenous administration of ${kontrastmittel} (0.1 mmol/kg body weight), a dynamic T1-weighted fat-saturated sequence (e.g., VIBE/DIXON) was performed in the axial orientation. An exemplary display of key sequences is provided in ${_fFig('abbildungMRTProtokollBeispiel', 'methoden')}.
`;
        }
    }

    function _generateMethodenASDefinitionText() {
        const lurzRef = _fRef('lurzSchaefer2025');
        const figASRef = _fFig('abbildungAvocadoSignBeispiel', 'methoden');
        const radiologenExp = _appConfig.REFERENCES_FOR_PUBLICATION.lurzSchaefer2025RadiologistExperience;

        if (_lang === 'de') {
            return `### Definition und Bewertung des Avocado Signs (AS)
Das Avocado Sign (AS) wurde auf den kontrastmittelverstärkten T1-gewichteten fettgesättigten Sequenzen evaluiert, wie ursprünglich von Lurz und Schäfer beschrieben ${lurzRef}. Es ist definiert als ein Lymphknoten mit einem klar abgrenzbaren, zentralen hypointensen Kern, der von einem homogen hyperintensen Randsaum umgeben ist, unabhängig von Größe oder Form des Lymphknotens ${figASRef}. Ein Patient wurde als AS-positiv (AS+) bewertet, wenn mindestens ein Lymphknoten im Mesorektum dieses Erscheinungsbild zeigte. Die Bildanalyse erfolgte geblindet bezüglich des pathologischen N-Status durch zwei Radiologen (mit ${radiologenExp[0]} und ${radiologenExp[1]} Jahren Erfahrung in der Befundung von Rektumkarzinom-MRTs). Bei diskordanten Fällen wurde ein Konsensus durch einen dritten, erfahreneren Radiologen (mit ${radiologenExp[2]} Jahren Erfahrung) erzielt.
`;
        } else {
            return `### Definition and Assessment of the Avocado Sign (AS)
The Avocado Sign (AS) was evaluated on contrast-enhanced T1-weighted fat-saturated sequences, as originally described by Lurz and Schäfer ${lurzRef}. It is defined as a lymph node with a clearly demarcated, central hypointense core surrounded by a homogeneously hyperintense rim, regardless of the lymph node's size or shape ${figASRef}. A patient was rated AS-positive (AS+) if at least one lymph node in the mesorectum exhibited this appearance. Image analysis was performed blinded to the pathological N-status by two radiologists (with ${radiologenExp[0]} and ${radiologenExp[1]} years of experience in interpreting rectal cancer MRIs). In discordant cases, consensus was reached by a third, more experienced radiologist (with ${radiologenExp[2]} years of experience).
`;
        }
    }

    function _generateMethodenT2DefinitionText() {
        let textDe = `### Definition und Bewertung von T2-Kriterien\n`;
        let textEn = `### Definition and Assessment of T2 Criteria\n`;
        const tabLitKritRef = _fTab('literaturT2KriterienTabelle', 'methoden');

        textDe += `Zusätzlich zum AS wurden verschiedene Sätze von T2-basierten morphologischen Kriterien zur Lymphknotenbewertung herangezogen und mit dem AS verglichen:\n\n`;
        textEn += `In addition to the AS, various sets of T2-based morphological criteria for lymph node assessment were used and compared with the AS:\n\n`;

        textDe += `1.  **Literatur-basierte T2-Kriterien:** Drei etablierte Kriteriensets wurden implementiert und auf die entsprechenden Kollektive angewendet, wie in ${_fRef('koh2008')}, ${_fRef('barbaro2024')} und den ESGAR-Konsensus-Empfehlungen (evaluiert durch ${_fRef('rutegard2025')}) beschrieben. Eine detaillierte Übersicht dieser Kriterien findet sich in ${tabLitKritRef}.\n`;
        textEn += `1.  **Literature-based T2 Criteria:** Three established criteria sets were implemented and applied to the respective cohorts, as described by ${_fRef('koh2008')}, ${_fRef('barbaro2024')}, and the ESGAR consensus recommendations (evaluated by ${_fRef('rutegard2025')}). A detailed overview of these criteria is provided in ${tabLitKritRef}.\n`;

        textDe += `2.  **Daten-optimierte T2-Kriterien (Brute-Force):** Um die bestmögliche Performance T2-basierter Kriterien in unserem Kollektiv zu ermitteln, wurde ein Brute-Force-Optimierungsansatz verwendet. Hierbei wurden systematisch alle sinnvollen Kombinationen von fünf etablierten T2-Lymphknotenmerkmalen (Größe [Kurzachse, Schwellenwerte von ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} mm bis ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm in ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm Schritten], Form [${APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES.join(', ')}], Kontur [${APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES.join(', ')}], Homogenität [${APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES.join(', ')}] und Signalintensität [${APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES.join(', ')}]) sowie deren logische Verknüpfung (UND/ODER) getestet. Die Optimierung erfolgte separat für das Gesamtkollektiv sowie für die Direkt-OP- und nRCT-Subgruppen. Ziel war es, die Kombination zu identifizieren, welche die im Ergebnisteil spezifizierte diagnostische Metrik (z.B. "${_data.currentBruteForceMetric}") maximiert.\n`;
        textEn += `2.  **Data-optimized T2 Criteria (Brute-Force):** To determine the best possible performance of T2-based criteria in our cohort, a brute-force optimization approach was employed. This involved systematically testing all meaningful combinations of five established T2 lymph node features (size [short axis, thresholds from ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} mm to ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm in ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm increments], shape [${APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES.join(', ')}], border [${APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES.join(', ')}], homogeneity [${APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES.join(', ')}], and signal intensity [${APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES.join(', ')}]) and their logical conjunction (AND/OR). Optimization was performed separately for the overall cohort and the upfront surgery and nCRT subgroups. The aim was to identify the combination that maximizes the diagnostic metric specified in the results section (e.g., "${_data.currentBruteForceMetric}").\n`;
        
        textDe += `Ein Patient wurde als T2-positiv (T2+) für ein gegebenes Kriterienset bewertet, wenn mindestens ein Lymphknoten im Mesorektum die Kriterien dieses Sets erfüllte.\n`;
        textEn += `A patient was rated T2-positive (T2+) for a given criteria set if at least one lymph node in the mesorectum met the criteria of that set.\n`;

        return _lang === 'de' ? textDe : textEn;
    }

    function _generateMethodenReferenzstandardText() {
        if (_lang === 'de') {
            return `### Referenzstandard
Der definitive N-Status wurde durch die histopathologische Untersuchung aller Lymphknoten im Operationspräparat (totale mesorektale Exzision, TME) bestimmt. Die Lymphknoten wurden gemäß den Standardprotokollen aufgearbeitet und klassifiziert.
`;
        } else {
            return `### Reference Standard
The definitive N-status was determined by histopathological examination of all lymph nodes in the surgical specimen (total mesorectal excision, TME). Lymph nodes were processed and classified according to standard protocols.
`;
        }
    }

    function _generateMethodenStatistischeAnalyseText() {
        const alpha = _fVal(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2);
        const appVersion = _appConfig.APP_VERSION;
        const ciMethodProp = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const ciMethodEffect = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;
        const bootstrapReps = _fVal(APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, 0);

        if (_lang === 'de') {
            return `### Statistische Analyse
Zur Beurteilung der diagnostischen Güte wurden Sensitivität, Spezifität, positiver prädiktiver Wert (PPV), negativer prädiktiver Wert (NPV), Accuracy (Gesamtgenauigkeit) und die Balanced Accuracy (äquivalent zur Area Under the Curve [AUC] für binäre Tests) berechnet. Für alle diese Metriken wurden 95%-Konfidenzintervalle (KI) bestimmt; für Proportionen (Sens, Spez, PPV, NPV, Acc) mittels ${ciMethodProp} und für Balanced Accuracy/AUC sowie F1-Score mittels ${ciMethodEffect} (${bootstrapReps} Replikationen).
Der statistische Vergleich der Accuracy zwischen gepaarten Methoden (z.B. AS vs. ein T2-Set am selben Patientenkollektiv) erfolgte mittels McNemar-Test. Der Vergleich von AUC-Werten gepaarter Methoden wurde mit dem DeLong-Test durchgeführt. Für ungepaarte Vergleiche von Raten (z.B. Accuracy zwischen zwei unabhängigen Kollektiven) wurde Fisher's Exact Test verwendet, und für AUC-Vergleiche der Z-Test.
Ein p-Wert < ${alpha} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der Web-Applikation "${_appConfig.APP_NAME}" Version ${appVersion} durchgeführt.
`;
        } else {
            return `### Statistical Analysis
To assess diagnostic performance, sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, and balanced accuracy (equivalent to the Area Under the Curve [AUC] for binary tests) were calculated. For all these metrics, 95% confidence intervals (CI) were determined; for proportions (Sens, Spec, PPV, NPV, Acc) using the ${ciMethodProp} method, and for balanced accuracy/AUC and F1-score using the ${ciMethodEffect} method (${bootstrapReps} replications).
The statistical comparison of accuracy between paired methods (e.g., AS vs. a T2 set on the same patient cohort) was performed using McNemar's test. The comparison of AUC values for paired methods was conducted using DeLong's test. For unpaired comparisons of rates (e.g., accuracy between two independent cohorts), Fisher's exact test was used, and for AUC comparisons, the Z-test was employed.
A p-value < ${alpha} was considered statistically significant. All statistical analyses were performed using the web application "${_appConfig.APP_NAME}" version ${appVersion}.
`;
        }
    }
    
    function _getPerformanceTextForKollektiv(kollektivId, gueteStats, methodeName) {
        const kollektivText = _getKollektivText(kollektivId);
        const sensText = _fCI(gueteStats?.sens, 1, true);
        const spezText = _fCI(gueteStats?.spez, 1, true);
        const ppvText = _fCI(gueteStats?.ppv, 1, true);
        const npvText = _fCI(gueteStats?.npv, 1, true);
        const accText = _fCI(gueteStats?.acc, 1, true);
        const aucText = _fCI(gueteStats?.auc, 3, false);
        
        if (_lang === 'de') {
            return `Für das Kollektiv ${kollektivText} zeigte ${methodeName} eine Sensitivität von ${sensText}, eine Spezifität von ${spezText}, einen PPV von ${ppvText}, einen NPV von ${npvText}, eine Accuracy von ${accText} und eine AUC (Balanced Accuracy) von ${aucText}.`;
        } else {
            return `For the ${kollektivText} cohort, ${methodeName} showed a sensitivity of ${sensText}, a specificity of ${spezText}, a PPV of ${ppvText}, an NPV of ${npvText}, an accuracy of ${accText}, and an AUC (Balanced Accuracy) of ${aucText}.`;
        }
    }

    function _generateErgebnissePatientenCharakteristikaText() {
        const gesamtStats = _data.allKollektivStats.Gesamt?.deskriptiv;
        if (!gesamtStats) return _lang === 'en' ? "Patient characteristic data is unavailable." : "Patientencharakteristika-Daten sind nicht verfügbar.";

        const nGesamt = _fVal(gesamtStats.anzahlPatienten, 0);
        const medianAlter = _fVal(gesamtStats.alter?.median, 1);
        const alterRange = `(${_fVal(gesamtStats.alter?.min, 0)}–${_fVal(gesamtStats.alter?.max, 0)})`;
        const nMaennlich = _fVal(gesamtStats.geschlecht?.m, 0);
        const pMaennlich = _fVal(gesamtStats.anzahlPatienten > 0 ? (gesamtStats.geschlecht?.m || 0) / gesamtStats.anzahlPatienten * 100 : NaN, 1);
        const nDirektOP = _fVal(gesamtStats.therapie['direkt OP'], 0);
        const pDirektOP = _fVal(gesamtStats.anzahlPatienten > 0 ? (gesamtStats.therapie['direkt OP'] || 0) / gesamtStats.anzahlPatienten * 100 : NaN, 1);
        const nNRCT = _fVal(gesamtStats.therapie.nRCT, 0);
        const pNRCT = _fVal(gesamtStats.anzahlPatienten > 0 ? (gesamtStats.therapie.nRCT || 0) / gesamtStats.anzahlPatienten * 100 : NaN, 1);
        const nPathoPlus = _fVal(gesamtStats.nStatus?.plus, 0);
        const pPathoPlus = _fVal(gesamtStats.anzahlPatienten > 0 ? (gesamtStats.nStatus?.plus || 0) / gesamtStats.anzahlPatienten * 100 : NaN, 1);
        
        const tabRef = _fTab('patientenCharakteristikaTabelle', 'ergebnisse');
        const figAgeRef = _fFig('alterVerteilungChart', 'ergebnisse');
        const figGenderRef = _fFig('geschlechtVerteilungChart', 'ergebnisse');


        if (_lang === 'de') {
            return `### Patientencharakteristika
Insgesamt wurden ${nGesamt} Patienten in die Analyse eingeschlossen. Das mediane Alter betrug ${medianAlter} Jahre ${alterRange}. ${nMaennlich} (${pMaennlich}%) Patienten waren männlich. ${nDirektOP} (${pDirektOP}%) Patienten erhielten eine primäre Operation, während ${nNRCT} (${pNRCT}%) Patienten neoadjuvant radiochemotherapeutisch vorbehandelt wurden. Pathologisch positive Lymphknoten (N+) wurden bei ${nPathoPlus} (${pPathoPlus}%) Patienten nachgewiesen. Eine detaillierte Aufschlüsselung der Patientencharakteristika, inklusive der Verteilungen für die Subgruppen, findet sich in ${tabRef}. Die Alters- und Geschlechterverteilung für das Gesamtkollektiv ist in ${figAgeRef} und ${figGenderRef} dargestellt.
`;
        } else {
            return `### Patient Characteristics
A total of ${nGesamt} patients were included in the analysis. The median age was ${medianAlter} years ${alterRange}. ${nMaennlich} (${pMaennlich}%) patients were male. ${nDirektOP} (${pDirektOP}%) patients underwent upfront surgery, while ${nNRCT} (${pNRCT}%) patients received neoadjuvant chemoradiotherapy. Pathologically positive lymph nodes (N+) were detected in ${nPathoPlus} (${pPathoPlus}%) patients. A detailed breakdown of patient characteristics, including distributions for the subgroups, is provided in ${tabRef}. The age and gender distributions for the overall cohort are depicted in ${figAgeRef} and ${figGenderRef}.
`;
        }
    }

    function _generateErgebnisseASPerformanceText() {
        let text = _lang === 'de' ? `### Diagnostische Güte des Avocado Signs\n` : `### Diagnostic Performance of the Avocado Sign\n`;
        const tabASRef = _fTab('diagnostischeGueteASTabelle', 'ergebnisse');

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kollektivId => {
            const gueteAS = _data.allKollektivStats[kollektivId]?.gueteAS;
            if (gueteAS && gueteAS.matrix.rp !== undefined) { // Check if data exists
                 text += _getPerformanceTextForKollektiv(kollektivId, gueteAS, _lang === 'de' ? "das Avocado Sign (AS)" : "the Avocado Sign (AS)") + " ";
            } else {
                text += (_lang === 'de' ? `Für das Kollektiv ${_getKollektivText(kollektivId)} waren keine ausreichenden Daten zur Berechnung der AS-Performance vorhanden. ` : `For the ${_getKollektivText(kollektivId)} cohort, sufficient data to calculate AS performance were not available. `);
            }
        });
        text += (_lang === 'de' ? `Die detaillierten Werte sind in ${tabASRef} zusammengefasst.` : `Detailed values are summarized in ${tabASRef}.`);
        return text + '\n';
    }
    
    function _generateErgebnisseLiteraturT2PerformanceText() {
        let text = _lang === 'de' ? `### Diagnostische Güte der Literatur-basierten T2-Kriterien\n` : `### Diagnostic Performance of Literature-Based T2 Criteria\n`;
        const tabLitRef = _fTab('diagnostischeGueteLiteraturT2Tabelle', 'ergebnisse');

        _config.literatureCriteriaSets.forEach(litSetConf => {
            const setName = litSetConf.nameKey;
            let perfFound = false;
             _data.allKollektivStats.Gesamt.gueteT2_literatur[litSetConf.id] // Check if it exists at all
            
            let specificKollektiv = 'Gesamt';
            const studySetInfo = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id);
            if (studySetInfo && studySetInfo.applicableKollektiv && studySetInfo.applicableKollektiv !== 'Gesamt') {
                specificKollektiv = studySetInfo.applicableKollektiv;
            }
            
            const gueteLitT2 = _data.allKollektivStats[specificKollektiv]?.gueteT2_literatur?.[litSetConf.id];

            if (gueteLitT2 && gueteLitT2.matrix && gueteLitT2.matrix.rp !== undefined) {
                text += _getPerformanceTextForKollektiv(specificKollektiv, gueteLitT2, `die Kriterien nach ${setName}`) + " ";
                perfFound = true;
            }
            
            if (!perfFound) {
                 text += (_lang === 'de' ? `Für die Kriterien nach ${setName} (evaluiert auf Kollektiv ${_getKollektivText(specificKollektiv)}) waren keine ausreichenden Daten zur Berechnung der Performance vorhanden. ` : `For the ${setName} criteria (evaluated on the ${_getKollektivText(specificKollektiv)} cohort), sufficient data to calculate performance were not available. `);
            }
        });
        text += (_lang === 'de' ? `Eine Zusammenfassung dieser Ergebnisse findet sich in ${tabLitRef}.` : `A summary of these results can be found in ${tabLitRef}.`);
        return text + '\n';
    }

    function _generateErgebnisseOptimierteT2PerformanceText() {
        let text = _lang === 'de' ? `### Diagnostische Güte der Brute-Force optimierten T2-Kriterien\n` : `### Diagnostic Performance of Brute-Force Optimized T2 Criteria\n`;
        const tabBFRef = _fTab('diagnostischeGueteOptimierteT2Tabelle', 'ergebnisse');
        const bfMetricName = _data.currentBruteForceMetric;
        
        text += (_lang === 'de' ? `Die T2-Kriterien wurden mittels Brute-Force-Algorithmus für die Zielmetrik "${bfMetricName}" optimiert. ` : `The T2 criteria were optimized using a brute-force algorithm for the target metric "${bfMetricName}". `);

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kollektivId => {
            const bfDef = _data.allKollektivStats[kollektivId]?.bruteforce_definition_publication;
            const gueteBFT2 = _data.allKollektivStats[kollektivId]?.gueteT2_bruteforce_publication;
            const kollektivText = _getKollektivText(kollektivId, false);

            if (bfDef && gueteBFT2 && gueteBFT2.matrix.rp !== undefined) {
                const bfDefFormatted = _formatBFDefinition(bfDef, _lang);
                const methodeName = _lang === 'de' ? `das optimierte T2-Set (${bfDefFormatted})` : `the optimized T2 set (${bfDefFormatted})`;
                text += _getPerformanceTextForKollektiv(kollektivId, gueteBFT2, methodeName) + " ";
            } else {
                 text += (_lang === 'de' ? `Für das Kollektiv ${kollektivText} konnte kein optimiertes T2-Set für die Metrik "${bfMetricName}" bestimmt oder dessen Performance nicht berechnet werden. ` : `For the ${kollektivText} cohort, an optimized T2 set for the metric "${bfMetricName}" could not be determined or its performance could not be calculated. `);
            }
        });
        text += (_lang === 'de' ? `Die detaillierten Werte für die auf "${bfMetricName}" optimierten Kriterien sind in ${tabBFRef} dargestellt.` : `Detailed values for the criteria optimized for "${bfMetricName}" are presented in ${tabBFRef}.`);
        return text + '\n';
    }
    
    function _generateErgebnisseVergleichPerformanceText() {
        let text = _lang === 'de' ? `### Statistischer Vergleich der diagnostischen Güte\n` : `### Statistical Comparison of Diagnostic Performance\n`;
        const tabVergleichRef = _fTab('statistischerVergleichAST2Tabelle', 'ergebnisse');
        const figVergleichGesamtRef = _fFig('vergleichPerformanceChartGesamt', 'ergebnisse');
        const figVergleichDirektOPRef = _fFig('vergleichPerformanceChartDirektOP', 'ergebnisse');
        const figVergleichNRCTRef = _fFig('vergleichPerformanceChartNRCT', 'ergebnisse');
        const figVergleichDetailRef = _fFig('performanceVergleichDetailChart', 'ergebnisse');
        const tabKonfusionsRef = _fTab('konfusionsmatrizenVergleichTabelle', 'ergebnisse');

        text += _lang === 'de' ? `Die diagnostische Leistung des Avocado Signs wurde mit den Literatur-basierten und den Brute-Force optimierten T2-Kriterien verglichen. ` : `The diagnostic performance of the Avocado Sign was compared with literature-based and brute-force optimized T2 criteria. `;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kollektivId => {
            const stats = _data.allKollektivStats[kollektivId];
            if (!stats) return;
            const kollektivText = _getKollektivText(kollektivId, false);
            text += _lang === 'de' ? `\nIm ${kollektivText}-Kollektiv: ` : `\nIn the ${kollektivText} cohort: `;
            let comparisonsMade = 0;

            // AS vs. Literatur (ESGAR als Beispiel)
            const esgarId = 'rutegard_et_al_esgar';
            const vergleichLit = stats[`vergleichASvsT2_literatur_${esgarId}`];
            const gueteLit = stats.gueteT2_literatur?.[esgarId];
            if (vergleichLit && gueteLit && gueteLit.matrix.rp !== undefined) { // Ensure Lit-Set was applicable and had results
                const pMcN = _fPVal(vergleichLit.mcnemar?.pValue);
                const pDeL = _fPVal(vergleichLit.delong?.pValue);
                const aucDiff = _fVal(vergleichLit.delong?.diffAUC, 3);
                if (_lang === 'de') {
                    text += `Im Vergleich zu den ESGAR 2016 Kriterien zeigte AS ${_dataHelperGetComparisonText(vergleichLit, 'AS', 'ESGAR 2016')}. (McNemar p=${pMcN}; DeLong p=${pDeL} für AUC-Differenz von ${aucDiff}). `;
                } else {
                    text += `Compared to the ESGAR 2016 criteria, AS showed ${_dataHelperGetComparisonText(vergleichLit, 'AS', 'ESGAR 2016')}. (McNemar p=${pMcN}; DeLong p=${pDeL} for AUC difference of ${aucDiff}). `;
                }
                comparisonsMade++;
            }
            
            // AS vs. BF-optimiert
            const vergleichBF = stats.vergleichASvsT2_bruteforce_publication;
            const bfDef = stats.bruteforce_definition_publication;
            if (vergleichBF && bfDef) {
                const pMcN_BF = _fPVal(vergleichBF.mcnemar?.pValue);
                const pDeL_BF = _fPVal(vergleichBF.delong?.pValue);
                const aucDiff_BF = _fVal(vergleichBF.delong?.diffAUC, 3);
                const bfMetricName = bfDef.metricName;
                 if (_lang === 'de') {
                    text += `Gegenüber dem für "${bfMetricName}" optimierten T2-Set zeigte AS ${_dataHelperGetComparisonText(vergleichBF, 'AS', 'BF-T2')}. (McNemar p=${pMcN_BF}; DeLong p=${pDeL_BF} für AUC-Differenz von ${aucDiff_BF}). `;
                } else {
                    text += `Compared to the T2 set optimized for "${bfMetricName}", AS showed ${_dataHelperGetComparisonText(vergleichBF, 'AS', 'BF-T2')}. (McNemar p=${pMcN_BF}; DeLong p=${pDeL_BF} for AUC difference of ${aucDiff_BF}). `;
                }
                comparisonsMade++;
            }
             if (comparisonsMade === 0) {
                text += _lang === 'de' ? `Es konnten keine direkten Vergleiche für dieses Kollektiv berechnet werden. ` : `No direct comparisons could be calculated for this cohort. `;
            }
        });

        text += (_lang === 'de' ? `\nAlle detaillierten Vergleichstests sind in ${tabVergleichRef} aufgeführt. Exemplarische Konfusionsmatrizen finden sich in ${tabKonfusionsRef}. Die vergleichende Performance über die Kollektive ist in ${figVergleichGesamtRef}-${figVergleichNRCTRef} und ${figVergleichDetailRef} visualisiert.` : `\nAll detailed comparison tests are listed in ${tabVergleichRef}. Exemplary confusion matrices can be found in ${tabKonfusionsRef}. The comparative performance across cohorts is visualized in ${figVergleichGesamtRef}-${figVergleichNRCTRef} and ${figVergleichDetailRef}.`);
        return text + '\n';
    }
    
    function _dataHelperGetComparisonText(vergleichStats, name1, name2) {
        // Simple helper to generate a phrase based on p-values. More nuanced text could be added.
        const pDelong = vergleichStats?.delong?.pValue;
        const pMcNemar = vergleichStats?.mcnemar?.pValue;
        const aucDiff = vergleichStats?.delong?.diffAUC;
        const alpha = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
        let text = "";

        if (pDelong !== null && pDelong !== undefined && !isNaN(pDelong)) {
            if (pDelong < alpha) {
                text += _lang === 'de' ? `eine signifikant ${aucDiff > 0 ? 'höhere' : 'niedrigere'} AUC` : `a significantly ${aucDiff > 0 ? 'higher' : 'lower'} AUC`;
            } else {
                text += _lang === 'de' ? `keinen signifikanten Unterschied in der AUC` : `no significant difference in AUC`;
            }
        } else {
             text += _lang === 'de' ? `keinen berechenbaren AUC-Unterschied` : `no calculable AUC difference`;
        }
        
        text += (_lang === 'de' ? " und " : " and ");

        if (pMcNemar !== null && pMcNemar !== undefined && !isNaN(pMcNemar)) {
            if (pMcNemar < alpha) {
                 text += _lang === 'de' ? `eine signifikant unterschiedliche Accuracy (basierend auf diskordanten Paaren)` : `a significantly different accuracy (based on discordant pairs)`;
            } else {
                text += _lang === 'de' ? `keinen signifikanten Unterschied in der Accuracy (basierend auf diskordanten Paaren)` : `no significant difference in accuracy (based on discordant pairs)`;
            }
        } else {
             text += _lang === 'de' ? `keinen berechenbaren Accuracy-Unterschied (McNemar)` : `no calculable accuracy difference (McNemar)`;
        }
        return text;
    }
    
    function _generateReferenzenText() {
        let text = _lang === 'de' ? `## Referenzen\n\n` : `## References\n\n`;
        const refs = _appConfig.REFERENCES_FOR_PUBLICATION;
        const refOrder = ['lurzSchaefer2025', 'koh2008', 'barbaro2024', 'rutegard2025', 'beetsTan2018ESGAR', 'ethicsVote'];

        refOrder.forEach((key, index) => {
            if (refs[key]) {
                text += `(${index + 1}) ${refs[key]}\n`;
            }
        });
        return text;
    }


    function generateSectionText(publicationData) {
        _data = publicationData;
        _lang = publicationData.currentLang;
        _uiTexts = getUITexts(); // Ensure this is called to get language-specific UI texts
        _statTexts = _uiTexts.statMetrics;
        _tooltipContent = _uiTexts.TOOLTIP_CONTENT;
        _bfMetric = publicationData.currentBruteForceMetric;
        _config = publicationData.config;
        _appConfig = publicationData.appConfig;

        const sectionId = publicationData.currentSectionId;
        const subSectionId = publicationData.currentSubSectionId; // Assuming this will be passed or derived

        let content = '';
        const sectionConfig = _config.sections.find(s => s.id === sectionId);
        if (!sectionConfig) return `<p class="text-danger">Konfiguration für Sektion "${sectionId}" nicht gefunden.</p>`;

        const generateAllSubsections = () => {
            let allSubSectionText = '';
            sectionConfig.subSections.forEach(sub => {
                const subLabel = _uiTexts.publikationTab.sectionLabels[sub.id]?.[_lang] || sub.label;
                allSubSectionText += `### ${subLabel}\n`;
                switch (sub.id) {
                    case 'methoden_studienanlage': allSubSectionText += _generateMethodenStudienanlageText(); break;
                    case 'methoden_patientenkollektiv': allSubSectionText += _generateMethodenPatientenkollektivText(); break;
                    case 'methoden_mrt_protokoll': allSubSectionText += _generateMethodenMRTProtokollText(); break;
                    case 'methoden_as_definition': allSubSectionText += _generateMethodenASDefinitionText(); break;
                    case 'methoden_t2_definition': allSubSectionText += _generateMethodenT2DefinitionText(); break;
                    case 'methoden_referenzstandard': allSubSectionText += _generateMethodenReferenzstandardText(); break;
                    case 'methoden_statistische_analyse': allSubSectionText += _generateMethodenStatistischeAnalyseText(); break;
                    case 'ergebnisse_patientencharakteristika': allSubSectionText += _generateErgebnissePatientenCharakteristikaText(); break;
                    case 'ergebnisse_as_performance': allSubSectionText += _generateErgebnisseASPerformanceText(); break;
                    case 'ergebnisse_literatur_t2_performance': allSubSectionText += _generateErgebnisseLiteraturT2PerformanceText(); break;
                    case 'ergebnisse_optimierte_t2_performance': allSubSectionText += _generateErgebnisseOptimierteT2PerformanceText(); break;
                    case 'ergebnisse_vergleich_performance': allSubSectionText += _generateErgebnisseVergleichPerformanceText(); break;
                    // case 'referenzen': allSubSectionText += _generateReferenzenText(); break; // If referenzen is a main section
                    default: allSubSectionText += `<p class="text-muted">${_lang === 'de' ? 'Inhalt für diese Untersektion wird noch generiert.' : 'Content for this subsection is pending.'}</p>\n`;
                }
                allSubSectionText += '\n';
            });
            return allSubSectionText;
        };
        
        if (sectionId === 'referenzen_list_only') { // Special key for only list
            return _generateReferenzenText();
        }


        content = `## ${(_uiTexts.publikationTab.sectionLabels[sectionConfig.labelKey] || sectionConfig.labelKey)}\n\n`;
        content += (_uiTexts.publikationTab.textGenerierungsHinweis || (_lang === 'de' ? 'Die folgenden Texte wurden automatisch generiert und dienen als Entwurf. Bitte überprüfen und adaptieren Sie diese sorgfältig für Ihre Publikation.' : 'The following texts were automatically generated and serve as a draft. Please review and adapt them carefully for your publication.')) + "\n\n";
        content += generateAllSubsections();
        
        if (sectionId === 'ergebnisse' || sectionId === 'methoden'){
             content += `\n\n---\n` + _generateReferenzenText(); // Append references to both main sections for now
        }


        return content;
    }

    return Object.freeze({
        generateSectionText
    });

})();
