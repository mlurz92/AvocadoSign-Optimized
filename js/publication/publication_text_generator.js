const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        return utils.formatCI(metric.value, metric.ci?.lower, metric.ci?.upper, digits, isPercent, 'N/A');
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = utils.getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `N=${utils.formatNumber(n, 0, 'N/A')}` : `n=${utils.formatNumber(n, 0, 'N/A')}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId) {
        return `#${elementId}`;
    }

    function getAbstractText(lang, allKollektivStats, commonData) {
        const gesamtStats = allKollektivStats?.Gesamt;
        const asGesamt = gesamtStats?.gueteAS;
        const bfGesamtStats = gesamtStats?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.vergleichASvsT2_bruteforce;
        
        const nGesamt = commonData.nGesamt || 0;
        const medianAge = gesamtStats?.deskriptiv?.alter?.median;
        const ageRangeText = (medianAge !== undefined) ? `${utils.formatNumber(medianAge, 0)} years (IQR: ${utils.formatNumber(gesamtStats.deskriptiv.alter.q1, 0)}–${utils.formatNumber(gesamtStats.deskriptiv.alter.q3, 0)} years)` : 'N/A';
        const sexText = lang === 'de' ? `${gesamtStats?.deskriptiv?.geschlecht?.m || 0} Männer` : `${gesamtStats?.deskriptiv?.geschlecht?.m || 0} men`;

        const sensASGesamt = utils.formatPercent(asGesamt?.sens?.value, 1);
        const spezASGesamt = utils.formatPercent(asGesamt?.spez?.value, 1);
        const aucASGesamt = utils.formatNumber(asGesamt?.auc?.value, 2, 'N/A', true);
        const aucCI = asGesamt?.auc?.ci ? `${utils.formatNumber(asGesamt.auc.ci.lower,2,undefined,true)}–${utils.formatNumber(asGesamt.auc.ci.upper,2,undefined,true)}` : 'N/A';
        const aucT2OptimiertGesamt = utils.formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true);
        const pWertVergleich = utils.getPValueText(vergleichASvsBFGesamt?.delong?.pValue, lang, true);
        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023";

        const abstractEn = `
            <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard magnetic resonance imaging (MRI) criteria have limitations.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective, single-center study analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS on T1w CE sequences. Histopathological examination of surgical specimens served as the reference standard. Sensitivity, specificity, and area under the receiver operating characteristic curve (AUC), with 95% confidence intervals (CIs), were calculated and compared using the DeLong test.</p>
            <p><strong>Results:</strong> A total of ${utils.formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${sensASGesamt}, a specificity of ${spezASGesamt}, and an AUC of ${aucASGesamt} (95% CI: ${aucCI}). For optimized T2w criteria, the AUC was ${aucT2OptimiertGesamt}. The difference in AUC between AS and optimized T2w criteria was not statistically significant (${pWertVergleich}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance comparable to cohort-optimized T2w criteria.</p>`;
        
        return `<div class="publication-abstract-section">
                    <h2 id="abstract-title">${lang === 'de' ? 'Zusammenfassung' : 'Abstract'}</h2>
                    <div class="abstract-content">${abstractEn.replace(/<p>/g, '<p lang="en">')}</div>
                </div>`;
    }

    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        if(sectionId === 'abstract_main') {
            return getAbstractText(lang, allKollektivStats, commonData);
        }
        return `<p class="text-muted">Inhalt für Sektion '${sectionId}' wird implementiert.</p>`;
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        return htmlContent
            .replace(/<p[^>]*>/g, '\n').replace(/<\/p>/g, '\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, `\n## $1\n`)
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ')
            .replace(/ +/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
