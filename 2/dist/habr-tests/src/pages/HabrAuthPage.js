import { BasePage } from './BasePage';
export class HabrAuthPage extends BasePage {
    selectors = {
        loginForm: 'form.tm-sign-form',
        emailInput: 'input[name="email"]',
        passwordInput: 'input[name="password"]',
        rememberMeCheckbox: 'input[name="remember_me"]',
        submitButton: 'button[type="submit"]',
        registerForm: 'form.tm-sign-form',
        registerUsernameInput: 'input[name="login"]',
        registerEmailInput: 'input[name="email"]',
        registerPasswordInput: 'input[name="password"]',
        registerConfirmPasswordInput: 'input[name="password_confirm"]',
        registerAgreementCheckbox: 'input[name="agreement"]',
        registerSubmitButton: 'button[type="submit"]',
        socialButtons: {
            vk: 'a.tm-sign-form__oauth-button_vk',
            google: 'a.tm-sign-form__oauth-button_google',
            github: 'a.tm-sign-form__oauth-button_github',
            yandex: 'a.tm-sign-form__oauth-button_yandex',
        },
        forgotPasswordLink: 'a.tm-sign-form__link[href*="remind"]',
        registerLink: 'a.tm-sign-form__link[href*="register"]',
        loginLink: 'a.tm-sign-form__link[href*="login"]',
        errorMessages: '.tm-field-error',
        successMessage: '.tm-sign-form__success',
        captchaContainer: '.g-recaptcha',
        captchaIframe: 'iframe[src*="recaptcha"]',
        backToMainLink: 'a.tm-header__logo',
        validationErrors: {
            email: 'input[name="email"] + .tm-field-error',
            password: 'input[name="password"] + .tm-field-error',
            username: 'input[name="login"] + .tm-field-error',
            passwordConfirm: 'input[name="password_confirm"] + .tm-field-error',
            agreement: 'input[name="agreement"] + .tm-field-error',
        },
    };
    constructor(page) {
        super(page);
    }
    async navigate(path) {
        if (path === 'register') {
            await this.navigateToRegister();
        }
        else {
            await this.navigateToLogin();
        }
    }
    async navigateToLogin() {
        await this.page.goto(`${this.config.baseUrl}/ru/auth/login/`, {
            waitUntil: 'networkidle2',
        });
        await this.waitForLoginForm();
    }
    async navigateToRegister() {
        await this.page.goto(`${this.config.baseUrl}/ru/auth/register/`, {
            waitUntil: 'networkidle2',
        });
        await this.waitForRegisterForm();
    }
    // Ожидание элементов
    async waitForLoginForm() {
        await this.waitForElement(this.selectors.loginForm);
    }
    async waitForRegisterForm() {
        await this.waitForElement(this.selectors.registerForm);
    }
    async isLoginFormVisible() {
        return this.isElementVisible(this.selectors.loginForm);
    }
    async isRegisterFormVisible() {
        return this.isElementVisible(this.selectors.registerForm);
    }
    async fillLoginForm(email, password, rememberMe = false) {
        await this.typeText(this.selectors.emailInput, email);
        await this.typeText(this.selectors.passwordInput, password);
        if (rememberMe) {
            await this.clickElement(this.selectors.rememberMeCheckbox);
        }
    }
    async submitLoginForm() {
        await this.clickElement(this.selectors.submitButton);
        await this.waitForNavigation();
    }
    async login(user) {
        await this.fillLoginForm(user.email, user.password);
        await this.submitLoginForm();
    }
    async loginWithRememberMe(user) {
        await this.fillLoginForm(user.email, user.password, true);
        await this.submitLoginForm();
    }
    // Работа с формой регистрации
    async fillRegisterForm(user, confirmPassword) {
        await this.typeText(this.selectors.registerUsernameInput, user.username);
        await this.typeText(this.selectors.registerEmailInput, user.email);
        await this.typeText(this.selectors.registerPasswordInput, user.password);
        const confirmPass = confirmPassword || user.password;
        await this.typeText(this.selectors.registerConfirmPasswordInput, confirmPass);
        await this.clickElement(this.selectors.registerAgreementCheckbox);
    }
    async submitRegisterForm() {
        await this.clickElement(this.selectors.registerSubmitButton);
        await this.waitForNavigation();
    }
    async register(user) {
        await this.fillRegisterForm(user);
        await this.submitRegisterForm();
    }
    async submitEmptyLoginForm() {
        await this.clickElement(this.selectors.submitButton);
    }
    async submitEmptyRegisterForm() {
        await this.clickElement(this.selectors.registerSubmitButton);
    }
    async getValidationErrors() {
        await this.page.waitForSelector(this.selectors.errorMessages, { timeout: 3000 });
        return this.page.evaluate((selector) => {
            const errorElements = document.querySelectorAll(selector);
            return Array.from(errorElements).map(el => el.textContent?.trim() || '');
        }, this.selectors.errorMessages);
    }
    async getSpecificValidationError(field) {
        try {
            await this.page.waitForSelector(this.selectors.validationErrors[field], { timeout: 2000 });
            return this.getElementText(this.selectors.validationErrors[field]);
        }
        catch {
            return '';
        }
    }
    async hasValidationErrors() {
        const errors = await this.getValidationErrors();
        return errors.length > 0;
    }
    async goToForgotPassword() {
        await this.clickElement(this.selectors.forgotPasswordLink);
        await this.waitForNavigation();
    }
    async goToRegisterFromLogin() {
        await this.clickElement(this.selectors.registerLink);
        await this.waitForNavigation();
    }
    async goToLoginFromRegister() {
        await this.clickElement(this.selectors.loginLink);
        await this.waitForNavigation();
    }
    async goBackToMain() {
        await this.clickElement(this.selectors.backToMainLink);
        await this.waitForNavigation();
    }
    async isSocialLoginAvailable() {
        const socialButtons = [
            this.selectors.socialButtons.vk,
            this.selectors.socialButtons.google,
            this.selectors.socialButtons.github,
        ];
        for (const selector of socialButtons) {
            const isVisible = await this.isElementVisible(selector);
            if (isVisible)
                return true;
        }
        return false;
    }
    async clickSocialButton(provider) {
        await this.clickElement(this.selectors.socialButtons[provider]);
        await this.delay(3000);
    }
    async isCaptchaPresent() {
        try {
            await this.page.waitForSelector(this.selectors.captchaContainer, { timeout: 2000 });
            return true;
        }
        catch {
            return false;
        }
    }
    async getCaptchaIframeSrc() {
        if (await this.isCaptchaPresent()) {
            return this.getElementAttribute(this.selectors.captchaIframe, 'src');
        }
        return '';
    }
    async togglePasswordVisibility(field = 'login') {
        const selector = field === 'login'
            ? `${this.selectors.passwordInput} + button`
            : `${this.selectors.registerPasswordInput} + button`;
        try {
            await this.clickElement(selector);
            await this.delay(500);
            console.log(`Видимость пароля для ${field} переключена`);
        }
        catch {
            console.log(`Кнопка показа пароля для ${field} отсутствует`);
        }
    }
    async getPasswordFieldType(field = 'login') {
        const selector = field === 'login'
            ? this.selectors.passwordInput
            : this.selectors.registerPasswordInput;
        return this.getElementAttribute(selector, 'type');
    }
    async getSuccessMessage() {
        try {
            await this.page.waitForSelector(this.selectors.successMessage, { timeout: 3000 });
            return this.getElementText(this.selectors.successMessage);
        }
        catch {
            return '';
        }
    }
    async isSuccessMessageVisible() {
        return this.isElementVisible(this.selectors.successMessage);
    }
    async testInvalidLoginScenarios() {
        const scenarios = [
            {
                email: '',
                password: 'password123',
                scenario: 'Пустой email'
            },
            {
                email: 'test@example.com',
                password: '',
                scenario: 'Пустой пароль'
            },
            {
                email: 'invalid-email',
                password: 'password123',
                scenario: 'Невалидный email'
            },
            {
                email: 'test@example.com',
                password: '123',
                scenario: 'Короткий пароль'
            },
        ];
        const results = [];
        for (const { email, password, scenario } of scenarios) {
            await this.navigateToLogin();
            await this.fillLoginForm(email, password);
            await this.submitEmptyLoginForm();
            const hasError = await this.hasValidationErrors();
            results.push({ scenario, hasError });
            await this.delay(1000);
        }
        return results;
    }
    async testInvalidRegisterScenarios() {
        const scenarios = [
            {
                user: { username: '', email: '', password: '' },
                scenario: 'Все поля пустые'
            },
            {
                user: { username: 'ab', email: 'test@example.com', password: 'Password123!' },
                scenario: 'Короткое имя пользователя'
            },
            {
                user: { username: 'validuser', email: 'invalid-email', password: 'Password123!' },
                scenario: 'Невалидный email'
            },
            {
                user: { username: 'validuser', email: 'test@example.com', password: '123' },
                scenario: 'Короткий пароль'
            },
            {
                user: { username: 'validuser', email: 'test@example.com', password: 'Password123!' },
                confirmPassword: 'Different123!',
                scenario: 'Пароли не совпадают'
            },
        ];
        const results = [];
        for (const { user, scenario, confirmPassword } of scenarios) {
            await this.navigateToRegister();
            if (confirmPassword) {
                await this.fillRegisterForm(user, confirmPassword);
            }
            else {
                await this.fillRegisterForm(user);
            }
            await this.submitEmptyRegisterForm();
            const hasError = await this.hasValidationErrors();
            results.push({ scenario, hasError });
            await this.delay(1000);
        }
        return results;
    }
    async getFormTitle() {
        return this.getElementText('h1.tm-sign-form__title');
    }
    async getFormDescription() {
        return this.getElementText('.tm-sign-form__description');
    }
    async clearFormFields(form) {
        if (form === 'login') {
            await this.clearField(this.selectors.emailInput);
            await this.clearField(this.selectors.passwordInput);
        }
        else {
            await this.clearField(this.selectors.registerUsernameInput);
            await this.clearField(this.selectors.registerEmailInput);
            await this.clearField(this.selectors.registerPasswordInput);
            await this.clearField(this.selectors.registerConfirmPasswordInput);
        }
    }
    async clearField(selector) {
        await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
                element.value = '';
                element.dispatchEvent(new Event('input', {
                    bubbles: true
                }));
            }
        }, selector);
    }
    async isRememberMeChecked() {
        return this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element?.checked || false;
        }, this.selectors.rememberMeCheckbox);
    }
    async isAgreementChecked() {
        return this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element?.checked || false;
        }, this.selectors.registerAgreementCheckbox);
    }
    async isLoginPage() {
        const url = await this.getCurrentUrl();
        return url.includes('/login');
    }
    async isRegisterPage() {
        const url = await this.getCurrentUrl();
        return url.includes('/register');
    }
    async isForgotPasswordPage() {
        const url = await this.getCurrentUrl();
        return url.includes('/remind');
    }
    async captureFormState(context) {
        await this.takeScreenshot(`auth-form-${context}`);
    }
}
//# sourceMappingURL=HabrAuthPage.js.map