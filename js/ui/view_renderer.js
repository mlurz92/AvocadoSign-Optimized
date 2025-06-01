const viewRenderer = (() => {
    let _mainAppInterface = null;
    let _isInitialized = false;

    function _initializeTabModules() {
        if (typeof dataTabLogic !== 'undefined' && typeof dataTabLogic.initialize === 'function' && !dataTabLogic.isInitialized()) {
            dataTabLogic.initialize(_mainAppInterface);
        }
        if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.initialize === 'function' && !auswertungTabLogic.isInitialized()) {
            auswertungTabLogic.initialize(_mainAppInterface);
        }
        if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.initialize === 'function' && !statistikTabLogic.isInitialized()) {
            statistikTabLogic.initialize(_mainAppInterface);
        }
        if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.initialize === 'function' && !praesentationTabLogic.isInitialized()) {
            praesentationTabLogic.initialize(_mainAppInterface);
        }
        if (typeof publicationTabLogic !== 'undefined' && typeof publicationTabLogic.initialize === 'function' && !publicationTabLogic.isInitialized()) {
            publicationTabLogic.initialize(_mainAppInterface);
        }
        if (typeof exportTabLogic !== 'undefined' && typeof exportTabLogic.initialize === 'function' && !exportTabLogic.isInitialized()) {
            exportTabLogic.initialize(_mainAppInterface);
        }
    }

    function initializeViewRenderer(appInterface) {
        if (_isInitialized) return;
        _mainAppInterface = appInterface;
        _initializeTabModules();
        _isInitialized = true;
    }

    function _clearTabContent(tabId) {
        const tabPane = document.getElementById(`${tabId}-pane`);
        if (tabPane) {
            const contentAreaId = APP_CONFIG.TAB_CONTENT_AREAS[tabId];
            const contentArea = contentAreaId ? tabPane.querySelector(`#${contentAreaId}`) : tabPane;
            if (contentArea) {
                contentArea.innerHTML = `<div class="d-flex justify-content-center align-items-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalte...</span></div></div>`;
            } else {
                 tabPane.innerHTML = `<div class="d-flex justify-content-center align-items-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalte...</span></div></div>`;
            }
        }
    }

    function _renderDatenTab(data, stateSnapshot) {
        if (typeof dataTabLogic !== 'undefined' && typeof dataTabLogic.initializeTab === 'function') {
            dataTabLogic.initializeTab(data, stateSnapshot.datenSortState);
        } else {
            console.error("dataTabLogic oder dataTabLogic.initializeTab ist nicht definiert.");
            _showRenderError('daten-tab');
        }
    }

    function _renderAuswertungTab(data, stateSnapshot) {
        if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.initializeTab === 'function') {
            const currentKollektivBruteForceData = stateSnapshot.bruteForceResults ? stateSnapshot.bruteForceResults[stateSnapshot.currentKollektiv] : null;
            auswertungTabLogic.initializeTab(
                data,
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.auswertungSortState,
                stateSnapshot.bruteForceState,
                currentKollektivBruteForceData,
                typeof bruteForceManager !== 'undefined' ? bruteForceManager.isWorkerAvailable() : false
            );
        } else {
            console.error("auswertungTabLogic oder auswertungTabLogic.initializeTab ist nicht definiert.");
            _showRenderError('auswertung-tab');
        }
    }

    function _renderStatistikTab(data, stateSnapshot) {
        if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.initializeTab === 'function') {
            statistikTabLogic.initializeTab(
                data, // Hier werden die globalen Rohdaten übergeben, die Tab-Logik filtert dann
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.statsLayout,
                stateSnapshot.statsKollektiv1,
                stateSnapshot.statsKollektiv2
            );
        } else {
            console.error("statistikTabLogic oder statistikTabLogic.initializeTab ist nicht definiert.");
            _showRenderError('statistik-tab');
        }
    }

    function _renderPraesentationTab(data, stateSnapshot) {
         if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.initializeTab === 'function') {
            praesentationTabLogic.initializeTab(
                data, // Hier werden die globalen Rohdaten übergeben
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.praesentationView,
                stateSnapshot.praesentationStudyId
            );
        } else {
            console.error("praesentationTabLogic oder praesentationTabLogic.initializeTab ist nicht definiert.");
            _showRenderError('praesentation-tab');
        }
    }

    function _renderPublikationTab(data, stateSnapshot) {
        if (typeof publicationTabLogic !== 'undefined' && typeof publicationTabLogic.initializeTab === 'function') {
             publicationTabLogic.initializeTab(
                data, // Globale Rohdaten
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.bruteForceResults,
                stateSnapshot.publikationLang,
                stateSnapshot.publikationSection,
                stateSnapshot.publikationBruteForceMetric
            );
        } else {
            console.error("publicationTabLogic oder publicationTabLogic.initializeTab ist nicht definiert.");
            _showRenderError('publikation-tab');
        }
    }

    function _renderExportTab(data, stateSnapshot) {
        if (typeof exportTabLogic !== 'undefined' && typeof exportTabLogic.initializeTab === 'function') {
             exportTabLogic.initializeTab(
                data, // Globale Rohdaten
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.bruteForceResults,
                studyT2CriteriaManager.getAllStudyCriteriaSets(true)
            );
        } else {
            console.error("exportTabLogic oder exportTabLogic.initializeTab ist nicht definiert.");
            _showRenderError('export-tab');
        }
    }
    
    function _showRenderError(tabId) {
        const tabPane = document.getElementById(`${tabId}-pane`);
        if(tabPane) {
            const contentAreaId = APP_CONFIG.TAB_CONTENT_AREAS[tabId];
            const contentArea = contentAreaId ? tabPane.querySelector(`#${contentAreaId}`) : tabPane;
            if(contentArea) {
                 contentArea.innerHTML = `<div class="alert alert-danger m-3" role="alert">Fehler beim Rendern des Tabs '${tabId}'. Die benötigte Logik konnte nicht geladen werden. Bitte überprüfen Sie die Browser-Konsole.</div>`;
            } else {
                 tabPane.innerHTML = `<div class="alert alert-danger m-3" role="alert">Fehler beim Rendern des Tabs '${tabId}'. Die benötigte Logik konnte nicht geladen werden. Bitte überprüfen Sie die Browser-Konsole.</div>`;
            }
        }
    }


    function renderTabContent(tabId, data, stateSnapshot) {
        if (!_isInitialized && _mainAppInterface) {
             _initializeTabModules(); // Stellen sicher, dass Module initialisiert sind, falls viewRenderer vor mainAppInterface initialisiert wurde
        } else if (!_mainAppInterface) {
            console.error("ViewRenderer nicht initialisiert. MainAppInterface fehlt.");
            _showRenderError(tabId);
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.hideLoadingOverlay === 'function') mainAppInterface.hideLoadingOverlay();
            return;
        }

        _clearTabContent(tabId);

        // Verzögere das eigentliche Rendern leicht, um dem Browser Zeit zu geben, den Lade-Spinner anzuzeigen
        // und um sicherzustellen, dass alle DOM-Manipulationen aus dem clear abgeschlossen sind.
        setTimeout(() => {
            try {
                // UI-Hilfsfunktionen aufrufen, um die globalen Bedienelemente des Tabs zu aktualisieren
                ui_helpers.updateKollektivSelectorsForTab(tabId, stateSnapshot.currentKollektiv, stateSnapshot.statsLayout, stateSnapshot.statsKollektiv1, stateSnapshot.statsKollektiv2);
                ui_helpers.updateSortIconsForTab(tabId, stateSnapshot.datenSortState, stateSnapshot.auswertungSortState);
                ui_helpers.updateTabSpecificControls(tabId, stateSnapshot);


                switch (tabId) {
                    case 'daten-tab':
                        _renderDatenTab(data, stateSnapshot);
                        break;
                    case 'auswertung-tab':
                        _renderAuswertungTab(data, stateSnapshot);
                        break;
                    case 'statistik-tab':
                        _renderStatistikTab(stateSnapshot.rawData, stateSnapshot); // Statistik benötigt Zugriff auf alle Rohdaten für Kollektivfilterung
                        break;
                    case 'praesentation-tab':
                        _renderPraesentationTab(stateSnapshot.rawData, stateSnapshot); // Präsentation benötigt Zugriff auf alle Rohdaten
                        break;
                    case 'publikation-tab':
                         _renderPublikationTab(stateSnapshot.rawData, stateSnapshot); // Publikation benötigt Zugriff auf alle Rohdaten
                        break;
                    case 'export-tab':
                         _renderExportTab(stateSnapshot.rawData, stateSnapshot); // Export benötigt Zugriff auf alle Rohdaten
                        break;
                    default:
                        console.warn(`Unbekannte Tab-ID: ${tabId}`);
                        const tabPane = document.getElementById(`${tabId}-pane`);
                        if (tabPane) tabPane.innerHTML = `<p class="text-warning p-3">Unbekannter Tab-Typ: '${tabId}'. Inhalt kann nicht gerendert werden.</p>`;
                }
                 if (stateSnapshot.forceTabRefresh && typeof state !== 'undefined' && typeof state.setForceTabRefresh === 'function') {
                    state.setForceTabRefresh(false); // Reset des Flags nach dem Rendern
                }

            } catch (error) {
                console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
                 _showRenderError(tabId);
            } finally {
                if (_mainAppInterface && typeof _mainAppInterface.hideLoadingOverlay === 'function') {
                    _mainAppInterface.hideLoadingOverlay();
                }
            }
        }, APP_CONFIG.UI_SETTINGS.RENDER_DELAY_MS || 50);
    }

    return Object.freeze({
        initialize: initializeViewRenderer,
        renderTabContent
    });
})();
