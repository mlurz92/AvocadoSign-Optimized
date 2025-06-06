const tableRenderer = (() => {

    function createSortableTableHeaders(headers, sortState = {}) {
        let headersHtml = '<thead class="sticky-top"><tr>';

        headers.forEach(header => {
            const { key, label, sortable, tooltip, subSortKeys, style = '', class: headerClass = '' } = header;
            const isCurrentlySorted = sortState.key === key;
            const sortIconClass = isCurrentlySorted 
                ? (sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down') 
                : 'fa-sort';

            const thStyle = style ? `style="${style}"` : '';
            const thClass = `class="${headerClass}"`;
            const tippyContent = tooltip ? `data-tippy-content="${tooltip}"` : '';
            
            if (!sortable) {
                headersHtml += `<th ${thClass} ${thStyle}>${label}</th>`;
                return;
            }

            headersHtml += `<th ${thClass} ${thStyle} data-sort-key="${key}" ${tippyContent}>
                              <div class="d-flex justify-content-between align-items-center">
                                  <span>${label}</span>`;
            
            if (subSortKeys && Array.isArray(subSortKeys)) {
                headersHtml += `<div class="d-flex flex-column align-items-center ms-1">`;
                subSortKeys.forEach(subKey => {
                    const isSubkeySorted = isCurrentlySorted && sortState.subKey === subKey;
                    const subkeyIconClass = isSubkeySorted 
                        ? (sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down') 
                        : 'fa-sort';
                    headersHtml += `<span class="sortable-sub-header" data-sort-subkey="${subKey}">
                                        ${subKey.toUpperCase()} <i class="fas ${subkeyIconClass} fa-xs"></i>
                                    </span>`;
                });
                headersHtml += `</div>`;
            } else {
                 headersHtml += `<i class="fas ${sortIconClass} ms-1"></i>`;
            }

            headersHtml += `</div></th>`;
        });

        headersHtml += '</tr></thead>';
        return headersHtml;
    }

    return Object.freeze({
        createSortableTableHeaders
    });

})();
