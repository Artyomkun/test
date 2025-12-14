import { HabrMainPage } from '../pages/HabrMainPage';
import { describe, test, expect } from '@jest/globals';
describe('Habr.com - Тестирование авторизации', () => {
    let habrPage;
    beforeAll(async () => {
        habrPage = new HabrMainPage(page);
        await habrPage.navigate();
    });
    describe('TC-1: Доступность форм авторизации', () => {
        test('Кнопка входа открывает страницу авторизации', async () => {
            await habrPage.goToLoginPage();
            const currentUrl = await habrPage.getCurrentUrl();
            expect(currentUrl).toContain('/auth/');
            const hasEmailField = await habrPage.isElementVisible('input[name="email"]');
            const hasPasswordField = await habrPage.isElementVisible('input[name="password"]');
            const hasSubmitButton = await habrPage.isElementVisible('button[type="submit"]');
            expect(hasEmailField).toBe(true);
            expect(hasPasswordField).toBe(true);
            expect(hasSubmitButton).toBe(true);
            await habrPage.takeScreenshot('login-page');
            await habrPage.navigate();
        }, 15000);
        test('Кнопка регистрации открывает страницу регистрации', async () => {
            await habrPage.goToRegisterPage();
            const currentUrl = await habrPage.getCurrentUrl();
            expect(currentUrl).toContain('/register/');
            const hasUsernameField = await habrPage.isElementVisible('input[name="login"]');
            const hasEmailField = await habrPage.isElementVisible('input[name="email"]');
            const hasPasswordField = await habrPage.isElementVisible('input[name="password"]');
            expect(hasUsernameField).toBe(true);
            expect(hasEmailField).toBe(true);
            expect(hasPasswordField).toBe(true);
            await habrPage.takeScreenshot('register-page');
            await habrPage.navigate();
        }, 15000);
    });
    describe('TC-2: Валидация формы авторизации', () => {
        test('Валидация пустых полей', async () => {
            await habrPage.goToLoginPage();
            await habrPage.clickElement('button[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const errorMessages = await page.$$('.tm-field-error');
            expect(errorMessages.length).toBeGreaterThan(0);
            await habrPage.takeScreenshot('login-validation-errors');
            await habrPage.navigate();
        }, 10000);
    });
});
//# sourceMappingURL=habr.auth.test.js.map