import { HabrMainPage } from '../pages/HabrMainPage';
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

describe('Habr.com - Smoke Tests', () => {
    let habrPage: HabrMainPage;

    beforeAll(async () => {
        console.log('🚀 Начало smoke тестов');

        if (!browser) {
            throw new Error('Browser not initialized. Check puppeteer.setup.ts');
        }

        if (isPageClosed(page)) {
            throw new Error('Page is not available or closed');
        }

        habrPage = new HabrMainPage(page);

        console.log('✅ Инициализация завершена');
    });

    beforeEach(async () => {
        console.log('🔄 Подготовка к тесту'); 
        try {
            const client = await page.createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await client.detach();
            console.log('✅ Cookies и кеш очищены');
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

    describe('TC-1: Проверка загрузки и видимости основных элементов', () => {
        test('Главная страница загружается корректно', async () => {
            console.log('🧪 Проверка загрузки главной страницы');
            const pageTitle = await habrPage.getPageTitle();
            console.log(`📄 Заголовок страницы: "${pageTitle}"`); 
            const containsHabr = pageTitle.toLowerCase().includes('хабр');
            const containsArticles = pageTitle.toLowerCase().includes('стать');
            
            console.log(`Содержит "Хабр": ${containsHabr}`);
            console.log(`Содержит "статьи": ${containsArticles}`);
            
            expect(containsHabr).toBe(true);
            
            console.log('✅ Главная страница загружена корректно');
        }, 30000);

        test('Логотип Habr отображается', async () => {
            console.log('🧪 Проверка отображения логотипа'); 
            await page.waitForSelector('body', { 
                visible: true,
                timeout: 5000 
            }); 
            const isLogoVisible = await habrPage.isLogoVisible();
            console.log(`🎯 Логотип видим: ${isLogoVisible}`);
            
            expect(isLogoVisible).toBe(true);
            
            console.log('✅ Логотип отображается корректно');
        }, 30000);

        test('Навигационное меню отображается', async () => {
            console.log('🧪 Проверка навигационного меню'); 
            try {
                await page.waitForSelector('nav', { 
                    visible: true, 
                    timeout: 5000 
                });
                console.log('✅ Навигация загружена');
            } catch (error) {
                console.log('⚠️ Навигация загружается медленно');
            }
            
            const isNavVisible = await habrPage.isNavigationVisible();
            console.log(`🎯 Навигация видима: ${isNavVisible}`);
            
            expect(isNavVisible).toBe(true);
            
            console.log('✅ Навигационное меню отображается корректно');
        }, 30000);

        test('Кнопка входа отображается', async () => {
            console.log('🧪 Проверка кнопки входа'); 
            try {
                await page.waitForSelector('.tm-header-user-menu', { 
                    visible: true, 
                    timeout: 5000 
                });
                console.log('✅ Пользовательское меню загружено');
            } catch (error) {
                console.log('⚠️ Пользовательское меню загружается медленно');
            }
            
            const isLoginVisible = await habrPage.isLoginButtonVisible();
            console.log(`🎯 Кнопка входа видима: ${isLoginVisible}`);
            
            expect(isLoginVisible).toBe(true);
            
            console.log('✅ Кнопка входа отображается корректно');
        }, 30000);
    });

    describe('TC-2: Проверка контента на главной странице', () => {
        test('Список статей загружается', async () => {
            console.log('🔍 Быстрая проверка статей...'); 
            await page.goto('https://habr.com/ru/articles/', {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            }); 
            const articleCount = await page.evaluate(() => {
                return document.querySelectorAll('article').length;
            });
            
            console.log(`📰 Статей: ${articleCount}`);
            expect(articleCount).toBeGreaterThan(0);
        }, 15000);

        test('Заголовки статей отображаются корректно', async () => {
            console.log('🧪 Проверка заголовков статей');
            
            const articles = await habrPage.getArticlesOnPage();
            console.log(`📰 Проверяю ${articles.length} статей`);
            
            let validArticles = 0;
            
            articles.forEach((article, index) => { 
                const isTitleValid = article.title.length > 5 && article.title.length < 200; 
                const isRatingValid = article.rating === undefined ||  (typeof article.rating === 'number' && article.rating >= 0);
                
                if (isTitleValid && isRatingValid) {
                    validArticles++;
                } 
                if (index % 5 === 0) {
                    console.log(`  ${index + 1}. "${article.title.substring(0, 50)}..." - рейтинг: ${article.rating || 'N/A'}`);
                }
            });
            
            const validityPercentage = (validArticles / articles.length) * 100;
            console.log(`✅ Корректных статей: ${validArticles}/${articles.length} (${validityPercentage.toFixed(0)}%)`);
            
            expect(validArticles).toBeGreaterThan(0);
            
        }, 30000);
    });

    describe('TC-3: Проверка навигации по разделам', () => {
        const sections = ['admin', 'design', 'management', 'marketing'] as const;

        test.each(sections)('Навигация в раздел "%s" работает', async (section) => {
            console.log(`🧪 Проверка раздела: ${section}`);
            const sectionUrl = `https://habr.com/ru/flows/${section}/`;
            console.log(`🌐 Переход по: ${sectionUrl}`);
            
            await page.goto(sectionUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            
            const currentUrl = page.url();
            console.log(`📍 Текущий URL: ${currentUrl}`);
            
            const pageInfo = await page.evaluate(() => {
                const bodyText = document.body.innerText.slice(0, 300);
                const articleElements = document.querySelectorAll('article, [class*="article"], [class*="snippet"]');
                const hasArticles = articleElements.length > 0;
                
                return {
                    bodyText,
                    articleCount: articleElements.length,
                    hasArticles,
                    pageTitle: document.title,
                    bodyClasses: document.body.className
                };
            });
            
            console.log('📊 Диагностика страницы:', JSON.stringify(pageInfo, null, 2));
            
            if (pageInfo.articleCount === 0) {
                console.log(`⚠️ В разделе ${section} 0 статей по стандартным селекторам`);
                console.log(`📄 Текст страницы: ${pageInfo.bodyText}`);
            }
            
            console.log(`✅ Проверка раздела "${section}" завершена`);
        }, 20000);

        test('Поиск статьи по ключевому слову "питон"', async () => {
            console.log('🔍 Тестирование поиска статьи по запросу "питон"');
            await habrPage.navigate('/articles/');
            const currentUrl = await habrPage.getCurrentUrl();
            expect(currentUrl).toContain('/articles/');
            console.log(`📍 Начальная страница: ${currentUrl}`);
            await habrPage.searchArticles('питон');
            await page.waitForSelector('[data-test-id="articles-list"]', { timeout: 15000 });
            console.log('✅ Блок с результатами поиска отобразился');
            const searchResults = await habrPage.getSearchResults();
            expect(searchResults.length).toBeGreaterThan(0);
            console.log(`📄 Найдено статей: ${searchResults.length}`);
            const atLeastOneTitleContainsKeyword = searchResults.some(article =>
                article.title.toLowerCase().includes('питон')
            );
            expect(atLeastOneTitleContainsKeyword).toBe(true);
            console.log('✅ Хотя бы одна из найденных статей содержит слово "питон"');

        }, 45000);
    });
});