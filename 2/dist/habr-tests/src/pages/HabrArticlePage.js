import { BasePage } from './BasePage';
export class HabrArticlePage extends BasePage {
    selectors = {
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
    };
    constructor(page) {
        super(page);
    }
    async navigate(articleUrl) {
        await this.page.goto(articleUrl, { waitUntil: 'networkidle2' });
        await this.closePopupIfExists();
    }
    async closePopupIfExists() {
        try {
            await this.page.waitForSelector('button.tm-popup__close', { timeout: 2000 });
            await this.page.click('button.tm-popup__close');
            console.log('Попап закрыт');
        }
        catch {
            console.log('Попап не появился');
        }
    }
    async getArticleData() {
        const [title, author, rating, views, date] = await Promise.all([
            this.getElementText(this.selectors.articleTitle),
            this.getElementText(this.selectors.articleAuthor),
            this.getElementText(this.selectors.articleRating),
            this.getElementText(this.selectors.articleViews),
            this.getElementAttribute(this.selectors.articlePublicationDate, 'datetime'),
        ]);
        const tags = await this.page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => el.textContent?.trim() || '');
        }, this.selectors.articleTags);
        const contentLength = await this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element?.textContent?.length || 0;
        }, this.selectors.articleContent);
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
    async isArticleLoaded() {
        try {
            const titleVisible = await this.isElementVisible(this.selectors.articleTitle);
            const contentVisible = await this.isElementVisible(this.selectors.articleContent);
            return titleVisible && contentVisible;
        }
        catch {
            return false;
        }
    }
    async upvoteArticle() {
        await this.clickElement(this.selectors.upvoteButton);
        await this.delay(1000);
    }
    async downvoteArticle() {
        await this.clickElement(this.selectors.downvoteButton);
        await this.delay(1000);
    }
    async bookmarkArticle() {
        await this.clickElement(this.selectors.articleBookmarkButton);
        await this.delay(1000);
    }
    async scrollToComments() {
        await this.scrollToElement(this.selectors.commentsSection);
    }
    async isCommentsSectionVisible() {
        return this.isElementVisible(this.selectors.commentsSection);
    }
    async getCommentsCount() {
        const countText = await this.getElementText(this.selectors.articleComments);
        return countText ? parseInt(countText) : 0;
    }
    async getReadingTime() {
        const content = await this.getElementText(this.selectors.articleContent);
        const words = content.split(/\s+/).length;
        return Math.ceil(words / 200);
    }
}
//# sourceMappingURL=HabrArticlePage.js.map