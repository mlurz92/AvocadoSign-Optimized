const publikationEventHandlers = (() => {

    function handleExportAllMarkdown() {
        if (!exportService || typeof exportService.exportCategoryZip !== 'function' ||
            !kollektivStore || typeof kollektivStore.getCurrentKollektivRawData !== 'function' || // Angepasst, um getCurrentKollektivRawData zu verwenden
            !t2CriteriaManager || typeof t2CriteriaManager.getAppliedCriteria !== 'function' || typeof t2CriteriaManager.getAppliedLogic !== 'function' ||
            !bruteForceManager || typeof bruteForceManager.getAllResults !== 'function' ||
            !state || typeof state.getCurrentKollektiv !== 'function') {
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                ui_helpers.showToast("Exportfunktion oder benötigte Datenmodule nicht verfügbar.", "danger");
            }
            console.error("handleExportAllMarkdown: Benötigte Module oder Funktionen fehlen.");
            return;
        }
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
            ui_helpers.showToast("Export aller Publikationssektionen als Markdown ZIP wird vorbereitet...", "info");
        }
        try {
            const rawData = kollektivStore.getAllProcessedData(); // Holt alle verarbeiteten Daten
            const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
            const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
            const allBruteForceResults = bruteForceManager.getAllResults();
            const currentKollektivId = state.getCurrentKollektiv();

            // Filtere die rawData für das aktuelle Kollektiv, bevor sie an exportCategoryZip übergeben wird
            const dataForCurrentKollektiv = dataProcessor.filterDataByKollektiv(rawData, currentKollektivId);

            exportService.exportCategoryZip('md-zip', dataForCurrentKollektiv, allBruteForceResults, currentKollektivId, appliedT2Criteria, appliedT2Logic);
        } catch (error) {
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                ui_helpers.showToast("Fehler beim Export der Publikationssektionen.", "danger");
            }
            console.error("Fehler beim Export aller Publikationssektionen:", error);
        }
    }

    // Die mainAppInterface wird nun als Parameter erwartet, um Callbacks zu ermöglichen
    function setupPublicationTabEventHandlers(mainAppInterface) {
        const tabPane = document.getElementById('publikation-tab-pane');
        if (!tabPane) return;

        // Event Listener für Änderungen an Sprache und Metrik
        tabPane.addEventListener('change', (event) => {
            if (event.target.id === 'publication-language-switch') {
                if (typeof state !== 'undefined' && typeof state.setCurrentPublikationLang === 'function' && mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                    const newLang = event.target.value;
                    if (state.setCurrentPublikationLang(newLang)) {
                        mainAppInterface.refreshCurrentTab(); // Aktualisiert den Tab, um Änderungen zu reflektieren
                    }
                } else if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.handleLanguageChange === 'function') {
                    // Fallback, falls mainAppInterface nicht übergeben wurde, aber die alte Logik noch existiert
                    publikationTabLogic.handleLanguageChange(event.target.value);
                }
            } else if (event.target.id === 'publication-bf-metric-select') {
                 if (typeof state !== 'undefined' && typeof state.setCurrentPublikationBruteForceMetric === 'function' && mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                    const newMetric = event.target.value;
                    if (state.setCurrentPublikationBruteForceMetric(newMetric)){
                        mainAppInterface.refreshCurrentTab();
                    }
                } else if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.handleBruteForceMetricChange === 'function') {
                    // Fallback
                    publikationTabLogic.handleBruteForceMetricChange(event.target.value);
                }
            }
        });

        // Event Listener für Klicks (Navigation und Export-Button)
        tabPane.addEventListener('click', (event) => {
            const navLink = event.target.closest('#publication-sections-nav .list-group-item-action');
            if (navLink && navLink.dataset.sectionId) {
                event.preventDefault();
                if (!navLink.classList.contains('disabled') && !navLink.classList.contains('active')) {
                     if (typeof state !== 'undefined' && typeof state.setCurrentPublikationSection === 'function' && mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                        const sectionId = navLink.dataset.sectionId;
                        if(state.setCurrentPublikationSection(sectionId)){
                            mainAppInterface.refreshCurrentTab();
                             const contentArea = document.getElementById('publikation-content-area');
                             if (contentArea) contentArea.scrollTop = 0;
                        }
                    } else if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.handleSectionChange === 'function'){
                        // Fallback
                        publikationTabLogic.handleSectionChange(navLink.dataset.sectionId);
                    }
                }
            }

            const exportAllButton = event.target.closest('#btn-export-publication-md-all');
            if (exportAllButton) {
                handleExportAllMarkdown();
            }
        });

        // Globale Event Listener für Datenänderungen
        document.addEventListener('kollektivChanged', handleDataOrCriteriaChangeForPublication);
        document.addEventListener('t2CriteriaApplied', handleDataOrCriteriaChangeForPublication);

        // Observer für Tab-Aktivierung
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActiveNow = tabPane.classList.contains('active') && tabPane.classList.contains('show');
                    const wasActivePreviously = mutation.oldValue?.includes('active show');
                     if (isActiveNow && !wasActivePreviously) {
                        if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refresh === 'function') {
                           publikationTabLogic.refresh();
                        }
                    }
                }
            }
        });
        observer.observe(tabPane, { attributes: true, attributeOldValue: true });
    }

    function handleDataOrCriteriaChangeForPublication() {
        const publikationTabPane = document.getElementById('publikation-tab-pane');
        if (publikationTabPane && publikationTabPane.classList.contains('active') && publikationTabPane.classList.contains('show')) {
            if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refresh === 'function') {
                publikationTabLogic.refresh();
            }
        } else if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.handleGlobalDataChange === 'function') {
            // Sicherstellen, dass das Modul initialisiert ist, bevor handleGlobalDataChange aufgerufen wird
            // Die viewRenderer.tabModulesConfig Überprüfung ist hier möglicherweise nicht direkt verfügbar/sinnvoll in diesem Modul
            // Es wird davon ausgegangen, dass wenn publikationTabLogic.handleGlobalDataChange existiert, das Modul geladen ist.
             if (typeof dynamicModuleLoader !== 'undefined' && dynamicModuleLoader.isModuleLoaded('publikationTabLogic')) {
                 const moduleInstance = dynamicModuleLoader.getLoadedModule('publikationTabLogic');
                 if (moduleInstance && typeof moduleInstance.handleGlobalDataChange === 'function' && moduleInstance.initialized !== false) { // explizite Prüfung auf nicht false
                    moduleInstance.handleGlobalDataChange();
                 } else if (moduleInstance && typeof moduleInstance.refresh === 'function'  && moduleInstance.initialized !== false) {
                    // Fallback falls handleGlobalDataChange nicht existiert aber refresh schon
                    moduleInstance.refresh();
                 }
             }
        }
    }

    return Object.freeze({
        setupPublicationTabEventHandlers
        // Die internen Handler sind nicht mehr direkt von außen zugänglich/nötig,
        // da setupPublicationTabEventHandlers jetzt die mainAppInterface für Callbacks nutzt.
    });

})();
