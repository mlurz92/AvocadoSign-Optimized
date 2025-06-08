import { getElement, clearContainer, createElement } from '../../utils/dom_helpers.js';
import { createRocChart, createForestPlot } from '../components/charts.js';
import { calculateDiagnosticMetrics, calculateRocCurve } from '../../services/statistics_service.js';
import { studyCriteria, evaluatePatient } from '../../core/criteria_manager.js';
import { formatNumber } from '../../utils/helpers.js';

let currentSlideIndex = 0;
let slides = [];

function getPresentationStatistics(state) {
    const { processedData, bruteForce } = state;
    if (!processedData || processedData.length === 0) return null;

    const stats = {};
    const groundTruth = processedData.map(p => p.groundTruth);
    const criteriaToEvaluate = { ...studyCriteria };

    if (bruteForce.bestResult) {
        criteriaToEvaluate.bruteForce = {
            id: 'bruteForce',
            name: 'Optimized T2',
            type: 'brute-force',
            citation: 'current study',
            parameters: bruteForce.bestResult.parameters,
        };
    }
    
    for (const key in criteriaToEvaluate) {
        const criterion = criteriaToEvaluate[key];
        const evaluations = processedData.map(p => evaluatePatient(p, criterion));
        const predictions = evaluations.map(e => e.prediction);
        const scores = evaluations.map(e => e.score);

        const metrics = calculateDiagnosticMetrics(predictions, groundTruth);
        const roc = calculateRocCurve(scores, groundTruth);

        stats[criterion.id] = { ...metrics, auc: roc.auc, rocPoints: roc.rocPoints, name: criterion.name, id: criterion.id };
    }
    return stats;
}


function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'flex' : 'none';
    });
    currentSlideIndex = index;
    getElement('#slide-counter').textContent = `${index + 1} / ${slides.length}`;
}

function createNavigation() {
    const nav = createElement('div', { classes: ['presentation-nav'] });
    const prevButton = createElement('button', { classes: ['btn'], innerHTML: '<i class="fas fa-arrow-left"></i> Zurück' });
    const nextButton = createElement('button', { classes: ['btn'], innerHTML: 'Weiter <i class="fas fa-arrow-right"></i>' });
    const counter = createElement('span', { id: 'slide-counter' });

    prevButton.addEventListener('click', () => {
        const newIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        showSlide(newIndex);
    });

    nextButton.addEventListener('click', () => {
        const newIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(newIndex);
    });

    nav.appendChild(prevButton);
    nav.appendChild(counter);
    nav.appendChild(nextButton);
    return nav;
}

function createTitleSlide() {
    const slide = createElement('div', { classes: ['slide', 'slide-title'] });
    slide.innerHTML = `
        <h1>Avocado Sign: A Novel Predictor for Lymph Node Metastasis in Rectal Cancer</h1>
        <p>A comparative analysis against established T2-weighted MRI criteria</p>
        <h2>M. Lurz, J. Schaefer et al.</h2>
    `;
    return slide;
}

function createRocSlide(stats) {
    const slide = createElement('div', { classes: ['slide'] });
    const rocChartData = [
        { ...stats.LurzSchaefer, color: '#0d47a1' },
        { ...stats.Brown, color: '#f57f17' },
        { ...stats.Koh, color: '#2e7d32' },
        { ...stats.Horvat, color: '#c62828' }
    ];
     if (stats.bruteForce) {
        rocChartData.push({ ...stats.bruteForce, color: '#5e35b1' });
    }
    const rocChartContainer = createRocChart(rocChartData, 'presentation-roc-chart');
    slide.appendChild(rocChartContainer);
    return slide;
}

function createForestPlotSlide(stats) {
    const slide = createElement('div', { classes: ['slide'] });
    const forestPlotContainer = createForestPlot(stats, 'presentation-forest-plot');
    slide.appendChild(forestPlotContainer);
    return slide;
}

function createConclusionSlide(stats) {
    const slide = createElement('div', { classes: ['slide', 'slide-conclusion'] });
     const avocadoAUC = formatNumber(stats.LurzSchaefer.auc.value, 3);
    const bestT2 = [stats.Brown, stats.Koh, stats.Horvat].reduce((prev, curr) => (prev.auc.value > curr.auc.value) ? prev : curr);
    const bestT2AUC = formatNumber(bestT2.auc.value, 3);

    slide.innerHTML = `
        <h2>Schlussfolgerung</h2>
        <ul>
            <li>Das <strong>Avocado Sign</strong> (AUC: ${avocadoAUC}) zeigt eine hohe diagnostische Güte zur Vorhersage von Lymphknotenmetastasen.</li>
            <li>Es übertrifft etablierte T2-basierte Kriterien in der diagnostischen Genauigkeit (bester Vergleichs-AUC: ${bestT2AUC}).</li>
            <li>Das Zeichen ist ein einfach anwendbarer, robuster und vielversprechender neuer Marker für das MRT-Staging des Rektumkarzinoms.</li>
        </ul>
    `;
    return slide;
}


export function renderPresentationTab(state) {
    const container = getElement('#presentation-output');
    clearContainer(container);
    currentSlideIndex = 0;
    slides = [];

    const stats = getPresentationStatistics(state);
    if (!stats) {
        container.textContent = "Statistiken müssen zuerst berechnet werden, um die Präsentation zu erstellen.";
        return;
    }
    
    const presentationArea = createElement('div', { classes: ['presentation-area'] });
    
    slides.push(createTitleSlide());
    slides.push(createRocSlide(stats));
    slides.push(createForestPlotSlide(stats));
    slides.push(createConclusionSlide(stats));

    slides.forEach(slide => presentationArea.appendChild(slide));
    
    container.appendChild(presentationArea);
    container.appendChild(createNavigation());
    
    showSlide(0);
}
