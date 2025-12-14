# JUnit Отчеты

Этот каталог содержит JUnit XML отчеты о результатах выполнения тестов.

## Что такое JUnit формат?

JUnit XML - это стандартный формат для отчетов о тестировании, который понимают большинство CI/CD систем:

- **Jenkins**
- **GitLab CI/CD**
- **GitHub Actions**
- **Azure DevOps**
- **TeamCity**
- **Bamboo**

## Структура файла

Основной файл отчета: `junit.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Test Suite" tests="10" failures="1" errors="0" skipped="2" time="45.2">
    <testcase name="TC-1: Test Name" classname="TestSuite.TestClass" time="4.5">
      <!-- Для успешных тестов - пустой элемент -->
    </testcase>
    <testcase name="TC-2: Failed Test" classname="TestSuite.TestClass" time="2.1">
      <failure message="Assertion Error">
        Подробная информация об ошибке...
      </failure>
    </testcase>
    <testcase name="TC-3: Skipped Test" classname="TestSuite.TestClass" time="0.1">
      <skipped>Причина пропуска теста</skipped>
    </testcase>
  </testsuite>
</testsuites>