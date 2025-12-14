import * as fs from 'fs';
import * as path from 'path';

interface TestResults {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
}

interface CoverageResults {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
}

class ReportGenerator {
    private reportsDir: string;
    private coverageDir: string;
    private htmlDir: string;
    private junitDir: string;

    constructor() {
        this.reportsDir = path.join(__dirname, '..', 'reports');
        this.coverageDir = path.join(this.reportsDir, 'coverage');
        this.htmlDir = path.join(this.reportsDir, 'html');
        this.junitDir = path.join(this.reportsDir, 'junit');

        this.ensureDirectories();
    }

    ensureDirectories() {
        const dirs = [
        this.reportsDir,
        this.coverageDir,
        this.htmlDir,
        this.junitDir,
        path.join(this.reportsDir, 'json'),
        path.join(this.reportsDir, 'allure'),
        ];

        dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Создана директория: ${dir}`);
        }
        });
    }

    generateSummary() {
        try {
        // Читаем JUnit отчет
        const junitPath = path.join(this.junitDir, 'junit.xml');
        const testResults: TestResults = { total: 0, passed: 0, failed: 0, skipped: 0 };
        
        if (fs.existsSync(junitPath)) {
            const junitContent = fs.readFileSync(junitPath, 'utf8');
            const totalMatch = junitContent.match(/tests="(\d+)"/);
            const failedMatch = junitContent.match(/failures="(\d+)"/);
            const skippedMatch = junitContent.match(/skipped="(\d+)"/);
            
            if (totalMatch) testResults.total = parseInt(totalMatch[1]);
            if (failedMatch) testResults.failed = parseInt(failedMatch[1]);
            if (skippedMatch) testResults.skipped = parseInt(skippedMatch[1]);
            testResults.passed = testResults.total - testResults.failed - testResults.skipped;
        }

        // Читаем coverage отчет
        const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');
        let coverageResults: CoverageResults = { statements: 0, branches: 0, functions: 0, lines: 0 };
        
        if (fs.existsSync(coverageSummaryPath)) {
            const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
            coverageResults = {
            statements: coverageData.total.statements.pct,
            branches: coverageData.total.branches.pct,
            functions: coverageData.total.functions.pct,
            lines: coverageData.total.lines.pct,
            };
        }

        // Генерируем HTML сводку
        const summaryHtml = this.generateSummaryHtml(testResults, coverageResults);
        const summaryPath = path.join(this.htmlDir, 'summary.html');
        fs.writeFileSync(summaryPath, summaryHtml);
        
        // Генерируем JSON сводку
        const summaryJson = {
            timestamp: new Date().toISOString(),
            testResults,
            coverageResults,
        };
        
        const jsonPath = path.join(this.reportsDir, 'json', 'summary.json');
        fs.writeFileSync(jsonPath, JSON.stringify(summaryJson, null, 2));
        
        console.log('Сводный отчет сгенерирован успешно!');
        console.log('Результаты тестов:', testResults);
        console.log('Покрытие кода:', coverageResults);
        
        return summaryJson;
        } catch (error) {
        console.error('Ошибка при генерации отчета:', (error as Error).message);
        return null;
        }
    }

    generateSummaryHtml(testResults: TestResults, coverageResults: CoverageResults) {
        const passedPercentage = testResults.total > 0 
        ? ((testResults.passed / testResults.total) * 100).toFixed(2)
        : 0;

        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Habr E2E Tests - Сводный отчет</title>
        <style>
            ${fs.readFileSync(path.join(__dirname, '..', 'reports', 'html', 'custom-styles.css'), 'utf8')}
            
            .dashboard {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            
            .card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .card-header {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #333;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            
            .metric-value {
                font-weight: bold;
            }
            
            .progress-bar {
                height: 20px;
                background: #e9ecef;
                border-radius: 10px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #28a745, #20c997);
                transition: width 0.3s ease;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .status-passed { background: #d4edda; color: #155724; }
            .status-failed { background: #f8d7da; color: #721c24; }
            .status-skipped { background: #fff3cd; color: #856404; }
            
            .charts {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 30px;
            }
            
            .chart-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Habr.com E2E Tests - Сводный отчет</h1>
                <p>Дата генерации: ${new Date().toLocaleString('ru-RU')}</p>
            </div>
            
            <div class="dashboard">
                <div class="card">
                    <div class="card-header">📈 Статистика тестов</div>
                    <div class="metric">
                        <span>Всего тестов:</span>
                        <span class="metric-value">${testResults.total}</span>
                    </div>
                    <div class="metric">
                        <span class="status-passed status-badge">✓ Прошло:</span>
                        <span class="metric-value">${testResults.passed}</span>
                    </div>
                    <div class="metric">
                        <span class="status-failed status-badge">✗ Упало:</span>
                        <span class="metric-value">${testResults.failed}</span>
                    </div>
                    <div class="metric">
                        <span class="status-skipped status-badge">⏭ Пропущено:</span>
                        <span class="metric-value">${testResults.skipped}</span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${passedPercentage}%"></div>
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <strong>Успешность: ${passedPercentage}%</strong>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">📊 Покрытие кода</div>
                    <div class="metric">
                        <span>Операторы:</span>
                        <span class="metric-value">${coverageResults.statements}%</span>
                    </div>
                    <div class="metric">
                        <span>Ветви:</span>
                        <span class="metric-value">${coverageResults.branches}%</span>
                    </div>
                    <div class="metric">
                        <span>Функции:</span>
                        <span class="metric-value">${coverageResults.functions}%</span>
                    </div>
                    <div class="metric">
                        <span>Строки:</span>
                        <span class="metric-value">${coverageResults.lines}%</span>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">🔗 Быстрые ссылки</div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <a href="test-report.html" class="screenshot-link" style="display: block; text-align: center;">
                            📄 Полный отчет по тестам
                        </a>
                        <a href="../coverage/index.html" class="screenshot-link" style="display: block; text-align: center;">
                            📊 Отчет о покрытии кода
                        </a>
                        <a href="../junit/junit.xml" class="screenshot-link" style="display: block; text-align: center;">
                            📦 JUnit отчет (XML)
                        </a>
                        ${fs.existsSync(path.join(this.reportsDir, 'screenshots')) ? 
                        `<a href="../screenshots/" class="screenshot-link" style="display: block; text-align: center;">
                            📸 Скриншоты тестов
                        </a>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="charts">
                <div class="chart-container">
                    <h3>Распределение результатов тестов</h3>
                    <canvas id="testChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Покрытие кода по категориям</h3>
                    <canvas id="coverageChart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <div class="footer">
                <p>Отчет сгенерирован автоматически системой E2E тестирования Habr.com</p>
                <p>Версия: 1.0.0 | © ${new Date().getFullYear()}</p>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
            // График результатов тестов
            const testCtx = document.getElementById('testChart').getContext('2d');
            new Chart(testCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Прошло', 'Упало', 'Пропущено'],
                    datasets: [{
                        data: [${testResults.passed}, ${testResults.failed}, ${testResults.skipped}],
                        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
            // График покрытия кода
            const coverageCtx = document.getElementById('coverageChart').getContext('2d');
            new Chart(coverageCtx, {
                type: 'bar',
                data: {
                    labels: ['Операторы', 'Ветви', 'Функции', 'Строки'],
                    datasets: [{
                        label: 'Покрытие (%)',
                        data: [${coverageResults.statements}, ${coverageResults.branches}, ${coverageResults.functions}, ${coverageResults.lines}],
                        backgroundColor: ['#007bff', '#17a2b8', '#28a745', '#6f42c1'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        </script>
    </body>
    </html>`;
    }

    // Метод для копирования скриншотов в отчеты
    copyScreenshots() {
        const screenshotsDir = path.join(__dirname, '..', 'screenshots');
        const reportsScreenshotsDir = path.join(this.reportsDir, 'screenshots');
        
        if (fs.existsSync(screenshotsDir)) {
        if (!fs.existsSync(reportsScreenshotsDir)) {
            fs.mkdirSync(reportsScreenshotsDir, { recursive: true });
        }
        
        // Копируем последние скриншоты
        const files = fs.readdirSync(screenshotsDir);
        files.forEach((file: string) => {
            if (file.endsWith('.png')) {
            const source = path.join(screenshotsDir, file);
            const dest = path.join(reportsScreenshotsDir, file);
            fs.copyFileSync(source, dest);
            }
        });
        
        console.log(`Скопировано ${files.length} скриншотов в отчеты`);
        }
    }
}

// Запуск генерации отчетов
const generator = new ReportGenerator();
generator.generateSummary();
generator.copyScreenshots();