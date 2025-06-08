import { stateManager } from '../core/state_manager.js';

const PARAMETER_RANGES = {
    size: { min: 2, max: 20, step: 1 },
    border: { options: ['irregulär', 'spikuliert'] },
    signal: { options: ['heterogen', 'intermediär'] }
};

class BruteForceManager {
    constructor(manager) {
        this.stateManager = manager;
        this.worker = null;
    }

    startAnalysis() {
        if (this.stateManager.getState().bruteForce.isRunning) {
            console.warn("Brute-force analysis is already running.");
            return;
        }

        this.stateManager.setState({
            bruteForce: {
                ...this.stateManager.getState().bruteForce,
                isRunning: true,
                progress: 0,
                bestResult: null
            }
        });

        this.worker = new Worker('./workers/brute_force_worker.js');
        
        this.worker.onmessage = (e) => {
            const { type, progress, bestResult } = e.data;
            if (type === 'progress') {
                this.stateManager.setState({
                    bruteForce: {
                        ...this.stateManager.getState().bruteForce,
                        progress: progress
                    }
                });
            } else if (type === 'done') {
                this.stateManager.setState({
                    bruteForce: {
                        isRunning: false,
                        progress: 100,
                        bestResult: bestResult
                    }
                });
                this.worker.terminate();
                this.worker = null;
            }
        };

        this.worker.onerror = (error) => {
            console.error("Error in Brute-Force-Worker:", error);
            this.stateManager.setState({
                bruteForce: {
                    isRunning: false,
                    progress: 0,
                    bestResult: null
                }
            });
            this.worker.terminate();
            this.worker = null;
        };

        const patientDataForWorker = this.stateManager.getState().processedData.map(p => ({
            groundTruth: p.groundTruth,
            lymphknoten_t2: p.lymphknoten_t2
        }));

        this.worker.postMessage({
            patientData: patientDataForWorker,
            parameterRanges: PARAMETER_RANGES
        });
    }

    getAvailableParameters() {
        return PARAMETER_RANGES;
    }
}

export const bruteForceManager = new BruteForceManager(stateManager);
