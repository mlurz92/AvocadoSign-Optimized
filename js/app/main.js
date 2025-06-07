const mainAppInterface = {};

document.addEventListener('DOMContentLoaded', () => {

    state.initializeState(patientDataRaw);

    viewRenderer.init();
    ui_helpers.initializeTooltips(); 

    dataTabLogic.init();
    auswertungTabLogic.init();
    statistikTabLogic.init();
    praesentationTabLogic.init();
    publikationTabLogic.init();

    generalEventHandlers.init();
    auswertungEventHandlers.init();
    statistikEventHandlers.init();
    praesentationEventHandlers.init();
    publikationEventHandlers.init();

    const initialHeaderStats = dataProcessor.calculateHeaderStats(dataProcessor.filterDataByKollektiv(state.getProcessedData(), state.getCurrentKollektiv()), state.getCurrentKollektiv());
    ui_helpers.updateHeaderStatsUI(initialHeaderStats);
    ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());

    viewRenderer.renderTab(state.getActiveTabId(), state.getProcessedData(), state.getBruteForceResults());

    mainAppInterface.refreshCurrentTab = state.refreshCurrentTab;
    mainAppInterface.setKollektiv = state.setCurrentKollektiv;
    mainAppInterface.renderTab = viewRenderer.renderTab;
    mainAppInterface.getProcessedData = state.getProcessedData;
    mainAppInterface.getRawData = state.getRawData;
    mainAppInterface.getCurrentKollektiv = state.getCurrentKollektiv;
    mainAppInterface.showToast = ui_helpers.showToast;
    mainAppInterface.updateBruteForceUI = auswertungTabLogic.updateBruteForceUI;
    mainAppInterface.showKurzanleitung = ui_helpers.showKurzanleitung;

    const isFirstStart = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START);
    if (isFirstStart === null || isFirstStart === undefined || isFirstStart === true) {
        ui_helpers.showKurzanleitung();
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, false);
    }
});
