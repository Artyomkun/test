using Xunit;
using CalculateFunction;

namespace CalculateFunction.Tests
{
    public class CalculatorTests
    {
        [Theory]
        [InlineData(4, 5, 2, 14)]
        [InlineData(10, 5, 2, 3)]
        [InlineData(4, 3, 2, 3)]
        [InlineData(5, 3, 1, 2)]
        [InlineData(1, 5, 10, 16)]
        [InlineData(1, 3, 2, 2)]
        [InlineData(1, 5, 1, 6)]
        public void Calculate_VariousConditions_ReturnsExpected(int a, int b, int x, int expected)
        {
            int result = Calculator.Calculate(a, b, x);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(8, 5, 1, 14)]
        [InlineData(9, 5, 2, 3)]
        [InlineData(3, 5, 1, 9)]
        [InlineData(2, 5, 7, 20)]
        [InlineData(1, 5, 6, 12)]
        [InlineData(1, 5, 7, 13)]
        [InlineData(4, 5, 5, 26)]
        [InlineData(4, 5, 6, 30)]
        public void Calculate_BoundaryValues_ReturnsExpected(int a, int b, int x, int expected)
        {
            Assert.Equal(expected, Calculator.Calculate(a, b, x));
        }

        [Theory]
        [InlineData(4, 5, 2, 14)]
        [InlineData(1, 5, 1, 6)]
        [InlineData(5, 3, 2, 3)]
        [InlineData(1, 3, 2, 2)]
        public void Calculate_AllExecutionPaths_ReturnsExpected(int a, int b, int x, int expected)
        {
            int result = Calculator.Calculate(a, b, x);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(0, 0, 0, 0)]
        [InlineData(1, 5, 0, 5)]
        [InlineData(10, 0, 0, 1)]
        [InlineData(0, 5, 10, 5)]
        public void Calculate_EdgeCases_ReturnsExpected(int a, int b, int x, int expected)
        {
            Assert.Equal(expected, Calculator.Calculate(a, b, x));
        }

        [Fact]
        public void Calculate_BothConditionsTrue_ComplexScenario()
        {
            int a = 4, b = 5, x = 2;
            int result = Calculator.Calculate(a, b, x);
            Assert.Equal(14, result);
        }

        [Fact]
        public void Calculate_FirstTrueSecondFalse_ComplexScenario()
        {
            int a = 1, b = 5, x = 1;
            int result = Calculator.Calculate(a, b, x);
            Assert.Equal(6, result);
        }

        [Fact]
        public void Calculate_AllPaths_CoverageSummary()
        {
            var testCases = new[]
            {
                new { A = 4, B = 5, X = 2, Expected = 14, Description = "Оба условия true" },
                new { A = 1, B = 5, X = 1, Expected = 6, Description = "Только первое условие true" },
                new { A = 5, B = 3, X = 2, Expected = 3, Description = "Только второе условие true" },
                new { A = 1, B = 3, X = 2, Expected = 2, Description = "Оба условия false" }
            };

            foreach (var testCase in testCases)
            {
                int result = Calculator.Calculate(testCase.A, testCase.B, testCase.X);
                Assert.Equal(testCase.Expected, result);
            }
        }
    }
}