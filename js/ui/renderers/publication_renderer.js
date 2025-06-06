const publicationRenderer = (() => {

    function _createHeaderHTML(lang, bfMetric) {
        const metricOptions = METRIC_OPTIONS.map(opt =>
            `<option value="${opt.value}" ${opt.value === bfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const langSwitchTooltip = (UI_TEXTS.publikationTab.spracheSwitchTooltip || 'Sprache des Manuskripts umschalten (Deutsch/Englisch).').replace('[SPRACHE]', `<strong>${lang === 'de' ? 'Englisch' : 'Deutsch'}</strong>`);

        return `
            <div class="d-flex flex-wrap justify-content-end align-items-center mb-3 p-2 rounded bg-light border">
                <div id="publikation-bf-metric-container" class="me-3 d-flex align-items-center">
                    <label for="publikation-bf-metric-select" class="form-label form-label-sm me-2 mb-0">Brute-Force Metrik:</label>
                    <select id="publikation-bf-metric-select" class="form-select form-select-sm" style="width: auto;" data-tippy-content="${TOOLTIP_CONTENT.bruteForceMetric.description}">
                        ${metricOptions}
                    </select>
                </div>
                <div class="form-check form-switch" data-tippy-content="${langSwitchTooltip}">
                    <label class="form-check-label small" for="publikation-sprache-switch" id="publikation-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[lang]}</label>
                    <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                </div>
            </div>`;
    }

    function _createNavigationHTML(sections, activeSection) {
        const navItems = sections.map(section => {
            const isActive = section.id === activeSection ? 'active' : '';
            return `
                <a class="nav-link ${isActive}" href="#" data-section-id="${section.id}">
                    <i class="fas ${section.icon} fa-fw me-2"></i>${section.title}
                </a>`;
        }).join('');

        return `
            <div class="col-lg-3">
                <nav id="publikation-sections-nav" class="nav flex-column nav-pills p-2 border rounded">
                    ${navItems}
                </nav>
            </div>`;
    }

    function _createContentAreaHTML(section, content, lang) {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const requirements = APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS;
        const wordLimit = requirements[`WORD_COUNT_${section.toUpperCase()}_MAX`] || requirements.WORD_COUNT_MAIN_TEXT_MAX;
        const limitExceeded = wordCount > wordLimit;

        return `
            <div class="col-lg-9">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">${PUBLICATION_CONFIG.sections.find(s => s.id === section)?.title || 'Inhalt'}</h4>
                        <div>
                            <span class="badge ${limitExceeded ? 'bg-danger' : 'bg-secondary'}" data-tippy-content="Aktuelle Wortzahl / Wortlimit für diese Sektion">
                                ${wordCount} / ${wordLimit} Wörter
                            </span>
                            <button id="download-publication-section-md" class="btn btn-sm btn-outline-primary ms-2"
                                    data-section-id="${section}"
                                    data-lang="${lang}"
                                    data-tippy-content="Aktuelle Sektion als Markdown-Datei herunterladen">
                                <i class="fas fa-file-download fa-fw"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body publication-content" id="publication-content-area" style="min-height: 500px;">
                        ${content}
                    </div>
                </div>
            </div>`;
    }

    function render(lang, section, bfMetric, content) {
        if (!lang || !section || !bfMetric) {
            return '<p class="p-3 text-center text-muted">Renderer-Parameter unvollständig. Ansicht kann nicht geladen werden.</p>';
        }

        const headerHTML = _createHeaderHTML(lang, bfMetric);
        const navigationHTML = _createNavigationHTML(PUBLICATION_CONFIG.sections, section);
        const contentHTML = _createContentAreaHTML(section, content, lang);

        return `
            ${headerHTML}
            <div class="row g-4">
                ${navigationHTML}
                ${contentHTML}
            </div>`;
    }

    return Object.freeze({
        render
    });

})();
