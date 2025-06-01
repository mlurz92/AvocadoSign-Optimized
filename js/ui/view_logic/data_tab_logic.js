const dataTabLogic = (() => {
    let _currentData = [];
    let _currentSortState = null;
    let _kollektivName = '';
    let _isInitialized = false;

    function _createDatenTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thStyle = col.class ? `class="${col.class}"` : '';
            if (col.width) {
                thStyle += ` style="width: ${col.width};"`;
            }

            let isMainKeyActiveSort = false;
            let activeSubKey = null;

            if (sortState && sortState.key === col.key) {
                if (col.subHeaders && col.subHeaders.some(sh => sh.subKey === sortState.subKey)) {
                    isMainKeyActiveSort = true;
                    activeSubKey = sortState.subKey;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subHeaders && (sortState.subKey === null || sortState.subKey === undefined)) {
                    isMainKeyActiveSort = true;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                    let currentStyle = thStyle.includes('style="') ? thStyle.substring(thStyle.indexOf('style="') + 7, thStyle.lastIndexOf('"')) : '';
                    if (currentStyle && !currentStyle.endsWith(';')) {
                        currentStyle += '; ';
                    }
                    currentStyle += 'color: var(--primary-color);';
                    if (thStyle.includes('style="')) {
                        thStyle = thStyle.replace(/style=".*?"/, `style="${currentStyle}"`);
                    } else {
                        thStyle += ` style="${currentStyle}"`;
                    }
                }
            }
            
            const baseTooltipKeyValue = col.tooltipKey || `datenTable.${col.key}`;
            const baseTooltipContent = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.datenTable && TOOLTIP_CONTENT.datenTable[col.key] ? TOOLTIP_CONTENT.datenTable[col.key] : col.label) || col.label;


            const subHeadersHTML = col.subHeaders ? col.subHeaders.map(sh => {
                 const isActiveSubSort = activeSubKey === sh.subKey;
                 const subStyle = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sh.label || sh.subKey.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltipContent}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sh.subKey}" style="cursor: pointer; ${subStyle}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';

            const mainTooltip = col.subHeaders ? `${baseTooltipContent}` : (col.key === 'details' ? (TOOLTIP_CONTENT.datenTable.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
            const sortAttributes = col.sortable ? `data-sort-key="${col.key}" ${col.subHeaders || col.key === 'details' ? '' : 'style="cursor: pointer;"'}` : '';
            
            let thContent = col.label;
            if (col.subHeaders) {
                thContent += ` (${subHeadersHTML})`;
            }
            thContent += (col.sortable && !col.subHeaders && !isMainKeyActiveSort) ? ' <i class="fas fa-sort text-muted opacity-50 ms-1"></i>' : (isMainKeyActiveSort ? sortIconHTML : '');
            if(col.key === 'details' && !col.sortable) {
                thContent = col.label;
            }

            headerHTML += `<th scope="col" ${thStyle} ${sortAttributes} data-tippy-content="${mainTooltip}">${thContent}</th>`;
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function _renderDatenTable() {
        const tableContainer = document.getElementById('daten-table-container');
        const tableId = 'daten-table';
        const tableBodyId = `${tableId}-body`;

        if (!tableContainer) {
            console.error("DataTabLogic: Container 'daten-table-container' für Datentabelle nicht gefunden.");
            return;
        }

        if (!_currentData || !Array.isArray(_currentData) || _currentData.length === 0) {
             tableContainer.innerHTML = `<p class="p-3 text-muted">Keine Daten für Kollektiv '${getKollektivDisplayName(_kollektivName)}' zum Anzeigen vorhanden.</p>`;
             return;
        }

        const sortedData = [..._currentData].sort(getSortFunction(_currentSortState.key, _currentSortState.direction, _currentSortState.subKey));

        const columns = [
            { key: 'nr', label: 'Nr.', sortable: true, class: 'text-center col-nr', tooltipKey: 'datenTable.nr' },
            { key: 'name', label: 'Name', sortable: true, class: 'col-name', tooltipKey: 'datenTable.name' },
            { key: 'vorname', label: 'Vorname', sortable: true, class: 'col-vorname', tooltipKey: 'datenTable.vorname' },
            { key: 'geschlecht', label: 'Geschl.', sortable: true, class: 'text-center col-geschlecht', tooltipKey: 'datenTable.geschlecht' },
            { key: 'alter', label: 'Alter', sortable: true, class: 'text-center col-alter', tooltipKey: 'datenTable.alter' },
            { key: 'therapie', label: 'Therapie', sortable: true, class: 'col-therapie', tooltipKey: 'datenTable.therapie' },
            {
                key: 'status', label: 'N/AS/T2', sortable: true, class: 'text-center col-status',
                tooltipKey: 'datenTable.n_as_t2',
                subHeaders: [
                    { label: 'N', subKey: 'n' },
                    { label: 'AS', subKey: 'as' },
                    { label: 'T2', subKey: 't2' }
                ]
            },
            { key: 'bemerkung', label: 'Bemerkung', sortable: false, class: 'col-bemerkung small', tooltipKey: 'datenTable.bemerkung' },
            { key: 'details', label: '', sortable: false, class: 'text-center col-details', width: '30px', tooltipKey: 'datenTable.expandRow' }
        ];

        let tableHTML = `<table class="table table-sm table-hover data-table ${APP_CONFIG.UI_SETTINGS.STICKY_FIRST_COL_DATEN ? 'sticky-first-col' : ''}" id="${tableId}">`;
        tableHTML += `<caption class="small text-muted">Patientenliste für Kollektiv: ${getKollektivDisplayName(_kollektivName)} (N=${sortedData.length})</caption>`;
        tableHTML += _createDatenTableHeaderHTML(tableId, _currentSortState, columns);
        tableHTML += `<tbody id="${tableBodyId}">`;
        tableHTML += sortedData.map(patient => tableRenderer.createDatenTableRow(patient)).join('');
        tableHTML += `</tbody></table>`;

        tableContainer.innerHTML = tableHTML;

        const tableBodyElement = document.getElementById(tableBodyId);
        if(tableBodyElement && typeof ui_helpers !== 'undefined' && typeof ui_helpers.attachRowCollapseListeners === 'function'){
            ui_helpers.attachRowCollapseListeners(tableBodyElement);
        }
    }

    function initializeTab(data, sortStateParam) {
        _currentData = Array.isArray(data) ? data : [];
        
        if (sortStateParam) {
            _currentSortState = sortStateParam;
        } else if (typeof state !== 'undefined' && typeof state.getCurrentDatenSortState === 'function') {
            _currentSortState = state.getCurrentDatenSortState();
        } else {
            _currentSortState = { key: 'nr', direction: 'asc', subKey: null };
        }

        if (typeof state !== 'undefined' && typeof state.getCurrentKollektiv === 'function') {
            _kollektivName = state.getCurrentKollektiv();
        } else {
            _kollektivName = 'Unbekannt';
        }
        
        _isInitialized = true;
        _renderDatenTable();
        
        if (typeof ui_helpers !== 'undefined') {
            const tableHeaderElement = document.getElementById('daten-table-header');
            if(tableHeaderElement && typeof ui_helpers.updateSortIcons === 'function') {
                 ui_helpers.updateSortIcons('daten-table-header', _currentSortState);
            }
            if(typeof ui_helpers.updateElementText === 'function') {
                 ui_helpers.updateElementText('daten-tab-kollektiv-name', getKollektivDisplayName(_kollektivName));
            }
        }
    }

    function isInitialized() {
        return _isInitialized;
    }

    return Object.freeze({
        initializeTab,
        isInitialized
    });
})();
