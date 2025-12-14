import fs from 'fs';
import path from 'path';

interface ImprovementResult {
    from: number;
    to: number;
    improvement: number;
    trend: string;
}

export default class TrendAnalyzer {
    reportsDir: string;
    constructor(reportsDir: string) {
        this.reportsDir = reportsDir;
    }

    // Анализ улучшения покрытия
    analyzeCoverageTrend(): { lines: ImprovementResult; functions: ImprovementResult; branches: ImprovementResult; period: string } | null {
        const files = fs.readdirSync(this.reportsDir)
        .filter(file => file.startsWith('coverage-summary-') && file.endsWith('.json'))
            .sort();
        
        if (files.length < 2) {
            console.log('Недостаточно данных для анализа трендов');
            return null;
        }

        const firstReport = JSON.parse(
            fs.readFileSync(path.join(this.reportsDir, files[0]), 'utf8')
        );
        const lastReport = JSON.parse(
            fs.readFileSync(path.join(this.reportsDir, files[files.length - 1]), 'utf8')
        );

        const improvements = {
            lines: this.calculateImprovement(firstReport.summary.lines, lastReport.summary.lines),
            functions: this.calculateImprovement(firstReport.summary.functions, lastReport.summary.functions),
            branches: this.calculateImprovement(firstReport.summary.branches, lastReport.summary.branches),
            period: `${files[0].split('-').slice(2, 5).join('-')} - ${files[files.length - 1].split('-').slice(2, 5).join('-')}`
        };

        return improvements;
    }

    calculateImprovement(first: { percentage: number; }, last: { percentage: number; }): ImprovementResult {
        const improvementPercentage = ((last.percentage - first.percentage) / first.percentage * 100);
        const improvement = improvementPercentage.toFixed(2);
        return {
            from: first.percentage,
            to: last.percentage,
            improvement: parseFloat(improvement),
            trend: improvementPercentage >= 0 ? '📈 Улучшение' : '📉 Ухудшение'
        };
    }
}