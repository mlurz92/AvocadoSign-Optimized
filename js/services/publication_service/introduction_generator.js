window.introductionGenerator = (() => {

    function generateIntroductionHTML(stats, commonData) {
        const helpers = window.publicationHelpers;

        const introText = `
            <p>Accurate preoperative determination of mesorectal lymph node status (N-status) is a cornerstone of modern rectal cancer management, directly influencing decisions between primary surgery, neoadjuvant chemoradiotherapy (nCRT), and organ-preserving strategies such as "watch-and-wait" ${helpers.getReference('Sauer_2004')}${helpers.getReference('Garcia_Aguilar_2022')}. While magnetic resonance imaging (MRI) is the established modality for local staging, its reliability in N-staging remains a significant clinical challenge. The standard approach, relying on T2-weighted (T2w) morphological criteria such as node size, border contour, and internal signal characteristics, has demonstrated inconsistent and often suboptimal diagnostic accuracy ${helpers.getReference('Beets_Tan_2018')}.</p>
            <p>This limitation is well-documented in the literature. A pivotal meta-analysis by Al-Sukhni et al. reported pooled sensitivity and specificity of only 77% and 71%, respectively, for T2w MRI in detecting nodal metastases ${helpers.getReference('Al_Sukhni_2012')}. More recent investigations have confirmed these challenges; for instance, a prospective validation of the 2016 ESGAR consensus criteria revealed a sensitivity of just 54%, underscoring the persistent difficulty in reliably identifying involved nodes based on morphology alone ${helpers.getReference('Rutegard_2025')}. This diagnostic uncertainty can lead to both over- and undertreatment, highlighting a critical need for more robust and reproducible imaging markers. While advanced techniques such as radiomics have been explored, they have not yet consistently surpassed morphological assessment in routine clinical practice and often require complex post-processing ${helpers.getReference('Horvat_2019')}.</p>
            <p>The "Avocado Sign" (AS) was recently proposed as a simple, binary feature identified on contrast-enhanced T1-weighted images, defined as a hypointense core within a homogeneously enhancing lymph node ${helpers.getReference('Lurz_Schaefer_2025')}. While our initial work established the standalone performance of the AS, a direct and rigorous comparison against the spectrum of T2w criteria—from established literature guidelines to a data-driven, cohort-optimized 'best-case' scenario—has not yet been performed on the same patient cohort. Such a comparison is essential to validate its clinical utility and position it relative to the current standard of care.</p>
            <p>The purpose of this study was to evaluate the diagnostic performance of the Avocado Sign for predicting mesorectal lymph node involvement and to compare it with both established literature-based and cohort-optimized T2-weighted morphological criteria sets.</p>
        `;

        return introText;
    }

    return Object.freeze({
        generateIntroductionHTML
    });

})();