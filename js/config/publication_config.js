const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
    defaultSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
    defaultBruteForceMetricForPublication: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,

    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage_ethik', label: 'Studiendesign und Ethik', titleDe: 'Studiendesign und Ethik', titleEn: 'Study Design and Ethics' }),
                Object.freeze({ id: 'methoden_patientenkohorte', label: 'Patientenkollektiv', titleDe: 'Patientenkollektiv', titleEn: 'Patient Cohort' }),
                Object.freeze({ id: 'methoden_bildakquisition', label: 'MRT-Protokoll und Bildakquisition', titleDe: 'MRT-Protokoll und Bildakquisition', titleEn: 'MRI Protocol and Image Acquisition' }),
                Object.freeze({ id: 'methoden_bildanalyse', label: 'Bildanalyse und Definitionen', titleDe: 'Bildanalyse und Definitionen (Avocado Sign, T2-Kriterien)', titleEn: 'Image Analysis and Definitions (Avocado Sign, T2 Criteria)' }),
                Object.freeze({ id: 'methoden_referenzstandard', label: 'Histopathologischer Referenzstandard', titleDe: 'Histopathologischer Referenzstandard', titleEn: 'Histopathological Reference Standard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', label: 'Statistische Analyse', titleDe: 'Statistische Analyse', titleEn: 'Statistical Analysis' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika', titleDe: 'Patientencharakteristika', titleEn: 'Patient Characteristics' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostische Güte: Avocado Sign', titleDe: 'Diagnostische Güte des Avocado Signs', titleEn: 'Diagnostic Performance of the Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostische Güte: Literatur-T2-Kriterien', titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien', titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien', titleDe: 'Diagnostische Güte der Brute-Force optimierten T2-Kriterien', titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria' }),
                Object.freeze({ id: 'ergebnisse_vergleich_as_vs_t2', label: 'Vergleich: AS vs. T2-Kriterien', titleDe: 'Statistischer Vergleich: Avocado Sign vs. T2-Kriterien', titleEn: 'Statistical Comparison: Avocado Sign vs. T2 Criteria' })
            ])
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_list', label: 'Literaturverzeichnis', titleDe: 'Literaturverzeichnis', titleEn: 'References' })
            ])
        })
    ]),

    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'Rutegård et al. (2025) / ESGAR 2016',
            shortName: 'ESGAR 2016',
            citationKey: 'Rutegard2025ESGAR'
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)',
            shortName: 'Koh et al.',
            citationKey: 'Koh2008'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'Barbaro et al. (2024)',
            shortName: 'Barbaro et al.',
            citationKey: 'Barbaro2024'
        })
    ]),

    bruteForceMetricsForPublication: Object.freeze([
        Object.freeze({ value: 'Balanced Accuracy', label: 'Balanced Accuracy' }),
        Object.freeze({ value: 'Accuracy', label: 'Accuracy' }),
        Object.freeze({ value: 'F1-Score', label: 'F1-Score' }),
        Object.freeze({ value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' }),
        Object.freeze({ value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' })
    ]),

    publicationElements: Object.freeze({
        figures: Object.freeze({
            consortDiagram: {
                id: 'pub-fig-consort',
                numberPlaceholder: 'Fig 1',
                titleDe: 'Flussdiagramm der Patientenauswahl (CONSORT-Äquivalent).',
                titleEn: 'Patient selection flowchart (CONSORT equivalent).',
                descriptionDe: 'Diagramm zur Veranschaulichung der eingeschlossenen und ausgeschlossenen Patienten gemäß den Studienkriterien.',
                descriptionEn: 'Diagram illustrating patient inclusion and exclusion according to study criteria.'
            },
            avocadoSignExamples: {
                id: 'pub-fig-avocado-examples',
                numberPlaceholder: 'Fig 2',
                titleDe: 'Beispiele für das Avocado Sign.',
                titleEn: 'Examples of the Avocado Sign.',
                descriptionDe: 'MRT-Bilder, die typische positive und negative Beispiele des Avocado Signs in mesorektalen Lymphknoten auf kontrastverstärkten T1-gewichteten Sequenzen zeigen (ähnlich Fig. 2 in Lurz & Schäfer 2025).',
                descriptionEn: 'MRI images demonstrating typical positive and negative examples of the Avocado Sign in mesorectal lymph nodes on contrast-enhanced T1-weighted sequences (similar to Fig. 2 in Lurz & Schäfer 2025).'
            },
            rocCurvesComparison: {
                id: 'pub-fig-roc-comparison',
                numberPlaceholder: 'Fig 3',
                titleDe: 'ROC-Kurven-Vergleich.',
                titleEn: 'ROC Curve Comparison.',
                descriptionDe: 'ROC-Kurven für das Avocado Sign und ausgewählte T2-Kriteriensets (z.B. bestes Literatur-Set, bestes BF-optimiertes Set) zur Vorhersage des N-Status im Gesamtkollektiv, inklusive AUC-Werte und 95% Konfidenzintervalle.',
                descriptionEn: 'ROC curves for the Avocado Sign and selected T2 criteria sets (e.g., best literature set, best BF-optimized set) for predicting N-status in the overall cohort, including AUC values and 95% confidence intervals.'
            },
            performanceComparisonOverall: {
                id: 'pub-fig-perf-comp-gesamt',
                numberPlaceholder: 'Fig 4a',
                titleDe: 'Performance-Vergleich (Gesamtkollektiv).',
                titleEn: 'Performance Comparison (Overall Cohort).',
                descriptionDe: 'Balkendiagramm: Sensitivität und Spezifität (mit 95% CI) von AS vs. optimiertem T2-Set vs. bestem Literatur-Set im Gesamtkollektiv.',
                descriptionEn: 'Bar chart: Sensitivity and specificity (with 95% CI) of AS vs. optimized T2 set vs. best literature set in the overall cohort.'
            },
            performanceComparisonDirektOP: {
                id: 'pub-fig-perf-comp-direktop',
                numberPlaceholder: 'Fig 4b',
                titleDe: 'Performance-Vergleich (Direkt-OP).',
                titleEn: 'Performance Comparison (Upfront Surgery).',
                descriptionDe: 'Balkendiagramm: Sensitivität und Spezifität (mit 95% CI) von AS vs. optimiertem T2-Set vs. bestem Literatur-Set im Direkt-OP-Kollektiv.',
                descriptionEn: 'Bar chart: Sensitivity and specificity (with 95% CI) of AS vs. optimized T2 set vs. best literature set in the upfront surgery cohort.'
            },
            performanceComparisonNRCT: {
                id: 'pub-fig-perf-comp-nrct',
                numberPlaceholder: 'Fig 4c',
                titleDe: 'Performance-Vergleich (nRCT).',
                titleEn: 'Performance Comparison (nRCT).',
                descriptionDe: 'Balkendiagramm: Sensitivität und Spezifität (mit 95% CI) von AS vs. optimiertem T2-Set vs. bestem Literatur-Set im nRCT-Kollektiv.',
                descriptionEn: 'Bar chart: Sensitivity and specificity (with 95% CI) of AS vs. optimized T2 set vs. best literature set in the nRCT cohort.'
            }
        }),
        tables: Object.freeze({
            patientCharacteristics: {
                id: 'pub-table-patient-characteristics',
                numberPlaceholder: 'Table 1',
                titleDe: 'Basischarakteristika der Studienpopulation.',
                titleEn: 'Baseline Characteristics of the Study Population.',
                descriptionDe: 'Demographische und klinische Daten der Patienten, stratifiziert nach Gesamtkollektiv, Direkt-OP-Gruppe und nRCT-Gruppe.',
                descriptionEn: 'Demographic and clinical data of patients, stratified by overall cohort, upfront surgery group, and nRCT group.'
            },
            mrtSequences: {
                id: 'pub-table-mrt-sequences',
                numberPlaceholder: 'Table 2',
                titleDe: 'MRT-Sequenzparameter.',
                titleEn: 'MRI Sequence Parameters.',
                descriptionDe: 'Detaillierte Parameter der verwendeten MRT-Sequenzen (ähnlich Tabelle 1 in Lurz & Schäfer 2025).',
                descriptionEn: 'Detailed parameters of the MRI sequences used (similar to Table 1 in Lurz & Schäfer 2025).'
            },
            literatureT2CriteriaOverview: {
                id: 'pub-table-literature-t2-overview',
                numberPlaceholder: 'Table 3',
                titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets.',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets.',
                descriptionDe: 'Definitionen und Original-Zielkollektive der herangezogenen T2-Kriteriensets aus der Literatur.',
                descriptionEn: 'Definitions and original target cohorts of the referenced literature-based T2 criteria sets.'
            },
            performanceAS: {
                id: 'pub-table-performance-as',
                numberPlaceholder: 'Table 4',
                titleDe: 'Diagnostische Güte des Avocado Signs (AS) für den N-Status.',
                titleEn: 'Diagnostic Performance of the Avocado Sign (AS) for N-Status.',
                descriptionDe: 'Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC/Balanced Accuracy des AS mit 95% Konfidenzintervallen, stratifiziert nach Gesamtkollektiv, Direkt-OP und nRCT.',
                descriptionEn: 'Sensitivity, specificity, PPV, NPV, accuracy, and AUC/Balanced Accuracy of AS with 95% confidence intervals, stratified by overall, upfront surgery, and nRCT cohorts.'
            },
            performanceLiteratureT2: {
                id: 'pub-table-performance-literature-t2',
                numberPlaceholder: 'Table 5',
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriteriensets für den N-Status.',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria Sets for N-Status.',
                descriptionDe: 'Performance-Metriken (wie für AS) für die evaluierten Literatur-Sets, jeweils auf ihrem relevanten Zielkollektiv.',
                descriptionEn: 'Performance metrics (as for AS) for the evaluated literature sets, each on their relevant target cohort.'
            },
            performanceOptimizedT2: {
                id: 'pub-table-performance-optimized-t2',
                numberPlaceholder: 'Table 6',
                titleDe: 'Diagnostische Güte der Brute-Force optimierten T2-Kriteriensets für den N-Status (Zielmetrik: {BF_METRIC}).',
                titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria Sets for N-Status (Target Metric: {BF_METRIC}).',
                descriptionDe: 'Performance-Metriken (wie für AS) für die BF-optimierten Sets, stratifiziert nach Gesamtkollektiv, Direkt-OP und nRCT, inklusive der genauen Kriteriendefinition.',
                descriptionEn: 'Performance metrics (as for AS) for the BF-optimized sets, stratified by overall, upfront surgery, and nRCT cohorts, including the exact criteria definition.'
            },
            comparisonASvsT2: {
                id: 'pub-table-comparison-as-vs-t2',
                numberPlaceholder: 'Table 7',
                titleDe: 'Statistischer Vergleich der diagnostischen Leistung: AS vs. ausgewählte T2-Kriteriensets.',
                titleEn: 'Statistical Comparison of Diagnostic Performance: AS vs. Selected T2 Criteria Sets.',
                descriptionDe: 'Ergebnisse der McNemar- (Accuracy) und DeLong-Tests (AUC) für den paarweisen Vergleich von AS mit den besten Literatur- und optimierten T2-Sets pro Kollektiv.',
                descriptionEn: 'Results of McNemar (accuracy) and DeLong tests (AUC) for pairwise comparison of AS with the best literature and optimized T2 sets per cohort.'
            }
        })
    }),

    referenceManagement: Object.freeze({
        citationStyle: 'vancouver',
        references: Object.freeze([
            Object.freeze({ key: 'Lurz2025', text: 'Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025; Published online Feb 26. DOI: 10.1007/s00330-025-11462-y.' }),
            Object.freeze({ key: 'Koh2008', text: 'Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.' }),
            Object.freeze({ key: 'Barbaro2024', text: 'Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.' }),
            Object.freeze({ key: 'Rutegard2025', text: 'Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025; Published online Jan 21. DOI: 10.1007/s00330-025-11361-2.' }),
            Object.freeze({ key: 'BeetsTan2018ESGAR', text: 'Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475.' }),
            Object.freeze({ key: 'Brown2003', text: 'Brown G, Richards CJ, Bourne MW, et al. Morphologic predictors of lymph node status in rectal cancer with use of high-spatial-resolution MR imaging with histopathologic comparison. Radiology. 2003;227(2):371-377.' }),
            Object.freeze({ key: 'Kaur2012', text: 'Kaur H, Choi H, You YN, et al. MR Imaging for Preoperative Evaluation of Primary Rectal Cancer: Practical Considerations. RadioGraphics. 2012;32(2):389-409.' }),
            Object.freeze({ key: 'Horvat2019', text: 'Horvat N, Rocha CCT, Oliveira BC, Petkovska I, Gollub MJ. MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management. RadioGraphics. 2019;39(2):367-387.' }),
            Object.freeze({ key: 'Lahaye2009', text: 'Lahaye MJ, Beets GL, Engelen SME, et al. Locally Advanced Rectal Cancer: MR Imaging for Restaging after Neoadjuvant Radiation Therapy with Concomitant Chemotherapy. Part II. What Are the Criteria to Predict Involved Lymph Nodes? Radiology. 2009;252(1):81-91.' }),
            Object.freeze({ key: 'Vliegen2005', text: 'Vliegen RFA, Beets GL, von Meyenfeldt MF, et al. Rectal Cancer: MR Imaging in Local Staging—Is Gadolinium-based Contrast Material Helpful? Radiology. 2005;234(1):179-188.' })
        ])
    })
});
