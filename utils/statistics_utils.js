const StatisticsUtils = {
    logGamma: function(Z) {
        const S = 1 + 76.18009173 / Z - 86.50532033 / (Z + 1) + 24.01409822 / (Z + 2) - 1.231739516 / (Z + 3) + 0.00120858003 / (Z + 4) - 0.00000536382 / (Z + 5);
        const L = (Z - 0.5) * Math.log(Z + 4.5) - (Z + 4.5);
        const G = 2.50662827465;
        return L + Math.log(S * G);
    },

    betaCF: function(A, B, X) {
        const A0 = 1;
        let B0 = 1;
        let A1 = 1;
        let B1 = 1;
        let M9 = 0;
        let A2 = 0;
        let C9;

        while (Math.abs((A1 - A2) / A1) > 0.00001) {
            A2 = A1;
            C9 = -(A + M9) * (A + B + M9) * X / ((A + 2 * M9) * (A + 2 * M9 + 1));
            A0 = A1 + C9 * A0;
            B0 = B1 + C9 * B0;
            M9 = M9 + 1;
            C9 = M9 * (B - M9) * X / ((A + 2 * M9 - 1) * (A + 2 * M9));
            A1 = A0 + C9 * A1;
            B1 = B0 + C9 * B1;
            A0 = A0 / B1;
            B0 = B0 / B1;
            A1 = A1 / B1;
            B1 = 1;
        }
        return A1;
    },

    betaI: function(A, B, X) {
        let Beta;
        if (X < 0 || X > 1) {
            return 0;
        }
        if (X === 0 || X === 1) {
            Beta = 0;
        } else {
            Beta = Math.exp(this.logGamma(A + B) - this.logGamma(A) - this.logGamma(B) + A * Math.log(X) + B * Math.log(1 - X));
        }

        if (X < (A + 1) / (A + B + 2)) {
            return Beta * this.betaCF(A, B, X) / A;
        } else {
            return 1 - Beta * this.betaCF(B, A, 1 - X) / B;
        }
    },

    inverseBetaI: function(p, a, b) {
        let x = 0.5;
        let step = 0.25;
        let maxIter = 100;
        let iter = 0;

        while (iter < maxIter) {
            let diff = this.betaI(a, b, x) - p;
            if (Math.abs(diff) < 1e-7) {
                return x;
            }

            if (diff > 0) {
                x -= step;
            } else {
                x += step;
            }
            step /= 2;
            iter++;
        }
        return x;
    },

    calculateClopperPearson: function(k, n, alpha) {
        const lowerAlpha = alpha / 2;
        const upperAlpha = 1 - (alpha / 2);
        
        let lower, upper;

        if (k === 0) {
            lower = 0;
        } else {
            lower = this.inverseBetaI(lowerAlpha, k, n - k + 1);
        }

        if (k === n) {
            upper = 1;
        } else {
            upper = this.inverseBetaI(upperAlpha, k + 1, n - k);
        }

        return { lower, upper };
    }
};

window.StatisticsUtils = StatisticsUtils;
