import { Article, SortOption, TimeFilter } from '../types';
import { BasePage } from './BasePage';

export class HabrMainPage extends BasePage {
    public readonly selectors = {
        logo: 'a.tm-header__logo',
        navigation: {
            all: 'a[href="/ru/articles/"]',
            development: 'a[href="/ru/flows/develop/"]', 
            admin:  'a[href="/ru/flows/admin/"]' ,
            design: 'a[href="/ru/flows/design/"]' ,
            management: 'a[href="/ru/flows/management/"]',
            marketing:  'a[href="/ru/flows/marketing/"]'
        },
        searchSelectors: {
            resultsContainer: '.tm-articles-list, .tm-search-results, .search-results',
            resultItem: '.tm-article-snippet',
            resultTitle: '.tm-article-snippet__title',
            resultAuthor: '.tm-user-info__username',
            resultRating: '.tm-votes-meter__value',
            resultTags: '.tm-article-snippet__hubs-item',
            noResults: '.tm-empty-placeholder',
        },
        searchButton: '#app > header > div.tm-page-width > div > button', 
        searchInput: 'input.tm-input-text-decorated__input',
        searchResults: 'h2.tm-title.tm-title_h2',
        searchResultItem: '.tm-articles-list__item',
        searchResultTitle: '.tm-title.tm-title_h2',
        articlesList: '.tm-articles-list',
        articleItem: 'article.tm-articles-list__item',
        articleTitle: 'h2.tm-title a',
        articleAuthor: '.tm-user-info__username',
        articleRating: '.tm-votes-meter__value',
        articleViews: '.tm-icon-counter__value',
        articleTags: '.tm-article-snippet__hubs-item',
        articleTime: 'time.tm-article-snippet__datetime-published',
        sortDropdown: 'button[data-test-id="sort-dropdown"]',
        sortOption: (option: SortOption) => `.tm-navigation-dropdown__item[data-value="${option}"]`,
        timeFilter: (filter: TimeFilter) => {
            const filterMap: Record<TimeFilter, string> = {
                all: 'all',
                day: 'daily',
                week: 'weekly',
                month: 'monthly'
            };
            return `a[data-period="${filterMap[filter]}"]`;
        },
        loginButton: 'a.tm-header-user-menu__item.tm-header-user-menu__login',
        loginButtonSelector: 'a.tm-header-user-menu__item.tm-header-user-menu__login',
        registerButton: 'a.tm-header-user-menu__item[href*="register"]',
        userMenu: '.tm-header-user-menu__dropdown',
        closeAdButton: 'button.tm-popup__close',
        acceptCookies: 'button.cookie-notification__agree',
        loginSelector: 'a.tm-header-user-menu__item.tm-header-user-menu__login',
        searchIconSelector: '[data-test-id="search-button"]',
        searchInputSelector: `.tm-search__input`,
    };

    async navigate(path: string = '/ru/articles/'): Promise<void> {
        const url = `${this.config.baseUrl}${path}`;
        
        try {
            console.log(`Navigating to: ${url}`);
            
            const response = await page.goto(url, {
                waitUntil: 'domcontentloaded', 
                timeout: 30000 
            });
            if (response && response.status() === 404) {
                throw new Error(`404: Page not found at ${url}`);
            }

            const currentUrl = page.url();
            if (!currentUrl.includes(path)) {
                console.warn(`Navigation: Expected to be on ${path}, but got ${currentUrl}`);
            }

            console.log(`✅ Successfully navigated to ${currentUrl}`);
            
            await this.closePopupIfExists();

        } catch (error) {
            console.error(`❌ Navigation to ${url} failed:`, error);
            
            try {
                if (page && !page.isClosed()) {
                    await page.screenshot({ 
                        path: `navigation-error-${Date.now()}.png`, 
                        fullPage: true 
                    });
                }
            } catch (screenshotError) {
                console.warn('⚠️ Could not take a screenshot after navigation failure:', (error as Error).message);
            }
            throw error; 
        }
    }

    async closePopupIfExists(): Promise<void> {
        try {
            await page.waitForSelector(this.selectors.acceptCookies, { timeout: 3000 });
            await this.clickElement(this.selectors.acceptCookies);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.debug('Cookie popup not found or already closed');
        }

        try {
            await page.waitForSelector(this.selectors.closeAdButton, { timeout: 2000 });
            await this.clickElement(this.selectors.closeAdButton);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.debug('Ad popup not found or already closed');
        }
    }

    async isLogoVisible(): Promise<boolean> {
        return this.isElementVisible(this.selectors.logo);
    }

    async isNavigationVisible(): Promise<boolean> {
        return this.isElementVisible('nav');
    }

    async isLoginButtonVisible(): Promise<boolean> {
        try {
            await page.waitForSelector(this.selectors.loginSelector, { 
                visible: true, 
                timeout: 5000 
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    public async isElementVisible(selector: string): Promise<boolean> {
        try {
            const element = await page.waitForSelector(selector, {
                visible: true,
                timeout: 10000 
            });

            if (!element) {
                return false;
            }

            const isVisible = await page.evaluate((el: Element) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);

                return (
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    rect.width > 0 &&
                    rect.height > 0 &&
                    (el as HTMLElement).offsetParent !== null
                );
            }, element);

            return isVisible;
        } catch (error) {
            return false;
        }
    }

    async navigateToSection(section: keyof typeof this.selectors.navigation): Promise<void> {
        console.log(`Ожидаю 1 секунду перед кликом на раздел "${section}"...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Кликаю на раздел "${section}"...`);
        await this.clickElement(this.selectors.navigation[section]);
        console.log(`Жду обновления URL...`);
        await page.waitForFunction(
            (sectionPath) => window.location.href.includes(sectionPath),
            { timeout: 30000 },
            this.selectors.navigation[section]
        );
        console.log(`URL успешно обновлен.`);
    }

    public async openSearch(): Promise<void> {
        console.log('🔍 Открытие поиска...');
        
        const searchUrl = 'https://habr.com/ru/search/';
        
        try {
            await page.goto(searchUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            
            console.log(`✅ Успешно перешли на: ${page.url()}`);
            
            await page.waitForSelector('input[name="q"], input[type="search"]', {
                visible: true,
                timeout: 5000
            });
            
            console.log('✅ Поле поиска готово');
            
        } catch (error) {
            console.error('Ошибка при переходе на страницу поиска:', error);
            throw error;
        }
    }

    async searchArticles(query: string): Promise<void> {
        console.log(`[DEBUG] Открываю поиск...`);
        await this.openSearch();
        console.log(`[DEBUG] Кнопка поиска нажата.`);
        
        console.log(`[DEBUG] Ввожу запрос: ${query}`);
        await this.typeText(this.selectors.searchInput, query);
        console.log(`[DEBUG] Текст введен.`); 
        
        await this.page.keyboard.press('Enter');
        console.log(`[DEBUG] Enter нажат.`);
        
        console.log(`[DEBUG] Жду появления блока с результатами поиска...`);
        await page.waitForSelector(this.selectors.searchResults, { 
            visible: true, 
            timeout: 30000 
        });
        console.log(`[DEBUG] Блок с результатами появился.`);
        
        console.log(`[DEBUG] Жду появления первой статьи в результатах...`);
        await page.waitForSelector(this.selectors.searchResultItem, {
            visible: true,
            timeout: 10000
        });
        console.log(`[DEBUG] Первая статья в результатах появилась.`);
        console.log(`Результаты поиска загружены.`);
    }
    
    public async getSearchResults(): Promise<Article[]> {
        console.log('Начинаю получение результатов поиска...');
        
        try {
            await this.page.waitForSelector('.tm-articles-list__item, [class*="article-preview"], .tm-article-snippet', { 
                timeout: 10000 
            });
            
            const results = await this.page.$$eval('.tm-articles-list__item, [class*="article-preview"], .tm-article-snippet', (items) => {
                return items.map(item => {
                    const titleElement = item.querySelector('.tm-title a, .tm-article-snippet__title a, [class*="title"] a');
                    const title = titleElement?.textContent?.trim() || '';
                    const authorElement = item.querySelector('.tm-user-info__username, .tm-user-info a, [class*="author"]');
                    const author = authorElement?.textContent?.trim() || '';
                    const ratingElement = item.querySelector('.tm-votes-meter__value, [class*="rating"], [class*="vote"]');
                    const ratingText = ratingElement?.textContent?.trim() || '0';
                    const rating = Number(ratingText.replace(/[^\d.-]/g, ''));
                    const tagElements = item.querySelectorAll('.tm-publication-hub__link, [class*="tag"], [class*="hub"]');
                    const tags = Array.from(tagElements).map(tag => tag.textContent?.trim() || '');
                    let link = '';
                    if (titleElement) {
                        const href = titleElement.getAttribute('href');
                        if (href) {
                            link = href.startsWith('http') ? href : 'https://habr.com' + href;
                        }
                    }
                    
                    if (!link) {
                        const linkElement = item.querySelector('a[href*="/articles/"], a[href*="/post/"]');
                        if (linkElement) {
                            const href = linkElement.getAttribute('href');
                            if (href) {
                                link = href.startsWith('http') ? href : 'https://habr.com' + href;
                            }
                        }
                    }
                    
                    return { title, author, rating, tags, link };
                }).filter(article => article.title !== '');  
            });

            console.log(`Найдено статей: ${results.length}`);
            
            if (results.length === 0) {
                const hasNoResults = await this.page.evaluate(() => {
                    const bodyText = document.body.textContent || '';
                    return bodyText.includes('ничего не найдено') || 
                        bodyText.includes('не найдено публикаций') ||
                        bodyText.includes('ничего не нашлось');
                });
                
                if (hasNoResults) {
                    console.log('По запросу ничего не найдено');
                    return [];
                }
                
                console.log('DEBUG: Проверяю содержимое страницы...');
                const html = await this.page.content();
                const hasArticles = html.includes('tm-articles-list__item') || 
                                    html.includes('article-preview') || 
                                    html.includes('tm-article-snippet');
                console.log(`DEBUG: HTML содержит селекторы статей: ${hasArticles}`);
                
                // Делаем скриншот для отладки
                await this.page.screenshot({ path: 'search-debug.png' });
                console.log('DEBUG: Скриншот сохранен как search-debug.png');
            }

            return results;
            
        } catch (error) {
            console.error('Ошибка при получении результатов поиска:', error);
            return [];
        }
    }

    public async getArticlesCount(): Promise<number> {
        console.log('--- ПОДСЧЕТ СТАТЕЙ ---');
        
        try {
            const currentUrl = page.url();
            console.log(`📌 Текущий URL: ${currentUrl}`);
            await page.waitForSelector('body', { timeout: 10000 });
            const selectorsToTry = [
                'article.tm-articles-list__item',  
                '.tm-articles-list__item',        
                '.tm-article-snippet',           
                'article[class*="article"]',      
                '[data-test-id="article-card"]',  
                'article',                    
                '.tm-articles-list > div',       
                '.tm-article-snippet__title',    
            ];
            
            let count = 0;
            let foundSelector = '';
            
            for (const selector of selectorsToTry) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const elements = await page.$$(selector);
                    if (elements.length > 0) {
                        count = elements.length;
                        foundSelector = selector;
                        console.log(`✅ Нашел ${count} элементов по селектору: "${selector}"`);
                        break;
                    }
                } catch (e) {
                    console.log(`Не нашел по селектору: "${selector}"`);
                }
            }
            
            if (count === 0) {
                console.log('⚠️ Не нашел статей ни по одному селектору!');
                
                const pageContent = await page.content();
                const hasArticles = pageContent.includes('article') || 
                                pageContent.includes('tm-article') ||
                                pageContent.includes('публикаци');
                
                if (hasArticles) {
                    console.log('📄 На странице есть контент со статьями, но селекторы не работают');
                }
            }
            
            console.log(`📊 Итого статей: ${count} (селектор: ${foundSelector})`);
            return count;
            
        } catch (error) {
            console.error('❌ Ошибка при подсчете статей:', error);
            return 0;
        }
    }

    async getArticlesOnPage(): Promise<Article[]> {
        console.log('Ожидание загрузки статей...');
        console.log('Текущий URL:', page.url());
        await page.waitForSelector(this.selectors.articleItem, {
            visible: false,
            timeout: 30000
        });
        console.log('Статьи найдены!');
        return page.evaluate((sel) => {
        const articles: Article[] = [];
        const items = document.querySelectorAll(sel.item);
        
        items.forEach(
            item => {
                const titleElement = item.querySelector(sel.title);
                const authorElement = item.querySelector(sel.author);
                const ratingElement = item.querySelector(sel.rating);
                const viewsElement = item.querySelector(sel.views);
                const tagsElements = item.querySelectorAll(sel.tags);
                
                if (titleElement) {
                    articles.push(
                        {
                            title: titleElement.textContent?.trim() || '',
                            link: (titleElement?.getAttribute('href') || ''),
                            author: authorElement?.textContent?.trim() || '',
                            rating: ratingElement ? parseInt(ratingElement.textContent || '0') : undefined,
                            views: viewsElement?.textContent?.trim(),
                            tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
                        }
                    );
                }
            }
        );
        
        return articles;
        }, 
            {
                item: this.selectors.articleItem,
                title: this.selectors.articleTitle,
                author: this.selectors.articleAuthor,
                rating: this.selectors.articleRating,
                views: this.selectors.articleViews,
                tags: this.selectors.articleTags,
            }
        );
    }

    async sortArticles(option: SortOption): Promise<void> {
        await this.clickElement(this.selectors.sortDropdown);
        await this.clickElement(this.selectors.sortOption(option));
        await this.waitForNavigation();
    }

    async filterByTime(filter: TimeFilter): Promise<void> {
        await this.clickElement(this.selectors.timeFilter(filter));
        await this.waitForNavigation();
    }

    async goToLoginPage(): Promise<void> {
        const loginLink = await this.page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            for (const link of links) {
                const text = link.textContent?.trim().toLowerCase();
                const href = link.getAttribute('href');
                
                if ((text && text.includes('войти')) || 
                    (href && href.includes('/login'))) {
                    return {
                        href: link.getAttribute('href'),
                        text: link.textContent
                    };
                }
            }
            return null;
        });

        if (loginLink) {
            await this.page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                for (const link of links) {
                    const text = link.textContent?.trim().toLowerCase();
                    const href = link.getAttribute('href');
                    
                    if ((text && text.includes('войти')) || 
                        (href && href.includes('/login'))) {
                        (link as HTMLElement).click();
                        return;
                    }
                }
            });
            
            await this.waitForNavigation();
            console.log('✅ Successfully navigated to login page by clicking button');
        } else {
            const loginUrl = `${this.config.baseUrl}/ru/auth/login/`;
            console.log(`Navigating to login page: ${loginUrl}`);
            await this.page.goto(loginUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            console.log('✅ Successfully navigated to login page');
        }
    }

    async goToRegisterPage(): Promise<void> {
        const registerUrl = `${this.config.baseUrl}/ru/auth/register/`;
        console.log(`Navigating to register page: ${registerUrl}`);
        await this.page.goto(registerUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        console.log('✅ Successfully navigated to register page');
    }

    async getPageTitle(): Promise<string> {
        return page.title();
    }

    async getCurrentUrl(): Promise<string> {
        return page.url();
    }

    async getHeaderText(): Promise<string> {
        return this.getElementText('h1.tm-section-name__text');
    }

    public async clickElement(selector: string): Promise<void> {
        console.log(`Кликаю по селектору: ${selector}`);
        
        try {
            await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    const event = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                    });
                    element.dispatchEvent(event);
                    return true;
                }
                return false;
            }, selector);
            console.log('✅ Клик выполнен');
        } catch (error) {
            console.error(`❌ Не удалось кликнуть по селектору "${selector}":`, (error as Error).message);
            throw error;
        }
    }

    public async waitForHeaderContent(timeout: number = 10000): Promise<void> {
        console.log('⏳ Ожидаю, пока заголовок раздела не станет пустым...');
        
        try {
            await page.waitForFunction(
                () => {
                    const headerElement = document.querySelector('h1.tm-section-name__text');
                    return headerElement && headerElement.textContent && headerElement.textContent.trim().length > 0;
                },
                { timeout }
            );
            console.log('✅ Заголовок раздела содержит текст.');
        } catch (error) {
            console.error('❌ Заголовок раздела так и не стал содержать текст за отведенное время.', error);
            throw error;
        }
    }

    async getFirstArticleData() {
        try {
            const firstArticle = await this.page.$(`${this.selectors.articleItem}:first-child`);
            
            if (!firstArticle) {
                throw new Error('Первая статья не найдена');
            }

            const title = await firstArticle.$eval(
                'h2 a, h3 a, a.tm-title__link',
                el => el.textContent?.trim() || ''
            ).catch(() => 'Без заголовка');
            
            const link = await firstArticle.$eval(
                'h2 a, h3 a, a.tm-title__link',
                el => el.href
            ).catch(() => '');
            
            const author = await firstArticle.$eval(
                '.tm-user-info__username, .tm-user-info__user, [data-test-id="article-author"]',
                el => el.textContent?.trim() || ''
            ).catch(() => 'Неизвестен');

            return { title, link, author };
        } catch (error) {
            console.error('Ошибка при получении данных первой статьи:', error);
            throw error;
        }
    }

}