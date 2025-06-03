(function() {
    'use strict';

    const CORE_MODULE_DEFINITIONS = [
        { name: 'APP_CONFIG', path: 'js/config/app_config.js', expectedType: 'object' },
        { name: 'TEXT_CONFIG', path: 'js/config/text_config.js', expectedType: 'object' },
        { name: 'PUBLICATION_CONFIG', path: 'js/config/publication_config.js', expectedType: 'object' },
        { name: 'PUBLICATION_CONTENT_TEMPLATES', path: 'js/config/publication_content_templates.js', expectedType: 'object' },
        { name: 'Utils', path: 'js/utils/utils.js', expectedType: 'object' },
        { name: 'patientData', path: 'data/data.js', expectedType: 'array' },
        { name: 'DataProcessor', path: 'js/core/data_processor.js', expectedType: 'function' },
        { name: 'T2CriteriaManager', path: 'js/core/t2_criteria_manager.js', expectedType: 'function' },
        { name: 'StudyCriteriaManager', path: 'js/core/study_criteria_manager.js', expectedType: 'function' },
        { name: 'StatisticsService', path: 'js/services/statistics_service.js', expectedType: 'function' },
        { name: 'BruteForceManager', path: 'js/services/brute_force_manager.js', expectedType: 'function' },
        { name: 'ExportService', path: 'js/services/export_service.js', expectedType: 'function' },
        { name: 'StateManager', path: 'js/app/state.js', expectedType: 'object' },
        { name: 'UIHelpers', path: 'js/ui/core/ui_helpers.js', expectedType: 'object' },
        { name: 'UIComponents', path: 'js/ui/core/ui_components.js', expectedType: 'object' },
        { name: 'TableRenderer', path: 'js/ui/renderers/table_renderer.js', expectedType: 'function' },
        { name: 'ChartRenderer', path: 'js/ui/renderers/chart_renderer.js', expectedType: 'function' },
        { name: 'PublicationTextGenerator', path: 'js/ui/renderers/publication_text_generator.js', expectedType: 'function' },
        { name: 'PublicationRenderer', path: 'js/ui/renderers/publication_renderer.js', expectedType: 'function' },
        { name: 'DataTabLogic', path: 'js/ui/view_logic/data_tab_logic.js', expectedType: 'object' },
        { name: 'AuswertungTabLogic', path: 'js/ui/view_logic/auswertung_tab_logic.js', expectedType: 'object' },
        { name: 'StatistikTabLogic', path: 'js/ui/view_logic/statistik_tab_logic.js', expectedType: 'object' },
        { name: 'PraesentationTabLogic', path: 'js/ui/view_logic/praesentation_tab_logic.js', expectedType: 'object' },
        { name: 'PublikationTabLogic', path: 'js/ui/view_logic/publikation_tab_logic.js', expectedType: 'object' },
        { name: 'ViewRenderer', path: 'js/ui/view_renderer.js', expectedType: 'object' },
        { name: 'GeneralEventHandlers', path: 'js/ui/event_handlers/general_event_handlers.js', expectedType: 'object' },
        { name: 'DataTabEventHandlers', path: 'js/ui/event_handlers/data_tab_event_handlers.js', expectedType: 'object' },
        { name: 'AuswertungEventHandlers', path: 'js/ui/event_handlers/auswertung_event_handlers.js', expectedType: 'object' },
        { name: 'StatistikEventHandlers', path: 'js/ui/event_handlers/statistik_event_handlers.js', expectedType: 'object' },
        { name: 'PraesentationEventHandlers', path: 'js/ui/event_handlers/praesentation_event_handlers.js', expectedType: 'object' },
        { name: 'PublikationEventHandlers', path: 'js/ui/event_handlers/publikation_event_handlers.js', expectedType: 'object' },
        { name: 'ExportEventHandlers', path: 'js/ui/event_handlers/export_event_handlers.js', expectedType: 'object' }
    ];

    function checkCoreModulesAvailability() {
        const missingModules = [];
        const improperlyTypedModules = [];

        CORE_MODULE_DEFINITIONS.forEach(moduleDef => {
            const moduleObject = window[moduleDef.name];
            if (typeof moduleObject === 'undefined') {
                missingModules.push(`${moduleDef.name} (erwartet aus ${moduleDef.path})`);
            } else if (typeof moduleObject !== moduleDef.expectedType) {
                improperlyTypedModules.push(`${moduleDef.name} (erwartet Typ: ${moduleDef.expectedType}, gefunden: ${typeof moduleObject} aus ${moduleDef.path})`);
            }
        });

        if (missingModules.length > 0 || improperlyTypedModules.length > 0) {
            let comprehensiveErrorMessage = "Fehler bei der Initialisierung der Anwendung:\n";
            if (missingModules.length > 0) {
                comprehensiveErrorMessage += `Die folgenden Kernmodule konnten nicht gefunden werden (prüfen Sie Pfade in index.html und Fehler in den Skriptdateien selbst):\n- ${missingModules.join('\n- ')}\n\n`;
            }
            if (improperlyTypedModules.length > 0) {
                comprehensiveErrorMessage += `Die folgenden Kernmodule haben einen unerwarteten Typ (prüfen Sie die Implementierung der Module):\n- ${improperlyTypedModules.join('\n- ')}\n\n`;
            }
            comprehensiveErrorMessage += "Die App-Initialisierung wird abgebrochen. Bitte überprüfen Sie die Browser-Konsole auf weitere Fehlerdetails aus den einzelnen Skriptdateien.";
            
            console.error(comprehensiveErrorMessage); // Dies ist die verbesserte Fehlermeldung. Zeile 75 könnte hier sein.
            
            const errorDisplayElement = document.getElementById('loading-error-message');
            if (errorDisplayElement) {
                errorDisplayElement.textContent = comprehensiveErrorMessage.replace(/\n/g, ' ').replace(/- /g, ''); // Für eine kompaktere HTML-Anzeige
                errorDisplayElement.style.display = 'block';
            }
            const loadingIndicatorElement = document.getElementById('loading-indicator');
            if (loadingIndicatorElement) {
                const spinnerElement = loadingIndicatorElement.querySelector('.spinner-border');
                const loadingTextElement = loadingIndicatorElement.querySelector('p.mt-3.text-primary.fw-bold');
                if (spinnerElement) spinnerElement.style.display = 'none';
                if (loadingTextElement) loadingTextElement.style.display = 'none';
            }
            return false; // Signalisiert, dass Module fehlen oder fehlerhaft sind
        }
        return true; // Alle überprüften Module sind vorhanden und haben den korrekten Typ
    }

    async function initializeApplicationModules() {
        // Initialisiere StateManager zuerst, da viele andere Module davon abhängen könnten
        if (window.StateManager && typeof window.StateManager.initState === 'function') {
            await window.StateManager.initState();
        } else {
            console.warn('StateManager oder StateManager.initState ist nicht verfügbar. Einige Funktionen könnten beeinträchtigt sein.');
        }
        
        // Initialisiere Bootstrap Tooltips
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
            const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
                customClass: 'tooltip-glass',
                html: true 
            }));
        } else {
            console.warn("Bootstrap Tooltip Modul nicht gefunden bei initializeApplicationModules. Tooltips sind möglicherweise nicht funktionsfähig.");
        }

        // Initialisiere UI-Komponenten und Renderer
        if (window.ViewRenderer && typeof window.ViewRenderer.init === 'function') {
            window.ViewRenderer.init();
        } else {
            console.warn('ViewRenderer oder ViewRenderer.init ist nicht verfügbar.');
        }

        // Initialisiere allgemeine Event Handlers
        if (window.GeneralEventHandlers && typeof window.GeneralEventHandlers.init === 'function') {
            window.GeneralEventHandlers.init();
        } else {
            console.warn('GeneralEventHandlers oder GeneralEventHandlers.init ist nicht verfügbar.');
        }

        // Initialisiere spezifische Tab-Logiken und deren Event Handler (falls nicht schon durch ViewRenderer geschehen)
        // Die init-Methoden der TabLogic-Objekte sollten idealerweise auch ihre Event-Handler initialisieren.
        const tabLogics = ['DataTabLogic', 'AuswertungTabLogic', 'StatistikTabLogic', 'PraesentationTabLogic', 'PublikationTabLogic'];
        tabLogics.forEach(logicName => {
            if (window[logicName] && typeof window[logicName].init === 'function') {
                window[logicName].init();
            } else {
                console.warn(`${logicName} oder ${logicName}.init ist nicht verfügbar.`);
            }
        });
        
        // Event-Handler für den Export-Tab (falls separat)
        if (window.ExportEventHandlers && typeof window.ExportEventHandlers.init === 'function') {
             window.ExportEventHandlers.init();
        } else {
            console.warn('ExportEventHandlers oder ExportEventHandlers.init ist nicht verfügbar.');
        }
    }


    async function startApplication() {
        try {
            // Die Prüfung der Kernmodule ist der erste kritische Schritt.
            // Zeile 75 aus der ursprünglichen Fehlermeldung ist wahrscheinlich Teil dieser Prüfung.
            if (!checkCoreModulesAvailability()) {
                // Die Funktion checkCoreModulesAvailability gibt bereits eine detaillierte Fehlermeldung aus.
                return; 
            }

            await initializeApplicationModules();
            
            console.log("Avocado Sign Analyse Anwendung erfolgreich initialisiert und alle Module geladen.");
            
            const loadingIndicatorElement = document.getElementById('loading-indicator');
            const appContainerElement = document.getElementById('app-container');

            if (loadingIndicatorElement) loadingIndicatorElement.style.display = 'none';
            if (appContainerElement) appContainerElement.style.visibility = 'visible';

        } catch (error) {
            console.error('Schwerwiegender Fehler während der App-Initialisierung:', error);
            const errorDisplayElement = document.getElementById('loading-error-message');
            if (errorDisplayElement) {
                errorDisplayElement.textContent = `Kritischer Initialisierungsfehler: ${error.message}. Details siehe Konsole.`;
                errorDisplayElement.style.display = 'block';
            }
            const loadingIndicatorElement = document.getElementById('loading-indicator');
            if (loadingIndicatorElement) {
                const spinnerElement = loadingIndicatorElement.querySelector('.spinner-border');
                const loadingTextElement = loadingIndicatorElement.querySelector('p.mt-3.text-primary.fw-bold');
                if (spinnerElement) spinnerElement.style.display = 'none';
                if (loadingTextElement) loadingTextElement.style.display = 'none';
            }
        }
    }

    // Event Listener für das Laden des DOMs
    document.addEventListener('DOMContentLoaded', startApplication);

})();
