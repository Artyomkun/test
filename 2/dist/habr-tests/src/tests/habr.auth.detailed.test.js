import { describe, test, expect, beforeEach } from '@jest/globals';
import { TestData, TestHelpers } from '../utils/helpers';
import { HabrAuthPage } from '../pages/HabrAuthPage';
describe('Habr.com - Детальное тестирование авторизации', () => {
    let authPage;
    beforeAll(async () => {
        authPage = new HabrAuthPage(page);
    });
    describe('TC-1: Детальная проверка формы входа', () => {
        beforeEach(async () => {
            await authPage.navigateToLogin();
        });
        test('Форма входа содержит все необходимые элементы', async () => {
            const isFormVisible = await authPage.isLoginFormVisible();
            expect(isFormVisible).toBe(true);
            const formTitle = await authPage.getFormTitle();
            expect(formTitle).toContain('Вход');
            expect(formTitle).toBeTruthy();
            const elements = [
                'emailInput',
                'passwordInput',
                'rememberMeCheckbox',
                'submitButton',
                'forgotPasswordLink',
                'registerLink',
            ];
            for (const element of elements) {
                const isVisible = await authPage.isElementVisible(authPage['selectors'][element]);
                expect(isVisible).toBe(true);
            }
            await authPage.captureFormState('login-form-elements');
        });
        test('Чекбокс "Запомнить меня" работает корректно', async () => {
            let isChecked = await authPage.isRememberMeChecked();
            expect(isChecked).toBe(false);
            await authPage.clickElement(authPage['selectors'].rememberMeCheckbox);
            await TestHelpers.delay(500);
            isChecked = await authPage.isRememberMeChecked();
            expect(isChecked).toBe(true);
            await authPage.clickElement(authPage['selectors'].rememberMeCheckbox);
            await TestHelpers.delay(500);
            isChecked = await authPage.isRememberMeChecked();
            expect(isChecked).toBe(false);
        });
        test('Переключение видимости пароля работает', async () => {
            let fieldType = await authPage.getPasswordFieldType('login');
            expect(fieldType).toBe('password');
            await authPage.togglePasswordVisibility('login');
            await TestHelpers.delay(500);
            fieldType = await authPage.getPasswordFieldType('login');
            expect(fieldType).toBe('text');
            await authPage.togglePasswordVisibility('login');
            await TestHelpers.delay(500);
            fieldType = await authPage.getPasswordFieldType('login');
            expect(fieldType).toBe('password');
        });
        test('Навигация по ссылкам работает корректно', async () => {
            await authPage.goToRegisterFromLogin();
            const isRegisterPage = await authPage.isRegisterPage();
            expect(isRegisterPage).toBe(true);
            const isRegisterFormVisible = await authPage.isRegisterFormVisible();
            expect(isRegisterFormVisible).toBe(true);
            await authPage.captureFormState('from-login-to-register');
            await authPage.goToLoginFromRegister();
            const isLoginPage = await authPage.isLoginPage();
            expect(isLoginPage).toBe(true);
            const isLoginFormVisible = await authPage.isLoginFormVisible();
            expect(isLoginFormVisible).toBe(true);
        });
        test('Вход с неверными данными показывает ошибку', async () => {
            const invalidUser = {
                email: 'nonexistent@example.com',
                password: 'wrongpassword',
            };
            await authPage.fillLoginForm(invalidUser.email, invalidUser.password);
            await authPage.submitLoginForm();
            await TestHelpers.delay(2000);
            const hasErrors = await authPage.hasValidationErrors();
            expect(hasErrors).toBe(true);
            const errors = await authPage.getValidationErrors();
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0]).toBeTruthy();
            await authPage.captureFormState('login-invalid-credentials');
        });
    });
    describe('TC-2: Валидация формы регистрации', () => {
        beforeEach(async () => {
            await authPage.navigateToRegister();
        });
        test('Все поля формы регистрации присутствуют', async () => {
            const isFormVisible = await authPage.isRegisterFormVisible();
            expect(isFormVisible).toBe(true);
            const formTitle = await authPage.getFormTitle();
            expect(formTitle).toContain('Регистрация');
            const elements = [
                'registerUsernameInput',
                'registerEmailInput',
                'registerPasswordInput',
                'registerConfirmPasswordInput',
                'registerAgreementCheckbox',
                'registerSubmitButton',
                'loginLink',
            ];
            for (const element of elements) {
                const isVisible = await authPage.isElementVisible(authPage['selectors'][element]);
                expect(isVisible).toBe(true);
            }
            await authPage.captureFormState('register-form-elements');
        });
        test('Валидация на стороне клиента работает', async () => {
            const testScenarios = await authPage.testInvalidRegisterScenarios();
            testScenarios.forEach(({ scenario, hasError }) => {
                expect(hasError).toBe(true);
                console.log(`Сценарий "${scenario}": ${hasError ? 'ошибка показана' : 'ошибка не показана'}`);
            });
            expect(testScenarios.length).toBeGreaterThan(0);
        });
        test('Чекбокс соглашения обязателен', async () => {
            const testUser = {
                username: TestHelpers.generateRandomUsername(),
                email: TestHelpers.generateRandomEmail(),
                password: 'ValidPassword123!',
            };
            await authPage.fillRegisterForm(testUser);
            await authPage.clickElement(authPage['selectors'].registerAgreementCheckbox);
            await authPage.submitEmptyRegisterForm();
            const hasErrors = await authPage.hasValidationErrors();
            expect(hasErrors).toBe(true);
            const agreementError = await authPage.getSpecificValidationError('agreement');
            expect(agreementError).toBeTruthy();
        });
        test('Проверка совпадения паролей', async () => {
            const testUser = {
                username: TestHelpers.generateRandomUsername(),
                email: TestHelpers.generateRandomEmail(),
                password: 'Password123!',
            };
            await authPage.typeText(authPage['selectors'].registerUsernameInput, testUser.username);
            await authPage.typeText(authPage['selectors'].registerEmailInput, testUser.email);
            await authPage.typeText(authPage['selectors'].registerPasswordInput, testUser.password);
            await authPage.typeText(authPage['selectors'].registerConfirmPasswordInput, 'DifferentPassword123!');
            await authPage.clickElement(authPage['selectors'].registerAgreementCheckbox);
            await authPage.submitEmptyRegisterForm();
            const hasErrors = await authPage.hasValidationErrors();
            expect(hasErrors).toBe(true);
            const passwordConfirmError = await authPage.getSpecificValidationError('passwordConfirm');
            expect(passwordConfirmError).toContain('парол');
        });
    });
    describe('TC-3: Вход через социальные сети', () => {
        test('Кнопки социальных сетей отображаются', async () => {
            await authPage.navigateToLogin();
            const hasSocialLogin = await authPage.isSocialLoginAvailable();
            expect(hasSocialLogin).toBe(true);
            await authPage.captureFormState('social-buttons');
        });
        test('Кнопка VK ведет на правильный URL', async () => {
            await authPage.navigateToLogin();
            const vkButtonHref = await authPage.getElementAttribute(authPage['selectors'].socialButtons.vk, 'href');
            expect(vkButtonHref).toBeTruthy();
            expect(vkButtonHref).toContain('vk.com');
            expect(vkButtonHref).toContain('oauth');
        });
        test('Кнопки социальных сетей кликабельны', async () => {
            await authPage.navigateToLogin();
            const googleButton = await page.$(authPage['selectors'].socialButtons.google);
            expect(googleButton).not.toBeNull();
            const isGoogleEnabled = await page.evaluate((button) => {
                if (!button)
                    return false;
                const el = button;
                return !el.disabled && el.style.display !== 'none';
            }, googleButton);
            expect(isGoogleEnabled).toBe(true);
        });
    });
    describe('TC-4: Восстановление пароля', () => {
        test('Ссылка "Забыли пароль" ведет на правильную страницу', async () => {
            await authPage.navigateToLogin();
            await authPage.goToForgotPassword();
            const isForgotPasswordPage = await authPage.isForgotPasswordPage();
            expect(isForgotPasswordPage).toBe(true);
            const pageTitle = await authPage.getPageTitle();
            expect(pageTitle).toContain('Восстановление');
            await authPage.captureFormState('forgot-password-page');
        });
        test('Форма восстановления пароля содержит email поле', async () => {
            await authPage.navigateToLogin();
            await authPage.goToForgotPassword();
            const hasEmailField = await authPage.isElementVisible('input[name="email"]');
            expect(hasEmailField).toBe(true);
            const hasSubmitButton = await authPage.isElementVisible('button[type="submit"]');
            expect(hasSubmitButton).toBe(true);
        });
    });
    describe('TC-5: Интеграционные тесты', () => {
        test('Нельзя зарегистрироваться с уже существующим email', async () => {
            await authPage.navigateToRegister();
            const existingUser = TestData.validUser;
            await authPage.fillRegisterForm(existingUser);
            await authPage.submitRegisterForm();
            await TestHelpers.delay(3000);
            const hasErrors = await authPage.hasValidationErrors();
            expect(hasErrors).toBe(true);
            await authPage.captureFormState('register-existing-email');
        });
        test('Успешный вход с валидными данными (если есть тестовый аккаунт)', async () => {
            if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
                await authPage.navigateToLogin();
                const testUser = {
                    username: 'testuser',
                    email: process.env.TEST_USER_EMAIL,
                    password: process.env.TEST_USER_PASSWORD,
                };
                await authPage.login(testUser);
                const currentUrl = await authPage.getCurrentUrl();
                expect(currentUrl).toBe('https://habr.com/ru/feed/');
                const hasUserMenu = await authPage.isElementVisible('.tm-user-menu');
                expect(hasUserMenu).toBe(true);
                await authPage.captureFormState('login-success');
            }
            console.log('Тест успешного входа пропущен - требуется тестовый аккаунт');
            expect(true).toBe(true);
        });
    });
});
//# sourceMappingURL=habr.auth.detailed.test.js.map