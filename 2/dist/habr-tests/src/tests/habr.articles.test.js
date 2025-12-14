import { HabrArticlePage } from '../pages/HabrArticlePage';
import { describe, test, expect } from '@jest/globals';
import { HabrMainPage } from '../pages/HabrMainPage';
describe('Habr.com - Тестирование функционала статей', () => {
    let habrPage;
    let articlePage;
    beforeAll(async () => {
        habrPage = new HabrMainPage(page);
        articlePage = new HabrArticlePage(page);
        await habrPage.navigate();
    });
    describe('TC-1: Работа с поиском', () => {
        const testQueries = [
            'TypeScript',
            'React',
            'Docker',
        ];
        testQueries.forEach(query => {
            test(`Поиск по запросу "${query}" возвращает результаты`, async () => {
                await habrPage.searchArticles(query);
                const results = await habrPage.getSearchResults();
                expect(results.length).toBeGreaterThan(0);
                const hasRelevantResult = results.some(article => article.title.toLowerCase().includes(query.toLowerCase()) ||
                    article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())));
                expect(hasRelevantResult).toBe(true);
                await habrPage.takeScreenshot(`search-${query.toLowerCase()}`);
                await habrPage.navigate();
            }, 20000);
        });
    });
    describe('TC-2: Открытие и чтение статей', () => {
        test('Можно открыть первую статью из списка', async () => {
            const articles = await habrPage.getArticlesOnPage();
            expect(articles.length).toBeGreaterThan(0);
            await habrPage.openFirstArticle();
            const isArticleLoaded = await articlePage.isArticleLoaded();
            expect(isArticleLoaded).toBe(true);
            const articleData = await articlePage.getArticleData();
            expect(articleData.title).toBeTruthy();
            expect(articleData.author).toBeTruthy();
            expect(articleData.contentLength).toBeGreaterThan(100);
            await articlePage.takeScreenshot('article-opened');
            await habrPage.navigate();
        }, 15000);
    });
    describe('TC-3: Сортировка и фильтрация', () => {
        test('Сортировка статей по рейтингу', async () => {
            await habrPage.sortArticles('rating');
            const currentUrl = await habrPage.getCurrentUrl();
            expect(currentUrl).toContain('sort=score');
            const articles = await habrPage.getArticlesOnPage();
            for (let i = 0; i < Math.min(5, articles.length - 1); i++) {
                const currentRating = articles[i].rating || 0;
                const nextRating = articles[i + 1].rating || 0;
                if (currentRating > 0 && nextRating > 0) {
                    expect(currentRating).toBeGreaterThanOrEqual(nextRating);
                }
            }
        }, 15000);
        test('Фильтрация статей по времени', async () => {
            await habrPage.filterByTime('week');
            const currentUrl = await habrPage.getCurrentUrl();
            expect(currentUrl).toContain('period=weekly');
            const articlesCount = await habrPage.getArticlesCount();
            expect(articlesCount).toBeGreaterThan(0);
        }, 15000);
    });
});
//# sourceMappingURL=habr.articles.test.js.map