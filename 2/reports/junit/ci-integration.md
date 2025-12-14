# Интеграция с CI/CD системами

## GitHub Actions

### Основная конфигурация
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Chrome
      run: |
        sudo apt-get update
        sudo apt-get install -y wget --no-install-recommends
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
        sudo apt-get update
        sudo apt-get install -y google-chrome-stable --no-install-recommends
    
    - name: Run E2E Tests
      run: npm run test:ci
      env:
        HEADLESS: true
        CI: true
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: |
          reports/
          screenshots/
    
    - name: Publish Test Report
      uses: dorny/test-reporter@v1
      if: always()
      with:
        name: Jest E2E Tests
        path: reports/junit/junit.xml
        reporter: jest-junit