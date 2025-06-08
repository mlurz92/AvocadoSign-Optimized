// js/app.js

// AppState is a global object for managing application state.
// It should be initialized before App is run.
// DataManager is a global object for handling data operations.
// UIManager is a global object for handling UI interactions and tab switching.
// All ViewLogic instances (DataViewLogicInstance, AuswertungViewLogicInstance, etc.)
// are also expected to be globally available after their respective script loads.

class App {
    constructor() {
        this.initializeApplication();
    }

    /**
     * Initializes the entire application.
     * Sets up initial state, loads sample data, and initializes UI manager.
     */
    initializeApplication() {
        // Ensure all necessary global objects are initialized and available.
        // This relies on the correct script loading order in index.html.

        if (typeof AppState === 'undefined') {
            console.error("AppState is not defined. Critical dependency missing.");
            return;
        }
        if (typeof DataManager === 'undefined') {
            console.error("DataManager is not defined. Critical dependency missing.");
            return;
        }
        if (typeof UIManager === 'undefined') {
            console.error("UIManager is not defined. Critical dependency missing.");
            return;
        }

        // Set up initial patient data
        // This assumes patientData is loaded globally from data/patient_data.js
        // and is then processed by DataManager.
        if (typeof patientData !== 'undefined' && Array.isArray(patientData) && patientData.length > 0) {
            // DataManager should be responsible for processing and validating initial data
            // and then setting it to AppState.
            DataManager.setInitialPatientData(patientData);
            console.log("Initial patient data loaded and processed.");
        } else {
            console.warn("No initial patient data found or data is empty/invalid. Application will start with empty data.");
            AppState.setPatientData([]); // Initialize with empty array if no data
        }

        // Initialize UIManager. It will handle tab switching and loading specific tab logic.
        UIManager.initialize();

        // Load the default tab view
        UIManager.loadTab('data'); // Start with the Data tab
        console.log("Application initialized successfully.");
    }
}

// Ensure the application initializes once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Check for essential third-party libraries.
    // Chart.js is used by Statistik and Praesentation tabs.
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded. Ensure CDN link is correct in index.html.");
        // Potentially disable chart-dependent functionality or show a warning.
    }
    // tippy.js for tooltips
    if (typeof tippy === 'undefined') {
        console.warn("Tippy.js is not loaded. Tooltips will not function.");
    }
    // Bootstrap for collapse functionality
    if (typeof bootstrap === 'undefined') {
        console.warn("Bootstrap is not loaded. UI components like collapse will not function correctly.");
    }

    // Instantiate the main application.
    // This will trigger the initialization process.
    const app = new App();
});
