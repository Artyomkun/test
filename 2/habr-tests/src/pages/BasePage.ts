import { Page, ElementHandle } from 'puppeteer';
import { TestConfig } from '../types';

export function isPageClosed(page: Page | undefined): boolean {
    if (!page) {
        return true;
    }
    
    try {
        page.url();
        return false;
    } catch (error) {
        return true;
    }
}

export abstract class BasePage {
    public readonly baseSelectors = {
        articleItem: `
            article.tm-articles-list__item,
            .tm-articles-list__item,
            [data-test-id="article-snippet"],
            article[data-test-id],
            .tm-article-snippet,
            article,
            .tm-articles-list > div,
            [class*="article-snippet"],
            [class*="article-item"]
        `.replace(/\s+/g, ' ').trim(), 
        articlesList: '.tm-articles-list',
        articleTitle: 'h2.tm-title a',
        articleAuthor: '.tm-user-info__username',
        articleRating: '.tm-votes-meter__value',
        articleViews: '.tm-icon-counter__value',
        articleTags: '.tm-article-snippet__hubs-item',
        articleTime: 'time.tm-article-snippet__datetime-published',
        searchResults: '.tm-articles-list, [data-test-id="articles-list"]',
        searchResultItem: '.tm-articles-list__item, [data-test-id="article-snippet"]',
        searchResultTitle: '[data-test-id="article-snippet-title-link"], .tm-title__link',
        title: 'h1.tm-article-snippet__title, h1, [data-test-id="article-title"]',
        content: '.tm-article-body, .article-formatted-body',
        author: '.tm-user-info__username, [data-test-id="article-author-username"]'
    };

    public readonly config: TestConfig = {
        baseUrl: 'https://habr.com',
        timeout: 15000,
        headless: process.env.HEADLESS !== 'false',
        viewport: { width: 1920, height: 1080 },
    };

    constructor(public page: Page) {
        this.page.setDefaultTimeout(this.config.timeout);
        this.page.setViewport(this.config.viewport);
    }

    public async waitForElement(
        selector: string,
        options: { timeout: number; visible: boolean }
    ): Promise<ElementHandle<Element>> {
        const { timeout = this.config.timeout, visible = true } = options;

        try {
            const element = await page.waitForSelector(selector, {
                timeout,
                visible, 
            });
            
            if (!element) {
                throw new Error(`Element "${selector}" not found within timeout`);
            }

            return element!;

        } catch (error) {
            console.error(`❌ Элемент с селектором "${selector}" не найден за ${timeout}мс. Делаю скриншот...`);
            throw error;
        }
    }

    public async waitForNavigation(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    public async filterByTime(timeRange: 'day' | 'week' | 'month'): Promise<void> {
        console.log(`⏰ Фильтрация статей за: ${timeRange}`);
        
        try {
            const timeUrls = {
                day: 'https://habr.com/ru/all/top/daily/',
                week: 'https://habr.com/ru/all/top/weekly/',
                month: 'https://habr.com/ru/all/top/monthly/'
            };
            
            const filterUrl = timeUrls[timeRange];
            console.log(`🔄 Переход на: ${filterUrl}`);

            await page.goto(filterUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            
            await page.waitForSelector(this.baseSelectors.articleTitle, {
                timeout: 10000
            });
            
            console.log(`✅ Фильтр применен: ${timeRange}`);
            
        } catch (error) {
            console.error(`❌ Ошибка при фильтрации: ${(error as Error).message}`);
            throw error;
        }
    }

    public async openFirstArticle() {
        console.log('🎯 Открываем статью с ID=1...');
        
        try {
            let articleWithId1 = null;
            
            try {
                const articles = await this.page.$$(this.baseSelectors.articleItem);
                
                for (let i = 0; i < Math.min(articles.length, 10); i++) {  
                    const href = await this.page.$eval(
                        `${this.baseSelectors.articleItem}:nth-child(${i + 1}) ${this.baseSelectors.articleTitle}`,
                        (link) => link.getAttribute('href') || ''
                    );
                    
                    if (href.includes('/articles/1') || href.includes('/post/1')) {
                        articleWithId1 = { position: i + 1, href };
                        break;
                    }
                    
                    const match = href.match(/\/(\d+)\/?$/);
                    if (match && parseInt(match[1]) === 1) {
                        articleWithId1 = { position: i + 1, href };
                        break;
                    }
                }
            } catch (error) {
                console.log('Не удалось проверить статьи в списке:', (error as Error).message);
            }
            
            if (articleWithId1) {
                console.log(`📌 Статья с ID=1 найдена на позиции ${articleWithId1.position}`);
                await this.page.click(
                    `${this.baseSelectors.articleItem}:nth-child(${articleWithId1.position}) ${this.baseSelectors.articleTitle}`
                );
            } else {
                console.log('📌 Статьи с ID=1 нет в списке, переходим напрямую');
                await this.page.goto('https://habr.com/ru/articles/1/', {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000
                });
            }
            
            await this.page.waitForSelector(this.baseSelectors.articleTitle, {
                visible: true,
                timeout: 15000
            });

            const currentUrl = this.page.url();
            console.log(`📌 Открыт URL: ${currentUrl}`);
            
            const extractId = (url: string): number => {
                if (!url) return 0;
                const match = url.match(/\/(\d+)\/?$/);
                return match ? parseInt(match[1]) : 0;
            };
            
            const openedId = extractId(currentUrl);
            
            if (openedId === 1) {
                console.log('✅ УСПЕХ: Открыта статья с ID=1!');
                return 1;
            } else {
                throw new Error(`❌ ОШИБКА: Открылась статья с ID=${openedId}, а должна была открыться с ID=1`);
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ Ошибка:', errorMessage);
            throw error;
        }
    }

    public async openArticleByIndex(index: number) {
        const selector = `${this.baseSelectors.articleItem}:nth-child(${index + 1}) h2.tm-title a`;
        await this.page.click(selector);
        
        await this.page.waitForSelector(this.baseSelectors.articleTitle, {
            visible: true,
            timeout: 15000
        });
        
        const currentUrl = this.page.url();
        return this.extractArticleId(currentUrl);
    }

    public extractArticleId(url: string): number {
        if (!url) return 0;
        const match = url.match(/\/(\d+)\/?$/);
        return match ? parseInt(match[1]) : 0;
    }


    public async sortArticles(sortBy: 'rating' | 'date'): Promise<void> {
        console.log(`📊 Сортировка статей по: ${sortBy}`);
        
        try {
            const sortUrls = {
                rating: 'https://habr.com/ru/all/top/',
                date: 'https://habr.com/ru/all/'
            };
            
            const sortUrl = sortUrls[sortBy];
            console.log(`🔄 Переход на: ${sortUrl}`);
            
            await page.goto(sortUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            
            console.log(`✅ Сортировка применена: ${sortBy}`);
            
        } catch (error) {
            console.error(`❌ Ошибка при сортировке: ${(error as Error).message}`);
            throw error;
        }
    }

    public async getElementText(selector: string): Promise<string> {
        const element = await this.waitForElement(selector, {
            timeout: 10000,
            visible: false
        });
        const text = await this.page.evaluate((el: Element) => el.textContent?.trim() || '', element);
        return text;
    }

    public async getElementAttribute(selector: string, attribute: string): Promise<string> {
        const element = await this.waitForElement(selector, {
            timeout: 10000,
            visible: false
        });
        const value = await this.page.evaluate(
            (el: Element, attr: string) => el.getAttribute(attr) || '',
            element,
            attribute
        );
        return value;
    }

    public async clickElement(selector: string): Promise<void> {
        const element = await this.waitForElement(selector, {
            timeout: 10000,
            visible: false
        });
        await element.click();
    }

    public async typeText(selector: string, text: string): Promise<void> {
        const element = await this.waitForElement(selector, {
            timeout: 10000,
            visible: false
        });
        await element.type(text);
    }

    public async isElementVisible(selector: string): Promise<boolean> {
        try {
            const element = await this.page.waitForSelector(selector, {
                visible: false, 
                timeout: 10000
            });

            if (!element) {
                return false;
            }

            const isVisible = await this.page.evaluate((el: Element) => {
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

    public async getElementsCount(selector: string): Promise<number> {
        const elements = await this.page.$$(selector);
        return elements.length;
    }

    public async scrollToElement(selector: string): Promise<void> {
        await page.evaluate((sel: string) => {
            const element = document.querySelector(sel);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, selector);
    }

    public async delay(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    public async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    public async getPageTitle(): Promise<string> {
        return this.page.title();
    }

    public abstract navigate(path?: string): Promise<void>;
}