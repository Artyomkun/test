import { afterEach } from '@jest/globals';

afterEach(async () => {
    if (global.testHasFailed) {
        try {
            const screenshot = await global.page.screenshot();
            
            if (global.allure) {
                global.allure.attachment(
                    'Screenshot on Failure',
                    Buffer.from(screenshot),
                    { contentType: 'image/png' }
                );
            }
        } catch (error) {
            console.error('Failed to take or attach screenshot on test failure:', error);
        }
    } 
    global.testHasFailed = false;
});