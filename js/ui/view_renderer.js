const viewRenderer = (() => {
    let mainAppInterfaceRef = null;
    const tabLogics = {
        'daten-tab': dataTabLogic,
        'auswertung-tab': auswertungTabLogic,
        'statistik-tab': statistikTabLogic,
        'praesentation-tab': praesentationTabLogic,
        'publikation-tab': publicationTabLogic,
        'export-tab': typeof exportTabLogic !== 'undefined' ? exportTabLogic : null
    };

    const tabDefinitions = [
        { id: 'daten-tab', labelKey: 'daten', icon: 'fa-database' },
        { id: 'auswertung-tab', labelKey: 'auswertung', icon: 'fa-cogs' },
        { id: 'statistik-tab', labelKey: 'statistik', icon: 'fa-chart-bar' },
        { id: 'praesentation-tab', labelKey: 'praesentation', icon: 'fa-slideshare' },
        { id: 'publikation-tab', labelKey: 'publikation', icon: 'fa-file-alt' },
        { id: 'export-tab', labelKey: 'export', icon: 'fa-download', isMoreTab: true }
    ];


    function _initializeTabLogics(processedData, currentSettings, mainAppInterface) {
        mainAppInterfaceRef = mainAppInterface;
        Object.keys(tabLogics).forEach(tabId => {
            const logic = tabLogics[tabId];
            if (logic && typeof logic.initialize === 'function') {
                logic.initialize(processedData, currentSettings, mainAppInterface);
            } else if (tabId === 'export-tab' && logic === null) {
                console.warn("viewRenderer: exportTabLogic ist nicht verfügbar. Der Export-Tab wird möglicherweise nicht korrekt initialisiert.");
            }
        });
    }

    function _renderTabNavigation(activeTabId) {
        const navContainer = document.getElementById('main-nav-tabs');
        if (!navContainer) return;

        let navHTML = '';
        let moreTabsHTML = '';
        const maxVisibleTabs = 5;
        let visibleTabCount = 0;

        tabDefinitions.forEach(tab => {
            const label = UI_TEXTS?.mainTabs?.[tab.labelKey]?.label || tab.labelKey.charAt(0).toUpperCase() + tab.labelKey.slice(1);
            const tooltip = TOOLTIP_CONTENT?.mainTabs?.[tab.labelKey] || label;
            const isActive = tab.id === activeTabId;
            const isDisabled = tab.id === 'export-tab' && tabLogics['export-tab'] === null;
            const disabledAttributes = isDisabled ? 'disabled aria-disabled="true" style="pointer-events: none; opacity: 0.65;"' : '';

            const linkHTML = `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}" id="${tab.id}-nav" data-bs-toggle="tab" data-bs-target="#${tab.id}-pane" type="button" role="tab" aria-controls="${tab.id}-pane" aria-selected="${isActive}" data-tab-id="${tab.id}" data-tippy-content="${tooltip}${isDisabled ? ' (Modul nicht geladen)' : ''}" ${disabledAttributes}>
                        <i class="fas ${tab.icon} fa-fw me-1"></i>${label}
                    </button>
                </li>`;

            if (tab.isMoreTab || visibleTabCount >= maxVisibleTabs -1 ) {
                 if(tab.id === 'export-tab'){
                    moreTabsHTML += `<li><button class="dropdown-item nav-link ${isDisabled ? 'disabled' : ''}" id="${tab.id}-nav-dd" data-bs-toggle="tab" data-bs-target="#${tab.id}-pane" type="button" role="tab" aria-controls="${tab.id}-pane" aria-selected="${isActive}" data-tab-id="${tab.id}" data-tippy-content="${tooltip}${isDisabled ? ' (Modul nicht geladen)' : ''}" ${disabledAttributes}><i class="fas ${tab.icon} fa-fw me-1"></i>${label}</button></li>`;
                 } else {
                    navHTML += linkHTML;
                    visibleTabCount++;
                 }
            } else {
                navHTML += linkHTML;
                visibleTabCount++;
            }
        });

        if (moreTabsHTML.length > 0) {
            const moreTabLabel = UI_TEXTS?.mainTabs?.moreTabsDropdown?.label || 'Mehr';
            const moreTabTooltip = TOOLTIP_CONTENT?.mainTabs?.moreTabsDropdown || 'Weitere Optionen';
            navHTML += `
                <li class="nav-item dropdown">
                    <button class="nav-link dropdown-toggle" id="more-tabs-dropdown-nav" data-bs-toggle="dropdown" aria-expanded="false" role="button" data-tippy-content="${moreTabTooltip}">
                        <i class="fas fa-ellipsis-h fa-fw me-1"></i>${moreTabLabel}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="more-tabs-dropdown-nav">
                        ${moreTabsHTML}
                    </ul>
                </li>`;
        }
        navContainer.innerHTML = navHTML;
    }

    function _renderTabPanes() {
        const contentContainer = document.getElementById('main-tab-content');
        if (!contentContainer) return;
        let panesHTML = '';
        tabDefinitions.forEach(tab => {
            panesHTML += `<div class="tab-pane fade" id="${tab.id}-pane" role="tabpanel" aria-labelledby="${tab.id}-nav"><div id="${tab.id}-content-area" class="tab-content-area"></div></div>`;
        });
        contentContainer.innerHTML = panesHTML;
    }

    function renderAppShell() {
        const appHeader = document.getElementById('app-header');
        if (appHeader) {
             appHeader.innerHTML = `
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="app-title">
                            <h1>${APP_CONFIG.APP_NAME}</h1>
                            <span class="app-version small text-muted">Version ${APP_CONFIG.APP_VERSION}</span>
                        </div>
                        <div class="header-controls d-flex align-items-center">
                             <div class="btn-group btn-group-sm me-3" role="group" aria-label="Kollektiv Auswahl" id="kollektiv-button-group" data-tippy-content="${TOOLTIP_CONTENT.kollektivButtons.description}">
                                <button type="button" class="btn btn-outline-primary" data-kollektiv="Gesamt">${getKollektivDisplayName('Gesamt')}</button>
                                <button type="button" class="btn btn-outline-primary" data-kollektiv="direkt OP">${getKollektivDisplayName('direkt OP')}</button>
                                <button type="button" class="btn btn-outline-primary" data-kollektiv="nRCT">${getKollektivDisplayName('nRCT')}</button>
                            </div>
                            <button class="btn btn-sm btn-outline-secondary" id="btn-kurzanleitung" data-tippy-content="${TOOLTIP_CONTENT.kurzanleitungButton.description}">
                                <i class="fas fa-question-circle me-1"></i>Kurzanleitung
                            </button>
                        </div>
                    </div>
                     <div id="header-stats-container" class="mt-2 small text-muted d-flex flex-wrap justify-content-start" data-tippy-content="${TOOLTIP_CONTENT.headerStats.description || 'Überblick aktuelle Daten'}">
                        <span class="me-3" data-tippy-content="${TOOLTIP_CONTENT.headerStats.kollektiv}">Akt. Kollektiv: <strong id="header-kollektiv">--</strong></span>
                        <span class="me-3" data-tippy-content="${TOOLTIP_CONTENT.headerStats.anzahlPatienten}">Patienten: <strong id="header-anzahl-patienten">--</strong></span>
                        <span class="me-3" data-tippy-content="${TOOLTIP_CONTENT.headerStats.statusN}">N-Status (Patho): <strong id="header-status-n">--</strong></span>
                        <span class="me-3" data-tippy-content="${TOOLTIP_CONTENT.headerStats.statusAS}">AS-Status (MRT): <strong id="header-status-as">--</strong></span>
                        <span data-tippy-content="${TOOLTIP_CONTENT.headerStats.statusT2}">T2-Status (Angewandt): <strong id="header-status-t2">--</strong></span>
                    </div>
                </div>`;
        }

        const mainNavContainer = document.getElementById('main-nav-container');
        if(mainNavContainer){
            mainNavContainer.innerHTML = `<ul class="nav nav-tabs flex-grow-1" id="main-nav-tabs" role="tablist"></ul>`;
        }
        _renderTabNavigation(state.getActiveTabId() || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || tabDefinitions[0].id);
        _renderTabPanes();

        const toastContainerHTML = '<div id="toast-container" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;"></div>';
        document.body.insertAdjacentHTML('beforeend', toastContainerHTML);

        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }

    function renderTabContent(tabId, processedData, currentSettings) {
        const activeTabPane = document.getElementById(`${tabId}-pane`);
        const activeTabContentArea = document.getElementById(`${tabId}-content-area`);

        document.querySelectorAll('#main-tab-content .tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        if (activeTabPane) {
            activeTabPane.classList.add('show', 'active');
        } else {
            console.error(`Tab-Pane für ID '${tabId}' nicht gefunden.`);
            return;
        }
        if (!activeTabContentArea) {
             console.error(`Tab-Content-Area für ID '${tabId}' nicht gefunden.`);
             return;
        }
        activeTabContentArea.innerHTML = '<div class="d-flex justify-content-center align-items-center" style="min-height: 200px;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>';


        const logicModule = tabLogics[tabId];
        if (logicModule && typeof logicModule.renderTabContent === 'function') {
            if (typeof logicModule.updateData === 'function') {
                logicModule.updateData(processedData, currentSettings);
            }
            if (tabId === 'publikation-tab') {
                 activeTabContentArea.innerHTML = uiComponents.createPublikationTabHeader();
                 const pubContentDiv = document.getElementById('publikation-content-area');
                 if(pubContentDiv) {
                     pubContentDiv.innerHTML = '<div class="d-flex justify-content-center align-items-center" style="min-height: 200px;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>';
                 }
            } else {
                 activeTabContentArea.innerHTML = '';
            }
            logicModule.renderTabContent();
        } else if (tabId === 'export-tab' && logicModule === null) {
             activeTabContentArea.innerHTML = `<div class="alert alert-warning m-3" role="alert"><strong>Export-Tab nicht verfügbar:</strong> Das benötigte Modul (exportTabLogic) konnte aufgrund eines Ladefehlers (wahrscheinlich MIME-Typ) nicht initialisiert werden. Bitte überprüfen Sie die Serverkonfiguration und die Browser-Konsole.</div>`;
             console.error(`Render-Logik für Tab '${tabId}' ist nicht verfügbar, da das Modul nicht geladen wurde.`);
        } else {
            activeTabContentArea.innerHTML = `<p class="text-danger p-3">Keine Render-Logik für Tab '${tabId}' definiert.</p>`;
            console.error(`Kein Logic-Modul oder renderTabContent-Funktion für Tab-ID '${tabId}' gefunden.`);
        }
        ui_helpers.updateExportButtonStates(tabId, bruteForceManager.hasAnyResults(), true);
        ui_helpers.initializeTooltips(document.getElementById('app-container'));
    }


    function updateActiveTabInNav(activeTabId) {
        document.querySelectorAll('#main-nav-tabs .nav-link, #more-tabs-dropdown-nav + .dropdown-menu .nav-link').forEach(link => {
            const isCurrentTab = link.dataset.tabId === activeTabId;
            link.classList.toggle('active', isCurrentTab);
            link.setAttribute('aria-selected', String(isCurrentTab));

            if (link.id === 'more-tabs-dropdown-nav') {
                const dropdownMenu = link.nextElementSibling;
                const isAnyDropdownItemActive = dropdownMenu && dropdownMenu.querySelector('.nav-link.active');
                link.classList.toggle('active', !!isAnyDropdownItemActive);
            }
        });
    }

    return Object.freeze({
        initializeTabLogics: _initializeTabLogics,
        renderAppShell,
        renderTabContent,
        updateActiveTabInNav,
        getTabDefinitions: () => tabDefinitions
    });

})();
