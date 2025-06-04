const dataTabLogic = (() => {

    let dataView = [];
    let currentSortState = cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;

    function createDatenTableHTML(data, sortState) {
        if (!Array.isArray(data)) {
            console.error("createDatenTableHTML: Ungültige Daten für Tabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Daten für Tabelle.</p>';
        }

        const tableId = 'daten-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.datenTable.nr || 'Fortlaufende Nummer des Patienten.' },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.datenTable.name || 'Nachname des Patienten (anonymisiert/kodiert).' },
            { key: 'vorname', label: 'Vorname', tooltip: TOOLTIP_CONTENT.datenTable.vorname || 'Vorname des Patienten (anonymisiert/kodiert).' },
            { key: 'geschlecht', label: 'Geschl.', tooltip: TOOLTIP_CONTENT.datenTable.geschlecht || 'Geschlecht des Patienten (m/w/unbekannt).' },
            { key: 'alter', label: 'Alter', tooltip: TOOLTIP_CONTENT.datenTable.alter || 'Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.' },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.datenTable.therapie || 'Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).' },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: TOOLTIP_CONTENT.datenTable.bemerkung || 'Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.' },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += _createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createDatenTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function _createTableHeaderHTML(tableId, sortState, columns) {
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
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';
            
            const mainTooltip = col.subKeys ? `${baseTooltipContent} Klicken Sie auf N, AS oder T2 für Sub-Sortierung.` : (col.key === 'details' ? (TOOLTIP_CONTENT.datenTable.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
            const sortAttributes = `data-sort-key="${col.key}" ${col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            const thClass = mainHeaderClass;
            const tooltipAttributes = `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${mainTooltip}"`;

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltipAttributes} ${thStyle}>${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${isMainKeyActiveSort && !activeSubKey ? sortIconHTML : '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltipAttributes} ${thStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function initialize(data, initialKollektiv) {
        if (!Array.isArray(data)) {
            console.error("DataTabLogic: Ungültige Daten für Initialisierung empfangen.");
            dataView = [];
        } else {
            dataView = data;
        }
        currentKollektiv = initialKollektiv;
        currentSortState = stateManager.getDatenTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
    }

    function updateData(newData) {
        if (!Array.isArray(newData)) {
            console.error("DataTabLogic: Ungültige Daten für Update empfangen.");
            return;
        }
        dataView = newData;
        currentKollektiv = stateManager.getCurrentKollektiv();
    }

    function getFilteredData(kollektivId) {
        if (!dataView || dataView.length === 0) return [];
        if (kollektivId === 'Gesamt') {
            return dataView;
        }
        return dataView.filter(p => p.therapie === kollektivId);
    }

    function renderTableBody(data, sortState) {
        const tableBodyElement = document.getElementById('daten-table-body');
        if (!tableBodyElement) {
            console.error("DataTabLogic: Tabellenkörper 'daten-table-body' nicht gefunden.");
            return;
        }
        let bodyHTML = '';
        if (data.length === 0) {
            const numColumns = document.getElementById('daten-table')?.querySelector('thead tr')?.children.length || 9; // Fallback to 9 columns
            bodyHTML = `<tr><td colspan="${numColumns}" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                bodyHTML += tableRenderer.createDatenTableRow(patient);
            });
        }
        tableBodyElement.innerHTML = bodyHTML;
        ui_helpers.attachRowCollapseListeners(tableBodyElement);
        ui_helpers.initializeTooltips(tableBodyElement);
    }


    function handleSortChange(newSortKey, newSubKey = null) {
        if (currentSortState.key === newSortKey && currentSortState.subKey === newSubKey) {
            currentSortState.direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortState.key = newSortKey;
            currentSortState.subKey = newSubKey;
            currentSortState.direction = 'asc';
        }
        stateManager.setDatenTableSort(cloneDeep(currentSortState));
        refreshUI();
    }

    function handleRowClick(patientId, rowIndex, event) {
        if (event.target.closest('.no-row-click, .form-check-input, button, a')) {
            return;
        }
        
        const detailsRowId = `daten-detail-${patientId}`;
        const detailsRow = document.getElementById(detailsRowId);

        if (detailsRow && typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(detailsRow);
            bsCollapse.toggle();
        }
    }

    function refreshUI() {
        currentKollektiv = stateManager.getCurrentKollektiv();
        currentSortState = stateManager.getDatenTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        
        const filteredData = getFilteredData(currentKollektiv);
        const sortedData = [...filteredData].sort(getSortFunction(currentSortState.key, currentSortState.direction, currentSortState.subKey));
        
        renderTableBody(sortedData, currentSortState);
        ui_helpers.updateSortIcons('daten-table-header', currentSortState);
    }

    return Object.freeze({
        initialize,
        updateData,
        getFilteredData,
        createDatenTableHTML,
        handleSortChange,
        handleRowClick,
        refreshUI,
        renderTableBody
    });

})();

window.dataTabLogic = dataTabLogic;
