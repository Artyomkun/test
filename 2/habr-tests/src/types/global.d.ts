import type { Browser, Page } from 'puppeteer';

interface AllureInterface {
    step<T>(name: string, fn: () => T): PromiseLike<T>;
    label(name: string, value: string): void;
    attachment(name: string, content: string | Buffer, options?: string | { contentType?: string; fileName?: string }): PromiseLike<void>;
}

declare global {
    var allure: AllureInterface;
    var browser: Browser;
    var page: Page;
    var testHasFailed: boolean;
}

export {};