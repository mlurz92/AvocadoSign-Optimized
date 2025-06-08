import { deepClone } from '../utils/helpers.js';

class StateManager {
    constructor(initialState) {
        this.state = deepClone(initialState);
        this.listeners = new Set();
    }

    getState() {
        return deepClone(this.state);
    }

    setState(newState) {
        const updatedKeys = [];
        for (const key in newState) {
            if (Object.prototype.hasOwnProperty.call(newState, key)) {
                if (JSON.stringify(this.state[key]) !== JSON.stringify(newState[key])) {
                    this.state[key] = deepClone(newState[key]);
                    updatedKeys.push(key);
                }
            }
        }

        if (updatedKeys.length > 0) {
            this.notify(updatedKeys);
        }
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    notify(updatedKeys) {
        for (const listener of this.listeners) {
            listener(this.getState(), updatedKeys);
        }
    }
}

const initialState = {
    patientData: [],
    processedData: [],
    activeTab: 'data',
    criteria: {
        avocado: {
            scoreThreshold: 3
        },
        t2: {
            sizeThreshold: 5,
            irregularBorder: true,
            heterogeneousSignal: true
        }
    },
    evaluationResults: {},
    bruteForce: {
        isRunning: false,
        progress: 0,
        bestResult: null,
        results: []
    },
    statistics: {
        avocado: {},
        t2: {},
        bruteForce: {},
        comparison: {}
    },
    publication: {
        generatedText: {},
        figures: {},
        tables: {}
    }
};

export const stateManager = new StateManager(initialState);
