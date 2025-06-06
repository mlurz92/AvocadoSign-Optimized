const dataTabRenderer = (() => {

    function _createT2LymphknotenDetailHTML(lymphknotenT2Array) {
        if (!Array.isArray(lymphknotenT2Array) || lymphknotenT2Array.length === 0) {
            return `<div class="p-2 text-muted small"><em>Keine T2-Lymphknotendaten für diesen Patienten verfügbar.</em></div>`;
        }

        let detailHtml = '<div class="sub-row-content container-fluid">';
        detailHtml += '<div class="row g-2">';

        lymphknotenT2Array.forEach((lk, index) => {
            if (!lk) return;
            detailHtml += `<div class="col-12 col-md-6 col-lg-4">
                            <div class="sub-row-item border rounded">
                                <strong class="me-2">LK #${index + 1}:</strong>
                                <span class="me-2">${uiComponents.getIconForT2Feature('size', lk.groesse, true)}Größe: ${formatNumber(lk.groesse, 1, 'N/A')}mm</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('form', lk.form)}Form: ${lk.form || 'N/A'}</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('kontur', lk.kontur)}Kontur: ${lk.kontur || 'N/A'}</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('homogenitaet', lk.homogenitaet)}Signalhomogenität: ${lk.homogenitaet || 'N/A'}</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('signal', lk.signal)}Signalintensität: ${lk.signal || 'N/A'}</span>
                           </div>
                         </div>`;
        });
        detailHtml += '</div></div>';
        return detailHtml;
    }

    function renderDatenTab(data, sortState) {
        if (typeof tableRenderer === 'undefined' || typeof uiComponents === 'undefined') {
            console.error("tableRenderer oder uiComponents nicht verfügbar für dataTabRenderer.");
            return '<p class="text-danger p-3">Fehler: Tabellen-Renderer-Komponenten nicht geladen.</p>';
        }

        const tableId = "daten-table";
        const tableBodyId = "daten-table-body";
        const toggleAllButtonId = "daten-toggle-details";
        const noDataMessage = '<td colspan="9" class="text-center text-muted p-3">Keine Patientendaten für das aktuelle Kollektiv verfügbar.</td>';

        let tableHtml = `<div class="d-flex justify-content-end mb-2">
                            <button class="btn btn-sm btn-outline-secondary" id="${toggleAllButtonId}" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll.description}">
                                <i class="fas fa-plus-square me-1"></i>Alle Details Anzeigen
                            </button>
                         </div>`;

        tableHtml += `<div class="table-responsive">
                        <table class="table table-sm table-hover data-table" id="${tableId}">`;

        const headers = [
            { key: 'expand', label: '', sortable: false, class: 'text-center p-1', style: 'width: 40px;' },
            { key: 'nr', label: 'Nr.', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.nr.description },
            { key: 'name', label: 'Name', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.name.description },
            { key: 'vorname', label: 'Vorname', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.vorname.description },
            { key: 'geschlecht', label: 'G', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.geschlecht.description, class: 'text-center' },
            { key: 'alter', label: 'Alter', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.alter.description, class: 'text-center' },
            { key: 'therapie', label: 'Therapie', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.therapie.description },
            {
                key: 'n_as_t2', label: 'N | AS | T2', sortable: true, subSortKeys: ['n', 'as', 't2'],
                tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2.description,
                class: 'text-center'
            },
            { key: 'bemerkung', label: 'Bemerkung', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.bemerkung.description, style: 'min-width: 150px;' }
        ];

        tableHtml += tableRenderer.createSortableTableHeaders(headers, sortState);
        tableHtml += `<tbody id="${tableBodyId}">`;

        if (!data || data.length === 0) {
            tableHtml += `<tr>${noDataMessage}</tr>`;
        } else {
            data.forEach((patient, index) => {
                const rowId = `patient-row-${patient.nr || index}`;
                const collapseId = `collapse-details-${patient.nr || index}`;
                const hasT2Data = patient.lymphknoten_t2 && patient.lymphknoten_t2.length > 0;

                tableHtml += `<tr id="${rowId}" class="${hasT2Data ? 'clickable-row' : ''}" ${hasT2Data ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}"` : ''} data-patient-id="${patient.nr || index}">
                                <td class="text-center p-1">
                                    ${hasT2Data ? `<button class="btn btn-sm row-toggle-button" aria-label="Details anzeigen/ausblenden" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandRow.description}"><i class="fas fa-chevron-down row-toggle-icon"></i></button>` : ''}
                                </td>
                                <td>${patient.nr !== undefined ? patient.nr : 'N/A'}</td>
                                <td>${patient.name || 'N/A'}</td>
                                <td>${patient.vorname || ''}</td>
                                <td class="text-center">${patient.geschlecht === 'm' ? 'M' : (patient.geschlecht === 'f' ? 'W' : 'U')}</td>
                                <td class="text-center">${patient.alter !== null && patient.alter !== undefined ? patient.alter : 'N/A'}</td>
                                <td>${patient.therapie || 'N/A'}</td>
                                <td class="text-center">
                                    <span class="status-badge ${getStatusClass(patient.n)}">${patient.n || '?'}</span> |
                                    <span class="status-badge ${getStatusClass(patient.as)}">${patient.as || '?'}</span> |
                                    <span class="status-badge ${getStatusClass(patient.t2)}">${patient.t2 || '?'}</span>
                                </td>
                                <td style="white-space: normal; max-width: 300px; overflow-wrap: break-word;">${patient.bemerkung || ''}</td>
                              </tr>`;
                if (hasT2Data) {
                    tableHtml += `<tr class="sub-row">
                                    <td colspan="${headers.length}" class="p-0">
                                        <div class="collapse" id="${collapseId}">
                                            ${_createT2LymphknotenDetailHTML(patient.lymphknoten_t2)}
                                        </div>
                                    </td>
                                  </tr>`;
                }
            });
        }

        tableHtml += `</tbody></table></div>`;
        return tableHtml;
    }

    return Object.freeze({
        renderDatenTab
    });

})();
