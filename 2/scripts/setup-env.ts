import fs from 'fs';
import path from 'path';

console.log('🔧 Настройка окружения для тестов Habr.com\n');

// Создаем основные каталоги
const directories = [
  'reports/junit',
  'reports/html',
  'reports/json',
  'reports/coverage',
  'reports/coverage/static',
  'habr-tests/screenshots',
  'dist',
  'src/types',
  'src/utils',
  'src/pages',
  'src/tests'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Создан каталог: ${dir}`);
  }
});

// Создаем .env файл если его нет
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `  # Настройки для E2E тестов Habr.com
                        # ============================================

                        # Режим браузера
                        HEADLESS=false
                        SLOWMO=50
                        DEBUG=false
                        DEVTOOLS=false

                        # Настройки тестов
                        TEST_TIMEOUT=30000
                        CI=false
                        LOG_LEVEL=1

                        # Настройки приложения
                        BASE_URL=https://habr.com
                        LANG=ru
                        VIEWPORT_WIDTH=1920
                        VIEWPORT_HEIGHT=1080

                        # Скриншоты
                        CAPTURE_SCREENSHOTS_ON_FAILURE=true
                        CAPTURE_SCREENSHOTS_ON_SUCCESS=false
                        SCREENSHOTS_DIR=./screenshots

                        # Отчеты
                        REPORTS_DIR=./reports
                        REPORT_FORMAT=html

                        # Тестовые данные (заполните при необходимости)
                        # TEST_USER_EMAIL=your-test-email@example.com
                        # TEST_USER_PASSWORD=YourTestPassword123!
                        # TEST_USER_USERNAME=test_user_automation

                        # Прокси (если требуется)
                        # HTTP_PROXY=http://proxy.company.com:8080
                        # HTTPS_PROXY=http://proxy.company.com:8080

                        # ============================================
                        `;

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✓ Создан файл .env с настройками по умолчанию');
  console.log('  Отредактируйте его для своих нужд');
}

// Создаем .env.ci для CI/CD
const envCiPath = path.join(__dirname, '..', '.env.ci');
if (!fs.existsSync(envCiPath)) {
  const envCiContent = `# Настройки для CI/CD окружения
                        HEADLESS=true
                        SLOWMO=0
                        CI=true
                        TEST_TIMEOUT=60000
                        VIEWPORT_WIDTH=1280
                        VIEWPORT_HEIGHT=720
                        CAPTURE_SCREENSHOTS_ON_FAILURE=true
                        CAPTURE_SCREENSHOTS_ON_SUCCESS=false
                        MAX_PARALLEL_TESTS=2
                        `;

  fs.writeFileSync(envCiPath, envCiContent, 'utf8');
  console.log('✓ Создан файл .env.ci для CI/CD');
}

// Создаем .gitignore если его нет
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
                            node_modules/
                            npm-debug.log*
                            yarn-debug.log*
                            yarn-error.log*

                            # Build outputs
                            dist/
                            coverage/

                            # Environment variables
                            .env
                            .env.local
                            .env.*.local

                            # Reports
                            reports/
                            screenshots/

                            # IDE
                            .vscode/
                            .idea/
                            *.swp
                            *.swo

                            # OS
                            .DS_Store
                            Thumbs.db

                            # Test cache
                            .jest-puppeteer-cache/
                            .jest-cache/

                            # Logs
                            logs/
                            *.log

                            # Temporary files
                            tmp/
                            temp/
                            `;

  fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  console.log('✓ Создан файл .gitignore');
}

// Создаем README.md если его нет
const readmePath = path.join(__dirname, '..', 'README.md');
if (!fs.existsSync(readmePath)) {
  const readmeContent = `# Habr.com E2E Tests
                        End-to-end тесты для сайта Habr.com, написанные на TypeScript с использованием Jest и Puppeteer.

                        ## 📋 Функциональность

                        Тесты покрывают:
                        - Smoke-тесты (базовая функциональность)
                        - Тестирование статей (поиск, фильтрация, сортировка)
                        - Тестирование авторизации и регистрации
                        - Навигация по разделам сайта

                        ## 🚀 Быстрый старт

                        ### 1. Установка зависимостей
                        \`\`\`bash
                        npm install
                        \`\`\`

                        ### 2. Настройка окружения
                        \`\`\`bash
                        npm run env:setup
                        \`\`\`

                        ### 3. Запуск тестов
                        \`\`\`bash
                        # Запуск всех тестов с видимым браузером
                        npm run test:headed

                        # Запуск в headless режиме (без GUI)
                        npm run test

                        # Запуск конкретных тестов
                        npm run test:smoke
                        npm run test:articles
                        npm run test:auth

                        # Запуск с замедлением для отладки
                        npm run test:debug
                        \`\`\`

                        ## 📊 Отчеты

                        После запуска тестов генерируются отчеты:

                        - **JUnit отчеты:** \`reports/junit/junit.xml\`
                        - **HTML отчеты:** \`reports/html/\`
                        - **Покрытие кода:** \`reports/coverage/index.html\`

                        Для генерации отчетов:
                        \`\`\`bash
                        npm run report:all
                        \`\`\`

                        ## ⚙️ Конфигурация

                        Настройки в файлах:
                        - \`.env\` - переменные окружения
                        - \`jest.config.ts\` - конфигурация Jest
                        - \`jest-puppeteer.config.ts\` - конфигурация Puppeteer
                        - \`tsconfig.json\` - конфигурация TypeScript

                        ## 📁 Структура проекта

                        \`\`\`
                        habr-tests/
                        ├── src/
                        │   ├── pages/           # Page Object Model
                        │   ├── tests/           # Тесты
                        │   ├── types/           # TypeScript типы
                        │   └── utils/           # Утилиты
                        ├── reports/             # Отчеты
                        ├── screenshots/         # Скриншоты тестов
                        ├── scripts/             # Вспомогательные скрипты
                        └── config файлы
                        \`\`\`

                        ## 🔧 Команды NPM

                        Основные команды:
                        - \`npm test\` - запуск всех тестов
                        - \`npm run test:headed\` - тесты с видимым браузером
                        - \`npm run coverage\` - тесты с покрытием кода
                        - \`npm run lint\` - проверка кода
                        - \`npm run build\` - сборка TypeScript

                        ## 🤝 Вклад в проект

                        1. Форкните репозиторий
                        2. Создайте ветку для своей фичи
                        3. Напишите тесты
                        4. Проверьте линтинг и форматирование
                        5. Создайте Pull Request

                        ## 📄 Лицензия

                        MIT
                        `;

  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log('✓ Создан файл README.md');
}

console.log('\n✅ Настройка завершена!');
console.log('\nСледующие шаги:');
console.log('1. Отредактируйте .env файл при необходимости');
console.log('2. Запустите тесты: npm run test:headed');
console.log('3. Проверьте отчеты в каталоге reports/');