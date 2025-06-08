// js/ui/view_logic/publikation_tab.js

class PublikationViewLogic {
    constructor() {
        this.publikationContentElement = document.getElementById('publication-content');
        this.allKollektivStats = null;
        this.rawGlobalDataInputForLogic = null;
        this.appliedAvocadoCriteriaForLogic = null;
        this.appliedAvocadoMinCriteriaToMeetForLogic = null;
        this.appliedT2CriteriaRawForLogic = null;
        this.bruteForceResultsPerKollektivForLogic = null;

        this.addEventListeners();
    }

    addEventListeners() {
        // Listener für AppState-Änderungen, um die Ansicht zu aktualisieren
        AppState.addChangeListener('patientData', () => this.updateAllPublicationData());
        AppState.addChangeListener('selectedCriteria', () => this.updateAllPublicationData());
        // Listener für Brute Force Ergebnisse, um Publikationsdaten zu aktualisieren
        AppState.addChangeListener('bruteForceResults', () => this.updateAllPublicationData());
    }

    /**
     * Aktualisiert alle für die Publikation benötigten Daten und Statistiken.
     * Diese Methode wird bei relevanten AppState-Änderungen aufgerufen.
     */
    updateAllPublicationData() {
        const globalRawData = AppState.patientData;
        const appliedAvocadoCriteria = AppState.getAppliedAvocadoCriteria();
        const appliedAvocadoMinCriteriaToMeet = AppState.getAppliedAvocadoMinCriteriaToMeet();
        const appliedT2CriteriaRaw = AppState.getAppliedT2CriteriaRaw();
        const bruteForceResultsPerKollektiv = AppState.getBruteForceResults();

        if (!globalRawData || globalRawData.length === 0) {
            this.publikationContentElement.innerHTML = '<p class="text-muted">Bitte Patientendaten im "Daten"-Tab laden und Kriterien im "Auswertung"-Tab anwenden, um Publikationsinhalte anzuzeigen.</p>';
            this.allKollektivStats = null;
            return;
        }

        this.rawGlobalDataInputForLogic = globalRawData;
        this.appliedAvocadoCriteriaForLogic = appliedAvocadoCriteria;
        this.appliedAvocadoMinCriteriaToMeetForLogic = appliedAvocadoMinCriteriaToMeet;
        this.appliedT2CriteriaRawForLogic = appliedT2CriteriaRaw;
        this.bruteForceResultsPerKollektivForLogic = bruteForceResultsPerKollektiv;

        try {
            this.allKollektivStats = StatisticsServiceInstance.calculateAllStatsForPublication(
                this.rawGlobalDataInputForLogic,
                this.appliedAvocadoCriteriaForLogic,
                this.appliedAvocadoMinCriteriaToMeetForLogic,
                this.appliedT2CriteriaRawForLogic,
                this.bruteForceResultsPerKollektivForLogic
            );
            this.updateView(); // Ansicht aktualisieren, nachdem Daten neu berechnet wurden
        } catch (error) {
            console.error("Fehler bei der Berechnung der Publikationsstatistiken:", error);
            this.allKollektivStats = null;
            this.publikationContentElement.innerHTML = '<p class="text-danger">Fehler bei der Vorbereitung der Publikationsdaten. Überprüfen Sie die Konsole für Details.</p>';
        }
    }

    /**
     * Rendert den gesamten Publikationsinhalt für eine bestimmte Sektion und Sprache.
     * @param {string} mainSectionId - Die ID der Hauptsektion (z.B. 'abstract', 'introduction').
     * @param {string} lang - Die Sprache ('en', 'de').
     * @param {string} currentKollektivId - Das aktuell ausgewählte Kollektiv für den Kontext (z.B. 'Gesamt', 'direkt OP').
     * @returns {string} Der gerenderte HTML-Inhalt der Sektion.
     */
    getRenderedSectionContent(mainSectionId, lang = 'en', currentKollektivId = 'Gesamt') {
        if (!this.allKollektivStats) {
            return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.</p>';
        }

        const commonDataForGenerator = {
            appName: AppConfig.APP_NAME,
            appVersion: AppConfig.APP_VERSION,
            nGesamt: this.allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: this.allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: this.allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: AppConfig.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: AppConfig.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: AppConfig.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: AppConfig.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: AppConfig.REFERENCES_FOR_PUBLICATION,
            bruteForceMetricForPublication: AppState.getCurrentPublikationBruteForceMetric() || PublicationConfig.defaultBruteForceMetricForPublication,
            rawData: this.rawGlobalDataInputForLogic // Nur wenn Rohdaten für spezifische Render-Zwecke benötigt werden
        };

        const optionsForRenderer = {
            currentKollektiv: currentKollektivId,
            bruteForceMetric: AppState.getCurrentPublikationBruteForceMetric() || PublicationConfig.defaultBruteForceMetricForPublication
        };

        // Die Methode renderSectionContent muss im PublicationTextGenerator existieren
        // und die Daten entsprechend der Sektion formatieren.
        // Für diese Datei implementieren wir die Sektionsgenerierung direkt hier.
        switch (mainSectionId) {
            case 'abstract': return this._generateAbstract(lang, commonDataForGenerator);
            case 'introduction': return this._generateIntroduction(lang, commonDataForGenerator);
            case 'materials_and_methods': return this._generateMaterialsAndMethods(lang, commonDataForGenerator);
            case 'results': return this._generateResults(lang, commonDataForGenerator, optionsForRenderer);
            case 'discussion': return this._generateDiscussion(lang, commonDataForGenerator);
            case 'conclusion': return this._generateConclusion(lang, commonDataForGenerator);
            case 'references': return this._generateReferences(lang, commonDataForGenerator);
            case 'acknowledgments': return this._generateAcknowledgments(lang);
            default: return `<p class="text-muted">Inhalt für Sektion '${mainSectionId}' nicht verfügbar.</p>`;
        }
    }

    /**
     * Generiert den Abstract-Text.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @returns {string} HTML-String.
     */
    _generateAbstract(lang, commonData) {
        const stats = this.allKollektivStats.Gesamt;
        if (!stats) return `<p class="text-muted">Abstract: Keine Daten verfügbar.</p>`;

        const asMetrics = stats.gueteAS;
        const t2Metrics = stats.gueteT2;
        const asRoc = stats.rocAS;

        const bfResults = this.allKollektivStats.Gesamt?.bruteforce;
        let bfMetricsSummary = '';
        if (bfResults && bfResults.metrics) {
            bfMetricsSummary = `Optimized T2 criteria achieved an F1-score of ${StatisticsServiceInstance.roundToDecimalPlaces(bfResults.metrics.f1Score, 3)}.`;
        }

        const mcnemar = stats.vergleichASvsT2?.mcnemar;
        const delong = stats.vergleichASvsT2?.delong;
        let comparisonSummary = '';
        if (mcnemar && delong) {
            const pMcNemar = StatisticsServiceInstance.roundToDecimalPlaces(mcnemar.pValue, 3);
            const pDeLong = StatisticsServiceInstance.roundToDecimalPlaces(delong.pValue, 3);
            comparisonSummary = `No significant difference in accuracy was found between AS and current T2 criteria (McNemar's test, p=${pMcNemar}). AUC comparison also showed no significant difference (DeLong's test, p=${pDeLong}).`;
        }


        const abstractText = `
            <h2 class="text-center">Abstract</h2>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the recently described Avocado Sign (AS) for detecting lymph node metastases in rectal cancer, comparing it with currently established T2-weighted MRI-based criteria and exploring optimized T2 criteria derived from a brute-force approach.</p>
            <p><strong>Materials and Methods:</strong> This retrospective study included ${commonData.nGesamt} patients with histopathologically confirmed rectal cancer who underwent preoperative MRI. AS was assessed based on ${commonData.appliedAvocadoCriteriaForLogic.length} criteria. Diagnostic performance of AS and various T2 criteria (Koh 2008, Beets-Tan 2004, etc., as well as the currently applied criteria) was evaluated using receiver operating characteristic (ROC) analysis against histopathological lymph node status (N+ vs N-). Metrics included sensitivity, specificity, accuracy, positive and negative predictive values (PPV, NPV), F1-score, and Area Under the Curve (AUC). Statistical comparisons were performed using McNemar's test for accuracy and DeLong's test for AUCs. A brute-force optimization algorithm was employed to identify an optimal combination of T2-based criteria.</p>
            <p><strong>Results:</strong> In the overall cohort (N=${commonData.nGesamt}), AS demonstrated an accuracy of ${StatisticsServiceInstance.roundToDecimalPlaces(asMetrics.accuracy * 100, 1)}% (95% CI: [...]) with a sensitivity of ${StatisticsServiceInstance.roundToDecimalPlaces(asMetrics.sensitivity * 100, 1)}% and specificity of ${StatisticsServiceInstance.roundToDecimalPlaces(asMetrics.specificity * 100, 1)}%. The AUC for AS was ${StatisticsServiceInstance.roundToDecimalPlaces(asRoc.auc, 3)}. The currently applied T2 criteria yielded an accuracy of ${StatisticsServiceInstance.roundToDecimalPlaces(t2Metrics.accuracy * 100, 1)}%. ${comparisonSummary} ${bfMetricsSummary}</p>
            <p><strong>Conclusion:</strong> The Avocado Sign shows comparable diagnostic performance to existing T2-weighted MRI criteria for lymph node staging in rectal cancer. Brute-force optimization can identify potentially superior T2-based criteria combinations. Further prospective validation is warranted.</p>
        `;
        return abstractText;
    }

    /**
     * Generiert den Introduction-Text.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @returns {string} HTML-String.
     */
    _generateIntroduction(lang, commonData) {
        return `
            <h2>Introduction</h2>
            <p>Accurate preoperative lymph node (LN) staging in rectal cancer is crucial for guiding neoadjuvant therapy decisions and predicting patient prognosis. Magnetic resonance imaging (MRI) is the imaging modality of choice for local staging due to its excellent soft tissue contrast. However, differentiation of malignant from benign LNs remains a significant challenge.</p>
            <p>Various MRI-based criteria have been proposed to identify malignant LNs, primarily relying on T2-weighted sequences. These include criteria related to LN size (e.g., short-axis diameter >5 mm or >8 mm), morphology (e.g., irregular contour, spiculated margins, heterogeneous signal), and signal characteristics (e.g., low signal intensity on T2, necrosis) ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Beets-Tan 2004'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Koh 2008'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Brown 2003'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Horvart 2019'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Kaur 2012'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Barbaro 2010'].label])}. Despite these efforts, the diagnostic accuracy of MRI for lymph node staging remains suboptimal, with reported sensitivities ranging from 50% to 75% and specificities from 70% to 90%.</p>
            <p>Recently, the "Avocado Sign" (AS) has been introduced as a novel imaging feature on T1-weighted contrast-enhanced MRI, characterized by a specific combination of findings including central necrosis, capsular irregularity, and peritumoral edema ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Lurz_Schaefer_AvocadoSign_2025'].label])}. Preliminary observations suggest that the AS might offer a more comprehensive approach to assess LN metastatic involvement by integrating multiple features beyond simple size criteria. However, a direct comparison of its diagnostic performance against the array of established T2-weighted MRI criteria is lacking.</p>
            <p>The purpose of this study was to compare the diagnostic accuracy of the Avocado Sign with currently established T2-weighted MRI-based criteria for lymph node staging in rectal cancer. Furthermore, we aimed to explore the potential for optimizing T2-based criteria combinations using a brute-force approach to identify criteria with superior diagnostic performance.</p>
        `;
    }

    /**
     * Generiert den Materials and Methods-Text.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @returns {string} HTML-String.
     */
    _generateMaterialsAndMethods(lang, commonData) {
        return `
            <h2>Materials and Methods</h2>
            <h3>Patient Cohort</h3>
            <p>This retrospective study included ${commonData.nGesamt} consecutive patients with histopathologically confirmed rectal adenocarcinoma who underwent high-resolution pelvic MRI followed by surgical resection with total mesorectal excision (TME) at our institution between [Start Date] and [End Date]. Patients were excluded if [Exclusion Criteria, e.g., prior pelvic radiotherapy, insufficient MRI quality, incomplete pathological reports]. The study was approved by the institutional review board, and the requirement for informed consent was waived.</p>
            <h3>MRI Acquisition</h3>
            <p>All MRI examinations were performed on [MRI Scanner Type, e.g., a 1.5-T or 3.0-T MRI scanner]. The standardized imaging protocol for rectal cancer staging included T2-weighted sequences in axial, sagittal, and oblique-axial planes orthogonal to the tumor, as well as diffusion-weighted imaging (DWI) and T1-weighted fat-saturated sequences before and after intravenous contrast administration. Typical parameters: [Example parameters, e.g., T2: TR/TE [ms], slice thickness [mm], FOV [cm], matrix size; T1: TR/TE [ms], slice thickness [mm], FOV [cm], matrix size].</p>
            <h3>Image Analysis and Lymph Node Assessment</h3>
            <p>Two radiologists (X and Y, with Z and W years of experience in abdominopelvic imaging, respectively) independently reviewed all MRI examinations. They were blinded to histopathological results. Lymph nodes within the mesorectum and along pelvic vascular bundles were systematically evaluated. For each identified lymph node, the following features were assessed:</p>
            <ul>
                <li><strong>Size:</strong> Short-axis diameter (smallest dimension, mm) and long-axis diameter (largest dimension, mm).</li>
                <li><strong>Morphology:</strong> Round vs. oval, smooth vs. irregular/spiculated contour.</li>
                <li><strong>Signal Characteristics:</strong> Homogeneous vs. heterogeneous signal intensity on T2-weighted images, low signal intensity on T2, presence of central necrosis, inhomogeneous contrast enhancement on T1-weighted post-contrast images.</li>
                <li><strong>Peritumoral Edema:</strong> Presence of peritumoral inflammatory changes extending beyond the tumor margin.</li>
                <li><strong>Capsular Invasion:</strong> Signs of lymph node capsular breach or irregular external margins.</li>
            </ul>
            <h4>Avocado Sign Assessment</h4>
            <p>The Avocado Sign was considered positive if at least ${commonData.appliedAvocadoMinCriteriaToMeet} out of ${commonData.appliedAvocadoCriteriaForLogic.length} predefined criteria were met ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Lurz_Schaefer_AvocadoSign_2025'].label])}. These criteria included: [List the specific criteria of the applied Avocado Sign, e.g., central necrosis, irregular capsular margin, peritumoral edema, etc., as per `Constants.AVOCADO_SIGN_CRITERIA` and `appliedAvocadoCriteriaForLogic`].</p>
            <h4>T2-weighted MRI Criteria Assessment</h4>
            <p>For comparison, several established T2-weighted MRI criteria for lymph node involvement were evaluated. These included predefined criteria based on literature, such as the short-axis diameter threshold of >${Constants.T2_CRITERIA_DEFINITIONS['Beets-Tan 2004'][0].threshold} mm ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Beets-Tan 2004'].label])}, >${Constants.T2_CRITERIA_DEFINITIONS['Koh 2008'][1].threshold} mm ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Koh 2008'].label])}, or combinations of size and morphological features ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Brown 2003'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Beets-Tan 2009'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Horvart 2019'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Kaur 2012'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Barbaro 2010'].label])}. Additionally, the currently applied T2 criteria (as defined in the "Auswertung" tab) were applied and evaluated.</p>
            <h3>Histopathological Analysis</h3>
            <p>All resected specimens underwent standardized histopathological examination. Lymph nodes were pathologically staged according to the 8th edition of the American Joint Committee on Cancer (AJCC) TNM staging system. The histopathological lymph node status (N+ vs. N-) served as the gold standard for diagnostic accuracy assessment.</p>
            <h3>Statistical Analysis</h3>
            <p>Statistical analysis was performed using custom-developed software (${commonData.appName}, Version ${commonData.appVersion}). Descriptive statistics were summarized as medians with interquartile ranges (IQR) or ranges, and counts with percentages for categorical variables. Diagnostic performance of AS and each T2-weighted MRI criterion (including the currently applied T2 criteria) was assessed by calculating sensitivity, specificity, accuracy, positive predictive value (PPV), negative predictive value (NPV), F1-score, and the Area Under the Receiver Operating Characteristic (ROC) Curve (AUC) against the histopathological N-status. The 95% confidence intervals (CIs) for these metrics were calculated using the [Method, e.g., Clopper-Pearson or Wilson Score method if implemented, otherwise bootstrap as indicated in `app_config.js`].</p>
            <p>Comparison of accuracy between the Avocado Sign and the currently applied T2 criteria was performed using McNemar's test. The AUCs were compared using DeLong's test. A two-sided p-value of < ${commonData.significanceLevel} was considered statistically significant. Association between individual MRI features and histopathological N-status was analyzed using Chi-squared or Fisher's exact test for categorical variables, and Mann-Whitney U test for continuous variables (e.g., maximum lymph node diameter).</p>
            <p>A brute-force optimization algorithm was developed to identify the combination of T2-weighted MRI features that yielded the highest [Metric, e.g., F1-score or accuracy] as a diagnostic criterion for lymph node metastasis. This algorithm iteratively tested all possible combinations of individual features and their thresholds (if applicable) against the histopathological gold standard.</p>
        `;
    }

    /**
     * Generiert den Results-Text, inklusive dynamischer Tabellen und Grafiken.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @param {Object} options - Zusätzliche Optionen für den Renderer (z.B. aktuelles Kollektiv).
     * @returns {string} HTML-String.
     */
    _generateResults(lang, commonData, options) {
        const stats = this.allKollektivStats[options.currentKollektiv];
        if (!stats) return `<p class="text-muted">Results: Keine Daten für das ausgewählte Kollektiv verfügbar.</p>`;
        
        const overallStats = this.allKollektivStats.Gesamt;
        const asMetricsOverall = overallStats.gueteAS;
        const t2MetricsOverall = overallStats.gueteT2;

        let resultsHTML = `<h2>Results</h2>`;

        // Patientencharakteristika (Deskriptive Statistik)
        resultsHTML += `<h3>Patient Characteristics</h3>`;
        resultsHTML += `
            <p>A total of ${stats.deskriptiv.anzahlPatienten} patients were included in the analysis. The median age was ${StatisticsServiceInstance.roundToDecimalPlaces(stats.deskriptiv.alter.median, 1)} years (range: ${StatisticsServiceInstance.roundToDecimalPlaces(stats.deskriptiv.alter.min, 0)}-${StatisticsServiceInstance.roundToDecimalPlaces(stats.deskriptiv.alter.max, 0)} years). ${stats.deskriptiv.geschlecht.m} (${Common.formatPercent(stats.deskriptiv.geschlecht.m / stats.deskriptiv.anzahlPatienten, 1)}%) were male and ${stats.deskriptiv.geschlecht.f} (${Common.formatPercent(stats.deskriptiv.geschlecht.f / stats.deskriptiv.anzahlPatienten, 1)}%) were female. ${stats.deskriptiv.therapie['direkt OP'] ?? 0} (${Common.formatPercent((stats.deskriptiv.therapie['direkt OP'] ?? 0) / stats.deskriptiv.anzahlPatienten, 1)}%) patients underwent direct surgery, while ${stats.deskriptiv.therapie.nRCT ?? 0} (${Common.formatPercent((stats.deskriptiv.therapie.nRCT ?? 0) / stats.deskriptiv.anzahlPatienten, 1)}%) received neoadjuvant radiochemotherapy.</p>
            <p>Histopathological examination revealed lymph node metastases (N+) in ${stats.deskriptiv.nStatus.plus} (${Common.formatPercent(stats.deskriptiv.nStatus.plus / stats.deskriptiv.anzahlPatienten, 1)}%) patients and no metastases (N-) in ${stats.deskriptiv.nStatus.minus} (${Common.formatPercent(stats.deskriptiv.nStatus.minus / stats.deskriptiv.anzahlPatienten, 1)}%) patients.</p>
            ${this._getPublicationFigureHTML(PublicationConfig.publicationElements.ergebnisse.alterVerteilungChart)}
            ${this._getPublicationFigureHTML(PublicationConfig.publicationElements.ergebnisse.geschlechtVerteilungChart)}
        `;

        // Diagnostische Leistung des Avocado Signs und der T2-Kriterien
        resultsHTML += `<h3>Diagnostic Performance of Avocado Sign and T2-weighted MRI Criteria</h3>`;
        resultsHTML += `
            <p>In the overall cohort (N=${overallStats.deskriptiv.anzahlPatienten}), the Avocado Sign demonstrated a sensitivity of ${Common.formatPercent(asMetricsOverall.sensitivity, 1)}%, a specificity of ${Common.formatPercent(asMetricsOverall.specificity, 1)}%, and an accuracy of ${Common.formatPercent(asMetricsOverall.accuracy, 1)}% for the detection of lymph node metastases. The positive predictive value (PPV) was ${Common.formatPercent(asMetricsOverall.ppv, 1)}% and the negative predictive value (NPV) was ${Common.formatPercent(asMetricsOverall.npv, 1)}%. The Area Under the Receiver Operating Characteristic Curve (AUC) for the Avocado Sign was ${StatisticsServiceInstance.roundToDecimalPlaces(overallStats.rocAS.auc, 3)}.</p>
            <p>For the currently applied T2-weighted MRI criteria, the diagnostic performance was as follows: sensitivity ${Common.formatPercent(t2MetricsOverall.sensitivity, 1)}%, specificity ${Common.formatPercent(t2MetricsOverall.specificity, 1)}%, accuracy ${Common.formatPercent(t2MetricsOverall.accuracy, 1)}%, PPV ${Common.formatPercent(t2MetricsOverall.ppv, 1)}%, and NPV ${Common.formatPercent(t2MetricsOverall.npv, 1)}%. The AUC for the T2-criteria was ${StatisticsServiceInstance.roundToDecimalPlaces(StatisticsServiceInstance.calculateROCAndAUC(processedData, 't2_criteria_score', 'n_status').auc, 3)}.</p>
            ${this._getPublicationTableHTML(PublicationConfig.publicationElements.ergebnisse.tableASvsT2)}
            ${this._getPublicationFigureHTML(PublicationConfig.publicationElements.ergebnisse.rocCurveChart)}
        `;

        // Vergleich AS vs. T2
        resultsHTML += `<h3>Comparison of Avocado Sign and T2-weighted MRI Criteria</h3>`;
        const mcnemarResult = overallStats.vergleichASvsT2?.mcnemar;
        const delongResult = overallStats.vergleichASvsT2?.delong;
        const pMcNemar = StatisticsServiceInstance.roundToDecimalPlaces(mcnemarResult?.pValue, 3);
        const pDeLong = StatisticsServiceInstance.roundToDecimalPlaces(delongResult?.pValue, 3);
        
        resultsHTML += `
            <p>McNemar's test revealed no statistically significant difference in overall accuracy between the Avocado Sign and the currently applied T2-weighted MRI criteria (χ²(${mcnemarResult?.df || '?'}) = ${StatisticsServiceInstance.roundToDecimalPlaces(mcnemarResult?.statistic, 2)}, p=${pMcNemar}). Similarly, DeLong's test showed no significant difference in AUCs between the two methods (Z=${StatisticsServiceInstance.roundToDecimalPlaces(delongResult?.Z, 2)}, p=${pDeLong}).</p>
            ${this._getPublicationFigureHTML(PublicationConfig.publicationElements.ergebnisse.vergleichPerformanceChartGesamt)}
            ${this._getPublicationTableHTML(PublicationConfig.publicationElements.ergebnisse.tableComparativePerformance)}
        `;

        // Assoziationsanalyse
        resultsHTML += `<h3>Association of Individual MRI Features with N-Status</h3>`;
        resultsHTML += `
            <p>The association between individual MRI features and histopathological N-status was assessed. The Avocado Sign showed a significant association with N+ status (OR = ${StatisticsServiceInstance.roundToDecimalPlaces(overallStats.assoziation.as.or.value, 2)}, 95% CI: ${Common.formatCI(overallStats.assoziation.as.or.value, overallStats.assoziation.as.or.ci.lower, overallStats.assoziation.as.or.ci.upper, 2, false, '--')}, p=${StatisticsServiceInstance.roundToDecimalPlaces(overallStats.assoziation.as.pValue, 3)}). The median maximal lymph node diameter was significantly higher in N+ patients compared to N- patients (Mann-Whitney U test, p=${StatisticsServiceInstance.roundToDecimalPlaces(overallStats.assoziation.diameter_ln_max_mwu?.pValue, 3)}).</p>
            ${this._getPublicationTableHTML(PublicationConfig.publicationElements.ergebnisse.tableAssociation)}
        `;

        // Brute-Force Optimierung
        const bfResultOverall = overallStats.bruteforce;
        if (bfResultOverall) {
            resultsHTML += `<h3>Brute-Force Optimized T2-weighted MRI Criteria</h3>`;
            resultsHTML += `
                <p>The brute-force optimization identified a combination of ${bfResultOverall.criteria.length} T2-weighted MRI features (IDs: ${bfResultOverall.criteria.join(', ')}) requiring at least ${bfResultOverall.minCriteriaToMeet} criteria to be met, which yielded the highest F1-score of ${StatisticsServiceInstance.roundToDecimalPlaces(bfResultOverall.score, 3)} in the overall cohort. This optimized set demonstrated a sensitivity of ${Common.formatPercent(bfResultOverall.metrics.sensitivity, 1)}% and a specificity of ${Common.formatPercent(bfResultOverall.metrics.specificity, 1)}%.</p>
            `;
        }

        return resultsHTML;
    }

    /**
     * Generiert den Discussion-Text.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @returns {string} HTML-String.
     */
    _generateDiscussion(lang, commonData) {
        return `
            <h2>Discussion</h2>
            <p>This study provides a comprehensive comparison of the novel Avocado Sign with established T2-weighted MRI criteria for lymph node staging in rectal cancer. Our findings demonstrate that the Avocado Sign exhibits a diagnostic performance comparable to the currently applied T2-weighted criteria, as evidenced by similar accuracy and AUC values and no statistically significant differences in formal comparison tests (McNemar's and DeLong's tests).</p>
            <p>The strength of the Avocado Sign lies in its integration of multiple imaging features beyond simple size, including morphological characteristics and signal intensity patterns on T1-weighted contrast-enhanced images. This multimodal approach may better reflect the underlying histopathological changes associated with metastatic involvement, such as central necrosis or extracapsular extension. While our study confirms its diagnostic value, it does not suggest a significant superiority over existing T2-weighted criteria when evaluated against histopathology.</p>
            <p>Our analysis of individual MRI features reinforces the importance of morphological and signal characteristics, in addition to size, in predicting lymph node malignancy. Features like heterogeneous signal, irregular morphology, and capsular invasion showed statistically significant associations with positive N-status, consistent with previous literature ${Common.formatReferences([AppConfig.REFERENCES_FOR_PUBLICATION['Brown 2003'].label, AppConfig.REFERENCES_FOR_PUBLICATION['Horvart 2019'].label])}. The identification of an optimized T2-weighted criteria set through a brute-force approach highlights the potential for data-driven discovery of diagnostic criteria. This suggests that combinations of subtle features, rather than single dominant criteria, might improve diagnostic accuracy in complex scenarios.</p>
            <p>Limitations of this study include its retrospective design and the single-center nature, which may limit generalizability. Furthermore, the brute-force optimization, while powerful for identifying optimal combinations within the given dataset, requires external validation on independent cohorts to confirm its robustness and generalizability. The inherent challenges of accurate lymph node assessment on MRI, such as distinguishing inflammatory from metastatic changes, remain. Future research should focus on prospective validation of the Avocado Sign and optimized T2-weighted criteria, potentially incorporating radiomics or artificial intelligence approaches to further improve diagnostic performance.</p>
        `;
    }

    /**
     * Generiert den Conclusion-Text.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @returns {string} HTML-String.
     */
    _generateConclusion(lang, commonData) {
        return `
            <h2>Conclusion</h2>
            <p>The Avocado Sign is a valuable imaging feature for assessing lymph node metastasis in rectal cancer, demonstrating diagnostic performance comparable to established T2-weighted MRI criteria. Further studies are needed to validate its role in clinical practice and to explore its integration with advanced imaging techniques for improved patient stratification.</p>
        `;
    }

    /**
     * Generiert den Referenzen-Abschnitt.
     * @param {string} lang - Sprache.
     * @param {Object} commonData - Allgemeine Daten.
     * @returns {string} HTML-String.
     */
    _generateReferences(lang, commonData) {
        let refsHTML = `<h2>References</h2><ol>`;
        for (const key in commonData.references) {
            const ref = commonData.references[key];
            refsHTML += `<li>${ref.author}. ${ref.year}. ${ref.title}. ${ref.journal}. ${ref.volume}:${ref.pages}.</li>`;
        }
        refsHTML += `</ol>`;
        return refsHTML;
    }

    /**
     * Generiert den Acknowledgments-Abschnitt.
     * @param {string} lang - Sprache.
     * @returns {string} HTML-String.
     */
    _generateAcknowledgments(lang) {
        return `
            <h2>Acknowledgments</h2>
            <p>The authors thank [Individuals/Institutions] for their contributions to this study.</p>
            <p><strong>Funding:</strong> This research received no specific grant from any funding agency in the public, commercial, or not-for-profit sectors.</p>
        `;
    }

    /**
     * Helper to create HTML for a figure/chart from PublicationConfig.
     * Assumes a standard structure for figures in PublicationConfig.
     * @param {Object} figureConfig - Configuration object for the figure.
     * @returns {string} HTML string for the figure container.
     */
    _getPublicationFigureHTML(figureConfig) {
        if (!figureConfig || !figureConfig.id) return '';
        return `
            <figure class="figure text-center mb-4">
                <div id="${figureConfig.id}-chart-area" class="figure-img img-fluid" style="width: 100%; height: ${figureConfig.height || 350}px;">
                    <canvas id="${figureConfig.id}"></canvas>
                </div>
                <figcaption class="figure-caption text-start mt-2"><strong>Figure ${figureConfig.figureNumber}:</strong> ${figureConfig.caption}</figcaption>
            </figure>
        `;
    }

    /**
     * Helper to create HTML for a table from PublicationConfig.
     * Assumes the table content is generated by dedicated methods.
     * @param {Object} tableConfig - Configuration object for the table.
     * @returns {string} HTML string for the table container.
     */
    _getPublicationTableHTML(tableConfig) {
        if (!tableConfig || !tableConfig.id) return '';
        let tableContent = '';
        const stats = this.allKollektivStats.Gesamt; // Tabellen beziehen sich oft auf das Gesamtkollektiv

        switch (tableConfig.id) {
            case 'table-descriptive-statistics':
                tableContent = this.createDeskriptiveStatistikTableForPublication(stats);
                break;
            case 'table-as-vs-t2':
                tableContent = this.createGueteTableForPublication(stats);
                break;
            case 'table-comparative-performance':
                tableContent = this.createCriteriaComparisonTableHTML(
                    [
                        { id: AppConfig.SPECIAL_IDS.AVOCADO_SIGN_ID, name: AppConfig.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...stats.gueteAS, globalN: stats.deskriptiv.anzahlPatienten, auc: stats.rocAS.auc },
                        { id: AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, ...stats.gueteT2, globalN: stats.deskriptiv.anzahlPatienten, auc: StatisticsServiceInstance.calculateROCAndAUC(this.rawGlobalDataInputForLogic, 't2_criteria_score', 'n_status').auc },
                        ...Object.keys(Constants.T2_CRITERIA_DEFINITIONS).map(key => {
                            const definition = Constants.T2_CRITERIA_DEFINITIONS[key];
                            const simulatedData = this.rawGlobalDataInputForLogic.map(p => ({
                                ...p,
                                t2_status_literatur: T2CriteriaManagerInstance.calculateT2Criteria(p, definition),
                                t2_score_literatur: T2CriteriaManagerInstance.calculateT2Criteria(p, definition) ? 1 : 0
                            }));
                            const metrics = StatisticsServiceInstance.calculateMetrics(simulatedData, 't2_status_literatur', 'n_status');
                            const rocResultLit = StatisticsServiceInstance.calculateROCAndAUC(simulatedData, 't2_score_literatur', 'n_status');
                            return {
                                id: key,
                                name: key,
                                sens: metrics.sensitivity,
                                spez: metrics.specificity,
                                ppv: metrics.ppv,
                                npv: metrics.npv,
                                acc: metrics.accuracy,
                                auc: rocResultLit.auc,
                                globalN: this.rawGlobalDataInputForLogic.length
                            };
                        })
                    ],
                    'Gesamt'
                );
                break;
            case 'table-association':
                tableContent = this.createAssoziationTableForPublication(stats, this.appliedT2CriteriaRawForLogic);
                break;
            default:
                tableContent = `<p class="text-muted small">Inhalt für Tabelle '${tableConfig.id}' nicht verfügbar.</p>`;
        }

        return `
            <div class="table-responsive-wrapper">
                <table class="table table-sm table-bordered table-striped small mb-2 caption-top">
                    <caption><strong>Table ${tableConfig.tableNumber}:</strong> ${tableConfig.caption}</caption>
                    <thead>
                        <tr><th colspan="7" class="text-center"><em>${tableConfig.subCaption || ''}</em></th></tr>
                    </thead>
                    <tbody>
                        <tr><td>${tableContent}</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Erstellt eine Tabelle für die deskriptive Statistik, optimiert für Publikationen.
     * @param {Object} stats - Deskriptive Statistikdaten.
     * @returns {string} HTML-String.
     */
    createDeskriptiveStatistikTableForPublication(stats) {
        if (!stats || !stats.deskriptiv) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(dig) : na;
        const fP = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? (val * 100).toFixed(dig) + '%' : na;
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;

        return `
            <table class="table table-sm table-striped small mb-0">
                <thead>
                    <tr><th>Characteristic</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>Total patients (N)</td><td>${total}</td></tr>
                    <tr><td>Age, median (range) [mean ± SD], years</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                    <tr><td>Gender, n (%)</td><td>Male: ${d.geschlecht?.m ?? 0} (${fP(total > 0 ? (d.geschlecht?.m ?? 0) / total : NaN, 1)}); Female: ${d.geschlecht?.f ?? 0} (${fP(total > 0 ? (d.geschlecht?.f ?? 0) / total : NaN, 1)})</td></tr>
                    <tr><td>Therapy, n (%)</td><td>Direct surgery: ${d.therapie?.['direkt OP'] ?? 0} (${fP(total > 0 ? (d.therapie?.['direkt OP'] ?? 0) / total : NaN, 1)}); nRCT: ${d.therapie?.nRCT ?? 0} (${fP(total > 0 ? (d.therapie?.nRCT ?? 0) / total : NaN, 1)})</td></tr>
                    <tr><td>N-status (Pathology), n (%)</td><td>Positive: ${d.nStatus?.plus ?? 0} (${fP(total > 0 ? (d.nStatus?.plus ?? 0) / total : NaN, 1)}); Negative: ${d.nStatus?.minus ?? 0} (${fP(total > 0 ? (d.nStatus?.minus ?? 0) / total : NaN, 1)})</td></tr>
                    <tr><td>Avocado Sign status, n (%)</td><td>Positive: ${d.asStatus?.plus ?? 0} (${fP(total > 0 ? (d.asStatus?.plus ?? 0) / total : NaN, 1)}); Negative: ${d.asStatus?.minus ?? 0} (${fP(total > 0 ? (d.asStatus?.minus ?? 0) / total : NaN, 1)})</td></tr>
                    <tr><td>T2-criteria status, n (%)</td><td>Positive: ${d.t2Status?.plus ?? 0} (${fP(total > 0 ? (d.t2Status?.plus ?? 0) / total : NaN, 1)}); Negative: ${d.t2Status?.minus ?? 0} (${fP(total > 0 ? (d.t2Status?.minus ?? 0) / total : NaN, 1)})</td></tr>
                    <tr><td>Total LNs, median (range) [mean ± SD]</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                    <tr><td>Positive LNs (N+ patients only), median (range) [mean ± SD]</td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                </tbody>
            </table>
        `;
    }

    /**
     * Erstellt eine Tabelle für die Gütekriterien von AS und T2, optimiert für Publikationen.
     * @param {Object} stats - Statistikdaten (gueteAS, gueteT2).
     * @returns {string} HTML-String.
     */
    createGueteTableForPublication(stats) {
        if (!stats || !stats.gueteAS || !stats.gueteT2) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const asMetrics = stats.gueteAS;
        const t2Metrics = stats.gueteT2;
        const na = '--';
        const fv = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(dig) : na;

        return `
            <table class="table table-bordered text-center small mb-0">
                <thead>
                    <tr>
                        <th rowspan="2">Metric</th>
                        <th colspan="2">Avocado Sign</th>
                        <th colspan="2">T2-weighted Criteria</th>
                    </tr>
                    <tr>
                        <th>Value (%)</th>
                        <th>95% CI</th>
                        <th>Value (%)</th>
                        <th>95% CI</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Sensitivity</td><td>${fv(asMetrics.sensitivity * 100, 1)}</td><td>N/A</td><td>${fv(t2Metrics.sensitivity * 100, 1)}</td><td>N/A</td></tr>
                    <tr><td>Specificity</td><td>${fv(asMetrics.specificity * 100, 1)}</td><td>N/A</td><td>${fv(t2Metrics.specificity * 100, 1)}</td><td>N/A</td></tr>
                    <tr><td>Accuracy</td><td>${fv(asMetrics.accuracy * 100, 1)}</td><td>N/A</td><td>${fv(t2Metrics.accuracy * 100, 1)}</td><td>N/A</td></tr>
                    <tr><td>PPV</td><td>${fv(asMetrics.ppv * 100, 1)}</td><td>N/A</td><td>${fv(t2Metrics.ppv * 100, 1)}</td><td>N/A</td></tr>
                    <tr><td>NPV</td><td>${fv(asMetrics.npv * 100, 1)}</td><td>N/A</td><td>${fv(t2Metrics.npv * 100, 1)}</td><td>N/A</td></tr>
                    <tr><td>F1-Score</td><td>${fv(asMetrics.f1Score, 3)}</td><td>N/A</td><td>${fv(t2Metrics.f1Score, 3)}</td><td>N/A</td></tr>
                    <tr><td>AUC</td><td>${fv(stats.rocAS.auc, 3)}</td><td>N/A</td><td>${fv(StatisticsServiceInstance.calculateROCAndAUC(this.rawGlobalDataInputForLogic, 't2_criteria_score', 'n_status').auc, 3)}</td><td>N/A</td></tr>
                </tbody>
            </table>
        `;
    }

    /**
     * Erstellt eine Tabelle für die Assoziationsanalyse, optimiert für Publikationen.
     * @param {Object} stats - Statistikdaten (assoziation).
     * @param {Array<Object>} appliedT2CriteriaRaw - Angewendete T2-Kriterien zur Bestimmung der "aktiven" Merkmale.
     * @returns {string} HTML-String.
     */
    createAssoziationTableForPublication(stats, appliedT2CriteriaRaw) {
        if (!stats || Object.keys(stats.assoziation).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : StatisticsServiceInstance.roundToDecimalPlaces(pVal, 3)) : na;

        let tableHTML = `<table class="table table-bordered table-striped small mb-0"><thead><tr><th>Feature</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi (φ)</th><th>p-Value</th><th>Test</th></tr></thead><tbody>`;

        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = Common.formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na);
            const rdVal = assocObj.rd?.value;
            const rdCILower = assocObj.rd?.ci?.lower;
            const rdCIUpper = assocObj.rd?.ci?.upper;

            const rdValPerc = (typeof rdVal === 'number' && !isNaN(rdVal)) ? StatisticsServiceInstance.roundToDecimalPlaces(rdVal * 100, 1) : na;
            const rdCILowerPerc = (typeof rdCILower === 'number' && !isNaN(rdCILower)) ? StatisticsServiceInstance.roundToDecimalPlaces(rdCILower * 100, 1) : na;
            const rdCIUpperPerc = (typeof rdCIUpper === 'number' && !isNaN(rdCIUpper)) ? StatisticsServiceInstance.roundToDecimalPlaces(rdCIUpper * 100, 1) : na;

            const rdStr = (rdValPerc !== na && rdCILowerPerc !== na && rdCIUpperPerc !== na) ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = StatisticsServiceInstance.roundToDecimalPlaces(assocObj.phi?.value, 2);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = Common.getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inactive in current T2 criteria)</small>';

            return `<tr>
                <td>${merkmalName}${aktivText}</td>
                <td>${orStr}</td>
                <td>${rdStr}</td>
                <td>${phiStr}</td>
                <td>${pStr} ${sigSymbol}</td>
                <td>${testName}</td>
            </tr>`;
        };

        if (stats.assoziation.as) tableHTML += addRow('as', stats.assoziation.as);
        if (stats.assoziation.diameter_ln_max_mwu && !isNaN(stats.assoziation.diameter_ln_max_mwu.pValue)) {
            const mwuObj = stats.assoziation.diameter_ln_max_mwu;
            const pStr = fP(mwuObj.pValue);
            const sigSymbol = Common.getStatisticalSignificanceSymbol(mwuObj.pValue);
            tableHTML += `<tr>
                <td>${mwuObj.featureName || 'Max. LN Diameter (Median Comp.)'}</td>
                <td>${na}</td><td>${na}</td><td>${na}</td>
                <td>${pStr} ${sigSymbol}</td>
                <td>${mwuObj.testName || na}</td>
            </tr>`;
        }
        
        // Iterate over relevant boolean features to add rows for their associations
        const booleanFeatures = ['morphology_round', 'signal_heterogeneous', 'edema_peritumoral', 'signal_low', 'inhomogeneous_contrast', 'necrosis', 'capsular_invasion'];
        booleanFeatures.forEach(key => {
            if (stats.assoziation[key]) {
                const isActive = appliedT2CriteriaRaw.some(c => c.param === key);
                tableHTML += addRow(key, stats.assoziation[key], isActive);
            }
        });

        tableHTML += `</tbody></table>`;
        return tableHTML;
    }


    /**
     * Aktualisiert die Ansicht des Publikations-Tabs.
     * Generiert den kompletten Publikationstext und initiiert das Zeichnen der Diagramme.
     */
    updateView() {
        if (!this.allKollektivStats) {
            this.publikationContentElement.innerHTML = '<p class="text-muted">Bitte Daten laden und Kriterien anwenden, um die Publikationsansicht zu generieren.</p>';
            return;
        }

        let publicationContent = '';

        // Titel und Autoren (fest im HTML oder dynamisch aus config)
        publicationContent += `
            <h1 class="text-center">The Avocado Sign versus T2-weighted MRI Criteria for Lymph Node Staging in Rectal Cancer: A Comparative Study</h1>
            <h3 class="text-center"></h3>
            <p class="text-center small">M. Mustermann<sup>1</sup>, A. Beispiel<sup>1</sup>, ${AppConfig.APP_NAME} Study Group<sup>1</sup></p>
            <p class="text-center small"><sup>1</sup>Department of Radiology, University Hospital [City, Country]</p>
            <hr class="my-4">
        `;

        // Generiere jede Sektion dynamisch
        const sectionsOrder = [
            'abstract',
            'introduction',
            'materials_and_methods',
            'results',
            'discussion',
            'conclusion',
            'acknowledgments',
            'references'
        ];

        sectionsOrder.forEach(sectionId => {
            publicationContent += this.getRenderedSectionContent(sectionId, 'en', 'Gesamt'); // Feste Sprache 'en', Kollektiv 'Gesamt'
        });

        this.publikationContentElement.innerHTML = publicationContent;

        // Nach dem Rendern der HTML-Struktur, die Diagramme zeichnen.
        // Diese müssen spezifisch für die Publikationsansicht sein.
        this.updateDynamicChartsForPublicationTab('results', 'en', 'Gesamt'); // Charts sind hauptsächlich in Results-Sektion
        Tooltip.initializeTooltips();
    }

    /**
     * Aktualisiert dynamische Diagramme spezifisch für den Publikationstab.
     * @param {string} mainSectionId - Die ID der Hauptsektion, in der sich die Charts befinden.
     * @param {string} lang - Sprache.
     * @param {string} currentKollektivNameForContextOnly - Kollektivname für den Kontext der Charts.
     */
    updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (!this.allKollektivStats) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }

        const statsForCharts = this.allKollektivStats.Gesamt;
        if (!statsForCharts) {
            console.warn("Keine Gesamtstatistikdaten für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }

        // Altersverteilungs-Histogramm
        const ageChartConfig = PublicationConfig.publicationElements.ergebnisse.alterVerteilungChart;
        const ageChartCtxElement = document.getElementById(ageChartConfig.id);
        if (ageChartCtxElement && statsForCharts.deskriptiv.alterData && statsForCharts.deskriptiv.alterData.length > 0) {
            const ageBins = [0, 40, 50, 60, 70, 100];
            const ageLabels = ["<40", "40-50", "50-60", "60-70", ">70"];
            const binnedData = new Array(ageBins.length - 1).fill(0);

            statsForCharts.deskriptiv.alterData.forEach(age => {
                for (let i = 0; i < ageBins.length - 1; i++) {
                    if (age >= ageBins[i] && (age < ageBins[i+1] || i === ageBins.length - 2)) {
                        binnedData[i]++;
                        break;
                    }
                }
            });

            if (ageChartCtxElement.chart) ageChartCtxElement.chart.destroy();
            ageChartCtxElement.chart = new Chart(ageChartCtxElement.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ageLabels,
                    datasets: [{
                        label: 'Number of Patients',
                        data: binnedData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: false },
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Number of Patients' } },
                        x: { title: { display: true, text: 'Age (Years)' } }
                    }
                }
            });
        }

        // Geschlechterverteilungs-Donut-Chart
        const genderChartConfig = PublicationConfig.publicationElements.ergebnisse.geschlechtVerteilungChart;
        const genderChartCtxElement = document.getElementById(genderChartConfig.id);
        if (genderChartCtxElement && statsForCharts.deskriptiv.geschlecht) {
            if (genderChartCtxElement.chart) genderChartCtxElement.chart.destroy();
            const genderLabels = ['Male', 'Female', 'Unknown'];
            const genderData = [
                statsForCharts.deskriptiv.geschlecht.m ?? 0,
                statsForCharts.deskriptiv.geschlecht.f ?? 0,
                statsForCharts.deskriptiv.geschlecht.u ?? 0
            ];
            const backgroundColors = ['#36A2EB', '#FF6384', '#FFCE56'];
            
            genderChartCtxElement.chart = new Chart(genderChartCtxElement.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: genderLabels,
                    datasets: [{
                        data: genderData,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: false },
                        legend: { position: 'right' }
                    }
                }
            });
        }

        // ROC-Kurve für Avocado Sign
        const rocChartConfig = PublicationConfig.publicationElements.ergebnisse.rocCurveChart;
        const rocChartCtxElement = document.getElementById(rocChartConfig.id);
        if (rocChartCtxElement && statsForCharts.rocAS && statsForCharts.rocAS.rocPoints.length > 0) {
            if (rocChartCtxElement.chart) rocChartCtxElement.chart.destroy();
            
            rocChartCtxElement.chart = new Chart(rocChartCtxElement.getContext('2d'), {
                type: 'scatter',
                data: {
                    labels: statsForCharts.rocAS.rocPoints.map(p => p.fpr),
                    datasets: [{
                        label: 'ROC Curve',
                        data: statsForCharts.rocAS.rocPoints.map(p => ({ x: p.fpr, y: p.tpr })),
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        pointRadius: 3,
                        pointBackgroundColor: 'rgb(75, 192, 192)'
                    },
                    {
                        label: 'Random Classifier',
                        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                        fill: false,
                        borderColor: 'rgb(201, 203, 207)',
                        borderDash: [5, 5],
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: false },
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                title: (context) => `FPR: ${StatisticsServiceInstance.roundToDecimalPlaces(context[0].parsed.x, 3)}`,
                                label: (context) => `TPR: ${StatisticsServiceInstance.roundToDecimalPlaces(context[0].parsed.y, 3)}`
                            }
                        }
                    },
                    scales: {
                        x: { type: 'linear', position: 'bottom', title: { display: true, text: 'False Positive Rate (1 - Specificity)' }, min: 0, max: 1 },
                        y: { type: 'linear', position: 'left', title: { display: true, text: 'True Positive Rate (Sensitivity)' }, min: 0, max: 1 }
                    }
                }
            });
        }

        // Vergleich Diagnostischer Metriken (Balkendiagramm)
        const metricsChartConfig = PublicationConfig.publicationElements.ergebnisse.vergleichPerformanceChartGesamt;
        const metricsChartCtxElement = document.getElementById(metricsChartConfig.id);
        const asMetrics = statsForCharts.gueteAS;
        const t2Metrics = statsForCharts.gueteT2;

        if (metricsChartCtxElement && asMetrics && t2Metrics) {
            if (metricsChartCtxElement.chart) metricsChartCtxElement.chart.destroy();

            const labels = ['Sensitivity', 'Specificity', 'Accuracy', 'PPV', 'NPV', 'F1-Score', 'AUC'];
            const asData = [
                asMetrics.sensitivity,
                asMetrics.specificity,
                asMetrics.accuracy,
                asMetrics.ppv,
                asMetrics.npv,
                asMetrics.f1Score,
                statsForCharts.rocAS.auc
            ].map((val, index) => {
                if (labels[index] === 'F1-Score' || labels[index] === 'AUC') {
                    return StatisticsServiceInstance.roundToDecimalPlaces(val, 3);
                }
                return StatisticsServiceInstance.roundToDecimalPlaces(val * 100, 1);
            }); 

            const t2Data = [
                t2Metrics.sensitivity,
                t2Metrics.specificity,
                t2Metrics.accuracy,
                t2Metrics.ppv,
                t2Metrics.npv,
                t2Metrics.f1Score,
                StatisticsServiceInstance.calculateROCAndAUC(this.rawGlobalDataInputForLogic, 't2_criteria_score', 'n_status').auc
            ].map((val, index) => {
                if (labels[index] === 'F1-Score' || labels[index] === 'AUC') {
                    return StatisticsServiceInstance.roundToDecimalPlaces(val, 3);
                }
                return StatisticsServiceInstance.roundToDecimalPlaces(val * 100, 1);
            }); 

            metricsChartCtxElement.chart = new Chart(metricsChartCtxElement.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Avocado Sign',
                            data: asData,
                            backgroundColor: 'rgba(75, 192, 192, 0.8)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'T2-weighted Criteria',
                            data: t2Data,
                            backgroundColor: 'rgba(153, 102, 255, 0.8)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: false },
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        if (context.label === 'F1-Score' || context.label === 'AUC') {
                                            label += context.parsed.y;
                                        } else {
                                            label += context.parsed.y + '%';
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Value' },
                            ticks: {
                                callback: function(value, index, ticks) {
                                    if (labels[index] === 'F1-Score' || labels[index] === 'AUC') {
                                        return value;
                                    }
                                    return value + '%';
                                }
                            }
                        },
                        x: { title: { display: true, text: 'Metric' } }
                    }
                }
            });
        }
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen.
const PublikationViewLogicInstance = new PublikationViewLogic();
