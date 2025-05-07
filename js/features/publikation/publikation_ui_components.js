const publikationUIComponents = (() => {

    function createPublikationNav(activeSection = 'methoden', currentLang = 'de') {
        const sections = [
            { id: 'methoden', labelKey: 'methoden', icon: 'fas fa-flask' },
            { id: 'ergebnisse', labelKey: 'ergebnisse', icon: 'fas fa-chart-pie' }
        ];

        let sectionButtonsHTML = sections.map(section => {
            const isActive = section.id === activeSection;
            const label = UI_TEXTS?.publikationTab?.sectionNames?.[section.labelKey] || section.labelKey.charAt(0).toUpperCase() + section.labelKey.slice(1);
            const tooltipText = TOOLTIP_CONTENT?.publikationTabTooltips?.sectionSelection || 'Publikationsabschnitt wählen';
            return `<button type="button" class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'} publikation-section-btn" data-section="${section.id}" data-tippy-content="${tooltipText.replace('[SECTION_NAME]', label)}">
                        <i class="${section.icon} fa-fw me-1"></i>${label}
                    </button>`;
        }).join('');

        const langSwitchChecked = currentLang === 'en';
        const langLabelText = UI_TEXTS?.publikationTab?.spracheSwitchLabel?.[currentLang] || (currentLang === 'en' ? 'English' : 'Deutsch');
        const langSwitchTooltip = TOOLTIP_CONTENT?.publikationTabTooltips?.languageSwitch || 'Sprache wechseln';

        const navHTML = `
            <div class="publikation-section-nav sticky-top">
                <div class="btn-group btn-group-sm" role="group" aria-label="Publikationsabschnitt Auswahl">
                    ${sectionButtonsHTML}
                </div>
                <div class="form-check form-switch ms-md-auto mt-2 mt-md-0" data-tippy-content="${langSwitchTooltip}">
                    <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${langSwitchChecked ? 'checked' : ''}>
                    <label class="form-check-label small" for="publikation-sprache-switch" id="publikation-sprache-label">${langLabelText}</label>
                </div>
            </div>
        `;
        return navHTML;
    }

    function createPublikationContentCard(title, contentHTML, cardId, cardType = 'text', lang = 'de', downloadOptions = []) {
        let cardHeaderButtons = '';
        const cardTitleTooltip = TOOLTIP_CONTENT?.publikationTabTooltips?.[state.getPublikationActiveSection()]?.[cardId.replace(`pub-${state.getPublikationActiveSection()}-`, '')]?.cardTitle?.[lang] || title;

        if (downloadOptions && downloadOptions.length > 0) {
            cardHeaderButtons = `<div class="card-header-buttons ms-auto">`;
            downloadOptions.forEach(opt => {
                const tooltip = opt.tooltip || `Als ${opt.format.toUpperCase()} herunterladen`;
                cardHeaderButtons += `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${opt.id}" data-chart-id="${opt.chartId || cardId}-content-area" data-format="${opt.format}" data-tippy-content="${tooltip}">
                                        <i class="fas ${opt.icon || 'fa-download'}"></i>
                                     </button>`;
            });
            cardHeaderButtons += `</div>`;
        }

        const cardHTML = `
            <div class="card publikation-content-card mb-4" id="${cardId}">
                <div class="card-header d-flex align-items-center" data-tippy-content="${cardTitleTooltip}">
                    <h4 class="mb-0">${title}</h4>
                    ${cardHeaderButtons}
                </div>
                <div class="card-body" id="${cardId}-content-area">
                    ${contentHTML || `<p class="text-muted">${lang === 'de' ? 'Inhalt wird geladen...' : 'Loading content...'}</p>`}
                </div>
            </div>
        `;
        return cardHTML;
    }

    return Object.freeze({
        createPublikationNav,
        createPublikationContentCard
    });

})();
