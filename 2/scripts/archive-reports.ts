#!/usr/bin/env node

/**
 * Скрипт для архивации старых отчетов
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ArchiveStats {
    total: number;
    archived: number;
    skipped: number;
    errors: number;
}

class ReportArchiver {
    private reportsDir: string;
    private maxAgeDays: number;
    private archiveDir: string;
    private now: number;
    private maxAgeMs: number;

    constructor(reportsDir: string, maxAgeDays: number = 30) {
        this.reportsDir = reportsDir;
        this.maxAgeDays = maxAgeDays;
        this.archiveDir = path.join(reportsDir, 'archive');
        this.now = Date.now();
        this.maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    }

    archive() {
        console.log(`📦 Архивация отчетов в ${this.reportsDir}`);
        console.log(`   Максимальный возраст: ${this.maxAgeDays} дней\n`);

        // Создаем каталог archive если его нет
        if (!fs.existsSync(this.archiveDir)) {
            fs.mkdirSync(this.archiveDir, { recursive: true });
            console.log(`✓ Создан каталог архива: ${this.archiveDir}`);
        }

        const stats = {
            total: 0,
            archived: 0,
            skipped: 0,
            errors: 0
        };

        // Архивация JSON отчетов
        this.archiveDirectory(this.reportsDir, stats);

        // Архивация подкаталогов
        const subDirs = ['junit', 'html', 'coverage', 'allure'];
        subDirs.forEach(
            dir => {
                const dirPath = path.join(this.reportsDir, dir);
                if (fs.existsSync(dirPath)) {
                    this.archiveDirectory(dirPath, stats, dir);
                }
            }
        );

        console.log('\n📊 Итоги архивации:');
        console.log(`   Всего файлов: ${stats.total}`);
        console.log(`   Архивировано: ${stats.archived}`);
        console.log(`   Пропущено: ${stats.skipped}`);
        console.log(`   Ошибок: ${stats.errors}`);

        // Очистка пустых каталогов
        this.cleanEmptyDirectories();

        return stats;
    }

    archiveDirectory(dirPath: string, stats: ArchiveStats, subDir: string = '') {
        try {
            const files = fs.readdirSync(dirPath);
                    
            files.forEach(
                file => {
                    if (file === 'archive' || file === '.gitkeep') {
                        return; // Пропускаем каталог архива и .gitkeep
                    }

                    stats.total++;
                    const filePath = path.join(dirPath, file);
                    const stat = fs.statSync(filePath);

                    // Проверяем возраст файла
                    const ageMs = this.now - stat.mtimeMs;
                    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

                    if (stat.isDirectory()) {
                        // Рекурсивная обработка подкаталогов
                        this.archiveDirectory(filePath, stats, path.join(subDir, file));
                    } else if (this.shouldArchive(file, ageMs)) {
                        this.archiveFile(filePath, subDir, ageDays, stats);
                    } else {
                        stats.skipped++;
                    }
                }
            );
        } catch (error) {
            console.error(`❌ Ошибка при архивации ${dirPath}:`, (error as Error).message);
            stats.errors++;
        }
    }

    shouldArchive(filename: string, ageMs: number): boolean {
        // Архивируем файлы старше maxAgeDays
        if (ageMs > this.maxAgeMs) {
            return true;
        }

        // Архивируем файлы с датами в названии старше 7 дней
        const dateMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
        if (dateMatch) {
            const fileDate = new Date(dateMatch[1].replace(/[_-]/g, '-'));
            const fileAgeMs = this.now - fileDate.getTime();
            return fileAgeMs > 7 * 24 * 60 * 60 * 1000; // 7 дней
        }

        return false;
    }

    archiveFile(filePath: string, subDir: string, ageDays: number, stats: ArchiveStats) {
        try {
            const filename = path.basename(filePath);
            const targetDir = path.join(this.archiveDir, subDir);
            
            // Создаем целевую директорию если ее нет
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const targetPath = path.join(targetDir, filename);
            
            // Если файл уже существует в архиве, добавляем timestamp
            let finalTargetPath = targetPath;
            if (fs.existsSync(targetPath)) {
                const ext = path.extname(filename);
                const name = path.basename(filename, ext);
                const timestamp = new Date().getTime();
                finalTargetPath = path.join(targetDir, `${name}_${timestamp}${ext}`);
            }

            // Копируем файл в архив
            fs.copyFileSync(filePath, finalTargetPath);
            
            // Удаляем оригинальный файл
            fs.unlinkSync(filePath);
            
            stats.archived++;
            console.log(`✓ Архивирован: ${filename} (${ageDays} дней)`);
        } catch (error) {
            console.error(`❌ Ошибка архивации ${filePath}:`, (error as Error).message);
            stats.errors++;
        }
    }

    cleanEmptyDirectories() {
        console.log('\n🧹 Очистка пустых каталогов...');
        
        const cleanDir = (dir: string) => {
            try {
                const items = fs.readdirSync(dir);
                
                items.forEach(
                    item => {
                        const itemPath = path.join(dir, item);
                        const stat = fs.statSync(itemPath);
                        
                        if (stat.isDirectory()) {
                            cleanDir(itemPath); // Рекурсивно очищаем подкаталоги
                                
                            // Проверяем если каталог пустой (игнорируем .gitkeep)
                            const dirItems = fs.readdirSync(itemPath).filter(i => i !== '.gitkeep');
                            if (dirItems.length === 0) {
                                fs.rmdirSync(itemPath);
                                console.log(`🗑️  Удален пустой каталог: ${itemPath}`);
                            }
                        }
                    }
                );
            } catch (error) {
                console.error(`Ошибка при очистке ${dir}:`, (error as Error).message);
            }
        };
        
        cleanDir(this.reportsDir);
    }

    compressArchive() {
        console.log('\n📦 Сжатие архива...');
        
        const archivePath = path.join(this.reportsDir, `archive-${new Date().toISOString().split('T')[0]}.zip`);
        
        try {
            execSync(`cd "${this.archiveDir}" && zip -r "${archivePath}" .`, {
                    stdio: 'pipe'
                }
            );
        
            // Удаляем несжатый архив
            fs.rmSync(this.archiveDir, { recursive: true, force: true });
            
            console.log(`✓ Архив сжат: ${archivePath}`);
            return archivePath;
        } catch (error) {
            console.error('❌ Ошибка сжатия архива:', (error as Error).message);
            return null;
        }
    }
}

export default ReportArchiver;

// CLI интерфейс
if (require.main === module) {
    const args = process.argv.slice(2);
    const reportsDir = args[0] || 'reports';
    const maxAgeDays = parseInt(args[1]) || 30;
    const compress = args[2] === '--compress';

    if (!fs.existsSync(reportsDir)) {
        console.error(`❌ Каталог отчетов не найден: ${reportsDir}`);
        console.error('Создайте отчеты сначала: npm run test');
        process.exit(1);
    }

    const archiver = new ReportArchiver(reportsDir, maxAgeDays);
    const stats = archiver.archive();

    if (compress && stats.archived > 0) {
        archiver.compressArchive();
    }

    // Генерируем отчет об архивации
    const archiveReport = {
        timestamp: new Date().toISOString(),
        reportsDir,
        maxAgeDays,
        stats,
        command: process.argv.join(' ')
    };

    const reportPath = path.join(reportsDir, 'archive-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(archiveReport, null, 2));
    console.log(`\n📄 Отчет об архивации сохранен: ${reportPath}`);
}

module.exports = ReportArchiver;