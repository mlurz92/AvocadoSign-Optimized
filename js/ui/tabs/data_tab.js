// js/ui/tabs/data_tab.js

// Dieses Modul ist für die Steuerung der Ansicht und des Zustands des Daten-Tabs zuständig.
// Es interagiert mit der DataViewLogic, um die Benutzeroberfläche zu aktualisieren.
const DataTab = (() => {

    /**
     * Lädt den Daten-Tab und aktualisiert dessen Ansicht.
     * Diese Funktion wird vom UIManager aufgerufen, wenn der Daten-Tab aktiviert wird.
     */
    function load() {
        // Stellen Sie sicher, dass die DataViewLogicInstance global verfügbar ist.
        // Diese sollte bereits durch das Laden von js/ui/view_logic/data_tab.js initialisiert sein.
        if (typeof DataViewLogicInstance !== 'undefined') {
            DataViewLogicInstance.updateView();
        } else {
            console.error("DataViewLogicInstance ist nicht definiert. Daten-Tab kann nicht geladen werden.");
        }
    }

    // Exponiert nur die "load"-Funktion nach außen, da der Rest der Logik
    // in DataViewLogic (js/ui/view_logic/data_tab.js) gekapselt ist.
    return Object.freeze({
        load: load
    });

})();
