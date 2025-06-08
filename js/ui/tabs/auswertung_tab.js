// js/ui/tabs/auswertung_tab.js

// Dieses Modul ist für die Steuerung der Ansicht und des Zustands des Auswertung-Tabs zuständig.
// Es interagiert mit der AuswertungViewLogic, um die Benutzeroberfläche zu aktualisieren.
const AuswertungTab = (() => {

    /**
     * Lädt den Auswertung-Tab und aktualisiert dessen Ansicht.
     * Diese Funktion wird vom UIManager aufgerufen, wenn der Auswertung-Tab aktiviert wird.
     */
    function load() {
        // Stellen Sie sicher, dass die AuswertungViewLogicInstance global verfügbar ist.
        // Diese sollte bereits durch das Laden von js/ui/view_logic/auswertung_tab.js initialisiert sein.
        if (typeof AuswertungViewLogicInstance !== 'undefined') {
            AuswertungViewLogicInstance.updateView();
        } else {
            console.error("AuswertungViewLogicInstance ist nicht definiert. Auswertung-Tab kann nicht geladen werden.");
        }
    }

    // Exponiert nur die "load"-Funktion nach außen, da der Rest der Logik
    // in AuswertungViewLogic (js/ui/view_logic/auswertung_tab.js) gekapselt ist.
    return Object.freeze({
        load: load
    });

})();
