// js/ui/tabs/praesentation_tab.js

// Dieses Modul ist für die Steuerung der Ansicht und des Zustands des Präsentation-Tabs zuständig.
// Es interagiert mit der PraesentationViewLogic, um die Benutzeroberfläche zu aktualisieren.
const PraesentationTab = (() => {

    /**
     * Lädt den Präsentation-Tab und aktualisiert dessen Ansicht.
     * Diese Funktion wird vom UIManager aufgerufen, wenn der Präsentation-Tab aktiviert wird.
     */
    function load() {
        // Stellen Sie sicher, dass die PraesentationViewLogicInstance global verfügbar ist.
        // Diese sollte bereits durch das Laden von js/ui/view_logic/praesentation_tab.js initialisiert sein.
        if (typeof PraesentationViewLogicInstance !== 'undefined') {
            PraesentationViewLogicInstance.updateView();
        } else {
            console.error("PraesentationViewLogicInstance ist nicht definiert. Präsentation-Tab kann nicht geladen werden.");
        }
    }

    // Exponiert nur die "load"-Funktion nach außen, da der Rest der Logik
    // in PraesentationViewLogic (js/ui/view_logic/praesentation_tab.js) gekapselt ist.
    return Object.freeze({
        load: load
    });

})();
