document.addEventListener('DOMContentLoaded', function() {
    const suiteHeaders = document.querySelectorAll('.test-suite-header');
    suiteHeaders.forEach(
      header => {
          header.addEventListener('click', function(this: HTMLElement) {
            const content = this.nextElementSibling as HTMLElement;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            this.classList.toggle('collapsed');
          }
        );
      }
    );

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск тестов...';
    searchInput.style.cssText = `width: 100%;
                                padding: 10px;
                                margin: 10px 0;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;`;

    const header = document.querySelector('.header');
    if (header) {
      header.appendChild(searchInput);
    }

    searchInput.addEventListener('input',
      function(e) {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const testItems = document.querySelectorAll('.test-item');

        testItems.forEach(
          item => {
            const text = item.textContent.toLowerCase();
            (item as HTMLElement).style.display = text.includes(searchTerm) ? 'block' : 'none';
          }
        );
      }
    );

    const errorElements = document.querySelectorAll('.test-error');
    errorElements.forEach(
      error => {
        const text = error.textContent;
        const highlighted = text
          .replace(/(at\s+.*\()(.*)(\))/g, '<span class="stack-trace">$1$2$3</span>')
            .replace(/(Error:.*)/g, '<strong class="error-message">$1</strong>');
        error.innerHTML = highlighted;
      }
    );
  }
);