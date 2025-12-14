import { BasePage } from './BasePage';
export class HabrMainPage extends BasePage {
    selectors = {
        logo: 'a.tm-header__logo',
        navigation: {
            all: 'nav.tm-tabs a[href="/ru/all/"]',
            development: 'nav.tm-tabs a[href="/ru/flows/develop/"]',
            admin: 'nav.tm-tabs a[href="/ru/flows/admin/"]',
            design: 'nav.tm-tabs a[href="/ru/flows/design/"]',
            management: 'nav.tm-tabs a[href="/ru/flows/management/"]',
            marketing: 'nav.tm-tabs a[href="/ru/flows/marketing/"]',
        },
        searchButton: 'button.tm-header-user-menu__search',
        searchInput: 'input.tm-input-text-decorated__input',
        searchResults: '.tm-articles-list',
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
        sortDropdown: '.tm-navigation-dropdown__button',
        sortOption: (option) => `.tm-navigation-dropdown__item[data-value="${option}"]`,
        timeFilter: (filter) => `a.tm-navigation-tabs__tab[href*="${filter}"]`,
        loginButton: 'a.tm-header-user-menu__login',
        registerButton: 'a.tm-header-user-menu__register',
        userMenu: '.tm-header-user-menu__dropdown',
        closeAdButton: 'button.tm-popup__close',
        acceptCookies: 'button.cookie-notification__agree',
    };
    constructor(page) {
        super(page);
    }
    async navigate(path = '/ru/all/') {
        const url = `${this.config.baseUrl}${path}`;
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        await this.closePopupIfExists();
    }
    async closePopupIfExists() {
        try {
            await this.page.waitForSelector(this.selectors.acceptCookies, { timeout: 3000 });
            await this.clickElement(this.selectors.acceptCookies);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            console.debug('Cookie popup not found or already closed');
        }
        try {
            await this.page.waitForSelector(this.selectors.closeAdButton, { timeout: 2000 });
            await this.clickElement(this.selectors.closeAdButton);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            console.debug('Ad popup not found or already closed');
        }
    }
    async isLogoVisible() {
        return this.isElementVisible(this.selectors.logo);
    }
    async isNavigationVisible() {
        return this.isElementVisible('nav.tm-tabs');
    }
    async isLoginButtonVisible() {
        return this.isElementVisible(this.selectors.loginButton);
    }
    async navigateToSection(section) {
        await this.clickElement(this.selectors.navigation[section]);
        await this.waitForNavigation();
    }
    async openSearch() {
        await this.clickElement(this.selectors.searchButton);
        await this.page.waitForSelector(this.selectors.searchInput, { visible: true });
    }
    async searchArticles(query) {
        await this.openSearch();
        await this.typeText(this.selectors.searchInput, query);
        await this.page.keyboard.press('Enter');
        await this.waitForNavigation();
        await this.page.waitForSelector(this.selectors.searchResults);
    }
    async getSearchResults() {
        await this.page.waitForSelector(this.selectors.searchResultItem);
        return this.page.evaluate((sel) => {
            const articles = [];
            const items = document.querySelectorAll(sel.item);
            items.forEach(item => {
                const titleElement = item.querySelector(sel.title);
                const authorElement = item.querySelector(sel.author);
                const ratingElement = item.querySelector(sel.rating);
                const tagsElements = item.querySelectorAll(sel.tags);
                if (titleElement) {
                    articles.push({
                        title: titleElement.textContent?.trim() || '',
                        link: titleElement.href || '',
                        author: authorElement?.textContent?.trim() || '',
                        rating: ratingElement ? parseInt(ratingElement.textContent || '0') : undefined,
                        tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
                    });
                }
            });
            return articles;
        }, {
            item: this.selectors.searchResultItem,
            title: this.selectors.searchResultTitle,
            author: this.selectors.articleAuthor,
            rating: this.selectors.articleRating,
            tags: this.selectors.articleTags,
        });
    }
    // Работа со статьями
    async getArticlesOnPage() {
        await this.page.waitForSelector(this.selectors.articleItem);
        return this.page.evaluate((sel) => {
            const articles = [];
            const items = document.querySelectorAll(sel.item);
            items.forEach(item => {
                const titleElement = item.querySelector(sel.title);
                const authorElement = item.querySelector(sel.author);
                const ratingElement = item.querySelector(sel.rating);
                const viewsElement = item.querySelector(sel.views);
                const tagsElements = item.querySelectorAll(sel.tags);
                if (titleElement) {
                    articles.push({
                        title: titleElement.textContent?.trim() || '',
                        link: titleElement.href || '',
                        author: authorElement?.textContent?.trim() || '',
                        rating: ratingElement ? parseInt(ratingElement.textContent || '0') : undefined,
                        views: viewsElement?.textContent?.trim(),
                        tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
                    });
                }
            });
            return articles;
        }, {
            item: this.selectors.articleItem,
            title: this.selectors.articleTitle,
            author: this.selectors.articleAuthor,
            rating: this.selectors.articleRating,
            views: this.selectors.articleViews,
            tags: this.selectors.articleTags,
        });
    }
    async getArticlesCount() {
        return this.getElementsCount(this.selectors.articleItem);
    }
    async openFirstArticle() {
        await this.clickElement(`${this.selectors.articleItem}:first-child ${this.selectors.articleTitle}`);
        await this.waitForNavigation();
    }
    async sortArticles(option) {
        await this.clickElement(this.selectors.sortDropdown);
        await this.clickElement(this.selectors.sortOption(option));
        await this.waitForNavigation();
    }
    async filterByTime(filter) {
        await this.clickElement(this.selectors.timeFilter(filter));
        await this.waitForNavigation();
    }
    async goToLoginPage() {
        await this.clickElement(this.selectors.loginButton);
        await this.waitForNavigation();
    }
    async goToRegisterPage() {
        await this.clickElement(this.selectors.registerButton);
        await this.waitForNavigation();
    }
    async getPageTitle() {
        return this.page.title();
    }
    async getCurrentUrl() {
        return this.page.url();
    }
    async getHeaderText() {
        return this.getElementText('h1.tm-section-name__text');
    }
}
//# sourceMappingURL=HabrMainPage.js.map