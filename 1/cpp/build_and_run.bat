@echo off
echo Компиляция тестовой программы...
g++ -std=c++17 function.cpp test_simple.cpp -o test_simple.exe

if %errorlevel% neq 0 (
    echo Ошибка компиляции!
    pause
    exit /b 1
)

echo Запуск тестов...
echo.
test_simple.exe
echo.
pause