const tableManager = (() => {

    function updateSortIcons(tableId, sortStateKey) {
        const tableElement = document.getElementById(tableId);
        if (!tableElement) return;

        const sortConfig = state[sortStateKey] ? state[sortStateKey]() : null;
        if (!sortConfig || !sortConfig.key) return;

        const { key: sortKey, direction: sortDirection, subKey: sortSubKey } = sortConfig;

        const headers = tableElement.querySelectorAll('thead th[data-sort-key]');
        headers.forEach(th => {
            const currentKey = th.dataset.sortKey;
            const currentSubKey = th.dataset.sortSubKey || null;
            let iconClass = 'fa-sort text-muted opacity-50';
            let iconElement = th.querySelector('i.fas');

            if (currentKey === sortKey && currentSubKey === sortSubKey) {
                iconClass = sortDirection === 'asc' ? 'fa-sort-up text-primary' : 'fa-sort-down text-primary';
            }

            if (iconElement) {
                iconElement.className = `fas ${iconClass} ms-1`;
            } else {
                iconElement = ui_helpers.createIcon(iconClass.split(' ')[0], { class: `${iconClass} ms-1` });
                if (iconElement) {
                    const currentText = th.textContent.trim();
                    th.innerHTML = `${ui_helpers.escapeHTML(currentText)} `;
                    th.appendChild(iconElement);
                }
            }

            if (th.querySelectorAll('.sortable-sub-header').length > 0) {
                const subHeaders = th.querySelectorAll('.sortable-sub-header[data-sort-sub-key]');
                subHeaders.forEach(subTh => {
                    const subKeyVal = subTh.dataset.sortSubKey;
                    let subIconClass = 'fa-sort text-muted opacity-50';
                    let subIconElement = subTh.querySelector('i.fas');

                    if (currentKey === sortKey && subKeyVal === sortSubKey) {
                        subIconClass = sortDirection === 'asc' ? 'fa-sort-up text-primary' : 'fa-sort-down text-primary';
                    }

                    if (subIconElement) {
                        subIconElement.className = `fas ${subIconClass} ms-1`;
                    } else {
                        subIconElement = ui_helpers.createIcon(subIconClass.split(' ')[0], { class: `${subIconClass} ms-1`});
                        if (subIconElement) {
                             const currentSubText = subTh.textContent.trim();
                             subTh.innerHTML = `${ui_helpers.escapeHTML(currentSubText)} `;
                             subTh.appendChild(subIconElement);
                        }
                    }
                });
            }
        });
    }


    function initializeTableEventListeners(tableId, sortStateKey, onSortCallback) {
        const tableElement = document.getElementById(tableId);
        if (!tableElement || !tableElement.tHead || tableElement.tHead.rows.length === 0) return;

        const headerCells = tableElement.tHead.rows[0].cells;

        for (let i = 0; i < headerCells.length; i++) {
            const th = headerCells[i];
            const sortKey = th.dataset.sortKey;

            if (sortKey) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', (event) => {
                    let clickedSortKey = sortKey;
                    let clickedSubKey = th.dataset.sortSubKey || null;

                    if (event.target.classList.contains('sortable-sub-header') || event.target.closest('.sortable-sub-header')) {
                        const subHeaderTarget = event.target.closest('.sortable-sub-header');
                        if (subHeaderTarget && subHeaderTarget.dataset.sortSubKey) {
                            clickedSubKey = subHeaderTarget.dataset.sortSubKey;
                        }
                    }
                    if (onSortCallback && typeof onSortCallback === 'function') {
                        onSortCallback(clickedSortKey, clickedSubKey);
                         updateSortIcons(tableId, sortStateKey);
                    }
                });

                if (th.querySelectorAll('.sortable-sub-header').length > 0) {
                    const subHeaders = th.querySelectorAll('.sortable-sub-header[data-sort-sub-key]');
                    subHeaders.forEach(subTh => {
                        subTh.style.cursor = 'pointer';
                    });
                }
            }
        }
         updateSortIcons(tableId, sortStateKey);
    }


    return Object.freeze({
        initializeTableEventListeners,
        updateSortIcons
    });

})();
