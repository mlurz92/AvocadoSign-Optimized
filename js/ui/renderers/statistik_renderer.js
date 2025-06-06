const statistikTabRenderer = (() => {

    function _createLayoutControlsHTML(currentLayout, kollektiv1, kollektiv2, globalKollektiv) {
        const kollektivOptions = ['Gesamt', 'direkt OP', 'nRCT']
            .map(k => `<option value="${k}" ${k === globalKollektiv && currentLayout === 'einzel' ? 'disabled' : ''}>${getKollektivDisplayName(k)}</option>`)
            .join('');

        const tooltipLayout = TOOLTIP_CONTENT.statistikLayout.description;
        const tooltipK1 = TOOLTIP_CONTENT.statistikKollektiv1.description;
        const tooltipK2 = TOOLTIP_CONTENT.statistikKollektiv2.description;
        const tooltipToggle = TOOLTIP_CONTENT.statistikToggleVergleich.description;

        const displayK1 = currentLayout === 'vergleich' ? 'block' : 'none';
        const displayK2 = currentLayout === 'vergleich' ? 'block' : 'none';
        const buttonText = currentLayout === 'vergleich' ? 'Einzelansicht Aktivieren' : 'Vergleich Aktivieren';
        const buttonIcon = currentLayout === 'vergleich' ? 'fa-user' : 'fa-users';


        return `
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 border rounded bg-light shadow-sm">
                <div class="me-3 mb-2 mb-md-0">
                    <button class="btn btn-sm btn-outline-primary" id="statistik-toggle-vergleich" data-tippy-content="${tooltipToggle}">
                        <i class="fas ${buttonIcon} fa-fw me-1"></i><span id="statistik-layout-button-text">${buttonText}</span>
                    </button>
                    <input type="hidden" id="statistik-layout-input" value="${currentLayout}" data-tippy-content="${tooltipLayout}">
                </div>
                <div class="d-flex flex-wrap align-items-center">
                    <div class="me-3 mb-2 mb-md-0" id="statistik-kollektiv1-group" style="display: ${displayK1};">
                        <label for="statistik-kollektiv-select-1" class="form-label form-label-sm mb-0 me-1">Kollektiv 1:</label>
                        <select class="form-select form-select-sm d-inline-block" id="statistik-kollektiv-select-1" style="width: auto;" data-tippy-content="${tooltipK1}">
                            ${kollektivOptions.replace(`value="${kollektiv1}"`, `value="${kollektiv1}" selected`)}
                        </select>
                    </div>
                    <div id="statistik-kollektiv2-group" style="display: ${displayK2};">
                        <label for="statistik-kollektiv-select-2" class="form-label form-label-sm mb-0 me-1">Kollektiv 2:</label>
                        <select class="form-select form-select-sm d-inline-block" id="statistik-kollektiv-select-2" style="width: auto;" data-tippy-content="${tooltipK2}">
                           ${kollektivOptions.replace(`value="${kollektiv2}"`, `value="${kollektiv2}" selected`)}
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    function _createSectionHTML(sectionId, titleKey, contentPlaceholderId, extraCardClasses = '', cardTooltipKey = null) {
        const title = UI_TEXTS.statistikTab.sectionTitles[titleKey] || titleKey.replace(/_/g, ' ');
        const tooltipText = cardTooltipKey && TOOLTIP_CONTENT.statistikTabTooltips[cardTooltipKey] ? TOOLTIP_CONTENT.statistikTabTooltips[cardTooltipKey].description : title;
        return `
            <section id="${sectionId}" class="mb-4">
                <div class="card stat-card ${extraCardClasses}" data-tippy-content="${tooltipText}">
                    <div class="card-header">
                        <h4 class="mb-0">${title}</h4>
                         <div class="card-header-buttons">
                            <button class="btn btn-sm btn-outline-secondary table-download-png-btn d-none" data-table-id="${contentPlaceholderId}-table" data-tippy-content="Diese Tabelle als PNG herunterladen">
                                <i class="fas fa-image"></i> PNG
                            </button>
                            <button class="btn btn-sm btn-outline-secondary chart-download-btn d-none" data-chart-id="${contentPlaceholderId}-chart" data-format="png" data-tippy-content="Dieses Diagramm als PNG herunterladen">
                                <i class="fas fa-image"></i> PNG
                            </button>
                             <button class="btn btn-sm btn-outline-secondary chart-download-btn d-none" data-chart-id="${contentPlaceholderId}-chart" data-format="svg" data-tippy-content="Dieses Diagramm als SVG herunterladen">
                                <i class="fas fa-file-alt"></i> SVG
                            </button>
                        </div>
                    </div>
                    <div class="card-body" id="${contentPlaceholderId}">
                        <p class="text-muted text-center p-3">Statistische Daten werden geladen...</p>
                    </div>
                </div>
            </section>
        `;
    }

    function renderStatistikTab(processedData, appliedCriteria, appliedLogic, statsLayout, kollektiv1, kollektiv2, globalKollektiv) {
        if (typeof uiComponents === 'undefined' || typeof statisticsService === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined' || typeof UI_TEXTS === 'undefined') {
            console.error("Abhängigkeiten für statistikTabRenderer nicht vollständig geladen.");
            return '<p class="text-danger p-3">Fehler: Wichtige UI oder Statistik Komponenten für den Statistik-Tab nicht geladen.</p>';
        }

        let html = _createLayoutControlsHTML(statsLayout, kollektiv1, kollektiv2, globalKollektiv);

        const baseKollektivForDisplay = statsLayout === 'vergleich' ? kollektiv1 : globalKollektiv;

        html += _createSectionHTML('statistik-deskriptiv', 'deskriptiveStatistik', 'deskriptiv-content', '', 'deskriptiveStatistikCard');
        html += _createSectionHTML('statistik-diagnostik-as', 'diagnostischeGueteAS', 'diagnostik-as-content', '', 'diagnostischeGueteASCard');
        html += _createSectionHTML('statistik-diagnostik-t2', 'diagnostischeGueteT2', 'diagnostik-t2-content', '', 'diagnostischeGueteT2Card');
        html += _createSectionHTML('statistik-vergleich-as-t2', 'statistischerVergleichASvsT2', 'vergleich-as-t2-content', '', 'statistischerVergleichASvsT2Card');
        html += _createSectionHTML('statistik-assoziation', 'assoziationEinzelkriterien', 'assoziation-content', '', 'assoziationEinzelkriterienCard');

        if (statsLayout === 'vergleich') {
            html += _createSectionHTML('statistik-kollektiv-vergleich', 'vergleichKollektive', 'kollektiv-vergleich-content', '', 'vergleichKollektiveCard');
        }
        html += _createSectionHTML('statistik-kriterien-vergleichstabelle', 'kriterienVergleichstabelle', 'kriterien-vergleichstabelle-content', '', 'kriterienVergleichstabelleCard');

        return html;
    }

    return Object.freeze({
        renderStatistikTab
    });

})();
