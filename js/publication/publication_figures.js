const publicationFigures = (() => {

    function _findConfigById(id) {
        for (const sectionKey in PUBLICATION_CONFIG.publicationElements) {
            for (const elementKey in PUBLICATION_CONFIG.publicationElements[sectionKey]) {
                if (PUBLICATION_CONFIG.publicationElements[sectionKey][elementKey].id === id) {
                    return PUBLICATION_CONFIG.publicationElements[sectionKey][elementKey];
                }
            }
        }
        return null;
    }

    function renderFlowDiagram(allKollektivStats, lang) {
        const totalPatients = allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const direktOPPatients = allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nRCTPatients = allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;

        const figureConfig = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram;
        const title = lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn;
        const figRef = lang === 'de' ? `Abbildung Methoden 1` : `Methods Figure 1`;

        return `
            <div class="publication-figure" id="${figureConfig.id}">
                <h4 class="mt-4 mb-3" id="${figureConfig.id}-title">${title}</h4>
                <div class="flow-diagram-container" style="max-width: 600px; margin: auto; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px; background-color: #fff; text-align: center;">
                    <svg width="100%" viewBox="0 0 500 450" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#333" /></marker>
                        </defs>
                        <g font-family="sans-serif" font-size="12px" fill="#333" text-anchor="middle">
                            <rect x="150" y="20" width="200" height="50" rx="5" ry="5" fill="#e9ecef" stroke="#adb5bd"/>
                            <text x="250" y="45">${lang === 'de' ? `Patienten eingeschlossen (N=${totalPatients})` : `Patients Enrolled (n=${totalPatients})`}</text>
                            
                            <line x1="250" y1="70" x2="250" y2="115" stroke="#333" stroke-width="1.5" marker-end="url(#arrowhead)"/>
                            
                            <rect x="50" y="120" width="400" height="50" rx="5" ry="5" fill="#f8f9fa" stroke="#ced4da"/>
                            <text x="250" y="145">${lang === 'de' ? 'Alle Patienten erhielten Baseline MRT für Primärstaging' : 'All Patients Underwent Baseline MRI for Primary Staging'}</text>

                            <line x1="250" y1="170" x2="150" y2="215" stroke="#333" stroke-width="1.5" marker-end="url(#arrowhead)"/>
                            <line x1="250" y1="170" x2="350" y2="215" stroke="#333" stroke-width="1.5" marker-end="url(#arrowhead)"/>

                            <rect x="50" y="220" width="200" height="60" rx="5" ry="5" fill="#e9ecef" stroke="#adb5bd"/>
                            <text x="150" y="240">${lang === 'de' ? 'Primärchirurgie Gruppe' : 'Upfront Surgery Group'}</text>
                            <text x="150" y="260" font-weight="bold">N = ${direktOPPatients}</text>
                            
                            <rect x="250" y="220" width="200" height="60" rx="5" ry="5" fill="#e9ecef" stroke="#adb5bd"/>
                            <text x="350" y="240">${lang === 'de' ? 'nRCT Gruppe' : 'nRCT Group'}</text>
                            <text x="350" y="260" font-weight="bold">N = ${nRCTPatients}</text>
                            
                            <line x1="350" y1="280" x2="350" y2="325" stroke="#333" stroke-width="1.5" marker-end="url(#arrowhead)"/>
                            
                            <rect x="250" y="330" width="200" height="50" rx="5" ry="5" fill="#f8f9fa" stroke="#ced4da"/>
                            <text x="350" y="355">${lang === 'de' ? 'Restaging-MRT nach nRCT' : 'Restaging MRI after nRCT'}</text>

                            <line x1="150" y1="280" x2="250" y2="400" stroke="#333" stroke-width="1.5"/>
                            <line x1="350" y1="380" x2="250" y2="400" stroke="#333" stroke-width="1.5" marker-end="url(#arrowhead)"/>
                            <path d="M 150 280 Q 150 340, 250 400" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#arrowhead)"/>


                            <rect x="150" y="400" width="200" height="50" rx="5" ry="5" fill="#d1e7dd" stroke="#198754"/>
                            <text x="250" y="425">${lang === 'de' ? 'Finale Analyse' : 'Final Analysis'}</text>
                        </g>
                    </svg>
                </div>
                <p class="small text-muted mt-2" style="text-align: center;">
                    <b>${figRef}.</b> ${lang === 'de' ? `Flussdiagramm der Patientenrekrutierung.` : `Patient recruitment flowchart.`}
                </p>
            </div>
        `;
    }

    function _renderAgeDistributionChart(ageData, targetElementId, options, lang) {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : 'Altersverteilung';
        const figRef = lang === 'de' ? `Abbildung Ergebnisse 1a` : `Results Figure 1a`;

        return `
            <div class="chart-container border rounded p-2 publication-figure" id="${targetElementId}">
                <h5 class="text-center small mb-1">${chartTitle}</h5>
                <div id="${targetElementId}-chart-area" style="min-height: 220px;"></div>
                <p class="text-muted small text-center p-1 mt-2"><b>${figRef}.</b></p>
            </div>
        `;
    }

    function _renderGenderDistributionChart(genderData, targetElementId, options, lang) {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : 'Geschlechterverteilung';
        const figRef = lang === 'de' ? `Abbildung Ergebnisse 1b` : `Results Figure 1b`;

        return `
            <div class="chart-container border rounded p-2 publication-figure" id="${targetElementId}">
                <h5 class="text-center small mb-1">${chartTitle}</h5>
                <div id="${targetElementId}-chart-area" style="min-height: 220px;"></div>
                <p class="text-muted small text-center p-1 mt-2"><b>${figRef}.</b></p>
            </div>
        `;
    }

    function _renderComparisonPerformanceChart(kolId, chartDataComp, targetElementId, options, t2Label, lang) {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : `Vergleichsmetriken`;
        const chartLetterMap = { 'Gesamt': 'a', 'direkt OP': 'b', 'nRCT': 'c' };
        const figRef = `${lang === 'de' ? 'Abb.' : 'Fig.'} 2${chartLetterMap[kolId] || ''}`;

        return `
            <div class="chart-container border rounded p-2 publication-figure" id="${targetElementId}">
                <h5 class="text-center small mb-1">${chartTitle}</h5>
                <div id="${targetElementId}-chart-area" style="min-height: 250px;"></div>
                <p class="text-muted small text-center p-1 mt-2"><b>${figRef}.</b></p>
            </div>
        `;
    }

    return Object.freeze({
        renderFlowDiagram: _renderFlowDiagram,
        renderAgeDistributionChart: _renderAgeDistributionChart,
        renderGenderDistributionChart: _renderGenderDistributionChart,
        renderComparisonPerformanceChart: _renderComparisonPerformanceChart
    });

})();
