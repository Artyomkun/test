import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class CalculatorTest {
    @Test public void testCondition1True() { assertEquals(14, Calculator.func(4, 5, 2)); }
    @Test public void testCondition1FalseByA() { assertEquals(4, Calculator.func(10, 5, 3)); }
    @Test public void testCondition1FalseByB() { assertEquals(3, Calculator.func(4, 3, 2)); }
    @Test public void testCondition2BothTrue() { assertEquals(14, Calculator.func(4, 5, 2)); }
    @Test public void testCondition2TrueByA() { assertEquals(6, Calculator.func(8, 5, 0)); }
    @Test public void testCondition2TrueByResult() { assertEquals(11, Calculator.func(3, 2, 10)); }
    @Test public void testCondition2False() { assertEquals(0, Calculator.func(0, 0, 0)); }
    @Test public void testPath1_C1True_C2True() { assertEquals(14, Calculator.func(4, 5, 2)); }
    @Test public void testPath2_C1True_C2False() { assertEquals(6, Calculator.func(1, 5, 1)); }
    @Test public void testPath3_C1False_C2True() { assertEquals(4, Calculator.func(10, 5, 3)); }
    @Test public void testPath4_C1False_C2False() { assertEquals(0, Calculator.func(0, 0, 0)); }
    @Test public void testBoundaryA8() { assertEquals(46, Calculator.func(8, 5, 5)); }
    @Test public void testBoundaryA9() { assertEquals(4, Calculator.func(9, 5, 3)); }
    @Test public void testBoundaryB4() { assertEquals(3, Calculator.func(4, 4, 2)); }
    @Test public void testBoundaryB5() { assertEquals(14, Calculator.func(4, 5, 2)); }
    @Test public void testBoundaryB6() { assertEquals(3, Calculator.func(4, 6, 2)); }
    @Test public void testBoundaryA2() { assertEquals(2, Calculator.func(2, 3, 2)); }
    @Test public void testBoundaryA3() { assertEquals(3, Calculator.func(3, 3, 2)); }
    @Test public void testBoundaryResult6() { assertEquals(6, Calculator.func(1, 5, 1)); }
    @Test public void testBoundaryResult7() { assertEquals(8, Calculator.func(1, 3, 7)); }
}