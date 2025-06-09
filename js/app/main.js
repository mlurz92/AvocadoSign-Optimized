document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof patientDataRaw !== 'undefined' && typeof appController !== 'undefined' && typeof appController.init === 'function') {
            appController.init(patientDataRaw);
        } else {
            throw new Error("Erforderliche Daten (`patientDataRaw`) oder der `appController` konnten nicht gefunden werden.");
        }
    } catch (error) {
        console.error("Fehler bei der Initialisierung der Anwendung in main.js:", error);
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = `<div class="alert alert-danger m-5"><strong>Anwendungsfehler:</strong> Die Anwendung konnte nicht gestartet werden. Details finden Sie in der Entwicklerkonsole.</div>`;
        }
    }
});
