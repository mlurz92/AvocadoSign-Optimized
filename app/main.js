document.addEventListener('DOMContentLoaded', function() {
    
    const BruteForceService = {
        _worker: null,
        _appState: null,
        _uiManager: null,

        init: function(appState, uiManager) {
            this._appState = appState;
            this._uiManager = uiManager;
        },

        start: function() {
            if (this._worker) {
                this._worker.terminate();
            }
            this._worker = new Worker('workers/brute_force_worker.js');
            this._worker.addEventListener('message', this._handleWorkerMessage.bind(this));

            const button = document.getElementById(AppConfig.domIds.buttons.startBruteForce);
            if(button) button.disabled = true;

            const data = DataProcessor.getProcessedData();
            this._uiManager.updateBruteForceProgress(0, 'Starte Brute-Force-Analyse...');
            
            this._worker.postMessage({
                data: data,
                params: ['t2_short_axis', 't2_long_axis'],
                config: AppConfig.settings.bruteForce
            });
        },

        _handleWorkerMessage: function(event) {
            const { type, payload } = event.data;

            if (type === 'progress') {
                this._uiManager.updateBruteForceProgress(payload.progress, payload.message);
            } else if (type === 'complete') {
                this._appState.updateBruteForceResults(payload.bestParam, payload.bestThreshold);
                
                const selectElement = document.getElementById(AppConfig.domIds.inputs.t2CriteriaSelect);
                if(selectElement) {
                     const options = CriteriaManager.getSelectOptions();
                     selectElement.innerHTML = '';
                     options.forEach(opt => {
                        const optionElement = DOMComponents.createElement('option', {
                            textContent: opt.text,
                            attributes: { value: opt.value }
                        });
                        selectElement.appendChild(optionElement);
                     });
                }
                
                this._uiManager.updateBruteForceProgress(1, `Optimierung abgeschlossen. Bestes Kriterium: ${payload.bestParam} >= ${payload.bestThreshold.toFixed(2)}`);
                const button = document.getElementById(AppConfig.domIds.buttons.startBruteForce);
                if(button) button.disabled = false;

                this._worker.terminate();
                this._worker = null;
            }
        }
    };
    
    function initializeApplication() {
        if (!window.AppConfig || !window.DataProcessor || !window.AppState || !window.CriteriaManager || !window.StatisticsService || !window.UIManager || !window.EventHandlerManager) {
            console.error("Ein oder mehrere Kernmodule konnten nicht geladen werden. Die Anwendung kann nicht gestartet werden.");
            document.body.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: sans-serif; color: red;"><strong>Fehler:</strong> Kritische Anwendungskomponenten fehlen. Bitte überprüfen Sie die Konsolenausgabe.</div>';
            return;
        }

        DataProcessor.loadAndProcessData();
        AppState.init();
        UIManager.init(AppState);
        BruteForceService.init(AppState, UIManager);
        EventHandlerManager.init(AppState, UIManager, BruteForceService);
        
        console.log(`Anwendung "${AppConfig.appName}" erfolgreich initialisiert.`);
    }

    initializeApplication();
});
