export class BasePage {
    page;
    config = {
        baseUrl: 'https://habr.com',
        timeout: 15000,
        headless: process.env.HEADLESS !== 'false',
        viewport: { width: 1920, height: 1080 },
    };
    constructor(page) {
        this.page = page;
        this.page.setDefaultTimeout(this.config.timeout);
        this.page.setViewport(this.config.viewport);
    }
    async waitForElement(selector, timeout) {
        const element = await this.page.waitForSelector(selector, {
            timeout: timeout || this.config.timeout
        });
        if (!element) {
            throw new Error(`Element "${selector}" not found within timeout`);
        }
        return element;
    }
    async waitForNavigation() {
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    async getElementText(selector) {
        const element = await this.waitForElement(selector);
        const text = await this.page.evaluate((el) => el.textContent?.trim() || '', element);
        return text;
    }
    async getElementAttribute(selector, attribute) {
        const element = await this.waitForElement(selector);
        const value = await this.page.evaluate((el, attr) => el.getAttribute(attr) || '', element, attribute);
        return value;
    }
    async clickElement(selector) {
        const element = await this.waitForElement(selector);
        await element.click();
    }
    async typeText(selector, text) {
        const element = await this.waitForElement(selector);
        await element.type(text);
    }
    async isElementVisible(selector) {
        try {
            const element = await this.page.$(selector);
            if (!element)
                return false;
            const isVisible = await this.page.evaluate((el) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return (style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    rect.width > 0 &&
                    rect.height > 0 &&
                    el.offsetParent !== null);
            }, element);
            return isVisible;
        }
        catch {
            return false;
        }
    }
    async getElementsCount(selector) {
        const elements = await this.page.$$(selector);
        return elements.length;
    }
    async scrollToElement(selector) {
        await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, selector);
    }
    async delay(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    async getCurrentUrl() {
        return this.page.url();
    }
    async getPageTitle() {
        return this.page.title();
    }
    async takeScreenshot(name, fullPage = false) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshots/${name}-${timestamp}.png`;
        const options = {
            path: filename,
            fullPage,
        };
        await this.page.screenshot(options);
        console.log(`Screenshot saved: ${filename}`);
    }
}
//# sourceMappingURL=BasePage.js.map