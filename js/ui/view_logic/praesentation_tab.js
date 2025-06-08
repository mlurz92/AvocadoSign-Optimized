// js/ui/view_logic/praesentation_tab.js

class PraesentationViewLogic {
    constructor() {
        this.praesentationContentElement = document.getElementById('praesentation-content');
        this.addEventListeners();
    }

    addEventListeners() {
        // Event Listener für AppState-Änderungen, um die Ansicht zu aktualisieren
        AppState.addChangeListener('patientData', () => this.updateView());
        AppState.addChangeListener('selectedCriteria', () => this.updateView());
    }

    /**
     * Erstellt einen generischen HTML-Container für Diagramme, die in Präsentationen verwendet werden.
     * @param {string} chartId - Die ID des Canvas-Elements für das Diagramm.
     * @param {string} title - Der Titel des Diagramms.
     * @param {string} description - Eine kurze Beschreibung des Diagramms.
     * @returns {string} Der HTML-Code für den Diagramm-Container.
     */
    _createChartContainerHTML(chartId, title, description) {
        return `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">${title}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text small text-muted">${description}</p>
                    <div style="width: 100%; height: 400px;">
                        <canvas id="${chartId}"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Erstellt den HTML-Inhalt für die Präsentationstabelle der diagnostischen Gütekriterien.
     * Diese Tabelle ist für den Export optimiert und enthält weniger interaktive Elemente
     * als der Statistik-Tab, dafür aber eine klare, publikationsreife Darstellung.
     * @param {Array<Object>} results - Die Ergebnisse der Kriterienvergleiche.
     * @param {string} globalKollektivName - Der Name des globalen Kollektivs.
     * @returns {string} Der HTML-Code für die Kriterienvergleichstabelle.
     */
    createPresentationCriteriaComparisonTableHTML(results, globalKollektivName) {
        if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
        const tc = TextConfig.TOOLTIP_CONTENT || {};
        const cc = tc.criteriaComparisonTable || {};
        const headers = [
            { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz" },
            { key: 'sens', label: cc.tableHeaderSens || "Sens." },
            { key: 'spez', label: cc.tableHeaderSpez || "Spez." },
            { key: 'ppv', label: cc.tableHeaderPPV || "PPV" },
            { key: 'npv', label: cc.tableHeaderNPV || "NPV" },
            { key: 'acc', label: cc.tableHeaderAcc || "Acc." },
            { key: 'auc', label: cc.tableHeaderAUC || "AUC" }
        ];
        const tableId = "table-presentation-kriterien-vergleich";
        const displayGlobalKollektivName = TextConfig.getKollektivDisplayName(globalKollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-bordered table-striped small caption-top" id="${tableId}"><caption>Diagnostische Leistung verschiedener Kriteriensätze (vs. Patho. N) im Kollektiv: ${displayGlobalKollektivName}</caption><thead class="small"><tr>`;
        headers.forEach(h => {
           tableHTML += `<th>${h.label}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        results.forEach(result => {
            let nameDisplay = result.name || 'Unbekannt';
            let patientCount = result.globalN !== undefined ? result.globalN : result.specificKollektivN;
            let nameSuffix = patientCount !== undefined ? ` (N=${patientCount})` : '';

            tableHTML += `<tr>
                            <td class="fw-bold">${nameDisplay}${nameSuffix}</td>
                            <td>${StatisticsServiceInstance.roundToDecimalPlaces(result.sens * 100, 1)}%</td>
                            <td>${StatisticsServiceInstance.roundToDecimalPlaces(result.spez * 100, 1)}%</td>
                            <td>${StatisticsServiceInstance.roundToDecimalPlaces(result.ppv * 100, 1)}%</td>
                            <td>${StatisticsServiceInstance.roundToDecimalPlaces(result.npv * 100, 1)}%</td>
                            <td>${StatisticsServiceInstance.roundToDecimalPlaces(result.acc * 100, 1)}%</td>
                            <td>${StatisticsServiceInstance.roundToDecimalPlaces(result.auc, 3)}</td>
                          </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    /**
     * Aktualisiert die Ansicht des Präsentations-Tabs.
     * Generiert Diagramme und Tabellen für Präsentationszwecke.
     */
    updateView() {
        const patientData = AppState.patientData;
        if (!patientData || patientData.length === 0) {
            this.praesentationContentElement.innerHTML = '<p class="text-muted">Bitte Patientendaten im "Daten"-Tab laden und Kriterien im "Auswertung"-Tab anwenden, um Präsentationsinhalte anzuzeigen.</p>';
            return;
        }

        // Sicherstellen, dass Status und Scores vorhanden sind
        const processedData = patientData.map(p => ({
            ...p,
            avocado_sign_status: p.avocado_sign_status !== undefined ? p.avocado_sign_status : false,
            avocado_sign_score: p.avocado_sign_score !== undefined ? p.avocado_sign_score : (p.avocado_sign_status ? 1 : 0),
            t2_criteria_status: p.t2_criteria_status !== undefined ? p.t2_criteria_status : false,
            t2_criteria_score: p.t2_criteria_score !== undefined ? p.t2_criteria_score : (p.t2_criteria_status ? 1 : 0)
        }));

        let contentHTML = '<h2>Präsentationsmaterialien</h2>';

        // 1. Deskriptive Statistik (Zusammenfassung)
        const descriptiveStats = StatisticsServiceInstance.calculateDescriptiveStatistics(processedData);
        contentHTML += `
            <h3>Patienten-Demographie & Status</h3>
            <div class="card mb-4">
                <div class="card-body">
                    ${this.createDeskriptiveStatistikContentHTMLForPresentation(descriptiveStats)}
                </div>
            </div>
        `;

        // 2. ROC-Kurve für Avocado Sign
        const rocData = processedData.map(p => ({
            score: p.avocado_sign_score,
            groundTruth: p.n_status
        }));
        const rocResult = StatisticsServiceInstance.calculateROCAndAUC(rocData, 'score', 'groundTruth');
        const rocChartId = 'presentation-roc-chart';
        contentHTML += this._createChartContainerHTML(rocChartId, 'ROC-Kurve für Avocado Sign', `Die ROC-Kurve zeigt die diagnostische Leistung des Avocado Signs gegenüber dem histopathologischen N-Status. AUC: ${StatisticsServiceInstance.roundToDecimalPlaces(rocResult.auc, 3)}`);

        // 3. Balkendiagramm für Sensitivität, Spezifität, etc. Vergleich AS vs. T2
        // Berechne Metriken für AS und T2
        const asMetrics = StatisticsServiceInstance.calculateMetrics(processedData, 'avocado_sign_status', 'n_status');
        const t2Metrics = StatisticsServiceInstance.calculateMetrics(processedData, 't2_criteria_status', 'n_status');

        const metricsChartId = 'presentation-metrics-chart';
        contentHTML += this._createChartContainerHTML(metricsChartId, 'Vergleich Diagnostischer Metriken: Avocado Sign vs. T2-Kriterien', 'Vergleich der Sensitivität, Spezifität und Genauigkeit des Avocado Signs und der T2-Kriterien.');

        // 4. Konfusionsmatrizen (vereinfacht, nebeneinander)
        contentHTML += `
            <h3>Konfusionsmatrizen: Avocado Sign vs. T2-Kriterien</h3>
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">Avocado Sign Konfusionsmatrix</div>
                        <div class="card-body">
                            ${this._createSimpleConfusionMatrixHTML(asMetrics, 'AS')}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">T2-Kriterien Konfusionsmatrix</div>
                        <div class="card-body">
                            ${this._createSimpleConfusionMatrixHTML(t2Metrics, 'T2')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 5. Vergleichstabelle der Kriterien (wie im Statistik-Tab, aber ohne Tooltips und Sortierung)
        const criteriaComparisonResults = [
            { id: AppConfig.SPECIAL_IDS.AVOCADO_SIGN_ID, name: AppConfig.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asMetrics, globalN: processedData.length, auc: rocResult.auc },
            { id: AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, ...t2Metrics, globalN: processedData.length, auc: StatisticsServiceInstance.calculateROCAndAUC(processedData, 't2_criteria_score', 'n_status').auc },
            // Feste Literatur-Kriterien-Sets hinzufügen (berechnet auf globalem Kollektiv)
            ...Object.keys(Constants.T2_CRITERIA_DEFINITIONS).map(key => {
                const definition = Constants.T2_CRITERIA_DEFINITIONS[key];
                const simulatedData = processedData.map(p => ({
                    ...p,
                    t2_status_literatur: T2CriteriaManagerInstance.calculateT2Criteria(p, definition),
                    // Annahme: Wenn keine spezifischen Scores für Literatur-Kriterien, dann binär (0/1)
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
                    globalN: processedData.length
                };
            })
        ];
        contentHTML += `
            <h3>Detaillierter Vergleich der diagnostischen Leistung</h3>
            ${this.createPresentationCriteriaComparisonTableHTML(criteriaComparisonResults, 'Gesamtkollektiv')}
        `;

        this.praesentationContentElement.innerHTML = contentHTML;

        // Diagramme nach dem Rendern der HTML-Struktur zeichnen
        this.drawROCChart(rocChartId, rocResult.rocPoints);
        this.drawMetricsComparisonChart(metricsChartId, asMetrics, t2Metrics);
    }

    /**
     * Erstellt einen vereinfachten HTML-Inhalt für die deskriptive Statistik für Präsentationszwecke.
     * @param {Object} stats - Die deskriptiven Statistikdaten.
     * @returns {string} Der HTML-Code für die deskriptive Statistik.
     */
    createDeskriptiveStatistikContentHTMLForPresentation(stats) {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(dig) : na;
        const fP = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? (val * 100).toFixed(dig) + '%' : na;
        const d = stats.deskriptiv;

        return `
            <div class="table-responsive">
                <table class="table table-sm table-striped small mb-0">
                    <tbody>
                        <tr><td>Patienten gesamt (N)</td><td>${total}</td></tr>
                        <tr><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                        <tr><td>Geschlecht (m / w)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0}</td></tr>
                        <tr><td>Therapie (direkt OP / nRCT)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0}</td></tr>
                        <tr><td>N Status (+ / -)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0}</td></tr>
                        <tr><td>AS Status (+ / -)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0}</td></tr>
                        <tr><td>T2 Status (+ / -)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0}</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Erstellt eine vereinfachte Konfusionsmatrix für Präsentationszwecke.
     * @param {Object} metrics - Metriken-Objekt vom StatisticsService.
     * @param {string} methode - Name der Methode (z.B. "AS").
     * @returns {string} HTML-Code der Konfusionsmatrix.
     */
    _createSimpleConfusionMatrixHTML(metrics, methode) {
        const na = '--';
        return `
            <table class="table table-bordered text-center small" style="width: auto;">
                <thead>
                    <tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr>
                </thead>
                <tbody>
                    <tr><td class="fw-bold">${methode}+</td><td>${metrics.tp !== undefined ? metrics.tp : na}</td><td>${metrics.fp !== undefined ? metrics.fp : na}</td></tr>
                    <tr><td class="fw-bold">${methode}-</td><td>${metrics.fn !== undefined ? metrics.fn : na}</td><td>${metrics.tn !== undefined ? metrics.tn : na}</td></tr>
                </tbody>
            </table>
        `;
    }

    /**
     * Zeichnet die ROC-Kurve für Präsentationen.
     * @param {string} canvasId - ID des Canvas-Elements.
     * @param {Array<Object>} rocPoints - Array von ROC-Punkten ({fpr, tpr}).
     */
    drawROCChart(canvasId, rocPoints) {
        const chartCtx = document.getElementById(canvasId);
        if (!chartCtx) return;

        if (chartCtx.chart) {
            chartCtx.chart.destroy();
        }

        const data = {
            labels: rocPoints.map(p => p.fpr),
            datasets: [{
                label: 'ROC Curve',
                data: rocPoints.map(p => ({ x: p.fpr, y: p.tpr })),
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
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'ROC Curve (Avocado Sign)'
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        title: (context) => `FPR: ${StatisticsServiceInstance.roundToDecimalPlaces(context[0].parsed.x, 3)}`,
                        label: (context) => `TPR: ${StatisticsServiceInstance.roundToDecimalPlaces(context[0].parsed.y, 3)}`
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'False Positive Rate (1 - Specificity)'
                    },
                    min: 0,
                    max: 1
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'True Positive Rate (Sensitivity)'
                    },
                    min: 0,
                    max: 1
                }
            }
        };

        chartCtx.chart = new Chart(chartCtx.getContext('2d'), {
            type: 'scatter',
            data: data,
            options: options
        });
    }

    /**
     * Zeichnet ein Balkendiagramm zum Vergleich diagnostischer Metriken.
     * @param {string} canvasId - ID des Canvas-Elements.
     * @param {Object} asMetrics - Metriken für Avocado Sign.
     * @param {Object} t2Metrics - Metriken für T2-Kriterien.
     */
    drawMetricsComparisonChart(canvasId, asMetrics, t2Metrics) {
        const chartCtx = document.getElementById(canvasId);
        if (!chartCtx) return;

        if (chartCtx.chart) {
            chartCtx.chart.destroy();
        }

        const labels = ['Sensitivität', 'Spezifität', 'Accuracy', 'PPV', 'NPV', 'F1-Score'];
        const asData = [
            asMetrics.sensitivity,
            asMetrics.specificity,
            asMetrics.accuracy,
            asMetrics.ppv,
            asMetrics.npv,
            asMetrics.f1Score
        ].map(val => StatisticsServiceInstance.roundToDecimalPlaces(val * 100, 1)); // In Prozent für Darstellung

        const t2Data = [
            t2Metrics.sensitivity,
            t2Metrics.specificity,
            t2Metrics.accuracy,
            t2Metrics.ppv,
            t2Metrics.npv,
            t2Metrics.f1Score
        ].map(val => StatisticsServiceInstance.roundToDecimalPlaces(val * 100, 1)); // In Prozent für Darstellung


        const data = {
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
                    label: 'T2-Kriterien',
                    data: t2Data,
                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Vergleich Diagnostischer Metriken'
                },
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Wert (%)'
                    },
                    max: 100
                },
                x: {
                    title: {
                        display: true,
                        text: 'Metrik'
                    }
                }
            }
        };

        chartCtx.chart = new Chart(chartCtx.getContext('2d'), {
            type: 'bar',
            data: data,
            options: options
        });
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen.
const PraesentationViewLogicInstance = new PraesentationViewLogic();
