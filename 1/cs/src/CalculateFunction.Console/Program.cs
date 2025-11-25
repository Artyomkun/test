using CalculateFunction;

namespace CalculateFunction.Console
{
    class Program
    {
        static void Main(string[] args)
        {
            global::System.Console.WriteLine("=== Calculator Function Examples ===");
            global::System.Console.WriteLine($"Calculate(4, 5, 2) = {Calculator.Calculate(4, 5, 2)}");
            global::System.Console.WriteLine($"Calculate(10, 5, 3) = {Calculator.Calculate(10, 5, 3)}");
            global::System.Console.WriteLine($"Calculate(4, 3, 2) = {Calculator.Calculate(4, 3, 2)}");
            global::System.Console.WriteLine($"Calculate(1, 5, 1) = {Calculator.Calculate(1, 5, 1)}");
            global::System.Console.WriteLine($"Calculate(8, 5, 0) = {Calculator.Calculate(8, 5, 0)}");
            global::System.Console.WriteLine($"Calculate(3, 2, 10) = {Calculator.Calculate(3, 2, 10)}");
            global::System.Console.WriteLine($"Calculate(0, 0, 0) = {Calculator.Calculate(0, 0, 0)}");
            global::System.Console.WriteLine("\n=== Interactive Examples ===");
            DemonstrateCalculation(4, 5, 2);
            DemonstrateCalculation(10, 5, 3);
            DemonstrateCalculation(1, 5, 1);
            DemonstrateCalculation(2, 3, 1);
            global::System.Console.WriteLine("\nPress any key to exit...");
            global::System.Console.ReadKey();
        }

        static void DemonstrateCalculation(int a, int b, int x)
        {
            int originalX = x;
            string firstCondition = "NOT executed";
            string secondCondition = "NOT executed";
            if (a < 9 && b == 5)
            {
                firstCondition = $"executed: x = {x} * {a} + {b} = {x * a + b}";
                x = x * a + b;
            }
            bool shouldExecuteSecond = a > 2 || x > 6;
            if (shouldExecuteSecond)
            {
                secondCondition = $"executed: x = {x} + 1 = {x + 1}";
                x = x + 1;
            }
            global::System.Console.WriteLine($"Input: a={a}, b={b}, x={originalX}");
            global::System.Console.WriteLine($"  First condition (a<9 && b==5): {firstCondition}");
            global::System.Console.WriteLine($"  Second condition (a>2 || x>6): {secondCondition}");
            global::System.Console.WriteLine($"  Final result: {x}\n");
        }
    }
}