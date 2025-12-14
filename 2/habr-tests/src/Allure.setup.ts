import { Page } from 'puppeteer';
import { beforeAll, afterEach } from '@jest/globals';

interface SpecContext {
  result?: {
    status?: 'passed' | 'failed';
    description?: string;
    fullName?: string;
  };
}

beforeAll(() => {
  console.log('Setting up Allure...');

  if (!global.allure) {
    console.log('⚠️ Using Allure stub');

    Object.defineProperty(global, 'allure', {
      value: {
        step: <T>(name: string, fn: () => T): PromiseLike<T> => {
          console.log(`[STEP] ${name}`);
          try {
            const result = fn();
            return Promise.resolve(result);
          } catch (error) {
            return Promise.reject(error);
          }
        },
        label: (name: string, value: string) => {
          console.log(`[LABEL] ${name}=${value}`);
        },
        attachment: (name: string, content: string | Buffer, options?: string | { contentType?: string; fileName?: string }) => {
          const contentType = options && typeof options !== 'string' ? options.contentType : 'unknown';
          const contentSize = content instanceof Buffer ? content.length : (typeof content === 'string' ? content.length : 'N/A');
          console.log(`[ATTACHMENT] Name: ${name} | Type: ${contentType} | Size: ${contentSize}`);
          return Promise.resolve();
        }
      },
      writable: true,
      configurable: true
    });
  } else {
    console.log('✅ Allure reporter ready');
  }

  if (!global.page) {
    Object.defineProperty(global, 'page', {
      value: {} as Page,
      writable: true,
      configurable: true
    });
  }
});

afterEach(async function(this: SpecContext) {
  const globalObj = global as typeof global & {
    page: Page;
    allure: typeof allure;
  };

  if (this.result && this.result.status === 'failed' && globalObj.page) {
    try {
      const screenshot = await globalObj.page.screenshot();
      if (globalObj.allure && globalObj.allure.attachment) {
        globalObj.allure.attachment(
          'Screenshot on Failure',
          Buffer.from(screenshot),
          'image/png'
        );
      }
    } catch (error) {
      console.error('Failed to take or attach screenshot on test failure:', error);
    }
  }
});

export const allure = global.allure;