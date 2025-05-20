const publikationTabLogic = (() => {

    let allKollektivStats = null; // Wird mit Daten aus statisticsService.calculateAllStatsForPublication befüllt
    let processedGlobalData = null;
    let globalAppliedT2Criteria = null;
    let globalAppliedT2Logic = null;
    let globalBruteForceResults = null;

    function initializeData(globalData, appliedCriteria, appliedLogic, bfResults) {
        processedGlobalData = globalData; // Das sind die Daten des aktuell im Header ausgewählten Kollektivs
        globalAppliedT2Criteria = appliedCriteria;
        globalAppliedT2Logic = appliedLogic;
        globalBruteForceResults = bfResults; // Das sind die BF-Ergebnisse für das globale Kollektiv

        // Berechne Statistiken für ALLE Kollektive für den Publikationstab
        // bfResults müssen hier als Objekt übergeben werden, das pro KollektivId die Ergebnisse enthält
        // Für den Moment nehmen wir an, dass globalBruteForceResults nur für das aktuelle globale Kollektiv gilt
        // und der Publikationstab die BF-Ergebnisse für jedes seiner angezeigten Kollektive neu berechnen müsste
        // oder idealerweise globalBruteForceResults ein Objekt ist: { 'Gesamt': {...}, 'direkt OP': {...}, ... }
        // Für diese Implementierung gehen wir davon aus, dass die Daten bereits so aufbereitet sind.
        // Die Logik, um `bruteForceResultsPerKollektiv` zu befüllen, müsste außerhalb liegen oder hier
        // durch separate BF-Läufe pro Kollektiv erfolgen, was nicht ideal ist.
        // Annahme: `statisticsService.calculateAllStatsForPublication` bekommt ein solches Objekt.
        // Für den Moment wird nur das globale BF-Ergebnis verwendet, was in der Publikationstabelle
        // dann nur für das globale Kollektiv die "optimierten T2" zeigen würde.
        // Dies muss ggf. in der aufrufenden Logik (main.js / view_renderer.js) angepasst werden,
        // um `bruteForceResultsPerKollektiv` korrekt zu befüllen.
        const bruteForceResultsForAllKollektive = {};
        if (globalBruteForceResults && globalBruteForceResults.kollektiv) {
            bruteForceResultsForAllKollektive[globalBruteForceResults.kollektiv] = globalBruteForceResults;
        }

        allKollektivStats = statisticsService.calculateAllStatsForPublication(
            patientDataRaw, // Verwende immer die gesamten Rohdaten als Basis
            appliedCriteria,
            appliedLogic,
            bruteForceResultsForAllKollektive // Hier müssten BF-Ergebnisse für ALLE Kollektive rein
        );
    }


    function getRenderedSectionContent(sectionId, lang, currentKollektiv) {
        if (!allKollektivStats) {
            // Versuche, Daten neu zu berechnen, falls sie fehlen (z.B. nach BF-Lauf)
            // Dies ist ein Fallback und sollte idealerweise durch ein Event-System gehandhabt werden.
            const fallbackAppliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const fallbackAppliedLogic = t2CriteriaManager.getAppliedLogic();
            const fallbackBfResults = typeof lastBruteForceResults !== 'undefined' ? lastBruteForceResults : null; // Zugriff auf globale Variable aus main.js

            const fallbackBfResultsForAllKollektive = {};
            if (fallbackBfResults && fallbackBfResults.kollektiv) {
                fallbackBfResultsForAllKollektive[fallbackBfResults.kollektiv] = fallbackBfResults;
            }

            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                patientDataRaw,
                fallbackAppliedCriteria,
                fallbackAppliedLogic,
                fallbackBfResultsForAllKollektive
            );
            if (!allKollektivStats) {
                 return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden.</p>';
            }
        }

        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        // `publicationData` sind die aufbereiteten Statistiken für alle Kollektive.
        // `kollektiveData` wird hier gleich `allKollektivStats` gesetzt für Konsistenz mit der Erwartung von `renderSectionContent`.
        return publicationRenderer.renderSectionContent(sectionId, lang, allKollektivStats, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(sectionId, lang, currentKollektiv) {
        if (!allKollektivStats || !allKollektivStats[currentKollektiv]) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden für Kollektiv:", currentKollektiv);
            return;
        }
        const dataForCurrentKollektiv = allKollektivStats[currentKollektiv];

        if (sectionId === 'ergebnisse_patientencharakteristika' && dataForCurrentKollektiv.deskriptiv) {
            const alterChartId = `pub-chart-alter-${currentKollektiv.replace(/\s+/g, '-')}`;
            const genderChartId = `pub-chart-gender-${currentKollektiv.replace(/\s+/g, '-')}`;
            if (document.getElementById(alterChartId)) {
                chartRenderer.renderAgeDistributionChart(dataForCurrentKollektiv.deskriptiv.alterData || [], alterChartId, { height: 200, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
            }
            if (document.getElementById(genderChartId) && dataForCurrentKollektiv.deskriptiv.geschlecht) {
                const genderData = [
                    {label: UI_TEXTS.legendLabels.male, value: dataForCurrentKollektiv.deskriptiv.geschlecht.m ?? 0},
                    {label: UI_TEXTS.legendLabels.female, value: dataForCurrentKollektiv.deskriptiv.geschlecht.f ?? 0}
                ];
                if(dataForCurrentKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                    genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: dataForCurrentKollektiv.deskriptiv.geschlecht.unbekannt });
                }
                chartRenderer.renderPieChart(genderData, genderChartId, { height: 200, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
            }
        } else if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(sectionId)) {
            const rocChartId = `pub-chart-roc-${sectionId.replace('ergebnisse_','')}`;
            const barChartId = `pub-chart-bar-${sectionId.replace('ergebnisse_','')}`;

            // ROC Chart (Beispiel: AS vs. angewandte T2)
            if (document.getElementById(rocChartId) && dataForCurrentKollektiv.gueteAS && dataForCurrentKollektiv.gueteT2_angewandt) {
                // Hier müssten eigentlich die ROC-Daten (FPR/TPR Listen) her.
                // Für binäre Klassifikatoren ist AUC = Balanced Accuracy, daher eine "echte" ROC-Kurve hier nicht direkt darstellbar ohne Schwellenwertvariation.
                // Stattdessen könnte man hier die AUC-Werte anzeigen oder ein Symbol-Diagramm.
                // Für den Moment leeren wir es oder zeigen eine Nachricht.
                ui_helpers.updateElementHTML(rocChartId, `<div class="p-3 text-center text-muted small">ROC-Kurven-Darstellung für binäre Tests erfordert Schwellenwert-Daten. AUC(AS): ${formatNumber(dataForCurrentKollektiv.gueteAS.auc?.value,3)}, AUC(Angew. T2): ${formatNumber(dataForCurrentKollektiv.gueteT2_angewandt.auc?.value,3)}</div>`);
            }

            // Bar Chart (Beispiel: Vergleich AS vs. angewandte T2)
            if (document.getElementById(barChartId) && dataForCurrentKollektiv.gueteAS && dataForCurrentKollektiv.gueteT2_angewandt) {
                 const chartDataComp = [
                    { metric: 'Sens', AS: dataForCurrentKollektiv.gueteAS.sens?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.sens?.value ?? 0 },
                    { metric: 'Spez', AS: dataForCurrentKollektiv.gueteAS.spez?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.spez?.value ?? 0 },
                    { metric: 'PPV', AS: dataForCurrentKollektiv.gueteAS.ppv?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.ppv?.value ?? 0 },
                    { metric: 'NPV', AS: dataForCurrentKollektiv.gueteAS.npv?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.npv?.value ?? 0 },
                    { metric: 'Acc', AS: dataForCurrentKollektiv.gueteAS.acc?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.acc?.value ?? 0 },
                    { metric: 'AUC', AS: dataForCurrentKollektiv.gueteAS.auc?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.auc?.value ?? 0 }
                ];
                chartRenderer.renderComparisonBarChart(chartDataComp, barChartId, { height: 280, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, 'Angew. T2');
            }
        }
    }


    return Object.freeze({
        initializeData,
        getRenderedSectionContent,
        updateDynamicChartsForPublicationTab
    });

})();
