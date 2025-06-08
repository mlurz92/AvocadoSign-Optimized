// js/ui/tabs/statistik_tab.js

// Dieses Modul ist für die Steuerung der Ansicht und des Zustands des Statistik-Tabs zuständig.
// Es interagiert mit der StatistikViewLogic, um die Benutzeroberfläche zu aktualisieren.
const StatistikTab = (() => {

    /**
     * Lädt den Statistik-Tab und aktualisiert dessen Ansicht.
     * Diese Funktion wird vom UIManager aufgerufen, wenn der Statistik-Tab aktiviert wird.
     */
    function load() {
        // Stellen Sie sicher, dass die StatistikViewLogicInstance global verfügbar ist.
        // Diese sollte bereits durch das Laden von js/ui/view_logic/statistik_tab.js initialisiert sein.
        if (typeof StatistikViewLogicInstance !== 'undefined') {
            StatistikViewLogicInstance.updateView();
        } else {
            console.error("StatistikViewLogicInstance ist nicht definiert. Statistik-Tab kann nicht geladen werden.");
        }
    }

    // Exponiert nur die "load"-Funktion nach außen, da der Rest der Logik
    // in StatistikViewLogic (js/ui/view_logic/statistik_tab.js) gekapselt ist.
    return Object.freeze({
        load: load
    });

})();
