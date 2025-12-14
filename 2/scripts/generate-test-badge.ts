#!/usr/bin/env node

/**
 * Скрипт для генерации badge с результатами тестов
 */

import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

class TestBadgeGenerator {
    junitPath: string;
    badgePath: string;
    constructor() {
        this.junitPath = path.join(__dirname, '..', 'reports', 'junit', 'junit.xml');
        this.badgePath = path.join(__dirname, '..', 'test-badge.svg');
    }

    async generate() {
        console.log('🛡️ Генерация badge с результатами тестов...\n');

        try {
            // Читаем JUnit отчет
            const xmlContent = fs.readFileSync(this.junitPath, 'utf8');
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xmlContent);

            // Извлекаем статистику
            const stats = this.extractStats(result);
            
            // Генерируем badge
            const badge = this.createBadge(stats);
            
            // Сохраняем badge
            fs.writeFileSync(this.badgePath, badge);
            
            console.log('📊 Статистика тестов:');
            console.log(`   Всего тестов: ${stats.total}`);
            console.log(`   Успешных: ${stats.passed}`);
            console.log(`   Упавших: ${stats.failed}`);
            console.log(`   Пропущенных: ${stats.skipped}`);
            console.log(`   Успешность: ${stats.successRate}%\n`);
            
            console.log(`✅ Badge сгенерирован: ${this.badgePath}`);
            
            // Генерируем также markdown для README
            this.generateMarkdown(stats);
            
            return stats;
        } catch (error) {
            console.error('❌ Ошибка генерации badge:', (error as Error).message);
            
            // Создаем badge по умолчанию при ошибке
            const defaultBadge = this.createDefaultBadge();
            fs.writeFileSync(this.badgePath, defaultBadge);
            console.log(`⚠️  Создан badge по умолчанию: ${this.badgePath}`);
            
            return null;
        }
    }

    extractStats(xmlResult: { testsuites: { testsuite: Array<{ $: { tests?: string; failures?: string; skipped?: string; }; }>; }; }) {
        let total = 0;
        let passed = 0;
        let failed = 0;
        let skipped = 0;

        if (xmlResult.testsuites && xmlResult.testsuites.testsuite) {
            const suites = Array.isArray(xmlResult.testsuites.testsuite)
                ? xmlResult.testsuites.testsuite
                : [xmlResult.testsuites.testsuite];

            suites.forEach(suite => {
                    total += parseInt(suite.$.tests ?? '0');
                    failed += parseInt(suite.$.failures ?? '0');
                    skipped += parseInt(suite.$.skipped ?? '0');
                }
            );
        }

        passed = total - failed - skipped;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

        return {
            total,
            passed,
            failed,
            skipped,
            successRate,
            timestamp: new Date().toISOString()
        };
    }

    createBadge(stats: { total?: number; passed?: number; failed?: number; skipped?: number; successRate: number; timestamp?: string; }) {
        const { successRate } = stats;
        
        // Выбираем цвет в зависимости от успешности
        let color = 'red';
        if (successRate >= 90) color = 'brightgreen';
        else if (successRate >= 80) color = 'green';
        else if (successRate >= 70) color = 'yellowgreen';
        else if (successRate >= 60) color = 'yellow';
        else if (successRate >= 50) color = 'orange';
        
        return `<?xml version="1.0" encoding="UTF-8"?>
                <svg xmlns="http://www.w3.org/2000/svg" width="145" height="20">
                <linearGradient id="b" x2="0" y2="100%">
                    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
                    <stop offset="1" stop-opacity=".1"/>
                </linearGradient>
                <mask id="a">
                    <rect width="145" height="20" rx="3" fill="#fff"/>
                </mask>
                <g mask="url(#a)">
                    <path fill="#555" d="M0 0h75v20H0z"/>
                    <path fill="${color}" d="M75 0h70v20H75z"/>
                    <path fill="url(#b)" d="M0 0h145v20H0z"/>
                </g>
                <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
                    <text x="37.5" y="15" fill="#010101" fill-opacity=".3">tests</text>
                    <text x="37.5" y="14">tests</text>
                    <text x="110" y="15" fill="#010101" fill-opacity=".3">${successRate}%</text>
                    <text x="110" y="14">${successRate}%</text>
                </g>
                </svg>`;
    }

    createDefaultBadge() {
        return `<?xml version="1.0" encoding="UTF-8"?>
                <svg xmlns="http://www.w3.org/2000/svg" width="145" height="20">
                <linearGradient id="b" x2="0" y2="100%">
                    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
                    <stop offset="1" stop-opacity=".1"/>
                </linearGradient>
                <mask id="a">
                    <rect width="145" height="20" rx="3" fill="#fff"/>
                </mask>
                <g mask="url(#a)">
                    <path fill="#555" d="M0 0h75v20H0z"/>
                    <path fill="#9f9f9f" d="M75 0h70v20H75z"/>
                    <path fill="url(#b)" d="M0 0h145v20H0z"/>
                </g>
                <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
                    <text x="37.5" y="15" fill="#010101" fill-opacity=".3">tests</text>
                    <text x="37.5" y="14">tests</text>
                    <text x="110" y="15" fill="#010101" fill-opacity=".3">unknown</text>
                    <text x="110" y="14">unknown</text>
                </g>
                </svg>`;
    }

    generateMarkdown(stats: { total: number; passed: number; failed: number; skipped: number; successRate: number; timestamp: string; }) {
        const markdown = `  # 📊 Test Results
                            ## Последний запуск
                            - **Дата:** ${new Date(stats.timestamp).toLocaleString('ru-RU')}
                            - **Всего тестов:** ${stats.total}
                            - **Успешных:** ${stats.passed}
                            - **Упавших:** ${stats.failed}
                            - **Пропущенных:** ${stats.skipped}
                            - **Успешность:** ${stats.successRate}%

                            ## Badges

                            ![Tests](test-badge.svg)
                            ![Coverage](coverage-badge.svg)

                            ## История
                            Полную историю тестов можно посмотреть в [отчетах](./reports/).

                            ## Настройка
                            Для запуска тестов выполните:
                            \`\`\`bash
                            npm test
                            \`\`\`

                            Для запуска с покрытием кода:
                            \`\`\`bash
                            npm run coverage
                            \`\`\`
        `;

        const readmePath = path.join(__dirname, '..', 'TEST-STATUS.md');
        fs.writeFileSync(readmePath, markdown);
        console.log(`📄 Markdown отчет сгенерирован: ${readmePath}`);
    }
}

// CLI интерфейс
if (require.main === module) {
    const generator = new TestBadgeGenerator();
    generator.generate();
}

module.exports = TestBadgeGenerator;