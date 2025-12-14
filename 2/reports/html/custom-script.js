document.addEventListener('DOMContentLoaded', function () {
    var suiteHeaders = document.querySelectorAll('.test-suite-header');
    suiteHeaders.forEach(function (header) {
        header.addEventListener('click', function () {
            var content = this.nextElementSibling;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            this.classList.toggle('collapsed');
        });
    });
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск тестов...';
    searchInput.style.cssText = "width: 100%;\n                                padding: 10px;\n                                margin: 10px 0;\n                                border: 1px solid #ddd;\n                                border-radius: 4px;\n                                font-size: 14px;";
    var header = document.querySelector('.header');
    if (header) {
        header.appendChild(searchInput);
    }
    searchInput.addEventListener('input', function (e) {
        var searchTerm = e.target.value.toLowerCase();
        var testItems = document.querySelectorAll('.test-item');
        testItems.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
    var errorElements = document.querySelectorAll('.test-error');
    errorElements.forEach(function (error) {
        var text = error.textContent;
        var highlighted = text
            .replace(/(at\s+.*\()(.*)(\))/g, '<span class="stack-trace">$1$2$3</span>')
            .replace(/(Error:.*)/g, '<strong class="error-message">$1</strong>');
        error.innerHTML = highlighted;
    });
});
