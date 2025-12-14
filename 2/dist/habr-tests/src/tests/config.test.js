import { describe, test, expect } from '@jest/globals';
describe('TypeScript configuration test', () => {
    test('TypeScript should compile correctly', () => {
        const message = 'TypeScript is working!';
        expect(message).toBe('TypeScript is working!');
    });
    test('Async/await should work', async () => {
        const result = await Promise.resolve('async works');
        expect(result).toBe('async works');
    });
});
//# sourceMappingURL=config.test.js.map