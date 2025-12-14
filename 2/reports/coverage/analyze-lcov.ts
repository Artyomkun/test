#!/usr/bin/env node

/**
 * Утилита для анализа LCOV файлов
 * Анализирует отчеты о покрытии кода в формате LCOV
 *
 * Использование:
 *   node analyze-lcov.js [команда] [аргументы]
 *
 * Команды:
 *   summary           - Сводная статистика покрытия
 *   files             - Список файлов с покрытием
 *   low               - Файлы с низким покрытием (<80%)
 *   uncovered         - Непокрытые строки кода
 *   badge             - Генерация badge для README
 *   export [формат]   - Экспорт в разных форматах
 *   compare [файл1] [файл2] - Сравнение двух отчетов
 */

import * as fs from 'fs';

interface LcovRecord {
    file: string;
    functions: 
        { 
            line: number; 
            name: string; 
            hits?: number
        }[];
    lines: 
        { 
            line: number; 
            hits: number 
        }[];
    branches: 
        { 
            line: number; 
            block: number; 
            branch: number; 
            hits: number 
        }[];
    fnf: number;
    fnh: number;
    lf: number;
    lh: number;
    brf: number;
    brh: number;
}

interface CoverageSummary {
    totalFiles: number;
    lines:
        {
            total: number;
            hit: number;
            percentage: string
        };
    functions:
        {
            total: number;
            hit: number;
            percentage: string
        };
    branches:
        {
            total: number;
            hit: number;
            percentage: string
        };
    overall: string;
    generated: string;
    lcovFile: string;
}

interface FileCoverage {
    file: string;
    lines: 
        { 
            total: number;
            hit: number; 
            percentage: string 
        };
    functions: 
        { 
            total: number; 
            hit: number; 
            percentage: string 
        };
    branches: 
        { 
            total: number; 
            hit: number; 
            percentage: string 
        };
    overall: string;
}

interface UncoveredLine {
    file: string;
    lines: number[];
    totalUncovered: number;
    totalLines: number;
    percentage: string;
}


class LcovAnalyzer {
    private lcovPath: string;
    private data: LcovRecord[] | null;
    private summary: CoverageSummary | null;

    constructor(lcovPath: string) {
        this.lcovPath = lcovPath;
        this.data = null;
        this.summary = null;
        
        if (fs.existsSync(lcovPath)) {
            this.parseLcov();
            this.calculateSummary();
        } else {
            console.warn(`⚠️  Файл LCOV не найден: ${lcovPath}`);
            console.warn('Запустите тесты с покрытием: npm run coverage');
        }
    }

    /**
     * Парсит LCOV файл
     */
    parseLcov() {
        try {
            const content = fs.readFileSync(this.lcovPath, 'utf8');
            const lines = content.split('\n');
            
            const records = [];
            let currentRecord = null;
            
            for (const line of lines) {
                if (line.startsWith('SF:')) {
                    if (currentRecord) {
                        records.push(currentRecord);
                    }
                    currentRecord = {
                            file: line.substring(3).trim(),
                            functions: [] as { line: number; name: string; hits?: number }[],
                            lines: [] as { line: number; hits: number }[],
                            branches: [] as { line: number; block: number; branch: number; hits: number }[],
                            fnf: 0,
                            fnh: 0,
                            lf: 0,
                            lh: 0,
                            brf: 0,
                            brh: 0
                        };
                } 
                else if (line.startsWith('FN:')) {
                    if (currentRecord) {
                        const [lineNum, name] = line.substring(3).split(',');
                        currentRecord.functions.push(
                                {
                                    line: parseInt(lineNum),
                                    name: name.trim()
                                }
                            );
                        }
                }
                else if (line.startsWith('FNDA:')) {
                    if (currentRecord) {
                        const [hits, name] = line.substring(5).split(',');
                        const func = currentRecord.functions.find(f => f.name === name.trim());
                            if (func) {
                                func.hits = parseInt(hits);
                            }
                        }
                }
                else if (line.startsWith('FNF:')) {
                    if (currentRecord) currentRecord.fnf = parseInt(line.substring(4));
                }
                else if (line.startsWith('FNH:')) {
                    if (currentRecord) currentRecord.fnh = parseInt(line.substring(4));
                }
                else if (line.startsWith('DA:')) {
                    if (currentRecord) {
                    const [lineNum, hits] = line.substring(3).split(',');
                        currentRecord.lines.push(
                            {
                                line: parseInt(lineNum),
                                hits: parseInt(hits)
                            }
                        );
                    }
                }
                else if (line.startsWith('LF:')) {
                    if (currentRecord) currentRecord.lf = parseInt(line.substring(3));
                }
                else if (line.startsWith('LH:')) {
                    if (currentRecord) currentRecord.lh = parseInt(line.substring(3));
                }
                else if (line.startsWith('BRDA:')) {
                    if (currentRecord) {
                        const [lineNum, block, branch, hits] = line.substring(5).split(',');
                        currentRecord.branches.push(
                                {
                                    line: parseInt(lineNum),
                                    block: parseInt(block),
                                    branch: parseInt(branch),
                                    hits: hits === '-' ? 0 : parseInt(hits)
                                }
                            );
                        }
                }
                else if (line.startsWith('BRF:')) {
                    if (currentRecord) currentRecord.brf = parseInt(line.substring(4));
                }
                else if (line.startsWith('BRH:')) {
                    if (currentRecord) currentRecord.brh = parseInt(line.substring(4));
                }
                else if (line === 'end_of_record') {
                    if (currentRecord) {
                        records.push(currentRecord);
                        currentRecord = null;
                    }
                }
            }
            
            if (currentRecord) {
                records.push(currentRecord);
            }
            
            this.data = records;
            console.log(`✓ Проанализировано ${records.length} файлов`);
            
        } catch (error) {
            console.error('❌ Ошибка парсинга LCOV файла:', (error as Error).message);
            this.data = [];
        }
    }

    /**
     * Рассчитывает сводную статистику
     */
    calculateSummary() {
        if (!this.data || this.data.length === 0) {
            this.summary = this.getEmptySummary();
            return;
        }

        const totalFiles = this.data!.length;
        let totalLines = 0;
        let hitLines = 0;
        let totalFunctions = 0;
        let hitFunctions = 0;
        let totalBranches = 0;
        let hitBranches = 0;

        this.data.forEach(
            record => {
                    totalLines += record.lf;
                    hitLines += record.lh;
                    totalFunctions += record.fnf;
                    hitFunctions += record.fnh;
                    totalBranches += record.brf;
                    hitBranches += record.brh;
                }
        );

        this.summary = {
            totalFiles,
            lines: {
                total: totalLines,
                hit: hitLines,
                percentage: this.calculatePercentage(hitLines, totalLines)
            },
            functions: {
                total: totalFunctions,
                hit: hitFunctions,
                percentage: this.calculatePercentage(hitFunctions, totalFunctions)
            },
            branches: {
                total: totalBranches,
                hit: hitBranches,
                percentage: this.calculatePercentage(hitBranches, totalBranches)
            },
            overall: this.calculateOverallPercentage(hitLines, hitFunctions, hitBranches, totalLines, totalFunctions, totalBranches),
            generated: new Date().toISOString(),
            lcovFile: this.lcovPath
        };
    }

    calculatePercentage(hit: number, total: number) {
        return total > 0 ? ((hit / total) * 100).toFixed(2) : '0.00';
    }

    calculateOverallPercentage(hitLines: number, hitFunctions: number, hitBranches: number, totalLines: number, totalFunctions: number, totalBranches: number) {
        const linesPct = totalLines > 0 ? (hitLines / totalLines) * 100 : 0;
        const funcsPct = totalFunctions > 0 ? (hitFunctions / totalFunctions) * 100 : 0;
        const branchesPct = totalBranches > 0 ? (hitBranches / totalBranches) * 100 : 0;
        
        const totalPct = (linesPct + funcsPct + branchesPct) / 3;
        return totalPct.toFixed(2);
    }

    getEmptySummary() {
        return {
            totalFiles: 0,
            lines: { total: 0, hit: 0, percentage: '0.00' },
            functions: { total: 0, hit: 0, percentage: '0.00' },
            branches: { total: 0, hit: 0, percentage: '0.00' },
            overall: '0.00',
            generated: new Date().toISOString(),
            lcovFile: this.lcovPath
        };
    }

    /**
      * Получает сводную статистику
      */
    getSummary() {
        return this.summary;
    }

    /**
      * Проверяет, был ли файл проанализирован
      */
    isParsed(): boolean {
        return !!this.data;
    }

    /**
     * Получает список файлов с покрытием
     */
    getFiles() {
        if (!this.data) return [];
        
        return this.data.map(
            record => {
                const lineCoverage = record.lf > 0 ? ((record.lh / record.lf) * 100).toFixed(2) : '0.00';
                const functionCoverage = record.fnf > 0 ? ((record.fnh / record.fnf) * 100).toFixed(2) : '0.00';
                const branchCoverage = record.brf > 0 ? ((record.brh / record.brf) * 100).toFixed(2) : '0.00';
                
                return {
                    file: record.file,
                    lines: {
                        total: record.lf,
                        hit: record.lh,
                        percentage: lineCoverage
                    },
                    functions: {
                        total: record.fnf,
                        hit: record.fnh,
                        percentage: functionCoverage
                    },
                    branches: {
                        total: record.brf,
                        hit: record.brh,
                        percentage: branchCoverage
                    },
                    overall: ((parseFloat(lineCoverage) + parseFloat(functionCoverage) + parseFloat(branchCoverage)) / 3).toFixed(2)
                };
            }
        );
    }

    /**
     * Получает файлы с низким покрытием
     */
    getLowCoverageFiles(threshold = 80) {
        const files = this.getFiles();
        return files
            .filter(file => parseFloat(file.lines.percentage) < threshold)
                .sort((a, b) => parseFloat(a.lines.percentage) - parseFloat(b.lines.percentage));
    }

    /**
     * Получает непокрытые строки
     */
    getUncoveredLines() {
        if (!this.data) return [];
        
        const uncovered: { file: string; lines: number[]; totalUncovered: number; totalLines: number; percentage: string; }[] = [];
        
        this.data.forEach(
            record => {
                const uncoveredLines = record.lines
                    .filter(line => line.hits === 0)
                        .map(line => line.line);
                
                if (uncoveredLines.length > 0) {
                    uncovered.push(
                        {
                            file: record.file,
                            lines: uncoveredLines,
                            totalUncovered: uncoveredLines.length,
                            totalLines: record.lf,
                            percentage: ((record.lf - uncoveredLines.length) / record.lf * 100).toFixed(2)
                        }
                    );
                }
            }
        );
        
        return uncovered.sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage));
    }

    /**
     * Генерирует badge для README
     */
    generateBadge(type = 'overall', style = 'flat') {
        const summary = this.summary;
        if (!summary) return 'https://img.shields.io/badge/coverage-unknown-lightgrey?style=flat';
        let percentage;
        
        switch (type) {
            case 'lines':
                percentage = parseFloat(summary.lines.percentage);
                break;
            case 'functions':
                percentage = parseFloat(summary.functions.percentage);
                break;
            case 'branches':
                percentage = parseFloat(summary.branches.percentage);
                break;
            case 'overall':
            default:
                percentage = parseFloat(summary.overall);
        }
        
        // Выбираем цвет в зависимости от покрытия
        let color = 'red';
        if (percentage >= 90) color = 'brightgreen';
        else if (percentage >= 80) color = 'green';
        else if (percentage >= 70) color = 'yellowgreen';
        else if (percentage >= 60) color = 'yellow';
        else if (percentage >= 50) color = 'orange';
        
        const label = type === 'overall' ? 'coverage' : `${type} coverage`;
        
        return `https://img.shields.io/badge/${label}-${percentage.toFixed(1)}%25-${color}?style=${style}`;
    }

    /**
     * Экспортирует данные в разных форматах
     */
    export(format = 'json', outputPath: string | null = null) {
        const data = {
            summary: this.summary,
            files: this.getFiles(),
            lowCoverage: this.getLowCoverageFiles(),
            uncoveredLines: this.getUncoveredLines(),
            generated: new Date().toISOString()
        };
        
        let content;
        let extension;
        
        switch (format.toLowerCase()) {
            case 'json':
                content = JSON.stringify(data, null, 2);
                extension = 'json';
                break;
                
            case 'csv':
                content = this.toCsv(data);
                extension = 'csv';
                break;
                
            case 'markdown':
                case 'md':
                    content = this.toMarkdown(data);
                    extension = 'md';
                    break;
                    
                case 'html':
                    content = this.toHtml(data);
                    extension = 'html';
                    break;
                
            default:
                console.error(`❌ Неподдерживаемый формат: ${format}`);
                return null;
        }
        
        if (outputPath) {
            const fullPath = outputPath.endsWith(`.${extension}`) 
                ? outputPath 
                    : `${outputPath}.${extension}`;
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✓ Данные экспортированы в: ${fullPath}`);
        }
        
        return content;
    }
    
    toCsv(data: { files: FileCoverage[] }) {
        let csv = 'File,Lines Coverage,Functions Coverage,Branches Coverage,Overall Coverage\n';

        data.files.forEach(
            file => {
                const cleanFileName = file.file.replace(/"/g, '""');
                csv += `"${cleanFileName}",${file.lines.percentage},${file.functions.percentage},${file.branches.percentage},${file.overall}\n`;
            }
        );

        return csv;
    }
    
    toMarkdown(data: { summary: CoverageSummary | null; lowCoverage: FileCoverage[]; uncoveredLines: UncoveredLine[] }) {
        let md = `# Отчет о покрытии кода\n\n`;
        md += `**Дата генерации:** ${new Date().toLocaleString('ru-RU')}\n\n`;

        md += `## 📊 Сводная статистика\n\n`;
        md += `| Метрика | Покрыто | Всего | Процент |\n`;
        md += `|---------|---------|-------|---------|\n`;
        md += `| Строки | ${data.summary!.lines.hit} | ${data.summary!.lines.total} | ${data.summary!.lines.percentage}% |\n`;
        md += `| Функции | ${data.summary!.functions.hit} | ${data.summary!.functions.total} | ${data.summary!.functions.percentage}% |\n`;
        md += `| Ветви | ${data.summary!.branches.hit} | ${data.summary!.branches.total} | ${data.summary!.branches.percentage}% |\n`;
        md += `| **Общее** | **-** | **-** | **${data.summary!.overall}%** |\n\n`;

        if (data.lowCoverage.length > 0) {
            md += `## 📉 Файлы с низким покрытием (<80%)\n\n`;
            md += `| Файл | Строки | Функции | Ветви | Общее |\n`;
            md += `|------|--------|---------|-------|-------|\n`;

            data.lowCoverage.forEach(file => {
                    md += `| ${file.file} | ${file.lines.percentage}% | ${file.functions.percentage}% | ${file.branches.percentage}% | ${file.overall}% |\n`;
                }
            );
            md += `\n`;
        }

        if (data.uncoveredLines.length > 0) {
            md += `## ❌ Файлы с непокрытыми строками\n\n`;
            data.uncoveredLines.forEach(
                item => {
                    md += `### ${item.file}\n`;
                    md += `Покрытие: ${item.percentage}% (непокрыто ${item.totalUncovered} из ${item.totalLines} строк)\n\n`;

                    if (item.lines.length <= 20) {
                        md += `Номера непокрытых строк: ${item.lines.join(', ')}\n\n`;
                    } else {
                        md += `Номера непокрытых строк: ${item.lines.slice(0, 20).join(', ')}... (и еще ${item.lines.length - 20})\n\n`;
                    }
                }
            );
        }

        return md;
    }
    
    toHtml(data: { summary: CoverageSummary | null; lowCoverage: FileCoverage[] }) {
        return `<!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Отчет о покрытии кода</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                        .metric { margin: 10px 0; }
                        .percentage { font-weight: bold; font-size: 1.2em; }
                        .high { color: #28a745; }
                        .medium { color: #ffc107; }
                        .low { color: #dc3545; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>📊 Отчет о покрытии кода</h1>
                    <p>Сгенерировано: ${new Date().toLocaleString('ru-RU')}</p>
                    
                    <div class="summary">
                        <h2>Сводная статистика</h2>
                        <div class="metric">
                            <strong>Строки:</strong>
                            <span class="percentage ${parseFloat(data.summary!.lines.percentage) >= 80 ? 'high' : parseFloat(data.summary!.lines.percentage) >= 60 ? 'medium' : 'low'}">
                                ${data.summary!.lines.percentage}%
                            </span>
                            (${data.summary!.lines.hit}/${data.summary!.lines.total})
                        </div>
                        <div class="metric">
                            <strong>Функции:</strong>
                            <span class="percentage ${parseFloat(data.summary!.functions.percentage) >= 80 ? 'high' : parseFloat(data.summary!.functions.percentage) >= 60 ? 'medium' : 'low'}">
                                ${data.summary!.functions.percentage}%
                            </span>
                            (${data.summary!.functions.hit}/${data.summary!.functions.total})
                        </div>
                        <div class="metric">
                            <strong>Ветви:</strong>
                            <span class="percentage ${parseFloat(data.summary!.branches.percentage) >= 80 ? 'high' : parseFloat(data.summary!.branches.percentage) >= 60 ? 'medium' : 'low'}">
                                ${data.summary!.branches.percentage}%
                            </span>
                            (${data.summary!.branches.hit}/${data.summary!.branches.total})
                        </div>
                        <div class="metric">
                            <strong>Общее покрытие:</strong>
                            <span class="percentage ${parseFloat(data.summary!.overall) >= 80 ? 'high' : parseFloat(data.summary!.overall) >= 60 ? 'medium' : 'low'}">
                                ${data.summary!.overall}%
                            </span>
                        </div>
                    </div>
                    
                    ${data.lowCoverage.length > 0 ? `
                    <h2>📉 Файлы с низким покрытием (<80%)</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Файл</th>
                                <th>Строки</th>
                                <th>Функции</th>
                                <th>Ветви</th>
                                <th>Общее</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.lowCoverage.map(file => `
                            <tr>
                                <td>${file.file}</td>
                                <td class="${parseFloat(file.lines.percentage) >= 80 ? 'high' : parseFloat(file.lines.percentage) >= 60 ? 'medium' : 'low'}">
                                    ${file.lines.percentage}%
                                </td>
                                <td class="${parseFloat(file.functions.percentage) >= 80 ? 'high' : parseFloat(file.functions.percentage) >= 60 ? 'medium' : 'low'}">
                                    ${file.functions.percentage}%
                                </td>
                                <td class="${parseFloat(file.branches.percentage) >= 80 ? 'high' : parseFloat(file.branches.percentage) >= 60 ? 'medium' : 'low'}">
                                    ${file.branches.percentage}%
                                </td>
                                <td class="${parseFloat(file.overall) >= 80 ? 'high' : parseFloat(file.overall) >= 60 ? 'medium' : 'low'}">
                                    ${file.overall}%
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : ''}
                </body>
                </html>`;
    }

    /**
     * Сравнивает два LCOV отчета
     */
    static compare(lcov1Path: string, lcov2Path: string) {
        const analyzer1 = new LcovAnalyzer(lcov1Path);
        const analyzer2 = new LcovAnalyzer(lcov2Path);
        
        const summary1 = analyzer1.getSummary();
        if (!summary1) throw new Error('Failed to generate summary for first report');
        const summary2 = analyzer2.getSummary();
        if (!summary2) throw new Error('Failed to generate summary for second report');
        
        const comparison = {
            report1: {
                path: lcov1Path,
                ...summary1
            },
            report2: {
                path: lcov2Path,
                ...summary2
            },
            differences: {
                lines: (parseFloat(summary2.lines.percentage) - parseFloat(summary1.lines.percentage)).toFixed(2),
                functions: (parseFloat(summary2.functions.percentage) - parseFloat(summary1.functions.percentage)).toFixed(2),
                branches: (parseFloat(summary2.branches.percentage) - parseFloat(summary1.branches.percentage)).toFixed(2),
                overall: (parseFloat(summary2.overall) - parseFloat(summary1.overall)).toFixed(2)
            },
            improved: parseFloat(summary2.overall) > parseFloat(summary1.overall)
        };
        
        return comparison;
    }
}

/**
 * Вспомогательные функции
 */
function findLcovFile() {
        const possiblePaths = [
            'coverage/lcov.info',
            'reports/coverage/lcov.info',
            'lcov.info',
            './lcov.info'
        ];
        
        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
            return filePath;
            }
        }
        
        const parentPaths = [
            '../coverage/lcov.info',
            '../lcov.info',
            '../../coverage/lcov.info'
        ];
        
        for (const filePath of parentPaths) {
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }
        
    return null;
}

function printSummary(summary: CoverageSummary) {
    console.log('\n📊 Сводная статистика покрытия кода');
    console.log('==================================\n');
    
    console.log(`📁 Файлов: ${summary.totalFiles}`);
    console.log(`📅 Сгенерировано: ${new Date(summary.generated).toLocaleString('ru-RU')}`);
    console.log(`📄 Файл LCOV: ${summary.lcovFile}\n`);
    
    console.log('📈 Метрики покрытия:');
    console.log('────────────────────');
    console.log(`📝 Строки:    ${summary.lines.hit}/${summary.lines.total} (${summary.lines.percentage}%)`);
    console.log(`🔧 Функции:   ${summary.functions.hit}/${summary.functions.total} (${summary.functions.percentage}%)`);
    console.log(`🌿 Ветви:     ${summary.branches.hit}/${summary.branches.total} (${summary.branches.percentage}%)`);
    console.log(`⭐ Общее:     ${summary.overall}%\n`);

    const overall = parseFloat(summary.overall);
    let rating = '❌ Низкое';
    let emoji = '😟';
    
    if (overall >= 90) {
        rating = '🎉 Отличное';
        emoji = '😊';
    } else if (overall >= 80) {
        rating = '✅ Хорошее';
        emoji = '🙂';
    } else if (overall >= 70) {
        rating = '⚠️  Удовлетворительное';
        emoji = '😐';
    } else if (overall >= 60) {
        rating = '⚠️  Ниже среднего';
        emoji = '😕';
    }
    
    console.log(`${emoji} Оценка: ${rating}`);
}

function printFiles(files: FileCoverage[], limit = 20) {
    console.log(`\n📁 Файлы (первые ${limit} из ${files.length}):`);
    console.log('========================================\n');
    
    const displayFiles = files.slice(0, limit);
    
    displayFiles.forEach(
        (file, index) => {
            const overall = parseFloat(file.overall);
            let status = '❌';
            if (overall >= 90) status = '🎉';
            else if (overall >= 80) status = '✅';
            else if (overall >= 70) status = '⚠️ ';
            
            console.log(`${index + 1}. ${status} ${file.file}`);
            console.log(`   📝 ${file.lines.percentage}% | 🔧 ${file.functions.percentage}% | 🌿 ${file.branches.percentage}% | ⭐ ${file.overall}%`);
        }
    );
    
    if (files.length > limit) {
        console.log(`\n... и еще ${files.length - limit} файлов`);
    }
}

/**
 * CLI интерфейс
 */
function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'summary';
    
    const lcovPath = findLcovFile();
    
    if (!lcovPath) {
        console.error('❌ Файл lcov.info не найден!');
        console.error('\nВозможные причины:');
        console.error('1. Тесты не были запущены с покрытием');
        console.error('2. Файл находится в другом каталоге');
        console.error('\nРешение:');
        console.error('Запустите тесты с покрытием:');
        console.error('  npm run coverage');
        console.error('  или');
        console.error('  jest --coverage');
        process.exit(1);
    }
    
    console.log(`🔍 Анализ файла: ${lcovPath}`);
    
    const analyzer = new LcovAnalyzer(lcovPath);
    
    if (!analyzer.isParsed()) {
        console.error('❌ Не удалось проанализировать LCOV файл');
        process.exit(1);
    }
    
    switch (command) {
        case 'summary': {
            const summary = analyzer.getSummary() as CoverageSummary;
            printSummary(summary);
            break;
        }
        
        case 'files': {
            const files = analyzer.getFiles();
            const sortedFiles = files.sort((a, b) => parseFloat(b.overall) - parseFloat(a.overall));
            const limit = args[1] ? parseInt(args[1]) : 20;
            printFiles(sortedFiles, limit);
            break;
        }
        
        case 'low': {
            const threshold = args[1] ? parseInt(args[1]) : 80;
            const lowFiles = analyzer.getLowCoverageFiles(threshold);

            if (lowFiles.length === 0) {
                console.log(`\n✅ Все файлы имеют покрытие выше ${threshold}%!`);
            } else {
                console.log(`\n📉 Файлы с покрытием ниже ${threshold}% (${lowFiles.length}):`);
                console.log('==============================================\n');

                lowFiles.forEach(
                    (file, index) => {
                        console.log(`${index + 1}. ❌ ${file.file}`);
                        console.log(`   📝 Строки: ${file.lines.percentage}% (${file.lines.hit}/${file.lines.total})`);
                        console.log(`   🔧 Функции: ${file.functions.percentage}% (${file.functions.hit}/${file.functions.total})`);
                        console.log(`   🌿 Ветви: ${file.branches.percentage}% (${file.branches.hit}/${file.branches.total})`);
                        console.log(`   ⭐ Общее: ${file.overall}%\n`);
                    }
                );
            }
            break;
        }
        
        case 'uncovered': {
            const uncovered = analyzer.getUncoveredLines();

            if (uncovered.length === 0) {
                console.log('\n✅ Все строки кода покрыты тестами!');
            } else {
                console.log(`\n❌ Файлы с непокрытыми строками (${uncovered.length}):`);
                console.log('============================================\n');

                uncovered.forEach(
                    (item, index) => {
                        console.log(`${index + 1}. ${item.file}`);
                        console.log(`   Покрытие: ${item.percentage}%`);
                        console.log(`   Непокрыто: ${item.totalUncovered} из ${item.totalLines} строк`);

                        if (item.lines.length <= 10) {
                            console.log(`   Строки: ${item.lines.join(', ')}`);
                        } else {
                            console.log(`   Строки: ${item.lines.slice(0, 10).join(', ')}... (и еще ${item.lines.length - 10})`);
                        }
                        console.log();
                    }
                );
            }
            break;
        }
        
        case 'badge': {
            const type = args[1] || 'overall';
            const style = args[2] || 'flat';
            const badgeUrl = analyzer.generateBadge(type, style);
            console.log(`\n🛡️ Badge URL (${type}, ${style}):`);
            console.log(badgeUrl);
            console.log('\nMarkdown:');
            console.log(`![Coverage](${badgeUrl})`);
            console.log('\nHTML:');
            console.log(`<img src="${badgeUrl}" alt="Coverage">`);
            break;
        }
        
        case 'export': {
            const format = args[1] || 'json';
            const output = args[2] || `coverage-report-${new Date().toISOString().split('T')[0]}`;
            analyzer.export(format, output);
            break;
        }
        
        case 'compare': {
            if (args.length < 3) {
                console.error('❌ Укажите два файла для сравнения:');
                console.error('   node analyze-lcov.js compare файл1.lcov файл2.lcov');
                process.exit(1);
            }

            const comparison = LcovAnalyzer.compare(args[1], args[2]);

            console.log('\n📊 Сравнение отчетов о покрытии');
            console.log('================================\n');

            console.log('📄 Отчет 1:', comparison.report1.path);
            console.log('📄 Отчет 2:', comparison.report2.path);
            console.log();

            console.log('📈 Изменения:');
            console.log('─────────────');

            const diffs = comparison.differences;
            Object.keys(diffs).forEach(
                key => {
                    const diff = parseFloat(diffs[key as keyof typeof diffs]);
                    const arrow = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
                    const color = diff > 0 ? '\x1b[32m' : diff < 0 ? '\x1b[31m' : '\x1b[90m';
                    const reset = '\x1b[0m';

                    console.log(`${arrow} ${key}: ${color}${diff > 0 ? '+' : ''}${diff}%${reset}`);
                }
            );

            console.log(`\n${comparison.improved ? '✅ Покрытие улучшилось!' : '❌ Покрытие ухудшилось'}`);
            break;
        }
        
        case 'help':
            case '--help':
                case '-h':
                    showHelp();
                    break;
        
        default:
        console.error(`❌ Неизвестная команда: ${command}`);
        showHelp();
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
        📊 Анализатор LCOV отчетов
        ==========================

        Использование:
        node analyze-lcov.js [команда] [аргументы]

        Команды:
        summary                    - Сводная статистика покрытия
        files [лимит]             - Список файлов (опционально лимит, по умолчанию 20)
        low [порог]               - Файлы с низким покрытием (порог по умолчанию 80%)
        uncovered                 - Файлы с непокрытыми строками
        badge [тип] [стиль]       - Генерация badge (типы: overall, lines, functions, branches)
        export [формат] [выход]   - Экспорт (форматы: json, csv, md, html)
        compare файл1 файл2       - Сравнение двух LCOV отчетов
        help                      - Эта справка

        Примеры:
        node analyze-lcov.js summary
        node analyze-lcov.js files 10
        node analyze-lcov.js low 70
        node analyze-lcov.js badge lines flat-square
        node analyze-lcov.js export json coverage-report
        node analyze-lcov.js compare old.lcov new.lcov

        Запуск тестов с покрытием:
        npm run coverage
        или
        jest --coverage
    `);
}

// Запуск CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        main();
    } catch (error) {
        console.error('❌ Ошибка:', (error as Error).message);
        console.error((error as Error).stack);
        process.exit(1);
    }
}

export default LcovAnalyzer;