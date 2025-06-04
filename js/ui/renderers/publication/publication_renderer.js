const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', lang === 'en');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);
        if (valStr === 'N/A') return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper) && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            const ciText = lang === 'de' ? '95%-KI' : '95% CI';

            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;

            if(isRate){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})%`;
            } else {
                 return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const commonData = {
            ...commonDataFromLogic,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            bruteForceMetricForPublication: bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION // Direkter Zugriff auf die globalen Referenzen
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            
            // Render content based on subSection ID
            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            // Render tables and figures dynamically where needed based on the sub-section
            if (subSection.id === 'methoden_patientenkollektiv') {
                combinedHtml += publicationFigures.renderFlowDiagram(allKollektivStats, lang);
            }
            else if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += publicationTables.renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += publicationTables.renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName("Gesamt")})</h5><p class="text-muted small text-center p-1">${lang==='de'?'Abb. 1a':'Fig. 1a'}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName("Gesamt")})</h5><p class="text-muted small text-center p-1">${lang==='de'?'Abb. 1b':'Fig. 1b'}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_performance') {
                combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_literatur_t2_performance') {
                combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_optimierte_t2_performance') {
                combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_vergleich_performance') {
                 combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
                 combinedHtml += '<div class="row mt-4 g-3">';
                 const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                 const chartElementsConfig = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT
                 ];
                 kollektiveForCharts.forEach((kolId, index) => {
                    const chartLetter = String.fromCharCode(97 + index); // 'a', 'b', 'c'
                    const chartConfig = chartElementsConfig[index];
                    const chartId = chartConfig.id;
                    const chartTitle = lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn;
                    const figRef = lang === 'de' ? `Abb. 2${chartLetter}` : `Fig. 2${chartLetter}`;
                    combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartId}"><h5 class="text-center small mb-1">${chartTitle.replace('{Kollektiv}', getKollektivDisplayName(kolId))}</h5><p class="text-muted small text-center p-1">${figRef}</p></div></div>`;
                 });
                 combinedHtml += '</div>';
            }
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    return Object.freeze({
        renderSectionContent
    });

})();
