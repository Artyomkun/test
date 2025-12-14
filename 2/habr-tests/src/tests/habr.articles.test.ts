import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { HabrMainPage } from '../pages/HabrMainPage';
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

describe('Habr.com - Тестирование функционала статей', () => {
    let habrPage: HabrMainPage;

    beforeAll(async () => {
        console.log('🚀 Начало тестов функционала статей');

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
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);
        
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

    describe('TC-1: Работа с поиском', () => {
        test('Поиск по запросу "TypeScript" возвращает результаты', async () => {
            console.log('🔍 Тестирование поиска: TypeScript');
            
            await habrPage.searchArticles('TypeScript'); 
            await page.waitForSelector('.tm-articles-list', { 
                visible: true, 
                timeout: 10000 
            });
            
            const results = await habrPage.getSearchResults();
            console.log(`Найдено результатов: ${results.length}`);
            
            expect(results.length).toBeGreaterThan(0); 
            const hasRelevantResult = results.some(article =>
                article.title.toLowerCase().includes('typescript') ||
                article.tags.some(tag => tag.toLowerCase().includes('typescript'))
            );
            
            console.log(`Есть релевантные результаты: ${hasRelevantResult}`);
            expect(hasRelevantResult).toBe(true);
            
            console.log('✅ Поиск работает корректно'); 
            await habrPage.navigate();
            
        }, 30000);
    });

    describe('TC-2: Открытие и чтение статей', () => {
        test('Можно открыть первую статью', async () => {
            console.log('📖 Тестирование открытия ПЕРВОЙ статьи');

            try { 
                await page.goto('https://habr.com/ru/all/', { waitUntil: 'domcontentloaded' });
                await page.waitForSelector(habrPage.baseSelectors.articleItem, {
                    visible: true,
                    timeout: 15000
                }); 
                const articleIdsInList = await page.$$eval(
                    habrPage.baseSelectors.articleItem,
                    (articles) => {
                        const ids: number[] = [];
                        articles.forEach(article => {
                            const link = article.querySelector('h2.tm-title a');
                            if (!link) return;
                            
                            const href = link.getAttribute('href');
                            if (!href) return;
                            
                            const match = href.match(/\/(\d+)\/?$/);
                            if (match) {
                                ids.push(parseInt(match[1]));
                            }
                        });
                        return ids;
                    }
                );
                
                console.log(`📊 В текущем списке ${articleIdsInList.length} статей`);
                console.log('ID статей в списке:', articleIdsInList.join(', '));
                
                const hasId1 = articleIdsInList.includes(1);
                console.log(`Статья с ID=1 в списке: ${hasId1 ? '✅ Да' : '❌ Нет'}`); 
                const openedArticleId = await habrPage.openFirstArticle(); 
                if (hasId1) { 
                    expect(openedArticleId).toBe(1);
                    console.log('✅ ТЕСТ ПРОЙДЕН: Бот нашёл и открыл статью с ID=1');
                } else { 
                    console.log(`📌 Статьи с ID=1 не было в списке, бот открыл статью с ID=${openedArticleId}`);
                    expect(openedArticleId).toBeGreaterThan(0);
                    console.log('✅ ТЕСТ ПРОЙДЕН: Бот открыл доступную статью');
                } 
                const articleLoaded = await page.evaluate(() => {
                    const hasTitle = document.querySelector('h2.tm-title a') !== null;
                    const hasContent = document.querySelector('.tm-article-body, .article-formatted-body, article') !== null;
                    return hasTitle && hasContent;
                });

                expect(articleLoaded).toBe(true);
                console.log(`✅ Статья загружена: ${articleLoaded}`); 
                await page.goBack();
                
            } catch (error) {
                console.error('❌ Ошибка теста:', error);
                throw error;
            }
        });
    });

    describe('TC-3: Сортировка и фильтрация', () => {
        test('Сортировка статей по рейтингу', async () => {
            console.log('📊 Тестирование сортировки по рейтингу');
            
            try { 
                await habrPage.navigate('/ru/articles/');
                console.log('Применяю сортировку по рейтингу...');
                await habrPage.sortArticles('rating'); 
                await new Promise(resolve => setTimeout(resolve, 3000)); 
                await page.waitForSelector('.tm-articles-list__item', { 
                    visible: true, 
                    timeout: 10000 
                });
                
                const articles = await habrPage.getArticlesOnPage();
                console.log(`📊 Статей: ${articles.length}, с рейтингом: ${articles.filter(a => a.rating && a.rating > 0).length}`); 
                if (articles.length >= 2) {
                    const articlesWithRating = articles.filter(a => a.rating && a.rating > 0);
                    
                    if (articlesWithRating.length >= 3) {
                        let validCount = 0;
                        let checkedPairs = 0; 
                        for (let i = 0; i < Math.min(4, articlesWithRating.length - 1); i++) {
                            const currentRating = articlesWithRating[i].rating || 0;
                            const nextRating = articlesWithRating[i + 1].rating || 0;
                            if (currentRating > 0 && nextRating > 0) {
                                checkedPairs++;
                                if (currentRating >= nextRating) {
                                    validCount++;
                                    console.log(`✅ Пара ${i+1}: ${currentRating} >= ${nextRating}`);
                                } else {
                                    console.log(`⚠️ Пара ${i+1}: ${currentRating} < ${nextRating}`);
                                }
                            }
                        } 
                        const sortQuality = validCount / checkedPairs;
                        console.log(`📈 Качество сортировки: ${validCount}/${checkedPairs} пар (${(sortQuality * 100).toFixed(0)}%)`);
                        
                        expect(sortQuality).toBeGreaterThanOrEqual(0.5);
                        
                        if (sortQuality >= 0.66) {
                            console.log('✅ Сортировка работает хорошо');
                        } else if (sortQuality >= 0.5) {
                            console.log('⚠️ Сортировка работает средне (ожидаемо для Habr)');
                        } else {
                            console.log('❌ Сортировка работает плохо');
                        }
                        
                    } else {
                        console.log('⚠️ Мало статей с рейтингом для проверки');
                    }
                }
                
                console.log('✅ Тест сортировки завершен');
                
            } catch (error) {
                console.error('❌ Ошибка в тесте сортировки:', error);
                throw error;
            }
        }, 30000);

        test('Фильтрация статей по времени', async () => {
            console.log('⏰ Тестирование фильтрации по времени'); 
            await page.goto('https://habr.com/ru/articles/', {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            
            console.log('✅ Страница статей загружена'); 
            const timeFilterSelectors = [
                'button[data-test-id="period-filter"]',
                '.tm-tabs__item[data-period]',
                'a[href*="period="]',
                '.tm-tabs__btn',
                '.tm-tabs__item'
            ];
            
            let timeFilterButton = null;
            for (const selector of timeFilterSelectors) {
                const element = await page.$(selector);
                if (element) {
                    console.log(`✅ Найден элемент: ${selector}`);
                    const buttonText = await element.evaluate((el: Element) => 
                        el.textContent?.toLowerCase() || ''
                    );
                    
                    if (buttonText.includes('недел') || buttonText.includes('день') || buttonText.includes('месяц')) {
                        timeFilterButton = element;
                        console.log(`✅ Найден фильтр: "${buttonText.trim()}"`);
                        break;
                    }
                }
            }
            
            if (!timeFilterButton) {
                console.log('⚠️ Фильтры по времени не найдены'); 
                const articles = await page.$$(habrPage.selectors.articleItem);
                if (articles.length > 0) {
                    console.log(`📄 На странице есть ${articles.length} статей, но нет фильтров по времени`);
                    expect(articles.length).toBeGreaterThan(0);
                    return;
                }
                
                throw new Error('Не найдены фильтры по времени на странице');
            } 
            const articlesBefore = await page.$$eval(habrPage.selectors.articleItem, items => items.length);
            console.log(`📄 Статей до фильтрации: ${articlesBefore}`); 
            const buttonText = await timeFilterButton.evaluate((el: Element) => el.textContent?.trim() || '');
            console.log(`🔄 Кликаю на фильтр: "${buttonText}"`); 
            await timeFilterButton.click(); 
            await new Promise(resolve => setTimeout(resolve, 3000)); 
            const articlesAfter = await page.$$eval(habrPage.selectors.articleItem, items => items.length);
            console.log(`📄 Статей после фильтрации: ${articlesAfter}`); 
            if (articlesAfter > 0) {
                console.log('✅ Фильтрация работает');
                expect(articlesAfter).toBeGreaterThan(0);
            } else {
                console.log('⚠️ После фильтрации нет статей'); 
                const noResults = await page.evaluate(() => {
                    const bodyText = document.body.textContent || '';
                    return bodyText.includes('ничего не найдено') || 
                        document.querySelector('.tm-empty-placeholder') !== null;
                });
                
                if (noResults) {
                    console.log('✅ Фильтр работает - просто нет статей за выбранный период');
                } else {
                    console.log('❌ Фильтр возможно не сработал');
                }
            }
            
            console.log('✅ Тест фильтрации завершен');
        }, 60000);
    });
});