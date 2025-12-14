#!/usr/bin/env node

/**
 * Скрипт для проверки порогов покрытия кода
 * Используется в CI/CD для обеспечения качества
 */

import fs from 'fs';
import path from 'path';

class CoverageChecker {
  coveragePath: string;
  thresholds: { lines: number; functions: number; branches: number; };
  constructor() {
    this.coveragePath = path.join(__dirname, '..', 'reports', 'coverage', 'coverage-summary.json');
    this.thresholds = {
      lines: process.env.MIN_COVERAGE_LINES ? parseInt(process.env.MIN_COVERAGE_LINES) : 80,
      functions: process.env.MIN_COVERAGE_FUNCTIONS ? parseInt(process.env.MIN_COVERAGE_FUNCTIONS) : 75,
      branches: process.env.MIN_COVERAGE_BRANCHES ? parseInt(process.env.MIN_COVERAGE_BRANCHES) : 70
    };
  }

  check() {
    console.log('🔍 Проверка покрытия кода...\n');
    console.log('Пороговые значения:');
    console.log(`  📝 Строки:    ${this.thresholds.lines}%`);
    console.log(`  🔧 Функции:   ${this.thresholds.functions}%`);
    console.log(`  🌿 Ветви:     ${this.thresholds.branches}%\n`);

    if (!fs.existsSync(this.coveragePath)) {
      console.error('❌ Файл coverage-summary.json не найден!');
      console.error('Запустите тесты с покрытием: npm run coverage');
      process.exit(1);
    }

    const coverageData = JSON.parse(fs.readFileSync(this.coveragePath, 'utf8'));
    const total = coverageData.total;

    console.log('📊 Текущее покрытие:');
    console.log(`  📝 Строки:    ${total.lines.pct}%`);
    console.log(`  🔧 Функции:   ${total.functions.pct}%`);
    console.log(`  🌿 Ветви:     ${total.branches.pct}%\n`);

    let passed = true;
    const results = [];

    // Проверка строк
    if (total.lines.pct < this.thresholds.lines) {
      results.push({
        metric: 'Строки',
        expected: `${this.thresholds.lines}%`,
        actual: `${total.lines.pct}%`,
        passed: false
      });
      passed = false;
    } else {
      results.push({
        metric: 'Строки',
        expected: `${this.thresholds.lines}%`,
        actual: `${total.lines.pct}%`,
        passed: true
      });
    }

    // Проверка функций
    if (total.functions.pct < this.thresholds.functions) {
      results.push({
        metric: 'Функции',
        expected: `${this.thresholds.functions}%`,
        actual: `${total.functions.pct}%`,
        passed: false
      });
      passed = false;
    } else {
      results.push({
        metric: 'Функции',
        expected: `${this.thresholds.functions}%`,
        actual: `${total.functions.pct}%`,
        passed: true
      });
    }

    // Проверка ветвей
    if (total.branches.pct < this.thresholds.branches) {
      results.push({
        metric: 'Ветви',
        expected: `${this.thresholds.branches}%`,
        actual: `${total.branches.pct}%`,
        passed: false
      });
      passed = false;
    } else {
      results.push({
        metric: 'Ветви',
        expected: `${this.thresholds.branches}%`,
        actual: `${total.branches.pct}%`,
        passed: true
      });
    }

    // Вывод результатов
    console.log('📋 Результаты проверки:');
    console.log('───────────────────────');
    
    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.metric}: ${result.actual} (минимум ${result.expected})`);
    });

    console.log('\n📈 Общая статистика:');
    const overall = (total.lines.pct + total.functions.pct + total.branches.pct) / 3;
    console.log(`  Общее покрытие: ${overall.toFixed(2)}%`);

    if (!passed) {
      console.log('\n❌ Покрытие кода ниже требуемого уровня!');
      console.log('\nРекомендации:');
      console.log('1. Напишите тесты для непокрытых функций');
      console.log('2. Проверьте условия в if/else ветвлениях');
      console.log('3. Добавьте тесты для граничных случаев');
      console.log('\nДля детального анализа запустите:');
      console.log('  npm run lcov:low');
      console.log('  npm run lcov:uncovered');
      process.exit(1);
    } else {
      console.log('\n✅ Покрытие кода соответствует требованиям!');
      
      // Генерация badge для README
      this.generateBadge(total.lines.pct);
    }
  }

  generateBadge(coverage: number) {
    const badgePath = path.join(__dirname, '..', 'coverage-badge.svg');
    
    let color = 'red';
    if (coverage >= 90) color = 'brightgreen';
    else if (coverage >= 80) color = 'green';
    else if (coverage >= 70) color = 'yellowgreen';
    else if (coverage >= 60) color = 'yellow';
    else if (coverage >= 50) color = 'orange';
    
    const badge = `<?xml version="1.0" encoding="UTF-8"?>
                  <svg xmlns="http://www.w3.org/2000/svg" width="125" height="20">
                    <linearGradient id="b" x2="0" y2="100%">
                      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
                      <stop offset="1" stop-opacity=".1"/>
                    </linearGradient>
                    <mask id="a">
                      <rect width="125" height="20" rx="3" fill="#fff"/>
                    </mask>
                    <g mask="url(#a)">
                      <path fill="#555" d="M0 0h65v20H0z"/>
                      <path fill="${color}" d="M65 0h60v20H65z"/>
                      <path fill="url(#b)" d="M0 0h125v20H0z"/>
                    </g>
                    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
                      <text x="32.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
                      <text x="32.5" y="14">coverage</text>
                      <text x="95" y="15" fill="#010101" fill-opacity=".3">${coverage}%</text>
                      <text x="95" y="14">${coverage}%</text>
                    </g>
                  </svg>`;
    
    fs.writeFileSync(badgePath, badge);
    console.log(`\n🛡️ Badge сгенерирован: ${badgePath}`);
  }
}

// Запуск проверки
const checker = new CoverageChecker();
checker.check();