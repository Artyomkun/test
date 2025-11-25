#include <stdio.h>
#include <assert.h>
#include "calculator.h"

void test_calculate()
{
    printf("=== C Tests ===\n");

    assert(calculate(5, 3) == 8);
    printf("✅ calculate(5, 3) = 8\n");

    assert(calculate(5, -3) == 8);
    printf("✅ calculate(5, -3) = 8\n");

    assert(calculate(-5, 3) == 8);
    printf("✅ calculate(-5, 3) = 8\n");

    assert(calculate(-5, -3) == 8);
    printf("✅ calculate(-5, -3) = 8\n");

    assert(calculate(0, 5) == 5);
    printf("✅ calculate(0, 5) = 5\n");

    assert(calculate(5, 0) == 5);
    printf("✅ calculate(5, 0) = 5\n");

    assert(calculate(0, 0) == 0);
    printf("✅ calculate(0, 0) = 0\n");

    printf("🎉 All C tests passed!\n");
}

void test_func_white_box()
{
    printf("\n=== White Box Testing func() ===\n");

    assert(func(8, 5, 2) == 22);
    printf("✅ func(8, 5, 2) = 22 (statement coverage)\n");

    assert(func(10, 3, 1) == 2);
    printf("✅ func(10, 3, 1) = 2 (statement coverage)\n");

    assert(func(1, 4, 1) == 1);
    printf("✅ func(1, 4, 1) = 1 (statement coverage)\n");

    assert(func(8, 5, 1) == 14);
    printf("✅ func(8, 5, 1) = 14 (decision coverage)\n");

    assert(func(8, 4, 1) == 2);
    printf("✅ func(8, 4, 1) = 2 (decision coverage)\n");

    assert(func(3, 4, 1) == 2);
    printf("✅ func(3, 4, 1) = 2 (decision coverage)\n");

    assert(func(1, 4, 10) == 11);
    printf("✅ func(1, 4, 10) = 11 (decision coverage)\n");

    assert(func(8, 5, 1) == 14);
    assert(func(9, 5, 1) == 2);
    printf("✅ Boundary a < 9\n");

    assert(func(8, 5, 1) == 14);
    assert(func(8, 4, 1) == 2);
    printf("✅ Boundary b == 5\n");

    assert(func(3, 4, 1) == 2);
    assert(func(2, 4, 1) == 1);
    printf("✅ Boundary a > 2\n");

    assert(func(1, 4, 7) == 8);
    assert(func(1, 4, 6) == 6);
    printf("✅ Boundary x > 6\n");

    assert(func(8, 5, 2) == 22);
    assert(func(10, 3, 1) == 2);
    assert(func(1, 5, 2) == 8);
    assert(func(1, 4, 1) == 1);
    printf("✅ All paths covered\n");

    printf("🎉 All white box tests passed!\n");
}

int main()
{
    test_calculate();
    test_func_white_box();
    return 0;
}