import { describe, test, expect, beforeAll } from '@jest/globals';

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

describe('TypeScript configuration test', () => {
        test('TypeScript should compile correctly', () => {
                const message: string = 'TypeScript is working!';
                expect(message).toBe('TypeScript is working!');
            }
        );

        test('Async/await should work', async () => {
                const result = await Promise.resolve('async works');
                expect(result).toBe('async works');
            }
        );
    }
);