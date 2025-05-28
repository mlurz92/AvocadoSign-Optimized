const viewRenderer = (() => {
    const tabModulesConfig = {
        'daten-tab-pane': { name: 'datenTabLogic', path: 'view_logic/data_tab_logic.js', initialized: false, module: null },
        'auswertung-tab-pane': { name: 'auswertungTabLogic', path: 'view_logic/auswertung_tab_logic.js', initialized: false, module: null },
        'statistik-tab-pane': { name: 'statistikTabLogic', path: 'view_logic/statistik_tab_logic.js', initialized: false, module: null },
        'praesentation-tab-pane': { name: 'praesentationTabLogic', path: 'view_logic/praesentation_tab_logic.js', initialized: false, module: null },
        'publikation-tab-pane': { name: 'publikationTabLogic', path: 'view_logic/publikation_tab_logic.js', initialized: false, module: null },
        'export-tab-pane': { name: 'exportTabLogic', path: 'view_logic/export_tab_logic.js', initialized: false, module: null }
    };

    async function loadAndInitializeModule(tabId) {
        const moduleConfig = tabModulesConfig[tabId];
        if (!moduleConfig) {
            console.error(`Keine Modulkonfiguration für Tab-ID '${tabId}' gefunden.`);
            ui_helpers.showLoadingSpinner(tabId, `Fehler: Konfiguration für '${tabId}' fehlt.`);
            return null;
        }

        if (moduleConfig.module && moduleConfig.initialized) {
            return moduleConfig.module;
        }

        ui_helpers.showLoadingSpinner(tabId, `Lade Modul für '${tabId.replace('-tab-pane','')}'-Tab...`);

        try {
            if (!moduleConfig.module) {
                moduleConfig.module = await dynamicModuleLoader.loadModule(moduleConfig.name, moduleConfig.path);
            }

            if (moduleConfig.module && typeof moduleConfig.module.init === 'function' && !moduleConfig.initialized) {
                await moduleConfig.module.init();
                moduleConfig.initialized = true;
                ui_helpers.hideLoadingSpinner(tabId);
            } else if (moduleConfig.module && moduleConfig.initialized && typeof moduleConfig.module.render === 'function') {
                 await moduleConfig.module.render();
                 ui_helpers.hideLoadingSpinner(tabId);
            } else if (!moduleConfig.module) {
                throw new Error(`Modul '${moduleConfig.name}' konnte nicht geladen oder gefunden werden.`);
            }
            return moduleConfig.module;
        } catch (error) {
            console.error(`Fehler beim Laden oder Initialisieren des Moduls für Tab '${tabId}':`, error);
            const container = document.getElementById(tabId);
            if (container) {
                container.innerHTML = `<div class="alert alert-danger m-3" role="alert">Fehler beim Laden des Tabs '${tabId.replace('-tab-pane','')}'. Details in der Konsole.</div>`;
            }
            ui_helpers.showToast(`Fehler beim Laden des Tabs '${tabId.replace('-tab-pane','')}'.`, 'danger');
            return null;
        }
    }

    async function renderView(tabId) {
        if (!tabId) return;

        ui_helpers.destroyTooltips(document.getElementById(tabId));
        const module = await loadAndInitializeModule(tabId);

        if (module) {
            if (moduleConfig.initialized && typeof module.render === 'function') {
                 await module.render();
            } else if (moduleConfig.initialized && typeof module.refresh === 'function') {
                 await module.refresh();
            }
            ui_helpers.initTooltips(document.getElementById(tabId));
        }
    }

    async function refreshView(tabId) {
        const moduleConfig = tabModulesConfig[tabId];
        if (moduleConfig && moduleConfig.initialized && moduleConfig.module) {
            if (typeof moduleConfig.module.refresh === 'function') {
                ui_helpers.destroyTooltips(document.getElementById(tabId));
                await moduleConfig.module.refresh();
                ui_helpers.initTooltips(document.getElementById(tabId));
            } else if (typeof moduleConfig.module.render === 'function') {
                ui_helpers.destroyTooltips(document.getElementById(tabId));
                await moduleConfig.module.render();
                 ui_helpers.initTooltips(document.getElementById(tabId));
            }
        }
    }


    async function updateAllViews(currentTabId = null) {
        for (const tabId in tabModulesConfig) {
            if (Object.prototype.hasOwnProperty.call(tabModulesConfig, tabId)) {
                const moduleConfig = tabModulesConfig[tabId];
                if (tabId !== currentTabId && moduleConfig.initialized && moduleConfig.module) {
                    if (typeof moduleConfig.module.handleGlobalDataChange === 'function') {
                         await moduleConfig.module.handleGlobalDataChange();
                    } else if (typeof moduleConfig.module.refresh === 'function') {
                         await moduleConfig.module.refresh();
                    }
                }
            }
        }
    }

    return Object.freeze({
        renderView,
        refreshView,
        updateAllViews
    });
})();
