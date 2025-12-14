/**
 * Утилиты для трансформации и обработки JUnit отчетов
 * Для работы требует установки: npm install xml2js
 */

import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

class JUnitTransformer {
  xmlPath: string;
  parser!: xml2js.Parser;
  builder!: xml2js.Builder;
  constructor(xmlPath: string) {
    this.xmlPath = xmlPath;
    if (xml2js) {
      this.parser = new xml2js.Parser();
      this.builder = new xml2js.Builder();
    }
  }

  /**
   * Парсит JUnit XML файл
   */
  async parse() {
    try {
      const xmlContent = fs.readFileSync(this.xmlPath, 'utf8');
      
      if (!xml2js) {
        // Простой парсинг без xml2js
        return this.simpleParse(xmlContent);
      }
      
      const result = await this.parser.parseStringPromise(xmlContent);
      return result;
    } catch (error) {
      console.error('Ошибка парсинга XML:', (error as Error).message);
      return this.createEmptyReport();
    }
  }

  /**
   * Простой парсинг XML без зависимостей
   */
  simpleParse(xmlContent: string) {
      const report = {
          testsuites: {
              $: {
                  name: 'Test Report',
                  tests: '0',
                  failures: '0',
                  errors: '0',
                  skipped: '0',
                  time: '0'
              },
              testsuite: []
          }
      };

      // Используем более надежный парсинг
      try {
          // Ищем testsuite тег
          const suiteMatch = xmlContent.match(/<testsuite[^>]*>/);
          if (suiteMatch) {
              const suiteAttrs = suiteMatch[0];
              
              // Извлекаем атрибуты
              const getAttr = (attr: string, defaultValue = '0') => {
                  const regex = new RegExp(`${attr}="([^"]*)"`);
                  const match = suiteAttrs.match(regex);
                  return match ? match[1] : defaultValue;
              };

              report.testsuites.$.tests = getAttr('tests');
              report.testsuites.$.failures = getAttr('failures');
              report.testsuites.$.errors = getAttr('errors');
              report.testsuites.$.skipped = getAttr('skipped');
              report.testsuites.$.time = getAttr('time');
              report.testsuites.$.name = getAttr('name', 'Test Suite');
          }
      } catch (error) {
          console.debug('Simple parse error:', (error as Error).message);
      }

      return report;
  }

  /**
   * Создает пустой отчет
   */
  createEmptyReport() {
    return {
      testsuites: {
        $: {
          name: 'Test Report',
          tests: '0',
          failures: '0',
          errors: '0',
          skipped: '0',
          time: '0',
          timestamp: new Date().toISOString()
        },
        testsuite: []
      }
    };
  }

  /**
   * Получает статистику из отчета
   */
  async getStatistics() {
      const data = await this.parse();
      
      if (!data || !data.testsuites) {
        return this.getDefaultStatistics();
      }

      let totalTests = 0;
      let totalFailures = 0;
      let totalErrors = 0;
      let totalSkipped = 0;
      let totalTime = 0;
      const testSuites: Array<{
        name: string;
        tests: number;
        failures: number;
        errors: number;
        skipped: number;
        time: number;
        timestamp: string;
        successRate: number;
    }> = [];

      // Обрабатываем корневой уровень testsuites
      if (data.testsuites.$) {
        totalTests = parseInt(data.testsuites.$.tests || '0');
        totalFailures = parseInt(data.testsuites.$.failures || '0');
        totalErrors = parseInt(data.testsuites.$.errors || '0');
        totalSkipped = parseInt(data.testsuites.$.skipped || '0');
        totalTime = parseFloat(data.testsuites.$.time || '0');
      }

      // Обрабатываем вложенные testsuite
      if (data.testsuites.testsuite) {
        const suites = Array.isArray(data.testsuites.testsuite)
          ? data.testsuites.testsuite
          : [data.testsuites.testsuite];

        suites.forEach((suite: {
            $: {
                tests?: string;
                failures?: string;
                errors?: string;
                skipped?: string;
                time?: string;
                name?: string;
                timestamp?: string;
            };
        }) => {
          const suiteTests = parseInt(suite.$.tests || '0');
          const suiteFailures = parseInt(suite.$.failures || '0');
          const suiteErrors = parseInt(suite.$.errors || '0');
          const suiteSkipped = parseInt(suite.$.skipped || '0');
          const suiteTime = parseFloat(suite.$.time || '0');

          testSuites.push({
            name: suite.$.name || 'Unnamed Suite',
            tests: suiteTests,
            failures: suiteFailures,
            errors: suiteErrors,
            skipped: suiteSkipped,
            time: suiteTime,
            timestamp: data?.testsuites?.$?.timestamp || new Date().toISOString(),
            successRate: suiteTests > 0
              ? ((suiteTests - suiteFailures - suiteErrors) / suiteTests * 100)
              : 0
          });

          // Суммируем для общей статистики
          totalTests += suiteTests;
          totalFailures += suiteFailures;
          totalErrors += suiteErrors;
          totalSkipped += suiteSkipped;
          totalTime += suiteTime;
        });
      }

      const successRate = totalTests > 0
        ? ((totalTests - totalFailures - totalErrors) / totalTests * 100)
        : 0;

      // Добавьте эту проверку
      const timestamp = data?.testsuites?.$?.timestamp || new Date().toISOString();

      return {
        totalTests,
        totalFailures,
        totalErrors,
        totalSkipped,
        totalTime,
        successRate,
        testSuites,
        timestamp: timestamp
      };
    }

  /**
   * Статистика по умолчанию
   */
  getDefaultStatistics() {
    return {
      totalTests: 0,
      totalFailures: 0,
      totalErrors: 0,
      totalSkipped: 0,
      totalTime: 0,
      successRate: 0,
      testSuites: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Получает список упавших тестов
   */
  async getFailedTests() {
    const data = await this.parse();
    const failedTests: { suite: string; name: string; classname: string; time: string; failure: string; type: string; }[] = [];

    if (!data || !data.testsuites || !data.testsuites.testsuite) {
      return failedTests;
    }

    const testSuites = Array.isArray(data.testsuites.testsuite)
      ? data.testsuites.testsuite
      : [data.testsuites.testsuite];

    testSuites.forEach((suite: { testcase: string; $: { name: string; }; }) => {
      if (suite.testcase) {
        const testCases = Array.isArray(suite.testcase)
          ? suite.testcase
          : [suite.testcase];

        testCases.forEach((testCase: { 
            failure?: Array<{$?: {message?: string; type?: string;}; _?: string}>;
            error?: Array<{$?: {message?: string; type?: string;}; _?: string}>;
            $: { 
                name: string; 
                classname: string; 
                time: string; 
            }; 
        }) => {
            if (testCase.failure || testCase.error) {
                let failureMessage = 'Unknown failure/error';
                
                if (testCase.failure && testCase.failure.length > 0) {
                    failureMessage = testCase.failure[0]?.$?.message 
                        || testCase.failure[0]?._ 
                        || 'Unknown failure';
                } else if (testCase.error && testCase.error.length > 0) {
                    failureMessage = testCase.error[0]?.$?.message 
                        || testCase.error[0]?._ 
                        || 'Unknown error';
                }

                failedTests.push({
                    suite: suite.$.name || 'Unnamed Suite',
                    name: testCase.$.name || 'Unnamed Test',
                    classname: testCase.$.classname || '',
                    time: testCase.$.time || '0',
                    failure: failureMessage,
                    type: testCase.failure ? 'failure' : 'error'
                });
            }
        });
      }
    });

    return failedTests;
  }

  /**
   * Конвертирует в JSON и сохраняет
   */
  async toJson(outputPath: fs.PathOrFileDescriptor) {
    const data = await this.parse();
    
    if (!data) {
      console.error('Не удалось распарсить XML');
      return null;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    
    if (outputPath) {
      try {
        fs.writeFileSync(outputPath, jsonContent, 'utf8');
        console.log(`✓ JSON сохранен в: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Ошибка сохранения JSON: ${(error as Error).message}`);
      }
    }

    return jsonContent;
  }

  /**
   * Конвертирует в CSV
   */
  async toCsv(outputPath: fs.PathOrFileDescriptor) {
    const stats = await this.getStatistics();
    const failedTests = await this.getFailedTests();
    
    let csvContent = 'Test Suite,Test Name,Status,Time (s),Message\n';
    
    // Добавляем успешные тесты
    if (stats.testSuites) {
      stats.testSuites.forEach(suite => {
        csvContent += `"${suite.name}",Total Tests,SUITE,${suite.time},"Tests: ${suite.tests}, Failures: ${suite.failures}"\n`;
      });
    }
    
    // Добавляем упавшие тесты
    failedTests.forEach(test => {
      const cleanMessage = test.failure
        .replace(/"/g, '""')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .substring(0, 200); // Ограничиваем длину
      
      csvContent += `"${test.suite}","${test.name}",FAILED,${test.time},"${cleanMessage}"\n`;
    });
    
    if (outputPath) {
      try {
        fs.writeFileSync(outputPath, csvContent, 'utf8');
        console.log(`✓ CSV сохранен в: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Ошибка сохранения CSV: ${(error as Error).message}`);
      }
    }
    
    return csvContent;
  }

  /**
   * Генерирует Markdown отчет
   */
  async toMarkdown(outputPath: fs.PathOrFileDescriptor) {
    const stats = await this.getStatistics();
    const failedTests = await this.getFailedTests();
    
    let mdContent = `# 📊 Отчет о тестировании\n\n`;
    mdContent += `**Дата:** ${new Date(stats.timestamp).toLocaleString('ru-RU')}\n\n`;
    
    mdContent += `## 📈 Сводная статистика\n\n`;
    mdContent += `| Метрика | Значение |\n`;
    mdContent += `|---------|----------|\n`;
    mdContent += `| Всего тестов | ${stats.totalTests} |\n`;
    mdContent += `| Успешных | ${stats.totalTests - stats.totalFailures - stats.totalErrors} |\n`;
    mdContent += `| Упавших | ${stats.totalFailures} |\n`;
    mdContent += `| Ошибок | ${stats.totalErrors} |\n`;
    mdContent += `| Пропущено | ${stats.totalSkipped} |\n`;
    mdContent += `| Успешность | ${stats.successRate}% |\n`;
    mdContent += `| Время выполнения | ${stats.totalTime.toFixed(2)}с |\n\n`;
    
    if (stats.testSuites.length > 0) {
      mdContent += `## 📁 Тест-сьюты\n\n`;
      mdContent += `| Сьют | Тестов | Упало | Успешность | Время |\n`;
      mdContent += `|------|--------|-------|------------|-------|\n`;
      
      stats.testSuites.forEach(suite => {
        mdContent += `| ${suite.name} | ${suite.tests} | ${suite.failures + suite.errors} | ${suite.successRate}% | ${suite.time.toFixed(2)}с |\n`;
      });
      mdContent += `\n`;
    }
    
    if (failedTests.length > 0) {
      mdContent += `## ❌ Упавшие тесты\n\n`;
      mdContent += `| Сьют | Тест | Время | Ошибка |\n`;
      mdContent += `|------|------|-------|--------|\n`;
      
      failedTests.forEach(test => {
        const shortError = test.failure.length > 100 
          ? test.failure.substring(0, 100) + '...' 
          : test.failure;
        mdContent += `| ${test.suite} | ${test.name} | ${test.time}с | ${shortError} |\n`;
      });
    } else {
      mdContent += `## ✅ Все тесты прошли успешно!\n\n`;
    }
    
    if (outputPath) {
      try {
        fs.writeFileSync(outputPath, mdContent, 'utf8');
        console.log(`✓ Markdown сохранен в: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Ошибка сохранения Markdown: ${(error as Error).message}`);
      }
    }
    
    return mdContent;
  }

  /**
   * Создает HTML отчет
   */
  async toHtml(outputPath: fs.PathOrFileDescriptor) {
    const stats = await this.getStatistics();
    const failedTests = await this.getFailedTests();
    
    const htmlContent = `<!DOCTYPE html>
                        <html lang="ru">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Отчет о тестировании</title>
                            <style>
                                body {
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                    max-width: 1200px;
                                    margin: 0 auto;
                                    padding: 20px;
                                }
                                
                                .header {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 30px;
                                    border-radius: 10px;
                                    margin-bottom: 30px;
                                    text-align: center;
                                }
                                
                                .stats-grid {
                                    display: grid;
                                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                    gap: 20px;
                                    margin-bottom: 30px;
                                }
                                
                                .stat-card {
                                    background: white;
                                    border-radius: 8px;
                                    padding: 20px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    text-align: center;
                                }
                                
                                .stat-value {
                                    font-size: 2.5em;
                                    font-weight: bold;
                                    margin: 10px 0;
                                }
                                
                                .stat-success { color: #28a745; }
                                .stat-failure { color: #dc3545; }
                                .stat-warning { color: #ffc107; }
                                .stat-info { color: #17a2b8; }
                                
                                .suites-table, .failed-tests-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 20px 0;
                                    background: white;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    border-radius: 8px;
                                    overflow: hidden;
                                }
                                
                                th {
                                    background: #f8f9fa;
                                    padding: 15px;
                                    text-align: left;
                                    font-weight: 600;
                                    border-bottom: 2px solid #dee2e6;
                                }
                                
                                td {
                                    padding: 12px 15px;
                                    border-bottom: 1px solid #dee2e6;
                                }
                                
                                tr:hover {
                                    background: #f8f9fa;
                                }
                                
                                .success-rate {
                                    display: inline-block;
                                    padding: 3px 8px;
                                    border-radius: 4px;
                                    font-weight: bold;
                                }
                                
                                .rate-high { background: #d4edda; color: #155724; }
                                .rate-medium { background: #fff3cd; color: #856404; }
                                .rate-low { background: #f8d7da; color: #721c24; }
                                
                                .failure-details {
                                    background: #f8d7da;
                                    border: 1px solid #f5c6cb;
                                    border-radius: 4px;
                                    padding: 10px;
                                    margin-top: 5px;
                                    font-family: 'Courier New', monospace;
                                    font-size: 12px;
                                    white-space: pre-wrap;
                                    max-height: 200px;
                                    overflow-y: auto;
                                }
                                
                                .footer {
                                    text-align: center;
                                    margin-top: 40px;
                                    color: #6c757d;
                                    font-size: 0.9em;
                                    border-top: 1px solid #dee2e6;
                                    padding-top: 20px;
                                }
                                
                                @media (max-width: 768px) {
                                    .stats-grid {
                                        grid-template-columns: 1fr;
                                    }
                                    
                                    .suites-table, .failed-tests-table {
                                        display: block;
                                        overflow-x: auto;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>📊 Отчет о тестировании Habr.com</h1>
                                <p>Дата: ${new Date(stats.timestamp).toLocaleString('ru-RU')}</p>
                            </div>
                            
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div>Всего тестов</div>
                                    <div class="stat-value stat-info">${stats.totalTests}</div>
                                </div>
                                
                                <div class="stat-card">
                                    <div>Успешных</div>
                                    <div class="stat-value stat-success">${stats.totalTests - stats.totalFailures - stats.totalErrors}</div>
                                </div>
                                
                                <div class="stat-card">
                                    <div>Упавших</div>
                                    <div class="stat-value stat-failure">${stats.totalFailures + stats.totalErrors}</div>
                                </div>
                                
                                <div class="stat-card">
                                    <div>Успешность</div>
                                    <div class="stat-value">${stats.successRate}%</div>
                                </div>
                            </div>
                            
                            ${stats.testSuites.length > 0 ? `
                            <h2>📁 Тест-сьюты</h2>
                            <table class="suites-table">
                                <thead>
                                    <tr>
                                        <th>Название сьюта</th>
                                        <th>Тестов</th>
                                        <th>Упало</th>
                                        <th>Успешность</th>
                                        <th>Время</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.testSuites.map(suite => `
                                    <tr>
                                        <td>${suite.name}</td>
                                        <td>${suite.tests}</td>
                                        <td>${suite.failures + suite.errors}</td>
                                        <td>
                                            <span class="success-rate ${
                                              suite.successRate >= 90 ? 'rate-high' :
                                              suite.successRate >= 70 ? 'rate-medium' : 'rate-low'
                                            }">
                                                ${suite.successRate}%
                                            </span>
                                        </td>
                                        <td>${suite.time.toFixed(2)}с</td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            ` : ''}
                            
                            ${failedTests.length > 0 ? `
                            <h2>❌ Упавшие тесты (${failedTests.length})</h2>
                            <table class="failed-tests-table">
                                <thead>
                                    <tr>
                                        <th>Сьют</th>
                                        <th>Тест</th>
                                        <th>Время</th>
                                        <th>Ошибка</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${failedTests.map(test => `
                                    <tr>
                                        <td>${test.suite}</td>
                                        <td>${test.name}</td>
                                        <td>${test.time}с</td>
                                        <td>
                                            <details>
                                                <summary>${test.failure.substring(0, 50)}...</summary>
                                                <div class="failure-details">${test.failure}</div>
                                            </details>
                                        </td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            ` : `
                            <div style="text-align: center; padding: 40px; background: #d4edda; border-radius: 8px;">
                                <h2 style="color: #155724;">✅ Все тесты прошли успешно!</h2>
                                <p style="color: #155724;">Отличная работа! Все ${stats.totalTests} тестов выполнены без ошибок.</p>
                            </div>
                            `}
                            
                            <div class="footer">
                                <p>Отчет сгенерирован автоматически системой тестирования Habr.com</p>
                                <p>Время генерации: ${new Date().toLocaleString('ru-RU')}</p>
                            </div>
                        </body>
                        </html>`;
    
    if (outputPath) {
      try {
        fs.writeFileSync(outputPath, htmlContent, 'utf8');
        console.log(`✓ HTML отчет сохранен в: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Ошибка сохранения HTML: ${(error as Error).message}`);
      }
    }
    
    return htmlContent;
  }

  /**
   * Валидирует XML файл
   */
  validate() {
    try {
      const content = fs.readFileSync(this.xmlPath, 'utf8');
      
      // Простые проверки
      const hasXmlDeclaration = content.includes('<?xml');
      const hasTestsuites = content.includes('<testsuites');
      const isWellFormed = content.split('<').length === content.split('>').length;
      
      const errors = [];
      if (!hasXmlDeclaration) errors.push('Отсутствует XML декларация');
      if (!hasTestsuites) errors.push('Не найден тег testsuites');
      if (!isWellFormed) errors.push('XML не корректен (несбалансированные теги)');
      
      return {
        isValid: errors.length === 0,
        errors,
        fileSize: fs.statSync(this.xmlPath).size,
        lineCount: content.split('\n').length
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [(error as Error).message],
        fileSize: 0,
        lineCount: 0
      };
    }
  }

  /**
   * Получает возраст отчета
   */
  getAge() {
    try {
      const stats = fs.statSync(this.xmlPath);
      const ageMs = Date.now() - stats.mtimeMs;
      
      return {
        milliseconds: ageMs,
        seconds: Math.floor(ageMs / 1000),
        minutes: Math.floor(ageMs / (1000 * 60)),
        hours: Math.floor(ageMs / (1000 * 60 * 60)),
        days: Math.floor(ageMs / (1000 * 60 * 60 * 24)),
        lastModified: stats.mtime
      };
    } catch (error) {
      return {
        milliseconds: 0,
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0,
        lastModified: null,
        error: (error as Error).message
      };
    }
  }

  /**
   * Сравнивает два отчета
   */
  static async compare(report1Path: string, report2Path: string) {
    const transformer1 = new JUnitTransformer(report1Path);
    const transformer2 = new JUnitTransformer(report2Path);
    
    const stats1 = await transformer1.getStatistics();
    const stats2 = await transformer2.getStatistics();
    
    const comparison = {
      report1: {
        path: report1Path,
        ...stats1
      },
      report2: {
        path: report2Path,
        ...stats2
      },
      differences: {
        totalTests: stats2.totalTests - stats1.totalTests,
        totalFailures: stats2.totalFailures - stats1.totalFailures,
        totalErrors: stats2.totalErrors - stats1.totalErrors,
        successRate: stats2.successRate - stats1.successRate,
        totalTime: stats2.totalTime - stats1.totalTime
      },
      improved: stats2.totalFailures + stats2.totalErrors < stats1.totalFailures + stats1.totalErrors
    };
    
    return comparison;
  }
}

/**
 * Утилиты для работы с каталогом отчетов
 */
class JUnitReportsManager {
  reportsDir: string;
  constructor(reportsDir: string) {
    this.reportsDir = reportsDir;
  }

  /**
   * Находит все JUnit отчеты в каталоге
   */
  findAllReports() {
    try {
      const files = fs.readdirSync(this.reportsDir);
      return files
        .filter(file => file.endsWith('.xml'))
        .map(file => ({
          name: file,
          path: path.join(this.reportsDir, file),
          fullPath: path.join(this.reportsDir, file)
        }));
    } catch (error) {
      console.error(`Ошибка чтения каталога ${this.reportsDir}:`, (error as Error).message);
      return [];
    }
  }

  /**
   * Получает статистику по всем отчетам
   */
  async getAllStatistics() {
    const reports = this.findAllReports();
    const allStats = [];
    
    for (const report of reports) {
      const transformer = new JUnitTransformer(report.path);
      const stats = await transformer.getStatistics();
      allStats.push({
        fileName: report.name,
        ...stats
      });
    }
    
    return allStats;
  }

  /**
   * Очищает старые отчеты
   */
  cleanupOldReports(maxAgeDays = 30) {
    const reports = this.findAllReports();
    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    
    let deletedCount = 0;
    const deletedFiles: string[] = [];
    
    reports.forEach(report => {
      try {
        const stats = fs.statSync(report.path);
        const ageMs = now - stats.mtimeMs;
        
        if (ageMs > maxAgeMs) {
          fs.unlinkSync(report.path);
          deletedCount++;
          deletedFiles.push(report.name);
          console.log(`🗑 Удален старый отчет: ${report.name} (${Math.floor(ageMs / (1000 * 60 * 60 * 24))} дней)`);
        }
      } catch (error) {
        console.error(`Ошибка удаления файла ${report.name}:`, (error as Error).message);
      }
    });
    
    return {
      deletedCount,
      deletedFiles,
      remainingCount: reports.length - deletedCount
    };
  }

  /**
   * Создает индексный файл со всеми отчетами
   */
  async createIndex() {
    const reports = this.findAllReports();
    const allStats = await this.getAllStatistics();
    
    const indexContent = {
      generated: new Date().toISOString(),
      totalReports: reports.length,
      reports: allStats.map(stats => ({
        file: stats.fileName,
        totalTests: stats.totalTests,
        totalFailures: stats.totalFailures,
        totalErrors: stats.totalErrors,
        successRate: stats.successRate,
        timestamp: stats.timestamp
      })),
      summary: {
        totalTests: allStats.reduce((sum, stats) => sum + stats.totalTests, 0),
        totalFailures: allStats.reduce((sum, stats) => sum + stats.totalFailures, 0),
        totalErrors: allStats.reduce((sum, stats) => sum + stats.totalErrors, 0),
        avgSuccessRate: allStats.length > 0
          ? (allStats.reduce((sum, stats) => sum + stats.successRate, 0) / allStats.length).toFixed(2)
          : '0'
      }
    };
    
    const indexPath = path.join(this.reportsDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexContent, null, 2), 'utf8');
    
    console.log(`✓ Индексный файл создан: ${indexPath}`);
    return indexContent;
  }
}

/**
 * CLI интерфейс для утилиты
 */
const runCommand = async (command: string, args: string[]) => {
  try {
    switch (command) {
      case 'stats': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const transformer = new JUnitTransformer(file);
        const stats = await transformer.getStatistics();

        console.log('\n📊 Статистика отчета:');
        console.log('====================');
        console.log(`Файл: ${file}`);
        console.log(`Всего тестов: ${stats.totalTests}`);
        console.log(`Успешных: ${stats.totalTests - stats.totalFailures - stats.totalErrors}`);
        console.log(`Упавших: ${stats.totalFailures}`);
        console.log(`Ошибок: ${stats.totalErrors}`);
        console.log(`Пропущено: ${stats.totalSkipped}`);
        console.log(`Успешность: ${stats.successRate}%`);
        console.log(`Время выполнения: ${stats.totalTime.toFixed(2)}с`);
        console.log(`Дата: ${new Date(stats.timestamp).toLocaleString('ru-RU')}`);

        if (stats.testSuites.length > 0) {
          console.log('\n📁 Тест-сьюты:');
          stats.testSuites.forEach(suite => {
            console.log(`  ${suite.name}: ${suite.tests} тестов, ${suite.successRate}% успешности, ${suite.time.toFixed(2)}с`);
          });
        }
        break;
      }

      case 'failed': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const transformer = new JUnitTransformer(file);
        const failedTests = await transformer.getFailedTests();

        if (failedTests.length === 0) {
          console.log('\n✅ Нет упавших тестов!');
        } else {
          console.log(`\n❌ Упавшие тесты (${failedTests.length}):`);
          console.log('===========================');

          failedTests.forEach((test, index) => {
            console.log(`\n${index + 1}. ${test.suite} - ${test.name}`);
            console.log(`   Время: ${test.time}с`);
            console.log(`   Ошибка: ${test.failure.substring(0, 100)}...`);
          });
        }
        break;
      }

      case 'json': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const output = args[2] || file.replace('.xml', '.json');
        const transformer = new JUnitTransformer(file);
        await transformer.toJson(output);
        break;
      }

      case 'csv': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const output = args[2] || file.replace('.xml', '.csv');
        const transformer = new JUnitTransformer(file);
        await transformer.toCsv(output);
        break;
      }

      case 'md': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const output = args[2] || file.replace('.xml', '.md');
        const transformer = new JUnitTransformer(file);
        await transformer.toMarkdown(output);
        break;
      }

      case 'html': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const output = args[2] || file.replace('.xml', '.html');
        const transformer = new JUnitTransformer(file);
        await transformer.toHtml(output);
        break;
      }

      case 'validate': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const transformer = new JUnitTransformer(file);
        const validation = transformer.validate();

        console.log('\n🔍 Валидация отчета:');
        console.log('===================');
        console.log(`Файл: ${file}`);
        console.log(`Размер: ${validation.fileSize} байт`);
        console.log(`Строк: ${validation.lineCount}`);
        console.log(`Валидный: ${validation.isValid ? '✅ Да' : '❌ Нет'}`);

        if (validation.errors.length > 0) {
          console.log('\nОшибки:');
          validation.errors.forEach(error => console.log(`  - ${error}`));
        }
        break;
      }

      case 'age': {
        const file = args[1];
        if (!file) throw new Error('Укажите путь к XML файлу');

        const transformer = new JUnitTransformer(file);
        const age = transformer.getAge();

        console.log('\n📅 Возраст отчета:');
        console.log('==================');
        console.log(`Файл: ${file}`);

        if (age.error) {
          console.log(`Ошибка: ${age.error}`);
        } else {
          console.log(`Последнее изменение: ${age.lastModified ? age.lastModified.toLocaleString('ru-RU') : 'Неизвестно'}`);
          console.log(`Возраст: ${age.days} дней, ${age.hours % 24} часов, ${age.minutes % 60} минут`);

          if (age.days > 30) {
            console.log('⚠️  Отчет старше 30 дней! Рекомендуется удалить.');
          }
        }
        break;
      }

      case 'compare': {
        const file1 = args[1];
        const file2 = args[2];

        if (!file1 || !file2) {
          throw new Error('Укажите пути к двум XML файлам');
        }

        const comparison = await JUnitTransformer.compare(file1, file2);

        console.log('\n📊 Сравнение отчетов:');
        console.log('====================');
        console.log(`Файл 1: ${file1}`);
        console.log(`Файл 2: ${file2}`);
        console.log('\nРазличия:');
        console.log(`  Тестов: ${comparison.differences.totalTests > 0 ? '+' : ''}${comparison.differences.totalTests}`);
        console.log(`  Упавших: ${comparison.differences.totalFailures > 0 ? '+' : ''}${comparison.differences.totalFailures}`);
        console.log(`  Успешность: ${comparison.differences.successRate > 0 ? '+' : ''}${comparison.differences.successRate.toFixed(2)}%`);
        console.log(`  Время: ${comparison.differences.totalTime > 0 ? '+' : ''}${comparison.differences.totalTime.toFixed(2)}с`);
        console.log(`\nКачество ${comparison.improved ? '✅ улучшилось' : '❌ ухудшилось'}`);
        break;
      }

      case 'list': {
        const dir = args[1] || '.';
        const manager = new JUnitReportsManager(dir);
        const reports = manager.findAllReports();

        console.log(`\n📁 Отчеты в каталоге ${dir}:`);
        console.log('==========================');

        if (reports.length === 0) {
          console.log('Отчетов не найдено');
        } else {
          reports.forEach((report, index) => {
            const stats = fs.statSync(report.path);
            const ageDays = Math.floor((Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24));
            console.log(`${index + 1}. ${report.name} (${ageDays} дней назад)`);
          });
        }
        break;
      }

      case 'cleanup': {
        const dir = args[1] || '.';
        const maxAge = parseInt(args[2]) || 30;

        const manager = new JUnitReportsManager(dir);
        const result = manager.cleanupOldReports(maxAge);

        console.log(`\n🗑 Очистка отчетов старше ${maxAge} дней:`);
        console.log('===================================');
        console.log(`Каталог: ${dir}`);
        console.log(`Удалено: ${result.deletedCount} файлов`);
        console.log(`Осталось: ${result.remainingCount} файлов`);

        if (result.deletedFiles.length > 0) {
          console.log('\nУдаленные файлы:');
          result.deletedFiles.forEach(file => console.log(`  - ${file}`));
        }
        break;
      }

      default:
        console.error(`❌ Неизвестная команда: ${command}`);
        console.log('Используйте node transform.js для справки');
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Ошибка: ${(error as Error).message}`);
    process.exit(1);
  }
};

const args = process.argv.slice(2);
const command = args[0];

  if (command) {
      runCommand(command, args);
  } else {
    console.log(`
                Использование: node transform.js <команда> [аргументы]

                Команды:
                  stats <file.xml>           - Показать статистику отчета
                  failed <file.xml>          - Показать упавшие тесты
                  json <file.xml> [output]   - Конвертировать в JSON
                  csv <file.xml> [output]    - Конвертировать в CSV
                  md <file.xml> [output]     - Конвертировать в Markdown
                  html <file.xml> [output]   - Конвертировать в HTML
                  validate <file.xml>        - Валидировать XML файл
                  age <file.xml>             - Показать возраст отчета
                  compare <file1> <file2>    - Сравнить два отчета
                  list <directory>           - Список отчетов в каталоге
                  cleanup <directory> [days] - Удалить старые отчеты (по умолчанию 30 дней)

                Примеры:
                  node transform.js stats reports/junit/junit.xml
                  node transform.js html reports/junit/junit.xml report.html
                  node transform.js cleanup reports/junit 7
                `);
    process.exit(0);
}

// Экспорт классов для ES модулей
export { JUnitTransformer, JUnitReportsManager };

// Для совместимости с CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JUnitTransformer, JUnitReportsManager };
}