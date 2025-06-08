// js/ui/view_logic/data_tab.js

class DataViewLogic {
    constructor() {
        this.dataDisplayElement = document.getElementById('data-display');
        this.dataSummaryElement = document.getElementById('data-summary');
        this.patientDataInput = document.getElementById('patient-data-input');
        this.loadDataButton = document.getElementById('load-data-button');
        this.resetDataButton = document.getElementById('reset-data-button');

        this.addEventListeners();
    }

    addEventListeners() {
        if (this.loadDataButton) {
            this.loadDataButton.addEventListener('click', () => this.handleLoadData());
        }
        if (this.resetDataButton) {
            this.resetDataButton.addEventListener('click', () => this.handleResetData());
        }
        // Event Listener für die Sortierung der Tabelle werden dynamisch hinzugefügt
        // und müssen nach dem Rendern der Tabelle initialisiert werden.
        // Daher wird ein Delegationsmuster verwendet oder ein Aufruf nach dem Rendern.
        if (this.dataDisplayElement) {
            this.dataDisplayElement.addEventListener('click', (event) => {
                const target = event.target.closest('th[data-sort-key], span.sortable-sub-header');
                if (target) {
                    this.handleTableSort(target);
                }
            });
            this.dataDisplayElement.addEventListener('click', (event) => {
                const target = event.target.closest('.details-toggle-button');
                if (target) {
                    this.toggleDetailsRow(target);
                }
            });
        }
    }

    /**
     * Behandelt das Laden der Patientendaten aus dem Textfeld.
     * Validiert die Daten und aktualisiert den App-Zustand.
     */
    handleLoadData() {
        const input = this.patientDataInput ? this.patientDataInput.value : '';
        if (!input) {
            console.warn("Eingabefeld für Patientendaten ist leer.");
            // Hier könnte eine Benutzermeldung angezeigt werden
            return;
        }

        try {
            const parsedData = JSON.parse(input);
            if (!Array.isArray(parsedData) || parsedData.some(p => typeof p !== 'object' || p === null)) {
                throw new Error("Eingegebene Daten sind kein gültiges JSON-Array von Objekten.");
            }
            
            // Setze die Patientendaten im AppState und aktualisiere die Ansicht
            AppState.setPatientData(parsedData);
            this.updateView();
            console.log("Patientendaten erfolgreich geladen.", AppState.patientData);
            // Optional: Leere das Eingabefeld nach erfolgreichem Laden
            // this.patientDataInput.value = '';

        } catch (error) {
            console.error("Fehler beim Laden der Patientendaten:", error.message);
            // Hier könnte eine detailliertere Fehlermeldung für den Benutzer angezeigt werden
        }
    }

    /**
     * Setzt die geladenen Patientendaten zurück.
     */
    handleResetData() {
        AppState.setPatientData([]);
        this.updateView();
        console.log("Patientendaten zurückgesetzt.");
    }

    /**
     * Erstellt den HTML-Code für die Patiententabelle.
     * @param {Array<Object>} data - Die Patientendaten.
     * @param {Object} sortState - Das aktuelle Sortierzustandsobjekt ({ key, subKey, direction }).
     * @returns {string} Der generierte HTML-Code für die Tabelle.
     */
    createDatenTableHTML(data, sortState) {
        if (!Array.isArray(data)) {
            console.error("createDatenTableHTML: Ungültige Daten für Tabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Daten für Tabelle.</p>';
        }

        const tableId = 'daten-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.nr || 'Fortlaufende Nummer des Patienten.', textAlign: 'center' },
            { key: 'name', label: 'Name', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.name || 'Nachname des Patienten (anonymisiert/kodiert).' },
            { key: 'vorname', label: 'Vorname', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.vorname || 'Vorname des Patienten (anonymisiert/kodiert).' },
            { key: 'geschlecht', label: 'Geschl.', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.geschlecht || 'Geschlecht des Patienten (m/w/unbekannt).', textAlign: 'center' },
            { key: 'alter', label: 'Alter', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.alter || 'Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.', textAlign: 'center' },
            { key: 'therapie', label: 'Therapie', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.therapie || 'Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).' },
            { key: 'status', label: 'N/AS/T2', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.', subKeys: [{key: 'n_status', label: 'N'}, {key: 'avocado_sign_status', label: 'AS'}, {key: 't2_criteria_status', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: TextConfig.TOOLTIP_CONTENT.datenTable.bemerkung || 'Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.' },
            { key: 'details', label: '', width: '30px'} // Leerer Header für Details-Toggle
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += this._createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach((patient, index) => {
                // Die `patient` Daten werden hier direkt für die Zeile verwendet.
                // Es ist wichtig, dass die `patient_data.js` die richtigen keys hat.
                tableHTML += this._createDatenTableRow(patient, index);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    /**
     * Erstellt den HTML-Code für den Tabellenkopf.
     * @param {string} tableId - Die ID der Tabelle.
     * @param {Object} sortState - Das aktuelle Sortierzustandsobjekt.
     * @param {Array<Object>} columns - Die Spaltendefinitionen.
     * @returns {string} Der generierte HTML-Code für den Tabellenkopf.
     */
    _createTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let mainHeaderClass = '';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
            if (col.textAlign) mainHeaderClass += ` text-${col.textAlign}`;

            let isMainKeyActiveSort = false;
            let activeSubKey = null;

            // Überprüfen, ob die aktuelle Spalte die aktive Sortierspalte ist
            if (sortState && sortState.key === col.key) {
                if (col.subKeys && col.subKeys.some(sk => sk.key === sortState.subKey)) {
                    isMainKeyActiveSort = true;
                    activeSubKey = sortState.subKey;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subKeys && (sortState.subKey === null || sortState.subKey === undefined)) {
                    isMainKeyActiveSort = true;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                    thStyle += (thStyle ? ' ' : 'style="') + 'color: var(--primary-color);"';
                    if(!thStyle.endsWith('"')) thStyle += '"';
                }
            }
            
            const baseTooltipContent = col.tooltip || col.label;

            // Generiere Sub-Header für Spalten mit subKeys (z.B. Status-Spalte)
            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sk.label || sk.key.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltipContent}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" data-main-key="${col.key}" style="cursor: pointer; ${style}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';
            
            const mainTooltip = col.subKeys ? `${baseTooltipContent} Klicken Sie auf N, AS oder T2 für Sub-Sortierung.` : (col.key === 'details' ? (TextConfig.TOOLTIP_CONTENT.datenTable.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            const thClass = mainHeaderClass;

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${isMainKeyActiveSort && !activeSubKey ? sortIconHTML : '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    /**
     * Erstellt eine einzelne Zeile für die Patientendaten-Tabelle.
     * @param {Object} patient - Das Patientendatenobjekt.
     * @param {number} index - Der Index des Patienten in der Liste.
     * @returns {string} Der HTML-Code für eine Tabellenzeile.
     */
    _createDatenTableRow(patient, index) {
        const rowId = `patient-row-${index}`;
        const detailRowId = `patient-details-row-${index}`;
        const nStatusDisplay = patient.n_status ? `<span class="${patient.n_status === true ? 'badge bg-success' : 'badge bg-danger'}">${patient.n_status === true ? 'Pos.' : 'Neg.'}</span>` : '<span class="text-muted">N/A</span>';
        const avocadoSignStatusDisplay = patient.avocado_sign_status ? `<span class="${patient.avocado_sign_status === true ? 'badge bg-success' : 'badge bg-danger'}">${patient.avocado_sign_status === true ? 'Pos.' : 'Neg.'}</span>` : '<span class="text-muted">N/A</span>';
        const t2CriteriaStatusDisplay = patient.t2_criteria_status ? `<span class="${patient.t2_criteria_status === true ? 'badge bg-success' : 'badge bg-danger'}">${patient.t2_criteria_status === true ? 'Pos.' : 'Neg.'}</span>` : '<span class="text-muted">N/A</span>';


        let rowHTML = `<tr data-patient-id="${patient.id || index}" id="${rowId}">
            <td class="text-center">${patient.nr || (index + 1)}</td>
            <td>${patient.name || ''}</td>
            <td>${patient.vorname || ''}</td>
            <td class="text-center">${patient.geschlecht || ''}</td>
            <td class="text-center">${patient.alter !== undefined ? patient.alter : ''}</td>
            <td>${patient.therapie || ''}</td>
            <td>
                ${nStatusDisplay} ${avocadoSignStatusDisplay} ${t2CriteriaStatusDisplay}
            </td>
            <td>${patient.bemerkung || ''}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-info details-toggle-button" data-bs-toggle="collapse" data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </td>
        </tr>`;

        // Detaillierte Zeile, die beim Klicken auf den Toggle-Button angezeigt wird
        rowHTML += `<tr id="${detailRowId}" class="collapse">
            <td colspan="9">
                <div class="p-2">
                    <h6>Detaillierte Patienteninformationen für ${patient.name || ''} ${patient.vorname || ''}:</h6>
                    <ul class="list-unstyled small">
                        <li><strong>Durchmesser LN max:</strong> ${patient.diameter_ln_max !== undefined ? patient.diameter_ln_max + 'mm' : 'N/A'}</li>
                        <li><strong>Durchmesser LN kurzachse:</strong> ${patient.diameter_ln_short_axis !== undefined ? patient.diameter_ln_short_axis + 'mm' : 'N/A'}</li>
                        <li><strong>Durchmesser LN langachse:</strong> ${patient.diameter_ln_long_axis !== undefined ? patient.diameter_ln_long_axis + 'mm' : 'N/A'}</li>
                        <li><strong>Morphologie rundlich:</strong> ${patient.morphology_round !== undefined ? (patient.morphology_round ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Signal heterogen:</strong> ${patient.signal_heterogeneous !== undefined ? (patient.signal_heterogeneous ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Ödem peritumoral:</strong> ${patient.edema_peritumoral !== undefined ? (patient.edema_peritumoral ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Signal niedrig:</strong> ${patient.signal_low !== undefined ? (patient.signal_low ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Inhomogenes KM-Enhancement:</strong> ${patient.inhomogeneous_contrast !== undefined ? (patient.inhomogeneous_contrast ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Nekrose:</strong> ${patient.necrosis !== undefined ? (patient.necrosis ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Kapselüberschreitung:</strong> ${patient.capsular_invasion !== undefined ? (patient.capsular_invasion ? 'Ja' : 'Nein') : 'N/A'}</li>
                        <li><strong>Pathologischer N-Status:</strong> ${patient.n_status !== undefined ? (patient.n_status ? 'Positiv' : 'Negativ') : 'N/A'}</li>
                        <li><strong>Avocado Sign Status:</strong> ${patient.avocado_sign_status !== undefined ? (patient.avocado_sign_status ? 'Positiv' : 'Negativ') : 'N/A'}</li>
                        <li><strong>T2-Kriterien Status:</strong> ${patient.t2_criteria_status !== undefined ? (patient.t2_criteria_status ? 'Positiv' : 'Negativ') : 'N/A'}</li>
                        ${patient.additional_details ? `<li><strong>Zusätzliche Details:</strong> ${patient.additional_details}</li>` : ''}
                    </ul>
                </div>
            </td>
        </tr>`;
        return rowHTML;
    }

    /**
     * Behandelt die Sortierung der Patiententabelle.
     * Aktualisiert den App-Zustand und rendert die Tabelle neu.
     * @param {HTMLElement} target - Das TH-Element oder SPAN-Element, das geklickt wurde.
     */
    handleTableSort(target) {
        const mainKey = target.dataset.sortKey || target.dataset.mainKey;
        const subKey = target.dataset.subKey; // Nur relevant für Sub-Header (Status-Spalte)

        if (!mainKey) {
            return;
        }

        let currentSortState = AppState.getSortState();
        let newDirection = 'asc';
        let newSubKey = subKey;

        if (currentSortState.key === mainKey && currentSortState.subKey === newSubKey) {
            newDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
        }

        AppState.setSortState(mainKey, newDirection, newSubKey);
        this.updateView(); // Tabelle mit neuem Sortierstatus neu rendern
    }

    /**
     * Schaltet die Anzeige der Detailzeile für einen Patienten um.
     * @param {HTMLElement} toggleButton - Der geklickte Toggle-Button.
     */
    toggleDetailsRow(toggleButton) {
        const icon = toggleButton.querySelector('i');
        // Bootstrap's collapse-Klasse handhabt die Anzeige/Verbergung der Zeile.
        // Wir müssen nur das Icon umschalten.
        if (icon) {
            if (icon.classList.contains('fa-chevron-down')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        }
    }

    /**
     * Sortiert die Daten basierend auf dem aktuellen Sortierzustand.
     * @param {Array<Object>} data - Die unsortierten Patientendaten.
     * @param {Object} sortState - Das aktuelle Sortierzustandsobjekt.
     * @returns {Array<Object>} Die sortierten Daten.
     */
    _sortData(data, sortState) {
        if (!sortState || !sortState.key) {
            return [...data]; // Keine Sortierung, gib eine Kopie zurück
        }

        const { key, subKey, direction } = sortState;
        const multiplier = direction === 'asc' ? 1 : -1;

        return [...data].sort((a, b) => {
            let valA, valB;

            if (subKey) {
                // Bei Sub-Sortierung (z.B. N, AS, T2 Status)
                valA = a[subKey] === true ? 1 : (a[subKey] === false ? 0 : -1); // true=1, false=0, undefined/null=-1
                valB = b[subKey] === true ? 1 : (b[subKey] === false ? 0 : -1);
            } else {
                // Normale Sortierung nach Hauptschlüssel
                valA = a[key];
                valB = b[key];
            }

            // Handles undefined/null values for robust sorting
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';


            if (typeof valA === 'string' && typeof valB === 'string') {
                return multiplier * valA.localeCompare(valB);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return multiplier * (valA - valB);
            }
            // Für Booleans und andere Typen, einfach vergleichen
            if (valA < valB) {
                return -1 * multiplier;
            }
            if (valA > valB) {
                return 1 * multiplier;
            }
            return 0;
        });
    }


    /**
     * Aktualisiert die Ansicht des Daten-Tabs basierend auf dem aktuellen App-Zustand.
     * Rendert die Patiententabelle und die Zusammenfassung neu.
     */
    updateView() {
        const currentData = AppState.patientData;
        const currentSortState = AppState.getSortState();

        // Daten sortieren
        const sortedData = this._sortData(currentData, currentSortState);

        // Tabelle rendern
        if (this.dataDisplayElement) {
            this.dataDisplayElement.innerHTML = this.createDatenTableHTML(sortedData, currentSortState);
        }

        // Zusammenfassung aktualisieren (Grundlegende Zählung)
        if (this.dataSummaryElement) {
            const numPatients = currentData.length;
            const numPositiveN = currentData.filter(p => p.n_status === true).length;
            const numPositiveAvocado = currentData.filter(p => p.avocado_sign_status === true).length;
            const numPositiveT2 = currentData.filter(p => p.t2_criteria_status === true).length;

            this.dataSummaryElement.innerHTML = `
                <p><strong>Gesamtzahl Patienten:</strong> ${numPatients}</p>
                <p><strong>Anzahl N-positiv (Pathologie):</strong> ${numPositiveN}</p>
                <p><strong>Anzahl Avocado Sign positiv:</strong> ${numPositiveAvocado}</p>
                <p><strong>Anzahl T2-Kriterien positiv:</strong> ${numPositiveT2}</p>
            `;
        }
        // Initialisiere Tooltips neu, da der Inhalt dynamisch neu geladen wird
        Tooltip.initializeTooltips();
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen.
// Stellen Sie sicher, dass dies nach dem DOMContentLoaded Event oder am Ende des Bodys geschieht.
const DataViewLogicInstance = new DataViewLogic();
