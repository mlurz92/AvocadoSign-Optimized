const publicationTextGenerator = (() => {

    const NA_STRING = "N/A"; // Not applicable or not available

    // Hilfsfunktionen für Textformatierung
    function _formatVal(value, digits = 1, unit = '', placeholder = NA_STRING) {
        if (value === null || value === undefined || isNaN(parseFloat(value))) return placeholder;
        return `${parseFloat(value).toFixed(digits)}${unit}`;
    }

    function _formatPercentVal(value, digits = 1, placeholder = NA_STRING) {
        if (value === null || value === undefined || isNaN(parseFloat(value))) return placeholder;
        return `${(parseFloat(value) * 100).toFixed(digits)}%`;
    }

    function _formatCIVal(metric, digits = 1, isPercent = true, placeholder = NA_STRING) {
        if (!metric || metric.value === undefined || isNaN(parseFloat(metric.value))) return placeholder;
        const valueStr = isPercent ? _formatPercentVal(metric.value, digits) : _formatVal(metric.value, digits);
        if (metric.ci && metric.ci.lower !== undefined && metric.ci.upper !== undefined && !isNaN(parseFloat(metric.ci.lower)) && !isNaN(parseFloat(metric.ci.upper))) {
            const lowerStr = isPercent ? _formatPercentVal(metric.ci.lower, digits, '') : _formatVal(metric.ci.lower, digits, '');
            const upperStr = isPercent ? _formatPercentVal(metric.ci.upper, digits, '') : _formatVal(metric.ci.upper, digits, '');
            return `${valueStr} (95% CI: ${lowerStr}\u00A0-\u00A0${upperStr})`;
        }
        return valueStr;
    }

    function _getPValueString(pValue, includeSymbol = true) {
        if (pValue === null || pValue === undefined || isNaN(parseFloat(pValue))) return NA_STRING;
        const p = parseFloat(pValue);
        let pStr = "";
        if (p < 0.001) pStr = "<0.001";
        else if (p < 0.01) pStr = p.toFixed(3);
        else if (p < 0.1) pStr = p.toFixed(2);
        else pStr = p.toFixed(2);

        return includeSymbol ? `${pStr}${getStatisticalSignificanceSymbol(p).length > 0 ? ' (' + getStatisticalSignificanceSymbol(p) + ')' : ''}` : pStr;
    }

    function _getStudyShortName(studyId) {
        const studyConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(s => s.id === studyId);
        return studyConf ? studyConf.shortName : studyId;
    }


    // --- Methoden-Texte ---
    function _getText_methoden_studienanlage(lang, data, commonData) {
        if (lang === 'de') {
            return `
                <h3>Studiendesign und Ethikfreigabe</h3>
                <p>Die vorliegende Untersuchung wurde als retrospektive Analyse prospektiv erhobener Daten einer monozentrischen Kohorte von Patienten mit histologisch gesichertem Rektumkarzinom konzipiert. Das ursprüngliche Patientenkollektiv wurde für die Evaluation des „Avocado Signs" rekrutiert, dessen Ergebnisse bereits publiziert wurden (Lurz & Schäfer, ${commonData.references.lurzSchaefer2025}). Für die aktuelle Analyse wurde eine spezifisch entwickelte, interaktive Webanwendung (${commonData.appName}, v${commonData.appVersion}) verwendet, die auf HTML5, CSS3 und JavaScript (ES6+) basiert und als primäres Werkzeug für die Datenauswertung, statistische Analyse und Visualisierung diente. Alle in dieser Arbeit berichteten Ergebnisse wurden mit dieser Software generiert.</p>
                <p>Die Studie wurde von der lokalen Ethikkommission genehmigt (Ethikkommission an der Medizinischen Fakultät der Universität Leipzig, Aktenzeichen: XYZ/2020 – *Platzhalter, muss angepasst werden*), und von allen eingeschlossenen Patienten lag eine schriftliche Einverständniserklärung vor. Die Untersuchung wurde in Übereinstimmung mit der Deklaration von Helsinki durchgeführt.</p>
            `;
        } else { // lang === 'en'
            return `
                <h3>Study Design and Ethical Approval</h3>
                <p>The present investigation was designed as a retrospective analysis of prospectively collected data from a single-center cohort of patients with histologically confirmed rectal cancer. The original patient cohort was recruited for the evaluation of the "Avocado Sign," the results of which have been previously published (Lurz & Schäfer, ${commonData.references.lurzSchaefer2025}). For the current analysis, a specifically developed, interactive web application (${commonData.appName}, v${commonData.appVersion}), based on HTML5, CSS3, and JavaScript (ES6+), was utilized as the primary tool for data processing, statistical analysis, and visualization. All results reported herein were generated using this software.</p>
                <p>The study was approved by the local institutional review board (Ethics Committee at the Medical Faculty of Leipzig University, reference number: XYZ/2020 – *placeholder, needs adjustment*), and written informed consent was obtained from all included patients. The investigation was conducted in accordance with the Declaration of Helsinki.</p>
            `;
        }
    }

    function _getText_methoden_patientenkollektiv(lang, data, commonData) {
         const gesamtN = data?.Gesamt?.deskriptiv?.anzahlPatienten || commonData.nGesamt;
         const direktOpN = data?.['direkt OP']?.deskriptiv?.anzahlPatienten || commonData.nDirektOP;
         const nRCTN = data?.nRCT?.deskriptiv?.anzahlPatienten || commonData.nNRCT;

        if (lang === 'de') {
            return `
                <h3>Patientenkollektiv</h3>
                <p>In die Analyse wurde das vollständige Kollektiv der ursprünglichen Avocado-Sign-Studie (Lurz & Schäfer, ${commonData.references.lurzSchaefer2025}) eingeschlossen. Dieses umfasste ${gesamtN} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar 2020 und November 2023 am Klinikum St. Georg Leipzig behandelt wurden. Von diesen Patienten erhielten ${nRCTN} eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${direktOpN} Patienten einer primären Operation ohne Vorbehandlung unterzogen wurden (Direkt-OP-Gruppe). Die Ausschlusskriterien der Primärstudie umfassten nicht resektable Tumoren und Kontraindikationen gegen eine MRT-Untersuchung.</p>
                <p>Die Datenbasis für diese Sekundäranalyse ist der identische, fest integrierte und präprozessierte Datensatz der Primärstudie. Dieser beinhaltet für jeden Patienten demographische Daten (Alter, Geschlecht), Therapieinformationen, den pathologischen N-Status (N+/N-) als Referenzstandard, den mittels kontrastverstärkter T1w-MRT ermittelten Avocado-Sign-Status (AS+/AS-) sowie detaillierte morphologische Informationen zu allen im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten (Kurzachsendurchmesser in mm, Form, Kontur, Homogenität, Signalintensität).</p>
            `;
        } else { // lang === 'en'
            return `
                <h3>Patient Cohort</h3>
                <p>The complete cohort from the original Avocado Sign study (Lurz & Schäfer, ${commonData.references.lurzSchaefer2025}) was included in this analysis. This comprised ${gesamtN} consecutive patients with histologically confirmed rectal cancer treated at the St. Georg Hospital Leipzig between January 2020 and November 2023. Of these patients, ${nRCTN} received neoadjuvant chemoradiotherapy (nRCT group), while ${direktOpN} patients underwent primary surgery without neoadjuvant treatment (upfront surgery group). Exclusion criteria from the primary study included unresectable tumors and contraindications to MRI examination.</p>
                <p>The database for this secondary analysis is the identical, fixed, and preprocessed dataset from the primary study. For each patient, this includes demographic data (age, sex), therapy information, pathological N-status (N+/N-) as the reference standard, the Avocado Sign status (AS+/AS-) determined by contrast-enhanced T1w-MRI, and detailed morphological information for all mesorectal lymph nodes visible on high-resolution T2w-MRI (short-axis diameter in mm, shape, border, homogeneity, signal intensity).</p>
            `;
        }
    }

    function _getText_methoden_mrt_protokoll(lang, data, commonData) {
        if (lang === 'de') {
            return `
                <h3>MRT-Protokoll und Kontrastmittelgabe</h3>
                <p>Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers) unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das Bildgebungsprotokoll umfasste hochauflösende sagittale, axiale und koronare T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen, eine axiale diffusionsgewichtete Bildgebung (DWI) sowie nach Kontrastmittelgabe eine axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Untersuchung (VIBE) mit Dixon-Fettunterdrückung. Die detaillierten Sequenzparameter sind in Tabelle X (siehe Originalpublikation Lurz & Schäfer, ${commonData.references.lurzSchaefer2025}, Tabelle 1) aufgeführt. Eine gewichtsadaptierte Dosis (0,2 ml/kg Körpergewicht) eines makrozyklischen Gadolinium-basierten Kontrastmittels (Gadoteridol; ProHance; Bracco) wurde intravenös verabreicht. Die kontrastverstärkten Aufnahmen wurden unmittelbar nach vollständiger Applikation des Kontrastmittels akquiriert. Butylscopolamin wurde zu Beginn und in der Mitte jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die initiale Staging-Untersuchung und das Restaging identisch.</p>
            `;
        } else { // lang === 'en'
            return `
                <h3>MRI Protocol and Contrast Administration</h3>
                <p>All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers) using body and spine array coils. The imaging protocol included high-resolution sagittal, axial, and coronal T2-weighted turbo spin echo (TSE) sequences, axial diffusion-weighted imaging (DWI), and post-contrast axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression. Detailed sequence parameters are listed in Table X (see original publication Lurz & Schäfer, ${commonData.references.lurzSchaefer2025}, Table 1). A weight-based dose (0.2 mL/kg body weight) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco) was administered intravenously. Contrast-enhanced images were acquired immediately after the intravenous contrast agent had been fully administered. Butylscopolamine was administered at the start and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations.</p>
            `;
        }
    }

    // ... Weitere Methoden-Texte (AS Definition, T2 Definition, Referenzstandard, Statistische Analyse)
    // Diese müssten analog und sehr detailliert ausgearbeitet werden.

    // --- Ergebnisse-Texte ---
    function _getText_ergebnisse_patientencharakteristika(lang, data, commonData) {
        const gesamtN = data?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const medianAlterGesamt = data?.Gesamt?.deskriptiv?.alter?.median !== undefined ? _formatVal(data.Gesamt.deskriptiv.alter.median,1) : NA_STRING;
        const alterRangeGesamt = data?.Gesamt?.deskriptiv?.alter ? `(${_formatVal(data.Gesamt.deskriptiv.alter.min,0)}–${_formatVal(data.Gesamt.deskriptiv.alter.max,0)})` : '';
        const maennlichGesamtN = data?.Gesamt?.deskriptiv?.geschlecht?.m || 0;
        const maennlichGesamtPerc = gesamtN > 0 ? _formatPercentVal(maennlichGesamtN / gesamtN, 1) : NA_STRING;

        if (lang === 'de') {
            return `
                <h3>Patientencharakteristika</h3>
                <p>Insgesamt wurden ${gesamtN} Patienten in die Analyse eingeschlossen. Das mediane Alter betrug ${medianAlterGesamt} Jahre ${alterRangeGesamt}. ${maennlichGesamtN} (${maennlichGesamtPerc}) der Patienten waren männlich. Detaillierte demographische Daten und klinische Charakteristika des Gesamtkollektivs sowie der Subgruppen (Direkt-OP und nRCT) sind in Tabelle 1 zusammengefasst.</p>
                `;
        } else { // lang === 'en'
            return `
                <h3>Patient Characteristics</h3>
                <p>A total of ${gesamtN} patients were included in the analysis. The median age was ${medianAlterGesamt} years ${alterRangeGesamt}. ${maennlichGesamtN} (${maennlichGesamtPerc}) of the patients were male. Detailed demographic data and clinical characteristics of the overall cohort and the subgroups (upfront surgery and nRCT) are summarized in Table 1.</p>
                `;
        }
    }

    function _getText_ergebnisse_as_performance(lang, data, commonData) {
        const gesamtStats = data?.Gesamt?.gueteAS;
        if (!gesamtStats) return `<p>Diagnostische Güte des Avocado Signs nicht verfügbar.</p>`;

        const sens = _formatCIVal(gesamtStats.sens);
        const spez = _formatCIVal(gesamtStats.spez);
        const ppv = _formatCIVal(gesamtStats.ppv);
        const npv = _formatCIVal(gesamtStats.npv);
        const acc = _formatCIVal(gesamtStats.acc);
        const auc = _formatCIVal(gesamtStats.auc, 3, false);

        if (lang === 'de') {
            return `
                <h3>Diagnostische Güte des Avocado Signs</h3>
                <p>Im Gesamtkollektiv (N=${data.Gesamt.deskriptiv.anzahlPatienten}) zeigte das Avocado Sign zur Vorhersage des pathologischen N-Status eine Sensitivität von ${sens}, eine Spezifität von ${spez}, einen positiven prädiktiven Wert (PPV) von ${ppv}, einen negativen prädiktiven Wert (NPV) von ${npv} und eine Gesamtgenauigkeit (Accuracy) von ${acc}. Die Fläche unter der ROC-Kurve (AUC) betrug ${auc}.</p>
                <p>Die diagnostische Güte für die Subgruppen 'Direkt OP' und 'nRCT' ist in Tabelle 2 detailliert aufgeführt.</p>
                `;
        } else { // lang === 'en'
            return `
                <h3>Diagnostic Performance of the Avocado Sign</h3>
                <p>In the overall cohort (N=${data.Gesamt.deskriptiv.anzahlPatienten}), the Avocado Sign demonstrated a sensitivity of ${sens}, a specificity of ${spez}, a positive predictive value (PPV) of ${ppv}, a negative predictive value (NPV) of ${npv}, and an accuracy of ${acc} for predicting pathological N-status. The area under the ROC curve (AUC) was ${auc}.</p>
                <p>The diagnostic performance for the subgroups 'Upfront Surgery' and 'nRCT' is detailed in Table 2.</p>
                `;
        }
    }

    // ... Weitere Ergebnis-Texte (Literatur T2, Optimierte T2, Vergleiche)
    // Diese müssten analog und sehr detailliert ausgearbeitet werden, inkl. Referenzierung von Tabellen/Charts.

    const sectionTextFunctions = {
        'methoden_studienanlage': _getText_methoden_studienanlage,
        'methoden_patientenkollektiv': _getText_methoden_patientenkollektiv,
        'methoden_mrt_protokoll': _getText_methoden_mrt_protokoll,
        // Weitere Methoden-Sektionen hier hinzufügen
        'ergebnisse_patientencharakteristika': _getText_ergebnisse_patientencharakteristika,
        'ergebnisse_as_performance': _getText_ergebnisse_as_performance,
        // Weitere Ergebnis-Sektionen hier hinzufügen
    };

    // Hauptfunktion, die vom publication_renderer.js aufgerufen wird
    function getSectionText(sectionId, lang, publicationData, kollektiveData, commonData) {
        if (sectionTextFunctions[sectionId]) {
            return sectionTextFunctions[sectionId](lang, publicationData, commonData); // kollektiveData ist in publicationData enthalten
        }
        return `<p class="text-warning">Textgenerator für Sektion '${sectionId}' und Sprache '${lang}' nicht implementiert.</p>`;
    }

    function getSectionTextAsMarkdown(sectionId, lang, publicationData, kollektiveData, commonData) {
        const htmlContent = getSectionText(sectionId, lang, publicationData, kollektiveData, commonData);
        // Einfache Konvertierung von HTML zu Markdown (rudimentär)
        let markdown = htmlContent
            .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
            .replace(/<h4>(.*?)<\/h4>/g, '\n#### $1\n')
            .replace(/<p>(.*?)<\/p>/g, '$1\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<i>(.*?)<\/i>/g, '*$1*')
            .replace(/<code>(.*?)<\/code>/g, '`$1`')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<li>/g, '* ')
            .replace(/<\/li>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(//g, ''); // Kommentare entfernen

        // Entferne mehrfache Leerzeilen und führende/nachfolgende Leerzeichen
        markdown = markdown.replace(/\n\s*\n/g, '\n\n').trim();
        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
