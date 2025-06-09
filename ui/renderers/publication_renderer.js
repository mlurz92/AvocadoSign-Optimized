const PublicationRenderer = {

    _formatVal: (val, p = 1) => (val * 100).toFixed(p),
    _formatCI: (ci, p = 1) => `(${this._formatVal(ci.lower, p)}–${this._formatVal(ci.upper, p)})`,
    _formatP: (p) => p < 0.001 ? '< .001' : `= ${p.toFixed(3)}`,

    _renderSection: function(title, content) {
        return `<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-2">${title}</h2><div class="text-base leading-relaxed">${content}</div>`;
    },

    renderPublication: function(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container mit der ID '${containerId}' nicht gefunden.`);
            return;
        }

        const p = data; // publication data shortcut

        let html = `<div class="font-serif text-gray-800 p-4">`;
        html += `<h1 class="text-3xl font-bold mb-4">${AppConfig.text.publication.title}</h1>`;
        html += `<p class="mb-6 text-lg"><em>${AppConfig.publicationDefaults.authors}</em></p>`;

        // Abstract
        const abstractContent = `
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the Avocado Sign, a novel T2-based MRI criterion for lymph node (LN) staging in rectal cancer, and compare it to established morphologic criteria as well as a computationally optimized threshold.</p>
            <p><strong>Materials and Methods:</strong> This retrospective study included ${p.patientCount} patients with biopsy-proven rectal cancer who underwent preoperative pelvic MRI. A total of ${p.lnCount} lymph nodes were analyzed. The Avocado Sign was evaluated alongside four established T2-weighted criteria (Beets-Tan et al., Koh et al., Barbaro et al., Rutegård et al.). A brute-force algorithm identified an optimized criterion based on maximizing the Youden-index. Diagnostic performance metrics, including sensitivity, specificity, and area under the receiver operating characteristic curve (AUC), were calculated. AUCs were compared using the DeLong test.</p>
            <p><strong>Results:</strong> The Avocado Sign demonstrated a sensitivity of ${this._formatVal(p.avocado.sensitivity.value)}% (95% CI: ${this._formatCI(p.avocado.sensitivity.ci)}) and a specificity of ${this._formatVal(p.avocado.specificity.value)}% (95% CI: ${this._formatCI(p.avocado.specificity.ci)}), with an AUC of ${p.avocado.auc.toFixed(3)}. The brute-force optimized criterion (${p.bruteForce.name}) achieved the highest Youden-index, with a sensitivity of ${this._formatVal(p.bruteForce.sensitivity.value)}% and specificity of ${this._formatVal(p.bruteForce.specificity.value)}%. The AUC for the Avocado Sign was significantly higher than that for the criterion by Beets-Tan et al. (AUC ${p.beets_tan_2018.auc.toFixed(3)}; P ${this._formatP(p.comparison['avocado_vs_beets_tan_2018'].p)}) and Barbaro et al. (AUC ${p.barbaro_2024.auc.toFixed(3)}; P ${this._formatP(p.comparison['avocado_vs_barbaro_2024'].p)}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a highly specific criterion for detecting LN metastases in rectal cancer, outperforming several established morphologic criteria. Computationally optimized thresholds may offer a superior balance of sensitivity and specificity, highlighting the potential for data-driven approaches in rectal cancer staging.</p>`;
        html += this._renderSection('Abstract', abstractContent);

        // Introduction
        const introContent = `<p>Accurate preoperative lymph node (LN) staging in rectal cancer is crucial for therapeutic decision-making, particularly regarding the use of neoadjuvant therapy... [Hier wird die detaillierte Einleitung basierend auf den bereitgestellten Dokumenten eingefügt, die die klinische Relevanz und die bisherigen Limitationen darlegt.] The most commonly used criteria rely on size and morphology, but their performance remains suboptimal. Recently, the Avocado Sign was proposed as a novel morphological marker based on T2-weighted imaging. This study aims to validate the diagnostic performance of the Avocado Sign in a larger cohort and to compare it systematically against established and computationally optimized criteria.</p>`;
        html += this._renderSection('Introduction', introContent);

        // Methods
        const methodsContent = `<p><strong>Study Population:</strong> ... [Details zur Studienpopulation und zum Ethik-Votum].</p>
            <p><strong>MRI Technique:</strong> ... [Details zum MRT-Protokoll].</p>
            <p><strong>Image Analysis:</strong> All images were analyzed by two radiologists... The following criteria were evaluated for each lymph node:
            <ul class="list-disc pl-6 mt-2">
                <li><strong>Avocado Sign:</strong> Defined as...</li>
                <li><strong>Beets-Tan et al. (2018):</strong> Short-axis diameter ≥ 5 mm.</li>
                <li><strong>Koh et al. (2008):</strong> Short-axis diameter ≥ 9 mm.</li>
                <li><strong>Barbaro et al. (2024):</strong> Presence of irregular borders or mixed signal intensity.</li>
                <li><strong>Rutegård et al. (2025):</strong> Short-axis diameter > 9 mm or long-axis diameter > 10 mm.</li>
            </ul></p>
            <p><strong>Statistical Analysis:</strong> Sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), and accuracy were calculated with 95% Clopper-Pearson confidence intervals (CIs). Receiver operating characteristic (ROC) curves were generated, and the areas under the curve (AUC) were calculated. AUCs were compared using the DeLong test. A brute-force algorithm was used to identify the optimal threshold for continuous variables (short-axis, long-axis) by maximizing the Youden-index. A P value of less than .05 was considered statistically significant.</p>`;
        html += this._renderSection('Materials and Methods', methodsContent);

        // Results
        const resultsContent = `<p>A total of ${p.patientCount} patients with ${p.lnCount} lymph nodes were included. ${p.positiveLnCount} nodes were pathologically confirmed as malignant.</p>
            <p>The diagnostic performance of all evaluated criteria is summarized in <strong>Table 1</strong>. The Avocado Sign yielded a sensitivity of ${this._formatVal(p.avocado.sensitivity.value)}% (95% CI: ${this._formatCI(p.avocado.sensitivity.ci)}) and a specificity of ${this._formatVal(p.avocado.specificity.value)}% (95% CI: ${this._formatCI(p.avocado.specificity.ci)}). The criterion by Barbaro et al. showed the highest sensitivity (${this._formatVal(p.barbaro_2024.sensitivity.value)}%), while the criterion by Koh et al. showed the highest specificity (${this._formatVal(p.koh_2008.specificity.value)}%).</p>
            <p>The brute-force optimized criterion, ${p.bruteForce.name}, resulted in a sensitivity of ${this._formatVal(p.bruteForce.sensitivity.value)}% and a specificity of ${this._formatVal(p.bruteForce.specificity.value)}%, achieving the highest Youden-index of all tested criteria (${p.bruteForce.youdenIndex.value.toFixed(3)}).</p>
            <p>ROC analysis (<strong>Figure 1</strong>) showed an AUC of ${p.avocado.auc.toFixed(3)} for the Avocado Sign. The results of the DeLong test for AUC comparison are shown in <strong>Table 2</strong>. The AUC of the Avocado Sign was statistically superior to the criteria of Beets-Tan et al. (P ${this._formatP(p.comparison['avocado_vs_beets_tan_2018'].p)}) and Barbaro et al. (P ${this._formatP(p.comparison['avocado_vs_barbaro_2024'].p)}), but not significantly different from Koh et al. (P ${this._formatP(p.comparison['avocado_vs_koh_2008'].p)}).</p>
            <!-- Hier würden die generierten Tabellen und Abbildungen platziert -->`;
        html += this._renderSection('Results', resultsContent);

        // Discussion
        const discussionContent = `<p>In this study, we validated the diagnostic performance of the Avocado Sign... [Hier folgt die ausführliche Diskussion der Ergebnisse im Kontext der Literatur, der Stärken und Schwächen der Studie und der klinischen Implikationen].</p>`;
        html += this._renderSection('Discussion', discussionContent);
        
        // Conclusion
        const conclusionContent = `<p>The Avocado Sign represents a highly specific and easy-to-use morphological criterion for LN staging in rectal cancer... [Zusammenfassende Schlussfolgerung].</p>`;
        html += this._renderSection('Conclusion', conclusionContent);

        html += '</div>';
        container.innerHTML = html;
    }
};

window.PublicationRenderer = PublicationRenderer;
