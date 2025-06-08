// js/ui/view_logic/auswertung_tab.js

class AuswertungViewLogic {
    constructor() {
        this.avocadoCriteriaCheckboxesContainer = document.getElementById('avocado-criteria-checkboxes');
        this.t2CriteriaCheckboxesContainer = document.getElementById('t2-criteria-checkboxes');
        this.applyAvocadoCriteriaButton = document.getElementById('apply-avocado-criteria');
        this.applyT2CriteriaButton = document.getElementById('apply-t2-criteria');
        this.auswertungResultsElement = document.getElementById('auswertung-results');

        // Zustand für die Auswertungstabelle
        this.currentSortState = { key: null, subKey: null, direction: 'asc' };
        this.appliedAvocadoCriteria = []; // Aktuell angewendete Avocado Sign Kriterien
        this.appliedT2Criteria = []; // Aktuell angewendete T2 Kriterien
        this.appliedAvocadoMinCriteriaToMeet = null; // Aktuell angewendeter Schwellenwert für Avocado Sign

        this.addEventListeners();
        this.initializeCriteriaCheckboxes();
    }

    addEventListeners() {
        if (this.applyAvocadoCriteriaButton) {
            this.applyAvocadoCriteriaButton.addEventListener('click', () => this.handleApplyAvocadoCriteria());
        }
        if (this.applyT2CriteriaButton) {
            this.applyT2CriteriaButton.addEventListener('click', () => this.handleApplyT2Criteria());
        }
        if (this.auswertungResultsElement) {
            // Event Delegation für die Sortierung der Auswertungstabelle
            this.auswertungResultsElement.addEventListener('click', (event) => {
                const target = event.target.closest('th[data-sort-key], span.sortable-sub-header');
                if (target) {
                    this.handleTableSort(target);
                }
            });
            // Event Delegation für den Details-Toggle in der Auswertungstabelle
            this.auswertungResultsElement.addEventListener('click', (event) => {
                const target = event.target.closest('.details-toggle-button');
                if (target) {
                    this.toggleDetailsRow(target);
                }
            });
             // Event Listener für den "Alle Details" Toggle-Button
            this.auswertungResultsElement.addEventListener('click', (event) => {
                const toggleAllButton = event.target.closest('#auswertung-toggle-details');
                if (toggleAllButton) {
                    this.toggleAllDetailsRows(toggleAllButton);
                }
            });
        }
    }

    /**
     * Initialisiert die Checkboxen für Avocado Sign und T2 Kriterien basierend auf Konstanten.
     */
    initializeCriteriaCheckboxes() {
        if (this.avocadoCriteriaCheckboxesContainer) {
            this.avocadoCriteriaCheckboxesContainer.innerHTML = ''; // Leere vorherige Inhalte
            Constants.AVOCADO_SIGN_CRITERIA.forEach(criterion => {
                const checkboxHtml = `
                    <div>
                        <input type="checkbox" id="avocado-${criterion.id}" value="${criterion.id}" checked>
                        <label for="avocado-${criterion.id}" data-tippy-content="${criterion.name || ''} (${criterion.param} ${criterion.operator} ${criterion.threshold})">${criterion.name}</label>
                    </div>
                `;
                this.avocadoCriteriaCheckboxesContainer.insertAdjacentHTML('beforeend', checkboxHtml);
            });
        }

        if (this.t2CriteriaCheckboxesContainer) {
            this.t2CriteriaCheckboxesContainer.innerHTML = ''; // Leere vorherige Inhalte
            for (const key in Constants.T2_CRITERIA_DEFINITIONS) {
                const criterionDefinition = Constants.T2_CRITERIA_DEFINITIONS[key];
                const tooltipContent = criterionDefinition.map(c => `${c.name} (${c.param} ${c.operator} ${c.threshold})`).join('; ');
                const checkboxHtml = `
                    <div>
                        <input type="checkbox" id="t2-${key.replace(/\s+/g, '_')}" value="${key}" checked>
                        <label for="t2-${key.replace(/\s+/g, '_')}" data-tippy-content="${key}: ${tooltipContent}">${key}</label>
                    </div>
                `;
                this.t2CriteriaCheckboxesContainer.insertAdjacentHTML('beforeend', checkboxHtml);
            }
        }
        Tooltip.initializeTooltips(); // Initialisiere Tooltips für die neu erstellten Checkboxen
    }

    /**
     * Sammelt die ausgewählten Kriterien-IDs für Avocado Sign aus den Checkboxen.
     * @returns {Array<Object>} Eine Liste der ausgewählten Kriterienobjekte aus Constants.AVOCADO_SIGN_CRITERIA.
     */
    getSelectedAvocadoCriteria() {
        const selectedIds = Array.from(this.avocadoCriteriaCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        return Constants.AVOCADO_SIGN_CRITERIA.filter(crit => selectedIds.includes(crit.id));
    }

    /**
     * Sammelt die ausgewählten T2-Kriterien-Definitionenamen aus den Checkboxen.
     * @returns {Array<string>} Eine Liste der Namen der ausgewählten T2-Kriterien-Definitionen.
     */
    getSelectedT2CriteriaNames() {
        return Array.from(this.t2CriteriaCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
    }

    /**
     * Behandelt das Anwenden der Avocado Sign Kriterien auf die Patientendaten.
     * Aktualisiert die Patientendaten im AppState und die Ansicht.
     */
    handleApplyAvocadoCriteria() {
        const patientData = AppState.patientData;
        if (!patientData || patientData.length === 0) {
            console.warn("Keine Patientendaten zum Anwenden der Avocado Sign Kriterien vorhanden.");
            this.auswertungResultsElement.innerHTML = '<p class="text-danger">Bitte zuerst Patientendaten laden.</p>';
            return;
        }

        const selectedAvocadoCriteria = this.getSelectedAvocadoCriteria();
        if (selectedAvocadoCriteria.length === 0) {
            console.warn("Keine Avocado Sign Kriterien ausgewählt.");
            this.auswertungResultsElement.innerHTML = '<p class="text-warning">Bitte Avocado Sign Kriterien auswählen.</p>';
            return;
        }

        // Feste Annahme: Für die manuelle Anwendung des Avocado Signs ist ein Minimum von 3 Kriterien erforderlich.
        // Dies entspricht der initialen Beschreibung des Avocado Signs.
        const minCriteriaToMeet = 3; 

        // Aktualisiere den internen Zustand der angewendeten Kriterien für die Darstellung
        this.appliedAvocadoCriteria = selectedAvocadoCriteria;
        this.appliedAvocadoMinCriteriaToMeet = minCriteriaToMeet;

        const updatedData = patientData.map(patient => {
            const avocadoSignStatus = StudyCriteriaManagerInstance.calculateAvocadoSign(
                patient,
                selectedAvocadoCriteria,
                minCriteriaToMeet
            );
            return { ...patient, avocado_sign_status: avocadoSignStatus };
        });

        AppState.setPatientData(updatedData);
        this.updateView();
        console.log("Avocado Sign Kriterien angewendet und Daten aktualisiert.");
    }

    /**
     * Behandelt das Anwenden der T2-Kriterien auf die Patientendaten.
     * Aktualisiert die Patientendaten im AppState und die Ansicht.
     */
    handleApplyT2Criteria() {
        const patientData = AppState.patientData;
        if (!patientData || patientData.length === 0) {
            console.warn("Keine Patientendaten zum Anwenden der T2 Kriterien vorhanden.");
            this.auswertungResultsElement.innerHTML = '<p class="text-danger">Bitte zuerst Patientendaten laden.</p>';
            return;
        }

        const selectedT2CriteriaNames = this.getSelectedT2CriteriaNames();
        if (selectedT2CriteriaNames.length === 0) {
            console.warn("Keine T2 Kriterien ausgewählt.");
            this.auswertungResultsElement.innerHTML = '<p class="text-warning">Bitte T2 Kriterien auswählen.</p>';
            return;
        }

        // Aktualisiere den internen Zustand der angewendeten Kriterien für die Darstellung
        this.appliedT2Criteria = selectedT2CriteriaNames.map(name => Constants.T2_CRITERIA_DEFINITIONS[name]).flat(); // Flache Liste aller einzelnen Kriterien aus den ausgewählten Sets

        const updatedData = patientData.map(patient => {
            // Ein Patient ist T2-positiv, wenn er FÜR MINDESTENS EINE der ausgewählten T2-Kriterien-Definitionen positiv ist.
            // Dies ist eine "ODER"-Verknüpfung der ausgewählten Publikations-Kriterien.
            let t2CriteriaStatus = false;
            for (const name of selectedT2CriteriaNames) {
                const criterionDefinition = Constants.T2_CRITERIA_DEFINITIONS[name];
                if (T2CriteriaManagerInstance.calculateT2Criteria(patient, criterionDefinition)) {
                    t2CriteriaStatus = true;
                    break; // Sobald eine Definition zutrifft, ist der Patient T2-positiv
                }
            }
            return { ...patient, t2_criteria_status: t2CriteriaStatus };
        });

        AppState.setPatientData(updatedData);
        this.updateView();
        console.log("T2 Kriterien angewendet und Daten aktualisiert.");
    }

    /**
     * Erstellt den HTML-Code für die Auswertungstabelle.
     * @param {Array<Object>} data - Die Patientendaten.
     * @param {Object} sortState - Das aktuelle Sortierzustandsobjekt ({ key, subKey, direction }).
     * @returns {string} Der generierte HTML-Code für die Tabelle.
     */
    createAuswertungTableHTML(data, sortState) {
        if (!Array.isArray(data)) {
            console.error("createAuswertungTableHTML: Ungültige Daten für Auswertungstabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';
        }

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TextConfig.TOOLTIP_CONTENT.auswertungTable.nr || 'Fortlaufende Nummer des Patienten.', textAlign: 'center' },
            { key: 'name', label: 'Name', tooltip: TextConfig.TOOLTIP_CONTENT.auswertungTable.name || 'Nachname des Patienten (anonymisiert/kodiert).' },
            { key: 'therapie', label: 'Therapie', tooltip: TextConfig.TOOLTIP_CONTENT.auswertungTable.therapie || 'Angewandte Therapie vor der Operation.' },
            // Status-Spalte mit Sub-Sortierung für N, AS, T2
            { key: 'status', label: 'N/AS/T2', tooltip: TextConfig.TOOLTIP_CONTENT.auswertungTable.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.', subKeys: [{key: 'n_status', label: 'N'}, {key: 'avocado_sign_status', label: 'AS'}, {key: 't2_criteria_status', label: 'T2'}]},
            { key: 'patho_n_count', label: 'Patho. N+', tooltip: TextConfig.TOOLTIP_CONTENT.auswertungTable.patho_n_count || 'Anzahl der pathologisch positiven Lymphknoten.' , textAlign: 'center'},
            { key: 'total_ln_count', label: 'Gesamt LN', tooltip: TextConfig.TOOLTIP_CONTENT.auswertungTable.total_ln_count || 'Gesamtzahl der exzidierten Lymphknoten.' , textAlign: 'center'},
            // Details-Spalte zum Ein-/Ausklappen
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += this._createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach((patient, index) => {
                tableHTML += this._createAuswertungTableRow(patient, index);
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

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sk.label || sk.key.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltipContent}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" data-main-key="${col.key}" style="cursor: pointer; ${style}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';
            
            const mainTooltip = col.subKeys ? `${baseTooltipContent} Klicken Sie auf N, AS oder T2 für Sub-Sortierung.` : (col.key === 'details' ? (TextConfig.TOOLTIP_CONTENT.auswertungTable.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
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
     * Erstellt eine einzelne Zeile für die Auswertungstabelle.
     * @param {Object} patient - Das Patientendatenobjekt.
     * @param {number} index - Der Index des Patienten in der Liste.
     * @returns {string} Der HTML-Code für eine Tabellenzeile.
     */
    _createAuswertungTableRow(patient, index) {
        const rowId = `auswertung-patient-row-${index}`;
        const detailRowId = `auswertung-patient-details-row-${index}`;
        const nStatusDisplay = patient.n_status ? `<span class="${patient.n_status === true ? 'badge bg-success' : 'badge bg-danger'}">${patient.n_status === true ? 'Pos.' : 'Neg.'}</span>` : '<span class="text-muted">N/A</span>';
        const avocadoSignStatusDisplay = patient.avocado_sign_status ? `<span class="${patient.avocado_sign_status === true ? 'badge bg-success' : 'badge bg-danger'}">${patient.avocado_sign_status === true ? 'Pos.' : 'Neg.'}</span>` : '<span class="text-muted">N/A</span>';
        const t2CriteriaStatusDisplay = patient.t2_criteria_status ? `<span class="${patient.t2_criteria_status === true ? 'badge bg-success' : 'badge bg-danger'}">${patient.t2_criteria_status === true ? 'Pos.' : 'Neg.'}</span>` : '<span class="text-muted">N/A</span>';

        let rowHTML = `<tr data-patient-id="${patient.id || index}" id="${rowId}">
            <td class="text-center">${patient.nr || (index + 1)}</td>
            <td>${patient.name || ''}</td>
            <td>${patient.therapie || ''}</td>
            <td>
                ${nStatusDisplay} ${avocadoSignStatusDisplay} ${t2CriteriaStatusDisplay}
            </td>
            <td class="text-center">${patient.patho_n_count !== undefined ? patient.patho_n_count : 'N/A'}</td>
            <td class="text-center">${patient.total_ln_count !== undefined ? patient.total_ln_count : 'N/A'}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-info details-toggle-button" data-bs-toggle="collapse" data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </td>
        </tr>`;

        // Detaillierte Zeile für die Auswertungstabelle, die individuelle Lymphknoten-Kriterien bewerten könnte
        // Diese Zeile sollte die spezifische Logik für die Anzeige der relevanten Kriterien basierend auf
        // den angewendeten Kriterien (this.appliedAvocadoCriteria, this.appliedT2Criteria) enthalten.
        // Aktuell werden hier nur die allgemeinen Patientendetails angezeigt, ähnlich wie im Daten-Tab.
        // In Phase 4 kann hier eine detailliertere Aufschlüsselung der einzelnen LK-Kriterienbewertungen erfolgen.
        rowHTML += `<tr id="${detailRowId}" class="collapse">
            <td colspan="7">
                <div class="p-2">
                    <h6>Detaillierte Patienteninformationen für ${patient.name || ''}:</h6>
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
     * Behandelt die Sortierung der Auswertungstabelle.
     * Aktualisiert den internen Sortierzustand und rendert die Tabelle neu.
     * @param {HTMLElement} target - Das TH-Element oder SPAN-Element, das geklickt wurde.
     */
    handleTableSort(target) {
        const mainKey = target.dataset.sortKey || target.dataset.mainKey;
        const subKey = target.dataset.subKey;

        if (!mainKey) {
            return;
        }

        let newDirection = 'asc';
        let newSubKey = subKey;

        if (this.currentSortState.key === mainKey && this.currentSortState.subKey === newSubKey) {
            newDirection = this.currentSortState.direction === 'asc' ? 'desc' : 'asc';
        }

        this.currentSortState = { key: mainKey, subKey: newSubKey, direction: newDirection };
        this.updateView();
    }

    /**
     * Schaltet die Anzeige der Detailzeile für einen Patienten in der Auswertungstabelle um.
     * @param {HTMLElement} toggleButton - Der geklickte Toggle-Button.
     */
    toggleDetailsRow(toggleButton) {
        const icon = toggleButton.querySelector('i');
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
     * Schaltet alle Details-Zeilen in der Auswertungstabelle ein oder aus.
     * @param {HTMLElement} toggleAllButton - Der "Alle Details" Toggle-Button.
     */
    toggleAllDetailsRows(toggleAllButton) {
        const isExpanding = toggleAllButton.dataset.action === 'expand';
        const detailRows = this.auswertungResultsElement.querySelectorAll('tr.collapse');
        const toggleButtons = this.auswertungResultsElement.querySelectorAll('.details-toggle-button');
        const icon = toggleAllButton.querySelector('i');

        detailRows.forEach(row => {
            const bsCollapse = new bootstrap.Collapse(row, { toggle: false });
            if (isExpanding) {
                bsCollapse.show();
            } else {
                bsCollapse.hide();
            }
        });

        toggleButtons.forEach(button => {
            const buttonIcon = button.querySelector('i');
            if (buttonIcon) {
                if (isExpanding) {
                    buttonIcon.classList.remove('fa-chevron-down');
                    buttonIcon.classList.add('fa-chevron-up');
                } else {
                    buttonIcon.classList.remove('fa-chevron-up');
                    buttonIcon.classList.add('fa-chevron-down');
                }
            }
        });

        // Aktualisiere den Zustand und den Text des Haupt-Toggle-Buttons
        if (isExpanding) {
            toggleAllButton.dataset.action = 'collapse';
            toggleAllButton.innerHTML = `Alle Details <i class="fas fa-chevron-up ms-1"></i>`;
        } else {
            toggleAllButton.dataset.action = 'expand';
            toggleAllButton.innerHTML = `Alle Details <i class="fas fa-chevron-down ms-1"></i>`;
        }
    }

    /**
     * Sortiert die Daten basierend auf dem aktuellen Sortierzustand.
     * Diese Funktion ist eine Duplikation aus DataViewLogic für Konsistenz,
     * da Auswertungstabelle auch Sortierung benötigt.
     * @param {Array<Object>} data - Die unsortierten Patientendaten.
     * @param {Object} sortState - Das aktuelle Sortierzustandsobjekt.
     * @returns {Array<Object>} Die sortierten Daten.
     */
    _sortData(data, sortState) {
        if (!sortState || !sortState.key) {
            return [...data];
        }

        const { key, subKey, direction } = sortState;
        const multiplier = direction === 'asc' ? 1 : -1;

        return [...data].sort((a, b) => {
            let valA, valB;

            if (subKey) {
                valA = a[subKey] === true ? 1 : (a[subKey] === false ? 0 : -1);
                valB = b[subKey] === true ? 1 : (b[subKey] === false ? 0 : -1);
            } else {
                valA = a[key];
                valB = b[key];
            }

            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            if (typeof valA === 'string' && typeof valB === 'string') {
                return multiplier * valA.localeCompare(valB);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return multiplier * (valA - valB);
            }
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
     * Aktualisiert die Ansicht des Auswertung-Tabs basierend auf dem aktuellen App-Zustand.
     * Rendert die Patiententabelle und die Zusammenfassung der Auswertungsergebnisse neu.
     */
    updateView() {
        const currentData = AppState.patientData;
        const sortedData = this._sortData(currentData, this.currentSortState);

        // Erstelle eine Zusammenfassung der angewendeten Kriterien
        let appliedCriteriaSummary = '';
        if (this.appliedAvocadoCriteria.length > 0) {
            appliedCriteriaSummary += `<p><strong>Angewendetes Avocado Sign:</strong> ${this.appliedAvocadoCriteria.map(c => c.name).join(', ')} (min. ${this.appliedAvocadoMinCriteriaToMeet} Kriterien)</p>`;
        }
        if (this.appliedT2Criteria.length > 0) {
            // Hier sollte man die Namen der T2-Kriterien-Definitionen anzeigen, nicht die flachen Kriterienobjekte
            const uniqueT2Names = new Set(this.appliedT2Criteria.map(crit => {
                for (const key in Constants.T2_CRITERIA_DEFINITIONS) {
                    if (Constants.T2_CRITERIA_DEFINITIONS[key].some(def => def.id === crit.id)) {
                        return key;
                    }
                }
                return null;
            }).filter(Boolean));
            appliedCriteriaSummary += `<p><strong>Angewendete T2-Kriterien:</strong> ${Array.from(uniqueT2Names).join(', ')}</p>`;
        }
        
        // Füge die Kriterienauswahl in eine Card ein
        const criteriaSelectionCard = `
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">Angewendete Kriterien</div>
                    <div class="card-body">
                        ${appliedCriteriaSummary || '<p class="text-muted">Noch keine Kriterien angewendet.</p>'}
                    </div>
                </div>
            </div>
        `;

        // Rendere die Auswertungstabelle in einem Card-Format
        const tableCardHTML = this.createAuswertungTableCardHTML(sortedData, this.currentSortState);

        this.auswertungResultsElement.innerHTML = criteriaSelectionCard + tableCardHTML;

        // Nach dem Rendern Tooltips initialisieren und Bootstrap Collapses neu aktivieren
        Tooltip.initializeTooltips();
        // Bootstrap Collapses werden automatisch initialisiert, wenn data-bs-toggle="collapse" vorhanden ist.
        // Event listener für Collapse-Events können hier hinzugefügt werden, wenn spezifisches Verhalten gewünscht ist.
    }

    /**
     * Erstellt den HTML-Code für eine Auswertungstabelle in einem Card-Container.
     * @param {Array<Object>} data - Die Patientendaten.
     * @param {Object} sortState - Das aktuelle Sortierzustandsobjekt.
     * @returns {string} Der generierte HTML-Code für die Card mit Tabelle.
     */
    createAuswertungTableCardHTML(data, sortState) {
        const tableHTML = this.createAuswertungTableHTML(data, sortState);
        const toggleButtonTooltip = TextConfig.TOOLTIP_CONTENT.auswertungTable.expandAll || 'Alle Detailansichten (Bewertung einzelner Lymphknoten oder spezifischer Kriterien) für Patienten in dieser Tabelle ein- oder ausblenden.';
        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Patientenübersicht & Auswertungsergebnisse</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${toggleButtonTooltip}">
                           Alle Details <i class="fas fa-chevron-down ms-1"></i>
                       </button>
                    </div>
                    <div class="card-body p-0">
                        <div id="auswertung-table-container" class="table-responsive">
                           ${tableHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen.
const AuswertungViewLogicInstance = new AuswertungViewLogic();
