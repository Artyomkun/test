module.exports = {
    resultsDir: './reports/allure-results',
    reportDir: './reports/allure-report',
    
    categories: [
        {
        name: 'Тесты с дефектами',
        matchedStatuses: ['failed'],
        },
        {
        name: 'Пропущенные тесты',
        matchedStatuses: ['skipped'],
        },
        {
        name: 'Прошедшие тесты',
        matchedStatuses: ['passed'],
        },
    ],
    
    environmentInfo: {
        framework: 'Jest + Puppeteer',
        language: 'TypeScript',
        site: 'Habr.com',
        browser: 'Chromium',
    },
};