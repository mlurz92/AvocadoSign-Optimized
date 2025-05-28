const dynamicModuleLoader = (() => {
    const loadedModules = {};
    const loadingPromises = {};

    function loadScript(modulePath, moduleName) {
        return new Promise((resolve, reject) => {
            if (loadedModules[moduleName]) {
                resolve(loadedModules[moduleName]);
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
                    const moduleObject = window[moduleName] || self[moduleName];
                    if (moduleObject) {
                        loadedModules[moduleName] = moduleObject;
                        resolve(moduleObject);
                    } else {
                         reject(new Error(`Modul '${moduleName}' wurde geladen, aber nicht im globalen Scope gefunden.`));
                    }
                } catch (e) {
                     reject(new Error(`Fehler beim Zugriff auf Modul '${moduleName}' nach dem Laden: ${e.message}`));
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
                reject(new Error(`Fehler beim Laden des Moduls '${moduleName}' von Pfad '${modulePath}'. Event: ${event.type}`));
            };

            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);

            loadingPromises[moduleName] = new Promise((innerResolve, innerReject) => {
                 script.addEventListener('load', () => innerResolve(window[moduleName] || self[moduleName]));
                 script.addEventListener('error', innerReject);
            });


            try {
                document.head.appendChild(script);
            } catch (error) {
                 delete loadingPromises[moduleName];
                 reject(new Error(`Fehler beim Anhängen des Skripts '${moduleName}' an den DOM: ${error.message}`));
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

        if (loadingPromises[moduleName]) {
            return loadingPromises[moduleName];
        }

        try {
            const moduleInstance = await loadScript(fullPath, moduleName);
            return moduleInstance;
        } catch (error) {
            console.error(`DynamicModuleLoader: Fehler beim Laden des Moduls '${moduleName}' (${fullPath}).`, error);
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
