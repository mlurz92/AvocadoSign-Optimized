// js/ui/tabs/export_tab.js

// Dieses Modul ist für die Steuerung der Ansicht und des Zustands des Export-Tabs zuständig.
// Es interagiert mit der ExportViewLogic, um die Benutzeroberfläche zu aktualisieren.
const ExportTab = (() => {

    /**
     * Lädt den Export-Tab und aktualisiert dessen Ansicht.
     * Diese Funktion wird vom UIManager aufgerufen, wenn der Export-Tab aktiviert wird.
     */
    function load() {
        // Stellen Sie sicher, dass die ExportViewLogicInstance global verfügbar ist.
        // Diese sollte bereits durch das Laden von js/ui/view_logic/export_tab.js initialisiert sein.
        if (typeof ExportViewLogicInstance !== 'undefined') {
            ExportViewLogicInstance.updateView();
        } else {
            console.error("ExportViewLogicInstance ist nicht definiert. Export-Tab kann nicht geladen werden.");
        }
    }

    // Exponiert nur die "load"-Funktion nach außen, da der Rest der Logik
    // in ExportViewLogic (js/ui/view_logic/export_tab.js) gekapselt ist.
    return Object.freeze({
        load: load
    });

})();
