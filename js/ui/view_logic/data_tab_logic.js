const dataTabLogic = (() => {
    let _mainAppInterface = null;
    let _currentData = [];
    let _currentSortState = null;
    let _kollektivName = '';
    let _isInitialized = false;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function _createDatenTableHeaderHTML(tableId, sortState, columns) {
        if (!_mainAppInterface) return '<thead><tr><th>Fehler: Hauptinterface nicht verfügbar</th></tr></thead>';
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const tooltipContentSource = stateSnapshot.tooltipContent?.datenTable || {};

        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thStyle = col.class ? `class="${col.class}"` : '';
            if (col.width) {
                 let currentStyleValue = thStyle.includes('style="') ? thStyle.substring(thStyle.indexOf('style="') + 7, thStyle.lastIndexOf('"')) : '';
                 if (currentStyleValue && !currentStyleValue.endsWith(';')) currentStyleValue += '; ';
                 currentStyleValue += `width: ${col.width};`;
                 thStyle = thStyle.includes('style="') ? thStyle.replace(/style=".*?"/, `style="${currentStyleValue}"`) : ` style="${currentStyleValue}"`;
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
                    let currentStyleValue = thStyle.includes('style="') ? thStyle.substring(thStyle.indexOf('style="') + 7, thStyle.lastIndexOf('"')) : '';
                    if (currentStyleValue && !currentStyleValue.endsWith(';')) currentStyleValue += '; ';
                    currentStyleValue += 'color: var(--primary-color); font-weight: bold;';
                    thStyle = thStyle.includes('style="') ? thStyle.replace(/style=".*?"/, `style="${currentStyleValue}"`) : ` style="${currentStyleValue}"`;
                }
            }

            const baseTooltipContent = tooltipContentSource[col.tooltipKey] || col.label || '';

            const subHeadersHTML = col.subHeaders ? col.subHeaders.map(sh => {
                 const isActiveSubSort = activeSubKey === sh.subKey;
                 const subStyle = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sh.label || sh.subKey.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltipContent}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sh.subKey}" style="cursor: pointer; ${subStyle}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';

            const mainTooltip = col.subHeaders ? `${baseTooltipContent}` : (col.key === 'details' ? (tooltipContentSource.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
            const sortAttributes = col.sortable ? `data-sort-key="${col.key}" ${col.subHeaders || col.key === 'details' ? '' : 'style="cursor: pointer;"'}` : '';

            let thContent = col.label;
            if (col.subHeaders) {
                thContent += ` (${subHeadersHTML})`;
            }
            thContent += (col.sortable && !col.subHeaders && !isMainKeyActiveSort && col.key !== 'details') ? ' <i class="fas fa-sort text-muted opacity-50 ms-1"></i>' : (isMainKeyActiveSort ? sortIconHTML : '');
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
        if (!_mainAppInterface) {
            tableContainer.innerHTML = `<p class="p-3 text-danger">Fehler: Hauptinterface nicht verfügbar zum Rendern der Datentabelle.</p>`;
            return;
        }
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const appConfig = stateSnapshot.appConfig;

        if (!_currentData || !Array.isArray(_currentData) || _currentData.length === 0) {
             tableContainer.innerHTML = `<p class="p-3 text-muted">Keine Daten für Kollektiv '${getKollektivDisplayName(_kollektivName)}' zum Anzeigen vorhanden.</p>`;
             return;
        }

        const sortedData = [..._currentData].sort(getSortFunction(_currentSortState.key, _currentSortState.direction, _currentSortState.subKey));

        const columns = [
            { key: 'nr', label: 'Nr.', sortable: true, class: 'text-center col-nr', tooltipKey: 'nr' },
            { key: 'name', label: 'Name', sortable: true, class: 'col-name', tooltipKey: 'name' },
            { key: 'vorname', label: 'Vorname', sortable: true, class: 'col-vorname', tooltipKey: 'vorname' },
            { key: 'geschlecht', label: 'Geschl.', sortable: true, class: 'text-center col-geschlecht', tooltipKey: 'geschlecht' },
            { key: 'alter', label: 'Alter', sortable: true, class: 'text-center col-alter', tooltipKey: 'alter' },
            { key: 'therapie', label: 'Therapie', sortable: true, class: 'col-therapie', tooltipKey: 'therapie' },
            {
                key: 'status', label: 'N/AS/T2', sortable: true, class: 'text-center col-status',
                tooltipKey: 'n_as_t2',
                subHeaders: [
                    { label: 'N', subKey: 'n_status_patient' },
                    { label: 'AS', subKey: 'as_status_patient' },
                    { label: 'T2', subKey: 't2_status_patient' }
                ]
            },
            { key: 'bemerkung', label: 'Bemerkung', sortable: false, class: 'col-bemerkung small', tooltipKey: 'bemerkung' },
            { key: 'details', label: '', sortable: false, class: 'text-center col-details', width: '30px', tooltipKey: 'expandRow' }
        ];

        let tableHTML = `<table class="table table-sm table-hover data-table ${appConfig.UI_SETTINGS.STICKY_FIRST_COL_DATEN ? 'sticky-first-col' : ''}" id="${tableId}">`;
        tableHTML += `<caption class="small text-muted">Patientenliste für Kollektiv: ${getKollektivDisplayName(_kollektivName)} (N=${sortedData.length})</caption>`;
        tableHTML += _createDatenTableHeaderHTML(tableId, _currentSortState, columns);
        tableHTML += `<tbody id="${tableBodyId}">`;

        if (typeof tableRenderer !== 'undefined' && typeof tableRenderer.createDatenTableRow === 'function') {
            tableHTML += sortedData.map(patient => tableRenderer.createDatenTableRow(patient)).join('');
        } else {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-danger">Fehler: Tabellenzeilen-Renderer nicht verfügbar.</td></tr>`;
        }
        tableHTML += `</tbody></table>`;

        tableContainer.innerHTML = tableHTML;

        const tableBodyElement = document.getElementById(tableBodyId);
        const uiHelpers = _mainAppInterface.getUiHelpers();
        if(tableBodyElement && uiHelpers && typeof uiHelpers.attachRowCollapseListeners === 'function'){
            uiHelpers.attachRowCollapseListeners(tableBodyElement);
        }
    }

    function initializeTab(data, sortStateParam) {
        if (!_mainAppInterface) {
            console.error("DataTabLogic: Hauptinterface nicht initialisiert.");
            return;
        }
        _currentData = Array.isArray(data) ? data : [];
        const stateSnapshot = _mainAppInterface.getStateSnapshot();

        if (sortStateParam && typeof sortStateParam.key === 'string' && typeof sortStateParam.direction === 'string') {
            _currentSortState = sortStateParam;
        } else {
            _currentSortState = stateSnapshot.datenSortState || { key: 'nr', direction: 'asc', subKey: null };
        }
        
        _kollektivName = stateSnapshot.currentKollektiv || 'Unbekannt';

        _isInitialized = true;
        _renderDatenTable();

        const uiHelpers = _mainAppInterface.getUiHelpers();
        if (uiHelpers) {
            const tableHeaderElement = document.getElementById('daten-table-header');
            if(tableHeaderElement && typeof uiHelpers.updateSortIcons === 'function') {
                 uiHelpers.updateSortIcons('daten-table-header', _currentSortState);
            }
            if(typeof uiHelpers.updateElementText === 'function') {
                 uiHelpers.updateElementText('daten-tab-kollektiv-name', getKollektivDisplayName(_kollektivName));
            }
            if(typeof uiHelpers.initializeTooltips === 'function') {
                uiHelpers.initializeTooltips(document.getElementById('daten-table-container'));
            }
        }
    }

    function isInitialized() {
        return _isInitialized;
    }

    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized
    });
})();
