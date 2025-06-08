const publikationTab = (() => {

    function _createHeaderControls(lang, bfMetric) {
        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === bfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        return `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div class="form-check form-switch" data-tippy-content="${TEXT_CONFIG.de.tooltips.publikationTab.spracheSwitch}">
                    <input class="form-check-input" type="checkbox" role="switch" id="${CONSTANTS.SELECTORS.PUBLIKATION_SPRACHE_SWITCH.substring(1)}" ${lang === 'en' ? 'checked' : ''}>
                    <label class="form-check-label fw-bold" for="${CONSTANTS.SELECTORS.PUBLIKATION_SPRACHE_SWITCH.substring(1)}">${TEXT_CONFIG.de.publikationTab.spracheSwitchLabel[lang]}</label>
                </div>
                <div data-tippy-content="${TEXT_CONFIG.de.tooltips.publikationTab.bruteForceMetricSelect}">
                   <label for="${CONSTANTS.SELECTORS.PUBLIKATION_BF_METRIC_SELECT.substring(1)}" class="form-label form-label-sm mb-0 me-1">${TEXT_CONFIG.de.publikationTab.bruteForceMetricSelectLabel}</label>
                   <select class="form-select form-select-sm d-inline-block" id="${CONSTANTS.SELECTORS.PUBLIKATION_BF_METRIC_SELECT.substring(1)}" style="width: auto;">
                       ${bfMetricOptions}
                   </select>
                </div>
            </div>`;
    }

    function _createSectionNavigation(activeSectionId) {
        const navItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const subSectionLinks = mainSection.subSections.map(subSection => {
                const isActive = subSection.id === activeSectionId;
                return `
                <li>
                    <a class="nav-link ps-3 py-1 publikation-section-link ${isActive ? 'active' : ''}" href="#pub-content-${subSection.id}" data-section-id="${subSection.id}">
                        ${subSection.label}
                    </a>
                </li>`;
            }).join('');

            return `
                <li class="nav-item">
                    <a class="nav-link fw-bold mt-2 disabled" href="#pub-main-content-${mainSection.id}" data-section-id="${mainSection.id}">
                        ${TEXT_CONFIG.de.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}
                    </a>
                    <ul class="nav flex-column">${subSectionLinks}</ul>
                </li>`;
        }).join('');

        return `
            <nav id="${CONSTANTS.SELECTORS.PUBLIKATION_SECTIONS_NAV.substring(1)}" class="nav flex-column nav-pills position-sticky" style="top: calc(var(--sticky-header-offset, 111px) + 1rem); max-height: calc(100vh - var(--sticky-header-offset, 111px) - 2rem); overflow-y: auto;">
                ${navItems}
            </nav>`;
    }

    function _createContentArea(allKollektivStats, commonData, lang) {
        let contentHtml = '';
        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            contentHtml += `<section id="pub-main-content-${mainSection.id}" class="publication-main-section mb-5">`;
            contentHtml += `<h2 class="display-6 border-bottom pb-2 mb-4">${TEXT_CONFIG.de.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h2>`;

            mainSection.subSections.forEach(subSection => {
                const textContent = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
                let tableContent = '';
                let figureContent = '';
                
                if (subSection.id === 'methoden_patientenkohorte') {
                    figureContent = publicationFigures.renderFlowDiagram(allKollektivStats, lang);
                } else if (subSection.id === 'methoden_bildanalyse_t2_kriterien') {
                    tableContent = publicationTables.renderLiteraturT2KriterienTabelle(lang);
                } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                    tableContent = publicationTables.renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                    figureContent = `<div class="row mt-4 g-3">
                        <div class="col-md-6">${publicationFigures.renderAgeDistributionChart(allKollektivStats.Gesamt?.deskriptiv?.alterData || [], PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id, { height: 250 }, lang)}</div>
                        <div class="col-md-6">${publicationFigures.renderGenderDistributionChart(allKollektivStats.Gesamt?.deskriptiv?.geschlecht, PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id, { height: 250 }, lang)}</div>
                    </div>`;
                } else if (['ergebnisse_as_diagnostische_guete', 'ergebnisse_t2_literatur_diagnostische_guete', 'ergebnisse_t2_optimiert_diagnostische_guete', 'ergebnisse_vergleich_as_vs_t2'].includes(subSection.id)) {
                    tableContent = publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
                }

                contentHtml += `
                    <div id="pub-content-${subSection.id}" class="publication-sub-section mb-4">
                        ${textContent || ''}
                        ${tableContent || ''}
                        ${figureContent || ''}
                    </div>`;
            });
            contentHtml += `</section>`;
        });
        return contentHtml;
    }

    function render(allKollektivStats, commonData, lang, activeSectionId, bfMetric) {
        if (!allKollektivStats || !commonData) {
            return '<div class="alert alert-danger">Fehler: Notwendige Daten für die Publikationsansicht fehlen.</div>';
        }

        const headerControls = _createHeaderControls(lang, bfMetric);
        const navigation = _createSectionNavigation(activeSectionId);
        const content = _createContentArea(allKollektivStats, commonData, lang, activeSectionId);
        
        const exportButtonHTML = `
            <div class="d-flex justify-content-end mt-4">
                <button id="export-publication-md" class="btn btn-success">
                    <i class="fas fa-file-word me-2"></i> Gesamtes Manuskript als Markdown exportieren
                </button>
            </div>
        `;

        return `
            <div class="row">
                <div class="col-md-3">
                    ${navigation}
                </div>
                <div class="col-md-9">
                    ${headerControls}
                    <div id="${CONSTANTS.SELECTORS.PUBLIKATION_CONTENT_AREA.substring(1)}">
                        ${content}
                    </div>
                    ${exportButtonHTML}
                </div>
            </div>`;
    }

    return Object.freeze({
        render
    });
})();
