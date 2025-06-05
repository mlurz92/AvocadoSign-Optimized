const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', lang === 'en');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent);
        if (valStr === 'N/A') return valStr;


        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            const ciText = lang === 'de' ? '95%-KI' : '95% CI';

            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;

            if(isPercent){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})%`;
            } else {
                 return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `N=${formatNumber(n, 0, 'N/A')}` : `n=${formatNumber(n, 0, 'N/A')}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId){
        if (!elementId) return '#';
        return `#${elementId}`;
    }

    function getAbstractText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const bfGesamtStats = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = allKollektivStats?.Gesamt?.vergleichASvsT2_bruteforce;
        const statsAS = allKollektivStats?.Gesamt?.gueteAS;

        let aucASGesamt = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        let sensASGesamt = asGesamt?.sens?.value !== undefined ? formatPercent(asGesamt.sens.value, 1, 'N/A') : 'N/A';
        let spezASGesamt = asGesamt?.spez?.value !== undefined ? formatPercent(asGesamt.spez.value, 1, 'N/A') : 'N/A';
        let accASGesamt = asGesamt?.acc?.value !== undefined ? formatPercent(asGesamt.acc.value, 1, 'N/A') : 'N/A';

        let aucAsDirektOP = allKollektivStats?.['direkt OP']?.gueteAS?.auc?.value !== undefined ? formatNumber(allKollektivStats['direkt OP'].gueteAS.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        let sensAsDirektOP = allKollektivStats?.['direkt OP']?.gueteAS?.sens?.value !== undefined ? formatPercent(allKollektivStats['direkt OP'].gueteAS.sens.value, 1, 'N/A') : 'N/A';
        let spezAsDirektOP = allKollektivStats?.['direkt OP']?.gueteAS?.spez?.value !== undefined ? formatPercent(allKollektivStats['direkt OP'].gueteAS.spez.value, 1, 'N/A') : 'N/A';

        let aucAsNRCT = allKollektivStats?.nRCT?.gueteAS?.auc?.value !== undefined ? formatNumber(allKollektivStats.nRCT.gueteAS.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        let sensAsNRCT = allKollektivStats?.nRCT?.gueteAS?.sens?.value !== undefined ? formatPercent(allKollektivStats.nRCT.gueteAS.sens.value, 1, 'N/A') : 'N/A';
        let spezAsNRCT = allKollektivStats?.nRCT?.gueteAS?.spez?.value !== undefined ? formatPercent(allKollektivStats.nRCT.gueteAS.spez.value, 1, 'N/A') : 'N/A';

        let aucT2OptimiertGesamt = bfGesamtStats?.auc?.value !== undefined ? formatNumber(bfGesamtStats.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        let pWertVergleich = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue, lang, true) : 'N/A';
        let vergleichPerformanceTextDe = "eine vergleichbare";
        let vergleichPerformanceTextEn = "comparable";

        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && statsAS?.auc?.value !== undefined && bfGesamtStats?.auc?.value !== undefined) {
            if (vergleichASvsBFGesamt.delong.pValue < (commonData.significanceLevel || 0.05)) {
                if (statsAS.auc.value > bfGesamtStats.auc.value) {
                    vergleichPerformanceTextDe = "eine signifikant überlegene";
                    vergleichPerformanceTextEn = "significantly superior";
                } else if (statsAS.auc.value < bfGesamtStats.auc.value) {
                    vergleichPerformanceTextDe = "eine signifikant unterlegene";
                    vergleichPerformanceTextEn = "significantly inferior";
                }
            }
        }

        const mainAbstractTextDe = (PUBLICATION_CONFIG.DEFAULT_ABSTRACT_TEXT_DE || "")
            .replace(/Sensitivität\s*\d{1,3}(?:[,\.]\d)?%/, `Sensitivität ${sensASGesamt}`)
            .replace(/Spezifität\s*\d{1,3}(?:[,\.]\d)?%/, `Spezifität ${spezASGesamt}`)
            .replace(/Accuracy\s*\d{1,3}(?:[,\.]\d)?%/, `Accuracy ${accASGesamt}`)
            .replace(/AUC\s*\d(?:[,\.]\d{1,2})?\s*\)/, `AUC ${aucASGesamt})`)
            .replace(/Primärchirurgie-\s*\(Sensitivität\s*\d{1,3}(?:[,\.]\d)?%,\s*Spezifität\s*\d{1,3}(?:[,\.]\d)?%,\s*AUC\s*\d(?:[,\.]\d{1,2})?\)/, `Primärchirurgie- (Sensitivität ${sensAsDirektOP}, Spezifität ${spezAsDirektOP}, AUC ${aucAsDirektOP})`)
            .replace(/nRCT-Gruppe\s*\(Sensitivität\s*\d{1,3}(?:[,\.]\d)?%,\s*Spezifität\s*\d{1,3}(?:[,\.]\d)?%,\s*AUC\s*\d(?:[,\.]\d{1,2})?\)/, `nRCT-Gruppe (Sensitivität ${sensAsNRCT}, Spezifität ${spezAsNRCT}, AUC ${aucAsNRCT})`)
            .replace(/\[PLATZHALTER_AUC_T2_OPTIMIERT_GESAMT\]/, aucT2OptimiertGesamt)
            .replace(/\[eine überlegene\/vergleichbare\/unterlegene\]/, vergleichPerformanceTextDe)
            .replace(/p=\[PLATZHALTER_P_WERT_VERGLEICH\]/, pWertVergleich);

        const mainAbstractTextEn = (PUBLICATION_CONFIG.DEFAULT_ABSTRACT_TEXT_EN || "")
            .replace(/sensitivity\s*\d{1,3}(?:[,\.]\d)?%/, `sensitivity ${sensASGesamt}`)
            .replace(/specificity\s*\d{1,3}(?:[,\.]\d)?%/, `specificity ${spezASGesamt}`)
            .replace(/accuracy\s*\d{1,3}(?:[,\.]\d)?%/, `accuracy ${accASGesamt}`)
            .replace(/AUC\s*\d(?:[,\.]\d{1,2})?\)/, `AUC ${aucASGesamt})`)
            .replace(/upfront surgery\s*\(sensitivity\s*\d{1,3}(?:[,\.]\d)?%,\s*specificity\s*\d{1,3}(?:[,\.]\d)?%,\s*AUC\s*\d(?:[,\.]\d{1,2})?\)/, `upfront surgery (sensitivity ${sensAsDirektOP}, specificity ${spezAsDirektOP}, AUC ${aucAsDirektOP})`)
            .replace(/nRCT groups\s*\(sensitivity\s*\d{1,3}(?:[,\.]\d)?%,\s*specificity\s*\d{1,3}(?:[,\.]\d)?%,\s*AUC\s*\d(?:[,\.]\d{1,2})?\)/, `nRCT groups (sensitivity ${sensAsNRCT}, specificity ${spezAsNRCT}, AUC ${aucAsNRCT})`)
            .replace(/\[PLACEHOLDER_AUC_T2_OPTIMIZED_OVERALL\]/, aucT2OptimiertGesamt)
            .replace(/\[superior\/comparable\/inferior\]/, vergleichPerformanceTextEn)
            .replace(/p=\[PLACEHOLDER_P_VALUE_COMPARISON\]/, pWertVergleich);

        const keyResultsTextDe = (PUBLICATION_CONFIG.DEFAULT_KEY_RESULTS_TEXT_DE || "")
            .replace(/AUC\s*\d(?:[,\.]\d{1,2})?\s*\)/, `AUC ${aucASGesamt})`)
            .replace(/\[ÜBERLEGENE\/VERGLEICHBARE\/UNTERLEGENE\]/, vergleichPerformanceTextDe.toUpperCase());
        const keyResultsTextEn = (PUBLICATION_CONFIG.DEFAULT_KEY_RESULTS_TEXT_EN || "")
            .replace(/AUC\s*\d(?:[,\.]\d{1,2})?\s*\)/, `AUC ${aucASGesamt})`)
            .replace(/\[SUPERIOR\/COMPARABLE\/INFERIOR\]/, vergleichPerformanceTextEn.toUpperCase());

        return `
            <div class="publication-abstract-section">
                <h2 id="abstract-title">${lang === 'de' ? 'Abstract' : 'Abstract'}</h2>
                <div class="abstract-content">${lang === 'de' ? mainAbstractTextDe : mainAbstractTextEn}</div>
                <h3 id="key-results-title">${lang === 'de' ? 'Key Results' : 'Key Results'}</h3>
                <div class="key-results-content">${lang === 'de' ? keyResultsTextDe : keyResultsTextEn}</div>
            </div>
        `;
    }

    function getIntroductionText(lang, commonData) {
        const lurzSchaeferRef = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const anzahlGesamt = commonData.nGesamt ? formatNumber(commonData.nGesamt, 0) : 'N/A';

        if (lang === 'de') {
            return `
                <h2 id="introduction-title">Einleitung</h2>
                <p>Die präoperative exakte Bestimmung des Nodalstatus (N-Status) beim Rektumkarzinom ist für die Therapieplanung und Prognoseabschätzung von entscheidender Bedeutung. Die Magnetresonanztomographie (MRT) ist die etablierte Methode für das lokale Staging, jedoch basiert die Lymphknotenbeurteilung traditionell auf morphologischen Kriterien in T2-gewichteten (T2w) Sequenzen, deren diagnostische Genauigkeit, insbesondere die Spezifität, Limitationen aufweist [1-3]. Dies führt zu Unsicherheiten in der Therapieentscheidung, insbesondere im Hinblick auf die Indikationsstellung zur neoadjuvanten Therapie (nCRT) und der zunehmenden Bedeutung organerhaltender Strategien [4,5].</p>
                <p>In einer vorangegangenen Arbeit wurde das "Avocado Sign" (AS) als neuer, vielversprechender MRT-Marker für die Detektion mesorektaler Lymphknotenmetastasen vorgestellt. Dieses Zeichen, charakterisiert durch einen hypointensen Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens in kontrastmittelverstärkten (KM) T1-gewichteten (T1w) Sequenzen, zeigte eine hohe diagnostische Güte in einem Kollektiv von ${anzahlGesamt} Patienten (${lurzSchaeferRef}).</p>
                <p>Ziel der vorliegenden Arbeit ist es, die diagnostische Leistung des Avocado Signs detailliert mit der Performance etablierter Literatur-basierter T2w-Kriterien sowie mit datengetrieben optimierten T2w-Kriterienkombinationen zu vergleichen. Hierfür wird derselbe Patienten-Datensatz (${lurzSchaeferRef}) re-evaluiert und die Ergebnisse unter Verwendung eines speziell entwickelten Analyse-Tools explorativ untersucht. Es soll die Hypothese geprüft werden, ob das Avocado Sign eine überlegene oder zumindest vergleichbare diagnostische Alternative zu den komplexeren T2w-Kriterien darstellt und somit das Potenzial hat, das MRT-Staging des Rektumkarzinoms zu vereinfachen und möglicherweise zu verbessern.</p>
            `;
        } else {
            return `
                <h2 id="introduction-title">Introduction</h2>
                <p>Accurate preoperative determination of nodal status (N-status) in rectal cancer is crucial for treatment planning and prognostic assessment. Magnetic resonance imaging (MRI) is the established modality for local staging; however, lymph node assessment traditionally relies on morphological criteria in T2-weighted (T2w) sequences, which have shown limitations in diagnostic accuracy, particularly specificity [1-3]. This leads to uncertainties in therapeutic decision-making, especially concerning the indication for neoadjuvant chemoradiotherapy (nCRT) and the increasing importance of organ-preserving strategies [4,5].</p>
                <p>In previous work, the "Avocado Sign" (AS) was introduced as a novel, promising MRI marker for the detection of mesorectal lymph node metastases. This sign, characterized by a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced (CE) T1-weighted (T1w) sequences, demonstrated high diagnostic performance in a cohort of ${anzahlGesamt} patients (${lurzSchaeferRef}).</p>
                <p>The aim of the present study is to compare the diagnostic performance of the Avocado Sign in detail with that of established literature-based T2w criteria and data-driven optimized T2w criteria combinations. For this purpose, the same patient dataset (${lurzSchaeferRef}) is re-evaluated, and the results are exploratively investigated using a custom-developed analysis tool. We hypothesize that the Avocado Sign offers a superior or at least comparable diagnostic alternative to the more complex T2w criteria, thereby potentially simplifying and possibly improving MRI staging of rectal cancer.</p>
            `;
        }
    }

    function getMethodenStudienanlageEthikText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const studyReferenceAS = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const ethicsVote = commonData.references?.ETHICS_VOTE_LEIPZIG || "Ethikvotum Nr. 2023-101, Ethikkommission der Medizinischen Fakultät der Universität Leipzig";

        if (lang === 'de') {
            return `
                <h3 id="methoden-studienanlage-ethik-title">Studiendesign und Ethikvotum</h3>
                <p>Diese Untersuchung erfolgte als retrospektive Analyse eines prospektiv akquirierten, monozentrischen Kollektivs von Patienten mit histologisch gesichertem Rektumkarzinom. Das Patientenkollektiv und die zugrundeliegenden MRT-Daten sind identisch mit denen der Originalpublikation zum Avocado Sign (${studyReferenceAS}). Die aktuelle Analyse dient dem vertieften Vergleich der diagnostischen Güte des AS mit T2-gewichteten morphologischen Kriterien sowie der explorativen Untersuchung mittels eines interaktiven Analyse-Tools.</p>
                <p>Sämtliche Auswertungen erfolgten unter Verwendung der Webanwendung "${APP_CONFIG.APP_NAME}" (Version ${appVersion}). Diese Software wurde spezifisch für die detaillierte Analyse und den Vergleich diagnostischer Marker beim Rektumkarzinom-Staging entwickelt. Die Studie wurde konform mit den ethischen Grundsätzen der Deklaration von Helsinki durchgeführt. Ein positives Ethikvotum der zuständigen Ethikkommission (${ethicsVote}) lag für die ursprüngliche Datenerhebung und -auswertung vor. Für die vorliegende retrospektive Re-Analyse und erweiterte Auswertung der pseudonymisierten Daten wurde kein separates Votum eingeholt, da dies durch das initiale Votum abgedeckt war und die Patienten in die wissenschaftliche Auswertung ihrer Daten eingewilligt hatten.</p>
            `;
        } else {
            return `
                <h3 id="methoden-studienanlage-ethik-title">Study Design and Ethical Approval</h3>
                <p>This investigation was conducted as a retrospective analysis of a prospectively acquired, single-center cohort of patients with histologically confirmed rectal cancer. The patient cohort and the underlying MRI data are identical to those from the original Avocado Sign publication (${studyReferenceAS}). The current analysis serves to provide an in-depth comparison of the diagnostic performance of the AS with T2-weighted morphological criteria, as well as for exploratory investigation using an interactive analysis tool.</p>
                <p>All evaluations were performed using the web application "${APP_CONFIG.APP_NAME}" (Version ${appVersion}). This software was specifically developed for the detailed analysis and comparison of diagnostic markers in rectal cancer staging. The study was conducted in accordance with the ethical principles of the Declaration of Helsinki. Ethical approval for the initial data acquisition and evaluation was obtained from the responsible ethics committee (${ethicsVote}). For the present retrospective re-analysis and extended evaluation of pseudonymized data, separate ethical approval was not sought, as this was covered by the initial approval and patients had consented to the scientific evaluation of their data.</p>
            `;
        }
    }

    function getMethodenPatientenkohorteText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const studienzeitraum = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023";

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anteilMaennerProzent = formatPercent(anzahlPatientenChar > 0 ? anzahlMaenner / anzahlPatientenChar : NaN, 0);
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        if (lang === 'de') {
            return `
                <h3 id="methoden-patientenkohorte-title">Patientenkohorte und Einschlusskriterien</h3>
                <p>In diese Studie wurden konsekutiv ${anzahlGesamt} Patienten eingeschlossen, bei denen zwischen ${studienzeitraum} ein Rektumkarzinom diagnostiziert und die primäre Staging-MRT-Untersuchung sowie die anschließende Therapie und Operation am Klinikum St. Georg, Leipzig, erfolgten. Das mittlere Alter der Patienten betrug ${alterMedian} Jahre (Spannweite: ${alterMin}–${alterMax} Jahre); ${anteilMaennerProzent} der Kohorte (${anzahlMaenner}/${anzahlPatientenChar}) waren männlich. ${anzahlNRCT} Patienten (${formatPercent(anzahlNRCT/anzahlGesamt,0)}) erhielten eine neoadjuvante Radiochemotherapie (nRCT), während ${anzahlDirektOP} Patienten (${formatPercent(anzahlDirektOP/anzahlGesamt,0)}) primär chirurgisch versorgt wurden. Die detaillierten demographischen und klinischen Charakteristika sind in <a href="${_getSafeLink(table1Id)}">Tabelle Ergebnisse 1</a> aufgeführt. Das Flussdiagramm zur Patientenrekrutierung ist in <a href="${_getSafeLink(flowDiagramId)}">Abbildung Methoden 1</a> dargestellt.</p>
                <p>Einschlusskriterien waren ein Alter $\geq 18$ Jahre und ein histologisch gesichertes Adenokarzinom des Rektums. Ausschlusskriterien umfassten Kontraindikationen gegen eine MRT-Untersuchung oder die Gabe von Gadolinium-basiertem Kontrastmittel sowie bereits extern erfolgte Vorbehandlungen, die eine standardisierte Bildgebung und Therapie im eigenen Zentrum verhinderten. Alle Patienten gaben ihr schriftliches Einverständnis zur Studienteilnahme und zur wissenschaftlichen Auswertung ihrer pseudonymisierten Daten.</p>
            `;
        } else {
            return `
                <h3 id="methoden-patientenkohorte-title">Patient Cohort and Inclusion Criteria</h3>
                <p>This study included ${anzahlGesamt} consecutive patients diagnosed with rectal cancer between ${studienzeitraum}, who underwent primary staging MRI, subsequent therapy, and surgery at the Klinikum St. Georg, Leipzig. The mean age of the patients was ${alterMedian} years (range: ${alterMin}–${alterMax} years); ${anteilMaennerProzent} of the cohort (${anzahlMaenner}/${anzahlPatientenChar}) were male. ${anzahlNRCT} patients (${formatPercent(anzahlNRCT/anzahlGesamt,0)}) received neoadjuvant chemoradiotherapy (nRCT), while ${anzahlDirektOP} patients (${formatPercent(anzahlDirektOP/anzahlGesamt,0)}) underwent upfront surgery. Detailed demographic and clinical characteristics are presented in <a href="${_getSafeLink(table1Id)}">Results Table 1</a>. The patient recruitment flowchart is depicted in <a href="${_getSafeLink(flowDiagramId)}">Methods Figure 1</a>.</p>
                <p>Inclusion criteria were age $\geq 18$ years and histologically confirmed adenocarcinoma of the rectum. Exclusion criteria comprised contraindications to MRI or administration of gadolinium-based contrast agents, as well as prior treatments performed externally that precluded standardized imaging and therapy at our institution. All patients provided written informed consent for study participation and scientific evaluation of their pseudonymized data.</p>
            `;
        }
    }
     function getMethodenMRTProtokollAkquisitionText(lang, commonData) {
        const mrtSystem = commonData.references?.MRI_SYSTEM_SIEMENS_3T || "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)";
        const kontrastmittel = commonData.references?.CONTRAST_AGENT_PROHANCE || "Gadoteridol (ProHance; Bracco)";
        const t2SliceThickness = "2-3 mm";
        const t1VibeSliceThickness = commonData.references?.LURZ_SCHAEFER_AS_2025 ? "1.5 mm" : "gemäß Protokoll der Primärstudie";


        if (lang === 'de') {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRT-Protokoll und Bildakquisition</h3>
                <p>Alle MRT-Untersuchungen erfolgten an einem ${mrtSystem} unter Verwendung dedizierter Körper- und Wirbelsäulen-Array-Spulen zur Signaloptimierung. Das standardisierte Untersuchungsprotokoll beinhaltete hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, transversaler und koronarer Orientierung mit einer Schichtdicke von ${t2SliceThickness}. Zusätzlich wurde eine axiale diffusionsgewichtete Sequenz (DWI) mit multiplen b-Werten (z.B. b0, b500, b1000 s/mm²) akquiriert. Für die Beurteilung des Avocado Signs wurde eine kontrastmittelverstärkte, transversale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung und einer Schichtdicke von ${t1VibeSliceThickness} durchgeführt. Detaillierte Sequenzparameter sind der Originalpublikation zum Avocado Sign zu entnehmen.</p>
                <p>Als Kontrastmittel diente ${kontrastmittel}, ein makrozyklisches Gadolinium-Chelat, das gewichtsadaptiert (0,1 mmol/kg Körpergewicht, entsprechend 0,2 ml/kg) intravenös appliziert wurde. Die KM-verstärkten Sequenzen wurden unmittelbar nach Abschluss der Kontrastmittelinjektion gestartet. Zur Minimierung von Bewegungsartefakten durch Peristaltik wurde Butylscopolamin (20 mg i.v.) zu Beginn und bei Bedarf erneut während der Untersuchung verabreicht. Das MRT-Protokoll war für die primäre Staging-Untersuchung sowie für das Restaging nach nRCT identisch, um eine optimale Vergleichbarkeit zu gewährleisten.</p>
            `;
        } else {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRI Protocol and Image Acquisition</h3>
                <p>All MRI examinations were performed on a ${mrtSystem} using dedicated body and spine array coils for signal optimization. The standardized examination protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, transverse, and coronal orientations with a slice thickness of ${t2SliceThickness}. Additionally, an axial diffusion-weighted imaging (DWI) sequence with multiple b-values (e.g., b0, b500, b1000 s/mm²) was acquired. For the assessment of the Avocado Sign, a contrast-enhanced transverse T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence with Dixon fat suppression and a slice thickness of ${t1VibeSliceThickness} was performed. Detailed sequence parameters can be found in the original Avocado Sign publication.</p>
                <p>The contrast agent used was ${kontrastmittel}, a macrocyclic gadolinium chelate, administered intravenously at a weight-adapted dose (0.1 mmol/kg body weight, corresponding to 0.2 mL/kg). Contrast-enhanced sequences were initiated immediately after completion of the contrast agent injection. To minimize motion artifacts due to peristalsis, butylscopolamine (20 mg IV) was administered at the beginning and, if necessary, again during the examination. The MRI protocol was identical for primary staging and for restaging after nRCT to ensure optimal comparability.</p>
            `;
        }
    }

    function getMethodenBildanalyseAvocadoSignText(lang, commonData) {
        const studyReferenceAS = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const radiologistExperience = commonData.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["29", "7", "19"];
        const fig2Link = `<a href="${_getSafeLink('pub-figure-avocado-sign-examples')}">${lang === 'de' ? 'Abbildung 2 der Originalpublikation' : 'Figure 2 of the original publication'}</a>`;


        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-avocado-sign-title">Bildanalyse: Avocado Sign</h3>
                <p>Die Auswertung der kontrastmittelverstärkten T1-gewichteten VIBE-Sequenzen hinsichtlich des Avocado Signs erfolgte durch zwei unabhängige Radiologen (Erfahrung in der abdominellen MRT: ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahre) in Anlehnung an die Methodik der Originalstudie (${studyReferenceAS}). Die Untersucher waren gegenüber den histopathologischen Befunden und den Ergebnissen der T2w-Lymphknotenanalyse verblindet. Das Avocado Sign wurde als ein umschriebener, zentral oder exzentrisch gelegener hypointenser Kern innerhalb eines ansonsten homogen signalangehobenen (hyperintensen) mesorektalen Lymphknotens definiert, unabhängig von dessen Größe oder Form (siehe ${fig2Link}). Ein Patient wurde als AS-positiv klassifiziert, wenn mindestens ein mesorektaler Lymphknoten das Avocado Sign zeigte. Bei diskordanten Befunden erfolgte eine Konsensusfindung unter Hinzunahme eines dritten, ebenfalls erfahrenen Radiologen (Erfahrung: ${radiologistExperience[2]} Jahre).</p>
                <p>Die Bildbeurteilung erfolgte auf einer Standard-PACS-Workstation (Picture Archiving and Communication System). Für Patienten, die eine nRCT erhielten, wurden die Restaging-MRT-Aufnahmen für die AS-Beurteilung herangezogen, um eine direkte Korrelation mit dem posttherapeutischen histopathologischen Befund zu ermöglichen. Eine minimale Größenschwelle für die zu bewertenden Lymphknoten wurde nicht definiert, um auch kleine metastatische Herde erfassen zu können. Extramesorektale Lymphknoten und Tumordepots waren nicht Gegenstand dieser spezifischen AS-Evaluation.</p>
            `;
        } else {
            return `
                <h3 id="methoden-bildanalyse-avocado-sign-title">Image Analysis: Avocado Sign</h3>
                <p>The contrast-enhanced T1-weighted VIBE sequences were evaluated for the Avocado Sign by two independent radiologists (experience in abdominal MRI: ${radiologistExperience[0]} and ${radiologistExperience[1]} years, respectively), following the methodology of the original study (${studyReferenceAS}). The assessors were blinded to the histopathological findings and the results of the T2w lymph node analysis. The Avocado Sign was defined as a circumscribed, centrally or eccentrically located hypointense core within an otherwise homogeneously signal-enhanced (hyperintense) mesorectal lymph node, irrespective of its size or shape (see ${fig2Link}). A patient was classified as AS-positive if at least one mesorectal lymph node exhibited the Avocado Sign. In cases of discordant findings, consensus was reached with the involvement of a third, equally experienced radiologist (experience: ${radiologistExperience[2]} years).</p>
                <p>Image assessment was performed on a standard PACS (Picture Archiving and Communication System) workstation. For patients who received nRCT, restaging MRI scans were used for AS assessment to ensure direct correlation with post-therapeutic histopathological findings. No minimum size threshold was applied for lymph node evaluation to include small metastatic foci. Extramesorectal lymph nodes and tumor deposits were not included in this specific AS evaluation.</p>
            `;
        }
    }

    function getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats) {
        const radiologistExperience = commonData.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["29", "7", "19"];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableLiterarturKriterienId = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';

        let bfCriteriaText = '';
        const kollektiveBF = ['Gesamt', 'direkt OP', 'nRCT'];
        let bfCriteriaFound = false;
        kollektiveBF.forEach(kolId => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                bfCriteriaFound = true;
                const displayName = getKollektivDisplayName(kolId);
                const formattedCriteria = formatCriteriaFunc(bfDef.criteria, bfDef.logic, false);
                const metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', lang === 'en');
                const metricNameDisplay = bfDef.metricName || bfZielMetric;
                bfCriteriaText += `<li><strong>${displayName}</strong> (${lang === 'de' ? 'optimiert für' : 'optimized for'} ${metricNameDisplay}, ${lang === 'de' ? 'Wert' : 'value'}: ${metricValueStr}): ${formattedCriteria}</li>`;
            }
        });

        if (bfCriteriaText) {
            bfCriteriaText = `<ul>${bfCriteriaText}</ul>`;
        } else {
            bfCriteriaText = lang === 'de' ? `<p>Für die gewählte Zielmetrik "${bfZielMetric}" konnten keine spezifischen Brute-Force-Optimierungsergebnisse für die Darstellung der Kriterien generiert werden oder die Ergebnisse waren nicht für alle Kollektive verfügbar.</p>` : `<p>For the selected target metric "${bfZielMetric}", no specific brute-force optimization results for criteria display could be generated, or results were not available for all cohorts.</p>`;
        }

        const kohRef = commonData.references?.KOH_2008_MORPHOLOGY || "Koh et al. (2008)";
        const barbaroRef = commonData.references?.BARBARO_2024_RESTAGING || "Barbaro et al. (2024)";
        const esgarRef = `${commonData.references?.BEETS_TAN_2018_ESGAR_CONSENSUS || "ESGAR Consensus (2018)"} / ${commonData.references?.RUTEGARD_2025_ESGAR_VALIDATION || "Rutegård et al. (2025)"}`;

        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Bildanalyse: T2-gewichtete Kriterien</h3>
                <p>Die morphologischen Charakteristika der mesorektalen Lymphknoten (Kurzachsendurchmesser [mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Binnensignalhomogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden auf den hochauflösenden T2-gewichteten MRT-Sequenzen durch dieselben zwei Radiologen (Erfahrung ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahre) im Konsens erfasst. Diese Erfassung erfolgte verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Zur vergleichenden Analyse der diagnostischen Güte wurden folgende Sätze von T2w-Kriterien herangezogen und auf den Datensatz angewendet:</p>
                <ol>
                    <li><strong>Literatur-basierte Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur (${kohRef}; ${barbaroRef}; ${esgarRef}) wurde implementiert. Die spezifischen Definitionen und ihre Anwendung auf die entsprechenden Subgruppen unserer Studienpopulation sind in <a href="${_getSafeLink(tableLiterarturKriterienId)}">Tabelle Methoden 1</a> detailliert beschrieben.</li>
                    <li><strong>Brute-Force optimierte T2-Kriteriensets:</strong> Für jedes Hauptkollektiv (Gesamt, Direkt OP, nRCT) wurde mittels eines Algorithmus diejenige Kombination aus den fünf T2-Merkmalen und einer logischen Verknüpfung (UND/ODER) identifiziert, welche die Zielmetrik "${bfZielMetric}" maximierte. Die resultierenden Kriteriendefinitionen waren:
                        ${bfCriteriaText}
                        <p class="small text-muted">Hinweis: Diese datengetrieben optimierten Kriterien sind spezifisch für die jeweilige Kohorte und die gewählte Zielmetrik und stellen keine allgemeingültige Empfehlung dar, sondern dienen dem bestmöglichen Vergleich innerhalb dieser Studie.</p>
                    </li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv gewertet, wenn er die Bedingungen des jeweiligen Kriteriensets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten als T2-positiv eingestuft wurde.</p>
            `;
        } else {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Image Analysis: T2-weighted Criteria</h3>
                <p>The morphological characteristics of mesorectal lymph nodes (short-axis diameter [mm], shape ['round', 'oval'], border ['smooth', 'irregular'], internal signal homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed on high-resolution T2-weighted MRI sequences by the same two radiologists (experience ${radiologistExperience[0]} and ${radiologistExperience[1]} years, respectively) by consensus. This assessment was performed blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For the comparative analysis of diagnostic performance, the following sets of T2w criteria were utilized and applied to the dataset:</p>
                <ol>
                    <li><strong>Literature-based criteria sets:</strong> A selection of established criteria from the literature (${kohRef}; ${barbaroRef}; ${esgarRef}) was implemented. The specific definitions and their application to the respective subgroups of our study population are detailed in <a href="${_getSafeLink(tableLiterarturKriterienId)}">Methods Table 1</a>.</li>
                    <li><strong>Brute-force optimized T2 criteria sets:</strong> For each main cohort (Overall, Upfront Surgery, nRCT), an algorithm was used to identify the combination of the five T2 features and a logical operator (AND/OR) that maximized the target metric "${bfZielMetric}". The resulting criteria definitions were:
                        ${bfCriteriaText}
                        <p class="small text-muted">Note: These data-driven optimized criteria are specific to the respective cohort and the chosen target metric and do not represent a general recommendation but serve for the best possible comparison within this study.</p>
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive if it fulfilled the conditions of the respective criteria set. A patient was considered T2-positive if at least one lymph node was classified as T2-positive.</p>
            `;
        }
    }

    function getMethodenReferenzstandardHistopathologieText(lang, commonData) {
        if (lang === 'de') {
            return `
                <h3 id="methoden-referenzstandard-histopathologie-title">Referenzstandard: Histopathologie</h3>
                <p>Die definitive Bestimmung des Lymphknotenstatus erfolgte durch die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME). Alle Präparate wurden standardisiert aufgearbeitet. Erfahrene Pathologen untersuchten sämtliche im Mesorektum identifizierten Lymphknoten mikroskopisch auf das Vorhandensein von Tumorzellen. Ein Patient wurde als N-positiv (N+) klassifiziert, wenn mindestens ein Lymphknoten Metastasen aufwies; andernfalls als N-negativ (N0). Die Anzahl der befallenen und der insgesamt untersuchten Lymphknoten wurde dokumentiert.</p>
            `;
        } else {
            return `
                <h3 id="methoden-referenzstandard-histopathologie-title">Reference Standard: Histopathology</h3>
                <p>The definitive determination of lymph node status was based on the histopathological examination of surgical specimens after total mesorectal excision (TME). All specimens were processed according to standardized protocols. Experienced pathologists microscopically examined all lymph nodes identified within the mesorectum for the presence of tumor cells. A patient was classified as N-positive (N+) if at least one lymph node contained metastases; otherwise, as N-negative (N0). The number of involved and total examined lymph nodes was documented.</p>
            `;
        }
    }
    function getMethodenStatistischeAnalyseMethodenText(lang, commonData) {
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = formatNumber(alphaLevel, 2, '0.05', true).replace('.', lang === 'de' ? ',' : '.');
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const appNameAndVersion = `${commonData.appName || "Analyse-Tool"} v${commonData.appVersion || APP_CONFIG.APP_VERSION}`;
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";

        if (lang === 'de') {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistische Analyse</h3>
                <p>Die deskriptive Statistik umfasste Mediane und Interquartilsabstände (IQR) für kontinuierliche Variablen sowie absolute und relative Häufigkeiten für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert [PPV], negativem prädiktiven Wert [NPV], Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve [AUC] – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProportion}-Methode verwendet. Für BalAcc (AUC) und den F1-Score wurde die ${ciMethodEffectSize}-Methode mit ${bootstrapN} Replikationen angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI. Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert < ${alphaText} (zweiseitig) wurde als statistisch signifikant erachtet. Alle Analysen wurden mit der Software ${appNameAndVersion} durchgeführt, die auf etablierten statistischen Algorithmen basiert.</p>
            `;
        } else {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistical Analysis</h3>
                <p>Descriptive statistics included medians and interquartile ranges (IQR) for continuous variables, and absolute and relative frequencies for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value [PPV], negative predictive value [NPV], accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve [AUC]—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the ${ciMethodEffectSize} method (${bootstrapN} replications) was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs. The Phi coefficient (φ) was used as a measure of the strength of association between binary features. For comparing distributions of continuous variables between two independent groups, the Mann-Whitney U test was used. A p-value < ${alphaText} (two-sided) was considered statistically significant. All analyses were performed using the ${appNameAndVersion} software, which is based on established statistical algorithms.</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, 'N/A');
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;


        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patientencharakteristika und Datenfluss</h3>
                <p>Die demographischen und klinischen Basisdaten der ${anzahlGesamt} Patienten sind in <a href="${_getSafeLink(table1Id)}">Tabelle Ergebnisse 1</a> dargestellt. Das Gesamtkollektiv setzte sich aus ${anzahlDirektOP} Patienten mit primärer Operation und ${anzahlNRCT} Patienten nach neoadjuvanter Radiochemotherapie zusammen. Der mediane Alter betrug ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false)} Jahre (Spannweite: ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false)} Jahre). Männer stellten ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} der Kohorte dar. Ein histopathologisch positiver Lymphknotenstatus (N+) wurde bei ${pCharGesamt?.nStatus?.plus || 'N/A'} (${anteilNplusGesamt}) Patienten des Gesamtkollektivs nachgewiesen. Die Alters- und Geschlechtsverteilung ist in <a href="${_getSafeLink(fig1aId)}">Abbildung Ergebnisse 1a</a> bzw. <a href="${_getSafeLink(fig1bId)}">Abbildung Ergebnisse 1b</a> illustriert. Das Patientenflussdiagramm findet sich in <a href="${_getSafeLink(flowDiagramId)}">Abbildung Methoden 1</a>.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patient Characteristics and Data Flow</h3>
                <p>The demographic and baseline clinical data of the ${anzahlGesamt} patients are presented in <a href="${_getSafeLink(table1Id)}">Results Table 1</a>. The overall cohort comprised ${anzahlDirektOP} patients undergoing upfront surgery and ${anzahlNRCT} patients after neoadjuvant chemoradiotherapy. The median age was ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', true)} years (range: ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', true)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', true)} years). Males constituted ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} of the cohort. Histopathologically confirmed positive lymph node status (N+) was identified in ${pCharGesamt?.nStatus?.plus || 'N/A'} (${anteilNplusGesamt}) patients of the total cohort. Age and gender distributions are illustrated in <a href="${_getSafeLink(fig1aId)}">Results Figure 1a</a> and <a href="${_getSafeLink(fig1bId)}">Results Figure 1b</a>, respectively. The patient flow diagram is provided in <a href="${_getSafeLink(flowDiagramId)}">Methods Figure 1</a>.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
        const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;

        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostische Güte des Avocado Signs</h3>
                <p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des pathologischen N-Status ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 1</a> für das Gesamtkollektiv sowie für die Subgruppen mit primärer Operation und nach nRCT detailliert dargestellt. Im Gesamtkollektiv (${getKollektivText('Gesamt', nGesamt, lang)}) wies das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')} und eine AUC von ${fCI(asGesamt?.auc, 3, false, 'de')} auf.</p>
                <p>Bei Patienten der Direkt-OP-Gruppe (${getKollektivText('direkt OP', nDirektOP, lang)}) erreichte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} bei einer Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}). In der nRCT-Gruppe (${getKollektivText('nRCT', nNRCT, lang)}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}).</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostic Performance of the Avocado Sign</h3>
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(tableId)}">Results Table 1</a> for the overall cohort and for subgroups undergoing upfront surgery and after nRCT. In the overall cohort (${getKollektivText('Gesamt', nGesamt, lang)}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, and an AUC of ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In patients undergoing upfront surgery (${getKollektivText('direkt OP', nDirektOP, lang)}), the AS demonstrated a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). In the nRCT group (${getKollektivText('nRCT', nNRCT, lang)}), sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
        let text = '';
        if (lang === 'de') {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostische Güte der Literatur-basierten T2-Kriterien</h3><p>Die Performance der etablierten T2-Kriteriensets aus der Literatur, angewendet auf die entsprechenden (Sub-)Kollektive unserer Studienpopulation, ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 2</a> dargestellt. Die Ergebnisse variierten je nach Kriterienset und zugrundeliegender Patientengruppe.</p><ul>`;
        } else {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostic Performance of Literature-Based T2 Criteria</h3><p>The performance of established T2 criteria sets from the literature, applied to the respective (sub-)cohorts of our study population, is presented in <a href="${_getSafeLink(tableId)}">Results Table 2</a>. Results varied depending on the specific criteria set and the patient subgroup.</p><ul>`;
        }

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                const nPat = allKollektivStats?.[targetKollektivForStudy]?.deskriptiv?.anzahlPatienten || 'N/A';
                const setName = studySet.name || studySet.labelKey;

                if (stats && stats.matrix) {
                    text += `<li>Die Kriterien nach ${setName}, angewendet auf das ${getKollektivText(targetKollektivForStudy, nPat, lang)}, erreichten eine Sensitivität von ${fCI(stats.sens, 1, true, lang)}, eine Spezifität von ${fCI(stats.spez, 1, true, lang)} und eine AUC von ${fCI(stats.auc, 3, false, lang)}.</li>`;
                } else {
                    text += `<li>Für die Kriterien nach ${setName} (Kollektiv: ${getKollektivText(targetKollektivForStudy, nPat, lang)}) konnten keine validen Performancedaten berechnet werden.</li>`;
                }
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';
        let text = '';

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostische Güte der Brute-Force optimierten T2-Kriterien</h3><p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die <strong>${bfZielMetric}</strong> maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt Methoden > Bildanalyse: T2-gewichtete Kriterien) detaillierter beschrieben. Die diagnostische Güte dieser optimierten Sets ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 3</a> dargestellt.</p><p>Die für die jeweilige Kohorte optimierten Kriterien waren:</p><ul>`;
        } else {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostic Performance of Brute-Force Optimized T2 Criteria</h3><p>Using a brute-force algorithm, specific T2 criteria sets maximizing <strong>${bfZielMetric}</strong> were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section Methods > Image Analysis: T2-weighted Criteria). The diagnostic performance of these optimized sets is presented in <a href="${_getSafeLink(tableId)}">Results Table 3</a>.</p><p>The criteria optimized for each cohort were:</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
            { id: 'direkt OP', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
            { id: 'nRCT', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const nPat = k.n || 'N/A';
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const criteriaDesc = bfDef ? formatCriteriaFunc(bfDef.criteria, bfDef.logic, false) : (lang === 'de' ? 'nicht verfügbar' : 'unavailable');

            if (bfStats && bfStats.matrix && bfDef) {
                 text += `<li><strong>${getKollektivDisplayName(k.id)}</strong> (${getKollektivText(k.id, nPat, lang).split('(')[1]}: Die Optimierung (Zielmetrik: ${bfDef.metricName || bfZielMetric}, erreicht: ${formatNumber(bfDef.metricValue, 4, 'N/A', lang === 'en')}) ergab folgende Kriterien: <em>${criteriaDesc}</em>. Dies führte zu einer Sensitivität von ${fCI(bfStats.sens, 1, true, lang)}, Spezifität von ${fCI(bfStats.spez, 1, true, lang)} und AUC von ${fCI(bfStats.auc, 3, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${getKollektivText(k.id, nPat, lang)} konnten keine validen optimierten Kriterien für die Zielmetrik '${bfZielMetric}' ermittelt oder deren Performance nicht berechnet werden.</li>`;
            }
        });
        text += `</ul><p class="small text-muted">${lang === 'de' ? 'Es ist zu beachten, dass diese datengetriebenen optimierten Kriterien spezifisch für die jeweilige Studienkohorte und die gewählte Zielmetrik sind. Sie stellen keine allgemeingültige Empfehlung für die klinische Praxis dar, sondern dienen primär dem bestmöglichen Vergleich der diagnostischen Aussagekraft verschiedener Ansätze innerhalb dieser spezifischen Untersuchung.' : 'It should be noted that these data-driven optimized criteria are specific to the respective study cohort and the chosen target metric. They do not represent a general recommendation for clinical practice but primarily serve for the best possible comparison of the diagnostic performance of different approaches within this specific investigation.'}</p>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const fig2aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id;
        const fig2bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.id; // Korrigierter Schlüssel
        const fig2cId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.id;

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Vergleichsanalysen: Avocado Sign vs. T2-Kriterien</h3><p>Die statistischen Vergleiche der diagnostischen Leistung zwischen dem Avocado Sign (AS) und den T2-Kriteriensets (sowohl Literatur-basiert als auch Brute-Force-optimiert für die Zielmetrik ${bfZielMetric}) sind detailliert in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 4</a> aufgeführt. Visuelle Vergleiche der Schlüsselmetriken für das Gesamtkollektiv, die Direkt-OP-Gruppe und die nRCT-Gruppe sind in <a href="${_getSafeLink(fig2aId)}">Abbildung Ergebnisse 2a</a>, <a href="${_getSafeLink(fig2bId)}">Abbildung Ergebnisse 2b</a> und <a href="${_getSafeLink(fig2cId)}">Abbildung Ergebnisse 2c</a> dargestellt.</p>`;
        } else {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Comparative Analyses: Avocado Sign vs. T2 Criteria</h3><p>Statistical comparisons of the diagnostic performance between the Avocado Sign (AS) and the T2 criteria sets (both literature-based and brute-force optimized for the target metric ${bfZielMetric}) are detailed in <a href="${_getSafeLink(tableId)}">Results Table 4</a>. Visual comparisons of key metrics for the overall cohort, upfront surgery group, and nRCT group are presented in <a href="${_getSafeLink(fig2aId)}">Results Figure 2a</a>, <a href="${_getSafeLink(fig2bId)}">Results Figure 2b</a>, and <a href="${_getSafeLink(fig2cId)}">Results Figure 2c</a>, respectively.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litSetName: commonData.references?.KOH_2008_MORPHOLOGY || 'Koh et al. (2008)' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litSetName: `${commonData.references?.BEETS_TAN_2018_ESGAR_CONSENSUS || "ESGAR Consensus (2018)"} (eval. ${commonData.references?.RUTEGARD_2025_ESGAR_VALIDATION || "Rutegård et al. (2025)"})` },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litSetName: commonData.references?.BARBARO_2024_RESTAGING || 'Barbaro et al. (2024)' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            let diffAucLitStr = vergleichASvsLit?.delong?.diffAUC !== undefined ? formatNumber(vergleichASvsLit.delong.diffAUC, 3, 'N/A', lang === 'en') : 'N/A';
            let diffAucBfStr = vergleichASvsBF?.delong?.diffAUC !== undefined ? formatNumber(vergleichASvsBF.delong.diffAUC, 3, 'N/A', lang === 'en') : 'N/A';

            if (lang === 'de') {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Vergleich AS (AUC ${fCI(statsAS.auc, 3, false, 'de')}) vs. ${k.litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'de')}): McNemar p-Wert (Accuracy) ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'de', true)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}; DeLong p-Wert (AUC) ${getPValueText(vergleichASvsLit.delong?.pValue, 'de', true)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}; AUC-Differenz ${diffAucLitStr}.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Vergleich AS vs. Brute-Force T2 (optimiert für ${bfDef.metricName || bfZielMetric}, AUC ${fCI(statsBF.auc, 3, false, 'de')}): McNemar p-Wert (Accuracy) ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'de', true)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}; DeLong p-Wert (AUC) ${getPValueText(vergleichASvsBF.delong?.pValue, 'de', true)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}; AUC-Differenz ${diffAucBfStr}.</p>`;
                }
            } else {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparison AS (AUC ${fCI(statsAS.auc, 3, false, 'en')}) vs. ${k.litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'en')}): McNemar p-value (Accuracy) ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'en', true)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}; DeLong p-value (AUC) ${getPValueText(vergleichASvsLit.delong?.pValue, 'en', true)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}; AUC difference ${diffAucLitStr}.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Comparison AS vs. Brute-Force T2 (optimized for ${bfDef.metricName || bfZielMetric}, AUC ${fCI(statsBF.auc, 3, false, 'en')}): McNemar p-value (Accuracy) ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'en', true)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}; DeLong p-value (AUC) ${getPValueText(vergleichASvsBF.delong?.pValue, 'en', true)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}; AUC difference ${diffAucBfStr}.</p>`;
                }
            }
        });
        return text;
    }

    function getDiscussionText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const bfGesamtStats = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = allKollektivStats?.Gesamt?.vergleichASvsT2_bruteforce;
        let vergleichTextDe = "eine vergleichbare Leistung zeigte";
        let vergleichTextEn = "showed comparable performance";

        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && asGesamt?.auc?.value !== undefined && bfGesamtStats?.auc?.value !== undefined) {
            if (vergleichASvsBFGesamt.delong.pValue < (commonData.significanceLevel || 0.05)) {
                if (asGesamt.auc.value > bfGesamtStats.auc.value) {
                    vergleichTextDe = "eine signifikant überlegene Leistung zeigte";
                    vergleichTextEn = "showed significantly superior performance";
                } else if (asGesamt.auc.value < bfGesamtStats.auc.value) {
                    vergleichTextDe = "eine signifikant unterlegene Leistung zeigte";
                    vergleichTextEn = "showed significantly inferior performance";
                }
            }
        }
        const aucASGesamt = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', lang === 'en') : 'N/A';


        if (lang === 'de') {
            return `
                <h2 id="discussion-title">Diskussion</h2>
                <p>Die vorliegende Studie evaluierte das "Avocado Sign" (AS), einen neuartigen kontrastmittelbasierten MRT-Marker, zur Prädiktion des mesorektalen Lymphknotenstatus bei ${commonData.nGesamt || 'N/A'} Patienten mit Rektumkarzinom und verglich dessen diagnostische Leistung mit etablierten sowie datengetriebenen T2-gewichteten Kriterien. Das Avocado Sign demonstrierte eine hohe diagnostische Genauigkeit (AUC ${aucASGesamt} im Gesamtkollektiv), die auch in den Subgruppen der primär operierten Patienten und der Patienten nach neoadjuvanter Radiochemotherapie robust blieb. Im direkten statistischen Vergleich mit den für diese Kohorte optimierten T2-Kriterien ${vergleichTextDe} (p-Wert für AUC-Vergleich: ${vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue, 'de', true) : 'N/A'}).</p>
                <p>Die Limitationen traditioneller morphologischer T2w-Kriterien, wie Größen- oder Formbeurteilungen, für die Lymphknotendiagnostik sind in der Literatur umfassend beschrieben [1-3]. Unsere Analyse bestätigte die variable und oft suboptimale Leistung dieser Kriterien. Die von uns durchgeführte Brute-Force-Optimierung der T2-Kriterien erlaubte zwar eine Maximierung der gewählten Zielmetrik für die spezifischen Kollektive dieser Studie, jedoch unterstreicht dies auch die Kohortenspezifität und das Risiko der Überanpassung solcher rein datengetriebener Ansätze. Die klare Definition und einfache visuelle Erfassbarkeit des Avocado Signs könnten hier Vorteile in Bezug auf Generalisierbarkeit und Anwenderfreundlichkeit bieten.</p>
                <p>Ein wesentlicher Aspekt für die klinische Implementierung eines neuen Bildgebungsmarkers ist dessen Reproduzierbarkeit. Die in der Primärstudie zum Avocado Sign berichtete hohe Interobserver-Übereinstimmung (${commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)"}) deutet auf eine gute Anwendbarkeit im klinischen Alltag hin. Die Ergebnisse dieser erweiterten Analyse legen nahe, dass die Integration von kontrastmittelverstärkten T1w-Sequenzen und die gezielte Beurteilung des Avocado Signs die diagnostische Sicherheit des MRT-Stagings erhöhen könnten. Dies ist insbesondere im Kontext individualisierter Therapieentscheidungen, wie der Selektion von Patienten für organerhaltende Strategien [4,5] oder der De-/Eskalation neoadjuvanter Therapien, von potenziell hohem Wert.</p>
                <p>Unsere Studie weist Limitationen auf. Das retrospektive Design und die monozentrische Durchführung können die Generalisierbarkeit der Ergebnisse einschränken. Obwohl die Fallzahl für eine monozentrische Studie als adäquat betrachtet werden kann, sind prospektive, multizentrische Studien zur externen Validierung der hier präsentierten Ergebnisse und zur Untersuchung des tatsächlichen Einflusses des Avocado Signs auf klinische Therapieentscheidungen und das Langzeit-Outcome der Patienten unerlässlich. Zukünftige Forschungsarbeiten sollten zudem den direkten Vergleich des Avocado Signs mit anderen fortgeschrittenen MRT-Techniken, wie quantitativen Parametern aus der diffusionsgewichteten Bildgebung (DWI) oder dynamischen kontrastmittelverstärkten (DCE) Sequenzen, adressieren.</p>
                <p>Zusammenfassend ist das Avocado Sign ein vielversprechender und reproduzierbarer MRT-Marker mit hoher diagnostischer Genauigkeit für die Prädiktion des mesorektalen Lymphknotenstatus beim Rektumkarzinom. Es stellt eine wertvolle Ergänzung zu den etablierten Staging-Methoden dar und hat das Potenzial, die Therapieplanung für Patienten mit Rektumkarzinom zu verfeinern und zu personalisieren.</p>
            `;
        } else {
            return `
                <h2 id="discussion-title">Discussion</h2>
                <p>This study evaluated the "Avocado Sign" (AS), a novel contrast-enhanced MRI marker, for predicting mesorectal lymph node status in ${commonData.nGesamt || 'N/A'} patients with rectal cancer and compared its diagnostic performance with established and data-driven T2-weighted criteria. Our findings indicate that the Avocado Sign demonstrates high diagnostic accuracy (AUC ${aucASGesamt} in the overall cohort), which remained robust across different treatment subgroups (upfront surgery vs. neoadjuvant chemoradiotherapy). In direct statistical comparison with T2 criteria optimized for this cohort, the Avocado Sign ${vergleichTextEn} (p-value for AUC comparison: ${vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue, 'en', true) : 'N/A'}).</p>
                <p>The limitations of traditional T2w morphological criteria, such as size or shape assessment, for lymph node diagnostics are extensively described in the literature [1-3]. Our analysis confirmed the variable and often suboptimal performance of these criteria. While our brute-force optimization of T2 criteria allowed for maximization of the chosen target metric for the specific cohorts in this study, this also highlights the cohort specificity and risk of overfitting with such purely data-driven approaches. The clear definition and simple visual assessability of the Avocado Sign may offer advantages in terms of generalizability and user-friendliness.</p>
                <p>A crucial aspect for the clinical implementation of a new imaging marker is its reproducibility. The high interobserver agreement reported for the Avocado Sign in the primary study (${commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)"}) suggests good applicability in daily clinical practice. The results of this extended analysis suggest that the integration of contrast-enhanced T1w sequences and the specific assessment of the Avocado Sign could enhance the diagnostic certainty of MRI staging. This is of potentially high value, particularly in the context of individualized treatment decisions, such as selecting patients for organ-preserving strategies [4,5] or de-/escalating neoadjuvant therapies.</p>
                <p>Our study has limitations. Its retrospective design and single-center nature may limit the generalizability of the findings. Although the sample size can be considered adequate for a single-center study, prospective, multicenter studies are essential for external validation of the results presented here and for investigating the actual impact of the Avocado Sign on clinical treatment decisions and long-term patient outcomes. Future research should also address the direct comparison of the Avocado Sign with other advanced MRI techniques, such as quantitative parameters from diffusion-weighted imaging (DWI) or dynamic contrast-enhanced (DCE) sequences.</p>
                <p>In conclusion, the Avocado Sign is a promising and reproducible MRI marker with high diagnostic accuracy for predicting mesorectal lymph node status in rectal cancer. It represents a valuable addition to established staging methods and has the potential to refine and personalize treatment planning for patients with rectal cancer.</p>
            `;
        }
    }

    function getReferencesText(lang, commonData) {
        const refs = commonData.references || {};
        let text = `<h2 id="references-title">${lang === 'de' ? 'Literaturverzeichnis' : 'References'}</h2><ol class="small">`;
        const referenceOrder = [
            refs.LURZ_SCHAEFER_AS_2025, // Sollte formatiert sein: Lurz M, Schaefer FK. The Avocado Sign: ... Radiology. 2025;XXX:XXX-XXX.
            "[1] Siegel RL, Miller KD, Wagle NS, Jemal A. Cancer statistics, 2023. CA Cancer J Clin. 2023;73(1):17-48. doi:10.3322/caac.21763",
            "[2] Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for local rectal cancer staging: a consensus statement by the ESGAR rectal cancer MR
staging group. Eur Radiol. 2018;28(5):2281-2292. doi:10.1007/s00330-017-5224-4", // Beispiel für ESGAR
            "[3] Al-Sukhni E, Milot L, Fruitman M, et al. Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg Oncol. 2012;19(7):2212-2223. doi:10.1245/s10434-011-2183-1",
            "[4] Garcia-Aguilar J, Patil S, Gollub MJ, et al. Organ Preservation in Patients With Rectal Adenocarcinoma Treated With Total Neoadjuvant Therapy. J Clin Oncol. 2022;40(23):2546-2556. doi:10.1200/JCO.21.02621",
            "[5] Schrag D, Shi Q, Weiser MR, et al. Preoperative Treatment of Locally Advanced Rectal Cancer. N Engl J Med. 2023;389(4):322-334. doi:10.1056/NEJMoa2303269",
            refs.KOH_2008_MORPHOLOGY, // Koh DM, Collins DJ, Wallace MB, et al. ... Br J Radiol. 2008;...
            refs.BARBARO_2024_RESTAGING, // Barbaro B, ... Eur Radiol. 2024;...
            refs.RUTEGARD_2025_ESGAR_VALIDATION, // Rutegård M, ... Eur Radiol. 2025;...
            refs.BROWN_2003_MORPHOLOGY,
            refs.KAUR_2012_MRI_PRACTICAL,
            refs.HORVAT_2019_MRI_RECTAL_CANCER,
            refs.BEETS_TAN_2009_USPIO_RESTAGING,
            refs.BEETS_TAN_2004_GADOLINIUM,
            refs.BARBARO_2010_RESTAGING
        ].filter(ref => ref);

        let displayedRefs = new Set();
        let counter = 1; // Für nicht vor-nummerierte Referenzen
        const usedNumberedRefs = new Set();

        const getRefNumber = (refStr) => {
            const match = refStr.match(/^\[(\d+)\]/);
            if (match) {
                usedNumberedRefs.add(parseInt(match[1]));
                return match[1];
            }
            return null;
        };
        
        let autoCounter = 1;
        const getNextAutoCounter = () => {
            while(usedNumberedRefs.has(autoCounter)){
                autoCounter++;
            }
            usedNumberedRefs.add(autoCounter);
            return autoCounter++;
        };


        text += referenceOrder.map(refString => {
            if (refString && !displayedRefs.has(refString)) {
                displayedRefs.add(refString);
                const existingNum = getRefNumber(refString);
                if (existingNum) {
                    return `<li>${refString}</li>`;
                } else {
                    return `<li>[${getNextAutoCounter()}] ${refString}</li>`;
                }
            }
            return ''; // Für Duplikate oder leere Einträge
        }).filter(item => item).join('');


        text += `</ol>`;
        return text;
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'abstract_main': return getAbstractText(lang, allKollektivStats, commonData);
            case 'introduction_main': return getIntroductionText(lang, commonData);
            case 'methoden_studienanlage_ethik': return getMethodenStudienanlageEthikText(lang, commonData);
            case 'methoden_patientenkohorte': return getMethodenPatientenkohorteText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll_akquisition': return getMethodenMRTProtokollAkquisitionText(lang, commonData);
            case 'methoden_bildanalyse_avocado_sign': return getMethodenBildanalyseAvocadoSignText(lang, commonData);
            case 'methoden_bildanalyse_t2_kriterien': return getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard_histopathologie': return getMethodenReferenzstandardHistopathologieText(lang, commonData);
            case 'methoden_statistische_analyse_methoden': return getMethodenStatistischeAnalyseMethodenText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_diagnostische_guete': return getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_literatur_diagnostische_guete': return getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_optimiert_diagnostische_guete': return getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_vergleich_as_vs_t2': return getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData);
            case 'discussion_main': return getDiscussionText(lang, allKollektivStats, commonData);
            case 'references_main': return getReferencesText(lang, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        let markdown = htmlContent
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<i>(.*?)<\/i>/g, '*$1*')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<ol.*?>/g, '')
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, '\n* ')
            .replace(/<\/li>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, '[$2](#$1)')
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, (match, p1) => `\n# ${p1}\n`)
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, p1) => `\n## ${p1}\n`)
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, (match, p1) => `\n### ${p1}\n`)
            .replace(/<h4[^>]*>(.*?)<\/h4>/g, (match, p1) => `\n#### ${p1}\n`)
            .replace(/<h5[^>]*>(.*?)<\/h5>/g, (match, p1) => `\n##### ${p1}\n`)
            .replace(/<h6[^>]*>(.*?)<\/h6>/g, (match, p1) => `\n###### ${p1}\n`)
            .replace(/<cite>(.*?)<\/cite>/g, '[$1]')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ') // Non-breaking space
            .replace(/ {2,}/g, ' ') // Replace multiple spaces with single
            .replace(/\n\s*\n/g, '\n\n') // Reduce multiple newlines
            .trim();

        // Ensure LaTeX math is preserved
        markdown = markdown.replace(/\$ (.*?) \$/g, '$$$1$$'); // For single dollar signs if used (though Radiology prefers words)
                                                          // It's better to avoid LaTeX in the direct text if possible,
                                                          // but this is a fallback. Radiology guidelines prefer symbols
                                                          // like ≥ to be written as "greater than or equal to".

        if (sectionId === 'references_main' && markdown.includes('\n* ')) {
             // This attempts to renumber based on existing numbers or sequentially
            let autoCounterMd = 1;
            const usedNumberedRefsMd = new Set();
            const getNextAutoCounterMd = () => {
                while(usedNumberedRefsMd.has(autoCounterMd)){ autoCounterMd++; }
                usedNumberedRefsMd.add(autoCounterMd);
                return autoCounterMd++;
            };

            markdown = markdown.split('\n').map(line => {
                if (line.startsWith('* ')) {
                    const content = line.substring(2);
                    const match = content.match(/^\[(\d+)\]/);
                    if (match) {
                        usedNumberedRefsMd.add(parseInt(match[1]));
                        return `${match[1]}. ${content.substring(match[0].length).trim()}`;
                    }
                    return `${getNextAutoCounterMd()}. ${content.trim()}`;
                }
                return line;
            }).join('\n');
        }
        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
