import { getElement, clearContainer, createElement } from '../../utils/dom_helpers.js';
import { bruteForceManager } from '../../services/brute_force_manager.js';
import { formatNumber } from '../../utils/helpers.js';

function createControlsCard(isRunning) {
    const card = createElement('div', { classes: ['card'] });
    const title = createElement('h3', { textContent: 'Brute-Force-Analyse der T2-Kriterien' });
    const description = createElement('p', { textContent: 'Starten Sie die Analyse, um die optimale Kombination von morphologischen T2-Kriterien (Größe, Randbeschaffenheit, Signalhomogenität) zur Maximierung der diagnostischen Genauigkeit zu finden.' });
    description.style.marginBottom = '1rem';
    
    const startButton = createElement('button', {
        id: 'start-brute-force-btn',
        classes: ['btn'],
        textContent: isRunning ? 'Analyse läuft...' : 'Analyse starten'
    });
    startButton.innerHTML = `<i class="fas fa-cogs"></i> ${startButton.textContent}`;
    
    if (isRunning) {
        startButton.disabled = true;
    }

    startButton.addEventListener('click', () => {
        bruteForceManager.startAnalysis();
    });
    
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(startButton);
    
    return card;
}

function createResultsCard(bruteForceState) {
    const card = createElement('div', { id: 'brute-force-results-card', classes: ['card'] });
    const title = createElement('h3', { textContent: 'Analyse-Status' });
    card.appendChild(title);

    if (bruteForceState.isRunning) {
        const progressWrapper = createElement('div');
        const progressLabel = createElement('p', { textContent: `Fortschritt: ${bruteForceState.progress}%` });
        const progressBarOuter = createElement('div', { classes: ['progress-bar-outer'] });
        const progressBarInner = createElement('div', { classes: ['progress-bar-inner'] });
        progressBarInner.style.width = `${bruteForceState.progress}%`;
        
        progressBarOuter.appendChild(progressBarInner);
        progressWrapper.appendChild(progressLabel);
        progressWrapper.appendChild(progressBarOuter);
        card.appendChild(progressWrapper);

    } else if (bruteForceState.bestResult) {
        const result = bruteForceState.bestResult;
        const resultWrapper = createElement('div');
        const accuracyText = `Maximale Genauigkeit: <strong>${formatNumber(result.accuracy * 100, 2)}%</strong>`;
        
        const params = result.parameters;
        const borderText = params.border.length > 0 ? params.border.join(', ') : 'nicht verwendet';
        const signalText = params.signal.length > 0 ? params.signal.join(', ') : 'nicht verwendet';

        const paramsText = `
            <p>Erzielt mit folgenden optimalen Parametern:</p>
            <ul>
                <li><strong>Größen-Schwellenwert:</strong> ${params.size} mm</li>
                <li><strong>Rand-Kriterien:</strong> ${borderText}</li>
                <li><strong>Signal-Kriterien:</strong> ${signalText}</li>
            </ul>
        `;
        
        resultWrapper.innerHTML = `<p>${accuracyText}</p>${paramsText}`;
        card.appendChild(resultWrapper);
    } else {
        const placeholder = createElement('p', { textContent: 'Die Analyse wurde noch nicht ausgeführt. Klicken Sie auf "Analyse starten".' });
        card.appendChild(placeholder);
    }

    return card;
}

export function renderEvaluationTab(state) {
    const controlsContainer = getElement('#evaluation-controls');
    const resultsContainer = getElement('#evaluation-results');
    
    clearContainer(controlsContainer);
    clearContainer(resultsContainer);
    
    const controlsCard = createControlsCard(state.bruteForce.isRunning);
    const resultsCard = createResultsCard(state.bruteForce);

    controlsContainer.appendChild(controlsCard);
    resultsContainer.appendChild(resultsCard);
}
