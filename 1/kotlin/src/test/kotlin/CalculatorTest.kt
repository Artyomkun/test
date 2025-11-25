import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import kotlin.test.assertEquals

class CalculatorTest {
    
    @Test
    fun testBothConditionsTrue() {
        assertEquals(14, Calculator.calculate(4, 5, 2))
        assertEquals(14, Calculator.calculate(8, 5, 1))
    }
    
    @Test
    fun testFirstConditionFalseByA() {
        assertEquals(3, Calculator.calculate(10, 5, 2))
        assertEquals(2, Calculator.calculate(9, 5, 1))
    }
    
    @Test
    fun testFirstConditionFalseByB() {
        assertEquals(3, Calculator.calculate(4, 3, 2))
        assertEquals(1, Calculator.calculate(1, 4, 1))
    }
    
    @Test
    fun testSecondConditionTrueByA() {
        assertEquals(2, Calculator.calculate(5, 3, 1))
        assertEquals(2, Calculator.calculate(3, 2, 1))
    }
    
    @Test
    fun testSecondConditionTrueByX() {
        assertEquals(16, Calculator.calculate(1, 5, 10))
        assertEquals(8, Calculator.calculate(0, 3, 7))
    }
    
    @Test
    fun testBothConditionsFalse() {
        assertEquals(2, Calculator.calculate(1, 3, 2))
        assertEquals(1, Calculator.calculate(2, 4, 1))
    }
    
    @ParameterizedTest
    @CsvSource(
        "4, 5, 2, 14",
        "1, 5, 1, 6",  
        "5, 3, 2, 3",
        "1, 3, 2, 2"
    )
    fun testAllExecutionPaths(a: Int, b: Int, x: Int, expected: Int) {
        assertEquals(expected, Calculator.calculate(a, b, x))
    }
    
    @ParameterizedTest
    @CsvSource(
        "8, 5, 1, 14",
        "9, 5, 2, 3",
        "3, 5, 1, 9",
        "2, 5, 7, 20",
        "1, 5, 6, 12",
        "1, 5, 7, 13"
    )
    fun testBoundaryValues(a: Int, b: Int, x: Int, expected: Int) {
        assertEquals(expected, Calculator.calculate(a, b, x))
    }
    
    @Test
    fun testEdgeCases() {
        assertEquals(0, Calculator.calculate(0, 0, 0))
        assertEquals(5, Calculator.calculate(1, 5, 0))
        assertEquals(1, Calculator.calculate(10, 0, 0))
        assertEquals(5, Calculator.calculate(0, 5, 10))
    }
    
    @Test
    fun testLegacyPositivePositive() {
        assertEquals(8, Calculator.calculateLegacy(5, 3))
        assertEquals(17, Calculator.calculateLegacy(10, 7))
    }
    
    @Test
    fun testLegacyPositiveNonPositive() {
        assertEquals(8, Calculator.calculateLegacy(5, -3))
        assertEquals(10, Calculator.calculateLegacy(10, 0))
    }
    
    @Test
    fun testLegacyNonPositivePositive() {
        assertEquals(8, Calculator.calculateLegacy(-5, 3))
        assertEquals(7, Calculator.calculateLegacy(0, 7))
    }
    
    @Test
    fun testLegacyNonPositiveNonPositive() {
        assertEquals(8, Calculator.calculateLegacy(-5, -3))
        assertEquals(0, Calculator.calculateLegacy(0, 0))
    }
    
    @Test
    fun testLegacyBoundaryValues() {
        assertEquals(5, Calculator.calculateLegacy(0, 5))
        assertEquals(5, Calculator.calculateLegacy(5, 0))
        assertEquals(0, Calculator.calculateLegacy(0, 0))
    }
}