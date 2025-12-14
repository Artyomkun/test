const config = {
    preset: 'ts-jest',
    testEnvironment: 'jest-puppeteer',
    setupFilesAfterEnv: ['<rootDir>/habr-tests/src/setupTests.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: [
        'habr-tests/src/tests/**/*.ts',
        'habr-tests/src/tests/**/?(*.)+(spec|test).ts'
    ],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'habr-tests/src/**/*.{ts,js}',
        '!habr-tests/src/**/*.d.ts',
        '!habr-tests/src/**/*.test.ts',
        '!habr-tests/src/**/*.spec.ts',
    ],
    // Настройки отчетов
    collectCoverage: true,
    coverageDirectory: 'habr-tests/reports/coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json',
        'json-summary',
        'clover'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/habr-tests/reports/',
        '/habr-tests/screenshots/',
        '/__mocks__/'
    ],
    // JUnit отчеты для CI/CD
    reporters: [
        'default',
        ['jest-junit', {
                outputDirectory: 'habr-tests/reports/junit',
                outputName: 'junit.xml',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}',
                ancestorSeparator: ' › ',
                usePathForSuiteName: true,
            }],
    ],
    // Настройки тестов
    testTimeout: 30000,
    verbose: true,
    // Для ускорения
    maxWorkers: process.env.CI ? '50%' : '100%',
};
export default config;
//# sourceMappingURL=jest.config.js.map