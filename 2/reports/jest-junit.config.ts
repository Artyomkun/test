module.exports = {
    suiteName: 'Habr E2E Tests',
    outputDirectory: './reports/junit',
    outputName: 'test-results.xml',
    classNameTemplate: '{classname}',
    titleTemplate: '{title}',
    ancestorSeparator: ' › ',
    usePathForSuiteName: true,
    includeConsoleOutput: true,
    reportTestSuiteErrors: true,
};