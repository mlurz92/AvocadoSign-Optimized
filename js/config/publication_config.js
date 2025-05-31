const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden', // Startsektion
    sections: Object.freeze([
        Object.freeze({
            id: 'einleitung', // Hinzugefügt für Vollständigkeit
            labelKey: 'einleitung',
            subSections: Object.freeze([
                Object.freeze({ id: 'einleitung_hintergrund', label: 'Hintergrund und Zielsetzung' })
            ])
        }),
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Studiendesign und Ethik' }),
                Object.freeze({ id: 'methoden_patientenkollektiv', label: 'Patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', label: 'MRT-Protokoll & Kontrastmittelgabe' }),
                Object.freeze({ id: 'methoden_as_definition', label: 'Definition & Bewertung Avocado Sign' }),
                Object.freeze({ id: 'methoden_t2_definition', label: 'Definition & Bewertung T2-Kriterien' }),
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
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', label: 'Vergleich: AS vs. T2-Kriterien' })
            ])
        }),
        Object.freeze({
            id: 'diskussion', // Hinzugefügt für Vollständigkeit
            labelKey: 'diskussion',
            subSections: Object.freeze([
                Object.freeze({ id: 'diskussion_hauptergebnisse', label: 'Zusammenfassung Hauptergebnisse' }),
                Object.freeze({ id: 'diskussion_vergleich_literatur', label: 'Vergleich mit Literatur' }),
                Object.freeze({ id: 'diskussion_limitationen', label: 'Limitationen der Studie' }),
                Object.freeze({ id: 'diskussion_schlussfolgerung', label: 'Schlussfolgerung und Ausblick' })
            ])
        }),
        Object.freeze({ // Hinzugefügt für Vollständigkeit
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_liste', label: 'Literaturverzeichnis' })
            ])
        })
    ]),
    literatureCriteriaSets: Object.freeze([ // Beibehalten für Konsistenz mit study_criteria_manager
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'Rutegård et al. (2025) / ESGAR 2016', // Wird für Anzeige verwendet
            shortName: 'ESGAR 2016'
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)',
            shortName: 'Koh et al.'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'Barbaro et al. (2024)',
            shortName: 'Barbaro et al.'
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([ // Auswahl für BF-Ergebnisse im Publikationstab
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
        { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy', // Wird für Textgenerierung verwendet
    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets',
                titleEn: 'Table 2: Overview of Literature-Based T2 Criteria Sets',
                captionDe: 'Ausgewählte publizierte T2-Kriteriensets für das Lymphknoten-Staging beim Rektumkarzinom.',
                captionEn: 'Selected published T2 criteria sets for lymph node staging in rectal cancer.'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle 1: Patientencharakteristika',
                titleEn: 'Table 1: Patient Characteristics',
                captionDe: 'Demographische und klinische Charakteristika des Studienkollektivs, stratifiziert nach Therapiegruppe.',
                captionEn: 'Demographic and clinical characteristics of the study cohort, stratified by treatment group.'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Tabelle 3: Diagnostische Güte des Avocado Signs (vs. N-Status)',
                titleEn: 'Table 3: Diagnostic Performance of the Avocado Sign (vs. N-Status)',
                captionDe: 'Sensitivität, Spezifität, Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Accuracy (Acc) und Area Under Curve (AUC) des Avocado Signs für die drei untersuchten Kollektive. Alle Werte mit 95% Konfidenzintervall (KI).',
                captionEn: 'Sensitivity, Specificity, Positive Predictive Value (PPV), Negative Predictive Value (NPV), Accuracy (Acc), and Area Under Curve (AUC) of the Avocado Sign for the three investigated cohorts. All values with 95% confidence interval (CI).'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Tabelle 4: Diagnostische Güte der Literatur-basierten T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 4: Diagnostic Performance of Literature-Based T2 Criteria (vs. N-Status)',
                captionDe: 'Diagnostische Gütekriterien der Literatur-basierten T2-Sets, evaluiert auf den jeweiligen Zielkollektiven. Alle Werte mit 95% KI.',
                captionEn: 'Diagnostic performance metrics of literature-based T2 sets, evaluated on their respective target cohorts. All values with 95% CI.'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Tabelle 5: Diagnostische Güte der für {BF_METRIC} optimierten T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 5: Diagnostic Performance of T2 Criteria Optimized for {BF_METRIC} (vs. N-Status)',
                captionDe: 'Diagnostische Gütekriterien der mittels Brute-Force für die Zielmetrik {BF_METRIC} optimierten T2-Kriteriensets für die drei untersuchten Kollektive. Alle Werte mit 95% KI.',
                captionEn: 'Diagnostic performance metrics of the T2 criteria sets optimized for the target metric {BF_METRIC} using brute-force for the three investigated cohorts. All values with 95% CI.'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Tabelle 6: Statistischer Vergleich der AUC: Avocado Sign vs. T2-Kriterien',
                titleEn: 'Table 6: Statistical Comparison of AUC: Avocado Sign vs. T2 Criteria',
                captionDe: 'Vergleich der Area Under Curve (AUC) zwischen dem Avocado Sign und ausgewählten T2-Kriteriensets (Literatur-basiert und für {BF_METRIC} optimiert) mittels DeLong-Test für gepaarte Daten. Signifikanzsymbole: *p<0.05, **p<0.01, ***p<0.001.',
                captionEn: 'Comparison of the Area Under Curve (AUC) between the Avocado Sign and selected T2 criteria sets (literature-based and optimized for {BF_METRIC}) using DeLong\'s test for paired data. Significance symbols: *p<0.05, **p<0.01, ***p<0.001.'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt', // Eindeutige ID für das Diagramm
                titleDe: 'Abb. 1a: Altersverteilung (Gesamtkollektiv)',
                titleEn: 'Fig. 1a: Age Distribution (Overall Cohort)',
                captionDe: 'Histogramm der Altersverteilung der 106 Patienten im Gesamtkollektiv.',
                captionEn: 'Histogram of age distribution for the 106 patients in the overall cohort.'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Abb. 1b: Geschlechterverteilung (Gesamtkollektiv)',
                titleEn: 'Fig. 1b: Gender Distribution (Overall Cohort)',
                captionDe: 'Tortendiagramm der Geschlechterverteilung im Gesamtkollektiv (N=106).',
                captionEn: 'Pie chart of gender distribution in the overall cohort (N=106).'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Abb. 2a: Vergleichsmetriken für Gesamtkollektiv (AS vs. T2 Opt.)',
                titleEn: 'Fig. 2a: Comparative Metrics for Overall Cohort (AS vs. T2 Opt.)',
                captionDe: 'Vergleich der diagnostischen Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, AUC) zwischen Avocado Sign (AS) und für {BF_METRIC} optimierten T2-Kriterien (T2 Opt.) im Gesamtkollektiv (N=[N_GESAMT]). Fehlerbalken zeigen 95% Konfidenzintervalle.',
                captionEn: 'Comparison of diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) between Avocado Sign (AS) and T2 criteria optimized for {BF_METRIC} (T2 Opt.) in the overall cohort (N=[N_GESAMT]). Error bars indicate 95% confidence intervals.'
            },
            vergleichPerformanceChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Abb. 2b: Vergleichsmetriken für Direkt-OP Kollektiv (AS vs. T2 Opt.)',
                titleEn: 'Fig. 2b: Comparative Metrics for Upfront Surgery Cohort (AS vs. T2 Opt.)',
                captionDe: 'Vergleich der diagnostischen Gütekriterien zwischen AS und für {BF_METRIC} optimierten T2-Kriterien (T2 Opt.) im Direkt-OP Kollektiv (N=[N_DIREKT_OP]). Fehlerbalken zeigen 95% Konfidenzintervalle.',
                captionEn: 'Comparison of diagnostic performance metrics between AS and T2 criteria optimized for {BF_METRIC} (T2 Opt.) in the upfront surgery cohort (N=[N_DIREKT_OP]). Error bars indicate 95% confidence intervals.'
            },
            vergleichPerformanceChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Abb. 2c: Vergleichsmetriken für nRCT Kollektiv (AS vs. T2 Opt.)',
                titleEn: 'Fig. 2c: Comparative Metrics for nRCT Cohort (AS vs. T2 Opt.)',
                captionDe: 'Vergleich der diagnostischen Gütekriterien zwischen AS und für {BF_METRIC} optimierten T2-Kriterien (T2 Opt.) im nRCT Kollektiv (N=[N_NRCT]). Fehlerbalken zeigen 95% Konfidenzintervalle.',
                captionEn: 'Comparison of diagnostic performance metrics between AS and T2 criteria optimized for {BF_METRIC} (T2 Opt.) in the nRCT cohort (N=[N_NRCT]). Error bars indicate 95% confidence intervals.'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
