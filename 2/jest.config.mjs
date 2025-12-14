export default {
    preset: 'ts-jest/presets/default-esm',
    testRunner: 'jest-circus/runner',
    testEnvironment: 'allure-jest/node',
    
    // ВАЖНО: передаем конфигурацию Allure сюда
    testEnvironmentOptions: {
        resultsDir: './allure-results',
        categories: [
            {
                name: 'Ignored tests',
                matchedStatuses: ['skipped']
            },
            {
                name: 'Infrastructure problems', 
                matchedStatuses: ['broken', 'failed'],
                messageRegex: '.*Connection refused.*|.*Timeout.*|.*Element not found.*'
            },
            {
                name: 'Product defects',
                matchedStatuses: ['failed']
            },
            {
                name: 'Test defects', 
                matchedStatuses: ['broken']
            }
        ],
        environment: {
            OS: 'Windows 11',
            Browser: 'Chrome 120', 
            'Node.js': process.version,
            'Test Runner': 'Jest',
            'Execution_Mode': 'CI/CD Pipeline'
        }
    },
    
    testTimeout: 120000,
    maxWorkers: 2,
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: true }],
    },

    setupFilesAfterEnv: [
        './habr-tests/src/puppeteer.setup.ts',
        './habr-tests/src/Allure.setup.ts',
        './habr-tests/src/Tests.setup.ts'
    ],

    testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts'
    ],

    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'reports/junit',
                outputName: 'junit.xml',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}',
                ancestorSeparator: ' › ',
                usePathForSuiteName: true
            }
        ]
    ],
    collectCoverageFrom: [
        'habr-tests/src/**/*.{ts,js}',
        '!habr-tests/src/**/*.d.ts',
        '!habr-tests/src/**/*.test.ts',
        '!habr-tests/src/**/*.spec.ts',
        '!habr-tests/src/**/__tests__/**',
        '!habr-tests/src/**/__mocks__/**'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/reports/',
        '/screenshots/',
        '/coverage/'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};