const AppConfig = {
    appName: "Avocado Sign - Radiology",
    appVersion: "2.6.0",
    debug: true,

    settings: {
        initialTab: 'daten',
        bruteForce: {
            maxIterations: 10000,
            chunkSize: 500,
            thresholdStep: 0.01
        },
        chartColors: {
            avocado: 'rgba(128, 155, 6, 1)',
            t2: 'rgba(255, 99, 132, 1)',
            bruteForce: 'rgba(54, 162, 235, 1)',
            reference: 'rgba(128, 128, 128, 1)'
        },
        confidenceLevel: 0.95
    },

    domIds: {
        appContainer: 'app-container',
        tabContainer: 'tab-container',
        contentContainer: 'content-container',
        tabs: {
            data: 'daten-tab-content',
            auswertung: 'auswertung-tab-content',
            statistik: 'statistik-tab-content',
            publikation: 'publikation-tab-content',
            praesentation: 'praesentation-tab-content',
        },
        buttons: {
            updateData: 'update-data-btn',
            resetData: 'reset-data-btn',
            startBruteForce: 'start-brute-force-btn',
            downloadPublication: 'download-publication-btn',
            downloadPresentation: 'download-presentation-btn'
        },
        inputs: {
            dataTable: 'data-table-container',
            t2CriteriaSelect: 't2-criteria-select',
            bruteForceProgress: 'brute-force-progress',
            bruteForceProgressLabel: 'brute-force-progress-label',
            resultsTable: 'results-table',
            rocChart: 'roc-chart',
            publicationContent: 'publication-content',
            presentationContent: 'presentation-content',
            avocadoTNM: 'avocado-tnm-select',
            avocadoEMVI: 'avocado-emvi-select',
            avocadoTumorart: 'avocado-tumorart-select',
            avocadoLokalisation: 'avocado-lokalisation-select'
        },
        sections: {
            criteriaSelection: 'criteria-selection-section',
            bruteForce: 'brute-force-section',
            results: 'results-section',
            charts: 'charts-section'
        }
    },

    text: {
        labels: {
            truePositive: "Richtig Positiv (RP)",
            falsePositive: "Falsch Positiv (FP)",
            trueNegative: "Richtig Negativ (RN)",
            falseNegative: "Falsch Negativ (FN)",
            sensitivity: "Sensitivität",
            specificity: "Spezifität",
            ppv: "Positiver Prädiktionswert (PPV)",
            npv: "Negativer Prädiktionswert (NPV)",
            accuracy: "Genauigkeit",
            youdenIndex: "Youden-Index",
            areaUnderCurve: "Area Under Curve (AUC)",
            confidenceInterval: "95% Konfidenzintervall"
        },
        tooltips: {
            sensitivity: "Anteil der korrekt als positiv klassifizierten Fälle an allen tatsächlich positiven Fällen.",
            specificity: "Anteil der korrekt als negativ klassifizierten Fälle an allen tatsächlich negativen Fällen.",
            ppv: "Wahrscheinlichkeit, dass ein positives Testergebnis tatsächlich auf eine Erkrankung hinweist.",
            npv: "Wahrscheinlichkeit, dass ein negatives Testergebnis tatsächlich auf das Fehlen der Erkrankung hinweist.",
            accuracy: "Anteil der korrekten Klassifikationen an der Gesamtzahl der Fälle.",
            youdenIndex: "Ein Maß für die diagnostische Effektivität (Sensitivität + Spezifität - 1).",
            auc: "Die Fläche unter der ROC-Kurve; ein Maß für die Güte des diagnostischen Tests.",
            ci: "Der Bereich, in dem der wahre Wert des Parameters mit 95%iger Wahrscheinlichkeit liegt."
        },
        publication: {
            title: "The Avocado Sign: A Novel T2-based MRI Criterion for Rectal Cancer Lymph Node Staging and its Comparison to Established and Optimized Morphologic Criteria",
            abstract: "Zusammenfassung...",
            introduction: "Einleitung...",
            methods: "Methoden...",
            results: "Ergebnisse...",
            discussion: "Diskussion...",
            conclusion: "Schlussfolgerung...",
            references: "Referenzen..."
        }
    },

    publicationDefaults: {
        authors: "Lurz, M. et al.",
        journal: "Radiology",
        figureCaption: "Figure {number}:",
        tableCaption: "Table {number}:"
    },
    
    radiologyStyleGuide: {
        font: {
            family: "Arial, sans-serif",
            size: "10pt"
        },
        chart: {
            lineWidth: 1.5,
            axisColor: '#000000',
            gridLineColor: '#CCCCCC',
            legendPosition: 'bottom'
        },
        table: {
            headerBackground: '#F2F2F2',
            borderColor: '#000000'
        }
    }
};

window.AppConfig = AppConfig;
