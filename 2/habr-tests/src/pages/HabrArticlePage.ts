import { BasePage } from './BasePage';
import { Page } from 'puppeteer';

export class HabrArticlePage extends BasePage {
    private readonly selectors = {
        articleTitle: 'h1.tm-title',
        articleContent: '.tm-article-body',
        articleAuthor: '.tm-user-info__username',
        articlePublicationDate: '.tm-article-datetime-published time',
        articleRating: '.tm-votes-meter__value',
        articleViews: '.tm-icon-counter__value',
        articleComments: '.tm-article-comments-counter-link__value',
        articleTags: '.tm-article__hubs-item-link',
        articleBookmarkButton: 'button.tm-bookmark-button',
        articleShareButton: 'button.tm-share-button',
        commentsSection: '#comments',
        commentForm: '.tm-comment-form',
        relatedArticles: '.tm-related-block',
        upvoteButton: '.tm-vote__button_up',
        downvoteButton: '.tm-vote__button_down',
        subscribeButton: 'button.tm-user-subscribe-button',
        loginButtonSelector: 'a.tm-header-user-menu__item[href*="login"]'
    };

    constructor(page: Page) {
        super(page);
    }

    async navigate(articleUrl: string): Promise<void> {
        await this.page.goto(articleUrl, { waitUntil: 'networkidle2' });
        await this.closePopupIfExists();
    }

    private async closePopupIfExists(): Promise<void> {
        try {
            await this.page.waitForSelector('button.tm-popup__close', { timeout: 2000 });
            await this.page.click('button.tm-popup__close');
            console.log('Попап закрыт');
        } catch {
            console.log('Попап не появился');
        }
    }

    async getArticleData() {
        const [title, author, rating, views, date] = await Promise.all(
            [
                this.getElementText(this.selectors.articleTitle),
                this.getElementText(this.selectors.articleAuthor),
                this.getElementText(this.selectors.articleRating),
                this.getElementText(this.selectors.articleViews),
                this.getElementAttribute(this.selectors.articlePublicationDate, 'datetime'),
            ]
        );

        const tags = await this.page.evaluate(
            (selector: string) => {
                const elements = document.querySelectorAll(selector);
                return Array.from(elements).map(el => el.textContent?.trim() || '');
            }, 
        this.selectors.articleTags);

        const contentLength = await this.page.evaluate(
            (selector: string) => {
                const element = document.querySelector(selector);
                return element?.textContent?.length || 0;
            }, 
        this.selectors.articleContent);

        return {
            title,
            author,
            rating: rating ? parseInt(rating) : 0,
            views: views ? parseInt(views.replace(/\s/g, '')) : 0,
            publicationDate: date,
            tags,
            contentLength,
        };
    }

    async isArticleLoaded(): Promise<boolean> {
        try {
            const titleVisible = await this.isElementVisible(this.selectors.articleTitle);
            const contentVisible = await this.isElementVisible(this.selectors.articleContent);
            return titleVisible && contentVisible;
        } catch {
            return false;
        }
    }

    async upvoteArticle(): Promise<void> {
        await this.clickElement(this.selectors.upvoteButton);
        await this.delay(1000);
    }

    async downvoteArticle(): Promise<void> {
        await this.clickElement(this.selectors.downvoteButton);
        await this.delay(1000);
    }

    async bookmarkArticle(): Promise<void> {
        await this.clickElement(this.selectors.articleBookmarkButton);
        await this.delay(1000);
    }

    async scrollToComments(): Promise<void> {
        await this.scrollToElement(this.selectors.commentsSection);
    }

    async isCommentsSectionVisible(): Promise<boolean> {
        return this.isElementVisible(this.selectors.commentsSection);
    }

    async getCommentsCount(): Promise<number> {
        const countText = await this.getElementText(this.selectors.articleComments);
        return countText ? parseInt(countText) : 0;
    }

    async getReadingTime(): Promise<number> {
        const content = await this.getElementText(this.selectors.articleContent);
        const words = content.split(/\s+/).length;
        return Math.ceil(words / 200);
    }
}