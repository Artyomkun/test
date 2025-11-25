using System;

namespace CalculateFunction
{
    public static class Calculator
    {
        public static int Calculate(int a, int b, int x)
        {
            if (a < 9 && b == 5)
            {
                x = x * a + b;
            }

            if (a > 2 || x > 6)
            {
                x = x + 1;
            }

            return x;
        }
    }
}