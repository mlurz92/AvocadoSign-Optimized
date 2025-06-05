const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'abstract',
    sections: Object.freeze([
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_main', label: 'Abstract & Key Results' })
            ])
        }),
        Object.freeze({
            id: 'introduction',
            labelKey: 'introduction',
            subSections: Object.freeze([
                Object.freeze({ id: 'introduction_main', label: 'Einleitung' })
            ])
        }),
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage_ethik', label: 'Studiendesign und Ethikvotum' }),
                Object.freeze({ id: 'methoden_patientenkohorte', label: 'Patientenkohorte und Einschlusskriterien' }),
                Object.freeze({ id: 'methoden_mrt_protokoll_akquisition', label: 'MRT-Protokoll und Bildakquisition' }),
                Object.freeze({ id: 'methoden_bildanalyse_avocado_sign', label: 'Bildanalyse: Avocado Sign' }),
                Object.freeze({ id: 'methoden_bildanalyse_t2_kriterien', label: 'Bildanalyse: T2-gewichtete Kriterien' }),
                Object.freeze({ id: 'methoden_referenzstandard_histopathologie', label: 'Referenzstandard: Histopathologie' }),
                Object.freeze({ id: 'methoden_statistische_analyse_methoden', label: 'Statistische Analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika und Datenfluss' }),
                Object.freeze({ id: 'ergebnisse_as_diagnostische_guete', label: 'Diagnostische Güte: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_t2_literatur_diagnostische_guete', label: 'Diagnostische Güte: T2-Kriterien (Literatur)' }),
                Object.freeze({ id: 'ergebnisse_t2_optimiert_diagnostische_guete', label: 'Diagnostische Güte: T2-Kriterien (Brute-Force optimiert)' }),
                Object.freeze({ id: 'ergebnisse_vergleich_as_vs_t2', label: 'Vergleichsanalysen: Avocado Sign vs. T2-Kriterien' })
            ])
        }),
        Object.freeze({
            id: 'discussion',
            labelKey: 'discussion',
            subSections: Object.freeze([
                Object.freeze({ id: 'discussion_main', label: 'Diskussion der Ergebnisse und Limitationen' })
            ])
        }),
        Object.freeze({
            id: 'references',
            labelKey: 'references',
            subSections: Object.freeze([
                Object.freeze({ id: 'references_main', label: 'Literaturverzeichnis' })
            ])
        })
    ]),
    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'koh_2008_morphology',
            labelKey: 'Koh et al. (2008)'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            labelKey: 'Barbaro et al. (2024)'
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            labelKey: 'Rutegård et al. (2025) / ESGAR 2016'
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
        { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',
    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets'
            },
            flowDiagram: {
                id: 'pub-figure-flow-diagram',
                titleDe: 'Flussdiagramm der Patientenrekrutierung und -analyse',
                titleEn: 'Patient Recruitment and Analysis Flowchart'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Baseline Patientencharakteristika und klinische Daten',
                titleEn: 'Baseline Patient Characteristics and Clinical Data'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Diagnostische Güte des Avocado Signs für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Diagnostische Güte der Brute-Force optimierten T2-Kriterien (Ziel: {BF_METRIC}) für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: {BF_METRIC}) for N-Status Prediction'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Statistischer Vergleich der diagnostischen Güte: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria (Literature and Optimized)'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Altersverteilung im Gesamtkollektiv',
                titleEn: 'Age Distribution in the Overall Cohort'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Geschlechterverteilung im Gesamtkollektiv',
                titleEn: 'Gender Distribution in the Overall Cohort'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Vergleichsmetriken für das Gesamtkollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria'
            },
            vergleichPerformanceChartdirektOP: { // Schlüssel korrigiert (war vorher vergleichPerformanceChartDirektOP)
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Vergleichsmetriken für das Direkt-OP Kollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Comparative Metrics for the Upfront Surgery Cohort: AS vs. Optimized T2 Criteria'
            },
            vergleichPerformanceChartnRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Vergleichsmetriken für das nRCT Kollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Comparative Metrics for the nRCT Cohort: AS vs. Optimized T2 Criteria'
            }
        })
    }),
    DEFAULT_ABSTRACT_TEXT_DE: `
        **Ziele:** Das "Avocado Sign" (AS), ein neuer kontrastmittel-basierter MRT-Marker, wurde zur Prädiktion des mesorektalen Lymphknotenbefalls beim Rektumkarzinom evaluiert und mit T2-gewichteten Kriterien verglichen.
        **Methoden:** Diese retrospektive Studie umfasste 106 Patienten mit Rektumkarzinom. Das Avocado Sign (hypointenser Kern in homogen hyperintensem Lymphknoten auf kontrastverstärkten T1-gewichteten Bildern) wurde beurteilt. Zusätzlich wurden T2-gewichtete morphologische Kriterien (Literatur-basiert und datengetrieben optimiert) analysiert. 77 Patienten erhielten neoadjuvante Radiochemotherapie. Der histopathologische Befund diente als Referenzstandard. Diagnostische Metriken wurden berechnet und verglichen.
        **Ergebnisse:** Das Avocado Sign zeigte eine hohe diagnostische Genauigkeit (Sensitivität 88,7%, Spezifität 84,9%, Accuracy 86,8%, AUC 0,87). Seine Leistung war robust in der Primärchirurgie- (Sensitivität 100%, Spezifität 83,3%, AUC 0,92) und der nRCT-Gruppe (Sensitivität 84,2%, Spezifität 85,4%, AUC 0,85). Literatur-basierte T2-Kriterien zeigten variable Ergebnisse. Für das Gesamtkollektiv optimierte T2-Kriterien erreichten eine AUC von [PLATZHALTER_AUC_T2_OPTIMIERT_GESAMT]. Im direkten Vergleich zeigte das AS [eine überlegene/vergleichbare/unterlegene] Performance gegenüber optimierten T2-Kriterien (p=[PLATZHALTER_P_WERT_VERGLEICH]).
        **Fazit:** Das Avocado Sign ist ein vielversprechender Prädiktor für den mesorektalen Lymphknotenstatus. Seine einfache Anwendung und hohe diagnostische Genauigkeit unterstreichen sein Potenzial, das MRT-Staging zu verfeinern. Weitere Validierung ist erforderlich.
        `,
    DEFAULT_ABSTRACT_TEXT_EN: `
        **Objectives:** The "Avocado Sign" (AS), a novel contrast-enhanced MRI marker, was evaluated for predicting mesorectal lymph node involvement in rectal cancer and compared with T2-weighted criteria.
        **Methods:** This retrospective study included 106 patients with rectal cancer. The Avocado Sign (hypointense core within a homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images) was assessed. Additionally, T2-weighted morphological criteria (literature-based and data-driven optimized) were analyzed. Seventy-seven patients received neoadjuvant chemoradiotherapy. Histopathology served as the reference standard. Diagnostic metrics were calculated and compared.
        **Results:** The Avocado Sign demonstrated high diagnostic accuracy (sensitivity 88.7%, specificity 84.9%, accuracy 86.8%, AUC 0.87). Its performance was robust in the upfront surgery (sensitivity 100%, specificity 83.3%, AUC 0.92) and nRCT groups (sensitivity 84.2%, specificity 85.4%, AUC 0.85). Literature-based T2 criteria showed variable results. T2 criteria optimized for the overall cohort achieved an AUC of [PLACEHOLDER_AUC_T2_OPTIMIZED_OVERALL]. In direct comparison, the AS showed [superior/comparable/inferior] performance to optimized T2 criteria (p=[PLACEHOLDER_P_VALUE_COMPARISON]).
        **Conclusion:** The Avocado Sign is a promising predictor for mesorectal lymph node status. Its straightforward application and high diagnostic accuracy underscore its potential to refine MRI staging. Further validation is warranted.
        `,
    DEFAULT_KEY_RESULTS_TEXT_DE: `
        Das Avocado Sign zeigte eine hohe diagnostische Genauigkeit (AUC 0,87) für den Lymphknotenbefall beim Rektumkarzinom.
        Die Leistung des Avocado Signs war robust sowohl bei primär operierten Patienten als auch nach neoadjuvanter Therapie.
        Im Vergleich zu optimierten T2-gewichteten Kriterien zeigte das Avocado Sign eine [ÜBERLEGENE/VERGLEICHBARE/UNTERLEGENE] diagnostische Güte.
        `,
    DEFAULT_KEY_RESULTS_TEXT_EN: `
        The Avocado Sign demonstrated high diagnostic accuracy (AUC 0.87) for lymph node involvement in rectal cancer.
        The performance of the Avocado Sign was robust in both upfront surgery patients and after neoadjuvant therapy.
        Compared to optimized T2-weighted criteria, the Avocado Sign showed [SUPERIOR/COMPARABLE/INFERIOR] diagnostic performance.
        `
});

function getDefaultT2Criteria() {
    return Object.freeze({
        logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        size: { active: true, threshold: 5.0, condition: '>=' },
        form: { active: false, value: 'rund' },
        kontur: { active: false, value: 'irregulär' },
        homogenitaet: { active: false, value: 'heterogen' },
        signal: { active: false, value: 'signalreich' }
    });
}
