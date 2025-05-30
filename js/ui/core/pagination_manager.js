const paginationManager = (() => {

    function createPaginationControls(context, currentPage, totalPages) {
        if (totalPages <= 1) {
            return '';
        }

        let html = '<nav aria-label="Seitennavigation"><ul class="pagination pagination-sm justify-content-center">';
        const maxVisiblePages = APP_CONFIG.UI_SETTINGS.PAGINATION_MAX_VISIBLE_PAGES || 7;
        const delta = Math.floor(maxVisiblePages / 2);

        // "Erste Seite" und "Vorherige Seite" Buttons
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="1" data-context="${context}" aria-label="Erste">
                        <span aria-hidden="true">&laquo;&laquo;</span>
                    </a>
                 </li>`;
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}" data-context="${context}" aria-label="Vorherige">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                 </li>`;

        let startPage = Math.max(1, currentPage - delta);
        let endPage = Math.min(totalPages, currentPage + delta);

        if (currentPage - delta <= 1) {
            endPage = Math.min(totalPages, maxVisiblePages);
        }
        if (currentPage + delta >= totalPages) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}" data-context="${context}">${i}</a>
                     </li>`;
        }

        if (endPage < totalPages) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // "Nächste Seite" und "Letzte Seite" Buttons
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}" data-context="${context}" aria-label="Nächste">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                 </li>`;
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                     <a class="page-link" href="#" data-page="${totalPages}" data-context="${context}" aria-label="Letzte">
                        <span aria-hidden="true">&raquo;&raquo;</span>
                     </a>
                  </li>`;

        html += '</ul></nav>';
        return html;
    }

    function attachPaginationEventListeners(context, totalPages, onPageChangeCallback) {
        const paginationContainerId = `${context}-pagination-container`;
        const container = document.getElementById(paginationContainerId);

        if (!container) {
            console.warn(`PaginationManager: Container ${paginationContainerId} nicht gefunden.`);
            return;
        }

        container.addEventListener('click', (event) => {
            event.preventDefault();
            const target = event.target.closest('a.page-link');

            if (target && target.dataset.page) {
                const page = parseInt(target.dataset.page, 10);
                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    if (typeof onPageChangeCallback === 'function') {
                        onPageChangeCallback(page);
                    }
                }
            }
        });
    }

    return Object.freeze({
        createPaginationControls,
        attachPaginationEventListeners
    });

})();
