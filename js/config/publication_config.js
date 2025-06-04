const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'abstract', // Geändert, da Abstract oft der erste Abschnitt ist
    sections: Object.freeze([
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_main', label: 'Abstract & Key Results' })
            ])
        }),
        Object.freeze({
            id: 'introduction', // Hinzugefügt für vollständige Publikationsstruktur
            labelKey: 'introduction',
            subSections: Object.freeze([
                Object.freeze({ id: 'introduction_main', label: 'Einleitung' })
            ])
        }),
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Studiendesign und Ethik' }),
                Object.freeze({ id: 'methoden_patientenkollektiv', label: 'Patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', label: 'MRT-Protokoll' }), // Vereinfacht
                Object.freeze({ id: 'methoden_as_definition', label: 'Avocado Sign Definition & Bewertung' }), // Detaillierter
                Object.freeze({ id: 'methoden_t2_definition', label: 'T2-Kriterien Definition & Bewertung' }), // Detaillierter
                Object.freeze({ id: 'methoden_referenzstandard', label: 'Referenzstandard (Histopathologie)' }),
                Object.freeze({ id: 'methoden_statistische_analyse', label: 'Statistische Analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostische Güte: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostische Güte: Literatur-T2-Kriterien' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', label: 'Vergleich: AS vs. T2-Kriterien' })
            ])
        }),
        Object.freeze({
            id: 'discussion', // Hinzugefügt
            labelKey: 'discussion',
            subSections: Object.freeze([
                Object.freeze({ id: 'discussion_main', label: 'Diskussion' })
            ])
        }),
        Object.freeze({
            id: 'references', // Hinzugefügt
            labelKey: 'references',
            subSections: Object.freeze([
                Object.freeze({ id: 'references_main', label: 'Referenzen' })
            ])
        })
    ]),
    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'koh_2008_morphology',
            labelKey: 'Koh et al. (2008)' // Name für Anzeige
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            labelKey: 'Barbaro et al. (2024)' // Name für Anzeige
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            labelKey: 'Rutegård et al. (2025) / ESGAR 2016' // Name für Anzeige
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
                titleDe: 'Übersicht der Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Literature-Based T2 Criteria Sets'
            },
            flowDiagram: {
                id: 'pub-figure-flow-diagram',
                titleDe: 'Flussdiagramm Patienteninklusion',
                titleEn: 'Patient Inclusion Flowchart'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Patientencharakteristika',
                titleEn: 'Patient Characteristics'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Diagnostische Güte: Avocado Sign (vs. N-Status)',
                titleEn: 'Diagnostic Performance: Avocado Sign (vs. N-Status)'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Diagnostische Güte: Literatur-basierte T2-Kriterien (vs. N-Status)',
                titleEn: 'Diagnostic Performance: Literature-Based T2 Criteria (vs. N-Status)'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Diagnostische Güte: Optimierte T2-Kriterien (Ziel: {BF_METRIC}, vs. N-Status)',
                titleEn: 'Diagnostic Performance: Optimized T2 Criteria (Target: {BF_METRIC}, vs. N-Status)'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Statistischer Vergleich: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Statistical Comparison: Avocado Sign vs. T2 Criteria (Literature and Optimized)'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Altersverteilung (Gesamtkollektiv)',
                titleEn: 'Age Distribution (Overall Cohort)'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Geschlechterverteilung (Gesamtkollektiv)',
                titleEn: 'Gender Distribution (Overall Cohort)'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Vergleichsmetriken für Gesamtkollektiv',
                titleEn: 'Comparative Metrics for Overall Cohort'
            },
            vergleichPerformanceChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Vergleichsmetriken für Direkt-OP Kollektiv',
                titleEn: 'Comparative Metrics for Upfront Surgery Cohort'
            },
            vergleichPerformanceChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Vergleichsmetriken für nRCT Kollektiv',
                titleEn: 'Comparative Metrics for nRCT Cohort'
            }
        })
    }),
    DEFAULT_ABSTRACT_TEXT_DE: `
        **Ziele:** Das "Avocado Sign" (AS), ein neuer kontrastmittel-basierter MRT-Marker, wurde zur Prädiktion des mesorektalen Lymphknotenbefalls beim Rektumkarzinom evaluiert.
        **Methoden:** Diese retrospektive Studie umfasste 106 Patienten. Das Avocado Sign (hypointenser Kern in homogen hyperintensem Lymphknoten auf kontrastverstärkten T1-gewichteten Bildern) wurde beurteilt. 77 Patienten erhielten neoadjuvante Radiochemotherapie. Der histopathologische Befund diente als Referenzstandard. Diagnostische Metriken und Interobserver-Agreement (Cohen's Kappa) wurden berechnet.
        **Ergebnisse:** Das Avocado Sign zeigte eine hohe diagnostische Genauigkeit für Lymphknotenbefall (Sensitivität 88,7%, Spezifität 84,9%, PPV 85,5%, NPV 88,2%, Genauigkeit 86,8%, AUC 0,87). Die Leistung war exzellent in der Primärchirurgiegruppe (Sens. 100%, Spez. 83,3%) und nach neoadjuvanter Therapie (Sens. 84,2%, Spez. 85,4%). Die Interobserver-Übereinstimmung war nahezu perfekt ($\kappa=0,92$).
        **Fazit:** Das Avocado Sign ist ein vielversprechender Prädiktor für den mesorektalen Lymphknotenstatus. Seine einfache Anwendung, hohe Reproduzierbarkeit und bemerkenswerte diagnostische Genauigkeit unterstreichen sein Potenzial, das MRT-Staging zu verfeinern. Weitere Validierung ist erforderlich.
        `,
    DEFAULT_ABSTRACT_TEXT_EN: `
        **Objectives:** The "Avocado Sign" (AS), a novel contrast-enhanced MRI marker, was evaluated for predicting mesorectal lymph node involvement in rectal cancer.
        **Methods:** This retrospective study included 106 patients. The Avocado Sign (hypointense core within homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images) was assessed. 77 patients received neoadjuvant chemoradiotherapy. Histopathology served as the reference standard. Diagnostic metrics and interobserver agreement (Cohen's Kappa) were calculated.
        **Results:** The Avocado Sign demonstrated high diagnostic accuracy for lymph node involvement (sensitivity 88.7%, specificity 84.9%, PPV 85.5%, NPV 88.2%, accuracy 86.8%, AUC 0.87). Performance was excellent in the upfront surgery group (Sens. 100%, Spec. 83.3%) and after neoadjuvant therapy (Sens. 84.2%, Spec. 85.4%). Interobserver agreement was almost perfect ($\kappa=0.92$).
        **Conclusion:** The Avocado Sign is a promising predictor for mesorectal lymph node status. Its straightforward application, high reproducibility, and remarkable diagnostic accuracy underscore its potential to refine MRI staging. Further validation is warranted.
        `,
    DEFAULT_KEY_RESULTS_TEXT_DE: `
        Das Avocado Sign zeigte eine hohe diagnostische Genauigkeit (Genauigkeit 86,8%, AUC 0,87) für den Lymphknotenbefall beim Rektumkarzinom, unabhängig von der vorherigen neoadjuvanten Therapie.
        Die Performance des Avocado Signs war vergleichbar oder überlegen gegenüber etablierten T2-basierten morphologischen Kriterien, die aus der Literatur adaptiert wurden.
        Die Implementierung eines Brute-Force-Algorithmus identifizierte optimierte T2-Kriterienkombinationen, welche die Vorhersageleistung weiter verbessern können.
        `,
    DEFAULT_KEY_RESULTS_TEXT_EN: `
        The Avocado Sign demonstrated high diagnostic accuracy (accuracy 86.8%, AUC 0.87) for lymph node involvement in rectal cancer, irrespective of prior neoadjuvant therapy.
        The performance of the Avocado Sign was comparable or superior to established T2-weighted morphological criteria adapted from literature.
        Implementation of a brute-force algorithm identified optimized T2-weighted criteria combinations that can further improve predictive performance.
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
