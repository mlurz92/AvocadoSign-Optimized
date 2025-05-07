const publikationTabLogic = (() => {

    function renderPublikationSectionContent(activeSection, lang, filteredData, appliedCriteria, appliedLogic, currentGlobalKollektiv, allProcessedData, lastBruteForceResults) {
        const contentArea = document.getElementById('publikation-section-content-area');
        if (!contentArea) {
            console.error("Container 'publikation-section-content-area' nicht gefunden.");
            return;
        }
        ui_helpers.updateElementHTML(contentArea.id, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Abschnittsinhalt...</span></div></div>');

        try {
            if (typeof publikationContentGenerator === 'undefined' || typeof publikationContentGenerator.getSectionContentHTML !== 'function') {
                throw new Error("publikationContentGenerator ist nicht verfügbar oder hat keine getSectionContentHTML Methode.");
            }

            const sectionContent = publikationContentGenerator.getSectionContentHTML(
                activeSection,
                lang,
                filteredData,
                appliedCriteria,
                appliedLogic,
                currentGlobalKollektiv,
                allProcessedData,
                lastBruteForceResults
            );

            ui_helpers.updateElementHTML(contentArea.id, sectionContent.html || `<p class="text-muted p-3">${lang === 'de' ? 'Kein Inhalt für diesen Abschnitt verfügbar.' : 'No content available for this section.'}</p>`);

            if (sectionContent.charts && Array.isArray(sectionContent.charts) && sectionContent.charts.length > 0) {
                setTimeout(() => {
                    sectionContent.charts.forEach(chartConfig => {
                        if (chartConfig && chartConfig.renderFunction && typeof chartRenderer[chartConfig.renderFunction] === 'function') {
                            const chartContainer = document.getElementById(chartConfig.targetElementId);
                            if (chartContainer) {
                                chartRenderer[chartConfig.renderFunction](chartConfig.data, chartConfig.targetElementId, chartConfig.options || {}, chartConfig.label || '');
                            } else {
                                console.warn(`Chart-Container ${chartConfig.targetElementId} nicht gefunden für Sektion ${activeSection}.`);
                            }
                        } else {
                            console.warn(`Chart-Renderfunktion ${chartConfig?.renderFunction} nicht gefunden oder ungültige Konfiguration für Sektion ${activeSection}.`);
                        }
                    });
                    ui_helpers.initializeTooltips(contentArea);
                }, 100);
            } else {
                 ui_helpers.initializeTooltips(contentArea);
            }

        } catch (error) {
            console.error(`Fehler beim Rendern des Publikationsabschnitts '${activeSection}':`, error);
            const errorMsg = lang === 'de' ? 'Fehler beim Laden des Abschnitts' : 'Error loading section';
            const errorMessage = `<div class="alert alert-danger m-3">${errorMsg} '${activeSection}': ${error.message}</div>`;
            ui_helpers.updateElementHTML(contentArea.id, errorMessage);
            ui_helpers.showToast(`${errorMsg} '${activeSection}'.`, 'danger');
        }
    }

    function render(activeSection, lang, filteredData, appliedCriteria, appliedLogic, currentGlobalKollektiv, allProcessedData, lastBruteForceResults) {
        if (typeof publikationUIComponents === 'undefined' || typeof publikationUIComponents.createPublikationNav !== 'function') {
            console.error("publikationTabLogic: publikationUIComponents.createPublikationNav ist nicht verfügbar.");
            return '<div class="alert alert-danger m-3">Fehler: UI-Komponenten für Publikations-Tab nicht geladen.</div>';
        }

        const navHTML = publikationUIComponents.createPublikationNav(activeSection, lang);
        const contentContainerHTML = `<div id="publikation-section-content-area" class="mt-3">
                                          <p class="text-center p-5 text-muted">${lang === 'de' ? 'Lade Publikationsinhalte...' : 'Loading publication content...'}</p>
                                      </div>`;
        const fullHTML = navHTML + contentContainerHTML;

        setTimeout(() => {
            renderPublikationSectionContent(activeSection, lang, filteredData, appliedCriteria, appliedLogic, currentGlobalKollektiv, allProcessedData, lastBruteForceResults);
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updatePublikationSelectorsUI === 'function') {
                ui_helpers.updatePublikationSelectorsUI(activeSection, lang);
            }
        }, 0);

        return fullHTML;
    }

    return Object.freeze({
        render,
        renderPublikationSectionContent
    });

})();
