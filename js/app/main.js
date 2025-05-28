(async () => {
    async function initializeApp() {
        try {
            if (typeof kollektivStore === 'undefined' || typeof PATIENT_DATA === 'undefined') {
                document.body.innerHTML = '<div class="alert alert-danger m-5" role="alert">Fehler: Kritische Datenquelle (kollektivStore oder PATIENT_DATA) nicht verfügbar. Anwendung kann nicht starten.</div>';
                console.error("kollektivStore oder PATIENT_DATA nicht definiert.");
                return;
            }
            kollektivStore.setRawData(PATIENT_DATA);

            if (typeof state === 'undefined' || typeof state.init !== 'function') { throw new Error("State-Modul nicht verfügbar."); }
            state.init();

            if (typeof dataProcessor === 'undefined' || typeof dataProcessor.init !== 'function') { throw new Error("DataProcessor-Modul nicht verfügbar."); }
            dataProcessor.init(kollektivStore.getAllData());

            if (typeof t2CriteriaManager === 'undefined' || typeof t2CriteriaManager.initialize !== 'function') { throw new Error("T2CriteriaManager-Modul nicht verfügbar."); }
            t2CriteriaManager.initialize();

            if (typeof studyT2CriteriaManager === 'undefined' || typeof studyT2CriteriaManager.init !== 'function') { throw new Error("StudyT2CriteriaManager-Modul nicht verfügbar."); }
            studyT2CriteriaManager.init();

            if (typeof generalEventHandlers === 'undefined' || typeof generalEventHandlers.setupGeneralEventHandlers !== 'function') { throw new Error("GeneralEventHandlers-Modul nicht verfügbar."); }
            generalEventHandlers.setupGeneralEventHandlers();

            if (typeof auswertungEventHandlers === 'undefined' || typeof auswertungEventHandlers.setupAuswertungTabEventHandlers !== 'function') { throw new Error("AuswertungEventHandlers-Modul nicht verfügbar."); }
            auswertungEventHandlers.setupAuswertungTabEventHandlers();

            if (typeof statistikEventHandlers === 'undefined' || typeof statistikEventHandlers.setupStatistikTabEventHandlers !== 'function') { throw new Error("StatistikEventHandlers-Modul nicht verfügbar."); }
            statistikEventHandlers.setupStatistikTabEventHandlers();

            if (typeof praesentationEventHandlers === 'undefined' || typeof praesentationEventHandlers.setupPraesentationTabEventHandlers !== 'function') { throw new Error("PraesentationEventHandlers-Modul nicht verfügbar."); }
            praesentationEventHandlers.setupPraesentationTabEventHandlers();

            if (typeof publikationEventHandlers === 'undefined' || typeof publikationEventHandlers.setupPublicationTabEventHandlers !== 'function') { throw new Error("PublikationEventHandlers-Modul nicht verfügbar."); }
            publikationEventHandlers.setupPublicationTabEventHandlers();


            if (typeof viewRenderer === 'undefined' || typeof viewRenderer.renderView !== 'function') { throw new Error("ViewRenderer-Modul nicht verfügbar."); }
            const initialTabId = state.getActiveTabId() || 'publikation-tab-pane';
            const initialTabButton = document.getElementById(initialTabId.replace('-pane',''));

            if (initialTabButton) {
                 const tabInstance = bootstrap.Tab.getOrCreateInstance(initialTabButton);
                 if(tabInstance) tabInstance.show();
            }
            await viewRenderer.renderView(initialTabId);


            window.onbeforeunload = () => {
                if (typeof bruteForceManager !== 'undefined' && bruteForceManager.isRunning()) {
                    bruteForceManager.terminateWorker();
                    return "Eine Brute-Force-Analyse läuft noch. Wenn Sie die Seite verlassen, wird diese abgebrochen.";
                }
            };

            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                appContainer.classList.add('app-initialized');
            }

        } catch (error) {
            console.error("Fehler bei der Initialisierung der Anwendung:", error);
            const bodyElement = document.body;
            if (bodyElement) {
                bodyElement.innerHTML = `<div class="alert alert-danger m-3 p-3" role="alert"><strong>Anwendungsfehler:</strong> Bei der Initialisierung ist ein kritischer Fehler aufgetreten. Bitte überprüfen Sie die Konsole für Details. (${error.message})</div>`;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
