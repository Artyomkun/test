class Calculator {
    companion object {
        fun calculate(a: Int, b: Int, x: Int): Int {
            var result = x
            
            if (a < 9 && b == 5) {
                result = x * a + b
            }
            
            if (a > 2 || result > 6) {
                result = result + 1
            }
            
            return result
        }
        
        fun calculateLegacy(x: Int, y: Int): Int {
            return when {
                x > 0 && y > 0 -> x + y
                x > 0 && y <= 0 -> x - y
                x <= 0 && y > 0 -> -x + y
                else -> -x - y
            }
        }
    }
}

fun main() {
    println("=== Kotlin Calculator ===")
    println("calculate(4, 5, 2) = ${Calculator.calculate(4, 5, 2)}")
    println("calculate(10, 5, 3) = ${Calculator.calculate(10, 5, 3)}")
    println("calculate(4, 3, 2) = ${Calculator.calculate(4, 3, 2)}")
    println("calculate(1, 5, 1) = ${Calculator.calculate(1, 5, 1)}")
    println("calculate(8, 5, 0) = ${Calculator.calculate(8, 5, 0)}")
    println("calculate(3, 2, 10) = ${Calculator.calculate(3, 2, 10)}")
    println("calculate(0, 0, 0) = ${Calculator.calculate(0, 0, 0)}")
    
    println("\n=== Legacy Function ===")
    println("calculateLegacy(5, 3) = ${Calculator.calculateLegacy(5, 3)}")
    println("calculateLegacy(5, -3) = ${Calculator.calculateLegacy(5, -3)}")
    println("calculateLegacy(-5, 3) = ${Calculator.calculateLegacy(-5, 3)}")
    println("calculateLegacy(-5, -3) = ${Calculator.calculateLegacy(-5, -3)}")
}