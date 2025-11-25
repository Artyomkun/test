using System;

namespace CalculateFunction
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Calculator Function Examples ===");
            Console.WriteLine($"Calculate(4, 5, 2) = {Calculator.Calculate(4, 5, 2)}");
            Console.WriteLine($"Calculate(10, 5, 3) = {Calculator.Calculate(10, 5, 3)}");
            Console.WriteLine($"Calculate(4, 3, 2) = {Calculator.Calculate(4, 3, 2)}");
            Console.WriteLine($"Calculate(1, 5, 1) = {Calculator.Calculate(1, 5, 1)}");
            Console.WriteLine($"Calculate(8, 5, 0) = {Calculator.Calculate(8, 5, 0)}");
            Console.WriteLine($"Calculate(3, 2, 10) = {Calculator.Calculate(3, 2, 10)}");
            Console.WriteLine($"Calculate(0, 0, 0) = {Calculator.Calculate(0, 0, 0)}");
            Console.WriteLine("\n=== Logic Demonstration ===");
            DemonstrateLogic(4, 5, 2);
            DemonstrateLogic(10, 5, 3);
            DemonstrateLogic(1, 5, 1);
            DemonstrateLogic(2, 3, 1);
        }

        static void DemonstrateLogic(int a, int b, int x)
        {
            int originalX = x;
            bool firstCondition = false;
            bool secondCondition = false;
            if (a < 9 && b == 5)
            {
                firstCondition = true;
                x = x * a + b;
            }
            if (a > 2 || x > 6)
            {
                secondCondition = true;
                x = x + 1;
            }
            Console.WriteLine($"a={a}, b={b}, x={originalX} -> " + $"First condition: {firstCondition}, " + $"Second condition: {secondCondition}, " + $"Result: {x}");
        }
    }

}