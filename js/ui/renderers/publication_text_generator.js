const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de', noCiTextPlaceholderKey = 'noCIData') {
        const currentLangUiTexts = getUiTexts(lang);
        const naString = currentLangUiTexts.misc?.notAvailable || (lang === 'en' ? 'N/A' : 'N/V');
        const ciLabel = currentLangUiTexts.misc?.ciLabel || (lang === 'de' ? '95% KI' : '95% CI');
        const noCiText = currentLangUiTexts.misc?.[noCiTextPlaceholderKey] || (lang === 'en' ? '(No CI data)' : '(Keine CI-Daten)');


        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return naString;

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val)) return naString;
            if (isP) {
                return formatPercent(val, d, '--%', lang);
            } else {
                return formatNumber(val, d, naString, false, lang);
            }
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent);

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent);
            if (lowerStr === naString || upperStr === naString) return `${valStr} (${noCiText})`;
            return `${valStr} (${ciLabel}: ${lowerStr} – ${upperStr})`;
        }
        return valStr + (metric.ci === null || metric.ci === undefined ? ` ${noCiText}` : '');
    }

    function _getLangSnippets(lang, sectionKey) {
        const langUiTexts = getUiTexts(lang);
        const baseSnippets = langUiTexts.publicationTextGeneratorSnippets || {};
        return baseSnippets[sectionKey] || {};
    }

    function getMethodenStudienanlageText(lang, commonData) {
        const langSnippets = _getLangSnippets(lang, 'methodenStudienanlage');
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const appName = commonData.appName || APP_CONFIG.APP_NAME;
        const studyReference = commonData.references?.lurzSchaefer2025 || (lang === 'en' ? "Lurz & Schäfer (2025)" : "Lurz & Schäfer (2025)");
        const ethicsVote = commonData.ethicsVote || (lang === 'en' ? "Ethics vote No. XYZ/2020, St. Georg Hospital, Leipzig" : "Ethikvotum Nr. XYZ/2020, Klinikum St. Georg, Leipzig");

        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenStudienanlage not found in ${lang} texts.`)
                .replace('{STUDY_REFERENCE}', studyReference)}</p>
            <p>${(langSnippets.p2 || `Error: Snippet 'p2' for methodenStudienanlage not found in ${lang} texts.`)
                .replace('{APP_VERSION}', appVersion)
                .replace('{APP_NAME}', appName)
                .replace('{ETHICS_VOTE}', ethicsVote)}</p>
        `;
    }

    function getMethodenPatientenkollektivText(lang, allKollektivStats, commonData) {
        const langSnippets = _getLangSnippets(lang, 'methodenPatientenkollektiv');
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false, lang);
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false, lang);
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false, lang);
        const alterRangeText = (langSnippets.alterRangeText || (lang === 'en' ? `range: {ALTER_MIN}–{ALTER_MAX}` : `Range: {ALTER_MIN}–{ALTER_MAX}`))
            .replace('{ALTER_MIN}', alterMin)
            .replace('{ALTER_MAX}', alterMax);
        const anteilMaennerProzent = formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0, '--%', lang);
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const jahreLabel = langSnippets.jahreLabel || (lang === 'en' ? 'years' : 'Jahre');
        const tabelle1Ref = langSnippets.tabelle1Ref || (lang === 'en' ? 'Table 1' : 'Tabelle 1');


        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenPatientenkollektiv not found in ${lang} texts.`)
                .replace('{ANZAHL_GESAMT}', anzahlGesamt)
                .replace('{JAHR_START}', commonData.studienzeitraum?.start || '2020')
                .replace('{JAHR_ENDE}', commonData.studienzeitraum?.ende || '2023')
                .replace('{STUDIENORT}', commonData.studienort || (lang === 'en' ? 'St. Georg Hospital, Leipzig' : 'Klinikum St. Georg, Leipzig'))
                .replace('{ANZAHL_NRCT}', anzahlNRCT)
                .replace('{ANZAHL_DIREKT_OP}', anzahlDirektOP)
                .replace('{ALTER_MEDIAN}', alterMedian)
                .replace('{ALTER_RANGE_TEXT}', alterRangeText)
                .replace('{JAHRE_LABEL}', jahreLabel)
                .replace('{ANTEIL_MAENNER_PROZENT}', anteilMaennerProzent)
                .replace('{ANZAHL_MAENNER}', anzahlMaenner)
                .replace('{ANZAHL_PATIENTEN_CHAR}', anzahlPatientenChar)
                .replace('{TABELLE_1_REF}', tabelle1Ref)}
            </p>
            <p>${(langSnippets.p2 || `Error: Snippet 'p2' for methodenPatientenkollektiv not found in ${lang} texts.`)}</p>
        `;
    }

    function getMethodenMRTProtokollText(lang, commonData) {
        const langSnippets = _getLangSnippets(lang, 'methodenMRTProtokoll');
        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenMRTProtokoll not found in ${lang} texts.`)
                .replace('{MRT_SYSTEM}', commonData.mrtSystem || (lang === 'en' ? '3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany)' : '3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)'))
                .replace('{SPULEN_INFO}', commonData.mrtSpulen || (lang === 'en' ? 'body and spine array coils' : 'Körper- und Wirbelsäulen-Array-Spulen'))
                .replace('{T2_SEQUENZ_DETAILS}', commonData.t2SequenzDetails || (lang === 'en' ? 'high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness 2-3 mm)' : 'hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke 2-3 mm)'))
                .replace('{DWI_INFO}', commonData.dwiInfo || (lang === 'en' ? 'an axial diffusion-weighted sequence (DWI)' : 'eine axiale diffusionsgewichtete Sequenz (DWI)'))
                .replace('{T1KM_SEQUENZ_DETAILS}', commonData.t1kmSequenzDetails || (lang === 'en' ? 'a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold sequence (VIBE) with Dixon fat suppression' : 'eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung'))}
            </p>
            <p>${(langSnippets.p2 || `Error: Snippet 'p2' for methodenMRTProtokoll not found in ${lang} texts.`)
                .replace('{KONTRASTMITTEL_INFO}', commonData.kontrastmittelInfo || (lang === 'en' ? 'A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco, Milan, Italy)' : 'Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco, Mailand, Italien)'))
                .replace('{KONTRASTMITTEL_DOSIERUNG}', commonData.kontrastmittelDosierung || (lang === 'en' ? '0.2 mL/kg body weight' : '0,2 ml/kg Körpergewicht'))
                .replace('{BUSCOPAN_INFO}', commonData.buscopanInfo || (lang === 'en' ? 'Butylscopolamine (Buscopan®; Sanofi, Paris, France)' : 'Butylscopolamin (Buscopan®; Sanofi, Paris, Frankreich)'))}
            </p>
        `;
    }

    function getMethodenASDefinitionText(lang, commonData) {
        const langSnippets = _getLangSnippets(lang, 'methodenASDefinition');
        const asReference = commonData.references?.lurzSchaefer2025 || (lang === 'en' ? "Lurz & Schäfer (2025)" : "Lurz & Schäfer (2025)");
        const radiologenInfo = commonData.radiologenInfoAS || (lang === 'en' ? "the same two radiologists (ML, radiologist with 7 years of experience in abdominal MRI; AOS, radiologist with 29 years of experience in abdominal MRI)" : "denselben zwei Radiologen (ML, Radiologe mit 7 Jahren Erfahrung in der abdominellen MRT; AOS, Radiologe mit 29 Jahren Erfahrung in der abdominellen MRT)");
        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenASDefinition not found in ${lang} texts.`)
                .replace('{AS_REFERENCE}', asReference)
                .replace('{RADIOLOGEN_INFO_AS}', radiologenInfo)}
            </p>
        `;
    }

    function getMethodenT2DefinitionText(lang, commonData, allKollektivStats) {
        const langSnippets = _getLangSnippets(lang, 'methodenT2Definition');
        const pubTabUiTexts = getUiTexts(lang).publikationTab || {};
        const bfMetricUiTexts = pubTabUiTexts.bruteForceMetricLabels || {};

        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);
        const bfZielMetricValue = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const bfZielMetricKey = Object.keys(bfMetricUiTexts).find(key =>
            (PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricValue)?.labelKey) === key
        ) || bfZielMetricValue.replace(/\s/g, '').toLowerCase();
        const bfZielMetricLabel = bfMetricUiTexts[bfZielMetricKey] || bfZielMetricValue;


        const formatBFDefinition = (kollektivId) => {
            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            const kollektivDisplayName = getKollektivDisplayName(kollektivId, lang);
            if (bfDef && bfDef.criteria) {
                let metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', false, lang); // Use locale-specific formatting
                const criteriaFormatted = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                const metricNameKey = Object.keys(bfMetricUiTexts).find(key =>
                    (PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfDef.metricName)?.labelKey) === key
                ) || bfDef.metricName.replace(/\s/g, '').toLowerCase();
                const metricNameLabel = bfMetricUiTexts[metricNameKey] || bfDef.metricName;
                return `<li><strong>${kollektivDisplayName}:</strong> ${criteriaFormatted} (${langSnippets.targetMetricLabel || 'Target Metric'}: ${metricNameLabel}, ${langSnippets.achievedValueLabel || 'Achieved Value'}: ${metricValueStr})</li>`;
            }
            const noResultsText = (langSnippets.noBFOptResults || `No optimization results available or not calculated for target metric '{BF_ZIEL_METRIC_LABEL}'.`).replace('{BF_ZIEL_METRIC_LABEL}', bfZielMetricLabel);
            return `<li><strong>${kollektivDisplayName}:</strong> ${noResultsText}</li>`;
        };

        let bfCriteriaText = '<ul>';
        bfCriteriaText += formatBFDefinition('Gesamt');
        bfCriteriaText += formatBFDefinition('direkt OP');
        bfCriteriaText += formatBFDefinition('nRCT');
        bfCriteriaText += '</ul>';

        const studyNames = getUiTexts(lang).studyNames || {};
        const kohDesc = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.description || (langSnippets.kohDescFallback || (lang === 'en' ? 'Irregular border OR heterogeneous signal' : 'Irreguläre Kontur ODER heterogenes Signal'));
        const kohRef = commonData.references?.koh2008 || "Koh et al. (2008)";
        const barbaroDesc = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.description || (langSnippets.barbaroDescFallback || (lang === 'en' ? 'Short-axis diameter ≥ 2.3mm' : 'Kurzachse ≥ 2,3mm'));
        const barbaroRef = commonData.references?.barbaro2024 || "Barbaro et al. (2024)";
        const esgarDesc = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.description || (langSnippets.esgarDescFallback || (lang === 'en' ? 'Complex size-dependent morphological rules' : 'Komplexe größenabhängige morphologische Regeln'));
        const esgarRef = commonData.references?.rutegard2025 && commonData.references?.beetsTan2018ESGAR ? `${commonData.references.rutegard2025} / ${commonData.references.beetsTan2018ESGAR}` : (lang === 'en' ? "Rutegård et al. (2025) / ESGAR 2016" : "Rutegård et al. (2025) / ESGAR 2016");

        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenT2Definition not found in ${lang} texts.`)
                .replace('{RADIOLOGEN_INFO_T2}', commonData.radiologenInfoT2 || commonData.radiologenInfoAS || (lang === 'en' ? "the same two radiologists (ML, AOS)" : "denselben zwei Radiologen (ML, AOS)"))}
            </p>
            <p>${(langSnippets.p2 || `Error: Snippet 'p2' for methodenT2Definition not found in ${lang} texts.`)}</p>
            <ol>
                <li><strong>${langSnippets.literaturBasiertHeading || (lang === 'en' ? 'Literature-based T2 criteria sets:' : 'Literatur-basierte T2-Kriteriensets:')}</strong> ${(langSnippets.literaturBasiertIntro || (lang === 'en' ? 'A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see Table 2):' : 'Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe Tabelle 2):'))}
                    <ul>
                        <li>${studyNames['koh_2008_morphology_name'] || 'Koh et al.'} (${kohRef}): "${kohDesc}". ${(langSnippets.kohAnwendung || (lang === 'en' ? 'In our analysis, this set was applied to the overall cohort.' : 'Dieses Set wurde in unserer Analyse auf das Gesamtkollektiv angewendet.'))}</li>
                        <li>${studyNames['barbaro_2024_restaging_name'] || 'Barbaro et al.'} (${barbaroRef}): "${barbaroDesc}". ${(langSnippets.barbaroAnwendung || (lang === 'en' ? 'This set was specifically evaluated for the nRCT cohort (restaging).' : 'Dieses Set wurde spezifisch für das nRCT-Kollektiv (Restaging) evaluiert.'))}</li>
                        <li>${studyNames['rutegard_et_al_esgar_name'] || 'ESGAR Consensus Criteria'} (${esgarRef}): "${esgarDesc}". ${(langSnippets.esgarAnwendung || (lang === 'en' ? 'This set was primarily applied to the surgery alone cohort (primary staging).' : 'Dieses Set wurde primär auf das Direkt-OP-Kollektiv (Primärstaging) angewendet.'))}</li>
                    </ul>
                </li>
                <li><strong>${langSnippets.bfOptimiertHeading || (lang === 'en' ? 'Brute-force optimized T2 criteria:' : 'Brute-Force optimierte T2-Kriterien:')}</strong> ${(langSnippets.bfOptimiertIntro || (lang === 'en' ? 'Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>{BF_ZIEL_METRIC_LABEL}</strong> – were identified for each of the three main cohorts (Overall, Surgery Alone, nRCT). The resulting cohort-specific optimized criteria sets were:' : 'Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>{BF_ZIEL_METRIC_LABEL}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:')).replace('{BF_ZIEL_METRIC_LABEL}', bfZielMetricLabel)}
                    ${bfCriteriaText}
                </li>
                <li><strong>${langSnippets.aktuellEingestelltHeading || (lang === 'en' ? 'Currently set T2 criteria in the analysis tool:' : 'Im Analyse-Tool aktuell eingestellte T2-Kriterien:')}</strong> ${(langSnippets.aktuellEingestelltIntro || (lang === 'en' ? 'For exploratory purposes and to demonstrate the flexibility of the analysis tool, user-defined criteria can be configured. For the present publication, the criteria mentioned under points 1 and 2 are authoritative. The criteria currently set in the tool at the time of final analysis were:' : 'Für explorative Zwecke und zur Demonstration der Flexibilität des Analyse-Tools können benutzerdefinierte Kriterien konfiguriert werden. Für die vorliegende Publikation sind die unter Punkt 1 und 2 genannten Kriterien maßgeblich. Die aktuell im Tool eingestellten Kriterien zum Zeitpunkt der finalen Analyse waren:' ))} ${formattedAppliedCriteria}.</li>
            </ol>
            <p>${(langSnippets.p3 || `Error: Snippet 'p3' for methodenT2Definition not found in ${lang} texts.`)}</p>
        `;
    }

    function getMethodenReferenzstandardText(lang, commonData) {
         const langSnippets = _getLangSnippets(lang, 'methodenReferenzstandard');
        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenReferenzstandard not found in ${lang} texts.`)}</p>
        `;
    }

    function getMethodenStatistischeAnalyseText(lang, commonData) {
        const langSnippets = _getLangSnippets(lang, 'methodenStatistischeAnalyse');
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = formatNumber(alphaLevel, 2, '0.05', false, lang); // useStandardFormat false for locale-specific decimal
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const appName = commonData.appName || "Analyse-Tool";
        const appVersion = commonData.appVersion || "";
        const pWertBedingung = (langSnippets.pWertBedingung || (lang === 'en' ? `A p-value < {ALPHA_TEXT}` : `Ein p-Wert < {ALPHA_TEXT}`)).replace('{ALPHA_TEXT}', alphaText);
        const wilsonMethod = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const bootstrapMethod = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;

        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for methodenStatistischeAnalyse not found in ${lang} texts.`)
                .replace('{BOOTSTRAP_N}', bootstrapN)
                .replace('{WILSON_SCORE_METHOD_NAME}', wilsonMethod)
                .replace('{BOOTSTRAP_METHOD_NAME}', bootstrapMethod)}
            </p>
            <p>${(langSnippets.p2 || `Error: Snippet 'p2' for methodenStatistischeAnalyse not found in ${lang} texts.`)
                .replace('{P_WERT_BEDINGUNG}', pWertBedingung)
                .replace('{APP_NAME}', appName)
                .replace('{APP_VERSION}', appVersion)}
            </p>
        `;
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const langSnippets = _getLangSnippets(lang, 'ergebnissePatientencharakteristika');
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, '--%', lang);
        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false, lang);
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false, lang);
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false, lang);
        const alterRangeText = (langSnippets.alterRangeText || (lang === 'en' ? `range ${alterMin}–${alterMax}` : `Range ${alterMin}–${alterMax}`));
        const anteilMaenner = formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0, '--%', lang);
        const jahreLabel = langSnippets.jahreLabel || (lang === 'en' ? 'years' : 'Jahre');
        const abb1aRef = langSnippets.abb1aRef || (lang === 'en' ? 'Figure 1a' : 'Abbildung 1a');
        const abb1bRef = langSnippets.abb1bRef || (lang === 'en' ? 'Figure 1b' : 'Abbildung 1b');
        const tabelle1Ref = langSnippets.tabelle1Ref || (lang === 'en' ? 'Table 1' : 'Tabelle 1');


        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for ergebnissePatientencharakteristika not found in ${lang} texts.`)
                .replace('{ANZAHL_GESAMT}', anzahlGesamt)
                .replace('{TABELLE_1_REF}', tabelle1Ref)
                .replace('{ANZAHL_DIREKT_OP}', anzahlDirektOP)
                .replace('{ANZAHL_NRCT}', anzahlNRCT)
                .replace('{ALTER_MEDIAN}', alterMedian)
                .replace('{JAHRE_LABEL}', jahreLabel)
                .replace('{ALTER_RANGE_TEXT}', alterRangeText)
                .replace('{ANTEIL_MAENNER}', anteilMaenner)
                .replace('{N_PLUS_ANZAHL}', pCharGesamt?.nStatus?.plus || 'N/A')
                .replace('{ANTEIL_N_PLUS_GESAMT}', anteilNplusGesamt)
                .replace('{ABB_1A_REF}', abb1aRef)
                .replace('{ABB_1B_REF}', abb1bRef)}
            </p>
        `;
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const langSnippets = _getLangSnippets(lang, 'ergebnisseASPerformance');
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const tabelle3Ref = langSnippets.tabelle3Ref || (lang === 'en' ? 'Table 3' : 'Tabelle 3');


        return `
            <p>${(langSnippets.p1 || `Error: Snippet 'p1' for ergebnisseASPerformance not found in ${lang} texts.`)
                .replace('{TABELLE_3_REF}', tabelle3Ref)
                .replace('{N_GESAMT}', nGesamt)
                .replace('{SENS_AS_GESAMT}', fCI(asGesamt?.sens, 1, true, lang))
                .replace('{SPEZ_AS_GESAMT}', fCI(asGesamt?.spez, 1, true, lang))
                .replace('{PPV_AS_GESAMT}', fCI(asGesamt?.ppv, 1, true, lang))
                .replace('{NPV_AS_GESAMT}', fCI(asGesamt?.npv, 1, true, lang))
                .replace('{ACC_AS_GESAMT}', fCI(asGesamt?.acc, 1, true, lang))
                .replace('{AUC_AS_GESAMT}', fCI(asGesamt?.auc, 3, false, lang))}
            </p>
            <p>${(langSnippets.p2 || `Error: Snippet 'p2' for ergebnisseASPerformance not found in ${lang} texts.`)
                .replace('{N_DIREKT_OP}', nDirektOP)
                .replace('{SENS_AS_DIREKT_OP}', fCI(asDirektOP?.sens, 1, true, lang))
                .replace('{SPEZ_AS_DIREKT_OP}', fCI(asDirektOP?.spez, 1, true, lang))
                .replace('{AUC_AS_DIREKT_OP}', fCI(asDirektOP?.auc, 3, false, lang))
                .replace('{N_NRCT}', nNRCT)
                .replace('{SENS_AS_NRCT}', fCI(asNRCT?.sens, 1, true, lang))
                .replace('{SPEZ_AS_NRCT}', fCI(asNRCT?.spez, 1, true, lang))
                .replace('{AUC_AS_NRCT}', fCI(asNRCT?.auc, 3, false, lang))}
            </p>
        `;
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const langSnippets = _getLangSnippets(lang, 'ergebnisseLiteraturT2Performance');
        const studyNames = getUiTexts(lang).studyNames || {};
        const kohData = allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];

        const nGesamt = commonData.nGesamt || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const tabelle4Ref = langSnippets.tabelle4Ref ||(lang === 'en' ? 'Table 4' : 'Tabelle 4');
        const kohName = studyNames['koh_2008_morphology_name'] || 'Koh et al. (2008)';
        const barbaroName = studyNames['barbaro_2024_restaging_name'] || 'Barbaro et al. (2024)';
        const esgarName = studyNames['rutegard_et_al_esgar_name'] || 'ESGAR 2016 (Rutegård et al., 2025)';

        let text = `<p>${(langSnippets.intro || `Error: Snippet 'intro' for ergebnisseLiteraturT2Performance not found in ${lang} texts.`).replace('{TABELLE_4_REF}', tabelle4Ref)} `;
        text += `${(langSnippets.kohPerformance || `Error: Snippet 'kohPerformance' for ergebnisseLiteraturT2Performance not found in ${lang} texts.`)
            .replace('{KOH_NAME}', kohName)
            .replace('{N_GESAMT}', nGesamt)
            .replace('{SENS_KOH}', fCI(kohData?.sens, 1, true, lang))
            .replace('{SPEZ_KOH}', fCI(kohData?.spez, 1, true, lang))
            .replace('{AUC_KOH}', fCI(kohData?.auc, 3, false, lang))} `;
        text += `${(langSnippets.barbaroPerformance || `Error: Snippet 'barbaroPerformance' for ergebnisseLiteraturT2Performance not found in ${lang} texts.`)
            .replace('{BARBARO_NAME}', barbaroName)
            .replace('{N_NRCT}', nNRCT)
            .replace('{SENS_BARBARO}', fCI(barbaroData?.sens, 1, true, lang))
            .replace('{SPEZ_BARBARO}', fCI(barbaroData?.spez, 1, true, lang))
            .replace('{AUC_BARBARO}', fCI(barbaroData?.auc, 3, false, lang))} `;
        text += `${(langSnippets.esgarPerformance || `Error: Snippet 'esgarPerformance' for ergebnisseLiteraturT2Performance not found in ${lang} texts.`)
            .replace('{ESGAR_NAME}', esgarName)
            .replace('{N_DIREKT_OP}', nDirektOP)
            .replace('{SENS_ESGAR}', fCI(esgarData?.sens, 1, true, lang))
            .replace('{SPEZ_ESGAR}', fCI(esgarData?.spez, 1, true, lang))
            .replace('{AUC_ESGAR}', fCI(esgarData?.auc, 3, false, lang))}</p>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const langSnippets = _getLangSnippets(lang, 'ergebnisseOptimierteT2Performance');
        const pubTabUiTexts = getUiTexts(lang).publikationTab || {};
        const bfMetricUiTexts = pubTabUiTexts.bruteForceMetricLabels || {};
        const bfZielMetricValue = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const bfZielMetricKey = Object.keys(bfMetricUiTexts).find(key =>
            (PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricValue)?.labelKey) === key
        ) || bfZielMetricValue.replace(/\s/g, '').toLowerCase();
        const bfZielMetricLabel = bfMetricUiTexts[bfZielMetricKey] || bfZielMetricValue;

        const tabelle5Ref = langSnippets.tabelle5Ref || (lang === 'en' ? 'Table 5' : 'Tabelle 5');
        const methodenAbschnittRef = langSnippets.methodenAbschnittRef || (lang === 'en' ? 'Methods section (Section 2.5)' : 'Methodenteil (Abschnitt 2.5)');
        const tabelle2Ref = langSnippets.tabelle2Ref || (lang === 'en' ? 'Table 2' : 'Tabelle 2');


        let text = `<p>${(langSnippets.intro || `Error: Snippet 'intro' for ergebnisseOptimierteT2Performance not found in ${lang} texts.`)
            .replace('{BF_ZIEL_METRIC_LABEL}', bfZielMetricLabel)
            .replace('{METHODEN_ABSCHNITT_REF}', methodenAbschnittRef)
            .replace('{TABELLE_2_REF}', tabelle2Ref)
            .replace('{TABELLE_5_REF}', tabelle5Ref)}</p><ul>`;

        const kollektive = [
            { id: 'Gesamt', n: commonData.nGesamt },
            { id: 'direkt OP', n: commonData.nDirektOP },
            { id: 'nRCT', n: commonData.nNRCT }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const kollektivName = getKollektivDisplayName(k.id, lang);
            const nPat = k.n || 'N/A';
            if (bfStats && bfStats.matrix) {
                text += `<li>${(langSnippets.listItemValid || `Error: Snippet 'listItemValid' for ergebnisseOptimierteT2Performance not found in ${lang} texts.`)
                    .replace('{KOLLEKTIV_NAME}', kollektivName)
                    .replace('{N_PAT}', nPat)
                    .replace('{SENS_BF}', fCI(bfStats?.sens, 1, true, lang))
                    .replace('{SPEZ_BF}', fCI(bfStats?.spez, 1, true, lang))
                    .replace('{AUC_BF}', fCI(bfStats?.auc, 3, false, lang))}</li>`;
            } else {
                 text += `<li>${(langSnippets.listItemInvalid || `Error: Snippet 'listItemInvalid' for ergebnisseOptimierteT2Performance not found in ${lang} texts.`)
                    .replace('{KOLLEKTIV_NAME}', kollektivName)
                    .replace('{N_PAT}', nPat)
                    .replace('{BF_ZIEL_METRIC_LABEL}', bfZielMetricLabel)}</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        const langSnippets = _getLangSnippets(lang, 'ergebnisseVergleichPerformance');
        const pubTabUiTexts = getUiTexts(lang).publikationTab || {};
        const bfMetricUiTexts = pubTabUiTexts.bruteForceMetricLabels || {};
        const studyNames = getUiTexts(lang).studyNames || {};


        let text = `<p>${(langSnippets.intro || `Error: Snippet 'intro' for ergebnisseVergleichPerformance not found in ${lang} texts.`)
            .replace('{TABELLE_6_REF}', langSnippets.tabelle6Ref || (lang === 'en' ? 'Table 6' : 'Tabelle 6'))
            .replace('{ABBILDUNG_2_REF}', langSnippets.abbildung2Ref || (lang === 'en' ? 'Figure 2' : 'Abbildung 2'))}</p>`;

        const kollektive = [
            { id: 'Gesamt', litSetId: 'koh_2008_morphology', litSetRefKey: 'koh_2008_morphology_name' },
            { id: 'direkt OP', litSetId: 'rutegard_et_al_esgar', litSetRefKey: 'rutegard_et_al_esgar_name'},
            { id: 'nRCT', litSetId: 'barbaro_2024_restaging', litSetRefKey: 'barbaro_2024_restaging_name'}
        ];

        kollektive.forEach(k => {
            const kollektivName = getKollektivDisplayName(k.id, lang);
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const litSetName = studyNames[k.litSetRefKey] || k.litSetRefKey;


            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            const diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', false, lang);
            const diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', false, lang);

            text += `<h4>${(langSnippets.kollektivVergleichHeading || 'Comparison in {KOLLEKTIV_NAME}').replace('{KOLLEKTIV_NAME}', kollektivName)}</h4>`;
            if (statsAS && statsLit && vergleichASvsLit) {
                text += `<p>${(langSnippets.asVsLit || `Error: Snippet 'asVsLit' for ergebnisseVergleichPerformance not found in ${lang} texts.`)
                    .replace('{AUC_AS}', fCI(statsAS.auc, 3, false, lang))
                    .replace('{LIT_SET_NAME}', litSetName)
                    .replace('{AUC_LIT}', fCI(statsLit.auc, 3, false, lang))
                    .replace('{P_WERT_MCNEMAR}', getPValueText(vergleichASvsLit.mcnemar?.pValue, lang))
                    .replace('{P_WERT_DELONG}', getPValueText(vergleichASvsLit.delong?.pValue, lang))
                    .replace('{DIFF_AUC_LIT}', diffAucLitStr)}</p>`;
            } else {
                text += `<p>${(langSnippets.asVsLitMissing || `Error: Snippet 'asVsLitMissing' for ergebnisseVergleichPerformance not found in ${lang} texts.`).replace('{LIT_SET_NAME}', litSetName)}</p>`;
            }
            if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                const bfMetricKey = Object.keys(bfMetricUiTexts).find(key =>
                    (PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfDef.metricName)?.labelKey) === key
                ) || bfDef.metricName.replace(/\s/g, '').toLowerCase();
                const bfMetricDisplayForText = bfMetricUiTexts[bfMetricKey] || bfDef.metricName;

                text += `<p>${(langSnippets.asVsBf || `Error: Snippet 'asVsBf' for ergebnisseVergleichPerformance not found in ${lang} texts.`)
                    .replace('{BF_ZIEL_METRIC_LABEL}', bfMetricDisplayForText)
                    .replace('{AUC_BF}', fCI(statsBF.auc, 3, false, lang))
                    .replace('{P_WERT_MCNEMAR_BF}', getPValueText(vergleichASvsBF.mcnemar?.pValue, lang))
                    .replace('{P_WERT_DELONG_BF}', getPValueText(vergleichASvsBF.delong?.pValue, lang))
                    .replace('{DIFF_AUC_BF}', diffAucBfStr)}</p>`;
            } else {
                 const bfZielMetricValueFallback = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                 const fallbackBfMetricKey = Object.keys(bfMetricUiTexts).find(key =>
                    (PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricValueFallback)?.labelKey) === key
                 ) || bfZielMetricValueFallback.replace(/\s/g, '').toLowerCase();
                 const bfZielMetricLabelFallback = bfMetricUiTexts[fallbackBfMetricKey] || bfZielMetricValueFallback;
                text += `<p>${(langSnippets.asVsBfMissing || `Error: Snippet 'asVsBfMissing' for ergebnisseVergleichPerformance not found in ${lang} texts.`).replace('{BF_ZIEL_METRIC_LABEL}', bfZielMetricLabelFallback)}</p>`;
            }
        });
        return text;
    }


    function getSectionText(sectionId, lang, publicationData, kollektiveData, commonData) {
        const langSnippets = _getLangSnippets(lang, 'fallback'); // General fallback key
        const fallbackText = `<p class="text-warning">${(langSnippets.text || 'Text for section \'{SECTION_ID}\' (Language: {LANG}) not yet implemented.').replace('{SECTION_ID}', sectionId).replace('{LANG}', lang)}</p>`;

        switch (sectionId) {
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, commonData);
            case 'methoden_patientenkollektiv': return getMethodenPatientenkollektivText(lang, publicationData, commonData);
            case 'methoden_mrt_protokoll': return getMethodenMRTProtokollText(lang, commonData);
            case 'methoden_as_definition': return getMethodenASDefinitionText(lang, commonData);
            case 'methoden_t2_definition': return getMethodenT2DefinitionText(lang, commonData, kollektiveData);
            case 'methoden_referenzstandard': return getMethodenReferenzstandardText(lang, commonData);
            case 'methoden_statistische_analyse': return getMethodenStatistischeAnalyseText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, publicationData, commonData);
            case 'ergebnisse_as_performance': return getErgebnisseASPerformanceText(lang, publicationData, commonData);
            case 'ergebnisse_literatur_t2_performance': return getErgebnisseLiteraturT2PerformanceText(lang, publicationData, commonData);
            case 'ergebnisse_optimierte_t2_performance': return getErgebnisseOptimierteT2PerformanceText(lang, publicationData, commonData);
            case 'ergebnisse_vergleich_performance': return getErgebnisseVergleichPerformanceText(lang, publicationData, commonData);
            default:
                console.warn(`Unknown sectionId for text generation: ${sectionId}`);
                return fallbackText;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, publicationData, kollektiveData, commonData) {
        const htmlContent = getSectionText(sectionId, lang, publicationData, kollektiveData, commonData);
        let markdown = htmlContent
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>/g, '**')
            .replace(/<\/strong>/g, '**')
            .replace(/<em>/g, '*')
            .replace(/<\/em>/g, '*')
            .replace(/<i>/g, '*')
            .replace(/<\/i>/g, '*')
            .replace(/<ul>/g, '') // Simpler list conversion
            .replace(/<\/ul>/g, '')
            .replace(/<ol>/g, '') // Simpler list conversion
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, '\n* ')
            .replace(/<\/li>/g, '')
            .replace(/<br\s*\/?>/gi, '\n') // Handle different br tag styles
            .replace(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi, (match, p1) => { // Handle different heading levels
                const headingLevel = parseInt(match.match(/<h(\d)/i)?.[1] || '1');
                return `\n${'#'.repeat(headingLevel)} ${p1.trim()}\n`;
            })
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/–/g, '-') // En-dash to hyphen
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
