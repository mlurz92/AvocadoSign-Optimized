const generalEventHandlers = (() => {

    function _handleKollektivButtonClick(event) {
        const newKollektiv = event.currentTarget.dataset.kollektiv;
        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleKollektivChange === 'function') {
            mainAppInterface.handleKollektivChange(newKollektiv);
        } else {
            console.error("mainAppInterface.handleKollektivChange ist nicht verfügbar.");
        }
    }

    function _handleHilfeButtonClick() {
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showKurzanleitung === 'function') {
            ui_helpers.showKurzanleitung();
        } else {
            console.error("ui_helpers.showKurzanleitung ist nicht verfügbar.");
        }
    }
    
    function _handleThemeChange(event) {
        const newScheme = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setChartColorScheme === 'function') {
            stateManager.setChartColorScheme(newScheme);
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                mainAppInterface.refreshCurrentTab(); 
            }
        }
    }
    
    function _handleResetStateClick() {
        // Ersetze confirm() durch eine zukünftige, benutzerdefinierte Modal-Funktion
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showConfirmModal === 'function') {
            ui_helpers.showConfirmModal(
                UI_TEXTS.general.confirmResetState || "Möchten Sie wirklich alle Einstellungen (Kriterien, Sortierungen, Auswahlen) auf die Standardwerte zurücksetzen? Gespeicherte Brute-Force-Ergebnisse bleiben erhalten.",
                () => { // Callback für Bestätigung
                    if (typeof stateManager !== 'undefined' && typeof stateManager.resetStateToDefaults === 'function') {
                        stateManager.resetStateToDefaults();
                        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshAllTabs === 'function') {
                            mainAppInterface.refreshAllTabs(true); 
                        }
                        if (typeof t2CriteriaManager !== 'undefined' && typeof t2CriteriaManager.resetToDefaults === 'function' && typeof t2CriteriaManager.saveAll === 'function' ) {
                            t2CriteriaManager.resetToDefaults(); 
                            t2CriteriaManager.saveAll(); 
                        }

                        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.updateAllUIComponents === 'function'){
                            mainAppInterface.updateAllUIComponents();
                        } else if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                            mainAppInterface.refreshCurrentTab();
                        }
                        
                        ui_helpers.showToast("Alle Einstellungen wurden auf Standard zurückgesetzt.", "success");
                    }
                },
                UI_TEXTS.general.reset || "Zurücksetzen", // Bestätigungsbutton Text
                UI_TEXTS.general.cancel || "Abbrechen" // Abbruchbutton Text
            );
        } else {
            console.error("ui_helpers.showConfirmModal ist nicht verfügbar. Kann Einstellungen nicht zurücksetzen.");
            ui_helpers.showToast("Funktion zum Zurücksetzen nicht verfügbar.", "danger");
        }
    }
    
    function _handleResetBruteForceClick() {
        // Ersetze confirm() durch eine zukünftige, benutzerdefinierte Modal-Funktion
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showConfirmModal === 'function') {
            ui_helpers.showConfirmModal(
                UI_TEXTS.general.confirmResetBruteForce || "Möchten Sie wirklich ALLE gespeicherten Brute-Force-Optimierungsergebnisse für ALLE Kollektive und Metriken löschen?",
                () => { // Callback für Bestätigung
                    if (typeof bruteForceManager !== 'undefined' && typeof bruteForceManager.resetResults === 'function') {
                        bruteForceManager.resetResults(); 
                    }
                },
                UI_TEXTS.general.reset || "Zurücksetzen", // Bestätigungsbutton Text
                UI_TEXTS.general.cancel || "Abbrechen" // Abbruchbutton Text
            );
        } else {
            console.error("ui_helpers.showConfirmModal ist nicht verfügbar. Kann Brute-Force-Ergebnisse nicht löschen.");
            ui_helpers.showToast("Funktion zum Löschen der Brute-Force-Ergebnisse nicht verfügbar.", "danger");
        }
    }


    function register() {
        const kollektivButtons = document.querySelectorAll('header .btn-group button[data-kollektiv]');
        if (kollektivButtons && kollektivButtons.length > 0) {
            kollektivButtons.forEach(button => {
                button.removeEventListener('click', _handleKollektivButtonClick); 
                button.addEventListener('click', _handleKollektivButtonClick);
            });
        } else {
            console.warn("GeneralEventHandlers: Kollektiv-Buttons nicht gefunden.");
        }

        const hilfeButton = document.getElementById('btn-show-kurzanleitung');
        if (hilfeButton) {
            hilfeButton.removeEventListener('click', _handleHilfeButtonClick); 
            hilfeButton.addEventListener('click', _handleHilfeButtonClick);
        } else {
            console.warn("GeneralEventHandlers: Hilfe-Button ('btn-show-kurzanleitung') nicht gefunden.");
        }
        
        const themeSelector = document.getElementById('chart-theme-selector');
        if (themeSelector) {
            themeSelector.removeEventListener('change', _handleThemeChange);
            themeSelector.addEventListener('change', _handleThemeChange);
            if(typeof stateManager !== 'undefined') {
                 themeSelector.value = stateManager.getChartColorScheme();
            }
        } else {
             console.warn("GeneralEventHandlers: Theme-Selector ('chart-theme-selector') nicht gefunden.");
        }
        
        const resetStateButton = document.getElementById('btn-reset-state');
        if(resetStateButton) {
            resetStateButton.removeEventListener('click', _handleResetStateClick);
            resetStateButton.addEventListener('click', _handleResetStateClick);
        } else {
            console.warn("GeneralEventHandlers: Reset-State-Button ('btn-reset-state') nicht gefunden.");
        }
        
        const resetBruteForceButton = document.getElementById('btn-reset-bruteforce-results');
         if(resetBruteForceButton) {
            resetBruteForceButton.removeEventListener('click', _handleResetBruteForceClick);
            resetBruteForceButton.addEventListener('click', _handleResetBruteForceClick);
        } else {
            console.warn("GeneralEventHandlers: Reset-BruteForce-Button ('btn-reset-bruteforce-results') nicht gefunden.");
        }

    }

    return Object.freeze({
        register
    });
})();

window.generalEventHandlers = generalEventHandlers;
