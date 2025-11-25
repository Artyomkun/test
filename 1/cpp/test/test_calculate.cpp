#include <iostream>
#include <cassert>
#include "function.h"

void test_positive_positive()
{
    assert(calculate(5, 3) == 8);
    assert(calculate(10, 7) == 17);
    std::cout << "✓ Тест 1 пройден: x>0, y>0 -> x+y" << std::endl;
}

void test_positive_non_positive()
{
    assert(calculate(5, -3) == 8);
    assert(calculate(10, 0) == 10);
    std::cout << "✓ Тест 2 пройден: x>0, y<=0 -> x-y" << std::endl;
}

void test_non_positive_positive()
{
    assert(calculate(-5, 3) == 8);
    assert(calculate(0, 7) == 7);
    std::cout << "✓ Тест 3 пройден: x<=0, y>0 -> -x+y" << std::endl;
}

void test_non_positive_non_positive()
{
    assert(calculate(-5, -3) == 8);
    assert(calculate(0, 0) == 0);
    std::cout << "✓ Тест 4 пройден: x<=0, y<=0 -> -x-y" << std::endl;
}

void test_boundary_values()
{
    assert(calculate(0, 5) == 5);
    assert(calculate(5, 0) == 5);
    assert(calculate(0, 0) == 0);
    std::cout << "✓ Тест 5 пройден: граничные значения" << std::endl;
}

void test_func_statement_coverage()
{
    assert(func(8, 5, 2) == 22);
    assert(func(10, 3, 1) == 2);
    assert(func(1, 4, 1) == 1);
    std::cout << "✓ Покрытие операторов func" << std::endl;
}

void test_func_decision_coverage()
{
    assert(func(8, 5, 1) == 14);
    assert(func(8, 4, 1) == 2);
    assert(func(3, 4, 1) == 2);
    assert(func(1, 4, 10) == 11);
    assert(func(1, 4, 1) == 1);
    std::cout << "✓ Покрытие решений func" << std::endl;
}

void test_func_boundary_values()
{
    assert(func(8, 5, 1) == 14);
    assert(func(9, 5, 1) == 2);
    assert(func(8, 5, 1) == 14);
    assert(func(8, 4, 1) == 2);
    assert(func(3, 4, 1) == 2);
    assert(func(2, 4, 1) == 1);
    assert(func(1, 4, 7) == 8);
    assert(func(1, 4, 6) == 6);
    std::cout << "✓ Граничные значения func" << std::endl;
}

void test_func_path_coverage()
{
    assert(func(8, 5, 2) == 22);
    assert(func(10, 3, 1) == 2);
    assert(func(1, 5, 2) == 8);
    assert(func(1, 4, 1) == 1);
    std::cout << "✓ Покрытие путей func" << std::endl;
}

int main()
{
    std::cout << "Запуск тестов функции calculate..." << std::endl;
    std::cout << "===================================" << std::endl;

    test_positive_positive();
    test_positive_non_positive();
    test_non_positive_positive();
    test_non_positive_non_positive();
    test_boundary_values();

    std::cout << "===================================" << std::endl;
    std::cout << "Запуск тестов белого ящика для func..." << std::endl;
    std::cout << "===================================" << std::endl;

    test_func_statement_coverage();
    test_func_decision_coverage();
    test_func_boundary_values();
    test_func_path_coverage();

    std::cout << "===================================" << std::endl;
    std::cout << "🎉 Все тесты успешно пройдены!" << std::endl;
    std::cout << "✅ 100% покрытие белого ящика для обеих функций" << std::endl;

    return 0;
}