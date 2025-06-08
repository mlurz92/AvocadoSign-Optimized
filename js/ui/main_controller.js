import { stateManager } from '../core/state_manager.js';
import { getElement, getAllElements } from '../utils/dom_helpers.js';
import { renderDataTab } from './features/data_tab.js';
import { renderEvaluationTab } from './features/evaluation_tab.js';
import { renderStatisticsTab } from './features/statistics_tab.js';
import { renderPublicationTab } from './features/publication_tab.js';
import { renderPresentationTab } from './features/presentation_tab.js';

function updateTabButtons(activeTabId) {
    const tabButtons = getAllElements('.tab-button');
    tabButtons.forEach(button => {
        if (button.id === `tab-btn-${activeTabId}`) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function updateTabContent(activeTabId) {
    const tabContents = getAllElements('.tab-content');
    tabContents.forEach(content => {
        if (content.id === `tab-content-${activeTabId}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

function renderActiveTab(state) {
    const { activeTab, processedData } = state;

    updateTabButtons(activeTab);
    updateTabContent(activeTab);

    switch (activeTab) {
        case 'data':
            renderDataTab(processedData);
            break;
        case 'auswertung':
            renderEvaluationTab(state);
            break;
        case 'statistik':
            renderStatisticsTab(state);
            break;
        case 'publikation':
            renderPublicationTab(state);
            break;
        case 'praesentation':
            renderPresentationTab(state);
            break;
        default:
            console.error(`Unknown tab: ${activeTab}`);
    }
}

function initEventListeners() {
    const tabButtons = getAllElements('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newTabId = button.id.replace('tab-btn-', '');
            stateManager.setState({ activeTab: newTabId });
        });
    });
}

export function initializeUI() {
    initEventListeners();
    stateManager.subscribe((newState, updatedKeys) => {
        if (updatedKeys.includes('activeTab') || updatedKeys.includes('processedData') || updatedKeys.includes('bruteForce')) {
             renderActiveTab(newState);
        }
    });
    renderActiveTab(stateManager.getState());
}
