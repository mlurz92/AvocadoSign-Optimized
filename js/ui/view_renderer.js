const viewRenderer = (() => {
    let _mainAppInterface = null;
    let _isInitialized = false;

    function _initializeTabModules() {
        const tabLogics = [
            { name: 'dataTabLogic', module: typeof dataTabLogic !== 'undefined' ? dataTabLogic : null },
            { name: 'auswertungTabLogic', module: typeof auswertungTabLogic !== 'undefined' ? auswertungTabLogic : null },
            { name: 'statistikTabLogic', module: typeof statistikTabLogic !== 'undefined' ? statistikTabLogic : null },
            { name: 'praesentationTabLogic', module: typeof praesentationTabLogic !== 'undefined' ? praesentationTabLogic : null },
            { name: 'publicationTabLogic', module: typeof publicationTabLogic !== 'undefined' ? publicationTabLogic : null },
            { name: 'exportTabLogic', module: typeof exportTabLogic !== 'undefined' ? exportTabLogic : null }
        ];

        tabLogics.forEach(item => {
            if (item.module && typeof item.module.initialize === 'function') {
                if (typeof item.module.isInitialized !== 'function' || !item.module.isInitialized()) {
                    item.module.initialize(_mainAppInterface);
                }
            } else if (!item.module) {
                console.warn(`ViewRenderer: Modul ${item.name} ist nicht definiert.`);
            }
        });
    }

    function initializeViewRenderer(appInterface) {
        if (_isInitialized) {
            console.warn("ViewRenderer bereits initialisiert.");
            return;
        }
        if (!appInterface) {
            console.error("ViewRenderer Initialisierung fehlgeschlagen: Kein mainAppInterface bereitgestellt.");
            return;
        }
        _mainAppInterface = appInterface;
        _initializeTabModules();
        _isInitialized = true;
        console.log("ViewRenderer initialisiert.");
    }

    function _clearTabContent(tabId) {
        const tabPane = document.getElementById(`${tabId}-pane`);
        const loadingSpinner = `<div class="d-flex justify-content-center align-items-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalte...</span></div></div>`;
        if (tabPane) {
            let contentAreaId;
            if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.TAB_CONTENT_AREAS && APP_CONFIG.TAB_CONTENT_AREAS[tabId]) {
                 contentAreaId = APP_CONFIG.TAB_CONTENT_AREAS[tabId];
            } else {
                console.warn(`_clearTabContent: APP_CONFIG.TAB_CONTENT_AREAS nicht definiert oder Tab-ID '${tabId}' fehlt. Versuche, Pane direkt zu leeren.`);
                tabPane.innerHTML = loadingSpinner; // Fallback, wenn Konfiguration fehlt
                return;
            }
            
            const contentArea = tabPane.querySelector(`#${contentAreaId}`);
            if (contentArea) {
                contentArea.innerHTML = loadingSpinner;
            } else {
                console.warn(`_clearTabContent: Inhaltsbereich #${contentAreaId} für Tab ${tabId} nicht im Pane gefunden. Leere das gesamte Pane.`);
                tabPane.innerHTML = loadingSpinner;
            }
        } else {
            console.warn(`_clearTabContent: Tab-Pane für ${tabId} nicht gefunden.`);
        }
    }

    function _showRenderError(tabId, specificError) {
        const tabPane = document.getElementById(`${tabId}-pane`);
        const errorMessage = specificError ? specificError.message : 'Unbekannter Fehler.';
        const errorStack = specificError ? `<pre class="small mt-2">${specificError.stack || 'Kein Stacktrace verfügbar.'}</pre>` : '';
        const fullErrorMessage = `<div class="alert alert-danger m-3" role="alert"><strong>Fehler beim Rendern des Tabs '${tabId}'!</strong><br>${errorMessage}${errorStack}</div>`;

        if (tabPane) {
            let contentAreaId;
            if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.TAB_CONTENT_AREAS && APP_CONFIG.TAB_CONTENT_AREAS[tabId]) {
                 contentAreaId = APP_CONFIG.TAB_CONTENT_AREAS[tabId];
            } else {
                 console.warn(`_showRenderError: APP_CONFIG.TAB_CONTENT_AREAS nicht definiert oder Tab-ID '${tabId}' fehlt. Zeige Fehler direkt im Pane.`);
                 tabPane.innerHTML = fullErrorMessage; // Fallback
                 return;
            }

            const contentArea = tabPane.querySelector(`#${contentAreaId}`);
            if (contentArea) {
                contentArea.innerHTML = fullErrorMessage;
            } else {
                console.warn(`_showRenderError: Inhaltsbereich #${contentAreaId} für Tab ${tabId} nicht im Pane gefunden. Zeige Fehler im gesamten Pane.`);
                tabPane.innerHTML = fullErrorMessage;
            }
        } else {
             console.error(`Schwerwiegender Renderfehler: Tab-Pane für ${tabId} nicht gefunden, um Fehler anzuzeigen.`);
        }
    }


    function _renderDatenTab(data, stateSnapshot) {
        if (typeof dataTabLogic !== 'undefined' && typeof dataTabLogic.initializeTab === 'function') {
            dataTabLogic.initializeTab(data, stateSnapshot.datenSortState);
        } else {
            const error = new Error("dataTabLogic oder dataTabLogic.initializeTab ist nicht definiert.");
            console.error(error.message);
            _showRenderError('daten-tab', error);
        }
    }

    function _renderAuswertungTab(data, stateSnapshot) {
        if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.initializeTab === 'function') {
            const currentKollektivBruteForceData = (stateSnapshot.bruteForceResults && stateSnapshot.bruteForceResults[stateSnapshot.currentKollektiv])
                                                 ? stateSnapshot.bruteForceResults[stateSnapshot.currentKollektiv]
                                                 : null;
            const workerAvailable = typeof bruteForceManager !== 'undefined' && typeof bruteForceManager.isWorkerAvailable === 'function'
                                    ? bruteForceManager.isWorkerAvailable()
                                    : false;
            auswertungTabLogic.initializeTab(
                data,
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.auswertungSortState,
                stateSnapshot.bruteForceState,
                currentKollektivBruteForceData,
                workerAvailable
            );
        } else {
            const error = new Error("auswertungTabLogic oder auswertungTabLogic.initializeTab ist nicht definiert.");
            console.error(error.message);
            _showRenderError('auswertung-tab', error);
        }
    }

    function _renderStatistikTab(rawData, stateSnapshot) {
        if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.initializeTab === 'function') {
            statistikTabLogic.initializeTab(
                rawData,
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.statsLayout,
                stateSnapshot.statsKollektiv1,
                stateSnapshot.statsKollektiv2
            );
        } else {
            const error = new Error("statistikTabLogic oder statistikTabLogic.initializeTab ist nicht definiert.");
            console.error(error.message);
            _showRenderError('statistik-tab', error);
        }
    }

    function _renderPraesentationTab(rawData, stateSnapshot) {
         if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.initializeTab === 'function') {
            praesentationTabLogic.initializeTab(
                rawData,
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.praesentationView,
                stateSnapshot.praesentationStudyId
            );
        } else {
            const error = new Error("praesentationTabLogic oder praesentationTabLogic.initializeTab ist nicht definiert.");
            console.error(error.message);
            _showRenderError('praesentation-tab', error);
        }
    }

    function _renderPublikationTab(rawData, stateSnapshot) {
        if (typeof publicationTabLogic !== 'undefined' && typeof publicationTabLogic.initializeTab === 'function') {
             publicationTabLogic.initializeTab(
                rawData,
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.bruteForceResults,
                stateSnapshot.publikationLang,
                stateSnapshot.publikationSection,
                stateSnapshot.publikationBruteForceMetric
            );
        } else {
            const error = new Error("publicationTabLogic oder publicationTabLogic.initializeTab ist nicht definiert.");
            console.error(error.message);
            _showRenderError('publikation-tab', error);
        }
    }

    function _renderExportTab(rawData, stateSnapshot) {
        if (typeof exportTabLogic !== 'undefined' && typeof exportTabLogic.initializeTab === 'function') {
             const allStudySets = typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.getAllStudyCriteriaSets === 'function'
                                ? studyT2CriteriaManager.getAllStudyCriteriaSets(true)
                                : [];
             exportTabLogic.initializeTab(
                rawData,
                stateSnapshot.currentKollektiv,
                stateSnapshot.appliedT2Criteria,
                stateSnapshot.appliedT2Logic,
                stateSnapshot.bruteForceResults,
                allStudySets
            );
        } else {
            const error = new Error("exportTabLogic oder exportTabLogic.initializeTab ist nicht definiert.");
            console.error(error.message);
            _showRenderError('export-tab', error);
        }
    }

    function renderTabContent(tabId, data, stateSnapshot) {
        if (!_isInitialized) {
            if (_mainAppInterface) {
                _initializeTabModules();
            } else {
                console.error("ViewRenderer nicht initialisiert. MainAppInterface fehlt beim Aufruf von renderTabContent.");
                _showRenderError(tabId, new Error("ViewRenderer ist nicht initialisiert."));
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.hideLoadingOverlay === 'function') {
                    mainAppInterface.hideLoadingOverlay();
                } else if (_mainAppInterface && typeof _mainAppInterface.hideLoadingOverlay === 'function') {
                    _mainAppInterface.hideLoadingOverlay();
                }
                return;
            }
        }

        _clearTabContent(tabId);
        const renderDelay = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.UI_SETTINGS && typeof APP_CONFIG.UI_SETTINGS.RENDER_DELAY_MS === 'number')
                            ? APP_CONFIG.UI_SETTINGS.RENDER_DELAY_MS
                            : 50;

        setTimeout(() => {
            try {
                if (typeof ui_helpers !== 'undefined') {
                    ui_helpers.updateKollektivSelectorsForTab(tabId, stateSnapshot.currentKollektiv, stateSnapshot.statsLayout, stateSnapshot.statsKollektiv1, stateSnapshot.statsKollektiv2);
                    ui_helpers.updateSortIconsForTab(tabId, stateSnapshot.datenSortState, stateSnapshot.auswertungSortState);
                    ui_helpers.updateTabSpecificControls(tabId, stateSnapshot);
                } else {
                    console.warn("ui_helpers nicht verfügbar für UI Updates vor dem Tab-Rendern.");
                }

                switch (tabId) {
                    case 'daten-tab':
                        _renderDatenTab(data, stateSnapshot);
                        break;
                    case 'auswertung-tab':
                        _renderAuswertungTab(data, stateSnapshot);
                        break;
                    case 'statistik-tab':
                        _renderStatistikTab(stateSnapshot.rawData, stateSnapshot);
                        break;
                    case 'praesentation-tab':
                        _renderPraesentationTab(stateSnapshot.rawData, stateSnapshot);
                        break;
                    case 'publikation-tab':
                         _renderPublikationTab(stateSnapshot.rawData, stateSnapshot);
                        break;
                    case 'export-tab':
                         _renderExportTab(stateSnapshot.rawData, stateSnapshot);
                        break;
                    default:
                        const unknownTabError = new Error(`Unbekannter Tab-Typ: '${tabId}'. Inhalt kann nicht gerendert werden.`);
                        console.warn(unknownTabError.message);
                        _showRenderError(tabId, unknownTabError);
                }

                if (stateSnapshot.forceTabRefresh && typeof state !== 'undefined' && typeof state.clearForceTabRefresh === 'function') {
                    state.clearForceTabRefresh();
                }

            } catch (error) {
                console.error(`Fehler beim Rendern von Tab ${tabId} (innerhalb setTimeout):`, error);
                _showRenderError(tabId, error);
            } finally {
                if (_mainAppInterface && typeof _mainAppInterface.hideLoadingOverlay === 'function') {
                    _mainAppInterface.hideLoadingOverlay();
                } else {
                    const loadingOverlay = document.getElementById('loading-overlay');
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                }
            }
        }, renderDelay);
    }

    return Object.freeze({
        initialize: initializeViewRenderer,
        renderTabContent
    });
})();
