const uiComponents = (() => {

    function createCard(options = {}) {
        const { id, headerText, bodyContent, footerContent, cardClass = '', headerClass = '', bodyClass = '', footerClass = '', isCollapsible = false, startCollapsed = false, extraAttributes = {} } = options;
        const cardId = id || `card-${generateUUID()}`;
        const collapseId = `collapse-${cardId}`;

        const cardDiv = ui_helpers.createElementWithAttributes('div', { class: `card ${cardClass}`, id: cardId, ...extraAttributes });

        if (headerText) {
            const cardHeader = ui_helpers.createElementWithAttributes('div', { class: `card-header ${headerClass}` });
            if (isCollapsible) {
                const button = ui_helpers.createElementWithAttributes('button', {
                    class: `btn btn-link p-0 text-start text-decoration-none text-dark fw-bold w-100 ${startCollapsed ? 'collapsed' : ''}`,
                    type: 'button', 'data-bs-toggle': 'collapse', 'data-bs-target': `#${collapseId}`,
                    'aria-expanded': startCollapsed ? 'false' : 'true', 'aria-controls': collapseId
                });
                button.innerHTML = `${ui_helpers.escapeHTML(headerText)} <i class="fas fa-chevron-down float-end transition-transform"></i>`;
                cardHeader.appendChild(button);
            } else {
                cardHeader.textContent = headerText;
            }
            cardDiv.appendChild(cardHeader);
        }

        const collapseDiv = ui_helpers.createElementWithAttributes('div', {
            class: `collapse ${isCollapsible && !startCollapsed ? 'show' : ''}`,
            id: collapseId
        });

        if (bodyContent) {
            const cardBody = ui_helpers.createElementWithAttributes('div', { class: `card-body ${bodyClass}` });
            if (typeof bodyContent === 'string') {
                cardBody.innerHTML = bodyContent;
            } else if (bodyContent instanceof HTMLElement) {
                cardBody.appendChild(bodyContent);
            }
            collapseDiv.appendChild(cardBody);
        }
        cardDiv.appendChild(collapseDiv);


        if (footerContent) {
            const cardFooter = ui_helpers.createElementWithAttributes('div', { class: `card-footer ${footerClass}` });
            if (typeof footerContent === 'string') {
                cardFooter.innerHTML = footerContent;
            } else if (footerContent instanceof HTMLElement) {
                cardFooter.appendChild(footerContent);
            }
            cardDiv.appendChild(cardFooter);
        }
        return cardDiv;
    }

    function createButton(options = {}) {
        const { id, text, iconClass, btnClass = 'btn-primary', sizeClass = '', onClick, tooltipKey, tooltipPlacement = 'top', extraAttributes = {}, innerHTML } = options;
        const button = ui_helpers.createElementWithAttributes('button', { type: 'button', class: `btn ${btnClass} ${sizeClass}`, ...extraAttributes });
        if (id) button.id = id;

        if (innerHTML) {
            button.innerHTML = innerHTML;
        } else {
            let buttonText = '';
            if (iconClass) {
                const iconHTML = ui_helpers.getIcon(iconClass, { class: 'me-1' });
                buttonText += iconHTML;
            }
            if (text) {
                buttonText += ui_helpers.escapeHTML(text);
            }
            button.innerHTML = buttonText;
        }

        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }
        if (tooltipKey) {
            button.setAttribute('data-tippy-content-key', tooltipKey);
            button.setAttribute('data-tippy-placement', tooltipPlacement);
        }
        return button;
    }

    function createIconElement(iconName, options = {}) {
        return ui_helpers.createIcon(iconName, options);
    }

    function createSelect(options = {}) {
        const { id, label, selectOptions, value, selectClass = '', labelClass = '', wrapperClass = 'mb-3', onChange, tooltipKey, name = '', disabled = false } = options;
        const selectId = id || `select-${generateUUID()}`;
        const wrapper = ui_helpers.createElementWithAttributes('div', { class: wrapperClass });

        if (label) {
            const labelEl = ui_helpers.createElementWithAttributes('label', { for: selectId, class: `form-label ${labelClass}` }, label);
            wrapper.appendChild(labelEl);
        }

        const select = ui_helpers.createElementWithAttributes('select', { class: `form-select ${selectClass}`, id: selectId, name });
        if (disabled) select.disabled = true;

        (selectOptions || []).forEach(opt => {
            const optionEl = ui_helpers.createElementWithAttributes('option', { value: opt.value }, opt.text);
            if (opt.value === value) {
                optionEl.selected = true;
            }
            if (opt.disabled) {
                optionEl.disabled = true;
            }
            select.appendChild(optionEl);
        });

        if (onChange && typeof onChange === 'function') {
            select.addEventListener('change', onChange);
        }
        if (tooltipKey) {
            select.setAttribute('data-tippy-content-key', tooltipKey);
        }
        wrapper.appendChild(select);
        return wrapper;
    }

    function createRangeInput(options = {}) {
        const { id, label, min, max, step, value, rangeClass = '', labelClass = '', wrapperClass = 'mb-3', onInput, tooltipKey, name = '', unit = '', showValue = true, disabled = false } = options;
        const rangeId = id || `range-${generateUUID()}`;
        const wrapper = ui_helpers.createElementWithAttributes('div', { class: wrapperClass });

        if (label) {
            const labelEl = ui_helpers.createElementWithAttributes('label', { for: rangeId, class: `form-label ${labelClass}` }, label);
            wrapper.appendChild(labelEl);
        }

        const inputGroup = ui_helpers.createElementWithAttributes('div', { class: 'input-group input-group-sm' });
        const range = ui_helpers.createElementWithAttributes('input', { type: 'range', class: `form-range ${rangeClass}`, id: rangeId, min, max, step, value, name });
        if (disabled) range.disabled = true;
        inputGroup.appendChild(range);

        let valueDisplay = null;
        if (showValue) {
            valueDisplay = ui_helpers.createElementWithAttributes('span', { class: 'input-group-text criteria-value-display', id: `${rangeId}-value` }, `${formatNumber(value,1)}${unit}`);
            inputGroup.appendChild(valueDisplay);
        }

        if (onInput && typeof onInput === 'function') {
            range.addEventListener('input', (event) => {
                onInput(event);
                if (valueDisplay) valueDisplay.textContent = `${formatNumber(event.target.value,1)}${unit}`;
            });
        }
        if (tooltipKey) {
            range.setAttribute('data-tippy-content-key', tooltipKey);
        }
        wrapper.appendChild(inputGroup);
        return wrapper;
    }

     function createCheckbox(options = {}) {
        const { id, label, checked = false, wrapperClass = 'form-check mb-2', inputClass = 'form-check-input', labelClass = 'form-check-label', onChange, tooltipKey, name = '', value = '', disabled = false, isSwitch = false } = options;
        const checkId = id || `check-${generateUUID()}`;
        const finalWrapperClass = isSwitch ? `${wrapperClass} form-switch` : wrapperClass;
        const wrapper = ui_helpers.createElementWithAttributes('div', { class: finalWrapperClass });
        const input = ui_helpers.createElementWithAttributes('input', { type: 'checkbox', class: inputClass, id: checkId, name, value });
        if (checked) input.checked = true;
        if (disabled) input.disabled = true;
        const labelEl = ui_helpers.createElementWithAttributes('label', { class: labelClass, for: checkId }, label);

        if (onChange && typeof onChange === 'function') {
            input.addEventListener('change', onChange);
        }
        if (tooltipKey) {
            wrapper.setAttribute('data-tippy-content-key', tooltipKey);
        }
        wrapper.appendChild(input);
        wrapper.appendChild(labelEl);
        return wrapper;
    }


    function createT2CriteriaControl(criterionKey, criterionConfig, currentCriterionState, options = {}) {
        const { onActiveChange, onValueChange, onThresholdChange, onLogicChange } = options;
        const controlIdBase = `t2-criterion-${criterionKey}`;
        const wrapper = ui_helpers.createElementWithAttributes('div', { class: 'mb-3 border p-3 rounded criteria-group' + (currentCriterionState.active ? '' : ' disabled-criterion-control') });
        const mainLabelText = criterionConfig.label || criterionKey.charAt(0).toUpperCase() + criterionKey.slice(1);

        const headerDiv = ui_helpers.createElementWithAttributes('div', {class: 'd-flex justify-content-between align-items-center mb-2'});
        const activeCheckbox = createCheckbox({
            id: `${controlIdBase}-active`,
            label: mainLabelText,
            checked: currentCriterionState.active,
            isSwitch: true,
            wrapperClass: 'form-check m-0',
            onChange: (e) => {
                if (onActiveChange) onActiveChange(criterionKey, e.target.checked);
                wrapper.classList.toggle('disabled-criterion-control', !e.target.checked);
            },
            tooltipKey: `tooltip.t2${criterionKey.charAt(0).toUpperCase() + criterionKey.slice(1)}`
        });
        headerDiv.appendChild(activeCheckbox);
        wrapper.appendChild(headerDiv);

        const optionsContainer = ui_helpers.createElementWithAttributes('div', {class: 'criteria-options-container' + (currentCriterionState.active ? '' : ' d-none') });

        if (criterionKey === 'size') {
            const rangeInput = createRangeInput({
                id: `${controlIdBase}-threshold`,
                min: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                max: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                step: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step,
                value: currentCriterionState.threshold,
                unit: 'mm',
                wrapperClass: 'mt-2',
                disabled: !currentCriterionState.active,
                onInput: (e) => {
                    if (onThresholdChange) onThresholdChange(criterionKey, parseFloat(e.target.value));
                }
            });
            optionsContainer.appendChild(rangeInput);
        } else {
            const valueOptions = APP_CONFIG.T2_CRITERIA_SETTINGS[`${criterionKey.toUpperCase()}_VALUES`] || [];
            const buttonGroup = ui_helpers.createElementWithAttributes('div', { class: 'btn-group flex-wrap mt-2', role: 'group', 'aria-label': `${mainLabelText} Optionen`});
            valueOptions.forEach(valOpt => {
                const btn = createButton({
                    id: `${controlIdBase}-value-${valOpt.replace(/\s/g, '_')}`,
                    text: valOpt,
                    btnClass: `btn-sm t2-criteria-button ${currentCriterionState.value === valOpt ? 'active' : ''}`,
                    onClick: () => {
                        if(onValueChange) onValueChange(criterionKey, valOpt);
                        Array.from(buttonGroup.querySelectorAll('.t2-criteria-button')).forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    },
                    extraAttributes: { 'data-value': valOpt, disabled: !currentCriterionState.active }
                });
                buttonGroup.appendChild(btn);
            });
            optionsContainer.appendChild(buttonGroup);
        }
        wrapper.appendChild(optionsContainer);

        activeCheckbox.querySelector('input').addEventListener('change', (e) => {
           optionsContainer.classList.toggle('d-none', !e.target.checked);
           optionsContainer.querySelectorAll('input, button').forEach(el => el.disabled = !e.target.checked);
        });
         optionsContainer.querySelectorAll('input, button').forEach(el => el.disabled = !currentCriterionState.active);

        return wrapper;
    }

    function createBruteForceResultItem(result, rank, targetMetric) {
        const li = ui_helpers.createElementWithAttributes('li', { class: 'list-group-item d-flex justify-content-between align-items-start flex-wrap' });
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
        const criteriaString = formatCriteriaFunc(result.criteria, result.logic);
        const mainContent = ui_helpers.createElementWithAttributes('div', {class: 'ms-2 me-auto'});
        const title = ui_helpers.createElementWithAttributes('div', {class: 'fw-bold'}, `Rang ${rank}: ${formatNumber(result.metricValue, 4)} (${targetMetric})`);
        const criteriaDesc = ui_helpers.createElementWithAttributes('small', {class: 'd-block text-muted'}, `${result.logic.toUpperCase()}: ${criteriaString}`);
        mainContent.appendChild(title);
        mainContent.appendChild(criteriaDesc);

        const metricsContainer = ui_helpers.createElementWithAttributes('div', { class: 'mt-2 w-100 border-top pt-2' });
        const metricsGrid = ui_helpers.createElementWithAttributes('div', {style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 5px; font-size: 0.8rem;'});

        const metricsToShow = {
            "Sens.": formatPercent(result.sens, 1), "Spez.": formatPercent(result.spez, 1),
            "PPV": formatPercent(result.ppv, 1), "NPV": formatPercent(result.npv, 1),
            "Acc.": formatPercent(result.acc, 1), "Bal. Acc.": formatNumber(result.balAcc, 3),
            "F1": formatNumber(result.f1, 3)
        };
        for (const [key, value] of Object.entries(metricsToShow)) {
            metricsGrid.appendChild(ui_helpers.createElementWithAttributes('div', {}, `<strong>${key}:</strong> ${value}`));
        }

        const confusionMatrixDiv = ui_helpers.createElementWithAttributes('div', { class: 'mt-1' },
            `<strong>Matrix:</strong> RP=${result.rp}, FP=${result.fp}, FN=${result.fn}, RN=${result.rn}`
        );
        metricsGrid.appendChild(confusionMatrixDiv);
        metricsContainer.appendChild(metricsGrid);

        li.appendChild(mainContent);
        li.appendChild(metricsContainer);
        return li;
    }


    function createBruteForceResultsModalContent(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) {
            return ui_helpers.createElementWithAttributes('p', {class: 'text-muted text-center'}, 'Keine Ergebnisse für diese Optimierung vorhanden.');
        }
        const { results, metric, kollektiv, duration, totalTested, nGesamt, nPlus, nMinus } = resultsData;
        const wrapper = document.createDocumentFragment();
        const kollektivName = getKollektivDisplayName(kollektiv);

        const infoDiv = ui_helpers.createElementWithAttributes('div', {class: 'alert alert-info small'});
        infoDiv.innerHTML = `
            <strong>Kollektiv:</strong> ${ui_helpers.escapeHTML(kollektivName)} (N=${formatNumber(nGesamt,0)}, N+=${formatNumber(nPlus,0)}, N-=${formatNumber(nMinus,0)})<br>
            <strong>Zielmetrik:</strong> ${ui_helpers.escapeHTML(metric)}<br>
            <strong>Getestete Kombinationen:</strong> ${formatNumber(totalTested,0)}<br>
            <strong>Dauer:</strong> ${formatNumber((duration || 0) / 1000, 1)} Sekunden
        `;
        wrapper.appendChild(infoDiv);

        const list = ui_helpers.createElementWithAttributes('ul', { class: 'list-group list-group-flush' });
        let rank = 1;
        let lastMetricValue = -Infinity;
        const precision = 8;

        results.forEach((result, index) => {
            if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) return;
            const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
            const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
            if (index > 0 && Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8) {
                rank = index + 1;
            }
            lastMetricValue = result.metricValue;
            list.appendChild(createBruteForceResultItem(result, rank, metric));
        });
        wrapper.appendChild(list);
        return wrapper;
    }

    function createDashboardMetricsCard(id, title, value, tooltipKey = null, iconClass = null, trend = null) {
        const cardId = `dashboard-card-${id}`;
        const cardHeader = ui_helpers.createElementWithAttributes('div', {class: 'card-header dashboard-card-header'}, title);
        const cardBody = ui_helpers.createElementWithAttributes('div', {class: 'card-body text-center'});
        const valueDisplay = ui_helpers.createElementWithAttributes('h4', {class: 'display-6 my-2', id: `${cardId}-value` }, value);
        cardBody.appendChild(valueDisplay);

        if (iconClass) {
            const iconEl = createIconElement(iconClass, { size: 22, class: 'position-absolute top-0 end-0 m-2 text-muted opacity-50'});
            cardBody.appendChild(iconEl);
        }
        if(trend !== null && !isNaN(trend)){
            const trendIconClass = trend > 0 ? 'fa-arrow-up text-success' : (trend < 0 ? 'fa-arrow-down text-danger' : 'fa-minus text-secondary');
            const trendEl = ui_helpers.createElementWithAttributes('small', {class: 'd-block text-muted'}, ui_helpers.getIcon(trendIconClass, { class: 'me-1'}) + `${formatNumber(Math.abs(trend),1)}%`);
            cardBody.appendChild(trendEl);
        }

        const card = createCard({id: cardId, headerContent: cardHeader, bodyContent: cardBody, cardClass: 'dashboard-card shadow-sm h-100'});
        if(tooltipKey) card.setAttribute('data-tippy-content-key', tooltipKey);
        return card;
    }

    function createCriteriaComparisonTable(results, currentGlobalKollektiv) {
        const table = ui_helpers.createElementWithAttributes('table', { class: 'table table-sm table-hover data-table publication-table mt-0' });
        const thead = ui_helpers.createElementWithAttributes('thead', { class: 'sticky-top' });
        const tbody = document.createElement('tbody');
        const headers = ['Methode/Kriteriensatz', 'Sens.', 'Spez.', 'PPV', 'NPV', 'Acc.', 'AUC/BalAcc'];
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            headerRow.appendChild(ui_helpers.createElementWithAttributes('th', {}, headerText));
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        results.forEach(result => {
            const row = document.createElement('tr');
            let name = result.name || 'Unbekannt';
            let nameSuffix = '';
            if (result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) name = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
            else if (result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) name = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;

            if (result.specificKollektivName && result.specificKollektivName !== currentGlobalKollektiv && result.id !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID && result.id !== APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                nameSuffix = ` (eval. auf ${getKollektivDisplayName(result.specificKollektivName)}, N=${result.specificKollektivN || '?'})`;
            } else if (result.specificKollektivN !== undefined) {
                 nameSuffix = ` (N=${result.specificKollektivN || '?'})`;
            }
            row.appendChild(ui_helpers.createElementWithAttributes('td', {}, `${ui_helpers.escapeHTML(name)}${ui_helpers.escapeHTML(nameSuffix)}`));
            ['sens', 'spez', 'ppv', 'npv', 'acc'].forEach(metric => {
                row.appendChild(ui_helpers.createElementWithAttributes('td', {}, formatPercent(result[metric], 1)));
            });
            row.appendChild(ui_helpers.createElementWithAttributes('td', {}, formatNumber(result.auc, 3)));
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }

    function createPatientCharacteristicTable(stats, tableId, captionText) {
         const table = ui_helpers.createElementWithAttributes('table', {class: 'table table-sm table-bordered data-table publication-table', id: tableId});
         const caption = ui_helpers.createElementWithAttributes('caption', {}, captionText); table.appendChild(caption);
         const thead = document.createElement('thead'); const tbody = document.createElement('tbody');
         const headers = ['Merkmal', 'Wert']; const headerRow = document.createElement('tr'); headers.forEach(h => headerRow.appendChild(ui_helpers.createElementWithAttributes('th',{},h))); thead.appendChild(headerRow);
         const addRow = (label, value) => { const r = document.createElement('tr'); r.appendChild(ui_helpers.createElementWithAttributes('td',{},label)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},value)); tbody.appendChild(r);};
         if (stats) {
             addRow('Anzahl Patienten', stats.anzahlPatienten);
             addRow('Median Alter (Jahre) [Min-Max]', `${formatNumber(stats.alter.median,1)} [${formatNumber(stats.alter.min,0)}-${formatNumber(stats.alter.max,0)}]`);
             addRow('Mittleres Alter ± SD (Jahre)', `${formatNumber(stats.alter.mean,1)} ± ${formatNumber(stats.alter.sd,1)}`);
             addRow('Geschlecht (männlich / weiblich) (n (%))', `${stats.geschlecht.m} (${formatPercent(stats.geschlecht.m/stats.anzahlPatienten,1)}) / ${stats.geschlecht.f} (${formatPercent(stats.geschlecht.f/stats.anzahlPatienten,1)})`);
             addRow('Therapie (Direkt OP / nRCT) (n (%))', `${stats.therapie['direkt OP']} (${formatPercent(stats.therapie['direkt OP']/stats.anzahlPatienten,1)}) / ${stats.therapie.nRCT} (${formatPercent(stats.therapie.nRCT/stats.anzahlPatienten,1)})`);
             addRow('Pathologischer N-Status (N+ / N-) (n (%))', `${stats.nStatus.plus} (${formatPercent(stats.nStatus.plus/stats.anzahlPatienten,1)}) / ${stats.nStatus.minus} (${formatPercent(stats.nStatus.minus/stats.anzahlPatienten,1)})`);
         } else { addRow('Daten nicht verfügbar', '--'); }
         table.appendChild(thead); table.appendChild(tbody); return table;
    }

    function createPerformanceTable(performanceData, methodName, tableId, captionText) {
        const table = ui_helpers.createElementWithAttributes('table', {class: 'table table-sm table-bordered data-table publication-table', id: tableId});
        const caption = ui_helpers.createElementWithAttributes('caption', {}, captionText); table.appendChild(caption);
        const thead = document.createElement('thead'); const tbody = document.createElement('tbody');
        const headers = ['Metrik', 'Wert (95% CI)']; const headerRow = document.createElement('tr'); headers.forEach(h => headerRow.appendChild(ui_helpers.createElementWithAttributes('th',{},h))); thead.appendChild(headerRow);
        const addRow = (label, metricObj, digits = 1, isPercent = true) => { const r = document.createElement('tr'); r.appendChild(ui_helpers.createElementWithAttributes('td',{},label)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},formatCI(metricObj?.value, metricObj?.ci?.lower, metricObj?.ci?.upper, digits, isPercent, '--'))); tbody.appendChild(r);};
        if (performanceData) {
            addRow('Sensitivität', performanceData.sens); addRow('Spezifität', performanceData.spez); addRow('PPV', performanceData.ppv); addRow('NPV', performanceData.npv); addRow('Accuracy', performanceData.acc); addRow('Balanced Accuracy', performanceData.balAcc); addRow('F1-Score', performanceData.f1, 3, false); addRow('AUC', performanceData.auc, 3, false);
            addRow('LR+', performanceData.lrPlus, 2, false); addRow('LR-', performanceData.lrMinus, 2, false);
        } else { addRow('Daten nicht verfügbar', null); }
        table.appendChild(thead); table.appendChild(tbody); return table;
    }

     function createComparisonTestTable(comparisonData, method1Name, method2Name, tableId, captionText) {
        const table = ui_helpers.createElementWithAttributes('table', {class: 'table table-sm table-bordered data-table publication-table', id: tableId});
        const caption = ui_helpers.createElementWithAttributes('caption', {}, captionText); table.appendChild(caption);
        const thead = document.createElement('thead'); const tbody = document.createElement('tbody');
        const headers = ['Vergleich', 'Test Statistik', 'p-Wert', 'Methode']; const headerRow = document.createElement('tr'); headers.forEach(h => headerRow.appendChild(ui_helpers.createElementWithAttributes('th',{},h))); thead.appendChild(headerRow);
        const addRow = (label, testObj) => { const r = document.createElement('tr'); r.appendChild(ui_helpers.createElementWithAttributes('td',{},label)); r.appendChild(ui_helpers.createElementWithAttributes('td',{}, testObj?.statistic !== undefined && !isNaN(testObj.statistic) ? `${testObj.Z !== undefined && !isNaN(testObj.Z) ? 'Z=' : ''}${formatNumber(testObj.statistic ?? testObj.Z,3)} ${testObj.df ? `(df=${testObj.df})` : ''}` : '--')); r.appendChild(ui_helpers.createElementWithAttributes('td',{},`${getPValueText(testObj?.pValue)} ${getStatisticalSignificanceSymbol(testObj?.pValue)}`)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},testObj?.method || '--')); tbody.appendChild(r);};
        if (comparisonData) {
            addRow(`Vergleich Accuracy (${method1Name} vs. ${method2Name})`, comparisonData.mcnemar);
            addRow(`Vergleich AUC (${method1Name} vs. ${method2Name})`, comparisonData.delong);
        } else { addRow('Daten nicht verfügbar', null); }
        table.appendChild(thead); table.appendChild(tbody); return table;
    }

    function createT2BasisInfoCard(t2Set, currentKollektivForComparisonName) {
        if (!t2Set) return ui_helpers.createElementWithAttributes('p', {class: 'text-muted'}, 'Keine T2-Basisinformationen verfügbar.');
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
        const body = document.createElement('dl');
        const addDef = (term, def) => { if(def){ body.appendChild(ui_helpers.createElementWithAttributes('dt', {}, term)); body.appendChild(ui_helpers.createElementWithAttributes('dd', {}, ui_helpers.escapeHTML(def))); } };

        let displayName = t2Set.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME : t2Set.name;
        let criteriaStringToDisplay = t2Set.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID && typeof t2CriteriaManager !== 'undefined' ? formatCriteriaFunc(t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic()) : formatCriteriaFunc(t2Set.criteria, t2Set.logic);

        addDef('Name', displayName);
        addDef('Referenz', t2Set.reference);
        addDef('Analyse auf Kollektiv', getKollektivDisplayName(currentKollektivForComparisonName || t2Set.applicableKollektiv || 'Unbekannt'));
        addDef('Untersuchungsart (Original)', t2Set.investigationType);
        addDef('Fokus (Original)', t2Set.focus);
        addDef('Kriterien', criteriaStringToDisplay);

        return createCard({
            headerText: UI_TEXTS.praesentation.t2BasisInfoCard.title,
            bodyContent: body,
            cardClass: 'praes-t2-basis-info-card h-100',
            tooltipKey: 'praesentation.t2BasisInfoCard.description'
        });
    }

    function createDropdown(buttonOptions, items, dropdownId) {
        const dropdownWrapper = ui_helpers.createElementWithAttributes('div', { class: 'dropdown d-inline-block' });
        const button = createButton({ ...buttonOptions, class: `${buttonOptions.btnClass || 'btn-secondary'} dropdown-toggle`, extraAttributes: { 'data-bs-toggle': 'dropdown', 'aria-expanded': 'false', id: dropdownId } });
        const ul = ui_helpers.createElementWithAttributes('ul', { class: 'dropdown-menu', 'aria-labelledby': dropdownId });

        items.forEach(item => {
            const li = document.createElement('li');
            if (item.type === 'divider') {
                li.appendChild(ui_helpers.createElementWithAttributes('hr', { class: 'dropdown-divider' }));
            } else if (item.type === 'header') {
                li.appendChild(ui_helpers.createElementWithAttributes('h6', { class: 'dropdown-header' }, item.text));
            } else {
                const itemElement = ui_helpers.createElementWithAttributes(item.href ? 'a' : 'button', {
                    class: `dropdown-item ${item.itemClass || ''} ${item.isActive ? 'active' : ''} ${item.isDisabled ? 'disabled' : ''}`,
                    type: item.href ? null : 'button',
                    href: item.href || '#'
                });
                if (item.text) itemElement.textContent = item.text;
                if (item.html) itemElement.innerHTML = item.html;
                if (item.onClick && typeof item.onClick === 'function') itemElement.addEventListener('click', item.onClick);
                if (item.dataset) { Object.entries(item.dataset).forEach(([key, value]) => itemElement.setAttribute(`data-${key}`, value)); }
                li.appendChild(itemElement);
            }
            ul.appendChild(li);
        });
        dropdownWrapper.appendChild(button);
        dropdownWrapper.appendChild(ul);
        return dropdownWrapper;
    }

     function createListGroupItem(options = {}) {
        const { text, html, badgeText, badgeClass = 'bg-primary', itemClass = '', onClick, href, target, id } = options;
        const itemType = href ? 'a' : 'li';
        const itemAttrs = { class: `list-group-item d-flex justify-content-between align-items-center ${itemClass}` };
        if (id) itemAttrs.id = id;
        if (href) itemAttrs.href = href;
        if (target && href) itemAttrs.target = target;
        if (onClick && typeof onClick === 'function' && itemType === 'li') itemAttrs.role = 'button';

        const item = ui_helpers.createElementWithAttributes(itemType, itemAttrs);
        if (text) item.textContent = text;
        if (html) item.innerHTML = html;

        if (badgeText) {
            const badge = ui_helpers.createElementWithAttributes('span', { class: `badge rounded-pill ${badgeClass}` }, badgeText);
            item.appendChild(badge);
        }
        if (onClick && typeof onClick === 'function') item.addEventListener('click', onClick);
        return item;
    }


    return Object.freeze({
        createCard,
        createButton,
        createIcon: createIconElement,
        createSelect,
        createRangeInput,
        createCheckbox,
        createT2CriteriaControl,
        createBruteForceResultItem,
        createBruteForceResultsModalContent,
        createDashboardMetricsCard,
        createCriteriaComparisonTable,
        createPatientCharacteristicTable,
        createPerformanceTable,
        createComparisonTestTable,
        createT2BasisInfoCard,
        createDropdown,
        createListGroupItem
    });
})();
