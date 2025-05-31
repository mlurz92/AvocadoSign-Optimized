const publicationComponents = (() => {

    function createPublikationTabHeader() {
        const lang = state.getCurrentPublikationLang() || PUBLICATION_CONFIG.defaultLanguage;
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const currentSectionId = state.getCurrentPublikationSection() || PUBLICATION_CONFIG.defaultSection;

        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const sectionLabel = UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey.charAt(0).toUpperCase() + mainSection.labelKey.slice(1);
            const sectionTooltip = TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id]?.description || sectionLabel;
            const isActive = mainSection.id === currentSectionId;

            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publikation-section-link ${isActive ? 'active' : ''}" href="#" data-section-id="${mainSection.id}" data-tippy-content="${sectionTooltip}" aria-current="${isActive ? 'page' : 'false'}">
                        ${sectionLabel}
                    </a>
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const stickyHeaderOffsetCSS = getComputedStyle(document.documentElement).getPropertyValue('--sticky-header-offset') || '111px';
        const topPositionForSticky = `top: ${stickyHeaderOffsetCSS};`;

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="${topPositionForSticky} z-index: 1015;">
                <div class="col-md-3">
                    <h5 class="mb-2 ps-2">${UI_TEXTS.publikationTab.sectionLabels.navigation || 'Navigation'}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips.sectionSelect?.description || 'Wählen Sie einen Publikationsabschnitt.'}">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${UI_TEXTS.publikationTab.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips.bruteForceMetricSelect.description}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips.spracheSwitch.description}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[lang]}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - ${stickyHeaderOffsetCSS} - 4rem - 2rem); overflow-y: auto;">
                        <p class="text-muted p-3 text-center">Bitte wählen Sie einen Abschnitt aus der Navigation, um den Inhalt zu laden.</p>
                    </div>
                </div>
            </div>`;
    }

    return Object.freeze({
        createPublikationTabHeader
    });

})();
