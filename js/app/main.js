(async () => {
    async function initializeApp() {
        try {
            // Verwende patientDataRaw direkt, da dies in data.js definiert ist.
            // kollektivStore wird später als Modul eingeführt und hier verwendet.
            if (typeof patientDataRaw === 'undefined') {
                document.body.innerHTML = '<div class="alert alert-danger m-5" role="alert">Fehler: Kritische Datenquelle (patientDataRaw) nicht verfügbar. Anwendung kann nicht starten.</div>';
                console.error("patientDataRaw nicht definiert.");
                return;
            }

            // Initialisiere den kollektivStore und setze die Rohdaten
            // Diese Zeile setzt voraus, dass kollektivStore.js bereits geladen wurde und kollektivStore global verfügbar ist.
            if (typeof kollektivStore === 'undefined' || typeof kollektivStore.setRawData !== 'function') {
                document.body.innerHTML = '<div class="alert alert-danger m-5" role="alert">Fehler: kollektivStore nicht verfügbar oder fehlerhaft. Anwendung kann nicht starten.</div>';
                console.error("kollektivStore nicht definiert oder setRawData Funktion fehlt.");
                return;
            }
            kollektivStore.setRawData(patientDataRaw); // patientDataRaw statt PATIENT_DATA

            if (typeof state === 'undefined' || typeof state.init !== 'function') { throw new Error("State-Modul nicht verfügbar."); }
            state.init();

            if (typeof dataProcessor === 'undefined' || typeof dataProcessor.processPatientData !== 'function') { throw new Error("DataProcessor-Modul nicht verfügbar."); }
            // dataProcessor.init wurde entfernt, da die Datenaufbereitung nun direkt beim Setzen in den Store oder bei Bedarf erfolgt.
            // Die Logik zur direkten Initialisierung von dataProcessor mit Daten wird überarbeitet,
            // da die Daten nun primär über kollektivStore bezogen werden.

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
            // Die setupPublicationTabEventHandlers benötigt möglicherweise eine Referenz auf die mainAppInterface,
            // um Callbacks für Sprach- oder Metrikänderungen zu registrieren.
            // Dies wird hier als mainAppInterface an die Funktion übergeben.
            const mainAppInterface = {
                updateGlobalUIState: () => {
                    generalEventHandlers.updateHeaderStats();
                    // Weitere globale UI Updates hier, falls nötig
                },
                refreshCurrentTab: async () => {
                    const activeTabId = state.getActiveTabId();
                    if (activeTabId) {
                       await viewRenderer.refreshView(activeTabId);
                    }
                }
            };
            publikationEventHandlers.setupPublicationTabEventHandlers(mainAppInterface);


            if (typeof viewRenderer === 'undefined' || typeof viewRenderer.renderView !== 'function') { throw new Error("ViewRenderer-Modul nicht verfügbar."); }
            const initialTabId = state.getActiveTabId() || 'publikation-tab-pane'; // Bevorzugt den gespeicherten Tab oder Fallback
            const initialTabButton = document.getElementById(initialTabId.replace('-pane',''));


            if (initialTabButton) {
                 const tabInstance = bootstrap.Tab.getOrCreateInstance(initialTabButton);
                 if(tabInstance) tabInstance.show(); // Löst 'shown.bs.tab' Event aus, das renderView aufruft
            } else {
                // Fallback, falls kein initialer Tab-Button gefunden wird (z.B. wenn ID falsch)
                // Dann manuell den View rendern
                 await viewRenderer.renderView(initialTabId);
            }


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
