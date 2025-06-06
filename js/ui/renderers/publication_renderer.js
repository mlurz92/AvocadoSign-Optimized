const publicationRenderer = (() => {

    function _createHeaderHTML(lang, bfMetric) {
        const metricOptions = APP_CONFIG.METRIC_OPTIONS.map(opt =>
            `<option value="${opt.value}" ${opt.value === bfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const langSwitchTooltip = (TOOLTIP_CONTENT.publikationTabTooltips.spracheSwitch.description || 'Sprache des Manuskripts umschalten.').replace('[SPRACHE]', `<strong>${lang === 'de' ? 'Englisch' : 'Deutsch'}</strong>`);

        return `
            <div class="d-flex flex-wrap justify-content-end align-items-center mb-3 p-2 rounded bg-light border sticky-top-controls" id="publication-controls-wrapper">
                <div id="publication-bf-metric-container" class="me-3 d-flex align-items-center">
                    <label for="publication-bf-metric-select" class="form-label form-label-sm me-2 mb-0">Brute-Force Metrik:</label>
                    <select id="publication-bf-metric-select" class="form-select form-select-sm" style="width: auto;" data-tippy-content="${TOOLTIP_CONTENT.bruteForceMetric.description}">
                        ${metricOptions}
                    </select>
                </div>
                <div class="form-check form-switch" data-tippy-content="${langSwitchTooltip}">
                    <input class="form-check-input" type="checkbox" role="switch" id="publication-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                    <label class="form-check-label small" for="publication-sprache-switch" id="publication-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[lang]}</label>
                </div>
            </div>`;
    }

    function _createNavigationHTML(sections, activeSectionId, lang) {
        let navItems = '';
        const sectionLabels = UI_TEXTS.publikationTab.sectionLabels;

        sections.forEach(section => {
            navItems += `<a class="nav-link disabled" href="#">${sectionLabels[section.labelKey] || section.labelKey}</a>`;
            if (section.subSections && section.subSections.length > 0) {
                navItems += section.subSections.map(subSection => {
                     const isActive = subSection.id === activeSectionId;
                     return `<a class="nav-link ${isActive ? 'active' : ''}" href="#" data-section-id="${subSection.id}">${subSection.label}</a>`;
                }).join('');
            } else {
                 const isActive = section.id === activeSectionId;
                 navItems += `<a class="nav-link ${isActive ? 'active' : ''}" href="#" data-section-id="${section.id}">${sectionLabels[section.labelKey] || section.labelKey}</a>`;
            }
        });

        return `
            <div class="col-lg-3 publication-sidebar-col">
                <div class="publication-sidebar-sticky-wrapper">
                    <h5 class="px-2 pt-2">${sectionLabels.sidebarTitle}</h5>
                    <nav id="publication-sections-nav" class="nav flex-column nav-pills nav-scrollable p-2">
                        ${navItems}
                    </nav>
                </div>
            </div>`;
    }

    function _createContentAreaHTML(sectionId, content, lang) {
        const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
        const requirements = APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS;
        const wordLimit = requirements[`WORD_COUNT_${sectionId.toUpperCase()}_MAX`] || requirements.WORD_COUNT_MAIN_TEXT_MAX;
        const limitExceeded = wordLimit && wordCount > wordLimit;
        const activeSectionObject = PUBLICATION_CONFIG.sections.flatMap(s => s.subSections || s).find(s => s.id === sectionId);
        const sectionTitle = activeSectionObject ? activeSectionObject.label : 'Inhalt';

        return `
            <div class="col-lg-9 publication-main-content-col">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="mb-0 mobile-section-title">${sectionTitle}</h4>
                        <div class="d-none d-lg-block">
                            <span class="badge ${limitExceeded ? 'bg-danger' : 'bg-secondary'}" data-tippy-content="Aktuelle Wortzahl / Wortlimit für diese Sektion.">
                                ${wordCount}${wordLimit ? ` / ${wordLimit}` : ''} Wörter
                            </span>
                        </div>
                        <button id="download-publication-section-md" class="btn btn-sm btn-outline-primary ms-2"
                                data-section-id="${sectionId}"
                                data-lang="${lang}"
                                data-tippy-content="Aktuelle Sektion als Markdown-Datei herunterladen">
                            <i class="fas fa-file-download fa-fw"></i> MD
                        </button>
                    </div>
                    <div class="card-body publication-content" id="publication-content-area">
                        <h2 class="d-none d-lg-block">${sectionTitle}</h2>
                        ${content}
                    </div>
                </div>
            </div>`;
    }

    function render(lang, sectionId, bfMetric, content) {
        if (!lang || !sectionId || !bfMetric) {
            return '<p class="p-3 text-center text-muted">Renderer-Parameter unvollständig. Ansicht kann nicht geladen werden.</p>';
        }

        const headerHTML = _createHeaderHTML(lang, bfMetric);
        const navigationHTML = _createNavigationHTML(PUBLICATION_CONFIG.sections, sectionId, lang);
        const contentHTML = _createContentAreaHTML(sectionId, content, lang);

        return `
            ${headerHTML}
            <div class="row g-0 publication-tab-layout">
                ${navigationHTML}
                ${contentHTML}
            </div>`;
    }

    return Object.freeze({
        render
    });

})();
