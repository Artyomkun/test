import { BasePage } from './BasePage';
import { Page } from 'puppeteer';
import { User } from '../types';

export class HabrAuthPage extends BasePage {
    public readonly selectors = {
        loginForm: 'form#ident-form',
        emailInput: 'input[name="email"][form="ident-form"]',
        passwordInput: 'input[name="password"]',
        rememberMeCheckbox: '.form__remind-password-link',
        submitButton: 'button[type="submit"][form="ident-form"]',
        registerForm: '.tm-sign-form',
        registerButton: 'a.tm-header-user-menu__register', 
        registerEmailInput: 'input[name="email"]',
        registerPasswordInput: 'input[name="password1"]',
        registerConfirmPasswordInput: 'input[name="password2"]',
        registerAgreementCheckbox: 'input[name="agree"]',
        registerPolicyCheckbox: 'input[name="cplcy"]', 
        registerNicknameInput: 'input[name="nickname"]',
        registerPasswordConfirmInput: 'input[name="password2"]', 
        registerSubmitButton: 'button.button.button_wide.button_primary',
        loginButtonSelector: 'a.tm-header-user-menu__item[href*="login"]',
        socialButtons: {
            vk: 'a.tm-sign-form__oauth-button_vk',
            google: 'a.tm-sign-form__oauth-button_google',
            github: 'a.tm-sign-form__oauth-button_github',
            yandex: 'a.tm-sign-form__oauth-button_yandex',
        },
        register : {
            registerEmailInput: 'input[name="email"]',
            registerNicknameInput: 'input[name="nickname"]',
            registerPasswordInput: 'input[name="password1"]',      // ← ИЗМЕНИТЬ
            registerPasswordConfirmInput: 'input[name="password2"]', // ← ДОБАВИТЬ
            registerSubmitButton: 'button.button.button_wide.button_primary',
            registerAgreementCheckbox: 'input[name="agree"]',
            registerPolicyCheckbox: 'input[name="cplcy"]'  
        },    
        forgotPasswordLink: 'a.form__remind-password-link',
        registerLink: 'a.form-additional-message__link[href*="register"]',
        loginLink: 'a.form-additional-message__link[href*="login"]',
        passwordRecoveryForm: 'form#password-recovery-form',  
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

    constructor(page: Page) {
        super(page);
    }

    async navigate(path?: string): Promise<void> {
        if (path === 'register') {
            await this.navigateToRegister();
        } else {
            await this.navigateToLogin();
        }
    }

    async navigateToLogin(): Promise<void> {
        await this.page.goto(`${this.config.baseUrl}/ru/auth/login/`, {
                waitUntil: 'networkidle2',
                timeout: 60000
            }
        );
        await this.waitForLoginForm();
    }

    async navigateToRegister(): Promise<void> {
        console.log('🚀 Начинаю навигацию к странице регистрации...');

        try {
            console.log('📍 Шаг 1: Переход на страницу входа');
            await this.navigateToLogin();
            await this.delay(1000); 

            console.log('📍 Шаг 2: Переход к форме регистрации');
            await this.goToRegisterFromLogin();

            console.log('📍 Шаг 3: Ожидание загрузки формы регистрации');
            await this.delay(2000); 

            console.log('✅ Регистрация успешно загружена. URL:', this.page.url());

        } catch (error) {
            console.error('❌ Ошибка навигации к регистрации:', (error as Error).message);
            console.error('📊 Детали ошибки:', error);

            throw error;
        }
    }

    async waitForLoginForm(): Promise<void> {
        await this.waitForElement(this.selectors.emailInput , {
            timeout: 120000,
            visible: false
        });
    }


    async waitForPasswordRecoveryForm(): Promise<void> {
        try {
            console.log('⏳ Жду загрузку формы восстановления пароля...');
            
            await this.page.waitForSelector('input[name="email"]', {
                timeout: 15000,
                visible: true
            });
            
            console.log('✅ Поле email для восстановления найдено');
            
            const hasButton = await this.page.$('button.button.button_wide.button_primary');
            console.log(`✅ Кнопка "Далее": ${hasButton ? 'найдена' : 'не найдена'}`);
            
            const hasCaptcha = await this.page.$('.CheckboxCaptcha-Button');
            console.log(`🛡️ Капча на странице: ${hasCaptcha ? 'да' : 'нет'}`);
            
            console.log('✅ Форма восстановления пароля загружена');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки формы восстановления:', error);
            throw error;
        }
    }

    async isLoginFormVisible(): Promise<boolean> {
        return this.isElementVisible(this.selectors.loginForm);
    }

    async isRegisterFormVisible(): Promise<boolean> {
        return this.isElementVisible(this.selectors.registerForm);
    }

    async fillLoginForm(email: string, password: string, rememberMe: boolean = false): Promise<void> {
        await this.typeText(this.selectors.emailInput, email);
        await this.typeText(this.selectors.passwordInput, password);
        
        if (rememberMe) {
            await this.clickElement(this.selectors.rememberMeCheckbox);
        }
    }

    async submitLoginForm(): Promise<void> {
        await this.clickElement(this.selectors.submitButton);
        await this.waitForNavigation();
    }

    async login(user: User): Promise<void> {
        await this.fillLoginForm(user.email, user.password);
        await this.submitLoginForm();
    }

    async loginWithRememberMe(user: User): Promise<void> {
        await this.fillLoginForm(user.email, user.password, true);
        await this.submitLoginForm();
    }

    async safeClickWithRetry(selector: string, maxRetries: number = 2): Promise<void> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (this.page.isClosed()) {
                    throw new Error('Page is closed');
                }
                
                await this.page.waitForSelector(selector, {
                    timeout: 3000,
                    visible: true
                });
                
                await this.clickElement(selector);
                return; 
                
            } catch (error) {
                console.log(`⚠️ Попытка ${attempt}/${maxRetries} клика на ${selector} не удалась:`, (error as Error).message);
                
                if (attempt === maxRetries) {
                    throw error; 
                }
                
                await this.delay(1000);
            }
        }
    }
    async safeClickElement(selector: string): Promise<void> {
        try {
            if (this.page.isClosed()) {
                throw new Error('Page is closed');
            }
            
            await this.page.waitForSelector(selector, { 
                timeout: 5000,
                visible: true 
            });
            
            await this.clickElement(selector);
            
        } catch (error) {
            console.error(`❌ Ошибка при клике на ${selector}:`, (error as Error).message);
            throw error;
        }
    }

    async submitRegisterForm(): Promise<void> {
        try {
            const submitButton = await this.page.$(this.selectors.registerSubmitButton);
            
            if (!submitButton) {
                throw new Error(`Кнопка отправки не найдена: ${this.selectors.registerSubmitButton}`);
            }
            
            console.log('Нажимаем кнопку регистрации...');
            await submitButton.evaluate(btn => (btn as HTMLElement).click());
            
            try {
                await this.page.waitForNavigation({ 
                    waitUntil: 'networkidle0', 
                    timeout: 10000 
                });
            } catch (navError) {
                console.log('Навигация не произошла, продолжаем...');
            }
            
        } catch (error) {
            console.error('Ошибка при отправке формы регистрации:', error);
            
            if ((error as Error).message.includes('Target closed') || (error as Error).message.includes('Protocol error')) {
                console.warn('Браузер был закрыт, перезагружаем страницу...');
                await this.page.reload();
                throw new Error('Браузер перезагружен из-за ошибки');
            }
            
            throw error;
        }
    }

    async register(): Promise<void> {
        await this.submitRegisterForm();
    }

    async submitEmptyLoginForm(): Promise<void> {
        await this.clickElement(this.selectors.submitButton);
    }

    async submitEmptyRegisterForm(): Promise<void> {
        await this.clickElement(this.selectors.registerSubmitButton);
    }

    async getValidationErrors(): Promise<string[]> {
        const fieldInfo = await this.page.evaluate(() => {
            const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
            const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;

            return {
                email: {
                    required: emailInput?.hasAttribute('required'),
                    value: emailInput?.value || '',
                    validity: emailInput?.validity
                },
                password: {
                    required: passwordInput?.hasAttribute('required'),
                    value: passwordInput?.value || '',
                    validity: passwordInput?.validity
                }
            };
        });

        const validationErrors = [];
        if (fieldInfo.email.required && fieldInfo.email.validity && !fieldInfo.email.validity.valid) {
            if (fieldInfo.email.validity.valueMissing) {
                validationErrors.push('Email is required');
            }
        }
        if (fieldInfo.password.required && fieldInfo.password.validity && !fieldInfo.password.validity.valid) {
            if (fieldInfo.password.validity.valueMissing) {
                validationErrors.push('Password is required');
            }
        }

        return validationErrors;
    }

    async getSpecificValidationError(field: keyof typeof this.selectors.validationErrors): Promise<string> {
        try {
            await this.page.waitForSelector(this.selectors.validationErrors[field], { timeout: 2000 });
            return this.getElementText(this.selectors.validationErrors[field]);
        } catch {
            return '';
        }
    }

    async hasValidationErrors(): Promise<boolean> {
        try {
            console.log('🔍 Ищу ошибки валидации...');
            
            const errorSelectors = [
                '.error', '.form__error', '[role="alert"]',
                '.invalid', '.is-error', '.field-error',
                '.text-danger', '.validation-error',
                '[aria-invalid="true"]', '.has-error',
                '.form__field--error', '.input-error',
                'input:invalid', 'input.is-invalid'
            ];
            
            for (const selector of errorSelectors) {
                try {
                    const element = await this.page.waitForSelector(selector, {
                        timeout: 1000,  
                        visible: true
                    });
                    
                    if (element) {
                        const errorText = await this.page.$eval(
                            selector, 
                            el => el.textContent?.trim() || ''
                        );
                        console.log(`✅ Найдена ошибка (${selector}): "${errorText}"`);
                        return true;
                    }
                } catch {
                    continue;
                }
            }
            
            console.log('❌ Не найдено ни одной ошибки');
            return false;
            
        } catch (error) {
            console.log('⚠️ Ошибка в hasValidationErrors:', (error as Error).message);
            return false;
        }
    }

    async getAgreementError(): Promise<string> {
        try {
            const error = await this.page.$eval(
                `${this.selectors.registerAgreementCheckbox} ~ .error, 
                ${this.selectors.registerAgreementCheckbox} ~ .form__error,
                [for*="agree"] .error`,
                el => el.textContent?.trim() || ''
            );
            return error;
        } catch {
            return '';
        }
    }


    async goToForgotPassword(): Promise<void> {
        await this.clickElement(this.selectors.forgotPasswordLink);
        await this.waitForNavigation();
    }

    async goToRegisterFromLogin(): Promise<void> {
        try {
            console.log('🔍 Клик с предварительным ожиданием навигации...');
            
            const selector = this.selectors.registerLink;
            const navigationPromise = this.page.waitForNavigation({
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            
            await this.page.evaluate((sel) => {
                const link = document.querySelector(sel);
                if (link) (link as HTMLElement).click();
            }, selector);
            
            console.log('✅ Клик выполнен');
            
            await navigationPromise;
            console.log('✅ Навигация завершена');
            
            await this.page.waitForSelector('input[name="email"]', {
                timeout: 15000,
                visible: true
            });
            
            console.log('✅ Форма регистрации загружена');
            
        } catch (error) {
            console.error('❌ Ошибка при переходе к регистрации:', error);
            throw error;
        }
    }

    async goToLoginFromRegister(): Promise<void> {
        await this.clickElement(this.selectors.loginLink);
        await this.waitForNavigation();
    }

    async goBackToMain(): Promise<void> {
        await this.clickElement(this.selectors.backToMainLink);
        await this.waitForNavigation();
    }

    async isSocialLoginAvailable(): Promise<boolean> {
        const socialButtons = [
            this.selectors.socialButtons.vk,
            this.selectors.socialButtons.google,
            this.selectors.socialButtons.github,
        ];

        for (const selector of socialButtons) {
            const isVisible = await this.isElementVisible(selector);
            if (isVisible) return true;
        }
        
        return false;
    }

    async clickSocialButton(provider: keyof typeof this.selectors.socialButtons): Promise<void> {
        await this.clickElement(this.selectors.socialButtons[provider]);
        await this.delay(3000);
    }

    async isCaptchaPresent(): Promise<boolean> {
        try {
            await this.page.waitForSelector(this.selectors.captchaContainer, { timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }

    async getCaptchaIframeSrc(): Promise<string> {
        if (await this.isCaptchaPresent()) {
            return this.getElementAttribute(this.selectors.captchaIframe, 'src');
        }
        return '';
    }

    async getPasswordFieldType(field: 'login' | 'register' = 'login'): Promise<string> {
        const selector = field === 'login' 
            ? this.selectors.passwordInput 
                : this.selectors.registerPasswordInput;
        
        return this.getElementAttribute(selector, 'type');
    }

    async getSuccessMessage(): Promise<string> {
        try {
            await this.page.waitForSelector(this.selectors.successMessage, { timeout: 3000 });
            return this.getElementText(this.selectors.successMessage);
        } catch {
            return '';
        }
    }

    async isSuccessMessageVisible(): Promise<boolean> {
        return this.isElementVisible(this.selectors.successMessage);
    }

    async testInvalidLoginScenarios(): Promise<Array<{scenario: string, hasError: boolean}>> {
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

    async getFormTitle(): Promise<string> {
        return this.getElementText('.shadow-box__title');
    }

    async getFormDescription(): Promise<string> {
        return this.getElementText('.tm-sign-form__description');
    }

    async clearFormFields(form: 'login' | 'register'): Promise<void> {
        if (form === 'login') {
            await this.clearField(this.selectors.emailInput);
            await this.clearField(this.selectors.passwordInput);
        } else {
            await this.clearField(this.selectors.registerEmailInput);
            await this.clearField(this.selectors.registerPasswordInput);
            await this.clearField(this.selectors.registerConfirmPasswordInput);
        }
    }

    private async clearField(selector: string): Promise<void> {
        await this.page.evaluate((sel: string) => {
                const element = document.querySelector(sel) as HTMLInputElement;
                if (element) {
                    element.value = '';
                    element.dispatchEvent(
                        new Event(
                            'input', { 
                                bubbles: true 
                            }
                        )
                    );
                }
            }, selector
        );
    }

    async isRememberMeChecked(): Promise<boolean> {
        return this.page.evaluate((selector: string) => {
                const element = document.querySelector(selector) as HTMLInputElement;
                return element?.checked || false;
            }, this.selectors.rememberMeCheckbox
        );
    }

    async isAgreementChecked(): Promise<boolean> {
        return this.page.evaluate((selector: string) => {
                const element = document.querySelector(selector) as HTMLInputElement;
                return element?.checked || false;
            }, this.selectors.registerAgreementCheckbox
        );
    }

    async isLoginPage(): Promise<boolean> {
        const url = await this.getCurrentUrl();
        return url.includes('/login');
    }

    async isRegisterPage(): Promise<boolean> {
        const url = await this.getCurrentUrl();
        return url.includes('/register');
    }

    async isForgotPasswordPage(): Promise<boolean> {
        const url = await this.getCurrentUrl();
        return url.includes('/remind');
    }

}