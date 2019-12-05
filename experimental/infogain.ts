export class InfoGain {

    public static normalized_entropy(counts: Array<number>): number {
        const total = counts.reduce((a, b) => a + b, 0);
        let entropy = 0;
        for (let i = 0; i < counts.length; i++) {
            const freq = counts[i] / total;
            if (freq !== 0) {
                entropy -= freq * Math.log2(freq);
            }
        }
        return entropy / Math.log2(total);
    }

    public static salience(counts: Array<number>, index: number): number {
        const total = counts.reduce((a, b) => a + b, 0);
        const p_index = counts[index] / total;
        const salience = (1 - p_index) * (1 - InfoGain.normalized_entropy(counts));
        return salience;
    }
}
