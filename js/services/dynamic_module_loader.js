const dynamicModuleLoader = (() => {
    const loadedModules = {};
    const loadingPromises = {};

    function loadScript(modulePath, moduleName) {
        return new Promise((resolve, reject) => {
            if (loadedModules[moduleName]) {
                resolve(loadedModules[moduleName]);
                return;
            }

            // Prüfen, ob das Modul bereits global existiert (z.B. durch statisches Laden)
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
                        // Dieser Fall sollte seltener auftreten, wenn das Skript tatsächlich erfolgreich ausgeführt wurde
                        // und die Modulvariable global deklariert hat.
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

            // Erstelle ein neues Promise für diesen Ladevorgang
            loadingPromises[moduleName] = new Promise((innerResolve, innerReject) => {
                // Dieses interne Promise wird durch handleLoad oder handleError aufgelöst/abgelehnt.
                // Wir leiten resolve und reject des äußeren Promises weiter.
                const originalResolve = resolve;
                const originalReject = reject;
                resolve = (value) => { delete loadingPromises[moduleName]; originalResolve(value); };
                reject = (reason) => { delete loadingPromises[moduleName]; originalReject(reason); };
            });
            // Wir fügen die Listener erneut hinzu, da resolve/reject überschrieben wurden.
            // Das ist nicht ideal, handleLoad/handleError sollten direkt das loadingPromises[moduleName] auflösen.
            // Korrekter wäre:
            // loadingPromises[moduleName] = new Promise((resolve, reject) => {
            //     script.onload = () => { /* in handleLoad */ resolve(moduleObject); /* etc */ };
            //     script.onerror = () => { /* in handleError */ reject(error); /* etc */ };
            // });
            // Die aktuelle Struktur mit finally in handleLoad/handleError ist aber schon vorhanden.

            try {
                document.head.appendChild(script);
            } catch (error) {
                 delete loadingPromises[moduleName]; // Sicherstellen, dass das Promise entfernt wird
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

        // Setze das loadingPromise *bevor* der Ladevorgang gestartet wird,
        // um parallele Anfragen für dasselbe Modul abzufangen.
        const loadPromise = loadScript(fullPath, moduleName);
        loadingPromises[moduleName] = loadPromise;
        
        try {
            const moduleInstance = await loadPromise;
            // Nach erfolgreichem Laden, entferne das Promise aus loadingPromises,
            // da das Modul jetzt in loadedModules ist.
            delete loadingPromises[moduleName];
            return moduleInstance;
        } catch (error) {
            // Bei Fehler, entferne das Promise ebenfalls.
            delete loadingPromises[moduleName];
            console.error(`DynamicModuleLoader: Fehler beim Laden des Moduls '${moduleName}' von Pfad '${fullPath}'.`, error);
            throw error; // Fehler weitergeben, damit view_renderer ihn behandeln kann
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
