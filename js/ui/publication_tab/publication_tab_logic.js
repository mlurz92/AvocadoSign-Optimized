const publikationTabLogic = (() => {
    let _currentStatsDataForAllKollektive = null;
    let _currentCommonDataForPub = null;
    let _isDataStale = true;
    let _initialized = false;
    let _currentVisibleSectionId = null;

    function initializeTab(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        if (!_initialized) {
            ui_helpers.updatePublikationUI(
                state.getCurrentPublikationLang(),
                state.getCurrentPublikationSection(),
                state.getCurrentPublikationBruteForceMetric()
            );
             _currentVisibleSectionId = state.getCurrentPublikationSection();
            _initialized = true;
        }
        _initializeData(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);
        _updateView();
    }

    function refreshTab(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults, forceDataRefresh = false) {
        if (!_initialized) {
            initializeTab(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);
            return;
        }

        if (forceDataRefresh) {
            _isDataStale = true;
        }
        
        if (_isDataStale) {
             _initializeData(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);
        }
        
        const newSectionId = state.getCurrentPublikationSection();
        if (newSectionId !== _currentVisibleSectionId || _isDataStale) {
             _currentVisibleSectionId = newSectionId;
             _updateView();
        } else {
            // Nur UI-Steuerelemente aktualisieren, falls sich nur Sprache oder BF-Metrik geändert hat, ohne Datenneuberechnung
             ui_helpers.updatePublikationUI(
                state.getCurrentPublikationLang(),
                newSectionId,
                state.getCurrentPublikationBruteForceMetric()
            );
        }
        _isDataStale = false; 
    }

    function setDataStale() {
        _isDataStale = true;
    }

    function _initializeData(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0 || !appliedT2Criteria || !appliedT2Logic) {
            console.warn("Publikationstab: Unvollständige Basisdaten für Statistikberechnung.");
            _currentStatsDataForAllKollektive = null;
            _currentCommonDataForPub = null;
            _isDataStale = false;
            return;
        }
        
        try {
            _currentStatsDataForAllKollektive = statisticsService.calculateAllStatsForPublication(
                rawData,
                appliedT2Criteria,
                appliedT2Logic,
                bruteForceResults
            );
        } catch (error) {
            console.error("Fehler bei der Berechnung der Statistikdaten für den Publikationstab:", error);
            _currentStatsDataForAllKollektive = null;
            ui_helpers.showToast("Fehler bei der Statistikberechnung für Publikation. Details siehe Konsole.", "danger");
        }

        try {
            let gesamtN = 0, direktOpN = 0, nRCTN = 0;
            if(_currentStatsDataForAllKollektive) {
                gesamtN = _currentStatsDataForAllKollektive.Gesamt?.deskriptiv?.anzahlPatienten || 0;
                direktOpN = _currentStatsDataForAllKollektive['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
                nRCTN = _currentStatsDataForAllKollektive.nRCT?.deskriptiv?.anzahlPatienten || 0;
            }

            _currentCommonDataForPub = Object.freeze({
                appName: APP_CONFIG.APP_NAME,
                appVersion: APP_CONFIG.APP_VERSION,
                nGesamt: gesamtN,
                nDirektOP: direktOpN,
                nNRCT: nRCTN,
                significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                references: cloneDeep(APP_CONFIG.REFERENCES_FOR_PUBLICATION) || {},
                bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                appliedT2CriteriaGlobal: cloneDeep(appliedT2Criteria),
                appliedT2LogicGlobal: appliedT2Logic,
                toolInstance: typeof mainAppInterface !== 'undefined' ? mainAppInterface : null
            });
        } catch (error) {
             console.error("Fehler beim Erstellen der CommonData für den Publikationstab:", error);
            _currentCommonDataForPub = null;
        }
        _isDataStale = false;
    }

    function _updateView() {
        const lang = state.getCurrentPublikationLang();
        const sectionId = state.getCurrentPublikationSection();
        const bruteForceMetricForPublication = state.getCurrentPublikationBruteForceMetric();

        if (!_currentStatsDataForAllKollektive || !_currentCommonDataForPub) {
            const contentArea = document.getElementById('publikation-content-area');
            if (contentArea) {
                contentArea.innerHTML = `<div class="alert alert-warning p-5 text-center" role="alert">
                                            <h4 class="alert-heading">${lang === 'de' ? 'Datenfehler' : 'Data Error'}</h4>
                                            <p>${lang === 'de' ? 'Die für diesen Tab benötigten statistischen Daten oder Konfigurationen konnten nicht geladen werden.' : 'The statistical data or configurations required for this tab could not be loaded.'}</p>
                                            <hr>
                                            <p class="mb-0 small">${lang === 'de' ? 'Bitte stellen Sie sicher, dass alle vorherigen Schritte (Datenverarbeitung, Kriteriendefinition) korrekt ausgeführt wurden und versuchen Sie, die Anwendung neu zu laden oder die Daten im Auswertungstab neu anzuwenden.' : 'Please ensure all previous steps (data processing, criteria definition) have been performed correctly and try reloading the application or reapplying the criteria in the Evaluation tab.'}</p>
                                         </div>`;
            }
            ui_helpers.updatePublikationUI(lang, sectionId, bruteForceMetricForPublication); // Update controls anyway
            return;
        }
        
        const options = {
            bruteForceMetric: bruteForceMetricForPublication
        };

        ui_helpers.updatePublikationUI(lang, sectionId, bruteForceMetricForPublication);
        
        // Verzögere das Rendern leicht, um sicherzustellen, dass das UI-Update (z.B. aktiver Nav-Link) zuerst verarbeitet wird
        // und um dem Browser Zeit für eventuelle Layout-Anpassungen durch den Sticky Header zu geben.
        setTimeout(() => {
            publicationRenderer.renderPublicationSection(
                sectionId,
                lang,
                _currentStatsDataForAllKollektive,
                _currentCommonDataForPub,
                options
            );
        }, 50); 
    }
    
    function getGeneratedMarkdownForSection(sectionId, lang) {
        if (!_initialized || _isDataStale || !_currentStatsDataForAllKollektive || !_currentCommonDataForPub) {
            console.warn("Versuch, Markdown zu generieren, bevor Daten initialisiert oder während sie veraltet sind.");
            return lang === 'de' ? "# Fehler: Daten nicht aktuell oder nicht initialisiert." : "# Error: Data not current or not initialized.";
        }
        const bruteForceMetricForPublication = state.getCurrentPublikationBruteForceMetric();
        const options = { bruteForceMetric: bruteForceMetricForPublication };
        return publicationTextGenerator.getSectionTextAsMarkdown(sectionId, lang, _currentStatsDataForAllKollektive, _currentCommonDataForPub, options);
    }
    
    function getFullPublicationMarkdown(lang) {
        if (!_initialized || _isDataStale || !_currentStatsDataForAllKollektive || !_currentCommonDataForPub) {
            console.warn("Versuch, vollständiges Markdown zu generieren, bevor Daten initialisiert oder während sie veraltet sind.");
             return lang === 'de' ? "# Fehler: Daten nicht aktuell oder nicht initialisiert." : "# Error: Data not current or not initialized.";
        }
        const bruteForceMetricForPublication = state.getCurrentPublikationBruteForceMetric();
        const options = { bruteForceMetric: bruteForceMetricForPublication };
        let fullMarkdown = `# ${lang === 'de' ? 'Manuskriptentwurf' : 'Manuscript Draft'}: ${APP_CONFIG.APP_NAME} - ${getCurrentDateString('DD.MM.YYYY')}\n\n`;
        fullMarkdown += `**${lang === 'de' ? 'Sprache' : 'Language'}:** ${lang === 'de' ? 'Deutsch' : 'English'}\n`;
        fullMarkdown += `**${lang === 'de' ? 'Optimierungsmetrik für T2 (Brute-Force) im Fokus' : 'Optimization Metric for T2 (Brute-Force) in Focus'}:** ${bruteForceMetricForPublication}\n\n`;

        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            fullMarkdown += `## ${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}\n\n`;
            mainSection.subSections.forEach(subSection => {
                fullMarkdown += `### ${subSection.label}\n\n`; // Hier könnte man die Subsektions-Label auch sprachabhängig machen, falls nötig
                const sectionText = publicationTextGenerator.getSectionTextAsMarkdown(subSection.id, lang, _currentStatsDataForAllKollektive, _currentCommonDataForPub, options);
                fullMarkdown += `${sectionText}\n\n`;
            });
        });
        return fullMarkdown;
    }


    return Object.freeze({
        initializeTab,
        refreshTab,
        setDataStale,
        getGeneratedMarkdownForSection,
        getFullPublicationMarkdown
    });

})();
