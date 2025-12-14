#!/usr/bin/env node

/**
 * Скрипт для очистки старых отчетов
 */

import fs from 'fs';
import path from 'path';

class ReportsCleanup {
    reportsDir: string;
    maxAgeDays: number;
    now: number;
    maxAgeMs: number;
    constructor(reportsDir: string, maxAgeDays = 90) {
        this.reportsDir = reportsDir;
        this.maxAgeDays = maxAgeDays;
        this.now = Date.now();
        this.maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    }

    cleanup() {
        console.log(`🧹 Очистка отчетов в ${this.reportsDir}`);
        console.log(`   Максимальный возраст: ${this.maxAgeDays} дней\n`);

        if (!fs.existsSync(this.reportsDir)) {
            console.log('✓ Каталог отчетов не существует, очистка не требуется');
            return { deleted: 0, errors: 0 };
        }

        const stats = {
            total: 0,
            deleted: 0,
            kept: 0,
            errors: 0
        };

        this.cleanupDirectory(this.reportsDir, stats);

        console.log('\n📊 Итоги очистки:');
        console.log(`   Обработано файлов: ${stats.total}`);
        console.log(`   Удалено: ${stats.deleted}`);
        console.log(`   Оставлено: ${stats.kept}`);
        console.log(`   Ошибок: ${stats.errors}`);

        return stats;
    }

    cleanupDirectory(dirPath: string, stats: { total: number; deleted: number; kept: number; errors: number; }) {
        try {
            const items = fs.readdirSync(dirPath as string);
            
            items.forEach(
                item => {
                    if (item === '.gitkeep' || item === 'archive') {
                        return; // Не удаляем .gitkeep и каталог архива
                    }

                    const itemPath = path.join(dirPath, item);
                    const stat = fs.statSync(itemPath);

                    if (stat.isDirectory()) {
                        // Рекурсивная очистка подкаталогов
                        this.cleanupDirectory(itemPath, stats);
                        
                        // Проверяем если каталог пустой после очистки
                        const dirItems = fs.readdirSync(itemPath as string).filter(i => i !== '.gitkeep');
                        if (dirItems.length === 0 && item !== 'archive') {
                            try {
                                fs.rmdirSync(itemPath);
                                console.log(`🗑️  Удален пустой каталог: ${itemPath}`);
                            } catch (error) {
                                console.error(`❌ Ошибка удаления каталога ${itemPath}:`, (error as Error).message);
                                stats.errors++;
                            }
                        }
                    } else {
                        stats.total++;
                        this.processFile(itemPath, stat, stats);
                    }
                }
            );
        } catch (error) {
            console.error(`❌ Ошибка при очистке ${dirPath}:`, (error as Error).message);
            stats.errors++;
        }
    }

    processFile(filePath: string, stat: fs.Stats, stats: { total: number; deleted: number; kept: number; errors: number; }) {
        const ageMs = this.now - stat.mtimeMs;
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
        const filename = path.basename(filePath);

        // Проверяем нужно ли удалять файл
        if (this.shouldDelete(filePath, ageMs)) {
            try {
                fs.unlinkSync(filePath);
                stats.deleted++;
                console.log(`🗑️  Удален: ${filename} (${ageDays} дней)`);
            }
    
            catch (error) {
                console.error(`❌ Ошибка удаления ${filename}:`, (error as Error).message);
                stats.errors++;
            }
        } else {
            stats.kept++;
        }
    }

    shouldDelete(filePath: string, ageMs: number) {
        const filename = path.basename(filePath);
        
        // Никогда не удаляем важные файлы
        const protectedFiles = [
            'README.md',
            'config.json',
            'environment.properties',
            'categories.json',
            'allure-config.yml'
        ];
        
        if (protectedFiles.includes(filename)) {
            return false;
        }

        // Удаляем файлы старше maxAgeDays
        if (ageMs > this.maxAgeMs) {
            return true;
        }

        // Удаляем временные файлы старше 1 дня
        const tempPatterns = [
            /^tmp_/,
            /^temp_/,
            /\.tmp$/,
            /\.temp$/,
            /^screenshot-\d{4}/,
            /\.log$/,
            /debug\./
        ];
        
        if (tempPatterns.some(pattern => pattern.test(filename)) && ageMs > 24 * 60 * 60 * 1000) {
            return true;
        }

        // Удаляем файлы с датами в названии старше 30 дней
        const dateMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
        if (dateMatch) {
            const fileDate = new Date(dateMatch[1].replace(/[_-]/g, '-'));
            const fileAgeMs = this.now - fileDate.getTime();
            return fileAgeMs > 30 * 24 * 60 * 60 * 1000; // 30 дней
        }

        return false;
    }

    // Метод для безопасного удаления (с резервной копией)
    safeCleanup() {
        console.log('🔒 Безопасная очистка с созданием резервной копии...\n');
        
        const backupDir = path.join(this.reportsDir, `backup-${new Date().toISOString().split('T')[0]}`);
        
        try {
            // Создаем резервную копию
            this.createBackup(backupDir);
            
            // Выполняем обычную очистку
            const stats = this.cleanup();
            
            // Если удалено больше 50% файлов, предупреждаем
            if ('total' in stats && stats.total > 0 && (stats.deleted / stats.total) > 0.5) {
                console.log('\n⚠️  ВНИМАНИЕ: Удалено более 50% файлов!');
                console.log(`   Резервная копия сохранена в: ${backupDir}`);
            }
            
            return stats;
        }
        catch (error) {
            console.error('❌ Ошибка при безопасной очистке:', (error as Error).message);
            return { deleted: 0, errors: 1 };
        }
    }

    createBackup(backupDir: string) {
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const items = fs.readdirSync(this.reportsDir);
        
        items.forEach(item => {
                if (item === 'archive' || item === 'backup-' || item.startsWith('backup-')) {
                    return; // Пропускаем каталоги архива и других бэкапов
                }
                
                const sourcePath = path.join(this.reportsDir, item);
                const targetPath = path.join(backupDir, item);
            
                try {
                    const stat = fs.statSync(sourcePath);
                    if (stat.isDirectory()) {
                        this.copyDirectory(sourcePath, targetPath);
                    } else {
                        fs.copyFileSync(sourcePath, targetPath);
                    }
                } catch (error) {
                    console.error(`❌ Ошибка копирования ${item}:`, (error as Error).message);
                }
            }
        );
        
        console.log(`✓ Создана резервная копия: ${backupDir}`);
    }

    copyDirectory(source: string, target: string) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source);
            
        items.forEach(item => {
                const sourcePath = path.join(source, item);
                const targetPath = path.join(target, item);
                const stat = fs.statSync(sourcePath);
                    
                if (stat.isDirectory()) {
                    this.copyDirectory(sourcePath, targetPath);
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                }
            }
        );
    }
}

// CLI интерфейс
if (require.main === module) {
    const args = process.argv.slice(2);
    const reportsDir = args[0] || 'reports';
    const maxAgeDays = parseInt(args[1]) || 90;
    const safeMode = args.includes('--safe');

    if (!fs.existsSync(reportsDir)) {
        console.log('✓ Каталог отчетов не существует, очистка не требуется');
        process.exit(0);
    }

    const cleaner = new ReportsCleanup(reportsDir, maxAgeDays);
    const stats = safeMode ? cleaner.safeCleanup() : cleaner.cleanup();

    // Генерируем отчет об очистке
    const cleanupReport = {
        timestamp: new Date().toISOString(),
        reportsDir,
        maxAgeDays,
        safeMode,
        stats,
        command: process.argv.join(' ')
    };

    const reportPath = path.join(reportsDir, 'cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(cleanupReport, null, 2));
    console.log(`\n📄 Отчет об очистке сохранен: ${reportPath}`);
}

module.exports = ReportsCleanup;