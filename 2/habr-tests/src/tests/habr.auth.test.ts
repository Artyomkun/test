import { HabrMainPage } from '../pages/HabrMainPage';
import { HabrAuthPage } from '../pages/HabrAuthPage';
import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { isPageClosed } from '../pages/BasePage'

export const describeWithSetup = (name: string, fn: () => void) => {
    describe(name, () => {
        beforeAll(async () => {
        if (!browser) {
            throw new Error('Browser was not initialized by puppeteer.setup.ts');
        }
        console.log('✅ Глобальный браузер готов к работе в habr.auth.test.ts');
        });

        fn();
    });
};

describe('Habr.com - Тестирование авторизации', () => {
    let habrPage: HabrMainPage;
    let habrAuthPage: HabrAuthPage;

    beforeAll(async () => {
        console.log('🚀 Начало тестов авторизации');

        if (!browser) {
            throw new Error('Browser not initialized. Check puppeteer.setup.ts');
        } 
        habrPage = new HabrMainPage(page);
        habrAuthPage = new HabrAuthPage(page);

        console.log('✅ Инициализация завершена');
    });

    beforeEach(async () => {
        console.log('🔄 Подготовка к тесту'); 
        try {
            const client = await page.createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await client.detach();
        } catch (error) {
            console.log('⚠️ Не удалось очистить cookies/кеш:', error);
        } 
        await habrPage.navigate();
        
        console.log(`✅ Подготовлено. URL: ${page.url()}`);
    });

    afterAll(async () => {
        console.log('🧹 Завершение smoke тестов');
    
        if (!isPageClosed(page)) {
            try { 
                await page.close();
                console.log('✅ Страница закрыта');
            } catch (error) {
                console.log('⚠️ Ошибка при закрытии:', (error as Error).message);
            }
        }
    });

    describe('TC-1: Доступность форм авторизации', () => {
        test('Кнопка входа отображается на главной странице', async () => {
            console.log('🧪 Проверка кнопки входа'); 
            const isLoginButtonVisible = await habrPage.isLoginButtonVisible();
            console.log(`🎯 Кнопка входа видима: ${isLoginButtonVisible}`); 
            expect(isLoginButtonVisible).toBe(true) 
            console.log('✅ Кнопка входа отображается корректно');
        }, 30000);

        test('Можно перейти на страницу входа', async () => {
            console.log('🧪 Переход на страницу входа'); 
            await habrPage.goToLoginPage(); 
            const currentUrl = await habrPage.getCurrentUrl();
            console.log(`📍 Текущий URL: ${currentUrl}`); 
            expect(currentUrl).toContain('account.habr.com'); 
            const hasEmailField = await page.waitForSelector('input[name="email"]', {
                visible: true,
                timeout: 5000
            });
            expect(hasEmailField).not.toBeNull();
            console.log('✅ Страница входа загружена успешно');
        }, 30000);

        test('Можно перейти на страницу регистрации', async () => {
            console.log('🧪 Переход на страницу регистрации'); 
            await habrPage.goToRegisterPage(); 
            const currentUrl = await habrPage.getCurrentUrl();
            console.log(`📍 Текущий URL: ${currentUrl}`); 
            expect(currentUrl).toContain('account.habr.com'); 
            const hasEmailField = await page.waitForSelector('input[name="email"]', {
                visible: true,
                timeout: 15000
            });
            expect(hasEmailField).not.toBeNull();
            console.log('✅ Страница регистрации загружена успешно');
        }, 30000);
    });

    describe('TC-2: Валидация формы авторизации', () => {
        test('Валидация пустых полей формы входа', async () => {
            console.log('🧪 Проверка валидации пустых полей'); 
            await habrAuthPage.navigateToLogin(); 
            const urlBeforeSubmit = await habrAuthPage.getCurrentUrl();
            console.log(`📍 URL перед отправкой: ${urlBeforeSubmit}`); 
            console.log('📍 Форма входа загружена'); 
            await habrAuthPage.submitEmptyLoginForm(); 
            await new Promise(resolve => setTimeout(resolve, 2000));
            const urlAfterSubmit = await habrAuthPage.getCurrentUrl();
            console.log(`📍 URL после отправки: ${urlAfterSubmit}`); 
            const hasErrors = await habrAuthPage.hasValidationErrors();
            console.log(`📍 Наличие ошибок валидации: ${hasErrors}`); 
            const urlChanged = urlBeforeSubmit !== urlAfterSubmit;
            console.log(`📍 URL изменился: ${urlChanged}`); 
            expect(!urlChanged).toBe(true); 
            console.log('✅ Валидация пустых полей работает');
        }, 30000);
    });
});