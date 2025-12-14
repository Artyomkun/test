import { HabrMainPage } from '../pages/HabrMainPage';
import { describe, test, expect } from '@jest/globals';
describe('Habr.com - Smoke Tests', () => {
    let habrPage;
    beforeAll(async () => {
        habrPage = new HabrMainPage(page);
        await habrPage.navigate();
    });
    describe('TC-1: Проверка загрузки и видимости основных элементов', () => {
        test('Главная страница загружается корректно', async () => {
            const pageTitle = await habrPage.getPageTitle();
            expect(pageTitle).toContain('Habr');
            expect(pageTitle).toContain('Все потоки');
        });
        test('Логотип Habr отображается', async () => {
            const isLogoVisible = await habrPage.isLogoVisible();
            expect(isLogoVisible).toBe(true);
            await habrPage.takeScreenshot('logo-visible');
        });
        test('Навигационное меню отображается', async () => {
            const isNavVisible = await habrPage.isNavigationVisible();
            expect(isNavVisible).toBe(true);
        });
        test('Кнопка входа отображается', async () => {
            const isLoginVisible = await habrPage.isLoginButtonVisible();
            expect(isLoginVisible).toBe(true);
        });
    });
    describe('TC-2: Проверка контента на главной странице', () => {
        test('Список статей загружается', async () => {
            const articlesCount = await habrPage.getArticlesCount();
            expect(articlesCount).toBeGreaterThan(0);
            console.log(`Найдено статей: ${articlesCount}`);
        });
        test('Статьи содержат основные элементы', async () => {
            const articles = await habrPage.getArticlesOnPage();
            const firstArticle = articles[0];
            expect(firstArticle).toBeDefined();
            expect(firstArticle.title).toBeTruthy();
            expect(firstArticle.author).toBeTruthy();
            expect(firstArticle.link).toContain('habr.com');
            expect(firstArticle.tags.length).toBeGreaterThan(0);
        });
        test('Заголовки статей отображаются корректно', async () => {
            const articles = await habrPage.getArticlesOnPage();
            articles.forEach((article) => {
                expect(article.title.length).toBeGreaterThan(5);
                expect(article.title.length).toBeLessThan(200);
                if (article.rating !== undefined) {
                    expect(typeof article.rating).toBe('number');
                }
            });
        });
    });
    describe('TC-3: Проверка навигации по разделам', () => {
        const sections = ['development', 'admin', 'design', 'management', 'marketing'];
        sections.forEach(section => {
            test(`Навигация в раздел "${section}" работает`, async () => {
                await habrPage.navigateToSection(section);
                const currentUrl = await habrPage.getCurrentUrl();
                expect(currentUrl).toContain(section);
                const headerText = await habrPage.getHeaderText();
                expect(headerText).toBeTruthy();
                await habrPage.navigate();
            }, 15000);
        });
    });
});
//# sourceMappingURL=habr.smoke.test.js.map