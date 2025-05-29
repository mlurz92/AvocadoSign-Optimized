const mainAppInterface = (() => {
    let processedData = null;

    function renderCurrentTabContent() {
        if (typeof viewRenderer !== 'undefined' && typeof state !== 'undefined' && processedData) {
            const currentSettings = state.getAllState();
            viewRenderer.renderTabContent(state.getActiveTabId(), processedData, currentSettings);
            viewRenderer.updateActiveTabInNav(state.getActiveTabId());
        } else {
            console.error("main.js: renderCurrentTabContent - Abhängigkeiten nicht erfüllt.");
        }
    }

    function refreshAllTabs() {
        if (typeof viewRenderer !== 'undefined' && typeof state !== 'undefined' && processedData) {
            const currentSettings = state.getAllState();
            viewRenderer.initializeTabLogics(processedData, currentSettings, mainAppInterface);
            renderCurrentTabContent();
             if (typeof ui_helpers !== 'undefined' && typeof dataProcessor !== 'undefined') {
                const headerStats = dataProcessor.calculateHeaderStats(
                    dataProcessor.filterDataByKollektiv(processedData, state.getCurrentKollektiv()),
                    state.getCurrentKollektiv()
                );
                ui_helpers.updateHeaderStatsUI(headerStats);
                ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
            }
        }
    }

    function refreshSpecificTabs(tabIdsArray) {
        if (!Array.isArray(tabIdsArray) || typeof viewRenderer === 'undefined' || typeof state === 'undefined' || !processedData) {
            console.warn("main.js: refreshSpecificTabs - Ungültige Parameter oder Abhängigkeiten nicht erfüllt.");
            return;
        }
        const currentSettings = state.getAllState();
        const tabLogicsToUpdate = {
            'daten-tab': dataTabLogic,
            'auswertung-tab': auswertungTabLogic,
            'statistik-tab': statistikTabLogic,
            'praesentation-tab': praesentationTabLogic,
            'publikation-tab': publicationTabLogic,
            'export-tab': typeof exportTabLogic !== 'undefined' ? exportTabLogic : null
        };

        tabIdsArray.forEach(tabId => {
            const logicModule = tabLogicsToUpdate[tabId];
            if (logicModule && typeof logicModule.updateData === 'function') {
                logicModule.updateData(processedData, currentSettings);
            }
        });

        if (tabIdsArray.includes(state.getActiveTabId())) {
            renderCurrentTabContent();
        }
         if (typeof ui_helpers !== 'undefined' && typeof dataProcessor !== 'undefined') {
            const headerStats = dataProcessor.calculateHeaderStats(
                 dataProcessor.filterDataByKollektiv(processedData, state.getCurrentKollektiv()),
                 state.getCurrentKollektiv()
            );
            ui_helpers.updateHeaderStatsUI(headerStats);
         }
    }

    function setUIInteraction(isInteractive) {
        const overlay = document.getElementById('global-ui-block-overlay');
        const spinner = document.getElementById('global-ui-block-spinner');
        const mainNav = document.getElementById('main-nav-container');
        const headerControls = document.querySelector('#app-header .header-controls');

        if (overlay && spinner) {
            overlay.style.display = isInteractive ? 'none' : 'flex';
            spinner.style.display = isInteractive ? 'none' : 'block';
        }
        if(mainNav) mainNav.style.pointerEvents = isInteractive ? '' : 'none';
        if(headerControls) headerControls.style.pointerEvents = isInteractive ? '' : 'none';

        const allButtonsAndInputs = document.querySelectorAll('button, input, select, a.nav-link');
        allButtonsAndInputs.forEach(el => {
            if (!el.closest('#global-ui-block-overlay') && !el.closest('#toast-container') && !el.closest('.modal')) {
                if(el.id === 'btn-cancel-brute-force' && !isInteractive){
                     el.disabled = false;
                } else {
                     el.disabled = !isInteractive;
                }
            }
        });
         const activeBruteForceCancelButton = document.getElementById('btn-cancel-brute-force');
         if (activeBruteForceCancelButton && !isInteractive && typeof bruteForceManager !== 'undefined' && bruteForceManager.isRunning()) {
             activeBruteForceCancelButton.disabled = false;
         }

    }
    function updateHeader() {
        if (typeof ui_helpers !== 'undefined' && typeof dataProcessor !== 'undefined' && typeof state !== 'undefined' && processedData) {
            const currentKollektiv = state.getCurrentKollektiv();
            const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
            const evaluatedData = t2CriteriaManager.evaluateDataset(filteredData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
            const headerStats = dataProcessor.calculateHeaderStats(evaluatedData, currentKollektiv);
            ui_helpers.updateHeaderStatsUI(headerStats);
        }
    }

    function getAllData() {
        return processedData ? cloneDeep(processedData) : null;
    }


    return Object.freeze({
        renderCurrentTabContent,
        refreshAllTabs,
        refreshSpecificTabs,
        setUIInteraction,
        updateHeader,
        getAllData,
        processedData
    });
})();


function _initializeApplication() {
    if (typeof APP_CONFIG === 'undefined' || typeof UI_TEXTS === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined' || typeof PATIENT_RAW_DATA === 'undefined') {
        document.body.innerHTML = '<div class="alert alert-danger m-5" role="alert"><strong>Kritischer Fehler:</strong> Eine oder mehrere Kernkonfigurationen (APP_CONFIG, UI_TEXTS, TOOLTIP_CONTENT) oder die Rohdaten (PATIENT_RAW_DATA) konnten nicht geladen werden. Die Anwendung kann nicht gestartet werden. Bitte überprüfen Sie die Browser-Konsole auf vorhergehende Fehler, die das Laden dieser essentiellen Skripte verhindert haben könnten, sowie die korrekte Einbindung aller Skriptdateien in der HTML-Datei.</div>';
        console.error("Kritischer Initialisierungsfehler: APP_CONFIG, UI_TEXTS, TOOLTIP_CONTENT oder PATIENT_RAW_DATA fehlt. Dies ist oft ein Folgefehler eines Problems beim Laden oder Ausführen einer der Konfigurationsskripte.");
        return;
    }

    try {
        state.initializeState();
        mainAppInterface.processedData = dataProcessor.processPatientData(PATIENT_RAW_DATA);
        if (!mainAppInterface.processedData || mainAppInterface.processedData.length === 0) {
            throw new Error("Datenverarbeitung (dataProcessor.processPatientData) lieferte keine Ergebnisse oder die Rohdaten (PATIENT_RAW_DATA) sind leer/ungültig.");
        }

        t2CriteriaManager.initialize();

        viewRenderer.renderAppShell();
        viewRenderer.initializeTabLogics(mainAppInterface.processedData, state.getAllState(), mainAppInterface);

        generalEventHandlers.initialize(mainAppInterface);
        auswertungTabEventHandlers.initialize(mainAppInterface);
        statistikTabEventHandlers.initialize();
        praesentationTabEventHandlers.initialize();
        publicationTabEventHandlers.initialize(mainAppInterface);


        mainAppInterface.renderCurrentTabContent();
        ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
        mainAppInterface.updateHeader();


        if (state.isFirstAppStart()) {
            setTimeout(() => { ui_helpers.showKurzanleitung(); }, 500);
        }

        ui_helpers.updateExportButtonStates(state.getActiveTabId(), bruteForceManager.hasAnyResults(), true);
        console.log(`Anwendung ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} erfolgreich initialisiert.`);

    } catch (error) {
        console.error("Fehler während der Anwendungsinitialisierung (_initializeApplication):", error);
        const appContainer = document.getElementById('app-container');
        const errorMessage = `<strong>Initialisierungsfehler in der Anwendung:</strong> ${error.message}. Bitte überprüfen Sie die Browser-Konsole auf detaillierte Fehlermeldungen und vorhergehende Fehler. Es ist möglich, dass kritische Skripte oder Daten nicht korrekt geladen oder verarbeitet werden konnten.`;
        if (appContainer) {
             appContainer.innerHTML = `<div class="alert alert-danger m-3" role="alert">${errorMessage}</div>`;
        } else {
            document.body.innerHTML = `<div class="alert alert-danger m-5" role="alert">${errorMessage}</div>`;
        }
        if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) {
            ui_helpers.showToast(`Initialisierungsfehler: ${error.message}`, 'danger', 10000);
        }
    }
}

document.addEventListener('DOMContentLoaded', _initializeApplication);
