import { getElement, clearContainer, createElement } from '../../utils/dom_helpers.js';
import { createPatientDataTable } from '../components/tables.js';
import { exportTableAsCSV } from '../../services/export_service.js';

const TABLE_CONTAINER_ID = 'patient-data-table-wrapper';

function createExportButton() {
    const buttonWrapper = createElement('div', { classes: ['export-button-wrapper'] });
    const button = createElement('button', {
        id: 'export-csv-btn',
        classes: ['btn'],
    });
    button.innerHTML = `<i class="fas fa-file-csv"></i> Rohdaten als CSV exportieren`;
    
    button.addEventListener('click', () => {
        const tableElement = getElement(`#${TABLE_CONTAINER_ID} .table-container`);
        if (tableElement) {
            exportTableAsCSV(tableElement.id, 'patienten_rohdaten');
        } else {
            console.error("Could not find table container for CSV export.");
        }
    });
    
    buttonWrapper.appendChild(button);
    return buttonWrapper;
}

export function renderDataTab(processedData) {
    const container = getElement('#data-table-container');
    clearContainer(container);

    if (processedData && processedData.length > 0) {
        const exportButton = createExportButton();
        const patientTable = createPatientDataTable(processedData);
        
        // Assign a unique ID to the table's direct container for the export service
        const tableWrapper = patientTable;
        tableWrapper.id = `table-for-export-${Date.now()}`;

        container.appendChild(exportButton);
        container.appendChild(patientTable);
    } else {
        container.textContent = 'Keine Patientendaten zum Anzeigen vorhanden.';
    }
}
