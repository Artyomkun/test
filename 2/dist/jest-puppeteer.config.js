// Определяем окружение
const isCI = process.env.CI === 'true';
const isHeadless = process.env.HEADLESS !== 'false';
const isDebug = process.env.DEBUG === 'true';
const slowMo = process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0;
const config = {
    launch: {
        // Настройки для разных окружений
        headless: isCI ? true : isHeadless,
        // Разрешение экрана
        defaultViewport: {
            width: isCI ? 1280 : 1920,
            height: isCI ? 720 : 1080,
            deviceScaleFactor: 1,
        },
        // Аргументы Chrome
        args: [
            // Безопасность
            '--no-sandbox',
            '--disable-setuid-sandbox',
            // Производительность
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            // Размер окна
            `--window-size=${isCI ? '1280,720' : '1920,1080'}`,
            // Дополнительные настройки
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            // Логи
            '--enable-logging',
            '--v=1',
            // Автоматизация
            '--disable-infobars',
            '--disable-notifications',
            '--disable-popup-blocking',
            // Язык
            '--lang=ru-RU,ru',
        ],
        // Замедление для отладки
        slowMo: isDebug ? 100 : slowMo,
        // Таймауты
        timeout: isCI ? 60000 : 30000,
        // Игнорирование ошибок HTTPS
        ignoreHTTPSErrors: true,
        // DevTools для отладки
        devtools: isDebug,
        // Запуск с определенным пользовательским агентом
        product: 'chrome',
        // Путь к исполняемому файлу Chrome (если нужно указать явно)
        executablePath: process.env.CHROME_PATH,
        // Пользовательские данные
        userDataDir: './.user-data',
    },
    // Контекст браузера
    browserContext: 'default',
    // Браузеры (jest-puppeteer поддерживает несколько)
    browsers: ['chromium'],
    // Каталог для кэша
    cacheDirectory: './.jest-puppeteer-cache',
    // Конфигурация для CI
    exitOnPageError: !isDebug,
    dumpio: isDebug,
};
// Экспорт конфигурации
export default config;
//# sourceMappingURL=jest-puppeteer.config.js.map