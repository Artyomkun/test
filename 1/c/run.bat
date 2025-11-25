@echo off
echo Compiling C program...
clang -o test_calculator.exe calculator.c test_calculator.c

if %errorlevel% equ 0 (
    echo Running tests...
    test_calculator.exe
) else (
    echo Compilation failed!
)
pause