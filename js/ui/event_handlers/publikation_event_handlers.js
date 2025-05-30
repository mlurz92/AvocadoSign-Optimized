const publikationEventHandlers = (() => {
    let eventsAttached = false;

    function _handleLanguageSwitchChange(mainApp) {
        const langSwitch = document.getElementById('publikation-sprache-switch');
        if (langSwitch) {
            const newLang = langSwitch.checked ? 'en' : 'de';
            if (typeof state !== 'undefined' && typeof state.setCurrentPublikationLang === 'function') {
                state.setCurrentPublikationLang(newLang);
            }
            if (mainApp && typeof mainApp.renderView === 'function') {
                mainApp.renderView('publikation-tab-pane');
            }
        }
    }

    function _handleSectionLinkClick(event, mainApp) {
        event.preventDefault();
        const targetLink = event.target.closest('.publikation-section-link');
        if (targetLink && targetLink.dataset.sectionId) {
            const sectionId = targetLink.dataset.sectionId;
            if (typeof state !== 'undefined' && typeof state.setCurrentPublikationSection === 'function') {
                state.setCurrentPublikationSection(sectionId);
            }
            if (mainApp && typeof mainApp.renderView === 'function') {
                mainApp.renderView('publikation-tab-pane');
            }
        }
    }

    function _handleBruteForceMetricChange(mainApp) {
        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');
        if (bfMetricSelect) {
            const newBfMetric = bfMetricSelect.value;
            if (typeof state !== 'undefined' && typeof state.setCurrentPublikationBruteForceMetric === 'function') {
                state.setCurrentPublikationBruteForceMetric(newBfMetric);
            }
            if (mainApp && typeof mainApp.renderView === 'function') {
                mainApp.renderView('publikation-tab-pane');
            }
        }
    }

    function attachEventListeners(mainApp) {
        if (eventsAttached) {
            return;
        }

        const publikationTabPane = document.getElementById('publikation-tab-pane');
        if (!publikationTabPane) {
            console.warn("PublikationEventHandlers: Publikation-Tab-Pane nicht im DOM gefunden. Event-Listener werden nicht angehängt.");
            return;
        }

        publikationTabPane.addEventListener('change', (event) => {
            if (event.target && event.target.id === 'publikation-sprache-switch') {
                _handleLanguageSwitchChange(mainApp);
            } else if (event.target && event.target.id === 'publikation-bf-metric-select') {
                _handleBruteForceMetricChange(mainApp);
            }
        });

        const sectionsNav = publikationTabPane.querySelector('#publikation-sections-nav');
        if (sectionsNav) {
            sectionsNav.addEventListener('click', (event) => {
                if (event.target.closest('.publikation-section-link')) {
                    _handleSectionLinkClick(event, mainApp);
                }
            });
        } else {
            // Fallback, falls #publikation-sections-nav erst später erstellt wird (sollte nicht der Fall sein)
            // oder wenn der Event-Listener direkt auf publikationTabPane für mehr Robustheit gesetzt werden soll.
            // Für den Moment gehen wir davon aus, dass #publikation-sections-nav beim Initialisieren von renderPublikationTab da ist.
             console.warn("PublikationEventHandlers: #publikation-sections-nav nicht gefunden für Klick-Handler-Delegation.");
        }
        
        eventsAttached = true;
    }

    return Object.freeze({
        attachEventListeners
    });

})();
