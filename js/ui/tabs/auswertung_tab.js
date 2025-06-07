const auswertungTab = (() => {

    function _createDashboardCards(stats) {
        if (!stats || stats.anzahlPatienten === 0) {
            return '<div class="col-12"><p class="text-muted text-center p-3">Keine Daten für Dashboard verfügbar.</p></div>';
        }
        const { alter, geschlecht, therapie, nStatus, asStatus, t2Status } = stats;
        const na = '--';
        const createCard = (title, content, chartId) => 
            commonComponents.createCard(chartId + '-card', title, content, { 
                cardClass: 'dashboard-card', 
                bodyClass: 'p-2 text-center', 
                headerClass: 'card-header-sm' 
            }).replace('<div class="card-body', `<div class="card-body d-flex flex-column justify-content-center align-items-center"`);
        
        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">${createCard('Alter (Median)', `<h4 class="m-0">${formatNumber(alter?.median, 0, na)}</h4><span class="text-muted small">Range: ${formatNumber(alter?.min, 0, na)}-${formatNumber(alter?.max, 0, na)}</span>`, 'chart-dash-age')}</div>
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">${createCard('Geschlecht', `<h4 class="m-0">${formatPercent((geschlecht?.m || 0) / stats.anzahlPatienten, 0)}</h4><span class="text-muted small">männlich</span>`, 'chart-dash-gender')}</div>
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">${createCard('Therapie', `<h4 class="m-0">${formatPercent((therapie?.nRCT || 0) / stats.anzahlPatienten, 0)}</h4><span class="text-muted small">nRCT</span>`, 'chart-dash-therapy')}</div>
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">${createCard('N-Status', `<h4 class="m-0">${formatPercent((nStatus?.plus || 0) / (nStatus?.plus + nStatus?.minus || 1), 0)}</h4><span class="text-muted small">N+ (Patho)</span>`, 'chart-dash-status-n')}</div>
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">${createCard('AS-Status', `<h4 class="m-0">${formatPercent((asStatus?.plus || 0) / (asStatus?.plus + asStatus?.minus || 1), 0)}</h4><span class="text-muted small">AS+ (MRT)</span>`, 'chart-dash-status-as')}</div>
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">${createCard('T2-Status', `<h4 class="m-0">${formatPercent((t2Status?.plus || 0) / (t2Status?.plus + t2Status?.minus || 1), 0)}</h4><span class="text-muted small">T2+ (angewandt)</span>`, 'chart-dash-status-t2')}</div>
        `;
    }

    function _createT2CriteriaControls(criteria, logic) {
        const createButtonOptions = (key) => {
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[key.toUpperCase() + '_VALUES'] || [];
            return values.map(value => {
                const icon = commonComponents.createT2CriteriaIcon(key, value);
                return `<button class="btn t2-criteria-button" data-criterion="${key}" data-value="${value}">${icon}</button>`;
            }).join('');
        };

        const createCriteriaCard = (key, title, content) => {
            const isChecked = criteria[key]?.active;
            return `
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header card-header-sm">
                            <div class="form-check form-switch form-check-inline">
                                <input class="form-check-input" type="checkbox" id="check-${key}" value="${key}" ${isChecked ? 'checked' : ''}>
                                <label class="form-check-label" for="check-${key}">${title}</label>
                            </div>
                        </div>
                        <div class="card-body p-2 ${!isChecked ? 'opacity-50' : ''}" id="container-${key}">
                            ${content}
                        </div>
                    </div>
                </div>`;
        };

        const sizeContent = `
            <div class="d-flex align-items-center">
                <span class="me-2 small text-muted">≥</span>
                <input type="range" class="form-range" id="${CONSTANTS.SELECTORS.RANGE_SIZE.substring(1)}" 
                       min="${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min}" 
                       max="${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max}" 
                       step="${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step}" 
                       value="${criteria.size.threshold}">
                <input type="number" class="form-control form-control-sm ms-2" id="${CONSTANTS.SELECTORS.INPUT_SIZE.substring(1)}" 
                       value="${criteria.size.threshold}" 
                       style="width: 75px;"
                       min="${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min}" 
                       max="${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max}" 
                       step="${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step}">
                <span class="ms-1">mm</span>
            </div>`;
            
        const formContent = `<div class="btn-group w-100">${createButtonOptions('form')}</div>`;
        const konturContent = `<div class="btn-group w-100">${createButtonOptions('kontur')}</div>`;
        const homogenitaetContent = `<div class="btn-group w-100">${createButtonOptions('homogenitaet')}</div>`;
        const signalContent = `<div class="btn-group w-100">${createButtonOptions('signal')}</div>`;

        const mainCardContent = `
            <div class="row g-3">
                ${createCriteriaCard(CONSTANTS.T2_CRITERIA_KEYS.SIZE, 'Größe (Kurzachse)', sizeContent)}
                ${createCriteriaCard(CONSTANTS.T2_CRITERIA_KEYS.FORM, 'Form', formContent)}
                ${createCriteriaCard(CONSTANTS.T2_CRITERIA_KEYS.KONTUR, 'Kontur', konturContent)}
                ${createCriteriaCard(CONSTANTS.T2_CRITERIA_KEYS.HOMOGENITAET, 'Homogenität', homogenitaetContent)}
                ${createCriteriaCard(CONSTANTS.T2_CRITERIA_KEYS.SIGNAL, 'Signal', signalContent)}
            </div>`;

        const logicSwitchChecked = logic === CONSTANTS.LOGIC_OPERATORS.OR ? 'checked' : '';
        const mainCardFooter = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="${CONSTANTS.SELECTORS.T2_LOGIC_SWITCH.substring(1)}" ${logicSwitchChecked}>
                    <label class="form-check-label" for="${CONSTANTS.SELECTORS.T2_LOGIC_SWITCH.substring(1)}">Logik: <span class="fw-bold" id="${CONSTANTS.SELECTORS.T2_LOGIC_LABEL.substring(1)}">${logic}</span></label>
                </div>
                <div>
                    <button id="${CONSTANTS.SELECTORS.BTN_RESET_CRITERIA.substring(1)}" class="btn btn-sm btn-outline-secondary me-2">Zurücksetzen</button>
                    <button id="${CONSTANTS.SELECTORS.BTN_APPLY_CRITERIA.substring(1)}" class="btn btn-sm btn-primary">Anwenden & Speichern</button>
                </div>
            </div>`;

        return commonComponents.createCard(
            CONSTANTS.SELECTORS.T2_CRITERIA_CARD.substring(1),
            'T2-Kriterien Definieren',
            mainCardContent,
            { footerContent: mainCardFooter }
        );
    }
    
    function _createAuswertungTableRow(patient, appliedCriteria, appliedLogic) {
        return tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
    }

    function render(data, currentCriteria, currentLogic, sortState, currentKollektiv) {
        if (!data || !currentCriteria || !currentLogic) return '<p class="text-danger p-3">Fehlerhafte Daten für die Auswertungsansicht.</p>';
        
        const stats = statisticsService.calculateDescriptiveStats(data);
        const dashboardHTML = _createDashboardCards(stats);
        const criteriaControlsHTML = _createT2CriteriaControls(currentCriteria, currentLogic);

        const tableHTML = auswertungTabLogic.createAuswertungTableHTML(data, sortState, currentCriteria, currentLogic);
        const auswertungTableCardHTML = commonComponents.createCard('auswertung-table-card', 'Patientenübersicht & Auswertungsergebnisse', tableHTML, {
            bodyClass: 'p-0',
            headerButtons: [{ id: CONSTANTS.SELECTORS.AUSWERTUNG_TOGGLE_DETAILS.substring(1), icon: 'fa-chevron-down', tooltip: 'Alle Details ein-/ausblenden', extraAttributes: 'data-action="expand"'}]
        });

        const metricsCardHTML = commonComponents.createCard(CONSTANTS.SELECTORS.T2_METRICS_OVERVIEW.substring(1), 'T2 Gütekriterien (angewandt)', '<p class="text-muted small p-2">Wird berechnet...</p>');
        const bruteForceCardHTML = uiComponents.createBruteForceCard(currentKollektiv, bruteForceManager.isWorkerAvailable());

        let finalHTML = `
            <div class="row g-3 mb-3">${dashboardHTML}</div>
            <div class="row g-3">
                <div class="col-12">${criteriaControlsHTML}</div>
                <div class="col-12">${metricsCardHTML}</div>
                <div class="col-12">${bruteForceCardHTML}</div>
                <div class="col-12">${auswertungTableCardHTML}</div>
            </div>`;
        
        return finalHTML;
    }
    
    return Object.freeze({
        render
    });
})();

