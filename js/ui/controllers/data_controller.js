const dataController = (() => {

    let mainApp = null;
    let isInitialized = false;

    function _handleSort(event) {
        const header = event.target.closest('[data-sort-key]');
        if (!header) return;

        const key = header.dataset.sortKey;
        const subKey = event.target.closest('[data-sub-key]')?.dataset.subKey || null;
        
        const currentSortState = stateManager.getSortState('daten');
        let direction = 'asc';

        // Check if the same key and subKey are clicked, then toggle direction
        if (currentSortState.key === key && currentSortState.subKey === subKey) {
            direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // If a different key or subKey is clicked, reset direction to 'asc'
            direction = 'asc';
        }

        stateManager.setSortState('daten', { key, subKey, direction });
        mainApp.updateAndRender();
    }

    function _toggleAllDetails(tableBodyId, button) {
        if (!button) return;
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) return;

        const isExpandAction = button.dataset.action === 'expand';
        const collapseElements = tableBody.querySelectorAll('.collapse');

        collapseElements.forEach(el => {
            const instance = bootstrap.Collapse.getOrCreateInstance(el);
            if (isExpandAction && !el.classList.contains('show')) {
                instance.show();
            } else if (!isExpandAction && el.classList.contains('show')) {
                instance.hide();
            }
        });

        const newAction = isExpandAction ? 'collapse' : 'expand';
        const newIconClass = isExpandAction ? 'fa-chevron-up' : 'fa-chevron-down';
        const newButtonText = isExpandAction ? 'Alle Details Ausblenden' : 'Alle Details Anzeigen';
        const tooltipContent = isExpandAction ? 
            (TOOLTIP_CONTENT.datenTable.collapseAll?.description || 'Alle Details ausblenden') : 
            (TOOLTIP_CONTENT.datenTable.expandAll?.description || 'Alle Details anzeigen');
            
        button.dataset.action = newAction;
        button.innerHTML = `<i class="fas ${newIconClass} me-1"></i>${newButtonText}`;
        button.setAttribute('data-tippy-content', tooltipContent);
        if (button._tippy) {
            button._tippy.setContent(tooltipContent);
        }
    }

    function _handlePaneClick(event) {
        const sortTarget = event.target.closest('.sortable-header, .sortable-sub-header');
        const toggleAllButton = event.target.closest('#daten-toggle-details');

        if (sortTarget) {
            _handleSort(event);
        } else if (toggleAllButton) {
            _toggleAllDetails('daten-table-body', toggleAllButton);
        }
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        const pane = document.getElementById('daten-tab-pane');
        if (pane) {
            pane.addEventListener('click', _handlePaneClick);
            isInitialized = true;
        }
    }
    
    function onTabEnter() {
        // No specific onTabEnter logic needed for dataController at the moment beyond event listeners
        // Event listeners are attached once in init, so no need to re-attach unless they are removed on exit.
    }

    function onTabExit() {
        // No specific onTabExit logic needed for dataController at the moment
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit
    });

})();
