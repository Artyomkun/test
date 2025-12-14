import { beforeAll, afterAll } from '@jest/globals';
import puppeteer, { LaunchOptions} from 'puppeteer'; 

interface BiDiLaunchOptions extends LaunchOptions {
    userAgent: string;
} 

beforeAll(async () => {
    console.log('🚀 Запуск браузера...');
    
    const launchOptions: BiDiLaunchOptions = {
        headless: false,
        slowMo: 100, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--ignore-certificate-errors', 
            '--ignore-ssl-errors',
            '--disable-web-security', 
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
        ],
        defaultViewport: null,
        ignoreDefaultArgs: ['--disable-extensions'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    };

    try {
        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 }); 
        global.browser = browser;
        global.page = page;
        
        console.log('✅ Браузер успешно запущен и настроен');
        
    } catch (error) {
        console.error('❌ Ошибка при запуске браузера:', (error as Error).message);
        throw error;
    }
});

afterAll(async () => {
    console.log('🧹 Завершение работы...');
    
    try {
            console.log('Закрываем браузер...');
            await global.browser.close();
            console.log('✅ Браузер закрыт');
    } catch (error) {
        console.error('❌ Ошибка при закрытии браузера:', (error as Error).message);
    }
    
    console.log('🏁 Очистка завершена');
}); 