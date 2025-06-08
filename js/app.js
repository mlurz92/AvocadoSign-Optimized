import { patientData } from '../data/patient_data.js';
import { processInitialData } from './core/data_processor.js';
import { stateManager } from './core/state_manager.js';
import { initializeUI } from './ui/main_controller.js';

class App {
    constructor() {
        this.initialize();
    }

    initialize() {
        try {
            const processedData = processInitialData(patientData);

            stateManager.setState({
                patientData: patientData,
                processedData: processedData,
                activeTab: 'data'
            });

            initializeUI();
            
        } catch (error) {
            console.error("Fehler bei der Initialisierung der Anwendung:", error);
            document.body.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Ein kritischer Fehler ist bei der Initialisierung der Anwendung aufgetreten. Bitte überprüfen Sie die Konsole für weitere Details.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
