const publikationTabLogic = (() => {

    let allKollektivStats = null;
    let rawGlobalDataInputForLogic = null;
    let appliedCriteriaForLogic = null;
    let appliedLogicForLogic = null;
    let bfResultsPerKollektivForLogic = null; // Enthält Ergebnisse für potenziell verschiedene Metriken

    function initializeData(globalRawData, appliedCriteria, appliedLogic, bfResultsPerKollektiv) {
        rawGlobalDataInputForLogic = globalRawData;
        appliedCriteriaForLogic = appliedCriteria;
        appliedLogicForLogic = appliedLogic;
        bfResultsPerKollektivForLogic = bfResultsPerKollektiv; // Dies speichert alle BF-Ergebnisse

        try {
            // Die publicationBfMetricTarget wird dynamisch aus dem State geholt, wenn benötigt
            const publicationBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalDataInputForLogic,
                appliedCriteriaForLogic,
                appliedLogicForLogic,
                bfResultsPerKollektivForLogic, // Übergibt alle BF Ergebnisse
                publicationBfMetric // Spezifiziert die für die Publikation relevante BF Metrik
            );
        } catch (error) {
            console.error("PublikationTabLogic: Fehler bei der Berechnung der Publikationsstatistiken:", error);
            allKollektivStats = null; // Sicherstellen, dass es null ist bei Fehler
            ui_helpers.showToast("Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentGlobalKollektiv) {
        if (!rawGlobalDataInputForLogic || !appliedCriteriaForLogic || !appliedLogicForLogic) {
            console.error("PublikationTabLogic: Basis-Daten (Rohdaten, Kriterien) nicht initialisiert.");
            return '<p class="text-danger">Basis-Daten für Publikations-Tab konnten nicht geladen werden. Bitte App neu laden.</p>';
        }

        // Stelle sicher, dass allKollektivStats mit der aktuellen BF-Metrik berechnet wird, falls noch nicht geschehen oder veraltet.
        const publicationBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        if (!allKollektivStats || 
            (allKollektivStats.Gesamt && allKollektivStats.Gesamt.bruteforce_definition && allKollektivStats.Gesamt.bruteforce_definition.metricName !== publicationBfMetric && bfResultsPerKollektivForLogic?.Gesamt?.metric !== publicationBfMetric ) ||
            (!allKollektivStats.Gesamt && bfResultsPerKollektivForLogic?.Gesamt?.metric !== publicationBfMetric) // Fall, wenn Gesamt null war aber BF Metrik geändert wurde
            ) {
            console.warn("PublikationTabLogic: Neuberechnung von allKollektivStats aufgrund geänderter BF-Metrik oder fehlender Initialisierung.");
            initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
        }


        if (!allKollektivStats) {
            return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte Analysen durchführen oder Seite neu laden.</p>';
        }

        const commonDataForGenerator = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nGesamt: allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            t2SizeStep: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            // Hinzufügen spezifischer Daten, die der TextGenerator benötigt
            ETHICS_VOTE_SAXONY: { // Beispiel, wie spezifische Referenzdetails übergeben werden können
                shortCitation: currentCommonDataInternal?.references?.ETHICS_VOTE_SAXONY?.shortCitation || "Ethikvotum Nr. 2023-101 (Sächsische Landesärztekammer)"
            },
            LURZ_SCHAEFER_2025_ADDITIONAL: {
                studyPeriod: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.studyPeriod || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023"),
                mriSystem: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.mriSystem || (lang === 'de' ? "einem 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)" : "a 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany)"),
                contrastAgent: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.contrastAgent || (lang === 'de' ? "Gadoteridol (ProHance; Bracco Imaging, Konstanz, Deutschland)" : "Gadoteridol (ProHance; Bracco Imaging, Konstanz, Germany)"),
                t2SliceThickness: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.t2SliceThickness || "2–3 mm",
                radiologistExperience: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.radiologistExperience || ["29", "7", "19"],
            }
        };

        const optionsForRenderer = {
            currentKollektiv: currentGlobalKollektiv,
            publicationBfMetric: publicationBfMetric
        };

        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
    }

    function updateDynamicChartsAndTablesForPublicationTab(mainSectionId, lang, currentGlobalKollektiv) {
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: Keine Daten für dynamische Elemente im Publikationstab vorhanden.");
            return;
        }
        
        const publicationBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        // Ensure stats are for the correct BF metric
        if (!allKollektivStats.Gesamt || 
            (allKollektivStats.Gesamt.bruteforce_definition && allKollektivStats.Gesamt.bruteforce_definition.metricName !== publicationBfMetric && bfResultsPerKollektivForLogic?.Gesamt?.metric !== publicationBfMetric) ||
            (!allKollektivStats.Gesamt.bruteforce_definition && bfResultsPerKollektivForLogic?.Gesamt?.metric !== publicationBfMetric) 
        ) {
            initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            if (!allKollektivStats) return; // Stop if re-initialization failed
        }


        const commonDataForGenerator = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nGesamt: allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            ETHICS_VOTE_SAXONY: {
                shortCitation: currentCommonDataInternal?.references?.ETHICS_VOTE_SAXONY?.shortCitation || "Ethikvotum Nr. 2023-101 (Sächsische Landesärztekammer)"
            },
            LURZ_SCHAEFER_2025_ADDITIONAL: {
                studyPeriod: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.studyPeriod || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023"),
                mriSystem: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.mriSystem || (lang === 'de' ? "einem 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)" : "a 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany)"),
                contrastAgent: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.contrastAgent || (lang === 'de' ? "Gadoteridol (ProHance; Bracco Imaging, Konstanz, Deutschland)" : "Gadoteridol (ProHance; Bracco Imaging, Konstanz, Germany)"),
                t2SliceThickness: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.t2SliceThickness || "2–3 mm",
                radiologistExperience: currentCommonDataInternal?.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.radiologistExperience || ["29", "7", "19"],
            }
        };
        const optionsForRenderer = {
            currentKollektiv: currentGlobalKollektiv,
            publicationBfMetric: publicationBfMetric
        };

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) return;

        mainSectionConfig.subSections.forEach(subSection => {
            Object.entries(PUBLICATION_CONFIG.publicationElements).forEach(([elementKey, elementConfig]) => {
                // Check if element is associated with the current subsection
                // This simple check assumes elementConfig.id might be globally unique and related to section or specific naming
                const wrapperDivId = `${elementConfig.id}-content_wrapper`;
                const wrapperDiv = document.getElementById(wrapperDivId);

                if (wrapperDiv) { // If placeholder div exists
                    if (elementKey.startsWith('TABLE_') && typeof publicationRenderer.generateTableHTML === 'function') {
                        const tableHTML = publicationRenderer.generateTableHTML(elementKey, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
                        ui_helpers.updateElementHTML(elementConfig.id, tableHTML); // Inject into the actual table container ID
                    } else if (elementKey.startsWith('FIGURE_') && elementConfig.chartFunction && typeof chartRenderer[elementConfig.chartFunction] === 'function' && !elementConfig.placeholder) {
                        const chartContainerDiv = document.getElementById(elementConfig.id); // The div where chart SVG should go
                        if (chartContainerDiv) {
                            let dataForChart = null;
                            if (elementConfig.dataKey) { // e.g., "Gesamt.deskriptiv.alterData"
                                dataForChart = elementConfig.dataKey.split('.').reduce((o, k) => (o && o[k] !== 'undefined') ? o[k] : null, allKollektivStats);
                            } else if (elementConfig.dataFunction) { // Conceptual: if data needs more complex derivation
                                // dataForChart = someLocalHelperFunctionForChartData(elementKey, allKollektivStats, commonDataForGenerator, optionsForRenderer);
                            }

                            if (dataForChart) {
                                const chartOptions = elementConfig.chartOptions || { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } };
                                let t2LabelForChart = optionsForRenderer.publicationBfMetric;
                                if (elementKey.includes('COMPARISON')) { // If it's a comparison chart, provide the T2 label
                                     const bfDef = allKollektivStats?.[optionsForRenderer.currentKollektiv]?.bruteforce_definition;
                                     t2LabelForChart = bfDef ? `${UI_TEXTS.legendLabels.currentT2.replace('{T2ShortName}', `BF-${bfDef.metricName.substring(0,3)}.` )}` : UI_TEXTS.legendLabels.currentT2.replace('{T2ShortName}', 'Optimized T2');
                                     chartRenderer[elementConfig.chartFunction](dataForChart, elementConfig.id, chartOptions, t2LabelForChart);
                                } else {
                                     chartRenderer[elementConfig.chartFunction](dataForChart, elementConfig.id, chartOptions);
                                }

                            } else {
                                ui_helpers.updateElementHTML(elementConfig.id, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für dieses Diagramm.' : 'No data for this chart.'}</p>`);
                            }
                        }
                    } else if (elementKey.startsWith('FIGURE_') && elementConfig.placeholder) {
                        const placeholderDiv = document.getElementById(elementConfig.id);
                        if(placeholderDiv) {
                             ui_helpers.updateElementHTML(elementConfig.id, `<p class="text-muted small text-center p-3"><i>${lang === 'de' ? 'Abbildung hier manuell einfügen.' : 'Insert figure manually here.'}</i></p>`);
                        }
                    }
                }
            });
        });
        ui_helpers.initializeTooltips(document.getElementById('publikation-content-area'));
    }


    return Object.freeze({
        initializeData,
        getRenderedSectionContent,
        updateDynamicChartsAndTablesForPublicationTab
    });

})();
