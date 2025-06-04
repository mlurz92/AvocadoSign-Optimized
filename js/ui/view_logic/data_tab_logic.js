const dataTabLogic = (() => {

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
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
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

    let dataView = [];
    let currentSortState = cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
    let tableRendererInstance = null;
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;

    function initialize(data, initialKollektiv) {
        if (!Array.isArray(data)) {
            console.error("DataTabLogic: Ungültige Daten für Initialisierung empfangen.");
            dataView = [];
        } else {
            dataView = data;
        }
        currentKollektiv = initialKollektiv;
        currentSortState = stateManager.getDatenTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        _renderTable();
    }

    function updateData(newData) {
        if (!Array.isArray(newData)) {
            console.error("DataTabLogic: Ungültige Daten für Update empfangen.");
            return;
        }
        dataView = newData;
        currentKollektiv = stateManager.getCurrentKollektiv();
        _renderTable();
    }

    function getFilteredData(kollektivId) {
        if (!dataView || dataView.length === 0) return [];
        if (kollektivId === 'Gesamt') {
            return dataView;
        }
        return dataView.filter(p => p.therapie === kollektivId);
    }

    function _renderTable() {
        const tableContainer = document.getElementById('daten-tab-pane');
        const toggleDetailsButtonId = 'daten-toggle-details';
        
        if (!tableContainer) {
            console.error("DataTabLogic: Tabellencontainer nicht gefunden.");
            return;
        }

        const filteredData = getFilteredData(currentKollektiv);
        const sortedData = [...filteredData].sort(getSortFunction(currentSortState.key, currentSortState.direction, currentSortState.subKey));
        const tableHTML = createDatenTableHTML(sortedData, currentSortState);
        
        ui_helpers.updateElementHTML(tableContainer.id, `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h4 mb-0">Patientenliste (${getKollektivDisplayName(currentKollektiv)}, N=${filteredData.length})</h2>
                <button class="btn btn-sm btn-outline-secondary" id="${toggleDetailsButtonId}" data-action="expand" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.datenTable.expandAll}">
                    ${UI_TEXTS.datenTab.toggleDetailsButton.expand} <i class="fas fa-chevron-down ms-1"></i>
                </button>
            </div>
            <div class="table-responsive">
                ${tableHTML}
            </div>
        `);

        if (typeof dataTabEventHandlers !== 'undefined' && dataTabEventHandlers.register) {
            dataTabEventHandlers.register();
        }
        ui_helpers.initializeTooltips(tableContainer);
        ui_helpers.updateSortIcons('daten-table-header', currentSortState);
        ui_helpers.attachRowCollapseListeners(document.getElementById('daten-table-body'));
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
        _renderTable();
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
        _renderTable();
    }

    return Object.freeze({
        initialize,
        updateData,
        getFilteredData,
        createDatenTableHTML,
        handleSortChange,
        handleRowClick,
        refreshUI
    });

})();

window.dataTabLogic = dataTabLogic;
