// Globale Variablen für den Zugriff von HTML-Elementen oder externen Skripten
// Dies kann später in einen App-Namespace gekapselt werden, falls nötig.
const mainAppInterface = {};

// Importiere alle Module
// Core modules
// import { APP_CONFIG } from '../config/app_config.js'; // APP_CONFIG is now global
// import { dataProcessor } from '../core/data_processor.js'; // Data.js provides rawData, dataProcessor processes it
// import { t2CriteriaManager } from '../core/t2_criteria_manager.js'; // Manages T2 criteria state and evaluation
// import { studyT2CriteriaManager } from '../core/study_criteria_manager.js'; // Manages pre-defined study criteria

// Services
// import { statisticsService } from '../services/statistics_service.js'; // Performs statistical calculations
// import { bruteForceManager } from '../services/brute_force_manager.js'; // Manages brute force optimization worker
// import { exportService } from '../services/export_service.js'; // Handles various data export functions

// UI components and helpers
// import { uiComponents } from '../ui/components/ui_components.js'; // Reusable UI components
// import { ui_helpers } from '../ui/helpers/ui_helpers.js'; // General UI helper functions
// import { chartRenderer } from '../ui/renderers/chart_renderer.js'; // Renders D3.js charts
// import { tableRenderer } from '../ui/renderers/table_renderer.js'; // Renders data tables

// Tab-specific logic
// import { dataTabLogic } from '../ui/views/data_tab_logic.js'; // Logic for the Data tab
// import { auswertungTabLogic } from '../ui/views/auswertung_tab_logic.js'; // Logic for the Evaluation tab
// import { statistikTabLogic } from '../ui/views/statistik_tab_logic.js'; // Logic for the Statistics tab
// import { praesentationTabLogic } from '../ui/views/praesentation_tab_logic.js'; // Logic for the Presentation tab
// import { publikationTabLogic } from '../ui/views/publikation_tab_logic.js'; // Logic for the Publication tab

// Publication renderers
// import { publicationTextGenerator } from '../ui/renderers/publication/publication_text_generator.js';
// import { publicationTables } from '../ui/renderers/publication/publication_tables.js';
// import { publicationFigures } from '../ui/renderers/publication/publication_figures.js';
// import { publicationRenderer } from '../ui/renderers/publication/publication_renderer.js';

// Application state and main renderer
// import { state } from './state.js'; // Manages application state
// import { viewRenderer } from '../ui/renderers/view_renderer.js'; // Renders main views

// Event handlers
// import { generalEventHandlers } from '../ui/handlers/general_event_handlers.js';
// import { auswertungEventHandlers } from '../ui/handlers/auswertung_event_handlers.js';
// import { statistikEventHandlers } from '../ui/handlers/statistik_event_handlers.js';
// import { praesentationEventHandlers } from '../ui/handlers/praesentation_event_handlers.js';
// import { publikationEventHandlers } from '../ui/handlers/publikation_event_handlers.js';


document.addEventListener('DOMContentLoaded', () => {
    // Initialisiere die App-Konfiguration mit Standardeinstellungen
    // APP_CONFIG ist bereits global durch das <script> Tag im HTML

    // Initialisiere den globalen Zustand der Anwendung
    state.initializeState(rawData);

    // Initialisiere die View-Renderer
    viewRenderer.init();
    ui_helpers.init(); // Initialize UI helpers, including the initial tooltips

    // Initialisiere die einzelnen Tab-Logiken
    dataTabLogic.init();
    auswertungTabLogic.init();
    statistikTabLogic.init();
    praesentationTabLogic.init();
    publikationTabLogic.init();

    // Initialisiere die Event-Handler
    generalEventHandlers.init();
    auswertungEventHandlers.init(); // Event listener for brute force is handled here
    statistikEventHandlers.init();
    praesentationEventHandlers.init();
    publikationEventHandlers.init();


    // Initialisiere die Header-Statistiken
    const initialHeaderStats = dataProcessor.calculateHeaderStats(dataProcessor.filterDataByKollektiv(state.getProcessedData(), state.getCurrentKollektiv()), state.getCurrentKollektiv());
    ui_helpers.updateHeaderStatsUI(initialHeaderStats);
    ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());

    // Rendere den initialen Tab basierend auf dem gespeicherten Zustand
    viewRenderer.renderTab(state.getActiveTabId(), state.getProcessedData(), state.getBruteForceResults());

    // Exponiere Funktionen global für Event-Handler und andere Module, falls nötig
    mainAppInterface.refreshCurrentTab = state.refreshCurrentTab;
    mainAppInterface.setKollektiv = state.setCurrentKollektiv;
    mainAppInterface.renderTab = viewRenderer.renderTab;
    mainAppInterface.getProcessedData = state.getProcessedData;
    mainAppInterface.getRawData = state.getRawData;
    mainAppInterface.getCurrentKollektiv = state.getCurrentKollektiv;
    mainAppInterface.showToast = ui_helpers.showToast;
    mainAppInterface.updateBruteForceUI = auswertungTabLogic.updateBruteForceUI; // Expose for bruteForceManager
    mainAppInterface.showKurzanleitung = ui_helpers.showKurzanleitung;

    // Optional: Show quick guide on first app start
    const isFirstStart = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START);
    if (isFirstStart === null || isFirstStart === undefined || isFirstStart === true) {
        ui_helpers.showKurzanleitung();
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, false);
    }
});
