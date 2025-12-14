import allure from 'jest-allure/dist/setup';
const allureAPI = allure;
beforeAll(() => {
    if (allureAPI.addEnvironment) {
        allureAPI.addEnvironment('Project', 'Habr E2E Tests');
        allureAPI.addEnvironment('Browser', 'Chrome');
        allureAPI.addEnvironment('Mode', process.env.HEADLESS === 'true' ? 'Headless' : 'Headed');
    }
});
// После каждого теста
afterEach(async () => {
    // Если тест упал и page существует, делаем скриншот
    if (test && test.state === 'failed' && page) {
        try {
            const screenshot = await page.screenshot();
            if (allureAPI.addAttachment) {
                allureAPI.addAttachment('Screenshot on failure', Buffer.from(screenshot), 'image/png');
            }
        }
        catch (error) {
            console.warn('Failed to take screenshot on failure:', error);
        }
    }
});
//# sourceMappingURL=setupAllure.js.map