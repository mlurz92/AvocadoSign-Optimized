const publicationRenderer = (() => {

    function renderSidebarNavigation(tocItems, currentSectionId, lang) {
        if (!tocItems || tocItems.length === 0) {
            return '<p class="text-muted p-2 small">Kein Inhaltsverzeichnis verfügbar.</p>';
        }

        let html = '<nav id="publikation-sections-nav" class="nav nav-pills flex-column">';
        let currentMainSectionId = null;

        tocItems.forEach(item => {
            if (item.mainSectionId !== currentMainSectionId) {
                if (currentMainSectionId !== null) {
                    html += '</div>'; // Schließe vorherige Sub-Navigationsgruppe
                }
                currentMainSectionId = item.mainSectionId;
                const mainSectionTooltip = TOOLTIP_CONTENT.publikationTabTooltips[item.mainSectionId]?.description || item.mainSectionLabel;
                html += `<h6 class="mt-3 mb-1 px-2 text-muted text-uppercase small" data-tippy-content="${mainSectionTooltip}">${item.mainSectionLabel}</h6>`;
                html += '<div class="nav nav-pills flex-column">'; // Starte neue Sub-Navigationsgruppe
            }
            const isActive = item.id === currentSectionId;
            const subSectionTooltip = TOOLTIP_CONTENT.publikationTabTooltips[item.id]?.description || item.label;
            html += `
                <a class="nav-link py-1 px-3 publikation-section-link ${isActive ? 'active' : ''}" href="#" data-section-id="${item.id}" data-tippy-content="${subSectionTooltip}" aria-current="${isActive ? 'page' : 'false'}">
                    ${item.label}
                </a>`;
        });

        if (currentMainSectionId !== null) {
            html += '</div>'; // Schließe die letzte Sub-Navigationsgruppe
        }
        html += '</nav>';
        return html;
    }

    function renderContent(lang, sectionId, publicationStats, commonDataOverrides, options) {
        if (typeof publicationTextGenerator === 'undefined' || typeof publicationTextGenerator.getSectionText !== 'function') {
            return `<p class="text-danger">Fehler: publicationTextGenerator nicht verfügbar.</p>`;
        }

        const commonData = {
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            appVersion: APP_CONFIG.APP_VERSION,
            appName: APP_CONFIG.APP_NAME,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            appliedT2CriteriaGlobal: commonDataOverrides.appliedT2Criteria,
            appliedT2LogicGlobal: commonDataOverrides.appliedT2Logic,
            nGesamt: publicationStats?.Gesamt?.deskriptiv?.anzahlPatienten,
            nDirektOP: publicationStats?.['direkt OP']?.deskriptiv?.anzahlPatienten,
            nNRCT: publicationStats?.nRCT?.deskriptiv?.anzahlPatienten,
            bruteForceMetricForPublication: options?.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            ...commonDataOverrides 
        };
        
        return publicationTextGenerator.getSectionText(sectionId, lang, publicationStats, commonData, options);
    }

    function attachPublicationTabEventListeners(contentAreaElement) {
        if (!contentAreaElement) return;

        contentAreaElement.addEventListener('click', function(event) {
            const target = event.target;
            if (target.matches('.copy-section-markdown-btn')) {
                const sectionId = target.dataset.sectionId;
                const lang = target.dataset.lang;
                if (sectionId && lang && typeof publicationTabLogic !== 'undefined' && typeof publicationTabLogic.getFullPublicationStats === 'function' && typeof publicationTextGenerator !== 'undefined' && typeof state !== 'undefined') {
                    const allStats = publicationTabLogic.getFullPublicationStats();
                    const bfMetric = state.getCurrentPublikationBruteForceMetric();
                     const commonData = {
                        references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
                        appVersion: APP_CONFIG.APP_VERSION,
                        appName: APP_CONFIG.APP_NAME,
                        significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                        bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                        appliedT2CriteriaGlobal: state.getAppliedT2Criteria(),
                        appliedT2LogicGlobal: state.getAppliedT2Logic(),
                        nGesamt: allStats?.Gesamt?.deskriptiv?.anzahlPatienten,
                        nDirektOP: allStats?.['direkt OP']?.deskriptiv?.anzahlPatienten,
                        nNRCT: allStats?.nRCT?.deskriptiv?.anzahlPatienten,
                        bruteForceMetricForPublication: bfMetric
                    };
                    const markdownText = publicationTextGenerator.getSectionTextAsMarkdown(sectionId, lang, allStats, commonData, {bruteForceMetric: bfMetric});
                    navigator.clipboard.writeText(markdownText).then(() => {
                        ui_helpers.showToast(`Markdown für Sektion '${sectionId}' in Zwischenablage kopiert.`, 'success');
                    }).catch(err => {
                        console.error('Fehler beim Kopieren in die Zwischenablage:', err);
                        ui_helpers.showToast('Fehler beim Kopieren in die Zwischenablage.', 'danger');
                    });
                }
            }
        });
    }

    const fCI_pub = (metric, digits = 1, isPercent = true, lang = 'de', showMethod = false) => {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        const pValuePrecision = (digits === 3 && !isPercent) ? APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV : digits;

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', true);
            }
            if (lang === 'de' && typeof formattedNum === 'string' && !isP) {
                formattedNum = formattedNum.replace('.', ',');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, pValuePrecision, isPercent);
        if (valStr === 'N/A') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, pValuePrecision, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, pValuePrecision, isPercent);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            
            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;
            let suffix = isPercent ? '%' : '';

            if(isPercent){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
            }
            let ciString = `${mainValForDisplay} (${(lang === 'de' ? '95%-KI' : '95% CI')}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})${suffix}`;
            if(showMethod && metric.method) ciString += ` [${metric.method.replace('Woolf Logit (Haldane-Anscombe correction)', 'Woolf Logit').replace('Bootstrap Percentile','Bootstrap')}]`;
            return ciString;
        }
        return valStr;
    };

    function _createDownloadButtons(elementId, baseName, formats = ['png', 'csv', 'md']) {
        let buttonsHTML = '<div class="publication-element-downloads btn-group btn-group-sm mt-1 float-end" role="group" aria-label="Download options">';
        if (formats.includes('png') && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) {
            buttonsHTML += `<button class="btn btn-outline-secondary table-download-png-btn" data-table-id="${elementId}" data-table-name="${baseName}" data-tippy-content="Tabelle als PNG herunterladen"><i class="fas fa-image"></i> PNG</button>`;
        }
        if (formats.includes('csv')) {
            buttonsHTML += `<button class="btn btn-outline-secondary table-download-csv-btn" data-table-id="${elementId}" data-table-name="${baseName}" data-tippy-content="Tabelle als CSV herunterladen"><i class="fas fa-file-csv"></i> CSV</button>`;
        }
        if (formats.includes('md')) {
             buttonsHTML += `<button class="btn btn-outline-secondary table-download-md-btn" data-table-id="${elementId}" data-table-name="${baseName}" data-tippy-content="Tabelle als Markdown herunterladen"><i class="fab fa-markdown"></i> MD</button>`;
        }
        buttonsHTML += '</div>';
        return formats.length > 0 ? buttonsHTML : '';
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, commonData, elementId, title) {
        const pGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const pDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv;
        const pNRCT = allKollektivStats?.nRCT?.deskriptiv;
        const na = 'N/A';

        if (!pGesamt || !pDirektOP || !pNRCT) {
            return `<p class="text-warning">${lang === 'de' ? 'Daten für Patientencharakteristika nicht verfügbar.' : 'Data for patient characteristics not available.'}</p>`;
        }

        const headers = [
            lang === 'de' ? 'Merkmal' : 'Characteristic',
            `${getKollektivDisplayName('Gesamt')} (N=${pGesamt.anzahlPatienten})`,
            `${getKollektivDisplayName('direkt OP')} (N=${pDirektOP.anzahlPatienten})`,
            `${getKollektivDisplayName('nRCT')} (N=${pNRCT.anzahlPatienten})`
        ];

        const formatCellData = (data, key, subKey = null, isPercentOfTotal = false, digits = 1, isCountOnly = false) => {
            if (!data) return na;
            let value, totalForPercent;
            if (subKey) { value = data[key]?.[subKey]; totalForPercent = data.anzahlPatienten; }
            else { value = data[key]; totalForPercent = data.anzahlPatienten; }

            if (isCountOnly && (value !== null && value !== undefined && !isNaN(value))) return formatNumber(value, 0);

            if (isPercentOfTotal && totalForPercent > 0 && value !== null && value !== undefined && !isNaN(value)) {
                return `${formatNumber(value, 0)} (${formatPercent(value / totalForPercent, digits === 0 ? 0 : 1)})`;
            }
            if (value !== null && value !== undefined && !isNaN(value)) {
                 if (key === 'alter' && subKey === 'medianRange') return `${formatNumber(data.alter?.median, digits, na, lang==='en')} (${formatNumber(data.alter?.min, 0, na, lang==='en')}\u00A0–\u00A0${formatNumber(data.alter?.max, 0, na, lang==='en')})`;
                 if (key === 'alter' && subKey === 'meanSD') return `${formatNumber(data.alter?.mean, digits, na, lang==='en')} (±${formatNumber(data.alter?.sd, digits, na, lang==='en')})`;
                 return formatNumber(value, digits, na, lang==='en');
            }
            return na;
        };
        
        const rows = [
            { labelDe: 'Alter (Jahre), Median (Range)', labelEn: 'Age (years), Median (Range)', key: 'alter', subKey: 'medianRange', digits:1 },
            { labelDe: 'Alter (Jahre), Mittelwert (SD)', labelEn: 'Age (years), Mean (SD)', key: 'alter', subKey: 'meanSD', digits:1 },
            { labelDe: 'Geschlecht, männlich n (%)', labelEn: 'Sex, male n (%)', key: 'geschlecht', subKey: 'm', isPercent: true, digits:0 },
            { labelDe: 'Histopathologischer N-Status, positiv n (%)', labelEn: 'Histopathological N-Status, positive n (%)', key: 'nStatus', subKey: 'plus', isPercent: true, digits:0 }
        ];
        
        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        rows.forEach(row => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? row.labelDe : row.labelEn}</td>
                            <td>${formatCellData(pGesamt, row.key, row.subKey, row.isPercent, row.digits, row.isCountOnly)}</td>
                            <td>${formatCellData(pDirektOP, row.key, row.subKey, row.isPercent, row.digits, row.isCountOnly)}</td>
                            <td>${formatCellData(pNRCT, row.key, row.subKey, row.isPercent, row.digits, row.isCountOnly)}</td>
                          </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId, ['png', 'csv', 'md']);
        return tableHTML;
    }

    function _renderLiteraturT2KriterienTabelle(lang, commonData, elementId, title) {
        const sets = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : [];
        if (!sets || sets.length === 0) {
            return `<p class="text-warning">${lang === 'de' ? 'Keine Literatur-Kriteriensets definiert.' : 'No literature criteria sets defined.'}</p>`;
        }
        const headers = [
            lang === 'de' ? 'Kriterienset / Autor(en)' : 'Criteria Set / Author(s)',
            lang === 'de' ? 'Kurzbeschreibung der Kriterien' : 'Brief Criteria Description',
            lang === 'de' ? 'Urspr. Zielgruppe / Anwendung' : 'Original Target Group / Application',
            lang === 'de' ? 'Referenz' : 'Reference'
        ];

        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        sets.forEach(set => {
            if (!PUBLICATION_CONFIG.literatureCriteriaSets.find(confSet => confSet.id === set.id)) return;
            const refKey = set.reference ? Object.keys(commonData.references || {}).find(key => commonData.references[key].short === set.reference) : null;
            const referenceText = refKey ? publicationTextGenerator.getReference(refKey, commonData, 'citation') : (set.reference || 'N/A');
            const name = set.name || 'N/A';
            const criteriaDesc = set.studyInfo?.keyCriteriaSummary || (typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay(set.criteria, set.logic, true) : 'N/A');
            const targetGroup = set.studyInfo?.investigationType ? `${getKollektivDisplayName(set.applicableKollektiv)} (${set.studyInfo.investigationType})` : getKollektivDisplayName(set.applicableKollektiv);

            tableHTML += `<tr>
                            <td>${name}</td>
                            <td>${criteriaDesc}</td>
                            <td>${targetGroup}</td>
                            <td>${referenceText}</td>
                          </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId, ['png', 'csv', 'md']);
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabelle(statsData, methodenName, kollektivName, lang, elementId, title, showFullCIInfo = true) {
         if (!statsData || !statsData.matrix) {
            return `<p class="text-warning">${lang === 'de' ? `Keine Daten für diagnostische Güte von '${methodenName}' im Kollektiv '${getKollektivDisplayName(kollektivName)}' verfügbar.` : `No data available for diagnostic performance of '${methodenName}' in cohort '${getKollektivDisplayName(kollektivName)}'.`}</p>`;
        }
        const headers = [
            lang === 'de' ? 'Metrik' : 'Metric',
            lang === 'de' ? 'Wert (95%-KI)' : 'Value (95% CI)'
        ];
        if (showFullCIInfo) headers.push(lang === 'de' ? 'KI-Methode' : 'CI Method');

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: lang==='de'?'Sensitivität':'Sensitivity', spez: lang==='de'?'Spezifität':'Specificity', ppv: 'PPV', npv: 'NPV', acc: lang==='de'?'Accuracy':'Accuracy', balAcc: lang==='de'?'Balanced Accuracy':'Balanced Accuracy', f1: 'F1-Score', auc: 'AUC' };

        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        metrics.forEach(key => {
            const metric = statsData[key];
            if (metric && UI_TEXTS.statMetrics[key]) {
                const isRate = !(key === 'auc' || key === 'f1');
                const digits = UI_TEXTS.statMetrics[key].digits !== undefined ? UI_TEXTS.statMetrics[key].digits : ((key === 'auc' || key === 'f1') ? 3 : 1);
                tableHTML += `<tr>
                                <td>${metricDisplayNames[key]}</td>
                                <td>${fCI_pub(metric, digits, isRate, lang)}</td>`;
                if (showFullCIInfo) tableHTML += `<td>${metric?.method || 'N/A'}</td>`;
                tableHTML += `</tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId, ['png', 'csv', 'md']);
        return tableHTML;
    }

    function _renderStatistischerVergleichTabelle(allKollektivStats, commonData, lang, elementId, title, options) {
        const bfZielMetric = options.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const headers = [
            lang === 'de' ? 'Vergleich' : 'Comparison',
            lang === 'de' ? 'Kollektiv' : 'Cohort',
            'AUC (AS)', 'AUC (T2)',
            lang === 'de' ? 'Δ AUC' : 'Δ AUC',
            'p-Wert (DeLong)',
            lang === 'de' ? 'p-Wert (McNemar)' : 'p-Value (McNemar)'
        ];
        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const t2SetsToCompare = [
             ...(PUBLICATION_CONFIG.literatureCriteriaSets.map(s => ({...s, type: 'Literatur'}))),
             {id: 'bruteforce', nameKey: lang ==='de' ? `Für ${bfZielMetric} optimierte T2-Kriterien` : `T2 Criteria Optimized for ${bfZielMetric}`, type: 'Brute-Force'}
        ];

        kollektive.forEach(kId => {
            const kollektivDisplayName = getKollektivDisplayName(kId);
            const nPat = allKollektivStats?.[kId]?.deskriptiv?.anzahlPatienten || 'N/A';
            const asStats = allKollektivStats?.[kId]?.gueteAS;

            t2SetsToCompare.forEach(t2Set => {
                let vergleichData, t2Stats;
                let t2SetName = t2Set.nameKey;
                let isApplicable = true;

                if(t2Set.type === 'Literatur') {
                    const studyDetails = (typeof studyT2CriteriaManager !== 'undefined') ? studyT2CriteriaManager.getStudyCriteriaSetById(t2Set.id) : null;
                    if(studyDetails?.applicableKollektiv && studyDetails.applicableKollektiv !== 'Gesamt' && studyDetails.applicableKollektiv !== kId){
                        isApplicable = false;
                    }
                    if(isApplicable) {
                        vergleichData = allKollektivStats?.[kId]?.[`vergleichASvsT2_literatur_${t2Set.id}`];
                        t2Stats = allKollektivStats?.[kId]?.gueteT2_literatur?.[t2Set.id];
                        t2SetName = studyDetails?.reference || t2Set.nameKey;
                         if(studyDetails && studyDetails.studyInfo?.primaryReferenceKey && commonData.references && commonData.references[studyDetails.studyInfo.primaryReferenceKey]){
                             const primaryRef = publicationTextGenerator.getReference(studyDetails.studyInfo.primaryReferenceKey, commonData, 'citation');
                             t2SetName = `${primaryRef} (${lang === 'de' ? 'eval. durch' : 'eval. by'} ${t2SetName})`;
                         }
                    }
                } else { 
                    const bfDef = allKollektivStats?.[kId]?.bruteforce_definition;
                    if(bfDef && bfDef.metricName !== bfZielMetric){
                         t2SetName += ` (optimiert für ${bfDef.metricName})`;
                    }
                    vergleichData = allKollektivStats?.[kId]?.vergleichASvsT2_bruteforce;
                    t2Stats = allKollektivStats?.[kId]?.gueteT2_bruteforce;
                }

                if(isApplicable && vergleichData && asStats && t2Stats && asStats.auc && t2Stats.auc) {
                    tableHTML += `<tr>
                                    <td>AS vs. ${t2SetName}</td>
                                    <td>${kollektivDisplayName} (N=${nPat})</td>
                                    <td>${fCI_pub(asStats.auc, 3, false, lang)}</td>
                                    <td>${fCI_pub(t2Stats.auc, 3, false, lang)}</td>
                                    <td>${formatNumber(vergleichData.delong?.diffAUC, 3, 'N/A', lang === 'en')}</td>
                                    <td>${formatPValueForText(vergleichData.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichData.delong?.pValue)}</td>
                                    <td>${formatPValueForText(vergleichData.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichData.mcnemar?.pValue)}</td>
                                  </tr>`;
                }
            });
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId, ['png', 'csv', 'md']);
        return tableHTML;
    }


    return Object.freeze({
        renderSidebarNavigation,
        renderContent,
        attachPublicationTabEventListeners,
        renderPatientenCharakteristikaTabelle: _renderPatientenCharakteristikaTabelle,
        renderLiteraturT2KriterienTabelle: _renderLiteraturT2KriterienTabelle,
        renderDiagnostischeGueteTabelle: _renderDiagnostischeGueteTabelle,
        renderStatistischerVergleichTabelle: _renderStatistischerVergleichTabelle
    });

})();
