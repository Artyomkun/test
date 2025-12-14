interface CoverageMetrics {
    total: number;
    covered: number;
    pct: number;
}

interface FileCoverage {
    lines: CoverageMetrics;
    statements: CoverageMetrics;
    functions: CoverageMetrics;
    branches: CoverageMetrics;
}

interface CoverageSummary {
    metadata: 
    {
        project: string;
        timestamp: string;
        generator: string;
    };
    total: FileCoverage;
    files: Record<string, FileCoverage>;
    directories: Record<string, FileCoverage>;
    analysis: {
        highCoverage: Array<
            { 
                file: string; 
                lines: number; 
                category: string 
            }>;
        lowCoverage: Array<
            { 
                file: string; 
                lines: number; 
                category: string; 
                needsAttention?: boolean 
            }>;
        trend: Record<string, 
            { 
                current: number; 
                previous: number; 
                change: string; 
                direction: string 
            }>;
    };
    qualityGates: Record<string, 
        { 
            threshold: number; 
            actual: number; 
            passed: boolean 
        }>;
}

// Функция для загрузки данных покрытия
async function loadCoverageData(): Promise<CoverageSummary> {
    const response = await fetch('../../json/coverage-summary.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Функция для отображения покрытия
function displayCoverage(data: CoverageSummary): void {
    const container = document.getElementById('coverage-container');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Очистка контейнера
    container.innerHTML = '';

    // Заголовок
    const header = document.createElement('header');
    header.innerHTML = `
        <h1>Отчет о покрытии кода</h1>
        <div class="metadata">
        <p><strong>Проект:</strong> ${data.metadata.project}</p>
        <p><strong>Дата:</strong> ${new Date(data.metadata.timestamp).toLocaleString('ru-RU')}</p>
        <p><strong>Генератор:</strong> ${data.metadata.generator}</p>
        </div>
    `;
    container.appendChild(header);

    // Сводная статистика
    const summary = document.createElement('section');
    summary.className = 'summary';
    summary.innerHTML = `
        <h2>📊 Сводная статистика</h2>
        <div class="metrics-grid">
        ${renderMetric('Строки', data.total.lines)}
        ${renderMetric('Операторы', data.total.statements)}
        ${renderMetric('Функции', data.total.functions)}
        ${renderMetric('Ветви', data.total.branches)}
        </div>
    `;
    container.appendChild(summary);

    // Качество кода
    const quality = document.createElement('section');
    quality.className = 'quality-gates';
    quality.innerHTML = `
        <h2>🎯 Качество кода</h2>
        <div class="gates-grid">
        ${Object.entries(data.qualityGates).map(([key, gate]) =>
            `<div class="gate ${gate.passed ? 'passed' : 'failed'}">
            <strong>${key.toUpperCase()}</strong>: ${gate.actual.toFixed(1)}% (порог: ${gate.threshold}%)
            <span class="status">${gate.passed ? '✅' : '❌'}</span>
            </div>`
        ).join('')}
        </div>
    `;
    container.appendChild(quality);

    // Файлы с покрытием
    const files = document.createElement('section');
    files.className = 'files';
    files.innerHTML = `
        <h2>📁 Покрытие по файлам</h2>
        <div class="files-grid">
        ${Object.entries(data.files).map(([file, cov]) =>
            `<div class="file-card">
            <h3>${file}</h3>
            <div class="file-metrics">
                ${renderMetric('Строки', cov.lines)}
                ${renderMetric('Функции', cov.functions)}
                ${renderMetric('Ветви', cov.branches)}
            </div>
            </div>`
        ).join('')}
        </div>
    `;
    container.appendChild(files);

    // Анализ
    const analysis = document.createElement('section');
    analysis.className = 'analysis';
    analysis.innerHTML = `
        <h2>📈 Анализ покрытия</h2>

        <h3>Файлы с высоким покрытием</h3>
        <ul>
        ${data.analysis.highCoverage.map(item =>
            `<li class="high">${item.file} - ${item.lines}% (${item.category})</li>`
        ).join('')}
        </ul>

        <h3>Файлы с низким покрытием</h3>
        <ul>
        ${data.analysis.lowCoverage.map(item =>
            `<li class="${item.needsAttention ? 'attention' : 'low'}">${item.file} - ${item.lines}% (${item.category})</li>`
        ).join('')}
        </ul>

        <h3>Тренд покрытия</h3>
        <div class="trend">
        ${Object.entries(data.analysis.trend).map(([metric, trend]) =>
            `<div class="trend-item ${trend.direction}">
            <strong>${metric}:</strong> ${trend.current}% (${trend.change})
            </div>`
        ).join('')}
        </div>
    `;
    container.appendChild(analysis);
}

// Вспомогательная функция для рендеринга метрики
function renderMetric(label: string, metric: CoverageMetrics): string {
    const percentage = metric.pct.toFixed(1);
    let colorClass = 'low';
    if (metric.pct >= 90) colorClass = 'excellent';
    else if (metric.pct >= 80) colorClass = 'good';
    else if (metric.pct >= 70) colorClass = 'medium';

    return `
        <div class="metric ${colorClass}">
        <div class="label">${label}</div>
        <div class="value">${percentage}%</div>
        <div class="details">(${metric.covered}/${metric.total})</div>
        </div>
    `;
}

// Обработчик загрузки страницы
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await loadCoverageData();
        displayCoverage(data);
    } catch (error) {
        console.error('Ошибка загрузки данных покрытия:', error);
        const container = document.getElementById('coverage-container');
        if (container) {
        container.innerHTML = `
            <div class="error">
            <h1>Ошибка загрузки данных</h1>
            <p>Не удалось загрузить отчет о покрытии кода.</p>
            <p>Проверьте, запущены ли тесты с покрытием.</p>
            </div>
        `;
        }
    }
});