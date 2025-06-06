const publicationViewRenderer = (() => {

    function _createSidebarNavHTML(currentSectionId, lang) {
        let navHtml = '<ul class="nav flex-column nav-pills">';
        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            const sectionTitle = UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
            const isActive = mainSection.id === currentSectionId;
            const sectionTooltipKey = mainSection.id;
            const sectionTooltip = (TOOLTIP_CONTENT.publikationTabTooltips[sectionTooltipKey]?.description || sectionTitle);

            navHtml += `<li class="nav-item">
                <a class="nav-link py-2 publikation-section-link ${isActive ? 'active' : ''}" href="#" data-section-id="${mainSection.id}" data-tippy-content="${sectionTooltip}">
                    ${sectionTitle}
                </a>
            </li>`;
        });
        navHtml += '</ul>';
        return navHtml;
    }

    function _createControlsHTML(currentLang, currentBfMetric) {
        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const langSwitchTooltip = (TOOLTIP_CONTENT.publikationTabTooltips.spracheSwitch.description || 'Sprache wechseln');
        const bfMetricSelectTooltip = (TOOLTIP_CONTENT.publikationTabTooltips.bruteForceMetricSelect.description || 'Optimierungsmetrik wählen');

        return `
            <div class="d-flex justify-content-end align-items-center mb-3 flex-wrap">
                <div class="me-3 mb-2 mb-md-0">
                   <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${UI_TEXTS.publikationTab.bruteForceMetricSelectLabel}</label>
                   <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${bfMetricSelectTooltip}">
                       ${bfMetricOptions}
                   </select>
                </div>
                <div class="form-check form-switch" data-tippy-content="${langSwitchTooltip}">
                    <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${currentLang === 'en' ? 'checked' : ''}>
                    <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[currentLang]}</label>
                </div>
            </div>
        `;
    }

    function renderPublikationTabHTML(currentSectionId, lang, allKollektivStats, commonData) {
        if (!currentSectionId || !PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId)) {
            currentSectionId = PUBLICATION_CONFIG.defaultSection;
        }
        if (lang !== 'de' && lang !== 'en') {
            lang = PUBLICATION_CONFIG.defaultLanguage;
        }
        if (!commonData || typeof commonData.bruteForceMetricForPublication === 'undefined') {
            commonData = { ...commonData, bruteForceMetricForPublication: PUBLICATION_CONFIG.defaultBruteForceMetricForPublication };
        }


        const sidebarNavHTML = _createSidebarNavHTML(currentSectionId, lang);
        const controlsHTML = _createControlsHTML(lang, commonData.bruteForceMetricForPublication);
        
        let initialContentHTML = '<p class="text-center p-5 text-muted">Lade Inhalt...</p>';
        if (typeof publicationContentGenerator !== 'undefined' && typeof publicationContentGenerator.generateSectionHtml === 'function') {
            initialContentHTML = publicationContentGenerator.generateSectionHtml(currentSectionId, lang, allKollektivStats, commonData);
        } else {
            console.error("publicationContentGenerator nicht verfügbar oder generateSectionHtml nicht definiert.");
            initialContentHTML = '<p class="text-danger">Fehler beim Laden des Inhaltsgenerators.</p>';
        }

        const navTooltip = (TOOLTIP_CONTENT.publikationTabTooltips.sectionSelect?.description || 'Wählen Sie einen Publikationsabschnitt.');
        const mainTitle = UI_TEXTS.publikationTab.sectionLabels[PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId)?.labelKey || currentSectionId] || currentSectionId;

        return `
            <div class="row publication-tab-layout">
                <div class="col-lg-3 publication-sidebar-col mb-3 mb-lg-0">
                    <div class="sticky-top publication-sidebar-sticky-wrapper">
                        <h5 class="mb-2 d-none d-lg-block">${UI_TEXTS.publikationTab.sectionLabels.sidebarTitle || 'Manuskript-Navigation'}</h5>
                         <nav id="publikation-sections-nav" class="nav-scrollable" data-tippy-content="${navTooltip}">
                            ${sidebarNavHTML}
                        </nav>
                    </div>
                </div>
                <div class="col-lg-9 publication-main-content-col">
                    <div class="publication-controls-wrapper sticky-top-controls py-2">
                        ${controlsHTML}
                    </div>
                    <div id="publication-content-area" class="bg-white p-3 p-md-4 border rounded publication-content-scrollable">
                        <h1 class="mb-4 display-6 d-block d-lg-none mobile-section-title">${mainTitle}</h1>
                        ${initialContentHTML}
                    </div>
                </div>
            </div>
        `;
    }

    return Object.freeze({
        renderPublikationTabHTML
    });

})();
