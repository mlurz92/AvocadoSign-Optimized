// js/ui/tabs/publikation_tab.js

// Dieses Modul ist für die Steuerung der Ansicht und des Zustands des Publikation-Tabs zuständig.
// Es interagiert mit der PublikationViewLogic, um die Benutzeroberfläche zu aktualisieren.
const PublikationTab = (() => {

    /**
     * Lädt den Publikation-Tab und aktualisiert dessen Ansicht.
     * Diese Funktion wird vom UIManager aufgerufen, wenn der Publikation-Tab aktiviert wird.
     */
    function load() {
        // Stellen Sie sicher, dass die PublikationViewLogicInstance global verfügbar ist.
        // Diese sollte bereits durch das Laden von js/ui/view_logic/publikation_tab.js initialisiert sein.
        if (typeof PublikationViewLogicInstance !== 'undefined') {
            PublikationViewLogicInstance.updateAllPublicationData(); // Ruft die Hauptaktualisierungsfunktion auf
        } else {
            console.error("PublikationViewLogicInstance ist nicht definiert. Publikation-Tab kann nicht geladen werden.");
        }
    }

    // Exponiert nur die "load"-Funktion nach außen, da der Rest der Logik
    // in PublikationViewLogic (js/ui/view_logic/publikation_tab.js) gekapselt ist.
    return Object.freeze({
        load: load
    });

})();
