const dynamicModuleLoader = (() => {
    const loadedModules = {};
    const loadingPromises = {};

    function loadScript(modulePath, moduleName) {
        return new Promise((resolve, reject) => {
            if (loadedModules[moduleName]) {
                resolve(loadedModules[moduleName]);
                return;
            }

            const preExistingModule = window[moduleName] || (typeof self !== 'undefined' ? self[moduleName] : undefined);
            if (preExistingModule) {
                loadedModules[moduleName] = preExistingModule;
                resolve(preExistingModule);
                return;
            }

            if (loadingPromises[moduleName]) {
                loadingPromises[moduleName].then(resolve).catch(reject);
                return;
            }

            const script = document.createElement('script');
            script.src = modulePath;
            script.async = true;

            const handleLoad = () => {
                try {
                    const moduleObject = window[moduleName] || (typeof self !== 'undefined' ? self[moduleName] : undefined);
                    if (moduleObject) {
                        loadedModules[moduleName] = moduleObject;
                        resolve(moduleObject);
                    } else {
                        reject(new Error(`Modul '${moduleName}' wurde via Skript-Tag geladen, aber die Modulvariable ist nicht im globalen Scope (window/self) verfügbar. Überprüfen Sie das Skript '${modulePath}' auf interne Fehler oder korrekte Deklaration.`));
                    }
                } catch (e) {
                     reject(new Error(`Fehler beim Zugriff auf Modul '${moduleName}' nach dem Laden von '${modulePath}': ${e.message}`));
                } finally {
                    delete loadingPromises[moduleName];
                    script.removeEventListener('load', handleLoad);
                    script.removeEventListener('error', handleError);
                }
            };

            const handleError = (event) => {
                delete loadingPromises[moduleName];
                script.removeEventListener('load', handleLoad);
                script.removeEventListener('error', handleError);
                reject(new Error(`Fehler beim Laden des Skripts für Modul '${moduleName}' von Pfad '${modulePath}'. Event-Typ: ${event.type}. Überprüfen Sie, ob die Datei existiert und korrekt ausgeliefert wird (MIME-Typ).`));
            };

            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
            
            loadingPromises[moduleName] = new Promise((innerResolve, innerReject) => {
                const originalResolve = resolve;
                const originalReject = reject;
                resolve = (value) => { delete loadingPromises[moduleName]; originalResolve(value); };
                reject = (reason) => { delete loadingPromises[moduleName]; originalReject(reason); };
            });
            
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);

            try {
                document.head.appendChild(script);
            } catch (error) {
                 delete loadingPromises[moduleName]; 
                 reject(new Error(`Fehler beim Anhängen des Skripts '${moduleName}' ('${modulePath}') an den DOM: ${error.message}`));
            }
        });
    }

    async function loadModule(moduleName, relativePath) {
        if (typeof moduleName !== 'string' || moduleName.trim() === '') {
            return Promise.reject(new Error("Ungültiger Modulname angegeben."));
        }
        if (typeof relativePath !== 'string' || relativePath.trim() === '') {
            return Promise.reject(new Error(`Ungültiger relativer Pfad für Modul '${moduleName}' angegeben.`));
        }

        const basePath = APP_CONFIG.PATHS.DYNAMIC_MODULE_BASE_PATH || 'js/';
        const fullPath = `${basePath.endsWith('/') ? basePath : basePath + '/'}${relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}`;

        if (loadedModules[moduleName]) {
            return Promise.resolve(loadedModules[moduleName]);
        }
        
        const preExistingGlobal = window[moduleName] || (typeof self !== 'undefined' ? self[moduleName] : undefined);
        if (preExistingGlobal) {
            loadedModules[moduleName] = preExistingGlobal;
            return Promise.resolve(preExistingGlobal);
        }

        if (loadingPromises[moduleName]) {
            return loadingPromises[moduleName];
        }

        const loadPromise = loadScript(fullPath, moduleName);
        loadingPromises[moduleName] = loadPromise;
        
        try {
            const moduleInstance = await loadPromise;
            delete loadingPromises[moduleName];
            return moduleInstance;
        } catch (error) {
            delete loadingPromises[moduleName];
            console.error(`DynamicModuleLoader: Fehler beim Laden des Moduls '${moduleName}' von Pfad '${fullPath}'.`, error);
            throw error; 
        }
    }

    function isModuleLoaded(moduleName) {
        return !!loadedModules[moduleName];
    }

    function getLoadedModule(moduleName) {
        return loadedModules[moduleName] || null;
    }

    return Object.freeze({
        loadModule,
        isModuleLoaded,
        getLoadedModule
    });
})();
