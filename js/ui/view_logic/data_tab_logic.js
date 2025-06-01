const dataTabLogic = (() => {
    let _currentData = [];
    let _currentSortState = null;
    let _kollektivName = '';
    let _isInitialized = false;

    function _getPatientRowHTML(patient) {
        if (!patient) return '';
        const na = '--';
        const hasT2Details = patient.lymphknoten_t2 && patient.lymphknoten_t2.length > 0;
        const collapseId = `collapse-pat-${patient.nr || patient.id_patient}`;

        let t2DetailsHTML = '';
        if (hasT2Details) {
            t2DetailsHTML = `
                <div class="sub-table-container collapse" id="${collapseId}">
                    <table class="table table-sm sub-table table-bordered caption-top">
                        <caption class="small text-muted ps-2">T2-Lymphknotenmerkmale (Patient ${patient.nr || patient.id_patient})</caption>
                        <thead class="small">
                            <tr>
                                <th>LK Nr.</th>
                                <th>Größe (mm)</th>
                                <th>Form</th>
                                <th>Kontur</th>
                                <th>Homogenität</th>
                                <th>Signal</th>
                            </tr>
                        </thead>
                        <tbody>`;
            patient.lymphknoten_t2.forEach((lk, index) => {
                t2DetailsHTML += `
                    <tr class="small">
                        <td>${index + 1}</td>
                        <td>${lk.groesse !== null ? formatNumber(lk.groesse, 1) : na}</td>
                        <td>${ui_helpers.getT2IconSVG('form', lk.form)} ${lk.form || na}</td>
                        <td>${ui_helpers.getT2IconSVG('kontur', lk.kontur)} ${lk.kontur || na}</td>
                        <td>${ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet)} ${lk.homogenitaet || na}</td>
                        <td>${ui_helpers.getT2IconSVG('signal', lk.signal)} ${lk.signal || na}</td>
                    </tr>`;
            });
            t2DetailsHTML += `</tbody></table></div>`;
        } else {
             t2DetailsHTML = `<div class="sub-table-container collapse" id="${collapseId}"><p class="text-muted small p-2 m-0">Keine T2-Lymphknotendetails für diesen Patienten vorhanden.</p></div>`;
        }

        return `
            <tr data-bs-toggle="${hasT2Details ? 'collapse' : ''}" data-bs-target="${hasT2Details ? `#${collapseId}` : ''}" aria-expanded="false" aria-controls="${collapseId}" class="${hasT2Details ? 'clickable-row' : ''}">
                <td class="text-center">
                    ${patient.nr ?? na}
                    ${hasT2Details ? '<i class="fas fa-chevron-down row-toggle-icon ms-1"></i>' : ''}
                </td>
                <td>${patient.name || na}</td>
                <td>${patient.vorname || na}</td>
                <td class="text-center">${patient.geschlecht || na}</td>
                <td class="text-center">${patient.alter !== null ? formatNumber(patient.alter, 0) : na}</td>
                <td>${getKollektivDisplayName(patient.therapie) || na}</td>
                <td class="text-center" style="font-weight: ${patient.n === '+' ? 'bold' : 'normal'}; color: ${patient.n === '+' ? 'var(--danger-color)' : (patient.n === '-' ? 'var(--success-color)' : 'inherit')}">${patient.n || na}</td>
                <td class="text-center" style="font-weight: ${patient.as === '+' ? 'bold' : 'normal'}; color: ${patient.as === '+' ? 'var(--danger-color)' : (patient.as === '-' ? 'var(--success-color)' : 'inherit')}">${patient.as || na}</td>
                <td class="text-center" style="font-weight: ${patient.t2 === '+' ? 'bold' : 'normal'}; color: ${patient.t2 === '+' ? 'var(--danger-color)' : (patient.t2 === '-' ? 'var(--success-color)' : 'inherit')}">${patient.t2 || na}</td>
                <td class="small">${patient.bemerkung || ''}</td>
            </tr>
            ${hasT2Details ? `<tr class="sub-row"><td colspan="10">${t2DetailsHTML}</td></tr>` : `<tr class="sub-row d-none"><td colspan="10">${t2DetailsHTML}</td></tr>`}
        `;
    }


    function _renderDatenTable() {
        const tableContainer = document.getElementById('daten-table-container');
        const tableHeaderContainerId = 'daten-table-header'; 
        const tableBodyContainerId = 'daten-table-body';

        if (!tableContainer) {
            console.error("Container 'daten-table-container' für Datentabelle nicht gefunden.");
            return;
        }

        if (!_currentData || !Array.isArray(_currentData)) {
             tableContainer.innerHTML = '<p class="p-3 text-muted">Keine Daten zum Anzeigen vorhanden.</p>';
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
            { key: 'bemerkung', label: 'Bemerkung', sortable: false, class: 'col-bemerkung small', tooltipKey: 'datenTable.bemerkung' }
        ];
        
        const rowsHTML = sortedData.map(patient => _getPatientRowHTML(patient)).join('');

        const tableOptions = {
            stickyHeader: true,
            stickyFirstColumn: false, // In dieser Tabelle nicht benötigt
            tableId: 'daten-table',
            headerContainerId: tableHeaderContainerId,
            bodyContainerId: tableBodyContainerId,
            additionalTableClasses: 'table-sm table-hover',
            captionText: `Patientenliste für Kollektiv: ${getKollektivDisplayName(_kollektivName)} (N=${sortedData.length})`
        };

        tableContainer.innerHTML = tableRenderer.createTableHTML(columns, rowsHTML, tableOptions);
        ui_helpers.attachRowCollapseListeners(document.getElementById(tableBodyContainerId));
    }


    function initializeTab(data, sortState) {
        _currentData = Array.isArray(data) ? data : [];
        _currentSortState = sortState || state.getCurrentDatenSortState();
        _kollektivName = state.getCurrentKollektiv();
        _isInitialized = true;

        _renderDatenTable();
        ui_helpers.updateSortIcons('daten-table-header', _currentSortState);
        ui_helpers.updateElementText('daten-tab-kollektiv-name', getKollektivDisplayName(_kollektivName));
    }
    
    function isInitialized() {
        return _isInitialized;
    }


    return Object.freeze({
        initializeTab,
        isInitialized
    });
})();
